// this code is from the react navigation Testing with Jest tutorial

// include this line for mocking react-native-gesture-handler
import "react-native-gesture-handler/jestSetup";

// include this section and the NativeAnimatedHelper section for mocking react-native-reanimated
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};

  return Reanimated;
});

jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  memoryLocalCache: jest.fn(),
  initializeFirestore: jest.fn(),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);


// Use manual mocks for Firebase
jest.mock("firebase/app");
jest.mock("firebase/firestore");
jest.mock("firebase/auth");
jest.mock("firebase/storage");


// Mock GiftedChat
jest.mock('react-native-gifted-chat', () => ({
  GiftedChat: 'GiftedChat',
  Bubble: 'Bubble',
  Composer: 'Composer',
}));

// MOck netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  useNetInfo: jest.fn(() => ({ isConnected: true }))
}));


