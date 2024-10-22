import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Alert } from 'react-native';
import CustomTextField from '../components/CustomTextField';
import CustomButton from '../components/CustomButton';
import CustomPicker from '../components/CustomPicker';
import { UserType } from '../../firebase/auth/auth';
import { emailAndPasswordSignIn } from '../../firebase/auth/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native'; // Import NavigationProp
import { RootStackParamList } from '../../types/types';  // Import or define your navigation types
import CustomPopUp from '../components/CustomPopUp';
import { createUser } from '@/firebase/firestore/firestore';
import { User } from '@/types/types';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignUpScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [userType, setUserType] = useState(UserType.TENANT);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [popup, setPopup] = useState(false)

  const validateForm = (): FormErrors => {
    let newErrors: FormErrors = {};
    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (password != confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSignUpPress = () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // Simulate successful registration
    emailAndPasswordSignIn(email, password, userType).then((user) => {
      if (user) {
        console.log("User signed up:", user);
        // Create a new object of type User 

        const landlordOrTenant = userType === UserType.TENANT ? "tenant" : "landlord";

        const newUser : User = {
          uid: user.uid,
          type: landlordOrTenant,
          name: firstName + " " + lastName,
          email: email,
          phone: '',
          street: '',
          number: '',
          city: '',
          canton: '',
          zip: '',
          country: ''
        }

        createUser(newUser);

        navigation.navigate('Home' as never);
      } else {
        console.log("Sign up failed");
        setPopup(true)
      }
    });
  };

  const handleGoogleSignUp = () => {
    Alert.alert('Google Sign Up', 'Google Sign Up functionality would be implemented here.');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {popup && <CustomPopUp
          testID="signUpPopup"
          text= 'An error occurred while signing up. Please make sure you are connected to the internet and that your email is not already used by another account.'
          onPress={() => setPopup(false)}
        />}
        <Text style={styles.title}>Welcome to Leazy</Text>
        <Text style={styles.text}>Are you renting or the manager of a property?</Text>
        
        <CustomPicker
          testID='userTypePicker'
          selectedValue={userType}
          onValueChange={(itemValue) => setUserType(itemValue)}
        />
        <Text style={styles.text}>Please enter your personal info</Text>
        
        <CustomTextField
          testID='firstNameInput'
          placeholder="First name"
          value={firstName}
          onChangeText={setFirstName}
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
        
        <CustomTextField
          testID='lastNameInput'
          placeholder="Last name"
          value={lastName}
          onChangeText={setLastName}
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

        <Text style={styles.text}>And choose an email and password</Text>

        <CustomTextField
          testID='emailInput'
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        
        <CustomTextField
          testID='passwordInput'
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        
        <CustomTextField
          testID='confirmPasswordInput'
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

        <CustomButton testID='signUpButton'size="small" onPress={handleSignUpPress} title= "Sign up"/>

        <Text style={styles.text}>or</Text>

        <CustomButton 
          testID='googleSignUpButton'
          title="Sign up with Google" 
          onPress={handleGoogleSignUp} 
          size="large" 
          image={require('../../assets/images/google_logo.png')} 
        />

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputError: {
    borderColor: '#FF004',
    borderWidth: 1,
  },
  errorText: {
    fontFamily: 'Inter',
    color: '#FF0004',
    fontSize: 12,
    marginBottom: 10,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    color: '#0B3142',
    textAlign: 'center',
    fontFamily: 'Inter',  // Ensure Inter font is properly loaded in your project
    fontSize: 40,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 40,  // Use a numeric value for lineHeight in React Native
    letterSpacing: 0.4,
    marginBottom: 24,
  },
  text: {
    color: '#0B3142',
    textAlign: 'center',
    fontFamily: 'Inter',  // Ensure Inter font is properly loaded in your project
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 24,  // Adjust if necessary, using numeric value for lineHeight
    letterSpacing: 0.24,
    marginBottom: 23,
  },
});