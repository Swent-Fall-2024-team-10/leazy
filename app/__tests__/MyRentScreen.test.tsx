// app/__tests__/MyRentScreen.test.tsx

import React from 'react';
import { render } from '@testing-library/react-native';
import MyRentScreen from '../screens/tenant/MyRentScreen';
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

describe('MyRentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<MyRentScreen />);

    expect(getByText('Here is your rent information')).toBeTruthy();
    expect(getByText('Expire the: 04/10/24')).toBeTruthy();
    expect(getByText('Tenant infos')).toBeTruthy();
    expect(getByText('Guarantor')).toBeTruthy();
    expect(getByText('Pay your rent / unpaid yet')).toBeTruthy();
  });
});
