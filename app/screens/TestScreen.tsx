import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { generate_unique_code, validateTenantCode, deleteUsedTenantCodes } from "../../firebase/firestore/firestore";

const TestScreen = () => {
  const [residenceId, setResidenceId] = useState("");
  const [apartmentId, setApartmentId] = useState("");
  const [tenantCode, setTenantCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState<string>("");
  const [validationResult, setValidationResult] = useState<string | null>(null);

  const handleGenerateCode = async () => {
    try {
      const code = await generate_unique_code(residenceId, apartmentId);
      setTenantCode(code);
      setErrorMessage(null); // Reset error if successful
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleValidateCode = async () => {
    try {
      const isValid = await validateTenantCode(inputCode);
      if (isValid) {
        setValidationResult(`Tenant code ${inputCode} is valid and marked as used.`);
      } else {
        setValidationResult(`Tenant code ${inputCode} is invalid or already used.`);
      }
      setErrorMessage(null); // Reset error if successful
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Residence ID:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Residence ID"
        value={residenceId}
        onChangeText={setResidenceId}
      />
      
      <Text style={styles.label}>Apartment ID:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Apartment ID"
        value={apartmentId}
        onChangeText={setApartmentId}
      />

      <Button title="Generate Code" onPress={handleGenerateCode} />

      {tenantCode && (
        <Text style={styles.result}>Generated Tenant Code: {tenantCode}</Text>
      )}
      
      <Text style={styles.label}>Enter Tenant Code to Validate:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Tenant Code"
        value={inputCode}
        onChangeText={setInputCode}
      />

      <Button title="Validate Code" onPress={handleValidateCode} />

      {validationResult && (
        <Text style={styles.result}>{validationResult}</Text>
      )}

      {errorMessage && (
        <Text style={styles.error}>Error: {errorMessage}</Text>
      )}

      <Button title="delete" onPress={deleteUsedTenantCodes} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginVertical: 10,
  },
  result: {
    fontSize: 18,
    color: "green",
    marginTop: 20,
  },
  error: {
    fontSize: 18,
    color: "red",
    marginTop: 20,
  },
});

export default TestScreen;
