import CustomButton from "@/app/components/CustomButton";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation, NavigationProp, useRoute } from "@react-navigation/native"; // Import NavigationProp
import { RootStackParamList } from "@/types/types";

export default function CodeApprovedScreen() {
  // retrieve the code from the previous screen
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const route = useRoute();
  const { tenantCodeId } = route.params as { tenantCodeId: string };

  const address = "18 Chemin de Renens, 1004 Lausanne";
  const onNext = () => {
    console.log("Next button pressed");
    navigation.navigate("TenantForm", {tenantCodeId}); // Redirect to the main app screen or appropriate screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.approvedText}>Code approved!</Text>
      <Text style={styles.text}>
        Welcome to {"\n"}
        {address}!
      </Text>
      <CustomButton size="medium" onPress={onNext} title="Next" testID='testNextButton'/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  approvedText: {
    color: "#3AB700",
    textAlign: "center",
    fontFamily: "Inter", // Ensure Inter font is linked to the project
    fontSize: 40,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 48, // React Native requires an explicit value, 48 is a suggested value
    letterSpacing: 0.4,
    marginBottom: 23,
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
    marginBottom: 30,
  },
});
