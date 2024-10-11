import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// portions of this code were generated with chatGPT as an AI assistant

export default function SharedElementsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Shared Elements Screen</Text>
      <Text style={styles.subText}>Here we can display shared resources, schedules, etc.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d3d3d3',
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
