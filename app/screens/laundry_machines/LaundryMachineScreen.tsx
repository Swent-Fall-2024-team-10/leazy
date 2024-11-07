import React, { useEffect, useState } from "react";
import { View, Text, Button, Modal, TouchableOpacity, StyleSheet } from "react-native";
import Header from "@/app/components/Header";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { LaundryMachine } from "@/types/types";

export const WashingMachineScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, LaundryMachine>, string>>();

  const [machine, setMachine] = useState<LaundryMachine | null>(null);
  const [isTimerModalVisible, setIsTimerModalVisible] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  useEffect(() => {
    if (route.params) {
      setMachine(route.params);
    }
  }, [route.params]);

  const handleSetTimer = () => {
    // Placeholder for setting a timer and syncing with Firestore
    syncTimerWithFirestore(machine?.laundryMachineId, timer);
    setIsTimerModalVisible(false);
  };

  const syncTimerWithFirestore = (laundryMachineId: string | undefined, time: number | null) => {
    // Firestore interaction logic to be added here
    console.log(`Syncing timer for machine ${laundryMachineId} with time ${time}`);
  };

  const renderMachineStatus = () => {
    if (!machine) return null;

    return (
      <View style={styles.machineCard}>
        <Text style={styles.machineTitle}>Machine {machine.laundryMachineId}</Text>
        <Text style={machine.isAvailable ? styles.available : styles.inUse}>
          {machine.isAvailable ? "Available" : "In Use"}
        </Text>
        <Text style={machine.isFunctional ? styles.functional : styles.underMaintenance}>
          {machine.isFunctional ? "Functional" : "Under Maintenance"}
        </Text>
        {machine.isAvailable && machine.isFunctional && (
          <TouchableOpacity style={styles.timerButton} onPress={() => setIsTimerModalVisible(true)}>
            <Text style={styles.timerButtonText}>Set Laundry Timer</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      <Header>
        <View style={styles.container}>
          <Text style={styles.title}>Laundry Machines</Text>
          {renderMachineStatus()}
          <Modal visible={isTimerModalVisible} transparent={true} animationType="slide">
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Set Laundry Timer</Text>
              {/* Add input for setting timer duration here */}
              <Button title="Set Timer" onPress={handleSetTimer} />
              <Button title="Cancel" onPress={() => setIsTimerModalVisible(false)} />
            </View>
          </Modal>
        </View>
      </Header>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  machineCard: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  machineTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  available: {
    color: "green",
    fontWeight: "bold",
  },
  inUse: {
    color: "orange",
    fontWeight: "bold",
  },
  functional: {
    color: "blue",
    fontWeight: "bold",
  },
  underMaintenance: {
    color: "red",
    fontWeight: "bold",
  },
  timerButton: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  timerButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

