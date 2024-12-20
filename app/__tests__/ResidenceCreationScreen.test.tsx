jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const { ScrollView } = require('react-native');
  return {
    KeyboardAwareScrollView: ScrollView,
  };
});

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

jest.spyOn(Alert, 'alert');
jest.spyOn(console, 'error');
jest.spyOn(console, 'warn');

const mockUser = {
  uid: 'test-user-id',
  type: 'landlord' as const,
  name: 'testName',
  email: 'test@test.com',
  phone: '+4189898909',
  street: '122 Jane Street',
  number: '42',
  city: 'TestCity',
  canton: 'TestCanton',
  zip: '1234',
  country: 'TestCountry',
};

const mockAuthContext = {
  user: mockUser,
  firebaseUser: null,
  tenant: null,
  landlord: null,
  signIn: jest.fn(),
  signOut: jest.fn(),
  loading: false,
  isLoading: false,
};

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>,
  );
};

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
      const { getByTestId, getByPlaceholderText } = render(<ResidenceCreationScreen />);
      expect(getByTestId('screen-title')).toBeTruthy();
      expect(getByPlaceholderText('Residence Name')).toBeTruthy();
      expect(getByPlaceholderText('Address')).toBeTruthy();
      expect(getByPlaceholderText('Street no')).toBeTruthy();
      expect(getByPlaceholderText('Zip Code')).toBeTruthy();
      expect(getByPlaceholderText('City')).toBeTruthy();
      expect(getByPlaceholderText('Province/State')).toBeTruthy();
      expect(getByPlaceholderText('Country')).toBeTruthy();
      expect(getByPlaceholderText('Description')).toBeTruthy();
      expect(getByPlaceholderText('Website (e.g., https://example.com)')).toBeTruthy();
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

  describe('Validation', () => {
    it('validates website format', async () => {
      const { getByTestId, queryByText } = renderWithAuth(
        <ResidenceCreationScreen />,
      );

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
    });

    it('handles invalid file extensions for pictures', async () => {
      const mockFile = {
        canceled: false,
        assets: [{ name: 'test.gif', uri: 'file:///test.gif' }],
      };
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(
        mockFile,
      );

      const { getByTestId, getByText } = renderWithAuth(
        <ResidenceCreationScreen />,
      );
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      fireEvent.press(getByText('Pictures of residence'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Invalid file type',
          'Please select a .jpg or .jpeg or .png file',
        );
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
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(
        mockFile,
      );
      (FileSystem.makeDirectoryAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to create directory'),
      );

      const { getByTestId, getByText } = renderWithAuth(
        <ResidenceCreationScreen />,
      );
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      fireEvent.press(getByText('Pictures of residence'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to upload file',
        );
        expect(console.error).toHaveBeenCalled();
      });
    
      expect(mockAlert).toHaveBeenCalledWith('Success', expect.any(String));
    });

    it('handles file copy errors', async () => {
      const mockFile = {
        canceled: false,
        assets: [{ name: 'test.jpg', uri: 'file:///test.jpg' }],
      };
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(
        mockFile,
      );
      (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValueOnce(
        undefined,
      );
      (FileSystem.copyAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to copy file'),
      );

      const { getByTestId, getByText } = renderWithAuth(
        <ResidenceCreationScreen />,
      );
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
    
      DocumentPicker.getDocumentAsync.mockResolvedValueOnce({
        canceled: false,
        assets: [{ uri: 'file://test.xlsx', name: 'test.xlsx' }]
      });
    
      FileSystem.readAsStringAsync.mockRejectedValueOnce(new Error('Parse error'));
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to upload file',
        );
        expect(console.error).toHaveBeenCalled();
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

      // Now update the field
      fireEvent.changeText(getByTestId('website'), 'https://valid-url.com');
      expect(queryByText('Please enter a valid website URL')).toBeFalsy();
    });
  });

  describe('File Upload Error Handling', () => {
    it('handles file reading errors', async () => {
      // Test for lines 256-257
      const mockFile = {
        canceled: false,
        assets: [{ name: 'test.xlsx', uri: 'file:///test.xlsx' }],
      };
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(
        mockFile,
      );
      (FileSystem.readAsStringAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Read error'),
      );

      const { getByTestId, getByText } = renderWithAuth(
        <ResidenceCreationScreen />,
      );
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      fireEvent.press(getByText('List of Apartments (.xlsx)'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to parse Excel file',
        );
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


  describe('Apartment Creation Error Handling', () => {
    it('handles apartment update failures', async () => {
      // Test for lines 263-280, 286, 293-294
      const mockResidenceId = 'test-residence-id';
      const mockLandlordData = {
        userId: 'test-user-id',
        residenceIds: ['existing-residence-id'],
      };

      // Mock the Excel file parsing to return some apartment data
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValueOnce([
        ['ApartmentName'],
        ['Apt1'],
        ['Apt2'],
      ]);

      // Setup the mock chain
      (createResidence as jest.Mock).mockResolvedValueOnce(mockResidenceId);
      (getLandlord as jest.Mock).mockResolvedValueOnce(mockLandlordData);
      (createApartment as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to create apartment'),
      );
      (updateLandlord as jest.Mock).mockResolvedValueOnce(undefined);

      const { getByTestId, getByText } = renderWithAuth(
        <ResidenceCreationScreen />,
      );

      // Fill form data
      Object.entries(mockValidFormData).forEach(([fieldId, value]) => {
        fireEvent.changeText(getByTestId(fieldId), value);
      });

      // Upload apartment list
      const mockFile = {
        canceled: false,
        assets: [{ name: 'test.xlsx', uri: 'file:///test.xlsx' }],
      };
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(
        mockFile,
      );
      fireEvent.press(getByText('List of Apartments (.xlsx)'));
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

    it('handles null apartment ID response', async () => {
      const mockResidenceId = 'test-residence-id';
      const mockLandlordData = {
        userId: 'test-user-id',
        residenceIds: ['existing-residence-id'],
      };

      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValueOnce([
        ['ApartmentName'],
        ['Apt1'],
      ]);

      (createResidence as jest.Mock).mockResolvedValueOnce(mockResidenceId);
      (getLandlord as jest.Mock).mockResolvedValueOnce(mockLandlordData);
      (createApartment as jest.Mock).mockResolvedValueOnce(null);
      (updateLandlord as jest.Mock).mockResolvedValueOnce(undefined);

      const { getByTestId, getByText } = renderWithAuth(
        <ResidenceCreationScreen />,
      );

      // Fill form data and upload apartment list
      Object.entries(mockValidFormData).forEach(([fieldId, value]) => {
        fireEvent.changeText(getByTestId(fieldId), value);
      });

      const mockFile = {
        canceled: false,
        assets: [{ name: 'test.xlsx', uri: 'file:///test.xlsx' }],
      };
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(
        mockFile,
      );
      fireEvent.press(getByText('List of Apartments (.xlsx)'));

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

  describe('Firebase Error Modal', () => {
    it('displays and handles firebase error modal', async () => {
      // Test for lines 330, 426
      const { getByTestId, getByText } = renderWithAuth(
        <ResidenceCreationScreen />,
      );

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
