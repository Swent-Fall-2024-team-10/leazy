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

  const NOISE_THRESHOLD = -20;

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

      const { recording: recordingObject } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.metering) {
            setMetering(status.metering);
            setNoiseThresholdExceeded(status.metering > NOISE_THRESHOLD);
          }
        },
        1000
      );

      setRecording(recordingObject);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      setRecording(null);
      setIsRecording(false);
    } catch (err) {
      console.error("Failed to stop recording", err);
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
        "",
        `Call ${phoneNumber}`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {},
          },
          {
            text: "Call",
            style: "default",
            onPress: () => {
              Linking.openURL(`tel:${phoneNumber}`);
            },
          },
        ],
        {
          cancelable: true,
          userInterfaceStyle: "light",
        }
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
              If your neighbor are making too much noise, acivate the Snitch Mode,
              if the noise level is too high, you can call the security.
            </Text>
          </View>

          <View style={[styles.recorderContainer]}>
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

                <TouchableOpacity
                  testID="call-security-button"
                  style={[
                    styles.callSecurityButton,
                    !noiseThresholdExceeded && styles.disabledButton,
                  ]}
                  onPress={handleCallSecurity}
                  disabled={!noiseThresholdExceeded}
                >
                  <Text style={styles.callSecurityText}>Call security</Text>
                </TouchableOpacity>
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
    marginTop: -350,
  },
  meteringContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-end" as const,
    height: 150,
    marginVertical: 20,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2F4F4F",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 20,
  },
  meteringBar: {
    width: 8,
    backgroundColor: "#2F4F4F",
    marginHorizontal: 3,
    borderRadius: 4,
  },
  meteringBarExceeded: {
    backgroundColor: "#FF4444",
  },
  callSecurityButton: {
    backgroundColor: "#2F4F4F",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  callSecurityText: {
    color: "white",
    fontSize: 16,
  },
  statusText: {
    marginBottom: 20,
    fontSize: 16,
    color: "#2F4F4F",
  },
  disabledButton: {
    opacity: 0.5,
  },
};

export default SnitchModeScreen;
