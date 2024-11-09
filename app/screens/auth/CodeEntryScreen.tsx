// CodeEntryScreen.js
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  useNavigation,
  NavigationProp,
  useRoute,
} from "@react-navigation/native";
import CustomTextField from "@/app/components/CustomTextField";
import CustomButton from "@/app/components/CustomButton";
import { RootStackParamList } from "@/types/types";
import { validateTenantCode } from "@/firebase/firestore/firestore"; // Import createTenant here

export default function CodeEntryScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { userId, email } = route.params as {
    userId: string;
    email: string;
  }; // Access tenant details passed from SignUpScreen
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<{ code?: string }>({});

  const handleSubmit = async () => {
    try {
      const tenantCodeId = await validateTenantCode(code);
      if (tenantCodeId === null) {
        setErrors({ code: "Invalid code" });
        throw new Error("Invalid code");
      }
      navigation.navigate("CodeApproved", { tenantCodeId }); // Navigate to the next screen and pass the tenant's code ID
    } catch (error) {
      console.error("Failed to add new tenant:", error);
      alert("There was an error adding the tenant. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Leazy</Text>
      <Text style={styles.text}>Do you already have a code?</Text>
      <CustomTextField
        testID="code-input"
        placeholder="Enter code"
        value={code}
        onChangeText={setCode}
      />
      <CustomButton
        size="medium"
        onPress={handleSubmit}
        title="Submit code"
        testID={"submitButton"}
      />
      {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
      <Text style={styles.text}>
        If you don't have a code please ask your residence manager to generate
        one for you.
      </Text>
    </View>
  );
}

// Remaining styles as before...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    color: "#0B3142",
    textAlign: "center",
    fontFamily: "Inter", // Ensure Inter font is properly loaded in your project
    fontSize: 40,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 40, // Use a numeric value for lineHeight in React Native
    letterSpacing: 0.4,
    marginBottom: 24,
  },
  text: {
    color: "#0B3142",
    textAlign: "center",
    fontFamily: "Inter", // Ensure Inter font is properly loaded in your project
    fontSize: 24,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 24, // Adjust if necessary, using numeric value for lineHeight
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
