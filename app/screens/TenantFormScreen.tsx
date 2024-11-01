import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import Header from "../components/Header";
import { add_new_tenant } from "@/firebase/firestore/firestore";
import { useNavigation, useRoute, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../types/types";

const TenantProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { code } = route.params as { code: string };

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [number, setNumber] = useState("");
  const [genre, setGenre] = useState("");
  const [country, setCountry] = useState("");

  const handleSubmit = async () => {
    try {
      await add_new_tenant(
        code,
        `${firstName} ${lastName}`,
        email,
        phone,
        address,
        number,
        city,
        province,
        zip,
        country
      );
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Error", "Failed to create tenant profile.");
      console.error(error);
    }
  };

  return (
    <Header showMenu={false}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Tenant Profile</Text>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Current Address"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Zip code"
            value={zip}
            onChangeText={setZip}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            value={city}
            onChangeText={setCity}
          />
        </View>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Province/State"
            value={province}
            onChangeText={setProvince}
          />
          <TextInput
            style={styles.input}
            placeholder="Number"
            value={number}
            onChangeText={setNumber}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Genre"
            value={genre}
            onChangeText={setGenre}
          />
        </View>

        <TextInput
          style={[styles.input, styles.singleColumn]}
          placeholder="Country"
          value={country}
          onChangeText={setCountry}
        />

        <TouchableOpacity style={styles.uploadBox}>
          <Text style={styles.uploadText}>
            Upload university proof of attendance
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
          <Text style={styles.nextButtonText}>NEXT</Text>
        </TouchableOpacity>
      </ScrollView>
    </Header>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 31,
    fontWeight: "bold",
    fontFamily: "Arial",
    textAlign: "center",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#7F7F7F',
    backgroundColor: '#D6D3F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    flexShrink: 0,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
  singleColumn: {
    marginBottom: 15,
  },
  uploadBox: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  uploadText: {
    color: "#999999",
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: "#4CAF50",
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#7F7F7F',
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TenantProfileScreen;
