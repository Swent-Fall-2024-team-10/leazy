import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '../../components/Header';
import { appStyles } from '@/styles/styles';
// portions of this code were generated with chatGPT as an AI assistant

export default function MyRentScreen() {
  return (
    <Header>
      <View style={appStyles.screenContainer}>
        <Text style={styles.header}>Here is your rent information</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Expire the: 04/10/24</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Tenant infos</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Guarantor</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Pay your rent / unpaid yet</Text>
        </View>
      </View>
    </Header>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3d3d3',
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
