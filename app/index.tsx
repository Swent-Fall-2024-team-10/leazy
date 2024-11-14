import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { registerRootComponent } from "expo"; // Ensures it works with Expo Go
import { auth } from "../firebase/firebase";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PictureProvider } from "./context/PictureContext";
import {
  ReportScreen,
  ListIssueScreen,
  IssueDetailsScreen,
} from "./screens/issues_tenant";
import AuthNavigator  from "./Navigators/AuthStackNavigator"; 
import { CameraScreen, CapturedMediaScreen } from "./screens/camera";
import { MessagingScreen } from "./screens/messaging";
import CustomDrawerContent from "@/app/components/drawer/CustomDrawer";
import CreateNewCode from "./screens/landlord/CreateNewCode";
import WashingMachineScreen from "./screens/laundry_machines/WashingMachineScreen";
import ManageMachinesScreen from "./screens/laundry_machines/ManageMachinesScreen";
import LandlordFormScreen from "./screens/auth/LandlordFormScreen";
import { AuthProvider } from "./Navigators/AuthContext";
import { getUser, getTenant, getLandlord } from "@/firebase/firestore/firestore";
import { User } from "firebase/auth";
import  RootNavigator from "./Navigators/RootNavigator";
import TenantHomeDrawerNavigator from "./Navigators/TenantHomeDrawerNavigator";

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