import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CameraButton from '../CameraButton';

// Mocking the AntDesign component
jest.mock('@expo/vector-icons', () => ({
    AntDesign: 'AntDesign',
}));

// Mocking the DropShadow component
jest.mock('react-native-drop-shadow', () => 'DropShadow');

describe('CameraButton', () => {
    it('renders correctly and handles onPress event', () => {
        const mockOnPress = jest.fn();
        
        // Render the component
        const { getByText, getByTestId } = render(<CameraButton onPress={mockOnPress} />);

        // Verify that the button text is rendered
        expect(getByText('Take Picture')).toBeTruthy();

        // Simulate button press
        const button = getByTestId('camera-button');
        fireEvent.press(button);

        // Check if the onPress event was triggered
        expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
});
