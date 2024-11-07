import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import Header from "@/app/components/Header";
import { LaundryMachine } from "@/types/types";
import {
  createLaundryMachine,
  deleteLaundryMachine,
  updateLaundryMachine,
  getAllLaundryMachines,
} from "@/firebase/firestore/firestore";

export const ManageMachinesScreen = () => {
  const [machines, setMachines] = useState<LaundryMachine[]>([]);
  const [newMachineId, setNewMachineId] = useState<string>("");
  const residenceId = "TEMPLATE_RESIDENCE_ID"; // Replace with actual residence ID

  useEffect(() => {
    // Fetch all machines for the residence
    const fetchMachines = async () => {
      const fetchedMachines = await getAllLaundryMachines(residenceId);
      setMachines(fetchedMachines);
    };

    fetchMachines();
  }, []);

  const handleAddMachine = async () => {
    if (newMachineId.trim() === "") return;

    const newMachine: LaundryMachine = {
      laundryMachineId: newMachineId,
      isAvailable: true,
      isFunctional: true,
    };

    await createLaundryMachine(residenceId, newMachine);
    setMachines((prev) => [...prev, newMachine]);
    setNewMachineId(""); // Clear input after adding
  };

  const handleDeleteMachine = async (machineId: string) => {
    await deleteLaundryMachine(residenceId, machineId);
    setMachines((prev) =>
      prev.filter((machine) => machine.laundryMachineId !== machineId)
    );
  };

  const toggleMaintenanceStatus = async (machine: LaundryMachine) => {
    const updatedMachine = { ...machine, isFunctional: !machine.isFunctional };
    await updateLaundryMachine(residenceId, machine.laundryMachineId, {
      isFunctional: updatedMachine.isFunctional,
    });
    setMachines((prev) =>
      prev.map((m) =>
        m.laundryMachineId === machine.laundryMachineId ? updatedMachine : m
      )
    );
  };

  const renderMachineItem = ({ item }: { item: LaundryMachine }) => (
    <View style={styles.machineCard}>
      <Text style={styles.machineTitle}>Machine {item.laundryMachineId}</Text>
      <Text style={item.isAvailable ? styles.available : styles.inUse}>
        {item.isAvailable ? "Available" : "In Use"}
      </Text>
      <Text
        style={item.isFunctional ? styles.functional : styles.underMaintenance}
      >
        {item.isFunctional ? "Functional" : "Under Maintenance"}
      </Text>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => toggleMaintenanceStatus(item)}
      >
        <Text style={styles.buttonText}>
          {item.isFunctional
            ? "Mark as Under Maintenance"
            : "Mark as Functional"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteMachine(item.laundryMachineId)}
      >
        <Text style={styles.buttonText}>Delete Machine</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Header>
        <View style={styles.container}>
          <Text style={styles.title}>Manage Laundry Machines</Text>

          {/* Input for adding a new machine */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Machine ID"
              value={newMachineId}
              onChangeText={setNewMachineId}
            />
            <Button title="Add Machine" onPress={handleAddMachine} />
          </View>

          {/* List of machines */}
          <FlatList
            data={machines}
            renderItem={renderMachineItem}
            keyExtractor={(item) => item.laundryMachineId}
          />
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
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
  toggleButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
});
