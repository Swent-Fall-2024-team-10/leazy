// app/__tests__/SettingsScreen.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../../../screens/tenant/SettingsScreen';
import '@testing-library/jest-native/extend-expect';

// Mock the navigation
const mockNavigate = jest.fn();
const mockOpenDrawer = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      openDrawer: mockOpenDrawer,
    }),
  };
});

// Mock Firebase auth
jest.mock('../../../../firebase/firebase', () => ({
  auth: {
    signOut: jest.fn(),
  },
}));

import { auth } from '../../../../firebase/firebase';

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByTestId } = render(<SettingsScreen />);

    expect(getByText('Settings Screen')).toBeTruthy();
    expect(getByText('Sign Out')).toBeTruthy();
    expect(getByText('This will hold app settings.')).toBeTruthy();
  });

  it('calls auth.signOut when Sign Out button is pressed', () => {
    const { getByTestId } = render(<SettingsScreen />);

    const signOutButton = getByTestId('touchableOpac');
    fireEvent.press(signOutButton);

    expect(auth.signOut).toHaveBeenCalled();
  });
});
