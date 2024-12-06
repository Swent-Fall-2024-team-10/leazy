// app/__tests__/HomepageScreen.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomepageScreen from '../../../screens/tenant/HomepageScreen';
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

// Since the Header component may use useNavigation as well, this mock will cover it.

describe('HomepageScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<HomepageScreen />);

    expect(getByText("Here’s what’s new")).toBeTruthy();
    expect(getByText("News from the landlord to the tenants")).toBeTruthy();
    expect(getByText("Go to Settings")).toBeTruthy();
  });

  it('navigates to Settings screen when button is pressed', () => {
    const { getByText } = render(<HomepageScreen />);

    const settingsButton = getByText("Go to Settings");
    fireEvent.press(settingsButton);

    expect(mockNavigate).toHaveBeenCalledWith("Settings");
  });
});
