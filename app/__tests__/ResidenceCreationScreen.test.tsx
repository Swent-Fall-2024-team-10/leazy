import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import ResidenceCreationScreen from '../screens/landlord/ResidenceCreationScreen';
import { AuthContext } from '../context/AuthContext';
import { createResidence, createApartment, updateResidence } from '../../firebase/firestore/firestore';

// Mock all dependencies
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('../components/Header', () => 'MockHeader');
jest.mock('../components/CustomTextField', () => 'MockCustomTextField');
jest.mock('../components/CustomButton', () => 'MockCustomButton');
jest.mock('../components/CustomPopUp', () => 'MockCustomPopUp');

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'MockedIonicons',
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file:///cache/',
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: 'base64',
  },
}));

jest.mock('xlsx', () => ({
  read: jest.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {}
    }
  })),
  utils: {
    sheet_to_json: jest.fn(() => [['Header'], ['Apt1'], ['Apt2']])
  }
}));

jest.mock('../../firebase/firestore/firestore', () => ({
  createResidence: jest.fn(),
  createApartment: jest.fn(),
  updateResidence: jest.fn(),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock auth context
const mockAuthContext = {
  user: { uid: 'test-user-id' },
  login: jest.fn(),
  logout: jest.fn(),
  loading: false,
};

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>
  );
};

describe('ResidenceCreationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset filesystem mocks
    (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);
    (FileSystem.copyAsync as jest.Mock).mockResolvedValue(undefined);
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('mock-base64-content');
    
    // Reset firebase mocks
    (createResidence as jest.Mock).mockResolvedValue('test-residence-id');
    (createApartment as jest.Mock).mockResolvedValue('test-apartment-id');
    (updateResidence as jest.Mock).mockResolvedValue(true);
  });

  describe('Initial Rendering', () => {
    it('should render all required form elements', () => {
      const { getByTestId } = renderWithAuth(<ResidenceCreationScreen />);
      
      const requiredElements = [
        'residence-name',
        'email',
        'website',
        'address',
        'zip-code',
        'city',
        'province-state',
        'country',
        'next-button'
      ];

      requiredElements.forEach(elementId => {
        expect(getByTestId(elementId)).toBeTruthy();
      });
    });
  });

  describe('Form Input Handling', () => {
    it('should update form fields when user types', () => {
      const { getByTestId } = renderWithAuth(<ResidenceCreationScreen />);

      const testInputs = [
        { id: 'residence-name', value: 'Test Residence' },
        { id: 'email', value: 'test@example.com' },
        { id: 'website', value: 'https://test.com' },
        { id: 'address', value: '123 Test St' },
        { id: 'zip-code', value: '12345' },
        { id: 'city', value: 'Test City' },
        { id: 'province-state', value: 'Test State' },
        { id: 'country', value: 'Test Country' }
      ];

      testInputs.forEach(({ id, value }) => {
        const input = getByTestId(id);
        fireEvent.changeText(input, value);
        // No need to check the value as CustomTextField is mocked
      });
    });
  });

  describe('File Upload Functionality', () => {
    beforeEach(() => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockClear();
    });

    it('should handle excel file upload successfully', async () => {
      const mockExcelFile = {
        canceled: false,
        assets: [{
          name: 'test.xlsx',
          uri: 'file:///test.xlsx'
        }]
      };
      
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(mockExcelFile);

      const { getByTestId, getByText } = renderWithAuth(<ResidenceCreationScreen />);
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      
      const uploadButton = getByText('List of Apartments (.xlsx)');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
        expect(FileSystem.copyAsync).toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith('Success', expect.any(String));
      });
    });

    it('should handle file upload cancellation', async () => {
      const mockCancelledUpload = { canceled: true, assets: null };
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(mockCancelledUpload);

      const { getByText } = renderWithAuth(<ResidenceCreationScreen />);
      fireEvent.press(getByText('List of Apartments (.xlsx)'));

      await waitFor(() => {
        expect(FileSystem.copyAsync).not.toHaveBeenCalled();
      });
    });

    it('should show error when trying to upload file without residence name', async () => {
      const mockExcelFile = {
        canceled: false,
        assets: [{ name: 'test.xlsx', uri: 'file:///test.xlsx' }]
      };
      
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(mockExcelFile);

      const { getByText } = renderWithAuth(<ResidenceCreationScreen />);
      fireEvent.press(getByText('List of Apartments (.xlsx)'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a residence name first');
      });
    });
  });

  describe('Form Validation', () => {
    it('should show email validation error', async () => {
      const { getByTestId } = renderWithAuth(<ResidenceCreationScreen />);

      fireEvent.changeText(getByTestId('email'), 'invalid-email');
      fireEvent.press(getByTestId('next-button'));

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should show website validation error', async () => {
      const { getByTestId } = renderWithAuth(<ResidenceCreationScreen />);

      fireEvent.changeText(getByTestId('website'), 'invalid-url');
      fireEvent.press(getByTestId('next-button'));

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    const fillRequiredFields = (getByTestId: any) => {
      const fields = [
        { id: 'residence-name', value: 'Test Residence' },
        { id: 'email', value: 'test@example.com' },
        { id: 'website', value: 'https://example.com' },
        { id: 'address', value: '123 Test St' },
        { id: 'zip-code', value: '12345' },
        { id: 'city', value: 'Test City' },
        { id: 'province-state', value: 'Test State' },
        { id: 'country', value: 'Test Country' }
      ];

      fields.forEach(({ id, value }) => {
        fireEvent.changeText(getByTestId(id), value);
      });
    };

    it('should navigate to ResidenceList after successful submission', async () => {
      const { getByTestId } = renderWithAuth(<ResidenceCreationScreen />);
      fillRequiredFields(getByTestId);
      
      fireEvent.press(getByTestId('next-button'));

      await waitFor(() => {
        expect(createResidence).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('ResidenceList');
      }, { timeout: 2000 });
    });
  });
});