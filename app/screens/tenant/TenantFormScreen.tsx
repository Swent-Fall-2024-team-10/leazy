import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Button } from "react-native-elements";
import { appStyles, ButtonDimensions, Color } from "@/styles/styles";
import { add_new_tenant } from "@/firebase/firestore/firestore";
import {
  useNavigation,
  useRoute,
  NavigationProp,
} from "@react-navigation/native";
import { RootStackParamList } from "../../../types/types";
import SubmitButton from "@/app/components/buttons/SubmitButton";
import InputField from "@/app/components/forms/text_input";
import Spacer from "@/app/components/Spacer";

const TenantProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { tenantCodeId } = route.params as { tenantCodeId: string };

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
        tenantCodeId,
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
    <SafeAreaView style={{ backgroundColor: Color.ScreenBackground }}>
      <ScrollView contentContainerStyle={{ padding: '5%', marginTop: '10%' }}
      automaticallyAdjustKeyboardInsets={true}
      >
        
        <Text style={[styles.header, {marginBottom: '12%'}]}>Tenant Profile</Text>

        <View style={styles.row}>
          <InputField
            value={firstName}
            setValue={setFirstName}
            placeholder="First Name"
            testID="testFirstNameField"
            height={40}
            backgroundColor={Color.TextInputBackground}
          />

          <InputField
            value={lastName}
            setValue={setLastName}
            placeholder="Last Name"
            testID="testLastNameField"
            height={40}
            backgroundColor={Color.TextInputBackground}
          />
        </View>

        <View style={styles.row}>
          <InputField
            value={email}
            setValue={setEmail}
            placeholder="Email"
            testID="testEmailField"
            height={40}
            backgroundColor={Color.TextInputBackground}
          />
        </View>

        <View style={styles.row}>
          <InputField
            value={address}
            setValue={setAddress}
            placeholder="Current Address"
            testID="testAddressField"
            height={40}
            backgroundColor={Color.TextInputBackground}
          />
        </View>

        <View style={styles.row}>
          <InputField
            value={zip}
            setValue={setZip}
            placeholder="Zip code"
            testID="testZipField"
            height={40}
            backgroundColor={Color.TextInputBackground}
          />

          <InputField
            value={city}
            setValue={setCity}
            placeholder="City"
            testID="testCityField"
            height={40}
            backgroundColor={Color.TextInputBackground}
          />
        </View>

        <View style={styles.row}>
          <InputField
            placeholder="Province/State"
            value={province}
            setValue={setProvince}
            testID="testProvinceField"
            height={40}
            backgroundColor={Color.TextInputBackground}
          />
          <InputField
            placeholder="Number"
            value={number}
            setValue={setNumber}
            testID="testNumberField"
            height={40}
            backgroundColor={Color.TextInputBackground}
          />
        </View>

        <View style={styles.row}>
          <InputField
            placeholder="Phone number"
            value={phone}
            setValue={setPhone}
            testID="testPhoneField"
            height={40}
            backgroundColor={Color.TextInputBackground}
          />
          <InputField
            placeholder="Genre"
            value={genre}
            setValue={setGenre}
            testID="testGenreField"
            height={40}
            backgroundColor={Color.TextInputBackground}
          />
        </View>

        <View style={[{ marginBottom: 20 }]}>
          <InputField
            placeholder="Country"
            value={country}
            setValue={setCountry}
            testID="testCountryField"
            height={40}
            backgroundColor={Color.TextInputBackground}
          />
        </View>

        <View style={[{ marginBottom: "6%" }]}>
          <SubmitButton
            testID="proof-attendance"
            textStyle={appStyles.submitButtonText}
            style={appStyles.submitButton}
            disabled={false}
            onPress={() => {}}
            width={ButtonDimensions.fullWidthButtonWidth}
            height={ButtonDimensions.veryLargeButtonHeight}
            label="Upload university proof of attendance">
          </SubmitButton>
        
        </View>

        <SubmitButton
          testID="submit-tenant-profile"
          textStyle={appStyles.submitButtonText}
          style={appStyles.submitButton}
          disabled={
            firstName === "" ||
            lastName === "" ||
            email === "" ||
            phone === "" ||
            address === "" ||
            zip === "" ||
            city === "" ||
            province === "" ||
            number === "" ||
            genre === "" ||
            country === ""
          }
          onPress={handleSubmit}
          width={ButtonDimensions.mediumButtonWidth}
          height={ButtonDimensions.mediumButtonHeight}
          label="NEXT"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: Color.ScreenHeader,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
});

export default TenantProfileScreen;
