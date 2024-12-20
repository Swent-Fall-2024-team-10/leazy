import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { AuthStackParamList, TUser, Landlord } from '../../../types/types';
import {
  createLandlord,
  createUser,
} from '../../../firebase/firestore/firestore';
import { emailAndPasswordSignIn } from '../../../firebase/auth/auth';
import SubmitButton from '../../components/buttons/SubmitButton';
import InputField from '../../components/forms/text_input';
import Spacer from '../../components/Spacer';
import { appStyles, ButtonDimensions, Color } from '../../../styles/styles';
import { RouteProp } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const LandlordFormScreen = () => {
  const route =
    useRoute<RouteProp<AuthStackParamList, 'TenantForm' | 'LandlordForm'>>();
  const { email, password } = route.params;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [city, setCity] = useState('');
  const [canton, setCanton] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const user = await emailAndPasswordSignIn(email, password);
      if (user) {
        const userData: TUser = {
          uid: user.uid,
          type: 'landlord',
          name: `${firstName} ${lastName}`,
          email: email,
          phone: phone,
          street: street,
          number: number,
          city: city,
          canton: canton,
          zip: zip,
          country: country,
        };
        await createUser(userData);
        const landlord: Landlord = {
          userId: user.uid,
          residenceIds: [],
        };
        await createLandlord(landlord);
        Alert.alert('Success', 'Landlord profile created successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create landlord profile.');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardShouldPersistTaps='handled'
        extraScrollHeight={Platform.OS === 'ios' ? 30 : 0}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <ScrollView>
          <View style={appStyles.screenContainer}>
            <Text style={styles.header}>Landlord Profile</Text>
            <Spacer height={20} />

            <View style={styles.row}>
              <InputField
                value={firstName}
                setValue={setFirstName}
                placeholder='First Name'
                testID='testFirstNameField'
                style={styles.inputField}
              />
              <InputField
                value={lastName}
                setValue={setLastName}
                placeholder='Last Name'
                testID='testLastNameField'
                style={styles.inputField}
              />
            </View>

            <InputField
              value={phone}
              setValue={setPhone}
              placeholder='Phone number'
              testID='testPhoneField'
              style={styles.inputField}
            />

            <InputField
              value={street}
              setValue={setStreet}
              placeholder='Street'
              testID='testStreetField'
              style={styles.inputField}
            />

            <View style={styles.row}>
              <InputField
                value={zip}
                setValue={setZip}
                placeholder='Zip code'
                testID='testZipField'
                style={styles.inputField}
              />
              <InputField
                value={city}
                setValue={setCity}
                placeholder='City'
                testID='testCityField'
                style={styles.inputField}
              />
            </View>

            <View style={styles.row}>
              <InputField
                value={canton}
                setValue={setCanton}
                placeholder='Province/State'
                testID='testCantonField'
                style={styles.inputField}
              />
              <InputField
                value={number}
                setValue={setNumber}
                placeholder='Number'
                testID='testNumberField'
                style={styles.inputField}
              />
            </View>

            <InputField
              value={country}
              setValue={setCountry}
              placeholder='Country'
              testID='testCountryField'
              style={styles.inputField}
            />

            <Spacer height={30} />
            <View style={appStyles.submitContainer}>
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
                  !country ||
                  submitting
                }
                onPress={handleSubmit}
                width={ButtonDimensions.mediumButtonWidth}
                height={ButtonDimensions.mediumButtonHeight}
                label='Next'
                style={appStyles.submitButton}
                textStyle={appStyles.submitButtonText}
                testID='testSubmitButtonLandlord'
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.ScreenBackground,
    flex: 1,
  },
  header: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: '15%',
    marginBottom: 15,
    color: Color.ScreenHeader,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputField: {
    backgroundColor: Color.TextInputBackground, // Adjusted for soft purple
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
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default LandlordFormScreen;
