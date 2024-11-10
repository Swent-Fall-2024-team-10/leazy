import React, { useState } from "react";
import {
  View,
  Text,
  Clipboard,
  Share,
  ActivityIndicator,
} from "react-native";
import SubmitButton from "@/app/components/buttons/SubmitButton";
import InputField from "@/app/components/forms/text_input";
import Header from "../../components/Header";
import { generate_unique_code } from "@/firebase/firestore/firestore";
import { stylesForHeaderScreens, appStyles } from "@/styles/styles";

// This screen is for the landlord to create a new code for a new tenant
// The code will be used by the tenant to access the app for a specific residence
export default function CodeCreationScreen() {
  const [code, setCode] = useState("");
  const [residenceId, setResidenceId] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [loading, setLoading] = useState(false);

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
              value={residenceId}
              setValue={setResidenceId}
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
              value={apartmentId}
              setValue={setApartmentId}
              placeholder="Enter apartment ID"
              height={40}
              style={{ flex: 0 }}
            />
          </View>
        </View>

        <SubmitButton
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
