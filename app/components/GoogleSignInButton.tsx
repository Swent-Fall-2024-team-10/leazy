import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect } from 'react'
import * as Google from 'expo-auth-session/providers/google'
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth"
import { auth } from "../../firebase/firebase"
import { getUser } from '@/firebase/firestore/firestore'
import { Navigation } from 'react-native-feather'
import { useNavigation, NavigationProp } from '@react-navigation/native'
import { RootStackParamList } from '@/types/types'
import { Color, FontSizes, FontWeight } from '@/styles/styles'


export const GoogleSignInButton = () => {
 const [request, response, promptAsync] = Google.useAuthRequest({
   iosClientId: "667437973264-v9qb9v4h2j4gdkonbrmtobjsrmpod5jo.apps.googleusercontent.com",
   androidClientId: "667437973264-18bgkii41onl7qtfeuk42efhf1660rgq.apps.googleusercontent.com",
 })

 useEffect(() => {
   if (response?.type === "success") {
     const { id_token } = response.params
     const credential = GoogleAuthProvider.credential(id_token)
     signInWithCredential(auth, credential)
       .then((userCredential) => {
          console.log(userCredential)
       })
       .catch((error) => {
         alert("An error occurred while signing in with Google." + error.message)
       })
   }
 }, [response])

 return (
   <TouchableOpacity 
     testID="google-sign-in-button" 
     style={styles.buttonGoogle} 
     onPress={() => promptAsync()} 
     disabled={!request}
   >
     <View style={styles.buttonPlaceholder}>
       <Image
          source={require('../../assets//images/auth/google_logo.png')}
          style={styles.icon}
       />
       <Text style={styles.buttonText}>
         Sign in with Google
       </Text>
     </View>
   </TouchableOpacity>
 )
}

const styles = StyleSheet.create({
  buttonGoogle: {
    width: '70%',
    padding: 12,  // Adjust padding to fit the Figma design
    backgroundColor: Color.ButtonBackground,  // Use the button color from Figma
    borderColor: Color.ButtonBorder,  // Use the border color from Figma
    borderRadius: 100,
    borderWidth: 0,  // No border if Figma design doesn't include it
    marginVertical: 8,
    elevation: 3,  // Slight elevation for shadow
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  buttonPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    height: 27,  // Adjust icon size to fit the Figma design
    width: 27,  // Adjust icon size to fit the Figma design
    marginRight: 18,  // Slightly tighter space between icon and text
  },
  buttonText: {
    color: Color.ButtonText,  // White text for contrast on dark background
    fontSize: FontSizes.ButtonText,  // Use the button text size from Figma
    fontWeight: '500',  // Use the button text weight from Figma
    textAlign: 'center',
  },
});
