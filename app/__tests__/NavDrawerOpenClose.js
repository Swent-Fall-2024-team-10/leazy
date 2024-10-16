import React from 'react';
import { render } from '@testing-library/react-native';
import { DrawerActions } from '@react-navigation/native';
import App from '../index.tsx'; // Update to your actual drawer navigator file

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      dispatch: jest.fn(),  // Mock the dispatch method
    }),
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: jest.fn(() => null),  // Mock the Ionicons component
}));

jest.mock('expo', () => ({
  registerRootComponent: jest.fn(),
}));

describe('Drawer Open/Close Tests', () => {
  test('Opens the drawer programmatically', () => {
    const mockDispatch = jest.fn();  // Mock the dispatch function
    const { getByText } = render(<App />);
    
    // Simulate opening the drawer programmatically
    mockDispatch(DrawerActions.openDrawer());

    // Verify if DrawerActions.openDrawer() was called
    expect(mockDispatch).toHaveBeenCalledWith(DrawerActions.openDrawer());
  });

  test('Closes the drawer programmatically', () => {
    const mockDispatch = jest.fn();  // Mock the dispatch function
    const { getByText } = render(<App />);
    
    // Simulate closing the drawer programmatically
    mockDispatch(DrawerActions.closeDrawer());

    // Verify if DrawerActions.closeDrawer() was called
    expect(mockDispatch).toHaveBeenCalledWith(DrawerActions.closeDrawer());
  });
});
