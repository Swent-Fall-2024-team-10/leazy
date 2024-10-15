import CustomButton from '@/components/CustomButton';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CodeApprovedScreen({ onNext }: { onNext: () => void }) {
  const address = "18 Chemin de Renens, 1004 Lausanne";

  return (
    <View style={styles.container}>
      <Text style={styles.approvedText}>Code approved!</Text>
      <Text style={styles.text}>
        Welcome to {'\n'}{address}!
      </Text>
      <CustomButton size="medium" onPress={onNext} title="Next"/>
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
  approvedText: {
    color: '#3AB700',
    textAlign: 'center',
    fontFamily: 'Inter',    // Ensure Inter font is linked to the project
    fontSize: 40,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 48,         // React Native requires an explicit value, 48 is a suggested value
    letterSpacing: 0.4,
    marginBottom: 23,
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
  }
});