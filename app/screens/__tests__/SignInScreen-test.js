import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SignInScreen from '../SignInScreen';  // Adjust the import path based on your file structure.
import { useNavigation } from '@react-navigation/native';

// Mock useNavigation hook
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('<SignInScreen />', () => {
  const mockNavigate = jest.fn();

  // Mock the navigation function
  beforeEach(() => {
    (useNavigation).mockReturnValue({
      navigate: mockNavigate,
    });
  });

  test('renders correctly', () => {
    const { getByTestId } = render(<SignInScreen />);
    expect(getByTestId('emailInput')).toBeTruthy();
    expect(getByTestId('passwordInput')).toBeTruthy();
    expect(getByTestId('signInButton')).toBeTruthy();
    expect(getByTestId('signUpButton')).toBeTruthy();  // Check if Sign Up button is rendered
    expect(getByTestId('googleSignInButton')).toBeTruthy();  // Check if Forgot Password button is rendered
  });

  test('displays error message when email or password is missing', () => {
    const { getByTestId, getByText } = render(<SignInScreen />);

    fireEvent.press(getByTestId('signInButton'));

    expect(getByText('Email is required')).toBeTruthy();
    expect(getByText('Password is required')).toBeTruthy();
  });

  test('allows entering email and password', () => {
    const { getByTestId } = render(<SignInScreen />);
    
    fireEvent.changeText(getByTestId('emailInput'), 'test@example.com');
    fireEvent.changeText(getByTestId('passwordInput'), 'password123');

    expect(getByTestId('emailInput').props.value).toBe('test@example.com');
    expect(getByTestId('passwordInput').props.value).toBe('password123');
  });

  //test('displays error message when account doesn\'t exist (please make sure this account doesn\'t exist in the database)' , () => {
  //  const { getByTestId, getByText } = render(<SignInScreen />);
  //  
  //  // Fill in the form
  //  fireEvent.changeText(getByTestId('emailInput'), 'non.existing@account.com');
  //  fireEvent.changeText(getByTestId('passwordInput'), '123456');
  //  
  //  // Press the Sign Up button
  //  fireEvent.press(getByTestId('signInButton'));
//
  //  // Check for error message
  //  expect(getByText('An error occurred while signing in. Please make sure you are connected to the internet and that your email and password are correct.')).toBeTruthy();
  //});

  //test('displays error message when the password is wrong (please make sure this account exists with a different password in the database)' , () => {
  //  const { getByTestId, getByText } = render(<SignInScreen />);
  //  
  //  // Fill in the form
  //  fireEvent.changeText(getByTestId('emailInput'), 'already.existing@account.com');
  //  fireEvent.changeText(getByTestId('passwordInput'), 'password');
  //  
  //  // Press the Sign Up button
  //  fireEvent.press(getByTestId('signInButton'));
//
  //  // Check for error message
  //  expect(getByText('An error occurred while signing in. Please make sure you are connected to the internet and that your email and password are correct.')).toBeTruthy();
  //});

  test('navigates to the sign-up screen when Sign Up is pressed', () => {
    const { getByTestId } = render(<SignInScreen />);
    
    fireEvent.press(getByTestId('signUpButton'));

    // Here we ensure the correct screen is being navigated to (SignUp in your case)
    expect(mockNavigate).toHaveBeenCalledWith('SignUp');
  });
});