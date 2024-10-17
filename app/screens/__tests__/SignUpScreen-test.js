import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SignUpScreen from '../SignUpScreen';  // Adjust the import path based on your file structure.
import { useNavigation } from '@react-navigation/native';

// Mock useNavigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('<SignUpScreen />', () => {
  const mockNavigate = jest.fn();

  // Mock the navigation function
  beforeEach(() => {
    (useNavigation).mockReturnValue({
      navigate: mockNavigate,
    });
  });

  // Test if all components render correctly
  test('renders correctly', () => {
    const { getByTestId } = render(<SignUpScreen />);
    
    expect(getByTestId('emailInput')).toBeTruthy();
    expect(getByTestId('passwordInput')).toBeTruthy();
    expect(getByTestId('confirmPasswordInput')).toBeTruthy();
    expect(getByTestId('signUpButton')).toBeTruthy();  // Check if Sign Up button is rendered
    expect(getByTestId('googleSignUpButton')).toBeTruthy();  // Check if Google Sign Up button is rendered
  });

  // Test if error messages are displayed when required fields are missing
  test('displays error message when email or password is missing', () => {
    const { getByTestId, getByText } = render(<SignUpScreen />);

    fireEvent.press(getByTestId('signUpButton'));  // Trigger sign-up without filling fields

    // Check for validation errors
    expect(getByText('Email is required')).toBeTruthy();
    expect(getByText('Password is required')).toBeTruthy();
    expect(getByText('Please confirm your password')).toBeTruthy();
  });

  // Test if error is displayed when passwords do not match
  test('displays error when passwords do not match', () => {
    const { getByTestId, getByText } = render(<SignUpScreen />);
    
    // Fill in the form with mismatching passwords
    fireEvent.changeText(getByTestId('firstNameInput'), 'Test');
    fireEvent.changeText(getByTestId('lastNameInput'), 'User');
    fireEvent.changeText(getByTestId('emailInput'), 'test@example.com');
    fireEvent.changeText(getByTestId('passwordInput'), 'password123');
    fireEvent.changeText(getByTestId('confirmPasswordInput'), 'password456');  // Mismatching passwords
    fireEvent.press(getByTestId('signUpButton'));

    // Check for error message
    expect(getByText('Passwords do not match')).toBeTruthy();
  });

  // Test if valid inputs are accepted
  test('allows entering email and matching passwords', () => {
    const { getByTestId } = render(<SignUpScreen />);
    
    // Fill in the form with valid inputs
    fireEvent.changeText(getByTestId('firstNameInput'), 'Test');
    fireEvent.changeText(getByTestId('lastNameInput'), 'User');
    fireEvent.changeText(getByTestId('emailInput'), 'test@example.com');
    fireEvent.changeText(getByTestId('passwordInput'), 'password123');
    fireEvent.changeText(getByTestId('confirmPasswordInput'), 'password123');

    // Assert that inputs have the correct values
    expect(getByTestId('emailInput').props.value).toBe('test@example.com');
    expect(getByTestId('passwordInput').props.value).toBe('password123');
    expect(getByTestId('confirmPasswordInput').props.value).toBe('password123');
  });

  // Test navigation to the next screen after successful sign-up
  //test('Displays error message when the account already exists (please make sure this account already exists in the database)', () => {
  //  const { getByTestId, getByText } = render(<SignUpScreen />);
  //  
  //  // Fill in the form
  //  fireEvent.changeText(getByTestId('firstNameInput'), 'Already Existing');
  //  fireEvent.changeText(getByTestId('lastNameInput'), 'Account');
  //  fireEvent.changeText(getByTestId('emailInput'), 'already.existing@account.com');
  //  fireEvent.changeText(getByTestId('passwordInput'), '123456');
  //  fireEvent.changeText(getByTestId('confirmPasswordInput'), '123456');
  //  
  //  // Press the Sign Up button
  //  fireEvent.press(getByTestId('signUpButton'));
//
  //  // Check for error message
  //  expect(getByText('An error occurred while signing up. Please make sure you are connected to the internet and that your email is not already used by another account.')).toBeTruthy();
  //});
});
