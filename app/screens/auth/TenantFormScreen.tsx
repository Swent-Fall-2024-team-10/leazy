import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { appStyles, ButtonDimensions, Color } from "@/styles/styles";
import {
  useNavigation,
  useRoute,
  NavigationProp,
} from "@react-navigation/native";
import { AuthStackParamList, TUser} from "../../../types/types";
import SubmitButton from "@/app/components/buttons/SubmitButton";
import InputField from "@/app/components/forms/text_input";
import { RouteProp } from '@react-navigation/native';
import { emailAndPasswordSignIn } from "@/firebase/auth/auth";
import { createUser, createTenant } from "@/firebase/firestore/firestore";
import { Tenant } from "@/types/types";

const TenantProfileScreen = () => {

  const route = useRoute<RouteProp<AuthStackParamList, 'TenantForm' | 'LandlordForm'>>();
  const { email, password } = route.params;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
      const user = await emailAndPasswordSignIn(email, password);
      if (user) {
        Alert.alert("Success", "Tenant profile created successfully!");
        const userData: TUser = {
          uid: user.uid,
          type: "tenant",
          name: `${firstName} ${lastName}`,
          email: email,
          phone: phone,
          street: address,
          number: number,
          city: city,
          canton: province,
          zip: zip,
          country: country,
        };
        await createUser(userData);
        
        const tenantData: Tenant = {
          userId: user.uid,
          maintenanceRequests: [],
          apartmentId: "",
          residenceId: "",
        };
        await createTenant(tenantData);
      }

     
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
