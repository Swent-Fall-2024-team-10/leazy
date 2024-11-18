import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { registerRootComponent } from "expo"; // Ensures it works with Expo Go
import { auth } from "../firebase/firebase";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PictureProvider } from "./context/PictureContext";
import { AuthProvider } from "./Navigators/AuthContext";
import { getUser, getTenant, getLandlord } from "@/firebase/firestore/firestore";
import { User } from "firebase/auth";
import  RootNavigator from "./Navigators/RootNavigator";

// portions of this code were generated with chatGPT as an AI assistant

const Stack = createNativeStackNavigator();

// Register the main component
registerRootComponent(App);

export default function App() {

  const [firebaseUser, setFirebaseUser] = useState<User | null>(auth.currentUser);
  useEffect(() => {
    // Firebase listener for authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  return (
    <AuthProvider
      fetchUser={getUser}
      fetchTenant={getTenant}
      fetchLandlord={getLandlord}
      firebaseUser={firebaseUser}
    >
      <PictureProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </PictureProvider>
    </AuthProvider>
  );
}
