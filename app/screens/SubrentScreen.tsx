import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../components/Header';

// portions of this code were generated with chatGPT as an AI assistant

export default function SubrentScreen() {
  return (
    <Header>
      <View style={styles.container}>
        <Text style={styles.text}>Subrent Screen</Text>
        <Text style={styles.subText}>This will display subrent-related information.</Text>
      </View>
    </Header>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
