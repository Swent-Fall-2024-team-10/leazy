import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Modal } from 'react-native';
import CustomTextField from '../../components/CustomTextField';
import { emailAndPasswordLogIn } from '../../../firebase/auth/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native'; // Import NavigationProp
import { RootStackParamList } from '../../../types/types';  // Import or define your navigation types
import CustomPopUp from '../../components/CustomPopUp';
import { GoogleSignInButton } from '../../components/GoogleSignInButton';
import SubmitButton from '../../components/buttons/SubmitButton';
import { appStyles, ButtonDimensions } from '../../../styles/styles';


interface FormErrors {
  email?: string;
  password?: string;
}

export default function SignInScreen() {
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
      <View>{popup && (
      <Modal
      transparent={true}
      animationType="fade"
      visible={popup}
      onRequestClose={() => setPopup(false)}
      >
      < CustomPopUp
        testID="signInPopup"
        text = "An error occurred while signing in. Please make sure you are connected to the internet and that your email and password are correct."
        onPress = {() => setPopup(false)}
      />
      </Modal>)}</View>

      <Text style={[appStyles.screenHeader, { fontSize: 40 ,flex: 0, paddingBottom: '10%'}]}>Welcome back to Leazy</Text>
      
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
      <SubmitButton 
        disabled={false} 
        onPress={handleSignIn} 
        width={ButtonDimensions.largeButtonWidth} 
        height={ButtonDimensions.largeButtonHeight} 
        label="Sign in" 
        testID='signInButton'
        style={appStyles.submitButton}
        textStyle={appStyles.submitButtonText}
      />

      <Text style={styles.text}>or</Text>
      <GoogleSignInButton/>
      <View style={styles.horizontalLine} />
      <Text style={styles.text}>Don't have an account yet?</Text>
      
      <SubmitButton 
        disabled={false} 
        onPress={handleSignUpPress} 
        width={ButtonDimensions.largeButtonWidth} 
        height={ButtonDimensions.largeButtonHeight} 
        label="Sign up" 
        testID='SignUp'
        style={appStyles.submitButton}
        textStyle={appStyles.submitButtonText}
      />
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
    fontFamily: 'Inter Bold',  // Ensure Inter font is properly loaded in your project
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
  },
  socialIcon: {
    width: 24,
    height: 24,
    flexShrink: 0,
    marginRight: 8,
  },
});