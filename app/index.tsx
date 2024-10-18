import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomepageScreen from './screens/HomepageScreen';
import MyRentScreen from './screens/MyRentScreen';
import SharedElementsScreen from './screens/SharedElementsScreen';
import SubrentScreen from './screens/SubrentScreen';
import ReportScreen from './screens/ReportScreen';
import SettingsScreen from './screens/SettingsScreen';
import { registerRootComponent } from 'expo'; // Ensures it works with Expo Go
import auth from '@react-native-firebase/auth';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import CodeEntryScreen from './screens/CodeEntryScreen';
import CodeApprovedScreen from './screens/CodeApprovedScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListIssueScreen from './screens/ListIssueScreen';
import IssueDetailsScreen from './screens/IssueDetailsScreen';
import Chat from './screens/MessagingScreen';

// portions of this code were generated with chatGPT as an AI assistant

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Register the main component
registerRootComponent(App);


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // To handle the loading state while we check auth

  useEffect(() => {
    // Firebase listener for authentication state
    const unsubscribe = auth().onAuthStateChanged(user => {
      setIsLoggedIn(!!user); // If user is not null, set as logged in
      setLoading(false);     // Set loading to false once we have the auth status
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  if (loading) {
    // You could return a loading spinner here while Firebase checks the auth state
    return null; 
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <RootNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
}

const HomeDrawerNavigator = () => {
  return (
      <Drawer.Navigator initialRouteName="Home" useLegacyImplementation = {false} screenOptions={{
          headerShown: false, // This hides the default header
        }}>
        <Drawer.Screen name="Home" component={HomepageScreen} />
        <Drawer.Screen name="ListIssues" component={ListIssueScreen} />
        <Drawer.Screen name="My Rent" component={MyRentScreen} />
        <Drawer.Screen name="Shared elements" component={SharedElementsScreen} />
        <Drawer.Screen name="Subrent" component={SubrentScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
      );
    };

    // Stack Navigator that contains the drawer and other screens
const RootNavigator = () => {
  return (
    <Stack.Navigator>
      {/* Drawer is nested here */}
      <Stack.Screen name="HomeDrawer" component={HomeDrawerNavigator} options={{ headerShown: false }} />
      
      {/* Additional screens that should not appear in the drawer */}
      <Stack.Screen name="IssueDetails" component={IssueDetailsScreen} />
      <Stack.Screen name="Report" component={ReportScreen} />
      <Stack.Screen name="Messaging" component={Chat} />
    </Stack.Navigator>
  );
};

    const AuthStackNavigator = () => {
      return (
        <Stack.Navigator initialRouteName="SignIn">
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="CodeEntry" component={CodeEntryScreen} />
          <Stack.Screen name="CodeApproved" component={CodeApprovedScreen} />
        </Stack.Navigator>
      );
    };
    