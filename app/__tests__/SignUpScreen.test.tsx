// SignUpScreen.test.tsx

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SignUpScreen from '../screens/auth/SignUpScreen';
import { Alert, Modal } from 'react-native';
import { emailAndPasswordSignIn } from '../../firebase/auth/auth';
import { createUser } from '../../firebase/firestore/firestore';
import { useNavigation } from '@react-navigation/native';
import '@testing-library/jest-native/extend-expect';
import { User } from 'react-native-feather';


jest.mock('../../firebase/auth/auth', () => ({
    UserType: {
      TENANT: 'Tenant',
      LANDLORD: 'Landlord',
    },
    emailAndPasswordSignIn: jest.fn(),
  }));


const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockGetState = jest.fn(() => ({
  routes: [], // or you can add expected routes here if needed
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    getState: mockGetState,
  }),
}));


jest.mock("@expo/vector-icons", () => ({
  Ionicons: "",
}))


jest.mock('../../firebase/firestore/firestore', () => ({
  createUser: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('SignUpScreen', () => {
  let mockNavigate: jest.Mock;

  beforeEach(() => {
    mockNavigate = useNavigation().navigate as jest.Mock;
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    const { getByText, getByTestId } = render(<SignUpScreen />);
    expect(getByText('Welcome to Leazy')).toBeTruthy();
    expect(getByTestId('emailInput')).toBeTruthy();
    expect(getByTestId('passwordInput')).toBeTruthy();
    expect(getByTestId('confirmPasswordInput')).toBeTruthy();
    expect(getByTestId('signUpButton')).toBeTruthy();
    expect(getByTestId('googleSignUpButton')).toBeTruthy();
  });

  test('displays validation errors when fields are invalid', async () => {
    const { getByTestId, getByText } = render(<SignUpScreen />);

    fireEvent.press(getByTestId('signUpButton'));

    expect(getByText('Email is required')).toBeTruthy();
    expect(getByText('Password is required')).toBeTruthy();
    expect(getByText('Please confirm your password')).toBeTruthy();
  });

  test('displays email and password mismatch errors', async () => {
    const { getByTestId, getByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByTestId('emailInput'), 'test@test.com');
    fireEvent.changeText(getByTestId('passwordInput'), 'password123');
    fireEvent.changeText(getByTestId('confirmPasswordInput'), 'password321');

    fireEvent.press(getByTestId('signUpButton'));

    expect(getByText('Passwords do not match')).toBeTruthy();
  });

  test('calls emailAndPasswordSignIn and navigates on successful signup', async () => {
    (emailAndPasswordSignIn as jest.Mock).mockResolvedValue({
      uid: '123',
      providerData: [{ email: 'test@test.com' }],
    });
  
    const { getByTestId } = render(<SignUpScreen />);
  
    fireEvent.changeText(getByTestId('emailInput'), 'test@test.com');
    fireEvent.changeText(getByTestId('passwordInput'), 'password123');
    fireEvent.changeText(getByTestId('confirmPasswordInput'), 'password123');
  
    await act(async () => {
      fireEvent.press(getByTestId('signUpButton'));
    });
  
    expect(emailAndPasswordSignIn).toHaveBeenCalledWith('test@test.com', 'password123', "Tenant");
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('TenantForm', { userId: '123', email: 'test@test.com' }));
  });
  

  test('displays error popup when signup fails', async () => {
    (emailAndPasswordSignIn as jest.Mock).mockResolvedValue(null);

    const { getByTestId, queryByTestId } = render(<SignUpScreen />);

    fireEvent.changeText(getByTestId('emailInput'), 'test@test.com');
    fireEvent.changeText(getByTestId('passwordInput'), 'password123');
    fireEvent.changeText(getByTestId('confirmPasswordInput'), 'password123');

    await act(async () => {
      fireEvent.press(getByTestId('signUpButton'));
    });

    expect(queryByTestId('signUpPopup')).toBeTruthy();
  });

  test('calls Alert.alert when Google signup button is pressed', () => {
    const { getByTestId } = render(<SignUpScreen />);

    fireEvent.press(getByTestId('googleSignUpButton'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Google Sign Up',
      'Google Sign Up functionality would be implemented here.'
    );
  });
});
