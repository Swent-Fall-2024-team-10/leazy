import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { GoogleSignInButton } from '../../../components/GoogleSignInButton';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

// Mock Firebase configuration
jest.mock('../../../../firebase/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
}));

// Mock expo-auth-session/providers/google
jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: jest.fn(),
}));

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  GoogleAuthProvider: {
    credential: jest.fn(),
  },
  signInWithCredential: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));

// Mock AuthContext
jest.mock('../../../Navigators/AuthContext', () => ({
  useAuth: jest.fn(() => ({ user: null })),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock expo vector icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: jest.fn(),
  }));

describe('GoogleSignInButton', () => {
  const mockPromptAsync = jest.fn();
  let mockUseAuth: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();

    mockUseAuth = jest.fn(() => ({ user: null }));
    require('../../../Navigators/AuthContext').useAuth = mockUseAuth;

    (Google.useAuthRequest as jest.Mock).mockReturnValue([
      { type: 'success' }, // request
      null, // response
      mockPromptAsync, // promptAsync
    ]);
  });

  it('renders correctly', () => {
    const { getByText, getByTestId } = render(<GoogleSignInButton />);
    expect(getByText('Continue with Google')).toBeTruthy();
    expect(getByTestId('google-sign-in-button')).toBeTruthy();
  });

  it('handles button press', () => {
    const { getByTestId } = render(<GoogleSignInButton />);
    fireEvent.press(getByTestId('google-sign-in-button'));
    expect(mockPromptAsync).toHaveBeenCalled();
  });

  it('renders button styles correctly', () => {
    const { getByTestId } = render(<GoogleSignInButton />);
    const button = getByTestId('google-sign-in-button');
    
    expect(button.props.style).toMatchObject({
      width: '100%',
      padding: '4%',
      backgroundColor: '#ffffff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#dadce0',
      marginVertical: 8,
    });
  });

  it('handles successful Google sign-in for new user', async () => {
    const mockCredential = 'mock-credential';
    (GoogleAuthProvider.credential as jest.Mock).mockReturnValue(mockCredential);
    (signInWithCredential as jest.Mock).mockResolvedValue({ user: {} });
    
    const { rerender } = render(<GoogleSignInButton />);

    // Simulate successful Google sign-in
    (Google.useAuthRequest as jest.Mock).mockReturnValue([
      { type: 'success' },
      { 
        type: 'success',
        params: { id_token: 'mock-token' }
      },
      mockPromptAsync,
    ]);

    // Trigger re-render with new response
    await act(async () => {
      rerender(<GoogleSignInButton />);
    });

    expect(GoogleAuthProvider.credential).toHaveBeenCalledWith('mock-token');
    expect(signInWithCredential).toHaveBeenCalledWith({}, mockCredential);
    expect(mockNavigate).toHaveBeenCalledWith('SignUp');
  });

  it('handles non-success response', async () => {
    const { rerender } = render(<GoogleSignInButton />);

    // Simulate cancelled Google sign-in
    (Google.useAuthRequest as jest.Mock).mockReturnValue([
      { type: 'success' },
      { 
        type: 'cancel',
      },
      mockPromptAsync,
    ]);

    // Trigger re-render with new response
    await act(async () => {
      rerender(<GoogleSignInButton />);
    });

    expect(GoogleAuthProvider.credential).not.toHaveBeenCalled();
    expect(signInWithCredential).not.toHaveBeenCalled();
  });

  it('handles successful Google sign-in for existing user', async () => {
    const mockCredential = 'mock-credential';
    (GoogleAuthProvider.credential as jest.Mock).mockReturnValue(mockCredential);
    (signInWithCredential as jest.Mock).mockResolvedValue({ user: {} });
    
    // Set useAuth to return an existing user
    mockUseAuth.mockReturnValue({ user: { uid: 'existing-user' } });

    const { rerender } = render(<GoogleSignInButton />);

    // Simulate successful Google sign-in
    (Google.useAuthRequest as jest.Mock).mockReturnValue([
      { type: 'success' },
      { 
        type: 'success',
        params: { id_token: 'mock-token' }
      },
      mockPromptAsync,
    ]);

    // Trigger re-render with new response
    await act(async () => {
      rerender(<GoogleSignInButton />);
    });

    expect(GoogleAuthProvider.credential).toHaveBeenCalledWith('mock-token');
    expect(signInWithCredential).toHaveBeenCalledWith({}, mockCredential);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables button when request is not available', () => {
    (Google.useAuthRequest as jest.Mock).mockReturnValue([
      null, // request
      null, // response
      mockPromptAsync,
    ]);

    const { getByTestId } = render(<GoogleSignInButton />);
    const button = getByTestId('google-sign-in-button');
    
    // Access the underlying props directly
    expect(button.props.accessibilityState.disabled).toBe(true);
  });
});