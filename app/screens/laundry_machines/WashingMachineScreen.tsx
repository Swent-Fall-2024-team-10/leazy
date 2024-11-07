import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Header from "@/app/components/Header";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { LaundryMachine, RootStackParamList } from "@/types/types";

const WashingMachineScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [machines, setMachines] = useState<LaundryMachine[]>([]);
  const [isTimerModalVisible, setIsTimerModalVisible] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);

  useEffect(() => {
    const initialMachines: LaundryMachine[] = [
      { laundryMachineId: "123", isAvailable: true, isFunctional: true },
      { laundryMachineId: "456", isAvailable: true, isFunctional: true },
      { laundryMachineId: "789", isAvailable: true, isFunctional: false },
    ];
    setMachines(initialMachines);
  }, []);

  const handleSetTimer = () => {
    if (selectedMachineId) {
      syncTimerWithFirestore(selectedMachineId, timer);
    }
    setIsTimerModalVisible(false);
  };

  const syncTimerWithFirestore = (laundryMachineId: string, time: number | null) => {
    console.log(
      `Syncing timer for machine ${laundryMachineId} with time ${time}`
    );
  };

  const renderMachines = () => {
    return machines.map((machine) => (
      <View key={machine.laundryMachineId} style={styles.machineCard}>
        <Text style={styles.machineTitle}>Machine {machine.laundryMachineId}</Text>
        <Text style={machine.isAvailable ? styles.available : styles.inUse}>
          {machine.isAvailable ? "Available" : "In Use"}
        </Text>
        <Text
          style={machine.isFunctional ? styles.functional : styles.underMaintenance}
        >
          {machine.isFunctional ? "Functional" : "Under Maintenance"}
        </Text>
        {machine.isAvailable && machine.isFunctional && (
          <TouchableOpacity
            style={styles.timerButton}
            onPress={() => {
              setSelectedMachineId(machine.laundryMachineId);
              setIsTimerModalVisible(true);
            }}
          >
            <Text style={styles.timerButtonText}>Set Laundry Timer</Text>
          </TouchableOpacity>
        )}
      </View>
    ));
  };

  return (
    <>
      <Header>
        <View style={styles.container}>
          <Text style={styles.title}>Laundry Machines</Text>
          {renderMachines()}
          <Modal
            visible={isTimerModalVisible}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalBubble}>
                <Text style={styles.modalTitle}>Set Laundry Timer</Text>
                <Button title="Set Timer" onPress={handleSetTimer} />
                <Button
                  title="Cancel"
                  onPress={() => setIsTimerModalVisible(false)}
                />
              </View>
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
