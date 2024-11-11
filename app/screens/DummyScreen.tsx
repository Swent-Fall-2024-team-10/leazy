import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import CustomTextField from '../components/CustomTextField';
import CustomButton from '../components/CustomButton';
import { emailAndPasswordLogIn } from '../../firebase/auth/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native'; // Import NavigationProp
import { RootStackParamList } from '../../types/types';  // Import or define your navigation types
import CustomPopUp from '../components/CustomPopUp';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { TextInput } from 'react-native-gesture-handler';
import SubmitButton from '../components/buttons/SubmitButton';


interface FormErrors {
  email?: string;
  password?: string;
}

export default function Dummy() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [popup, setPopup] = useState(false);

  const validateForm = (): FormErrors => {
    let newErrors: FormErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSignIn = () => {
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    emailAndPasswordLogIn(email, password).then((user) => {
      if (user) {
        Alert.alert('Success', 'You have successfully signed in!');
        console.log("User signed in:", user);
      }
    }).catch((error) => {
      setPopup(true);
      //Alert.alert('Error', 'An error occurred while signing in. Please make sure you are connected to the internet and that your email and password are correct.');
    });
  };

  const handleSignUpPress = () => {
    navigation.navigate('SignUp' as never);
  };

  return (
    <View style={styles.container}>
      {popup && < CustomPopUp
        testID="signInPopup"
        text = "An error occurred while signing in. Please make sure you are connected to the internet and that your email and password are correct."
        onPress = {() => setPopup(false)}
      />}

      <Text style={styles.title}>Welcome to Leazy</Text>
      
      <CustomTextField
        testID="emailInput"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      <CustomTextField
        testID="passwordInput"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      <CustomButton testID='signInButton' size="small" onPress={handleSignIn} title ="Sign in"/>
      <Text style={styles.text}>or</Text>
      <GoogleSignInButton/>
      <View style={styles.horizontalLine} />
      <Text style={styles.text}>Don't have an account yet?</Text>
      <CustomButton testID='signUpButton'size="large" onPress={handleSignUpPress} title="Sign up"/>
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalLine: {
    height: 1,            // Thickness of the line
    backgroundColor: '#0B3142',  // Line color (you can adjust this)
    marginVertical: 20,    // Adds space above and below the line
    width: '100%',         // Line width (full width of the parent container)
  },
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
  smallButton: {
    width: 126,
    height: 43,
    flexShrink: 0,  // Prevents shrinking
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#0F5257',
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',     // Center content horizontally
    marginBottom: 23,
  },
  largeButton: {
    flexDirection: 'row',      // Arrange items horizontally
    alignItems: 'center',      // Align items vertically centered
    padding: 10,
    width: 263,
    height: 43,
    flexShrink: 0,  // Prevents shrinking in flex containers
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#0F5257',
    justifyContent: 'center',  // Center content vertically if needed
    paddingHorizontal: 10,     // Add padding to control text placement
    marginBottom: 23,
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Inter',  // Make sure Inter font is loaded in your project
    fontSize: 20,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 20,  // Use a numeric value for lineHeight in React Native
    letterSpacing: 0.2,
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
  socialIcon: {
    width: 24,
    height: 24,
    flexShrink: 0,
    marginRight: 8,
  },
});