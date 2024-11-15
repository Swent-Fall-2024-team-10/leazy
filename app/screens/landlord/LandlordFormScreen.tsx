import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../types/types";
import { add_new_landlord } from "../../../firebase/firestore/firestore";
import SubmitButton from "../../components/buttons/SubmitButton";
import InputField from "../../components/forms/text_input";
import Spacer from "../../components/Spacer";
import { Color } from "../../../styles/styles";

const LandlordFormScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [city, setCity] = useState("");
  const [canton, setCanton] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");

  const handleSubmit = async () => {
    try {
      await add_new_landlord(
        `${firstName} ${lastName}`,
        email,
        phone,
        street,
        number,
        city,
        canton,
        zip,
        country
      );
      Alert.alert("Success", "Landlord profile created successfully!");
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Error", "Failed to create landlord profile.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.header}>Landlord Profile</Text>
        <Spacer height={20} />

        <View style={styles.row}>
          <InputField
            value={firstName}
            setValue={setFirstName}
            placeholder="First Name"
            testID="testFirstNameField"
            style={styles.inputField}
          />
          <InputField
            value={lastName}
            setValue={setLastName}
            placeholder="Last Name"
            testID="testLastNameField"
            style={styles.inputField}
          />
        </View>

        <InputField
          value={email}
          setValue={setEmail}
          placeholder="Email"
          testID="testEmailField"
          style={styles.inputField}
        />

        <InputField
          value={phone}
          setValue={setPhone}
          placeholder="Phone number"
          testID="testPhoneField"
          style={styles.inputField}
        />

        <InputField
          value={street}
          setValue={setStreet}
          placeholder="Street"
          testID="testStreetField"
          style={styles.inputField}
        />

        <View style={styles.row}>
          <InputField
            value={zip}
            setValue={setZip}
            placeholder="Zip code"
            testID="testZipField"
            style={styles.inputField}
          />
          <InputField
            value={city}
            setValue={setCity}
            placeholder="City"
            testID="testCityField"
            style={styles.inputField}
          />
        </View>

        <View style={styles.row}>
          <InputField
            value={canton}
            setValue={setCanton}
            placeholder="Province/State"
            testID="testCantonField"
            style={styles.inputField}
          />
          <InputField
            value={number}
            setValue={setNumber}
            placeholder="Number"
            testID="testNumberField"
            style={styles.inputField}
          />
        </View>

        <InputField
          value={country}
          setValue={setCountry}
          placeholder="Country"
          testID="testCountryField"
          style={styles.inputField}
        />

        <Spacer height={30} />

        <SubmitButton
          disabled={
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !street ||
            !zip ||
            !city ||
            !canton ||
            !number ||
            !country
          }
          onPress={handleSubmit}
          width={200}
          height={55}
          label="Next"
          style={styles.submitButtonCustom}
          testID="submitButton"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.ScreenBackground,
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: Color.ScreenHeader,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputField: {
    backgroundColor: Color.HeaderBackground, // Adjusted for soft purple
    borderRadius: 100,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: Color.ButtonBackground,
    borderRadius: 25,
  },
  submitButtonCustom: {
    marginTop: 40,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default LandlordFormScreen;
