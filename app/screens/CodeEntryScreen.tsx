import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import CustomTextField from '@/app/components/CustomTextField';
import CustomButton from '@/app/components/CustomButton';
import { useNavigation, NavigationProp } from '@react-navigation/native'; // Import NavigationProp
import { RootStackParamList } from '../../types/types';  // Import or define your navigation types

const VALID_CODE = '1234';

interface FormErrors {
  code?: string;
}

export default function CodeEntryScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): FormErrors => {
    let newErrors: FormErrors = {};
    if (code != VALID_CODE) newErrors.code= 'This code does not exist or has expired';
    return newErrors;
  };

  const handleSubmit = () => {
    const formErrors = validateForm();
    const isValidCode = code === VALID_CODE;
    // console.log(`Code is ${isValidCode ? 'valid' : 'invalid'}`);

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    navigation.navigate('CodeApproved' as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Leazy</Text>
      <Text style={styles.text}>Do you already have a code?</Text>
      <CustomTextField
        placeholder="Enter code"
        value={code}
        onChangeText={setCode}
        testID='testCodeInput'
      />
      <CustomButton 
      size="medium" 
      onPress={handleSubmit} 
      title="Submit code"
      testID='testSubmitButton'
      />
      {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
      <Text style={styles.text}>
        If you don't have a code please ask your residence manager to generate one for you.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  errorText: {
    color: '#FF0004',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 16,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.16,
    marginBottom: 20,
    marginTop: 20,
    width: 186
  },
});