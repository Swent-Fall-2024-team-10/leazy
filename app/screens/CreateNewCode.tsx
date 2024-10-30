import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import CustomTextField from "@/app/components/CustomTextField";
import CustomButton from "@/app/components/CustomButton";
import { useNavigation, NavigationProp } from "@react-navigation/native"; // Import NavigationProp
import { RootStackParamList } from "../../types/types"; // Import or define your navigation types
import Header from "../components/Header";

// This screen is for the landlord to create a new code for a new tenant
// The code will be used by the tenant to access the app for a specific residence
export default function CodeCreationScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [code, setCode] = useState("");

  const goBack = () => {
    navigation.goBack();
  };

  const createCode = () => {
    // Create a new code for the tenant
    // TODO: Implement code creation logic from Baudoin here
    console.log("Create code");
  };

  return (
    <View style={styles.container}>
      <Header>
        <View style={styles.container}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Create a new code for a new tenant</Text>
          </View>

          <CustomButton
            size="medium"
            onPress={/*createCode*/ () => console.log("Create code")}
            title="Create code"
            testID={""}
            style={styles.customButton}
          />
          {/* Only display the following if a code is created */}
          <Text style={styles.text}>
            Share the following code with a tenant:
          </Text>

          {/* Display the code once the create code function returns otherwise show three asterisks */}
          <Text style={styles.text}>{code ? code : "******"}</Text>
        </View>
      </Header>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customButton: {
    marginBottom: 20,
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
