import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../components/Header';

// portions of this code were generated with chatGPT as an AI assistant

export default function SharedElementsScreen() {
  return (
    <Header showMenu={false}>
      <View style={styles.container}>
        <Text style={styles.text}>Shared Elements Screen</Text>
        <Text style={styles.subText}>Here we can display shared resources, schedules, etc.</Text>
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
