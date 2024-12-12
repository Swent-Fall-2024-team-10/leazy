import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import Header from "../../../app/components/Header";
import { LaundryMachine } from "../../../types/types";
import {
  createMachineNotification,
  getLaundryMachine,
  getLaundryMachinesQuery,
  updateLaundryMachine,
} from "../../../firebase/firestore/firestore";
import { getAuth } from "firebase/auth";
import { onSnapshot, Timestamp } from "firebase/firestore";
import { TimerPickerModal } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient";
import SubmitButton from "../../../app/components/buttons/SubmitButton";
import { appStyles, Color } from "../../../styles/styles";

const WashingMachineScreen = () => {
  const [machines, setMachines] = useState<LaundryMachine[]>([]);
  const [isTimerModalVisible, setIsTimerModalVisible] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);
  const residenceId = "TestResidence1"; // Replace with the actual residence ID
  const [remainingTimes, setRemainingTimes] = useState<{
    [key: string]: string;
  }>({});
  const [timerIntervals, setTimerIntervals] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});

  // Initialize auth instance
  const auth = getAuth();

  // Access the current user's UID
  const user = auth.currentUser;
  const userId = user ? user.uid : undefined;

  // Cleanup function for timers
  const cleanupTimer = useCallback(
    (machineId: string) => {
      if (timerIntervals[machineId]) {
        clearInterval(timerIntervals[machineId]);
        setTimerIntervals((prev) => {
          const updated = { ...prev };
          delete updated[machineId];
          return updated;
        });
      }
    },
    [timerIntervals]
  );

  const calculateTimer = useCallback(
    (laundryMachineId: string, estimatedFinishTime: Timestamp) => {
      // Don't start a new timer if one already exists for this machine
      if (timerIntervals[laundryMachineId]) {
        return;
      }

      const now = Date.now();
      const remainingTimeMs = estimatedFinishTime.toMillis() - now;

      // If already completed, set the status immediately
      if (remainingTimeMs <= 0) {
        setRemainingTimes((prev) => ({
          ...prev,
          [laundryMachineId]: "Cycle completed",
        }));
        return;
      }

      // Calculate and set initial time immediately
      const hours = Math.floor((remainingTimeMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((remainingTimeMs / (1000 * 60)) % 60);
      const seconds = Math.floor((remainingTimeMs / 1000) % 60);
      const formattedTime = `${hours}h ${minutes}m ${seconds}s`;

      setRemainingTimes((prev) => ({
        ...prev,
        [laundryMachineId]: formattedTime,
      }));

      // Set up the interval to update the remaining time
      const intervalId = setInterval(async () => {
        const currentTime = Date.now();
        const currentRemainingTimeMs =
          estimatedFinishTime.toMillis() - currentTime;

        if (currentRemainingTimeMs <= 0) {
          clearInterval(intervalId);
          setRemainingTimes((prev) => ({
            ...prev,
            [laundryMachineId]: "Cycle completed",
          }));
          setTimerIntervals((prev) => {
            const updated = { ...prev };
            delete updated[laundryMachineId];
            return updated;
          });
          return;
        }

        // Check if remaining time is under 3 minutes and notification hasn't been sent
        if (
          currentRemainingTimeMs <= 3 * 60 * 1000 &&
          currentRemainingTimeMs >= 2 * 60 * 1000 + 59 * 1000 &&
          userId
        ) {
          const initialData = await getLaundryMachine(
            residenceId,
            laundryMachineId
          );
          if (!initialData) return;
          const notificationAlreadySent =
            initialData.notificationScheduled || false;
          if (!notificationAlreadySent) {
            createMachineNotification(userId);
          }
        }

        // Calculate hours, minutes, and seconds
        const hours = Math.floor(
          (currentRemainingTimeMs / (1000 * 60 * 60)) % 24
        );
        const minutes = Math.floor((currentRemainingTimeMs / (1000 * 60)) % 60);
        const seconds = Math.floor((currentRemainingTimeMs / 1000) % 60);

        // Format the remaining time
        const formattedTime = `${hours}h ${minutes}m ${seconds}s`;

        // Update the timer display
        setRemainingTimes((prev) => ({
          ...prev,
          [laundryMachineId]: formattedTime,
        }));
      }, 1000);

      setTimerIntervals((prev) => ({
        ...prev,
        [laundryMachineId]: intervalId,
      }));
    },
    [cleanupTimer, timerIntervals]
  );

  const fetchMachines = useCallback(async () => {
    setRefreshing(true);
    try {
      const query = getLaundryMachinesQuery(residenceId);

      return onSnapshot(query, (querySnapshot) => {
        const updatedMachines: LaundryMachine[] = [];

        querySnapshot.forEach((doc) => {
          const machineData = doc.data() as LaundryMachine;
          updatedMachines.push({
            ...machineData,
            laundryMachineId: doc.id,
          });
        });

        setMachines(updatedMachines);

        updatedMachines.forEach((machine) => {
          if (machine.estimatedFinishTime && !machine.isAvailable) {
            calculateTimer(
              machine.laundryMachineId,
              machine.estimatedFinishTime
            );
          }
        });
      });
    } catch (error) {
      console.error("Error fetching washing machines:", error);
      return () => {};
    } finally {
      setRefreshing(false);
    }
  }, [residenceId, calculateTimer]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setup = async () => {
      unsubscribe = await fetchMachines();
    };

    setup();

    return () => {
      unsubscribe?.();
      Object.keys(timerIntervals).forEach(cleanupTimer);
    };
  }, [residenceId, fetchMachines, cleanupTimer]);

  // Function to reset the machine's status to "Available" in Firestore
  const handleResetMachine = async (laundryMachineId: string) => {
    await updateLaundryMachine(residenceId, laundryMachineId, {
      isAvailable: true,
      occupiedBy: "none",
    });

    // Update local state for UI
    setRemainingTimes((prev) => ({
      ...prev,
      [laundryMachineId]: "Available",
    }));

    // Clean up the timer if it exists
    cleanupTimer(laundryMachineId);
  };

  const handleSetTimer = (pickedDuration: Date) => {
    if (selectedMachineId) {
      const startTime = Timestamp.now();
      const durationMs =
        pickedDuration.getHours() * 3600 * 1000 +
        pickedDuration.getMinutes() * 60 * 1000 +
        pickedDuration.getSeconds() * 1000;
      const estimatedFinishTime = Timestamp.fromMillis(
        startTime.toMillis() + durationMs
      );
      syncTimerWithFirestore(
        selectedMachineId,
        false,
        startTime,
        estimatedFinishTime
      );
      calculateTimer(selectedMachineId, estimatedFinishTime);
    }
    setIsTimerModalVisible(false);
    setSelectedMachineId(null);
  };

  const syncTimerWithFirestore = (
    laundryMachineId: string,
    isAvailable: boolean,
    startTime: Timestamp,
    estimatedFinishTime: Timestamp
  ) => {
    updateLaundryMachine(residenceId, laundryMachineId, {
      occupiedBy: userId,
      isAvailable: isAvailable,
      startTime: startTime,
      estimatedFinishTime: estimatedFinishTime,
    });
  };

  const renderMachines = () => {
    return machines.map((machine) => (
      <View key={machine.laundryMachineId} style={appStyles.machineCard}>
        <View style={{ flexDirection: "row" }}>
          <Image
            source={require("../../../assets/images/washing_machine_icon_png.png")}
            style={{ width: 120, height: 120, marginRight: 20 }}
          />
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={appStyles.flatTitle}>
              Machine {machine.laundryMachineId}
            </Text>
            <View
              style={[
                appStyles.statusBubble,
                {
                  backgroundColor: !machine.isFunctional
                    ? Color.underMaintenanceBubble
                    : machine.isAvailable
                    ? Color.availableBubble
                    : Color.inUseBubble
                }
              ]}
            >
              <Text style={appStyles.statusText}>
                {!machine.isFunctional
                  ? "Under Maintenance"
                  : machine.isAvailable
                  ? "Available"
                  : "In Use"}
              </Text>
            </View>

            <View
              style={{
                marginTop: 10,
                marginBottom: 10,
                alignItems: "center",
                gap: 10,
              }}
            >
              {machine.isAvailable && machine.isFunctional && (
                <SubmitButton
                  width={200}
                  height={40}
                  disabled={false}
                  textStyle={{ fontSize: 16 }}
                  style={appStyles.submitButton}
                  testID="setTimerButton"
                  label="Set Timer"
                  onPress={() => {
                    setSelectedMachineId(machine.laundryMachineId);
                    setIsTimerModalVisible(true);
                  }}
                />
              )}
              {!machine.isAvailable && (
                <Text style={appStyles.flatText}>
                  {remainingTimes[machine.laundryMachineId] ||
                    "Calculating..."}
                </Text>
              )}

              {!machine.isAvailable &&
                remainingTimes[machine.laundryMachineId] ===
                  "Cycle completed" &&
                machine.occupiedBy === userId && (
                  <SubmitButton
                    width={200}
                    height={40}
                    textStyle={{ fontSize: 16 }}
                    style={appStyles.submitButton}
                    testID="unlockButton"
                    label="Unlock"
                    onPress={() =>
                      handleResetMachine(machine.laundryMachineId)
                    }
                    disabled={false}
                  />
                )}

              {!machine.isAvailable &&
                machine.occupiedBy === userId &&
                remainingTimes[machine.laundryMachineId] !==
                  "Cycle completed" && (
                  <SubmitButton
                    width={200}
                    height={40}
                    textStyle={{ fontSize: 16 }}
                    style={appStyles.submitButton}
                    testID="cancelTimerButton"
                    label="Cancel Timer"
                    onPress={() =>
                      handleResetMachine(machine.laundryMachineId)
                    }
                    disabled={false}
                  />
                )}
            </View>
          </View>
        </View>
      </View>
    ));
  };

  return (
    <>
      <Header>
        <View testID="washing-machine-screen" style={styles.container}>
          <Text style={appStyles.flatTitle}>Laundry Machines</Text>
          <ScrollView
            testID="scroll-view"
            contentContainerStyle={
              machines.length === 0 && styles.centeredContent
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchMachines}
              />
            }
          >
            {machines.length === 0 ? (
              <Text style={appStyles.flatText}>
                No washing machines available
              </Text>
            ) : (
              renderMachines()
            )}
          </ScrollView>
          <TimerPickerModal
            visible={isTimerModalVisible}
            setIsVisible={setIsTimerModalVisible}
            onConfirm={(pickedDuration) => {
              const timestamp_duration = new Date(
                0,
                0,
                0,
                pickedDuration.hours,
                pickedDuration.minutes,
                pickedDuration.seconds
              );
              handleSetTimer(timestamp_duration);
              setIsTimerModalVisible(false);
            }}
            modalTitle="Choose Washing Duration"
            onCancel={() => setIsTimerModalVisible(false)}
            closeOnOverlayPress
            LinearGradient={LinearGradient}
          />
        </View>
      </Header>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.69,
    padding: 20,
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WashingMachineScreen;