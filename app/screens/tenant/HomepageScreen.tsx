import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native"; // Import NavigationProp
import { RootStackParamList } from "../../../types/types"; // Import or define your navigation types
import { createUser } from "../../../firebase/firestore/firestore"; // Import the function to create a user
import { User } from "../../../types/types"; // Import the User type
import Header from '../../components/Header'; // Import the Header component

// portions of this code were generated with chatGPT as an AI assistant //

export default function HomepageScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <Header showMenu={true}>
      <View style={styles.container}>
        <Text style={styles.header}>Here’s what’s new</Text>
        <View style={styles.newsContainer}>
          <Text style={styles.newsText}>
            News from the landlord to the tenants
          </Text>
        </View>
        <View style={styles.settingsButton}>
          <Button
            title="Go to Settings"
            onPress={() => navigation.navigate("Settings")} // Navigate to Settings
          />
        </View>
      </View>
    </Header>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  newsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 20,
  },
  newsText: {
    fontSize: 16,
    textAlign: "center",
  },
  settingsButton: {
    marginTop: 20,
    alignItems: "center",
  },
});
