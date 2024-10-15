import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import CustomTextField from '@/components/CustomTextField';
import CustomButton from '@/components/CustomButton';

const VALID_CODE = '1234';

export default function CodeEntryScreen() {
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    const isValidCode = code === VALID_CODE;
    const route = isValidCode ? '/screens/CodeApprovedScreen' : '/screens/CodeRejectedScreen';
    
    console.log(`Code is ${isValidCode ? 'valid' : 'invalid'}`);
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Leazy</Text>
      <Text style={styles.text}>Do you already have a code?</Text>
      <CustomTextField
        placeholder="Enter code"
        value={code}
        onChangeText={setCode}
      />
      <CustomButton size="medium" onPress={handleSubmit} title="Submit code"/>
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
});