import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons'; // Ensure you have this library installed
import { appStyles } from '../../../styles/styles';

// Part of this code was generated with chatGPT as an AI assistant

export default function CustomDrawerContent(props: any){
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.headerContainer} testID='header-container'>

        <TouchableOpacity style={styles.settingsIcon} 
        onPress={() => props.navigation.navigate('Settings')}
        testID='settings-button'>
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={appStyles.appHeader}>Leazy</Text>
      </View>
      <View style={styles.paddingBelowTitle} />
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginTop: '8%',
    padding : '5%',
  },
  settingsIcon: {
    position: 'absolute',
    left: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  paddingBelowTitle: {
    height: 10, // Adjust as needed for spacing
  },
});

