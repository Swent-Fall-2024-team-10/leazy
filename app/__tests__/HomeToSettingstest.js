// HomepageScreen.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomepageScreen from '../screens/HomepageScreen.tsx';
import { useNavigation } from '@react-navigation/native';

// portions of this code were generated with chatGPT as an AI assistant

// Mock the `useNavigation` hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: jest.fn(() => null),  // Mock the Ionicons component
}));

describe('HomepageScreen navigation test', () => {
  it('navigates to the Settings screen when the button is pressed', () => {
    // Mock the navigate function
    const mockNavigate = jest.fn();
    useNavigation.mockReturnValue({ navigate: mockNavigate });

    // Render the HomepageScreen
    const { getByText } = render(<HomepageScreen />);

    // Find the button by its text and simulate a press event
    fireEvent.press(getByText('Go to Settings'));

    // Assert that navigate was called with the correct argument
    expect(mockNavigate).toHaveBeenCalledWith('Settings');
  });
});