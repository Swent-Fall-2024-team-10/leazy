import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, Keyboard, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import {
  createApartment,
  createResidence,
  updateLandlord,
  updateResidence,
  getLandlord,
} from '../../firebase/firestore/firestore';
import ResidenceCreationScreen from '../screens/landlord/ResidenceCreationScreen';
import * as XLSX from 'xlsx';

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    blob: () => Promise.resolve(new Blob())
  })
) as jest.Mock;

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

// Mock auth context
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock firestore operations
jest.mock('../../firebase/firestore/firestore', () => ({
  createResidence: jest.fn(),
  createApartment: jest.fn(),
  updateLandlord: jest.fn(),
  updateResidence: jest.fn(),
  getLandlord: jest.fn(),
}));

// Mock document picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

// Mock file system
jest.mock('expo-file-system', () => ({
  cacheDirectory: 'mock-cache/',
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: 'base64',
  },
}));

// Mock Firebase
jest.mock('../../firebase/firebase', () => ({
  storage: {
    ref: jest.fn(() => ({
      put: jest.fn(),
      getDownloadURL: jest.fn(),
    })),
  },
  app: {},
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock Firebase storage
jest.mock('firebase/storage', () => ({
  ref: jest.fn(() => ({
    put: jest.fn(),
    getDownloadURL: jest.fn(),
  })),
  uploadBytes: jest.fn(() => Promise.resolve()),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn(() => Promise.resolve('https://mockurl.com/image.jpg')),
  getStorage: jest.fn(),
}));

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(),
}));

// Mock XLSX
jest.mock('xlsx', () => ({
  read: jest.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {}
    }
  })),
  utils: {
    sheet_to_json: jest.fn(() => [['Apt 101'], ['Apt 102']]),
  },
}));

// Mock Keyboard
const mockKeyboardListener = { remove: jest.fn() };
jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => ({
  addListener: jest.fn(() => mockKeyboardListener),
  removeListener: jest.fn(),
  dismiss: jest.fn(),
}));

// Spy on Alert
jest.spyOn(Alert, 'alert');

describe('ResidenceCreationScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  const mockUser = {
    uid: 'test-user-id',
  };

  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigation as jest.Mock).mockReturnValue(mockNavigation);
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (createResidence as jest.Mock).mockResolvedValue('test-residence-id');
    (createApartment as jest.Mock).mockResolvedValue('test-apartment-id');
    (getLandlord as jest.Mock).mockResolvedValue({
      userId: 'test-user-id',
      residenceIds: [],
    });
    (global.fetch as jest.Mock).mockClear();
  });

  // Helper function to fill form
  const fillForm = (getByTestId: any) => {
    const fields = {
      'residence-name': 'Test Residence',
      'address': '123 Test St',
      'number': '123',
      'zip-code': '12345',
      'city': 'Test City',
      'province-state': 'Test State',
      'country': 'Test Country',
      'description': 'Test Description',
      'website': 'https://example.com'
    };

    Object.entries(fields).forEach(([field, value]) => {
      fireEvent.changeText(getByTestId(field), value);
    });
  };

  describe('Initial Rendering', () => {
    it('renders all form fields correctly', () => {
      const { getByTestId, getByPlaceholderText } = render(<ResidenceCreationScreen />);
      
      expect(getByTestId('screen-title')).toBeTruthy();
      expect(getByTestId('residence-name')).toBeTruthy();
      expect(getByTestId('address')).toBeTruthy();
      expect(getByTestId('number')).toBeTruthy();
      expect(getByTestId('zip-code')).toBeTruthy();
      expect(getByTestId('city')).toBeTruthy();
      expect(getByTestId('province-state')).toBeTruthy();
      expect(getByTestId('country')).toBeTruthy();
      expect(getByTestId('description')).toBeTruthy();
      expect(getByTestId('website')).toBeTruthy();
    });

    it('initializes with empty form values', () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);
      
      expect(getByTestId('residence-name').props.value).toBe('');
      expect(getByTestId('address').props.value).toBe('');
      expect(getByTestId('number').props.value).toBe('');
    });
  });

  describe('Form Input Handling', () => {
    it('updates form values on input change', () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);
      fillForm(getByTestId);

      expect(getByTestId('residence-name').props.value).toBe('Test Residence');
      expect(getByTestId('address').props.value).toBe('123 Test St');
      expect(getByTestId('number').props.value).toBe('123');
    });

    it('validates website URL format', async () => {
      const { getByTestId, findByText } = render(<ResidenceCreationScreen />);
      
      fireEvent.changeText(getByTestId('website'), 'invalid-url');
      fireEvent.press(getByTestId('next-button'));
      
      expect(await findByText('Please enter a valid website URL')).toBeTruthy();
    });
  });

  describe('File Upload Handling', () => {
    beforeEach(() => {
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('mock-content');
    });

    it('handles Excel file upload successfully', async () => {
      const { getByText, getByTestId } = render(<ResidenceCreationScreen />);
      
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{
          name: 'test.xlsx',
          uri: 'file://test.xlsx'
        }]
      });

      await act(async () => {
        fireEvent.press(getByText('List of Apartments (.xlsx)'));
      });

      expect(FileSystem.readAsStringAsync).toHaveBeenCalled();
      expect(XLSX.read).toHaveBeenCalled();
    });

    it('handles image upload successfully', async () => {
      const { getByText, getByTestId } = render(<ResidenceCreationScreen />);
      
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          { name: 'test1.jpg', uri: 'file://test1.jpg' },
          { name: 'test2.jpg', uri: 'file://test2.jpg' }
        ]
      });

      await act(async () => {
        fireEvent.press(getByText('Pictures of residence'));
      });

      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalled();
      expect(FileSystem.copyAsync).toHaveBeenCalledTimes(2);
    });

    it('handles file upload errors', async () => {
      const { getByText } = render(<ResidenceCreationScreen />);
      
      (DocumentPicker.getDocumentAsync as jest.Mock).mockRejectedValue(new Error('Upload failed'));

      await act(async () => {
        fireEvent.press(getByText('Pictures of residence'));
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to upload file');
    });
  });

  describe('Form Submission', () => {
    it('submits form with complete data successfully', async () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);
      
      fillForm(getByTestId);

      await act(async () => {
        fireEvent.press(getByTestId('next-button'));
      });

      expect(createResidence).toHaveBeenCalledWith(expect.objectContaining({
        residenceName: 'Test Residence',
        street: '123 Test St',
        city: 'Test City'
      }));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ResidenceList');
    });

  });

  describe('Navigation', () => {
    it('handles back navigation', () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);
      
      fireEvent.press(getByTestId('go-back-button'));
      
      expect(mockNavigation.goBack).toHaveBeenCalled();
    });
  });

  describe('Keyboard Handling', () => {
    it('sets up keyboard listeners correctly', () => {
      render(<ResidenceCreationScreen />);
      
      expect(Keyboard.addListener).toHaveBeenCalledWith(
        Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
        expect.any(Function)
      );
      expect(Keyboard.addListener).toHaveBeenCalledWith(
        Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
        expect.any(Function)
      );
    });

    it('cleans up keyboard listeners on unmount', () => {
      const { unmount } = render(<ResidenceCreationScreen />);
      unmount();
      expect(mockKeyboardListener.remove).toHaveBeenCalled();
    });
  });
});