import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomPopUp from '../components/CustomPopUp'; // Adjust the path as necessary

describe('CustomPopUp Component', () => {
  it('renders the popup with the correct text', () => {
    const { getByText, getByTestId } = render(
      <CustomPopUp
        title='Error'
        text='This is an error message.'
        onPress={jest.fn()}
        testID='custom-popup'
      />,
    );

    // Verify the popup and its text are rendered
    expect(getByTestId('custom-popup')).toBeTruthy();
    expect(getByText('This is an error message.')).toBeTruthy();
  });

  it("renders the header with 'Error' text", () => {
    const { getByText } = render(
      <CustomPopUp
        title='Error'
        text='Another error message.'
        onPress={jest.fn()}
        testID='custom-popup'
      />,
    );

    expect(getByText('Error')).toBeTruthy();
  });

  it("calls onPress when the 'Ok' button is pressed", () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <CustomPopUp
        title='Error'
        text='Click Ok to proceed.'
        onPress={mockOnPress}
        testID='custom-popup'
      />,
    );

    // Simulate button press
    const okButton = getByText('Ok');
    fireEvent.press(okButton);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('applies custom testID to the overlay', () => {
    const { getByTestId } = render(
      <CustomPopUp
        title='Error'
        text='Testing testID'
        onPress={jest.fn()}
        testID='popup-overlay'
      />,
    );

    const overlay = getByTestId('popup-overlay');
    expect(overlay).toBeTruthy();
  });
});
