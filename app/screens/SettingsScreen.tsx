import React from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';  // Import icons for back arrow
import { RootStackParamList, AuthStackParamList } from '../../types/types';  // Import or define your navigation types
import { auth } from '../../firebase/firebase';  // Import Firebase auth
// portions of this code were generated with chatGPT as an AI assistant

export default function SettingsScreen() {
  const navigation = useNavigation();  // Initialize navigation

  return (
    <View style={styles.container}>
      {/* Custom Back Button at the top */}
      <TouchableOpacity testID='go-back-button' style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={ () => auth.signOut()}>
        <Text>Sign Out</Text>
      </TouchableOpacity>

      {/* Settings screen content */}
      <Text style={styles.text}>Settings Screen</Text>
      <Text style={styles.subText}>This will hold app settings.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 40,
    left: 20,
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: 'black',
  },
});

