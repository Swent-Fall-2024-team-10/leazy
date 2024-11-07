import React from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';  // Import icons for back arrow
import { RootStackParamList, AuthStackParamList } from '@/types/types';  // Import or define your navigation types
import { Color } from '@/styles/styles';  // Import your color styles
import { auth } from '../../../firebase/firebase';  // Import Firebase auth
import Header from '../../components/Header';
// portions of this code were generated with chatGPT as an AI assistant

export default function SettingsScreen() {
  const navigation = useNavigation();  // Initialize navigation

  return (
    <Header>
      <View style={styles.container}>
        <Text style={styles.text}>Settings Screen</Text>
        
        <TouchableOpacity onPress={ () => auth.signOut()} style={styles.signOutButton}>
          <Text>Sign Out</Text>
        </TouchableOpacity>

        {/* Settings screen content */}
        <Text style={styles.subText}>This will hold app settings.</Text>
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

  signOutButton: {
    backgroundColor: Color.ButtonBackground,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
});

