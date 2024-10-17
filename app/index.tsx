import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
    <Stack.Navigator initialRouteName="Camera">
      <Stack.Screen 
        name="Camera" 
        component={CameraScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CapturedMedia" 
        component={CapturedMediaScreen} 
        options={{ headerTransparent: true, headerTitle: '' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
  );
}

