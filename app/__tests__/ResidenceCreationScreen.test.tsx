jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const { ScrollView } = require('react-native');
  return {
    KeyboardAwareScrollView: ScrollView,
  };
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import ResidenceCreationScreen from '../screens/landlord/ResidenceCreationScreen';
import { AuthContext } from '../context/AuthContext';
import {
  createApartment,
  createResidence,
  updateResidence,
  getLandlord,
  updateLandlord,
} from '../../firebase/firestore/firestore';

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
    Sheets: { Sheet1: {} },
  })),
  utils: {
    sheet_to_json: jest.fn(() => [['Header'], ['Apt1'], ['Apt2']]),
  },
}));

jest.mock('../../firebase/firestore/firestore', () => ({
  createResidence: jest.fn(),
  createApartment: jest.fn(),
  updateResidence: jest.fn(),
  getLandlord: jest.fn(),
  updateLandlord: jest.fn(),
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
  const mockValidFormData = {
    'residence-name': 'Test Residence',
    address: '123 Test St',
    number: '123',
    'zip-code': '12345',
    city: 'Test City',
    'province-state': 'Test Province',
    country: 'Test Country',
    description: 'Test Description',
    website: 'https://example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);
    (FileSystem.copyAsync as jest.Mock).mockResolvedValue(undefined);
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
      'mock-base64-content',
    );
  });

  describe('Rendering', () => {
    it('renders all form fields', () => {
      const { getByTestId } = renderWithAuth(<ResidenceCreationScreen />);

      // Check for all required fields
      Object.keys(mockValidFormData).forEach((fieldId) => {
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
    it('validates website format', async () => {
      const { getByTestId, queryByText } = renderWithAuth(
        <ResidenceCreationScreen />,
      );

      fireEvent.changeText(getByTestId('website'), 'invalid-url');
      fireEvent.press(getByTestId('next-button'));

      await waitFor(() => {
        expect(queryByText('Please enter a valid website URL')).toBeTruthy();
      });

      // Clear error on valid input
      fireEvent.changeText(getByTestId('website'), 'https://valid-url.com');
      expect(queryByText('Please enter a valid website URL')).toBeFalsy();
    });

    it('accepts valid form submission', async () => {
      const mockResidenceId = 'test-residence-id';
      const mockLandlordData = {
        userId: 'test-user-id',
        residenceIds: ['existing-residence-id'],
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
          residenceIds: ['existing-residence-id', mockResidenceId],
        });
        expect(mockNavigate).toHaveBeenCalledWith('ResidenceList');
      });
    });
  });

  describe('File Upload Handling', () => {
    it('handles excel file upload', async () => {
      const mockFile = {
        canceled: false,
        assets: [
          {
            name: 'test.xlsx',
            uri: 'file:///test.xlsx',
          },
        ],
      };
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(
        mockFile,
      );

      const { getByTestId, getByText } = renderWithAuth(
        <ResidenceCreationScreen />,
      );
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
        canceled: true,
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
        assets: [
          {
            name: 'test.txt',
            uri: 'file:///test.txt',
          },
        ],
      };
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(
        mockFile,
      );

      const { getByTestId, getByText } = renderWithAuth(
        <ResidenceCreationScreen />,
      );
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      fireEvent.press(getByText('List of Apartments (.xlsx)'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Invalid file type',
          expect.any(String),
        );
      });
    });

    it('requires residence name before file upload', async () => {
      const mockFile = {
        canceled: false,
        assets: [
          {
            name: 'test.xlsx',
            uri: 'file:///test.xlsx',
          },
        ],
      };
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(
        mockFile,
      );

      const { getByText } = renderWithAuth(<ResidenceCreationScreen />);
      fireEvent.press(getByText('List of Apartments (.xlsx)'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Please enter a residence name first',
        );
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
    });

    it('handles file system directory creation errors', async () => {
      const mockFile = {
        canceled: false,
        assets: [{ name: 'test.jpg', uri: 'file:///test.jpg' }],
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
      fireEvent.press(getByText('Pictures of residence'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to upload file',
        );
        expect(console.error).toHaveBeenCalled();
      });
    });
  });

  describe('File System Error Handling', () => {
    it('handles directory creation errors', async () => {
      const mockError = new Error('File system error');
      (FileSystem.makeDirectoryAsync as jest.Mock).mockRejectedValueOnce(
        mockError,
      );

      const mockFile = {
        canceled: false,
        assets: [
          {
            name: 'test.xlsx',
            uri: 'file:///test.xlsx',
          },
        ],
      };
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(
        mockFile,
      );

      const { getByTestId, getByText } = renderWithAuth(
        <ResidenceCreationScreen />,
      );
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');
      fireEvent.press(getByText('List of Apartments (.xlsx)'));

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to upload file',
        );
        expect(console.error).toHaveBeenCalledWith(mockError);
      });
    });

    it('handles excel parsing errors', async () => {
      const mockError = new Error('Parse error');
      (XLSX.utils.sheet_to_json as jest.Mock).mockImplementationOnce(() => {
        throw mockError;
      });

      const mockFile = {
        canceled: false,
        assets: [
          {
            name: 'test.xlsx',
            uri: 'file:///test.xlsx',
          },
        ],
      };
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(
        mockFile,
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
        expect(console.error).toHaveBeenCalledWith(mockError);
      });
    });
  });

  describe('Picture Upload Handling', () => {
    it('handles multiple picture uploads', async () => {
      const mockPicture1 = {
        canceled: false,
        assets: [
          {
            name: 'test1.jpg',
            uri: 'file:///test1.jpg',
          },
        ],
      };
      const mockPicture2 = {
        canceled: false,
        assets: [
          {
            name: 'test2.jpg',
            uri: 'file:///test2.jpg',
          },
        ],
      };

      (DocumentPicker.getDocumentAsync as jest.Mock)
        .mockResolvedValueOnce(mockPicture1)
        .mockResolvedValueOnce(mockPicture2);

      const { getByTestId, getByText } = renderWithAuth(
        <ResidenceCreationScreen />,
      );
      fireEvent.changeText(getByTestId('residence-name'), 'Test Residence');

      // Upload first picture
      fireEvent.press(getByText('Pictures of residence'));
      await waitFor(() => {
        expect(getByText('1 pictures uploaded')).toBeTruthy();
      });

      // Upload second picture
      fireEvent.press(getByText('1 pictures uploaded'));
      await waitFor(() => {
        expect(getByText('2 pictures uploaded')).toBeTruthy();
      });
    });

    it('handles picture upload errors', async () => {
      const mockError = new Error('Upload failed');
      (FileSystem.copyAsync as jest.Mock).mockRejectedValueOnce(mockError);

      const mockPicture = {
        canceled: false,
        assets: [
          {
            name: 'test.jpg',
            uri: 'file:///test.jpg',
          },
        ],
      };
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce(
        mockPicture,
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
        expect(console.error).toHaveBeenCalledWith(mockError);
      });
    });
  });

  describe('Form Error Handling', () => {
    it('clears field errors when input changes', async () => {
      const { getByTestId, queryByText } = renderWithAuth(
        <ResidenceCreationScreen />,
      );

      // First create an error
      fireEvent.changeText(getByTestId('website'), 'invalid-url');
      fireEvent.press(getByTestId('next-button'));

      await waitFor(() => {
        expect(queryByText('Please enter a valid website URL')).toBeTruthy();
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
        expect(getByText('2 apartments loaded')).toBeTruthy();
      });

      // Submit form
      fireEvent.press(getByTestId('next-button'));

      await waitFor(() => {
        expect(getByTestId('FirebaseErrorModal')).toBeTruthy();
        expect(getByText('Failed to create apartments')).toBeTruthy();
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
        expect(getByText('1 apartments loaded')).toBeTruthy();
      });

      fireEvent.press(getByTestId('next-button'));

      await waitFor(() => {
        expect(getByTestId('FirebaseErrorModal')).toBeTruthy();
        expect(getByText('Failed to create apartment Apt1')).toBeTruthy();
      });
    });
  });

  describe('Firebase Error Modal', () => {
    it('displays and handles firebase error modal', async () => {
      // Test for lines 330, 426
      const { getByTestId, getByText } = renderWithAuth(
        <ResidenceCreationScreen />,
      );

      // Trigger a Firebase error
      (createResidence as jest.Mock).mockResolvedValueOnce(null);

      // Fill form data and submit
      Object.entries(mockValidFormData).forEach(([fieldId, value]) => {
        fireEvent.changeText(getByTestId(fieldId), value);
      });
      fireEvent.press(getByTestId('next-button'));

      await waitFor(() => {
        const errorModal = getByTestId('FirebaseErrorModal');
        expect(errorModal).toBeTruthy();
        expect(getByText('Failed to create residence')).toBeTruthy();
      });
    });
  });
});
