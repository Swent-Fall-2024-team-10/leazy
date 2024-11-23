import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignInScreen from '../screens/auth/SignInScreen';
import { emailAndPasswordLogIn } from '../../firebase/auth/auth';
import { NavigationContainer } from '@react-navigation/native';
import '@testing-library/jest-native/extend-expect';

// Mock dependencies
jest.mock('../../firebase/auth/auth', () => ({
  emailAndPasswordLogIn: jest.fn(),
}));

// Mock the navigation
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

//jest.mock('../components/GoogleSignInButton', () => jest.fn(() => null));

describe('SignInScreen', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <SignInScreen />
      </NavigationContainer>
    );

    expect(getByTestId('emailInput')).toBeTruthy();
    expect(getByTestId('passwordInput')).toBeTruthy();
    expect(getByTestId('signInButton')).toBeTruthy();
    expect(getByTestId('signUpButton')).toBeTruthy();
  });

  it('displays validation errors for empty fields', () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <SignInScreen />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('signInButton'));

    expect(getByText('Email is required')).toBeTruthy();
    expect(getByText('Password is required')).toBeTruthy();
  });

  it('displays a validation error for invalid email', () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <SignInScreen />
      </NavigationContainer>
    );

    fireEvent.changeText(getByTestId('emailInput'), 'invalid-email');
    fireEvent.press(getByTestId('signInButton'));

    expect(getByText('Email is invalid')).toBeTruthy();
  });

  it('calls emailAndPasswordLogIn on valid input', async () => {
    (emailAndPasswordLogIn as jest.Mock).mockResolvedValueOnce({ user: {} });

    const { getByTestId } = render(
      <NavigationContainer>
        <SignInScreen />
      </NavigationContainer>
    );

    fireEvent.changeText(getByTestId('emailInput'), 'test@example.com');
    fireEvent.changeText(getByTestId('passwordInput'), 'password123');
    fireEvent.press(getByTestId('signInButton'));

    await waitFor(() => {
      expect(emailAndPasswordLogIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows the popup on failed login', async () => {
    (emailAndPasswordLogIn as jest.Mock).mockRejectedValueOnce(new Error('Login failed'));

    const { getByTestId, queryByTestId } = render(
      <NavigationContainer>
        <SignInScreen />
      </NavigationContainer>
    );

    fireEvent.changeText(getByTestId('emailInput'), 'test@example.com');
    fireEvent.changeText(getByTestId('passwordInput'), 'password123');
    fireEvent.press(getByTestId('signInButton'));

    await waitFor(() => {
      expect(queryByTestId('signInPopup')).toBeTruthy();
    });
  });

  it('navigates to SignUp screen when sign-up button is pressed', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <SignInScreen />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('signUpButton'));
    expect(mockNavigate).toHaveBeenCalledWith('SignUp');
  });
});
