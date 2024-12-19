import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ReportScreen from '../screens/issues_tenant/ReportScreen';
import * as AuthContext from '../context/AuthContext';
import * as PictureContext from '../context/PictureContext';
import * as FirestoreModule from '../../firebase/firestore/firestore';
import * as CacheUtils from '../utils/cache';
import 'react-native-gesture-handler/jestSetup';

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://document-directory/',
  cacheDirectory: 'file://cache-directory/',
  makeDirectoryAsync: jest.fn(),
  getInfoAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  moveAsync: jest.fn(),
  copyAsync: jest.fn(),
  downloadAsync: jest.fn(),
  EncodingType: {
    UTF8: 'utf8',
    Base64: 'base64',
  },
}));

// Add these mocks at the top of your test file, before the describe block
jest.mock('firebase/storage', () => ({
  ref: jest.fn(() => ({
    toString: () => 'storage-ref',
  })),
  uploadBytes: jest.fn(() => Promise.resolve()),
  getDownloadURL: jest.fn(() => Promise.resolve('test-url')),
}));

jest.mock('@expo/vector-icons', () => ({
  AntDesign: 'AntDesign',
}));

jest.mock('@expo/vector-icons/build/Icons', () => ({
  AntDesign: 'AntDesign',
}));

jest.mock('react-native-bouncy-checkbox', () => 'BouncyCheckbox');

jest.mock('../components/Header', () => 'Header');

jest.mock('react-native-elements', () => ({
  Button: 'Button',
}));

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    ScrollView: View,
    State: {},
    PanGestureHandler: View,
    BaseButton: View,
    Directions: {},
  };
});

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../context/PictureContext', () => ({
  usePictureContext: jest.fn(),
}));

jest.mock('../../firebase/firebase', () => ({
  db: {},
  storage: {},
  auth: {},
}));

jest.mock('../../firebase/firestore/firestore', () => ({
  getTenant: jest.fn(),
  updateTenant: jest.fn(),
  updateMaintenanceRequest: jest.fn(),
  createNews: jest.fn(),
  updateApartment: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getFirestore: jest.fn(),
  doc: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  AsyncStorage: jest.fn(),
}));

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApp: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve({ id: 'test-id' })),
  doc: jest.fn(),
  updateDoc: jest.fn(),
  getFirestore: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  Timestamp: {
    now: () => ({
      seconds: 1234567890,
      nanoseconds: 123456789,
    }),
  },
}));

jest.mock('../utils/cache');

