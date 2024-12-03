import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import ResidenceCreationScreen from '../screens/landlord/ResidenceCreationScreen';

// Navigation mock
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock custom components
jest.mock('../components/Header', () => 'MockHeader');

jest.mock('../components/CustomTextField', () => 'MockCustomTextField');

jest.mock('../components/CustomButton', () => 'MockCustomButton');

// Mock external components
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

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ResidenceCreationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);
    (FileSystem.copyAsync as jest.Mock).mockResolvedValue(undefined);
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('mock-base64-content');
  });

  describe('Form Input Tests', () => {
    it('should update form fields when user types', () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);

      const fields = [
        { id: 'residence-name', value: 'Test Residence' },
        { id: 'email', value: 'test@example.com' },
        { id: 'website', value: 'https://test.com' }
      ];

      fields.forEach(({ id, value }) => {
        const input = getByTestId(id);
        fireEvent.changeText(input, value);
      });
    });
  });

  describe('File Upload Tests', () => {
    beforeEach(() => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockClear();
    });

    it('should handle excel file upload', async () => {
      const mockExcelFile = {
        canceled: false,
        assets: [{
          name: 'test.xlsx',
          uri: 'file:///test.xlsx'
        }]
      };
      
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(mockExcelFile);

      const { getByTestId, getByText } = render(<ResidenceCreationScreen />);
      
      // Set residence name first
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      
      const uploadButton = getByText('List of Apartments (.xlsx)');
      fireEvent.press(uploadButton);

      await waitFor(() => {
        expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
        expect(FileSystem.copyAsync).toHaveBeenCalled();
      });
    });

    it('should handle file upload cancellation', async () => {
      const mockCancelledUpload = {
        canceled: true,
        assets: null
      };

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(mockCancelledUpload);

      const { getByText } = render(<ResidenceCreationScreen />);
      fireEvent.press(getByText('List of Apartments (.xlsx)'));

      await waitFor(() => {
        expect(FileSystem.copyAsync).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Validation Tests', () => {
    it('should show email validation error', async () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);

      fireEvent.changeText(getByTestId('email'), 'invalid-email');
      fireEvent.press(getByTestId('next-button'));

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('should validate website format', async () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);

      fireEvent.changeText(getByTestId('website'), 'invalid-url');
      fireEvent.press(getByTestId('next-button'));

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission Tests', () => {
    it('should navigate to ResidenceList after successful submission', async () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);

      // Fill required fields
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      fireEvent.changeText(getByTestId('email'), 'test@example.com');
      fireEvent.changeText(getByTestId('website'), 'https://example.com');

      fireEvent.press(getByTestId('next-button'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('ResidenceList');
      });
    });
  });

  describe('Component Rendering Tests', () => {
    it('should render all required form elements', () => {
      const { getByTestId } = render(<ResidenceCreationScreen />);
      
      const requiredElements = [
        'residence-name',
        'email',
        'website',
        'next-button'
      ];

      requiredElements.forEach(elementId => {
        expect(getByTestId(elementId)).toBeTruthy();
      });
    });
  });
});