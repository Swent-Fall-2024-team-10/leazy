import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  ActionSheetIOS,
  ScrollView,
  RefreshControl,
  Pressable,
  StyleSheet,
} from 'react-native';
import { appStyles } from '../../../styles/styles';
import { Audio } from 'expo-av';
import { FontAwesome } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { WaveformVisualizer } from './WaveformVisualizer';
import { stylesForSnitchMode } from '../../../styles/styles';

const SnitchModeScreen: React.FC = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [metering, setMetering] = useState<number | null>(null);
  const [noiseThresholdExceeded, setNoiseThresholdExceeded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const NOISE_THRESHOLD = 100;

  useEffect(() => {
    return () => {
      if (recording) {
        (recording as Audio.Recording).stopAndUnloadAsync();
      }
    };
  }, [recording]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Please grant microphone permission to use this feature',
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingInstance = new Audio.Recording();
      try {
        await recordingInstance.prepareToRecordAsync({
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          android: {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
            extension: '.m4a',
            outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        });

        await recordingInstance.startAsync();

        recordingInstance.setOnRecordingStatusUpdate((status) => {
          if (status.metering !== undefined) {
            setMetering(status.metering);

            // Convert metering value to decibels (dB):
            // - Metering values from the API typically range from -160 to 0
            // - Add 160 to normalize the range to 0-160
            // - Divide by 160 to get a value between 0-1
            // - Multiply by 120 to scale to a typical dB range (0-120dB)
            const decibelLevel = Math.max(
              0,
              ((status.metering + 160) / 160) * 120,
            );

            if (decibelLevel >= NOISE_THRESHOLD) {
              setNoiseThresholdExceeded(true);
              stopRecording();
              return;
            }
          }
        });

        // Set a consistent update interval
        await recordingInstance.setProgressUpdateInterval(100);
        setRecording(recordingInstance);
        setIsRecording(true);
        setNoiseThresholdExceeded(false);
      } catch (error) {
        console.error('Error preparing recorder:', error);
        Alert.alert('Error', 'Failed to prepare audio recorder');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert(
        'Recording Failed',
        'Please check your microphone settings and try again. Make sure no other apps are using your microphone.'
      );
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      const recordingToStop = recording;
      setRecording(null);
      setIsRecording(false);
      await recordingToStop.stopAndUnloadAsync();
    } catch (err) {
      console.error('Failed to stop recording', err);
      setRecording(null);
      setIsRecording(false);
    }
  };

  const handleCallSecurity = () => {
    const phoneNumber = '911';

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Call Security'],
          cancelButtonIndex: 0,
          message: ` Call ${phoneNumber} `,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            Linking.openURL(`tel:${phoneNumber}`);
          }
        },
      );
    } else {
      Alert.alert(
        'Call Security',
        `Do you want to call security at ${phoneNumber}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: ' Call Security',
            onPress: () => {
              void (async () => {
                try {
                  await Linking.openURL(`tel:${phoneNumber}`);
                } catch (error) {
                  console.error('Error opening phone dialer:', error);
                }
              })();
            },
            style: 'default',
          },
        ],
        { cancelable: true },
      );
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setRecording(null);
    setIsRecording(false);
    setMetering(null);
    setNoiseThresholdExceeded(false);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <Header>
      <ScrollView
        testID='snitch-mode-screen'
        style={appStyles.screenContainer}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ flex: 1 }}>
          <View style={appStyles.residenceHeaderContainer}>
            <Text testID='snitch-mode-title' style={appStyles.residenceTitle}>
              🤓 Snitch Mode 🤓
            </Text>
            <Text
              style={[
                appStyles.flatText,
                { textAlign: 'center', marginTop: 20 },
              ]}
            >
              If your neighbors are making too much noise (above 100dB),
              activate the Snitch Mode. When the noise level is too high, you
              can call security.
            </Text>
          </View>

          <View style={stylesForSnitchMode.recorderContainer}>
            {(isRecording || noiseThresholdExceeded) && (
              <WaveformVisualizer
                metering={metering}
                isRecording={isRecording}
                noiseThresholdExceeded={noiseThresholdExceeded}
              />
            )}

            <TouchableOpacity
              testID='record-button'
              style={stylesForSnitchMode.recordButton}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <FontAwesome
                name={isRecording ? 'stop-circle' : 'microphone'}
                size={24}
                color='white'
              />
            </TouchableOpacity>

            {(isRecording || noiseThresholdExceeded) && (
              <>
                {isRecording ? (
                  <Text style={stylesForSnitchMode.statusText}>
                    {' '}
                    Wait till the noise level reaches the acceptable limit{' '}
                  </Text>
                ) : noiseThresholdExceeded ? (
                  <Text style={stylesForSnitchMode.statusText}>
                    The level of noise is higher than the limit
                  </Text>
                ) : null}

                <Pressable
                  testID='call-security-button'
                  style={[
                    stylesForSnitchMode.callSecurityButton,
                    !noiseThresholdExceeded &&
                      stylesForSnitchMode.disabledButton,
                  ]}
                  onPress={handleCallSecurity}
                  disabled={!noiseThresholdExceeded}
                  android_ripple={{ color: 'rgba(255, 255, 255, 0.3)' }}
                >
                  <Text style={stylesForSnitchMode.callSecurityText}>
                    {' '}
                    Call Security{' '}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </Header>
  );
};
export default SnitchModeScreen;
