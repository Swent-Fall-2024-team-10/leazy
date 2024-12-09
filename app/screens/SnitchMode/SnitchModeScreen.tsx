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
} from "react-native";
import { appStyles } from "../../../styles/styles";
import { Audio } from "expo-av";
import { FontAwesome } from "@expo/vector-icons";
import * as Linking from "expo-linking";


const SnitchModeScreen: React.FC = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [metering, setMetering] = useState<number | null>(null);
  const [noiseThresholdExceeded, setNoiseThresholdExceeded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const NOISE_THRESHOLD = 80;

  useEffect(() => {
    return () => {
      if (recording) {
        (recording as Audio.Recording).stopAndUnloadAsync();
      }
    };
  }, [recording]);

  useEffect(() => {
    if (noiseThresholdExceeded && isRecording) {
      stopRecording();
    }
  }, [noiseThresholdExceeded]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const result = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.metering !== undefined) {
            const decibelLevel = Math.max(0, ((status.metering + 160) / 160) * 120);
            setMetering(decibelLevel);
            setNoiseThresholdExceeded(decibelLevel >= NOISE_THRESHOLD);
          }
        }
      );

      if (result && result.recording) {
        setRecording(result.recording);
        setIsRecording(true);
      } else {
        throw new Error("Recording object is undefined");
      }
    } catch (err) {
      console.error("Failed to start recording", err);
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
    const phoneNumber = "+41123456789";

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

  const renderMeteringBars = () => {
    if (metering === null) return null;

    return (
      <View style={styles.meteringContainer}>
        {Array(20)
          .fill(0)
          .map((_, i) => (
            <View
              key={i}
              style={[
                styles.meteringBar,
                { height: Math.max(10, (metering + 60) * (i / 20) * 2) },
                noiseThresholdExceeded && styles.meteringBarExceeded,
              ]}
            />
          ))}
      </View>
    );
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Reset all states
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
              Snitch Mode
            </Text>
            <Text
              style={[appStyles.flatText, { textAlign: "center", marginTop: 20 }]}
            >
              If your neighbors are making too much noise (above 80dB), activate the Snitch Mode.
              When the noise level is too high, you can call security.
            </Text>
          </View>

          <View style={styles.recorderContainer}>
            {renderMeteringBars()}

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

            {(isRecording || metering !== null) && (
              <>
                {isRecording ? (
                  <Text style={styles.statusText}>
                    Wait till the maximum is reached
                  </Text>
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

const styles = {
  recorderContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 20,
    marginTop: "-60%" as const,
  },
  meteringContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    height: 150,
    marginVertical: 20,
    paddingBottom: 40,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2F4F4F",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 20,
    elevation: Platform.OS === "android" ? 5 : 0,
  },
  meteringBar: {
    width: "3%",
    backgroundColor: "#2F4F4F",
    marginHorizontal: "0.8%",
    borderRadius: "10%",
    elevation: Platform.OS === "android" ? 2 : 0,
    maxHeight: "200%",
  },
  meteringBarExceeded: {
    backgroundColor: "#FF4444",
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
};

export default SnitchModeScreen;
