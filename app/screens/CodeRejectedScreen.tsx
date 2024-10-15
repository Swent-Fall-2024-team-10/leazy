import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import CustomTextField from '../../components/CustomTextField';
import CustomButton from '@/components/CustomButton';


export default function CodeRejectedScreen() {
  const [code, setCode] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
        if (code === '1234') {
            router.push('/screens/CodeApprovedScreen');
            console.log('Code is valid');
        }
        else {
            router.push('/screens/CodeRejectedScreen');
            console.log('Code is invalid');
        }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invalid Code</Text>
      <Text style={styles.text}>
        The code you entered is not valid. Please try again.
      </Text>
      <CustomTextField placeholder="Enter code" value={code} onChangeText={setCode} />
      <CustomButton size="medium" onPress={handleSubmit} title="Submit code"/>
      <Text style={styles.text}>
        If the issue persists, please contact your property manager.
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
    textAlign: 'center',
    fontFamily: 'Inter',    // Ensure Inter font is linked to the project
    fontSize: 40,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 48,         // React Native requires an explicit value, 48 is a suggested value
    letterSpacing: 0.4,
    marginBottom: 23,
    color: '#FF0004',
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
    marginBottom: 30,
  },
});