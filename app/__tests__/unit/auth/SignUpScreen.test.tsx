import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SignUpScreen from '../../../screens/auth/SignUpScreen';
import { NavigationContainer } from '@react-navigation/native';
import '@testing-library/jest-native/extend-expect';


jest.mock('../../../../firebase/auth/auth', () => ({
    UserType: {
      TENANT: 'Tenant',
      LANDLORD: 'Landlord',
    },
    emailAndPasswordSignIn: jest.fn(),
  }));

// Mock the navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    }),
  };
});

// Inline mock for Ionicons from expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, size, color }: { name: string, size: number, color: string }) => {
    return
  },
}));

describe('SignUpScreen', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <SignUpScreen />
      </NavigationContainer>
    );

    expect(getByTestId('emailInput')).toBeTruthy();
    expect(getByTestId('passwordInput')).toBeTruthy();
    expect(getByTestId('confirmPasswordInput')).toBeTruthy();
    expect(getByTestId('signUpButton')).toBeTruthy();
    expect(getByTestId('userTypePicker')).toBeTruthy();
    expect(getByTestId('backButton')).toBeTruthy();
  });

  it('displays validation errors for empty fields', () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <SignUpScreen />
      </NavigationContainer>
    );
    fireEvent.press(getByTestId('signUpButton'));

    expect(getByText('Email is required')).toBeTruthy();
    expect(getByText('Password is required')).toBeTruthy();
    expect(getByText('Please confirm your password')).toBeTruthy();
  });

  it('displays a validation error for invalid email', () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <SignUpScreen />
      </NavigationContainer>
    );

    fireEvent.changeText(getByTestId('emailInput'), 'invalid-email');
    fireEvent.press(getByTestId('signUpButton'));

    expect(getByText('Email is invalid')).toBeTruthy();
  });

  it('displays a validation error for mismatched passwords', () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <SignUpScreen />
      </NavigationContainer>
    );

    fireEvent.changeText(getByTestId('passwordInput'), 'password123');
    fireEvent.changeText(getByTestId('confirmPasswordInput'), 'differentPassword');
    fireEvent.press(getByTestId('signUpButton'));

    expect(getByText('Passwords do not match')).toBeTruthy();
  });

  it('navigates to the TenantForm with valid input and Tenant user type', async () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <SignUpScreen />
      </NavigationContainer>
    );
    fireEvent.changeText(getByTestId('emailInput'), 'test@tenant.com');
    fireEvent.changeText(getByTestId('passwordInput'), 'password123');
    fireEvent.changeText(getByTestId('confirmPasswordInput'), 'password123');
    fireEvent(getByTestId('userTypePicker'), 'onValueChange', 'Tenant');
    
    fireEvent.press(getByTestId('signUpButton'));

    expect(mockNavigate).toHaveBeenCalledWith('TenantForm', {
      email: 'test@tenant.com',
      password: 'password123',
    });
  });

  it('navigates to the LandlordForm with valid input and Landlord user type', async () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <SignUpScreen />
      </NavigationContainer>
    );
    fireEvent.changeText(getByTestId('emailInput'), 'test@landlord.com');
    fireEvent.changeText(getByTestId('passwordInput'), 'password123');
    fireEvent.changeText(getByTestId('confirmPasswordInput'), 'password123');
    fireEvent(getByTestId('userTypePicker'), 'onValueChange', 'Landlord');


    fireEvent.press(getByTestId('signUpButton'));

    expect(mockNavigate).toHaveBeenCalledWith('LandlordForm', {
      email: 'test@landlord.com',
      password: 'password123',
    });
  });

  it('goes back when the back button is pressed', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <SignUpScreen />
      </NavigationContainer>
    );

    fireEvent.press(getByTestId('backButton'));

    expect(mockGoBack).toHaveBeenCalled();
  });
});