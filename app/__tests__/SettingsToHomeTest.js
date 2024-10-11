// SettingsScreen.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../screens/SettingsScreen';
import { useNavigation } from '@react-navigation/native';

// portions of this code were generated with chatGPT as an AI assistant

// Mock the `useNavigation` hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));


jest.mock('@expo/vector-icons', () => ({
  Ionicons: jest.fn(() => null),  // Mock the Ionicons component
}));

describe('SettingsScreen navigation test', () => {
  it('goes back to the previous screen when the back button is pressed', () => {
    // Mock the goBack function
    const mockGoBack = jest.fn();
    useNavigation.mockReturnValue({ goBack: mockGoBack });

    // Render the SettingsScreen
    const { getByText } = render(<SettingsScreen />);

    // Find the back button by its text (Back) and simulate a press event
    fireEvent.press(getByText('Back'));

    // Assert that goBack was called
    expect(mockGoBack).toHaveBeenCalled();
  });
});