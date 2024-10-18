import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { createDrawerNavigator } from '@react-navigation/drawer';
import HomepageScreen from './screens/HomepageScreen';
import MyRentScreen from './screens/MyRentScreen';
import SharedElementsScreen from './screens/SharedElementsScreen';
import SubrentScreen from './screens/SubrentScreen';
import ReportScreen from './screens/ReportScreen';
import SettingsScreen from './screens/SettingsScreen';
import IssueDetailsScreen from './screens/IssueDetailsScreen';
import ListIssueScreen from './screens/ListIssueScreen';

import { registerRootComponent } from 'expo'; // Ensures it works with Expo Go


import CameraScreen from './screens/CameraScreen';
import CapturedMediaScreen from './screens/CapturedMediaScreen';

import { registerRootComponent } from 'expo'; // Ensure you import this

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
      </Drawer.Navigator>
    </NavigationContainer>

  );
}
