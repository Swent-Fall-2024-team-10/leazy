import React, { useState } from "react";
import { View, Text, Share, ActivityIndicator } from "react-native";
import SubmitButton from "../../../app/components/buttons/SubmitButton";
import InputField from "../../../app/components/forms/text_input";
import Header from "../../..//app/components/Header";
import { generate_unique_code } from "../../../firebase/firestore/firestore";
import { stylesForHeaderScreens, appStyles } from "../../../styles/styles";
import ClipBoard from "@react-native-clipboard/clipboard";
import { Alert } from "react-native";
import { db } from "../../../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Residence, Apartment } from "../../../types/types";

// This screen is for the landlord to create a new code for a new tenant
// The code will be used by the tenant to access the app for a specific residence
export default function CodeCreationScreen() {
  const [code, setCode] = useState("");
  const [residenceNumber, setResidenceNumber] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const createCode = async () => {
    if (!residenceNumber || !apartmentNumber) {
      Alert.alert("Please enter both residence number and apartment number.");
      return;
    }

    setLoading(true); // Start loading

    // Check if the residence exists and retrieve its UID
    const residencesRef = collection(db, "residences");
    const residenceQuery = query(
      residencesRef,
      where("residenceId", "==", residenceNumber)
    );
    const residenceSnapshot = await getDocs(residenceQuery);
    // I am not sure about this line
    if (residenceSnapshot.empty) {
      throw new Error(
        "No matching residence found for the given residence ID."
      );
    }
    const residenceDoc = residenceSnapshot.docs[0];
    const residenceUID = residenceDoc.id;
    const residenceData = residenceDoc.data() as Residence;

    // Check if the apartment exists, belongs to the residence and retrieve its UID
    const apartmentsRef = collection(db, "apartments");
    const apartmentQuery = query(
      apartmentsRef,
      where("apartmentId", "==", apartmentNumber)
    );
    const apartmentSnapshot = await getDocs(apartmentQuery);
    if (apartmentSnapshot.empty) {
      throw new Error(
        "No matching apartment found for the given apartment ID."
      );
    }

    const apartmentDoc = apartmentSnapshot.docs[0];
    const apartmentUID = apartmentDoc.id;
    const apartmentData = apartmentDoc.data() as Apartment;

    if (!residenceData.apartments.includes(apartmentUID)) {
      console.log(
        `Apartment ID ${apartmentUID} is not associated with residence ID ${residenceUID}.`
      );
      throw new Error(
        `Apartment ID ${apartmentNumber} is not associated with residence ID ${residenceNumber}.`
      );
    }

    if (apartmentData.residenceId !== residenceUID) {
      console.log(
        `Apartment's residence ID ${apartmentData.residenceId} does not match the residence UID ${residenceUID}.`
      );
      throw new Error(
        `The residence linked to the apartment ${apartmentNumber} is different.`
      );
    }

    // Generate the new code
    try {
      // Assuming generateCode is an asynchronous function that takes residenceNumber and apartmentNumber as parameters
      const generatedCode = await generate_unique_code(
        residenceUID,
        apartmentUID
      );
      setCode(generatedCode); // Set the generated code
    } catch (error: any) {
      if (error instanceof Error) {
        Alert.alert(error.message); // Backend-provided error messages
      } else {
        Alert.alert("An unexpected error occurred. Please try again."); // Fallback for non-Error objects
      }
    } finally {
      setLoading(false); // End loading
    }
  };

  const copyToClipboard = () => {
    ClipBoard.setString(code);
    Alert.alert("Code copied to clipboard!");
  };

  const shareCode = async () => {
    try {
      await Share.share({
        message: `Here is your code: ${code}`,
      });
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        Alert.alert("An unknown error occurred");
      }
    }
  };

  return (
    <Header>
      <View style={appStyles.screenContainer}>
        <View style={stylesForHeaderScreens.titleContainer}>
          <Text style={stylesForHeaderScreens.title}>
            Create a new code for a new tenant
          </Text>
        </View>
        <View
          style={{
            padding: 20,
          }}
        >
          <View style={{ marginBottom: 25 }}>
            <Text style={stylesForHeaderScreens.text}>
              Enter the Residence ID
            </Text>

            <InputField
              testID="Residence ID"
              value={residenceNumber}
              setValue={setResidenceNumber}
              placeholder="Enter residence ID"
              height={40}
              style={{ flex: 0 }}
            />
          </View>
          <View style={{ marginBottom: 10 }}>
            <Text style={stylesForHeaderScreens.text}>
              Enter the Apartment ID
            </Text>

            <InputField
              testID="Apartment ID"
              value={apartmentNumber}
              setValue={setApartmentNumber}
              placeholder="Enter apartment ID"
              height={40}
              style={{ flex: 0 }}
            />
          </View>
        </View>

        <SubmitButton
          testID="create-code-button"
          textStyle={appStyles.submitButtonText}
          onPress={createCode}
          disabled={loading}
          width={180}
          height={50}
          label="Create Code"
          style={{ marginBottom: 20 }}
        />

        {/* Only display the following if a code is created */}
        {loading ? (
          <ActivityIndicator size="large" color="#00ff88" />
        ) : code ? (
          <>
            <Text style={stylesForHeaderScreens.text}>
              Share the following code with a tenant:
            </Text>
            <Text
              onPress={copyToClipboard}
              style={stylesForHeaderScreens.CodeText}
            >
              {code}
            </Text>
            <SubmitButton
              testID="share-code-button"
              style={appStyles.submitButton}
              textStyle={appStyles.submitButtonText}
              onPress={shareCode}
              disabled={loading}
              label="Share Code"
              width={180}
              height={50}
            />
          </>
        ) : (
          <Text style={stylesForHeaderScreens.text}>******</Text>
        )}
      </View>
    </Header>
  );
}
