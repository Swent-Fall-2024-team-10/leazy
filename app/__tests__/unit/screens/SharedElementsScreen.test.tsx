// app/__tests__/SharedElementsScreen.test.tsx

import React from 'react';
import { render } from '@testing-library/react-native';
import SharedElementsScreen from '../../../screens/tenant/SharedElementsScreen';
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

describe('SharedElementsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<SharedElementsScreen />);

    expect(getByText('Shared Elements Screen')).toBeTruthy();
    expect(getByText('Here we can display shared resources, schedules, etc.')).toBeTruthy();
  });
});
