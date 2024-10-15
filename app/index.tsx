import 'react-native-gesture-handler';
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
import { registerRootComponent } from 'expo'; // Ensures it works with Expo Go
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import CodeEntryScreen from './screens/CodeEntryScreen';
import CodeApprovedScreen from './screens/CodeApprovedScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="CodeEntry" component={CodeEntryScreen} />
        <Stack.Screen name="CodeApproved" component={CodeApprovedScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Register the main component
registerRootComponent(App);

//const Drawer = createDrawerNavigator();
//
//
//
//// Register the main component
//registerRootComponent(App);
//
//
//export default function App() {
//  return (
//    <NavigationContainer>
//      <Drawer.Navigator initialRouteName="Home" useLegacyImplementation = {false}>
//        <Drawer.Screen name="Sign-in" component={SignInScreen} />
//        <Drawer.Screen name="Sign-up" component={SignUpScreen} />
//        <Drawer.Screen name="Enter code" component={CodeEntryScreen} />
//      </Drawer.Navigator>
//    </NavigationContainer>
//  );
//}

// portions of this code were generated with chatGPT as an AI assistant

//const Drawer = createDrawerNavigator();
//
//
//
//// Register the main component
//registerRootComponent(App);
//
//
//export default function App() {
//  return (
//    <NavigationContainer>
//      <Drawer.Navigator initialRouteName="Home" useLegacyImplementation = {false}>
//        <Drawer.Screen name="Sign-in" component={SignInScreen} />
//        <Drawer.Screen name="Sign-up" component={SignUpScreen} />
//        <Drawer.Screen name="Enter code" component={CodeEntryScreen} />
//      </Drawer.Navigator>
//    </NavigationContainer>
//  );
//}