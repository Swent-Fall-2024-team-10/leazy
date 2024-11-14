import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect } from 'react'
import * as Google from 'expo-auth-session/providers/google'
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth"
import { auth } from "../../firebase/firebase"
import { getUser } from '@/firebase/firestore/firestore'
import { useAuth } from '../Navigators/AuthContext'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/types'

export const GoogleSignInButton = () => {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const {user} = useAuth();
 
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
          if(user == null) {
            navigation.navigate("SignUp" as never);
          }  
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
       <Ionicons
         name="logo-google"
         size={30}
         color="black"
         style={styles.icon}
       />
       <Text style={styles.buttonText}>
         Continue with Google
       </Text>
     </View>
   </TouchableOpacity>
 )
}

const styles = StyleSheet.create({
 buttonGoogle: {
   width: '100%',
   padding: '4%',
   backgroundColor: '#ffffff',
   borderRadius: 8,
   borderWidth: 1,
   borderColor: '#dadce0',
   marginVertical: 8,
   elevation: 2,
   shadowColor: '#000',
   shadowOffset: {
     width: 0,
     height: 2,
   },
   shadowOpacity: 0.1,
   shadowRadius: 2,
 },
 
 buttonPlaceholder: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
 },
 icon: {
   marginRight: 12,
 },
 buttonText: {
   color: '#3c4043',
   fontSize: 16,
   textAlign: 'center',
   fontWeight: '600',
 },
});