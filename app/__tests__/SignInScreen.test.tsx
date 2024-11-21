import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SignInScreen from '../screens/auth/SignInScreen';
import { Alert } from 'react-native';
import { emailAndPasswordLogIn } from '../../firebase/auth/auth';
import { useNavigation } from '@react-navigation/native';
import '@testing-library/jest-native/extend-expect';

jest.mock('../../firebase/auth/auth', () => ({
  UserType: {
    TENANT: 'Tenant',
    LANDLORD: 'Landlord',
  },
  emailAndPasswordLogIn: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(() => [{}, {}]),
}));

jest.mock('expo-application', () => ({
  getInstallationIdAsync: jest.fn().mockResolvedValue('mock-installation-id'),
}));

jest.mock('expo-modules-core', () => ({
  Platform: { OS: 'ios' },
  UnavailabilityError: jest.fn(),
}));

// Mock Firebase modules
jest.mock('../../firebase/firebase', () => ({
  auth: {
    signInWithCredential: jest.fn(),
  },
}));

jest.mock('../../firebase/firestore/firestore', () => ({
  getUser: jest.fn().mockResolvedValue({}),
}));

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock("@expo/vector-icons", () => ({
Ionicons: "",
}))

jest.spyOn(Alert, 'alert');

describe('SignInScreen', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    const { getByText, getByTestId } = render(<SignInScreen />);
    expect(getByText('Welcome back to Leazy')).toBeTruthy();
    expect(getByTestId('emailInput')).toBeTruthy();
    expect(getByTestId('passwordInput')).toBeTruthy();
    expect(getByTestId('signInButton')).toBeTruthy();
  });

  test('displays validation errors when fields are empty', () => {
    const { getByTestId, getByText } = render(<SignInScreen />);

    fireEvent.press(getByTestId('signInButton'));

    expect(getByText('Email is required')).toBeTruthy();
    expect(getByText('Password is required')).toBeTruthy();
  });

  test('displays invalid email error', () => {
    const { getByTestId, getByText } = render(<SignInScreen />);

    fireEvent.changeText(getByTestId('emailInput'), 'invalid-email');
    fireEvent.press(getByTestId('signInButton'));

    expect(getByText('Email is invalid')).toBeTruthy();
  });

  test('calls emailAndPasswordLogIn and shows success alert on successful sign-in', async () => {
    (emailAndPasswordLogIn as jest.Mock).mockResolvedValue({ uid: '123' });

    const { getByTestId } = render(<SignInScreen />);

    fireEvent.changeText(getByTestId('emailInput'), 'test@test.com');
    fireEvent.changeText(getByTestId('passwordInput'), 'password123');

    await act(async () => {
      fireEvent.press(getByTestId('signInButton'));
    });

    expect(emailAndPasswordLogIn).toHaveBeenCalledWith('test@test.com', 'password123');
    expect(Alert.alert).toHaveBeenCalledWith('Success', 'You have successfully signed in!');
  });

  test('displays error popup when sign-in fails', async () => {
    (emailAndPasswordLogIn as jest.Mock).mockRejectedValue(new Error('Sign-in failed'));

    const { getByTestId, queryByTestId } = render(<SignInScreen />);

    fireEvent.changeText(getByTestId('emailInput'), 'test@test.com');
    fireEvent.changeText(getByTestId('passwordInput'), 'password123');

    await act(async () => {
      fireEvent.press(getByTestId('signInButton'));
    });

    await waitFor(() => expect(queryByTestId('signInPopup')).toBeTruthy());
  });

  test('closes popup when close button is pressed', async () => {
    (emailAndPasswordLogIn as jest.Mock).mockRejectedValue(new Error('Sign-in failed'));

    const { getByTestId, queryByTestId } = render(<SignInScreen />);

    fireEvent.changeText(getByTestId('emailInput'), 'test@test.com');
    fireEvent.changeText(getByTestId('passwordInput'), 'password123');

    await act(async () => {
      fireEvent.press(getByTestId('signInButton'));
    });

    await waitFor(() =>(expect(queryByTestId('signInPopup')).toBeTruthy()));

    fireEvent.press(getByTestId('signInPopupCloseButton'));
    await waitFor(() => expect(queryByTestId('signInPopup')).toBeFalsy());
  });
});
