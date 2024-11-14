// this code is from the react navigation Testing with Jest tutorial

// include this line for mocking react-native-gesture-handler
import 'react-native-gesture-handler/jestSetup';

import '@testing-library/jest-native/extend-expect';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-auth-session/providers/google
jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(() => [
    {}, // Mocked authRequest object
    {}, // Mocked authResponse object
    jest.fn(), // Mocked promptAsync function
  ]),
  makeRedirectUri: jest.fn(() => 'http://localhost'), // Mocked redirect URI function
}));

// include this section and the NativeAnimatedHelper section for mocking react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};

  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');