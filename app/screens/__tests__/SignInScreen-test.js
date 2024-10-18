import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import {within} from '@testing-library/dom'
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

  // Test if email is wrong format
  // Test if error is displayed when passwords do not match
  test('displays error when email format is invalid', () => {
    const { getByTestId, getByText } = render(<SignInScreen />);
    
    // Fill in the form with mismatching passwords
    fireEvent.changeText(getByTestId('emailInput'), 'invalid');
    fireEvent.changeText(getByTestId('passwordInput'), 'password123');
    fireEvent.press(getByTestId('signInButton'));

    // Check for error message
    expect(getByText('Email is invalid')).toBeTruthy();
  });

  test('allows entering email and password', () => {
    const { getByTestId } = render(<SignInScreen />);
    
    fireEvent.changeText(getByTestId('emailInput'), 'test@example.com');
    fireEvent.changeText(getByTestId('passwordInput'), 'password123');

    expect(getByTestId('emailInput').props.value).toBe('test@example.com');
    expect(getByTestId('passwordInput').props.value).toBe('password123');
  });

  // Test for an account that doesn't exist
  //test('displays error message when account doesn\'t exist', async () => {
  //  const { getByTestId} = render(<SignInScreen />);
  //  
  //  
  //  
  //  
  //  // Fill in the form with a non-existing account
  //  fireEvent.changeText(getByTestId('emailInput'), 'non.existing@account.com');
  //  fireEvent.changeText(getByTestId('passwordInput'), '123456');
  //  
  //  // Press the Sign In button
  //  fireEvent.press(getByTestId('signInButton'));
//
  //  // Wait for the error message to appear
  //  await waitFor(() => {
  //    const { getByText } = within(getByTestId('signInPopup'))
  //    //expect(getByTestId('signInPopup')).toBeTruthy();
  //    //expect(wrapper.find('CustomPopUp').exists()).toBeTruthy()
  //    expect(getByText('Error')).toBeInTheDocument()
  //    //expect(component.contains(<CustomPopUp/>)).toBe(true)
  //    //expect(getByText('An error occurred while signing in. Please make sure you are connected to the internet and that your email and password are correct.')).toBeTruthy();
  //  });
  //});
//
  // Test for an existing account but with the wrong password
  //test('displays error message when the password is wrong', async () => {
  //  const { getByTestId } = render(<SignInScreen />);
  //  const { getByText } = within(getByTestId('signInPopup'))
  //  
  //  // Fill in the form with an existing account but wrong password
  //  fireEvent.changeText(getByTestId('emailInput'), 'already.existing@account.com');
  //  fireEvent.changeText(getByTestId('passwordInput'), 'wrongpassword');  // Intentionally wrong password
  //  
  //  // Press the Sign In button
  //  fireEvent.press(getByTestId('signInButton'));
//
  //  // Wait for the error pop-up or error message to appear
  //  await waitFor(() => {
  //    //expect(getByTestId('signInPopup')).toBeTruthy();  // Check if the pop-up is displayed
  //    // Optionally, check the specific error message
  //    expect(getByText('Error')).toBeInTheDocument()
  //    //expect(getByTestId('An error occurred while signing in. Please make sure you are connected to the internet and that your email and password are correct.')).toBeTruthy();
  //  });
  //});

  test('navigates to the sign-up screen when Sign Up is pressed', () => {
    const { getByTestId } = render(<SignInScreen />);
    
    fireEvent.press(getByTestId('signUpButton'));

    // Here we ensure the correct screen is being navigated to (SignUp in your case)
    expect(mockNavigate).toHaveBeenCalledWith('SignUp');
  });
});