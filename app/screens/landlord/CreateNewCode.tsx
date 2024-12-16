import React, { useState } from "react";
import { View, Text, Share, ActivityIndicator } from "react-native";
import * as Clipboard from 'expo-clipboard'; 
import SubmitButton from "../../../app/components/buttons/SubmitButton";
import Header from "../../..//app/components/Header";
import { generate_unique_code } from "../../../firebase/firestore/firestore";
import { stylesForHeaderScreens, appStyles } from "../../../styles/styles";
import { Alert } from "react-native";
import { db } from "../../../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Residence, Apartment, ResidenceWithId, ApartmentWithId } from "../../../types/types";
import {  pickerSelectStyles} from "../../../styles/SituationReportStyling";
import RNPickerSelect from 'react-native-picker-select';
import { useProperty } from "../../context/LandlordContext";


export default function CodeCreationScreen() {
  const { residences, apartments } = useProperty();
  const [code, setCode] = useState("");
  const [selectedResidenceId, setSelectedResidenceId] = useState<string>("");
  const [selectedApartmentId, setSelectedApartmentId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const createCode = async () => {
    if (!selectedResidenceId || !selectedApartmentId) {
      Alert.alert("Please enter both residence number and apartment number.");
      return;
    }

    setLoading(true);

    try {
      const generatedCode = await generate_unique_code(
        selectedResidenceId,
        selectedApartmentId
      );
      setCode(generatedCode);
    } catch (error: any) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        Alert.alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
     await Clipboard.setStringAsync(code);
    Alert.alert("Code copied to clipboard!");
  };

  const shareCode = async () => {
    try {
      await Clipboard.setStringAsync(code);
    } catch (error) {
      Alert.alert("Failed to copy code to clipboard");
      return;
    }
  };

  // Create residence picker items from available residences
  const residenceItems = residences.map(residence => ({
    label: residence.residenceName,
    value: residence.id
  }));

  // Filter apartments based on selected residence
  const apartmentItems = apartments
    .filter(apartment => apartment.residenceId === selectedResidenceId)
    .map(apartment => ({
      label: apartment.apartmentName,
      value: apartment.id
    }));

  return (
    <Header>
      <View style={[appStyles.screenContainer, {alignItems: 'center', width: '100%'}]}>
        <View style={stylesForHeaderScreens.titleContainer}>
          <Text style={stylesForHeaderScreens.title}>
            Create a new code for a new tenant
          </Text>
        </View>
        <View
          style={{
            padding: 20,
            width: "100%",
            alignItems: "center",
          }}
        >
          <View style={{ marginBottom: 20, borderWidth:1, borderRadius: 50, width: '80%'}}>
            <RNPickerSelect 
              style={pickerSelectStyles} 
              placeholder={{ label: "Select a residence", value: null }}
              items={residenceItems}
              onValueChange={(value) => {
                setSelectedResidenceId(value);
                setSelectedApartmentId(""); // Reset apartment when residence changes
              }}
              value={selectedResidenceId}
            />
          </View>
          <View style={{ marginBottom: 10, borderWidth:1, borderRadius: 50, width: '80%'}}>
            <RNPickerSelect 
              style={pickerSelectStyles} 
              placeholder={{ label: "Select an apartment", value: null }}
              items={apartmentItems}
              onValueChange={(value) => setSelectedApartmentId(value)}
              value={selectedApartmentId}
              disabled={!selectedResidenceId}
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
          style={[appStyles.submitButton, {marginBottom: 20}]}
        />

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
              style={appStyles.submitButton}
              textStyle={appStyles.submitButtonText}
              onPress={shareCode}
              width={180}
              height={50}
              label="Share Code"
              disabled={loading}
              testID="share-code-button"
            />

          </>
        ) : (
          <Text style={stylesForHeaderScreens.text}>******</Text>
        )}
      </View>
    </Header>
  );
}