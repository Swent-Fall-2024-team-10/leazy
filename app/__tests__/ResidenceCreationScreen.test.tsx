import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, Keyboard, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import ResidenceCreationScreen from '../screens/landlord/ResidenceCreationScreen';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import {
  createApartment,
  createResidence,
  updateLandlord,
  updateResidence,
  getLandlord,
} from '../../firebase/firestore/firestore';
import { uploadBytes, getDownloadURL } from 'firebase/storage';

// Mock all required dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../firebase/firebase', () => ({
  storage: {},
  app: {},
}));

jest.mock('../../firebase/firestore/firestore', () => ({
  createApartment: jest.fn(),
  createResidence: jest.fn(),
  updateLandlord: jest.fn(),
  updateResidence: jest.fn(),
  getLandlord: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('firebase/storage', () => ({
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  ref: jest.fn(),
  getStorage: jest.fn(),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  cacheDirectory: 'mock-cache/',
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  EncodingType: { Base64: 'base64' },
}));

const mockAddListener = jest.fn();
const mockRemove = jest.fn();
mockAddListener.mockReturnValue({ remove: mockRemove });
Keyboard.addListener = mockAddListener;

jest.spyOn(Alert, 'alert');
jest.spyOn(Platform, 'select').mockImplementation((obj) => obj.ios || obj.android);

describe('ResidenceCreationScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  const mockUser = {
    uid: 'test-user-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigation.mockReturnValue(mockNavigation);
    useAuth.mockReturnValue({ user: mockUser });
    Platform.OS = 'ios';
  });

  it('renders correctly with all form fields', () => {
    const { getByTestId, getByText } = render(<ResidenceCreationScreen />);
    expect(getByTestId('screen-title')).toBeTruthy();
    expect(getByTestId('residence-name')).toBeTruthy();
    expect(getByTestId('address')).toBeTruthy();
    expect(getByText('Create Residence')).toBeTruthy();
  });

  it('handles form input changes and validates all fields', () => {
    const { getByTestId } = render(<ResidenceCreationScreen />);
    
    const fields = [
      { id: 'residence-name', value: 'Test Residence' },
      { id: 'address', value: 'Test Address' },
      { id: 'number', value: '123' },
      { id: 'zip-code', value: '12345' },
      { id: 'city', value: 'Test City' },
      { id: 'province-state', value: 'Test State' },
      { id: 'country', value: 'Test Country' },
      { id: 'website', value: 'https://test.com' }
    ];

    fields.forEach(({ id, value }) => {
      fireEvent.changeText(getByTestId(id), value);
      expect(getByTestId(id).props.value).toBe(value);
    });
  });

  it('validates website URL with various formats', () => {
    const { getByTestId } = render(<ResidenceCreationScreen />);
    const websiteInput = getByTestId('website');
    const submitButton = getByTestId('next-button');

    fireEvent.changeText(websiteInput, 'invalid-url');
    fireEvent.press(submitButton);
    expect(websiteInput.props.value).toBe('invalid-url');
  });

  it('handles keyboard visibility changes', async () => {
    render(<ResidenceCreationScreen />);
    
    // Get the keyboard show/hide callbacks
    const keyboardShowEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardHideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    
    await act(async () => {
      // Find the show callback
      const showCall = mockAddListener.mock.calls.find(call => call[0] === keyboardShowEvent);
      const showCallback = showCall[1];
      showCallback();
      
      // Find the hide callback
      const hideCall = mockAddListener.mock.calls.find(call => call[0] === keyboardHideEvent);
      const hideCallback = hideCall[1];
      hideCallback();
    });

    expect(mockAddListener).toHaveBeenCalledWith(keyboardShowEvent, expect.any(Function));
    expect(mockAddListener).toHaveBeenCalledWith(keyboardHideEvent, expect.any(Function));
    expect(mockAddListener).toHaveBeenCalledTimes(2);
  });

  it('handles image upload with multiple files', async () => {
    const { getByTestId, getByText } = render(<ResidenceCreationScreen />);

    // Set residence name first
    await act(async () => {
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
    });

    DocumentPicker.getDocumentAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [
        { uri: 'test1.jpg', name: 'test1.jpg' },
        { uri: 'test2.jpg', name: 'test2.jpg' },
      ],
    });

    await act(async () => {
      fireEvent.press(getByText('Pictures of residence'));
    });

    await waitFor(() => {
      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalledWith({
        type: 'image/*',
        multiple: true,
      });
    });
  });

  it('handles successful residence creation with apartments', async () => {
    createResidence.mockResolvedValueOnce('test-residence-id');
    getLandlord.mockResolvedValueOnce({
      userId: 'test-user-id',
      residenceIds: ['existing-residence'],
    });
    createApartment.mockResolvedValueOnce('test-apartment-id');
    getDownloadURL.mockResolvedValue('https://test-url.com/image.jpg');
    
    const { getByTestId } = render(<ResidenceCreationScreen />);
    
    await act(async () => {
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      fireEvent.changeText(getByTestId('address'), 'Test Address');
      fireEvent.changeText(getByTestId('city'), 'Test City');
      fireEvent.changeText(getByTestId('country'), 'Test Country');
      
      fireEvent.press(getByTestId('next-button'));
    });

    expect(createResidence).toHaveBeenCalled();
    expect(updateLandlord).toHaveBeenCalled();
    expect(mockNavigation.navigate).toHaveBeenCalledWith('ResidenceList');
  });

  it('handles firebase errors during residence creation', async () => {
    createResidence.mockRejectedValueOnce(new Error('Firebase error'));
    
    const { getByTestId } = render(<ResidenceCreationScreen />);
    
    await act(async () => {
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      fireEvent.press(getByTestId('next-button'));
    });

    expect(createResidence).toHaveBeenCalled();
  });

  it('handles navigation back', () => {
    const { getByTestId } = render(<ResidenceCreationScreen />);
    
    fireEvent.press(getByTestId('go-back-button'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('handles PDF upload for ownership proof', async () => {
    const { getByTestId, getByText } = render(<ResidenceCreationScreen />);

    // Set residence name first
    await act(async () => {
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
    });

    DocumentPicker.getDocumentAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'test.pdf', name: 'test.pdf' }],
    });

    await act(async () => {
      fireEvent.press(getByText('Proof of Ownership'));
    });

    expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
  });

  it('shows error when uploading files without residence name', async () => {
    const { getByText } = render(<ResidenceCreationScreen />);

    await act(async () => {
      fireEvent.press(getByText('Pictures of residence'));
    });

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to upload file');
  });
});