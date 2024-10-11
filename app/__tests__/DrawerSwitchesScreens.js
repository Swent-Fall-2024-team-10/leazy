import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import App from '../index.tsx';

// portions of this code were generated with chatGPT as an AI assistant

// partial mock of the navigation for useNavigation (other parts are the implemented logic)
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      dispatch: jest.fn(),
      navigate: jest.fn(),
    }),
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: jest.fn(() => null),
}));

jest.mock('expo', () => ({
  registerRootComponent: jest.fn(),
}));

describe('Drawer Navigation Tests', () => {
  test('Navigates to all screens in the drawer', () => {
    const { getByText } = render(
        <App />
    );

    // Simulate navigation to "My Rent" screen
    fireEvent.press(getByText('My Rent'));
    expect(getByText('Here is your rent information')).toBeTruthy();

    // Simulate navigation to "Report" screen
    fireEvent.press(getByText('Report'));
    expect(getByText('Report an issue')).toBeTruthy();

    // Simulate navigation to "Shared elements" screen
    fireEvent.press(getByText('Shared elements'));
    expect(getByText('Shared Elements Screen')).toBeTruthy();

    // Simulate navigation to "Subrent" screen
    fireEvent.press(getByText('Subrent'));
    expect(getByText('Subrent Screen')).toBeTruthy();

    // Simulate navigation to "Settings" screen
    fireEvent.press(getByText('Settings'));
    expect(getByText('Settings Screen')).toBeTruthy();
  });
});

