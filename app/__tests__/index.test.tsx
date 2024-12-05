import React from 'react';
import { render, act } from '@testing-library/react-native';
import App from '../index';
import { auth } from '../../firebase/firebase';

// Mock all the required dependencies
jest.mock('react-native-gesture-handler', () => ({}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Screen: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }),
}));

jest.mock('expo', () => ({
  registerRootComponent: (component: any) => component,
}));

jest.mock('../../firebase/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: jest.fn((callback) => {
      callback(null);
      return jest.fn(); // unsubscribe function
    }),
  },
}));

jest.mock('../../firebase/firestore/firestore', () => ({
  getUser: jest.fn(),
  getTenant: jest.fn(),
  getLandlord: jest.fn(),
}));

jest.mock('../Navigators/RootNavigator', () => 'RootNavigator');

jest.mock('../context/PictureContext', () => ({
  PictureProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock createNativeStackNavigator result
const Stack = {
  Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Screen: ({ children }: { children: React.ReactNode }) => <>{children}</>,
};

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => Stack,
}));

describe('App', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });

  it('sets up firebase auth listener on mount', () => {
    render(<App />);
    expect(auth.onAuthStateChanged).toHaveBeenCalled();
  });

  it('cleans up auth listener on unmount', () => {
    const mockUnsubscribe = jest.fn();
    (auth.onAuthStateChanged as jest.Mock).mockReturnValue(mockUnsubscribe);

    const { unmount } = render(<App />);
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

});