describe('ReportScreen', () => {
  const mockNavigation = { navigate: jest.fn() };
  const mockUser = { uid: 'test-uid' };
  const mockTenant = {
    userId: 'test-uid',
    residenceId: 'test-residence',
    apartmentId: 'test-apartment',
    maintenanceRequests: [],
  };
  const mockPictureContext = {
    pictureList: ['test-image-1.jpg'],
    resetPictureList: jest.fn(),
    removePicture: jest.fn(),
  };

  const mockGetTenant = FirestoreModule.getTenant as jest.Mock;
  const mockUpdateTenant = FirestoreModule.updateTenant as jest.Mock;
  const mockUpdateMaintenanceRequest =
    FirestoreModule.updateMaintenanceRequest as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (AuthContext.useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (PictureContext.usePictureContext as jest.Mock).mockReturnValue(
      mockPictureContext,
    );
    mockGetTenant.mockResolvedValue(mockTenant);
    mockUpdateTenant.mockResolvedValue(undefined);
    mockUpdateMaintenanceRequest.mockResolvedValue(undefined);
    jest.spyOn(Alert, 'alert');
  });

  it('renders correctly', () => {
    const { getByTestId, getByText } = render(<ReportScreen />);
    expect(getByTestId('testIssueNameField')).toBeTruthy();
    expect(getByTestId('testRoomNameField')).toBeTruthy();
    expect(getByTestId('testDescriptionField')).toBeTruthy();
    expect(getByText('Create a new issue')).toBeTruthy();
  });

  it('validates required fields', () => {
    const { getByTestId } = render(<ReportScreen />);
    const submitButton = getByTestId('testSubmitButton');

    expect(submitButton.props.disabled).toBe(true);

    fireEvent.changeText(getByTestId('testIssueNameField'), 'Test Issue');
    expect(submitButton.props.disabled).toBe(true);

    fireEvent.changeText(getByTestId('testRoomNameField'), 'Test Room');
    expect(submitButton.props.disabled).toBe(true);

    fireEvent.changeText(
      getByTestId('testDescriptionField'),
      'Test Description',
    );
    expect(submitButton.props.disabled).toBe(false);
  });

  it('enables submit button only when all required fields are filled', () => {
    const { getByTestId } = render(<ReportScreen />);
    const submitButton = getByTestId('testSubmitButton');

    expect(submitButton.props.disabled).toBe(true);

    fireEvent.changeText(getByTestId('testIssueNameField'), 'Test Issue');
    expect(submitButton.props.disabled).toBe(true);

    fireEvent.changeText(getByTestId('testRoomNameField'), 'Test Room');
    expect(submitButton.props.disabled).toBe(true);

    fireEvent.changeText(
      getByTestId('testDescriptionField'),
      'Test Description',
    );
    expect(submitButton.props.disabled).toBe(false);
  });

  it('shows error alert on submission failure', async () => {
    mockUpdateTenant.mockRejectedValueOnce(new Error('Network error'));

    const { getByTestId } = render(<ReportScreen />);

    fireEvent.changeText(getByTestId('testIssueNameField'), 'Test Issue');
    fireEvent.changeText(getByTestId('testRoomNameField'), 'Test Room');
    fireEvent.changeText(
      getByTestId('testDescriptionField'),
      'Test Description',
    );

    fireEvent.press(getByTestId('testSubmitButton'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'There was an error submitting your request. Please try again.',
      );
    });
  });

  it('handles tenant not found error', async () => {
    mockGetTenant.mockResolvedValueOnce(null);

    const { getByTestId } = render(<ReportScreen />);

    fireEvent.changeText(getByTestId('testIssueNameField'), 'Test Issue');
    fireEvent.changeText(getByTestId('testRoomNameField'), 'Test Room');
    fireEvent.changeText(
      getByTestId('testDescriptionField'),
      'Test Description',
    );

    await fireEvent.press(getByTestId('testSubmitButton'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Tenant not found');
    });
  });

  it('handles picture upload failure', async () => {
    const { getByTestId } = render(<ReportScreen />);

    (CacheUtils.getFileBlob as jest.Mock).mockRejectedValue(
      new Error('Upload failed'),
    );

    fireEvent.changeText(getByTestId('testIssueNameField'), 'Test Issue');
    fireEvent.changeText(getByTestId('testRoomNameField'), 'Test Room');
    fireEvent.changeText(
      getByTestId('testDescriptionField'),
      'Test Description',
    );

    await fireEvent.press(getByTestId('testSubmitButton'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', expect.any(String));
    });
  });

  it('handles picture upload failure', async () => {
    const { getByTestId } = render(<ReportScreen />);

    (CacheUtils.getFileBlob as jest.Mock).mockRejectedValue(
      new Error('Upload failed'),
    );

    fireEvent.changeText(getByTestId('testIssueNameField'), 'Test Issue');
    fireEvent.changeText(getByTestId('testRoomNameField'), 'Test Room');
    fireEvent.changeText(
      getByTestId('testDescriptionField'),
      'Test Description',
    );

    await fireEvent.press(getByTestId('testSubmitButton'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', expect.any(String));
    });
  });
  it('resets states properly', async () => {
    const { getByTestId } = render(<ReportScreen />);

    fireEvent.changeText(getByTestId('testIssueNameField'), 'Test Issue');
    fireEvent.changeText(getByTestId('testRoomNameField'), 'Test Room');
    fireEvent.changeText(
      getByTestId('testDescriptionField'),
      'Test Description',
    );

    fireEvent.press(getByTestId('close-button'));
    fireEvent.press(getByTestId('yes-close-button'));

    await waitFor(() => {
      expect(getByTestId('testIssueNameField').props.value).toBe('');
      expect(getByTestId('testRoomNameField').props.value).toBe('');
      expect(getByTestId('testDescriptionField').props.value).toBe('');
      expect(mockPictureContext.resetPictureList).toHaveBeenCalled();
      expect(CacheUtils.clearFiles).toHaveBeenCalled();
    });
  });

  it('handles useEffect cleanup properly', () => {
    const { unmount } = render(<ReportScreen />);

    unmount();

    expect(mockPictureContext.resetPictureList).toHaveBeenCalled();
  });

  it('handles successful submission with pictures', async () => {
    console.log('Starting test setup');

    // Mock Firestore addDoc to resolve successfully
    const mockAddDoc = jest.fn().mockImplementation(async () => {
      console.log('mockAddDoc called');
      return { id: 'test-request-id' };
    });
    const mockUpdateApartment = FirestoreModule.updateApartment as jest.Mock;
    mockUpdateApartment.mockResolvedValue(undefined);

    // Mock Firestore functions with logging
    jest
      .spyOn(require('firebase/firestore'), 'collection')
      .mockReturnValue('test-collection');
    jest
      .spyOn(require('firebase/firestore'), 'addDoc')
      .mockImplementation(mockAddDoc);

    // Mock navigation

    const mockNavigate = jest.fn();
    jest
      .spyOn(require('@react-navigation/native'), 'useNavigation')
      .mockReturnValue({ navigate: mockNavigate });

    // Setup tenant mock with immediate resolution
    const mockTenant = {
      userId: 'test-uid',
      residenceId: 'test-residence',
      apartmentId: 'test-apartment',
      maintenanceRequests: [],
    };

    // Mock all Firestore module functions with immediate resolution
    (FirestoreModule.getTenant as jest.Mock).mockImplementation(async () => {
      console.log('getTenant called');
      return mockTenant;
    });

    (FirestoreModule.updateTenant as jest.Mock).mockImplementation(async () => {
      console.log('updateTenant called');
      return undefined;
    });

    (FirestoreModule.updateMaintenanceRequest as jest.Mock).mockImplementation(
      async () => {
        console.log('updateMaintenanceRequest called');
        return undefined;
      },
    );

    (FirestoreModule.createNews as jest.Mock).mockImplementation(async () => {
      console.log('createNews called');
      return undefined;
    });

    // Mock storage functions with immediate resolution
    const { uploadBytes, getDownloadURL, ref } = require('firebase/storage');
    (ref as jest.Mock).mockReturnValue({
      toString: () => 'storage-ref',
    });
    (uploadBytes as jest.Mock).mockImplementation(async () => {
      console.log('uploadBytes called');
      return undefined;
    });
    (getDownloadURL as jest.Mock).mockImplementation(async () => {
      console.log('getDownloadURL called');
      return 'test-image-url';
    });

    // Mock cache utility with immediate resolution
    (CacheUtils.getFileBlob as jest.Mock).mockImplementation(async () => {
      console.log('getFileBlob called');
      return new Blob(['test']);
    });

    // Mock contexts
    (AuthContext.useAuth as jest.Mock).mockReturnValue({
      user: { uid: 'test-uid' },
    });

    (PictureContext.usePictureContext as jest.Mock).mockReturnValue({
      pictureList: ['test-image-1.jpg'],
      resetPictureList: jest.fn(),
      removePicture: jest.fn(),
    });

    console.log('Rendering component');
    const { getByTestId } = render(<ReportScreen />);

    // Fill in form fields
    console.log('Filling form fields');
    fireEvent.changeText(getByTestId('testIssueNameField'), 'Test Issue');
    fireEvent.changeText(getByTestId('testRoomNameField'), 'Test Room');
    fireEvent.changeText(
      getByTestId('testDescriptionField'),
      'Test Description',
    );

    console.log('Submitting form');
    await fireEvent.press(getByTestId('testSubmitButton'));

    try {
      await waitFor(
        () => {
          console.log('Checking Alert.alert calls');
          expect(Alert.alert).toHaveBeenCalledWith(
            'Success',
            'Your maintenance request has been submitted.',
          );
        },
        { timeout: 1000, interval: 100 },
      ); // Shorter timeout with more frequent checks
    } catch (error) {
      console.error('Test failed:', error);
      console.log('Alert.alert calls:', (Alert.alert as jest.Mock).mock.calls);
      throw error;
    }

    console.log('Verifying other expectations');
    expect(mockNavigate).toHaveBeenCalledWith('Issues');
    expect(mockAddDoc).toHaveBeenCalled();
    expect(uploadBytes).toHaveBeenCalled();
    expect(getDownloadURL).toHaveBeenCalled();
    expect(FirestoreModule.createNews).toHaveBeenCalled();
  }, 10000); // Increase timeout to 10 seconds for this test
});
