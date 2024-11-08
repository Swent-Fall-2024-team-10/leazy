import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Clipboard,
  Share,
  ActivityIndicator,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import CustomTextField from "@/app/components/CustomTextField";
import CustomButton from "@/app/components/CustomButton";
import { RootStackParamList } from "../../../types/types";
import Header from "../../components/Header";
import { generate_unique_code } from "@/firebase/firestore/firestore";

// This screen is for the landlord to create a new code for a new tenant
// The code will be used by the tenant to access the app for a specific residence
export default function CodeCreationScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [code, setCode] = useState("");
  const [residenceId, setResidenceId] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [loading, setLoading] = useState(false);

  const goBack = () => {
    navigation.goBack();
  };

  const createCode = async () => {
    if (!residenceId || !apartmentId) {
      alert("Please enter both Residence ID and Apartment ID.");
      return;
    }

    setLoading(true); // Start loading

    try {
      // Assuming generateCode is an asynchronous function that takes residenceId and apartmentId as parameters
      const generatedCode = await generate_unique_code(
        residenceId,
        apartmentId
      );
      setCode(generatedCode); // Set the generated code
    } catch (error: any) {
      if (error instanceof Error) {
        alert(error.message); // Backend-provided error messages
      } else {
        alert("An unexpected error occurred. Please try again."); // Fallback for non-Error objects
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(code);
    alert("Code copied to clipboard!");
  };

  const shareCode = async () => {
    try {
      await Share.share({
        message: `Here is your code: ${code}`,
      });
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Header showMenu={true}>
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create a new code for a new tenant</Text>
          </View>
          <View style={styles.customTextField}>
            <CustomTextField
              testID="Residence ID"
              value={residenceId}
              onChangeText={setResidenceId}
              placeholder="Enter residence ID"
            />
            <CustomTextField
              testID="Apartment ID"
              value={apartmentId}
              onChangeText={setApartmentId}
              placeholder="Enter apartment ID"
            />
          </View>

          <CustomButton
            size="large"
            onPress={createCode}
            title="Create a new code"
            testID={""}
            style={styles.customButton}
          />

          {/* Only display the following if a code is created */}
          {loading ? (
            <ActivityIndicator size="large" color="#00ff88" />
          ) : code ? (
            <>
              <Text style={styles.text}>
                Share the following code with a tenant:
              </Text>
              <Text onPress={copyToClipboard} style={styles.CodeText}>
                {code}
              </Text>
              <CustomButton
                size="medium"
                onPress={shareCode}
                title="Share Code"
                testID={""}
                style={styles.customButton}
              />
            </>
          ) : (
            <Text style={styles.text}>******</Text>
          )}
        </View>
      </Header>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customTextField: {
    marginBottom: 20,
    marginTop: 20,
    position: "relative",
    alignSelf: "center",
  },
  customButton: {
    marginBottom: 40,
    marginTop: 20,
    position: "relative",
    alignSelf: "center",
  },
  titleContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
  },
  text: {
    color: "#0B3142",
    textAlign: "center",
    fontFamily: "Inter",
    fontSize: 24,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: 0.24,
    marginBottom: 23,
  },
  CodeText: {
    color: "#00ff88",
    textAlign: "center",
    fontFamily: "Inter",
    fontSize: 24,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: 0.24,
    marginBottom: 23,
  },
  errorText: {
    color: "#FF0004",
    textAlign: "center",
    fontFamily: "Inter",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 16,
    letterSpacing: 0.16,
    marginBottom: 20,
    marginTop: 20,
    width: 186,
  },
});
