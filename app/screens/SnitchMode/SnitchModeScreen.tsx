import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
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
} from "react-native";
import { appStyles } from "../../../styles/styles";
import { Audio } from "expo-av";
import { FontAwesome } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { WaveformVisualizer } from "./WaveformVisualizer";

const SnitchModeScreen: React.FC = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [metering, setMetering] = useState<number | null>(null);
  const [noiseThresholdExceeded, setNoiseThresholdExceeded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const NOISE_THRESHOLD = 120;

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
      if (permission.status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please grant microphone permission to use this feature"
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
            extension: ".m4a",
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
            extension: ".m4a",
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

        // In startRecording function
        recordingInstance.setOnRecordingStatusUpdate((status) => {
          if (status.metering !== undefined) {
            setMetering(status.metering);

            const decibelLevel = Math.max(
              0,
              ((status.metering + 160) / 160) * 120
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
        console.error("Error preparing recorder:", error);
        Alert.alert("Error", "Failed to prepare audio recorder");
      }
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording");
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
      console.error("Failed to stop recording", err);
      setRecording(null);
      setIsRecording(false);
    }
  };

  const handleCallSecurity = () => {
    const phoneNumber = "911";

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Call Security"],
          cancelButtonIndex: 0,
          message: `Call ${phoneNumber}`,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            Linking.openURL(`tel:${phoneNumber}`);
          }
        }
      );
    } else {
      Alert.alert(
        "Call Security",
        `Do you want to call security at ${phoneNumber}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Call",
            onPress: () => Linking.openURL(`tel:${phoneNumber}`),
            style: "default",
          },
        ],
        { cancelable: true }
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
        testID="snitch-mode-screen"
        style={appStyles.screenContainer}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ flex: 1 }}>
          <View style={appStyles.residenceHeaderContainer}>
            <Text testID="snitch-mode-title" style={appStyles.residenceTitle}>
              🤓 Snitch Mode 🤓
            </Text>
            <Text
              style={[
                appStyles.flatText,
                { textAlign: "center", marginTop: 20 },
              ]}
            >
              If your neighbors are making too much noise (above 80dB), activate
              the Snitch Mode. When the noise level is too high, you can call
              security.
            </Text>
          </View>

          <View style={styles.recorderContainer}>
            {(isRecording || noiseThresholdExceeded) && (
              <WaveformVisualizer
                metering={metering}
                isRecording={isRecording}
                noiseThresholdExceeded={noiseThresholdExceeded}
              />
            )}

            <TouchableOpacity
              testID="record-button"
              style={styles.recordButton}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <FontAwesome
                name={isRecording ? "stop-circle" : "microphone"}
                size={24}
                color="white"
              />
            </TouchableOpacity>

            {(isRecording || noiseThresholdExceeded) && (
              <>
                {isRecording ? (
                  <Text style={styles.statusText}>Recording...</Text>
                ) : noiseThresholdExceeded ? (
                  <Text style={styles.statusText}>
                    The level of noise is higher than the limit
                  </Text>
                ) : null}

                <Pressable
                  testID="call-security-button"
                  style={[
                    styles.callSecurityButton,
                    !noiseThresholdExceeded && styles.disabledButton,
                  ]}
                  onPress={handleCallSecurity}
                  disabled={!noiseThresholdExceeded}
                  android_ripple={{ color: "rgba(255, 255, 255, 0.3)" }}
                >
                  <Text style={styles.callSecurityText}>Call security</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </Header>
  );
};

const styles = StyleSheet.create({
  recorderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginTop: '-50%',
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2F4F4F",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: Platform.OS === "android" ? 5 : 0,
  },
  callSecurityButton: {
    backgroundColor: "#2F4F4F",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: Platform.OS === "android" ? 3 : 0,
  },
  callSecurityText: {
    color: "white",
    fontSize: 16,
    fontFamily: Platform.OS === "android" ? "Roboto" : undefined,
  },
  statusText: {
    marginBottom: 40,
    fontSize: 16,
    color: "#2F4F4F",
    fontFamily: Platform.OS === "android" ? "Roboto" : undefined,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default SnitchModeScreen;
