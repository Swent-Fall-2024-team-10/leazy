
import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomepageScreen from "./screens/HomepageScreen";
import MyRentScreen from "./screens/MyRentScreen";
import SharedElementsScreen from "./screens/SharedElementsScreen";
import SubrentScreen from "./screens/SubrentScreen";
import ReportScreen from "./screens/ReportScreen";
import SettingsScreen from "./screens/SettingsScreen";

import { registerRootComponent } from "expo"; // Ensures it works with Expo Go

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomepageScreen from './screens/HomepageScreen';
import MyRentScreen from './screens/MyRentScreen';
import SharedElementsScreen from './screens/SharedElementsScreen';
import SubrentScreen from './screens/SubrentScreen';
import ReportScreen from './screens/ReportScreen';
import SettingsScreen from './screens/SettingsScreen';
import IssueDetailsScreen from './screens/IssueDetailsScreen';
import ListIssueScreen from './screens/ListIssueScreen';
import MessagingScreen from "./screens/MessagingScreen";
import { registerRootComponent } from 'expo'; // Ensures it works with Expo Go


import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import CodeEntryScreen from './screens/CodeEntryScreen';
import CodeApprovedScreen from './screens/CodeApprovedScreen';
import CameraScreen from './screens/CameraScreen';
import CapturedMediaScreen from './screens/CapturedMediaScreen';


// portions of this code were generated with chatGPT as an AI assistant

const Stack = createNativeStackNavigator();


// Register the main component
registerRootComponent(App);

export default function App() {
  // Line added for testing camera
  return (
    <NavigationContainer>


      <Drawer.Navigator initialRouteName="Home" useLegacyImplementation = {false} screenOptions={{
          headerShown: false, // This hides the default header
        }}>
        <Drawer.Screen name="Home" component={HomepageScreen} />
        <Drawer.Screen name="My Rent" component={MyRentScreen} />
        <Drawer.Screen name="Report" component={ListIssueScreen} />
        <Drawer.Screen name="Shared elements" component={SharedElementsScreen} />
        <Drawer.Screen name="Subrent" component={SubrentScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
        <Drawer.Screen name="(Temp) Messaging" component={MessagingScreen} />
      </Drawer.Navigator>

      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="CodeEntry" component={CodeEntryScreen} />
        <Stack.Screen name="CodeApproved" component={CodeApprovedScreen} />
      </Stack.Navigator>

    </NavigationContainer>

  );
}