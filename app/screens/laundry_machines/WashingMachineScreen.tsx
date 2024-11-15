
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,

  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import Header from "@/app/components/Header";

import { LaundryMachine } from "@/types/types";
import {
  createMachineNotification,
  getLaundryMachine,
  getLaundryMachinesQuery,
  updateLaundryMachine,
} from "@/firebase/firestore/firestore";
import { getAuth } from "firebase/auth";
import { onSnapshot, Timestamp } from "firebase/firestore";
import { TimerPickerModal } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient";
import SubmitButton from "@/app/components/buttons/SubmitButton";

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
      // Clean up existing timer if any
      cleanupTimer(laundryMachineId);

      // Set up the interval to update the remaining time
      const intervalId = setInterval(async () => {
        const now = Date.now();
        const remainingTimeMs = estimatedFinishTime.toMillis() - now;

        if (remainingTimeMs <= 0) {
          clearInterval(intervalId);
          setRemainingTimes((prev) => ({
            ...prev,
            [laundryMachineId]: "Cycle completed",
          }));
          delete timerIntervals[laundryMachineId];
          return;
        }

        // Check if remaining time is under 3 minutes and notification hasn't been sent
        //no entry for a specific machine in notificationStatus acts as a false
      if ((remainingTimeMs <= 3 * 60 * 1000) && (remainingTimeMs >= 2 * 60 * 1000 + 59 * 1000) && userId) {
        const initialData = await getLaundryMachine(residenceId, laundryMachineId);
        if (!initialData) return;
        const notificationAlreadySent = initialData.notificationScheduled || false;
        if (!notificationAlreadySent){
          createMachineNotification(userId);
        }
      }

        // Calculate hours, minutes, and seconds
        const hours = Math.floor((remainingTimeMs / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remainingTimeMs / (1000 * 60)) % 60);
        const seconds = Math.floor((remainingTimeMs / 1000) % 60);

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
    [cleanupTimer]
  );

  const fetchMachines = useCallback(async () => {
    setRefreshing(true);
    try {
      // Get the Firestore query from the ViewModel
      const query = getLaundryMachinesQuery(residenceId);

      //runs every time the query changes
      //no need to call every time fetchWashingMachines
      // Set up the Firestore real-time listener using the query from the ViewModel
      const unsubscribe = onSnapshot(query, (querySnapshot) => {
        const updatedMachines: LaundryMachine[] = [];
        querySnapshot.forEach((doc) => {
          const machineData = doc.data() as LaundryMachine;
          updatedMachines.push(machineData);
          // Start or update timer for machines in use
          if (machineData.estimatedFinishTime && !machineData.isAvailable) {
            calculateTimer(
              machineData.laundryMachineId,
              machineData.estimatedFinishTime
            );
          } else if (machineData.isAvailable) {
            // Clear timer for available machines
            cleanupTimer(machineData.laundryMachineId);
            
            setRemainingTimes((prev) => {
              const updated = { ...prev };
              delete updated[machineData.laundryMachineId];
              return updated;
            });
          }
        });
        setMachines(updatedMachines); // Update state with real-time data
      });

      // Cleanup on unmount
      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error("Error fetching washing machines:", error);
    } finally {
      setRefreshing(false);
    }
  }, [residenceId]);

  useEffect(() => {
    fetchMachines();
    // Clean up intervals on component unmount
    return () => {
      // Clear all intervals
      Object.keys(timerIntervals).forEach(cleanupTimer);
    };
  }, [residenceId]);

  // Separate effect for managing timers when machines change
  useEffect(() => {
    machines.forEach((machine) => {
      if (machine.estimatedFinishTime && !machine.isAvailable) {
        calculateTimer(machine.laundryMachineId, machine.estimatedFinishTime);
      } else {
        cleanupTimer(machine.laundryMachineId);
        setRemainingTimes((prev) => {
          const updated = { ...prev };
          delete updated[machine.laundryMachineId];
          return updated;
        });
      }
    });
  }, [machines]); // Only run when machines changes

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
      const startTime = Timestamp.now(); // Current time as Firebase Timestamp
      const durationMs =
        pickedDuration.getHours() * 3600 * 1000 +
        pickedDuration.getMinutes() * 60 * 1000 +
        pickedDuration.getSeconds() * 1000;
      const estimatedFinishTime = Timestamp.fromMillis(
        startTime.toMillis() + durationMs // Add duration in milliseconds
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

  const getStatus = (machine: LaundryMachine) => {
    if (!machine.isFunctional) {
      return {
        statusText: "Under Maintenance",
        style: styles.underMaintenanceBubble,
      };
    }
    return machine.isAvailable
      ? { statusText: "Available", style: styles.availableBubble }
      : { statusText: "In Use", style: styles.inUseBubble };
  };

  const renderMachines = () => {
    return machines.map((machine) => {
      const { statusText, style } = getStatus(machine);

      return (
        <View key={machine.laundryMachineId} style={styles.machineCard}>
          <View style={{ flexDirection: "row" }}>

            <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
              source={require("@/assets/images/washing_machine_icon_png.png")}
              style={{ width: 120, height: 120, marginRight: 20 }}
            />

            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={styles.machineTitle}>

                Machine {machine.laundryMachineId}

              </Text>
              <View style={[styles.statusBubble, style]}>
                <Text style={styles.statusText}>{statusText}</Text>
              </View>

              {/* Placeholder View for consistent layout */}
              <View
                style={{
                  height: 40,

                  width: 160,

                  marginTop: 10,
                  marginBottom: 10,
                  alignItems: "center",
                }}
              >
                {machine.isAvailable && machine.isFunctional && (
                  <SubmitButton

                    width={200}
                    height={40}
                    disabled={false}
                    label="Set Timer"

                    onPress={() => {
                      setSelectedMachineId(machine.laundryMachineId);
                      setIsTimerModalVisible(true);
                    }}
                  />
                )}

                {!machine.isAvailable && (
                  <Text style={styles.remainingTime}>
                    {remainingTimes[machine.laundryMachineId] ||
                      "Calculating..."}
                  </Text>
                )}

                {/* Reset button, shown only when cycle is complete */}
                {!machine.isAvailable &&
                  remainingTimes[machine.laundryMachineId] === "Cycle completed" &&
                  machine.occupiedBy === userId && ( // Only show if the user started the cycle
                    <SubmitButton
                    width={200}
                    height={40}
                    label="Unlock"
                    onPress={() => handleResetMachine(machine.laundryMachineId)}
                    disabled={false}                    />
                  )}

                  {/* Cancel Timer button, shown only when the timer is active */}
                {!machine.isAvailable &&
                  machine.occupiedBy === userId && // Only show if the user started the timer
                  remainingTimes[machine.laundryMachineId] !== "Cycle completed" && (
                    <SubmitButton
                    width={200}
                    height={40}
                    label="Cancel Timer"
                    onPress={() => handleResetMachine(machine.laundryMachineId)} 
                    disabled={false}                    />
                  )}

              </View>
            </View>
          </View>
        </View>
      );
    });
  };

  return (
    <>
      <Header>
        <View style={styles.container}>
          <Text style={styles.title}>Laundry Machines</Text>
          <ScrollView
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
              <Text style={styles.noMachinesText}>
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
            modalTitle="Set Timer"
            onCancel={() => setIsTimerModalVisible(false)}
            closeOnOverlayPress
            LinearGradient={LinearGradient}
            styles={{
              theme: "light",
            }}
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
  title: {
    fontSize: 24,
    fontFamily: "Inter", // Make sure Inter font is loaded in your project
    fontWeight: "bold",
    marginBottom: 20,
  },
  remainingTime: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },
  machineCard: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
  },
  machineTitle: {
    fontSize: 25,
    color: "#0F5257",
    fontWeight: "600",
  },
  statusBubble: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginTop: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  availableBubble: {
    backgroundColor: "green",
  },
  inUseBubble: {
    backgroundColor: "orange",
  },
  underMaintenanceBubble: {
    backgroundColor: "red",
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noMachinesText: {
    fontSize: 18,
    color: "gray",
    textAlign: "center",
  },
});

export default WashingMachineScreen;
