import React, { useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Alert } from 'react-native';
import CustomTextField from '@/components/CustomTextField';
import CustomButton from '@/components/CustomButton';
import CustomPicker from '@/components/CustomPicker';
import { UserType } from '@/firebase/auth/auth';
import { emailAndPasswordSignIn } from '@/firebase/auth/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native'; // Import NavigationProp
import { RootStackParamList } from '../../types/types';  // Import or define your navigation types


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

  const validateForm = (): FormErrors => {
    let newErrors: FormErrors = {};
    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    // TODO can add password validation rules
    //else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSignUpPress = () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // Simulate successful registration
    emailAndPasswordSignIn(email, password, userType, { firstName, lastName }).then((user) => {
      if (user) {
        Alert.alert('Success', 'You have successfully registered!');
        console.log("User signed up:", user);
        navigation.navigate('CodeEntry');
      } else {
        console.log("Sign up failed");
      }
    });    
  };

  const handleGoogleSignUp = () => {
    Alert.alert('Google Sign Up', 'Google Sign Up functionality would be implemented here.');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Leazy</Text>
        <Text style={styles.text}>Are you renting or the manager of a property?</Text>
        
        <CustomPicker
          selectedValue={userType}
          onValueChange={(itemValue) => setUserType(itemValue)}
        />
        <Text style={styles.text}>Please enter your personal info</Text>
        
        <CustomTextField
          placeholder="First name"
          value={firstName}
          onChangeText={setFirstName}
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
        
        <CustomTextField
          placeholder="Last name"
          value={lastName}
          onChangeText={setLastName}
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

        <Text style={styles.text}>And choose an email and password</Text>

        <CustomTextField
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        
        <CustomTextField
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        
        <CustomTextField
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

        <CustomButton size="small" onPress={handleSignUpPress} title= "Sign up"/>

        <Text style={styles.text}>or</Text>

        <CustomButton 
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