import {  Text, 
          View, 
          SafeAreaView, 
          StyleSheet, 
          Pressable, 
        } from "react-native";
import { 
          Gesture 
        } from "react-native-gesture-handler/lib/typescript/handlers/gestures/gesture";
import {  UserType, 
          emailAndPasswordLogIn, 
          emailAndPasswordSignIn, 
          googleSignIn, 
          GoogleLogIn, 
          updateUserEmail, 
          resetUserPassword, 
          signOutUser, 
          deleteAccount 
        } from "@/firebase/auth/auth";
import {auth} from "../../firebase/firebase";
import { useEffect, useState } from "react";
import {User} from "firebase/auth";

export function AuthTestScreen() {
  const [user, setUser] = useState<User | null>(null)
  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return user ? authUserFunctions() : unAuthUserFunctions();
}

function unAuthUserFunctions() {
  return (
    <SafeAreaView style={styles.safeAreaProvider}>
      <View style={styles.mainView}>  

      <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
        <Text style={styles.text}>
          Email and Password Log In
        </Text>
      </Pressable>
      <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
        <Text style={styles.text}>
          Email and Password Sign In
        </Text>
      </Pressable>
      <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
        <Text style={styles.text}>
          Google Sign In
        </Text>
      </Pressable>
      <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
        <Text style={styles.text}>
          Google Log In
        </Text>
      </Pressable>
      </View>
    </SafeAreaView>
  )
}

function authUserFunctions() {
  return(<SafeAreaView style={styles.safeAreaProvider}>
    <View style={styles.mainView}>  
    <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
      <Text style={styles.text}>
        Update User Email
      </Text>
    </Pressable>
    <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
      <Text style={styles.text}>
        Reset User Password
      </Text>
    </Pressable>
    <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
      <Text style={styles.text}>
        Sign Out User
      </Text>
    </Pressable>
    <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
      <Text style={styles.text}>
        Delete Account
      </Text>
    </Pressable>

    </View>
  </SafeAreaView>
  )
}

function screen() {
  return (
    <SafeAreaView style={styles.safeAreaProvider}>
      <View style={styles.mainView}>  

      <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
        <Text style={styles.text}>
          Email and Password Log In
        </Text>
      </Pressable>
      <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
        <Text style={styles.text}>
          Email and Password Sign In
        </Text>
      </Pressable>
      <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
        <Text style={styles.text}>
          Google Sign In
        </Text>
      </Pressable>
      <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
        <Text style={styles.text}>
          Google Log In
        </Text>
      </Pressable>
      <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
        <Text style={styles.text}>
          Update User Email
        </Text>
      </Pressable>
      <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
        <Text style={styles.text}>
          Reset User Password
        </Text>
      </Pressable>
      <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
        <Text style={styles.text}>
          Sign Out User
        </Text>
      </Pressable>
      <Pressable style={({pressed}) => [styles.button, {opacity: pressed ? 0.5 : 1}]}>
        <Text style={styles.text}>
          Delete Account
        </Text>
      </Pressable>

      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
    margin: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  mainView: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  safeAreaProvider:{
    flex: 1,
    alignContent: "center",
    justifyContent: "center",
  }
});