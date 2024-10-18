import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomepageScreen from './screens/HomepageScreen';
import MyRentScreen from './screens/MyRentScreen';
import SharedElementsScreen from './screens/SharedElementsScreen';
import SubrentScreen from './screens/SubrentScreen';
import ReportScreen from './screens/ReportScreen';
import SettingsScreen from './screens/SettingsScreen';
import { registerRootComponent } from 'expo'; // Ensures it works with Expo Go
import ListIssueScreen from './screens/ListIssueScreen';
import IssueDetailsScreen from './screens/IssueDetailsScreen';
import Chat from './screens/MessagingScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Register the main component
registerRootComponent(App);

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

// Drawer Navigator for the home screen and other sections
const HomeDrawerNavigator = () => {
  return (
    <Drawer.Navigator initialRouteName="Home" screenOptions={{
        headerShown: false, // Hide the default header
      }}>
      <Drawer.Screen name="Home" component={HomepageScreen} />
      <Drawer.Screen name="ListIssues" component={ListIssueScreen} />
      <Drawer.Screen name="My Rent" component={MyRentScreen} />
      <Drawer.Screen name="Shared elements" component={SharedElementsScreen} />
      <Drawer.Screen name="Subrent" component={SubrentScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Report" component={ReportScreen} />
    </Drawer.Navigator>
  );
};

// Stack Navigator for additional screens (including ReportScreen)
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
