import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import App from '../index'; // Make sure this points to your `index.tsx` where App is exported

// Mocking navigation functions and dependencies
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      dispatch: jest.fn(),
      goBack: jest.fn(),
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
  it('renders drawer items and navigates correctly', async () => {
    const { getByText, findByText } = render(<App />);

    // Step 1: Verify the presence of initial drawer items by their labels
    expect(getByText('Home')).toBeTruthy();
    expect(getByText('Maintenance Requests')).toBeTruthy();
    expect(getByText('My Rent')).toBeTruthy();
    expect(getByText('Shared elements')).toBeTruthy();
    expect(getByText('Subrent')).toBeTruthy();
    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('Washing Machines')).toBeTruthy();

    // Step 2: Simulate navigation to each screen and verify the content
    fireEvent.press(getByText('My Rent'));
    expect(await findByText('Here is your rent information')).toBeTruthy();

    fireEvent.press(getByText('Maintenance Requests'));
    expect(await findByText('List of maintenance issues')).toBeTruthy();

    fireEvent.press(getByText('Report'));
    expect(await findByText('Report an issue')).toBeTruthy();

    fireEvent.press(getByText('Shared elements'));
    expect(await findByText('Shared Elements Screen')).toBeTruthy();

    fireEvent.press(getByText('Subrent'));
    expect(await findByText('Subrent Screen')).toBeTruthy();

    fireEvent.press(getByText('Settings'));
    expect(await findByText('Settings Screen')).toBeTruthy();

    fireEvent.press(getByText('Washing Machines'));
    expect(await findByText('Washing Machine Screen')).toBeTruthy();

    fireEvent.press(getByText('Manage Washing Machine'));
    expect(await findByText('Manage Machines Screen')).toBeTruthy();
  });
});
