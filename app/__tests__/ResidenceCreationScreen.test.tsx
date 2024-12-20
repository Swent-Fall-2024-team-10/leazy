import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Platform, Keyboard } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import { Buffer } from 'buffer';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/firebase';
import ResidenceCreationScreen from '../screens/landlord/ResidenceCreationScreen';
import { useAuth } from '../context/AuthContext';
import {
  createApartment,
  createResidence,
  updateLandlord,
  updateResidence,
  getLandlord,
} from '../../firebase/firestore/firestore';

// Mock dependencies
jest.mock('../../firebase/firebase', () => ({
  storage: {},
}));

jest.mock('firebase/storage', () => ({
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../firebase/firestore/firestore', () => ({
  createApartment: jest.fn(),
  createResidence: jest.fn(),
  updateLandlord: jest.fn(),
  updateResidence: jest.fn(),
  getLandlord: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
}));

jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  memoryLocalCache: jest.fn(),
  initializeFirestore: jest.fn()
}));

// Mock components
jest.mock('../components/Header', () => 'MockHeader');
jest.mock('../components/CustomTextField', () => 'MockCustomTextField');
jest.mock('../components/CustomButton', () => 'MockCustomButton');

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'MockedIonicons',
}));

// Mock external dependencies
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  cacheDirectory: 'mockCacheDirectory/',
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: 'base64',
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock console methods
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('ResidenceCreationScreen', () => {
  const mockUser = { uid: 'test-user-id' };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    Platform.OS = 'ios';
    Keyboard.addListener = jest.fn().mockReturnValue({ remove: jest.fn() });
  });

  describe('Form Rendering', () => {
    it('renders all form fields correctly', () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);
      
      // Verify screen title
      expect(getByTestId('screen-title')).toBeTruthy();
      
      // Verify all form fields are present
      const formFields = [
        'residence-name',
        'address',
        'number',
        'zip-code',
        'city',
        'province-state',
        'country',
        'description',
        'website'
      ];

      formFields.forEach(fieldId => {
        expect(getByTestId(fieldId)).toBeTruthy();
      });

      // Verify buttons
      expect(getByTestId('next-button')).toBeTruthy();
      expect(getByTestId('go-back-button')).toBeTruthy();
    });
  });

  describe('Keyboard Handling', () => {
    it('handles keyboard visibility changes', async () => {
      render(<ResidenceCreationScreen />);
      
      await waitFor(() => {
        // Component already adds 2 listeners in useEffect
        // So we should just verify they were added without adding more
        expect(Keyboard.addListener).toHaveBeenCalled();
        expect(Keyboard.addListener.mock.calls).toEqual([
          ['keyboardWillShow', expect.any(Function)],
          ['keyboardWillHide', expect.any(Function)]
        ]);
      });
    });
  });

  describe('Image Upload', () => {
    it('handles multiple image uploads successfully', async () => {
      const { getByText, getByTestId } = render(<ResidenceCreationScreen />);
      
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');

      DocumentPicker.getDocumentAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [
          { uri: 'file://test1.jpg', name: 'test1.jpg' },
          { uri: 'file://test2.jpg', name: 'test2.jpg' },
          { uri: 'file://test3.png', name: 'test3.png' }
        ]
      });

      FileSystem.makeDirectoryAsync.mockResolvedValue(undefined);
      FileSystem.copyAsync.mockResolvedValue(undefined);

      await waitFor(() => {
        fireEvent.press(getByText('Pictures of residence'));
      });

      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalled();
      expect(FileSystem.copyAsync).toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith('imageUris:', expect.any(Array));
    });

    it('handles invalid file extensions for images', async () => {
      const { getByText } = render(<ResidenceCreationScreen />);
      
      DocumentPicker.getDocumentAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: 'file://test.txt', name: 'test.txt' }]
      });

      await waitFor(() => {
        fireEvent.press(getByText('Pictures of residence'));
      });

      expect(mockAlert).toHaveBeenCalledWith(
        'Invalid file type',
        expect.any(String)
      );
    });

    it('validates residence name before image upload', async () => {
      const { getByText } = render(<ResidenceCreationScreen />);
    
      DocumentPicker.getDocumentAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: 'file://test.jpg', name: 'test.jpg' }]
      });
    
      await waitFor(() => {
        fireEvent.press(getByText('Pictures of residence'));
        // Need to wait for the next tick to ensure validation happens
      }, { timeout: 1000 });
    
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error', 'Please enter a residence name first');
      });
    });

    it('handles clear all pictures', async () => {
      const { getByText, queryByText, getByTestId } = render(<ResidenceCreationScreen />);

      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      
      DocumentPicker.getDocumentAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: 'file://test.jpg', name: 'test.jpg' }]
      });

      await waitFor(() => {
        fireEvent.press(getByText('Pictures of residence'));
      });

      await waitFor(() => {
        fireEvent.press(getByText('Clear All'));
      });

      expect(queryByText('Selected Pictures (1)')).toBeNull();
    });
  });

  describe('Excel File Handling', () => {
    it('handles Excel file parsing successfully', async () => {
      const { getByText, getByTestId } = render(<ResidenceCreationScreen />);
      
      // Set residence name first
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
    
      DocumentPicker.getDocumentAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: 'file://test.xlsx', name: 'test.xlsx' }]
      });
    
      // Mock successful file content
      FileSystem.readAsStringAsync.mockResolvedValueOnce('mock-content');
      
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {
            'A1': { v: 'ApartmentName' },
            'A2': { v: 'Apt 1' },
            'A3': { v: 'Apt 2' }
          }
        }
      };
    
      // Need to mock both XLSX functions
      XLSX.read = jest.fn().mockReturnValue(mockWorkbook);
      XLSX.utils.sheet_to_json = jest.fn().mockReturnValue([
        { Apartment: 'Apt 1' },
        { Apartment: 'Apt 2' }
      ]);
    
      await waitFor(() => {
        fireEvent.press(getByText('List of Apartments (.xlsx)'));
      });
    
      expect(mockAlert).toHaveBeenCalledWith('Success', expect.any(String));
    });

    it('handles Excel file parsing errors', async () => {
      const { getByText, getByTestId } = render(<ResidenceCreationScreen />);
      
      // Set residence name first
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
    
      DocumentPicker.getDocumentAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: 'file://test.xlsx', name: 'test.xlsx' }]
      });
    
      FileSystem.readAsStringAsync.mockRejectedValueOnce(new Error('Parse error'));
      
      await waitFor(() => {
        fireEvent.press(getByText('List of Apartments (.xlsx)'));
      });
    
      expect(mockAlert).toHaveBeenCalledWith('Error', 'Failed to parse Excel file');
    });
  });

  describe('PDF Upload', () => {
    it('handles PDF upload successfully', async () => {
      const { getByText, getByTestId } = render(<ResidenceCreationScreen />);
      
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');

      DocumentPicker.getDocumentAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: 'file://test.pdf', name: 'test.pdf' }]
      });

      await waitFor(() => {
        fireEvent.press(getByText('Proof of Ownership'));
      });

      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalled();
      expect(FileSystem.copyAsync).toHaveBeenCalled();
      expect(getByText('Proof uploaded')).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('handles successful form submission', async () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);

      createResidence.mockResolvedValueOnce('new-residence-id');
      getLandlord.mockResolvedValueOnce({
        userId: 'test-user-id',
        residenceIds: []
      });
      updateLandlord.mockResolvedValueOnce(undefined);

      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      fireEvent.changeText(getByTestId('address'), 'Test Address');
      fireEvent.changeText(getByTestId('city'), 'Test City');

      await waitFor(() => {
        fireEvent.press(getByTestId('next-button'));
      });

      expect(createResidence).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('ResidenceList');
    });

    it('handles firebase errors during submission', async () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);

      createResidence.mockRejectedValueOnce(new Error('Firebase error'));

      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      fireEvent.changeText(getByTestId('address'), 'Test Address');
      fireEvent.changeText(getByTestId('city'), 'Test City');

      await waitFor(() => {
        fireEvent.press(getByTestId('next-button'));
      });

      expect(getByTestId('FirebaseErrorModal')).toBeTruthy();
    });

   

    it('handles landlord update error', async () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);
    
      // Mock API sequences with fixed promises
      createResidence.mockImplementationOnce(() => Promise.resolve('new-residence-id'));
      getLandlord.mockImplementationOnce(() => Promise.resolve({ 
        userId: 'test-user-id', 
        residenceIds: [] 
      }));
      updateLandlord.mockImplementationOnce(() => Promise.reject(new Error('Update failed')));
    
      // Fill form
      await waitFor(() => {
        fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
        fireEvent.changeText(getByTestId('address'), 'Test Address');
        fireEvent.changeText(getByTestId('city'), 'Test City');
      });
    
      // Submit form
      await waitFor(() => {
        fireEvent.press(getByTestId('next-button'));
      });
    
      // Wait for all promises to resolve and verify error state
      await waitFor(() => {
        expect(createResidence).toHaveBeenCalled();
        expect(getLandlord).toHaveBeenCalled();
        expect(updateLandlord).toHaveBeenCalled();
        expect(getByTestId('FirebaseErrorModal')).toBeTruthy();
      }, { timeout: 2000 });
    });
  });

  describe('Form Validation', () => {
    it('validates required fields', async () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);
    
      fireEvent.press(getByTestId('next-button'));
    
      await waitFor(() => {
        expect(createResidence).not.toHaveBeenCalled();
      });
    });
    
    it('validates website format', async () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);
    
      // Fill required fields
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      fireEvent.changeText(getByTestId('address'), 'Test Address');
      fireEvent.changeText(getByTestId('city'), 'Test City');
      
      // Add invalid website
      fireEvent.changeText(getByTestId('website'), 'invalid-url');
      
      fireEvent.press(getByTestId('next-button'));
    
      await waitFor(() => {
        expect(createResidence).not.toHaveBeenCalled();
      });
    });

    it('handles form field changes and error clearing', async () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);

      const fields = [
        'residence-name',
        'address',
        'number',
        'zip-code',
        'city',
        'province-state',
        'country',
        'description',
        'website'
      ];

      for (const field of fields) {
        await waitFor(() => {
          fireEvent.changeText(getByTestId(field), 'test value');
        });
      }

      await waitFor(() => {
        fireEvent.changeText(getByTestId('website'), 'invalid-url');
        fireEvent.press(getByTestId('next-button'));
      });

      // Clear website error by entering valid URL
      await waitFor(() => {
        fireEvent.changeText(getByTestId('website'), 'https://valid-url.com');
      });
    });
  });

  describe('Navigation', () => {
    it('handles back navigation', () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);
      fireEvent.press(getByTestId('go-back-button'));
      expect(mockGoBack).toHaveBeenCalled();
    });

    it('navigates to list after success', async () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);

      createResidence.mockResolvedValueOnce('new-residence-id');
      getLandlord.mockResolvedValueOnce({
        userId: 'test-user-id',
        residenceIds: []
      });

      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      fireEvent.changeText(getByTestId('address'), 'Test Address');
      fireEvent.changeText(getByTestId('city'), 'Test City');

      await waitFor(() => {
        fireEvent.press(getByTestId('next-button'));
      });

      expect(mockNavigate).toHaveBeenCalledWith('ResidenceList');
    });
  });
});