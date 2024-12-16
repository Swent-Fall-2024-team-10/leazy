import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import ResidenceCreationScreen from '../screens/landlord/ResidenceCreationScreen';
import { AuthContext } from '../context/AuthContext';
import { createApartment, createResidence, updateResidence, getLandlord, updateLandlord } from '../../firebase/firestore/firestore';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
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
  cacheDirectory: 'file:///cache/',
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  EncodingType: { Base64: 'base64' },
}));

jest.mock('xlsx', () => ({
  read: jest.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: { Sheet1: {} }
  })),
  utils: {
    sheet_to_json: jest.fn(() => [['Header'], ['Apt1'], ['Apt2']])
  }
}));

jest.mock('../../firebase/firestore/firestore', () => ({
  createResidence: jest.fn(),
  createApartment: jest.fn(),
  updateResidence: jest.fn(),
  getLandlord: jest.fn(),
  updateLandlord: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

// Test utilities
const mockUser = {
  uid: 'test-user-id',
};

const mockAuthContext = {
  user: mockUser,
  firebaseUser: null,
  tenant: null,
  landlord: null,
  signIn: jest.fn(),
  signOut: jest.fn(),
  loading: false,
  isLoading: false
};

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>
  );
};

describe('ResidenceCreationScreen', () => {
  const mockValidFormData = {
    'residence-name': 'Test Residence',
    'email': 'test@example.com',
    'address': '123 Test St',
    'number': '42',
    'zip-code': '12345',
    'city': 'Test City',
    'province-state': 'Test State',
    'country': 'Test Country',
    'description': 'Test Description',
    'website': 'https://example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);
    (FileSystem.copyAsync as jest.Mock).mockResolvedValue(undefined);
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('mock-base64-content');
  });

  describe('Rendering', () => {
    it('renders all form fields', () => {
      const { getByTestId } = renderWithAuth(<ResidenceCreationScreen />);
      
      Object.keys(mockValidFormData).forEach(fieldId => {
        expect(getByTestId(fieldId)).toBeTruthy();
      });
      expect(getByTestId('next-button')).toBeTruthy();
    });

    it('renders upload buttons', () => {
      const { getByText } = renderWithAuth(<ResidenceCreationScreen />);
      
      expect(getByText('List of Apartments (.xlsx)')).toBeTruthy();
      expect(getByText('Proof of Ownership')).toBeTruthy();
      expect(getByText('Pictures of residence')).toBeTruthy();
    });
  });

  describe('Form Input Handling', () => {
    it('updates form fields on user input', () => {
      const { getByTestId } = renderWithAuth(<ResidenceCreationScreen />);
      
      Object.entries(mockValidFormData).forEach(([fieldId, value]) => {
        const input = getByTestId(fieldId);
        fireEvent.changeText(input, value);
        expect(input.props.value).toBe(value);
      });
    });

    it('handles numeric input correctly', () => {
      const { getByTestId } = renderWithAuth(<ResidenceCreationScreen />);
      const numberInput = getByTestId('number');
      
      fireEvent.changeText(numberInput, '42');
      expect(numberInput.props.value).toBe('42');
      
      fireEvent.changeText(numberInput, 'abc');
      expect(numberInput.props.keyboardType).toBe('numeric');
    });
  });

  describe('Validation', () => {
    it('validates email format', async () => {
      const { getByTestId, queryByText } = renderWithAuth(<ResidenceCreationScreen />);
      
      fireEvent.changeText(getByTestId('email'), 'invalid-email');
      fireEvent.press(getByTestId('next-button'));
      
      await waitFor(() => {
        expect(queryByText('Please enter a valid email address')).toBeTruthy();
      });
    });

    it('validates website format', async () => {
      const { getByTestId, queryByText } = renderWithAuth(<ResidenceCreationScreen />);
      
      fireEvent.changeText(getByTestId('website'), 'invalid-url');
      fireEvent.press(getByTestId('next-button'));
      
      await waitFor(() => {
        expect(queryByText('Please enter a valid website URL')).toBeTruthy();
      });
    });

    it('accepts valid form submission', async () => {
      const mockResidenceId = 'test-residence-id';
      const mockLandlordData = {
        userId: 'test-user-id',
        residenceIds: ['existing-residence-id']
      };

      (createResidence as jest.Mock).mockResolvedValueOnce(mockResidenceId);
      (getLandlord as jest.Mock).mockResolvedValueOnce(mockLandlordData);
      (updateLandlord as jest.Mock).mockResolvedValueOnce(undefined);
      
      const { getByTestId } = renderWithAuth(<ResidenceCreationScreen />);
      
      Object.entries(mockValidFormData).forEach(([fieldId, value]) => {
        fireEvent.changeText(getByTestId(fieldId), value);
      });
      
      fireEvent.press(getByTestId('next-button'));
      
      await waitFor(() => {
        expect(createResidence).toHaveBeenCalled();
        expect(getLandlord).toHaveBeenCalledWith('test-user-id');
        expect(updateLandlord).toHaveBeenCalledWith('test-user-id', {
          userId: 'test-user-id',
          residenceIds: ['existing-residence-id', mockResidenceId]
        });
        expect(mockNavigate).toHaveBeenCalledWith('ResidenceList');
      });
    });
  });

  describe('File Upload Handling', () => {
    it('handles excel file upload', async () => {
      const mockFile = {
        canceled: false,
        assets: [{
          name: 'test.xlsx',
          uri: 'file:///test.xlsx'
        }]
      };
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(mockFile);

      const { getByTestId, getByText } = renderWithAuth(<ResidenceCreationScreen />);
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      fireEvent.press(getByText('List of Apartments (.xlsx)'));

      await waitFor(() => {
        expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
        expect(FileSystem.copyAsync).toHaveBeenCalled();
        expect(FileSystem.readAsStringAsync).toHaveBeenCalled();
      });
    });

    it('handles upload cancellation', async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
        canceled: true
      });

      const { getByText } = renderWithAuth(<ResidenceCreationScreen />);
      fireEvent.press(getByText('List of Apartments (.xlsx)'));

      await waitFor(() => {
        expect(FileSystem.copyAsync).not.toHaveBeenCalled();
      });
    });

    it('validates file extensions', async () => {
      const mockFile = {
        canceled: false,
        assets: [{
          name: 'test.txt',
          uri: 'file:///test.txt'
        }]
      };
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(mockFile);

      const { getByTestId, getByText } = renderWithAuth(<ResidenceCreationScreen />);
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      fireEvent.press(getByText('List of Apartments (.xlsx)'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Invalid file type',
          expect.any(String)
        );
      });
    });

    it('requires residence name before file upload', async () => {
      const mockFile = {
        canceled: false,
        assets: [{
          name: 'test.xlsx',
          uri: 'file:///test.xlsx'
        }]
      };
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(mockFile);

      const { getByText } = renderWithAuth(<ResidenceCreationScreen />);
      fireEvent.press(getByText('List of Apartments (.xlsx)'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please enter a residence name first'
        );
      });
    });
  });
});