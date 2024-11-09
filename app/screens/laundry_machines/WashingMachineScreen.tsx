import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  Modal,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
} from "react-native";
import Header from "@/app/components/Header";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { LaundryMachine, RootStackParamList } from "@/types/types";
import { getAllLaundryMachines, getWashingMachinesQuery, updateLaundryMachine } from "@/firebase/firestore/firestore";
import CustomButton from "@/app/components/CustomButton";
import { getAuth } from "firebase/auth";
import { onSnapshot, Timestamp } from "firebase/firestore";
import { TimerPickerModal } from "react-native-timer-picker";
import { LinearGradient } from "expo-linear-gradient";

// Define intervalIds outside of the component to persist across renders
  const intervalIds: { [key: string]: NodeJS.Timeout } = {};

const WashingMachineScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [machines, setMachines] = useState<LaundryMachine[]>([]);
  const [isTimerModalVisible, setIsTimerModalVisible] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);
  const residenceId = "TestResidence1"; // Replace with the actual residence ID
  const [remainingTimes, setRemainingTimes] = useState<{ [key: string]: string }>({});
  const [duration, setDuration] = useState(new Date(0, 0, 0, 0, 30, 0)); // Default to 30 minutes
  // Initialize auth instance
  const auth = getAuth();

  // Access the current user's UID
  const user = auth.currentUser;
  const userId = user ? user.uid : undefined;

  const fetchMachines = async () => {
      try {

        // Get the Firestore query from the ViewModel
        const query = getWashingMachinesQuery(residenceId);

        //runs every time the query changes
        //no need to call every time fetchWashingMachines
        // Set up the Firestore real-time listener using the query from the ViewModel
        const unsubscribe = onSnapshot(query, (querySnapshot) => {
          const updatedMachines: LaundryMachine[] = [];
          querySnapshot.forEach((doc) => {
            updatedMachines.push(doc.data() as LaundryMachine);
          });
          setMachines(updatedMachines); // Update state with real-time data
        });

        // Cleanup the listener when the component unmounts
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching washing machines:", error);
      }
  };

  useEffect(() => {
    fetchMachines();
    // Clean up intervals on component unmount
    return () => {
      Object.values(intervalIds).forEach(clearInterval);
  };
  }, [residenceId]);

  const handleSetTimer = () => {
    if (selectedMachineId) {
      const startTime = Timestamp.now(); // Current time as Firebase Timestamp
      const durationMs = duration.getHours() * 3600 * 1000 + duration.getMinutes() * 60 * 1000 + duration.getSeconds() * 1000;
        const estimatedFinishTime = Timestamp.fromMillis(
            startTime.toMillis() + durationMs // Add duration in milliseconds
        );
      console.log(
        `${durationMs} Syncing timer for machine`
      );
      syncTimerWithFirestore(selectedMachineId, false, startTime, estimatedFinishTime);
      calculateTimer(selectedMachineId, estimatedFinishTime);
      console.log(
        `Syncing timer`
      );
    }
    setIsTimerModalVisible(false);
    setSelectedMachineId(null);
  };

  const syncTimerWithFirestore = (laundryMachineId: string, isAvailable: boolean, startTime: Timestamp, estimatedFinishTime: Timestamp) => {
    updateLaundryMachine(residenceId, laundryMachineId, {occupiedBy: userId,  isAvailable: isAvailable, startTime: startTime, estimatedFinishTime : estimatedFinishTime});
  };

  async function calculateTimer( laundryMachineId: string, estimatedFinishTime: Timestamp) {
    // Find the machine by ID in the machines state
    const machine = machines.find(m => m.laundryMachineId === laundryMachineId);
    if (!machine || !estimatedFinishTime) return;
     // Clear any existing interval for this machine
     if (intervalIds[laundryMachineId]) {
      clearInterval(intervalIds[laundryMachineId]);
  }

  // Set up the interval to update the remaining time
  const intervalId = setInterval(() => {
      const now = Date.now();
      const remainingTimeMs = estimatedFinishTime.toMillis() - now;

      if (remainingTimeMs <= 0) {
          clearInterval(intervalId);
          setRemainingTimes(prev => ({
              ...prev,
              [laundryMachineId]: "Cycle complete",
          }));
          delete intervalIds[laundryMachineId]; // Remove the interval ID from tracking
          return;
      }

      // Calculate hours, minutes, and seconds
      const hours = Math.floor((remainingTimeMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((remainingTimeMs / (1000 * 60)) % 60);
      const seconds = Math.floor((remainingTimeMs / 1000) % 60);

      // Format the remaining time
      const formattedTime = `${hours}h ${minutes}m ${seconds}s`;

      // Update the remaining time for this machine
      setRemainingTimes(prev => ({
          ...prev,
          [laundryMachineId]: formattedTime,
      }));
  }, 1000);

  // Store the interval ID
  intervalIds[laundryMachineId] = intervalId;
}

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
                  <CustomButton
                    size="small"
                    style={{ width: "100%" }}
                    testID="set-timer-button"
                    onPress={() => {
                      setSelectedMachineId(machine.laundryMachineId);
                      setIsTimerModalVisible(true);
                    }}
                    title="Set Timer"
                  />
                )}
                {!machine.isAvailable && (
                    <Text style={styles.remainingTime}>
                        {remainingTimes[machine.laundryMachineId] || "Calculating..."}
                    </Text>
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
              console.log(
                `Syncing timer for `
              );
                const timestamp_duration = new Date(0, 0, 0, pickedDuration.hours, pickedDuration.minutes, pickedDuration.seconds);
                setDuration(timestamp_duration);
                console.log(
                  `${duration}`
                );
                handleSetTimer();
                setIsTimerModalVisible(false);
            }}
            modalTitle="Set Alarm"
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalBubble: {
    width: 250,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
});

export default WashingMachineScreen;
