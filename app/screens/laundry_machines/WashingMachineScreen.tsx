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
import { getAllLaundryMachines } from "@/firebase/firestore/firestore";
import SubmitButton from "@/app/components/buttons/SubmitButton";
import { appStyles } from "@/styles/styles";

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

  const fetchMachines = async () => {
    setRefreshing(true);
    const fetchedMachines = await getAllLaundryMachines(residenceId);
    setMachines(fetchedMachines);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchMachines();
  }, [residenceId]);

  const handleSetTimer = () => {
    if (selectedMachineId) {
      syncTimerWithFirestore(selectedMachineId, timer);
    }
    setIsTimerModalVisible(false);
  };

  const syncTimerWithFirestore = (
    laundryMachineId: string,
    time: number | null
  ) => {
    console.log(
      `Syncing timer for machine ${laundryMachineId} with time ${time}`
    );
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
              source={require("@/assets/images/washing_machine_icon_png.png")}
              style={{ width: 120, height: 120, marginRight: '0.5%', marginLeft: '-1.5%' }}
            />

            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={styles.machineTitle}>
                Machine number: {machine.laundryMachineId}
              </Text>
              <View style={[styles.statusBubble, style]}>
                <Text style={styles.statusText}>{statusText}</Text>
              </View>

              {/* Placeholder View for consistent layout */}
              <View
                style={{
                  height: 40,
                  width: 200,
                  marginTop: 10,
                  marginBottom: 10,
                  alignItems: "center",
                }}
              >
                {machine.isAvailable && machine.isFunctional && (
                  <SubmitButton
                    testID="set-timer-button"
                    textStyle={appStyles.submitButtonText}
                    style={appStyles.submitButton}
                    width={200}
                    height={40}
                    disabled={false}
                    label="Set Laundry Timer"
                    onPress={() => {
                      setSelectedMachineId(machine.laundryMachineId);
                      setIsTimerModalVisible(true);
                    }}
                  />
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
    flex: 0.69,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter", // Make sure Inter font is loaded in your project
    fontWeight: "bold",
    marginBottom: 20,
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
    fontSize: 20,
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
