import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import Header from "../../components/Header";
import { Landlord, LaundryMachine, Residence } from "../../../types/types";

import {
  createLaundryMachine,
  deleteLaundryMachine,
  updateLaundryMachine,
  getAllLaundryMachines,
  getLandlord,
  getResidence,
} from "../../../firebase/firestore/firestore";
import { Timestamp } from "firebase/firestore";
import { Color } from "../../../styles/styles";
import { useAuth } from '../../context/AuthContext';


const ManageMachinesScreen = () => {
  const [machines, setMachines] = useState<LaundryMachine[]>([]);
  const [newMachineId, setNewMachineId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [residences, setResidences] = useState<{ id: string; name: string }[]>([]);
  const [selectedResidenceId, setSelectedResidenceId] = useState<string>("");
  const { user } = useAuth();

  if (!user) {
    throw new Error("User not found.");
  }


  useEffect(() => {
    const fetchLandlordData = async () => {
      try {
        const landlord = await getLandlord(user?.uid) as Landlord;
        if (!landlord) {
          throw new Error("Landlord not found");
        }

        // Fetch residence names
        const residencePromises = landlord.residenceIds.map(async (id) => {
          const residence = await getResidence(id) as Residence;
          return {
            id,
            name: residence.residenceName || `Residence ${id}`
          };
        });

        const residencesData = await Promise.all(residencePromises);
        setResidences(residencesData);

        // Set the first residence as default selected
        if (residencesData.length > 0) {
          setSelectedResidenceId(residencesData[0].id);
        }
      } catch (error) {
        console.error("Error fetching landlord data:", error);
        setErrorMessage("Failed to load residences");
      }
    };

    if (user?.uid) {
      fetchLandlordData();
    }
  }, [user?.uid]);

  const fetchMachines = async (resId: string) => {
    try {
      console.log('Fetching machines for residence:', resId);
      const fetchedMachines = await getAllLaundryMachines(resId);
      console.log('Fetched machines:', fetchedMachines);
      setMachines(fetchedMachines);
    } catch (error) {
      console.error('Error fetching machines:', error);
      setErrorMessage('Failed to load machines');
    }
  };

  useEffect(() => {
    if (selectedResidenceId) {
      fetchMachines(selectedResidenceId);
    }
  }, [selectedResidenceId]);

  const handleAddMachine = async () => {

    if (!selectedResidenceId) {
      setErrorMessage("Please select a residence first.");
      return;
    }

    if (newMachineId.trim() === "") {
      setErrorMessage("Please enter a machine ID.");
      return;
    }

    console.log('Adding machine:', newMachineId, 'to residence:', selectedResidenceId);

    try {
      const newMachine: LaundryMachine = {
        laundryMachineId: newMachineId,
        isAvailable: true,
        isFunctional: true,
        occupiedBy: "none",
        startTime: Timestamp.fromMillis(Date.now()),
        estimatedFinishTime: Timestamp.fromMillis(Date.now()),
        notificationScheduled: false,
      };

      // Create the machine in the database
      await createLaundryMachine(selectedResidenceId, newMachine);
      
      // Refresh the machines list
      await fetchMachines(selectedResidenceId);
      
      // Clear input
      setNewMachineId("");
    } catch (error) {
      console.error("Error adding machine:", error);
      setErrorMessage("Failed to add machine. Please try again.");
    }
  };

  const handleDeleteMachine = async (machineId: string) => {
    await deleteLaundryMachine(selectedResidenceId, machineId);
    setMachines((prev) =>
      prev.filter((machine) => machine.laundryMachineId !== machineId),
    );
  };

  const toggleMaintenanceStatus = async (machine: LaundryMachine) => {
    const updatedMachine = { ...machine, isFunctional: !machine.isFunctional };
    await updateLaundryMachine(selectedResidenceId, machine.laundryMachineId, {
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
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.machineTitle}>
          Washing machine {item.laundryMachineId}
        </Text>
        <Text style={item.isAvailable ? styles.available : styles.inUse}>
          {item.isAvailable ? 'Available' : 'In Use'}
        </Text>
        <Text
          style={
            item.isFunctional ? styles.functional : styles.underMaintenance
          }
        >
          {item.isFunctional ? 'Functional' : 'Under Maintenance'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => toggleMaintenanceStatus(item)}
      >
        <Text style={styles.buttonText}>
          {item.isFunctional
            ? 'Mark as Under Maintenance'
            : 'Mark as Functional'}
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
    <View style={{ flex: 1 }}>
      <Header>
        <View style={styles.container}>
          <Text style={styles.title}>Manage Laundry Machines</Text>

          {/* Residence Selector */}
          <View style={styles.residenceSelector}>
            {residences.map((residence) => (
              <TouchableOpacity
                key={residence.id}
                style={[
                  styles.residenceButton,
                  selectedResidenceId === residence.id && styles.selectedResidence,
                ]}
                onPress={() => setSelectedResidenceId(residence.id)}
              >
                <Text style={[
                  styles.residenceButtonText,
                  selectedResidenceId === residence.id && styles.selectedResidenceText,
                ]}>
                  {residence.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Display error message if ID already exists */}
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          {/* Input for adding a new machine */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: Color.TextInputBackground },
              ]}
              placeholderTextColor={Color.TextInputPlaceholder}
              placeholder='Enter Machine ID'
              value={newMachineId}
              onChangeText={setNewMachineId}
            />
            <Button title='Add Machine' onPress={handleAddMachine} />
          </View>

          {/* List of machines */}
          <FlatList
            data={machines}
            renderItem={renderMachineItem}
            keyExtractor={(item) => item.laundryMachineId}
            style={{ flex: 1 }} // Allow FlatList to take up remaining space and be scrollable
            contentContainerStyle={{ paddingBottom: 20 }} // Add some padding at the bottom
          />
        </View>
      </Header>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.7,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    borderRadius: 25,
  },
  machineCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 25,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
  },
  machineTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  available: {
    color: 'green',
    fontWeight: 'bold',
  },
  inUse: {
    color: 'orange',
    fontWeight: 'bold',
  },
  functional: {
    color: 'blue',
    fontWeight: 'bold',
  },
  underMaintenance: {
    color: 'red',
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    borderRadius: 25,
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderWidth: 1,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  residenceSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  residenceButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedResidence: {
    backgroundColor: Color.ButtonBackground,
  },
  residenceButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedResidenceText: {
    color: '#fff',
  },
});

export default ManageMachinesScreen;
