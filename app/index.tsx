import React from 'react';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';
import SignUpScreen from './screens/SignUpScreen';
import SignInScreen from './screens/SignInScreen';

const Home = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Hello, World!</Text>
      <Text>This is a simple Expo Router setup with some text.</Text>
    </View>
  );
};

export default function App() {
  return (
    <>
      <Stack />
      <SignInScreen/>
    </>
  );
}
