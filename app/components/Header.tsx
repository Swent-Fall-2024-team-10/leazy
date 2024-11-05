import React, { PropsWithChildren } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../../types/types';
import {Menu, User } from 'react-native-feather';
import { Color } from '@/styles/styles';
// portions of this code were generated with chatGPT as an AI assistant

// Get screen width and height
const { height } = Dimensions.get('window');

const Header: React.FC<PropsWithChildren<{}>> = ({children}) => {
    const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
    return(
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Menu stroke="#0f5257" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Leazy</Text>
                <User stroke="#0f5257" />
            </View>
            {/* Content Rendered On Top of Background */}
            <View style={styles.contentContainer}>
              <View style={styles.whiteBackground}>
                {children}
            </View>
            </View>
            
            
        </SafeAreaView>
    )
}

export default Header;

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: Color.HeaderBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e9d5ff',
    marginTop: '8%',
    padding: '5%',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 7.6,
    fontFamily: "Inter-Bold",
    color: "#0f5257",
  },
  whiteBackground: {
    width: '100%',
    position: 'absolute',
    backgroundColor: '#fff',
    marginHorizontal: 0,
    marginVertical: 0,
    borderTopLeftRadius: 32, // Only round the top corners
    borderTopRightRadius: 32, // Only round the top corners
    height: height * 1.2,
    // Add black border
    borderColor: '#0f5257',
    borderWidth: 0.5,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,

    // Shadow for Android
    elevation: 5,
  },
  contentContainer: {
    flex: 1,              // Takes up the remaining space
    //padding: 16,          // Padding for your content
  }
})