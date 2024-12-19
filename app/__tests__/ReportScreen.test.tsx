import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
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

jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const ScrollView = require('react-native').ScrollView;
  const KeyboardAwareScrollView = ({
    children,
    ...props
  }: React.PropsWithChildren<any>) => {
    return <ScrollView {...props}>{children}</ScrollView>;
  };

  return {
    KeyboardAwareScrollView,
  };
});

// jest.mock('react-native/Libraries/Utilities/Platform', () => ({
//   OS: 'ios',
//   select: jest.fn((dict) => dict.ios),
//   Version: 123,
// }));

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
<<<<<<< fix/dashboard
  db: {},
  storage: {},
  auth: {},
}));

jest.mock('../../firebase/firestore/firestore', () => ({
  ...jest.requireActual('../../firebase/firestore/firestore'),
  getTenant: jest.fn(),
  updateTenant: jest.fn(),
  updateMaintenanceRequest: jest.fn(),
  getApartment: jest.fn().mockResolvedValue({
    id: 'test-apartment-id',
    apartmentName: 'Test Apartment',
    residenceId: 'test-residence-id',
    tenants: [],
    maintenanceRequests: [],
    situationReportId: [''],
  }),
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
}));
=======
    db: {},
    storage: {},
    auth: {}
  }));

  jest.mock('../../firebase/firestore/firestore', () => ({
    getTenant: jest.fn(),
    updateTenant: jest.fn(),
    updateMaintenanceRequest: jest.fn(),
    updateApartment: jest.fn(),
  }));
  
  jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    addDoc: jest.fn(),
    getFirestore: jest.fn(),
    doc: jest.fn(),
    updateDoc: jest.fn()
  }));
  
  jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(),
    initializeAuth: jest.fn(),
    getReactNativePersistence: jest.fn()
  }));
  
  jest.mock('@react-native-async-storage/async-storage', () => ({
    AsyncStorage: jest.fn()
  }));
  
  jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
    getApp: jest.fn()
  }));
  
  jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    addDoc: jest.fn(() => Promise.resolve({ id: 'test-id' })),
    doc: jest.fn(),
    updateDoc: jest.fn(),
    getFirestore: jest.fn(),
    getDocs: jest.fn(),
    query: jest.fn(),
    where: jest.fn()
  }));
>>>>>>> main
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
    // Mock all required Firebase functions
    const mockNavigate = jest.fn();
<<<<<<< fix/dashboard
    jest
      .spyOn(require('@react-navigation/native'), 'useNavigation')
      .mockReturnValue({
        navigate: mockNavigate,
      });

    const { getByTestId } = render(<ReportScreen />);
=======
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: mockNavigate
    });

    // Mock updateApartment function
    jest.mock('../../firebase/firestore/firestore', () => ({
      ...jest.requireActual('../../firebase/firestore/firestore'),
      updateApartment: jest.fn().mockResolvedValue(undefined),
    }));

    const { getByTestId } = render(<ReportScreen />);
    
    // Fill in form fields
    fireEvent.changeText(getByTestId('testIssueNameField'), 'Test Issue');
    fireEvent.changeText(getByTestId('testRoomNameField'), 'Test Room');
    fireEvent.changeText(getByTestId('testDescriptionField'), 'Test Description');

    // Mock file blob
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    (CacheUtils.getFileBlob as jest.Mock).mockResolvedValue(mockBlob);
    
    // Mock Firebase storage operations
    const mockStorageRef = { toString: () => 'storage-ref' };
    const mockUploadResult = {};
    const mockDownloadURL = 'test-url';
    
    require('firebase/storage').ref.mockReturnValue(mockStorageRef);
    require('firebase/storage').uploadBytes.mockResolvedValue(mockUploadResult);
    require('firebase/storage').getDownloadURL.mockResolvedValue(mockDownloadURL);

    // Mock Firestore operations
    const mockRequest = { id: 'test-id' };
    const mockFirestore = require('firebase/firestore');
    mockFirestore.addDoc.mockResolvedValue(mockRequest);
    
    await fireEvent.press(getByTestId('testSubmitButton'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'Your maintenance request has been submitted.');
    });
  });
});
>>>>>>> main

    await act(async () => {
      fireEvent.changeText(getByTestId('testIssueNameField'), 'Test Issue');
      fireEvent.changeText(getByTestId('testRoomNameField'), 'Test Room');
      fireEvent.changeText(
        getByTestId('testDescriptionField'),
        'Test Description',
      );

      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      (CacheUtils.getFileBlob as jest.Mock).mockResolvedValue(mockBlob);

      const mockRequest = { id: 'test-id' };
      const mockFirestore = require('firebase/firestore');
      mockFirestore.addDoc.mockResolvedValueOnce(mockRequest);

      fireEvent.press(getByTestId('testSubmitButton'));
    });

    await waitFor(
      () => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success',
          'Your maintenance request has been submitted.',
        );
      },
      { timeout: 3000 },
    );
  });

  it('navigates to the correct screen based on tick state after submission', async () => {
    const mockNavigate = jest.fn();
    jest
      .spyOn(require('@react-navigation/native'), 'useNavigation')
      .mockReturnValue({
        navigate: mockNavigate,
      });

    // Set up all the necessary mocks
    const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
    (CacheUtils.getFileBlob as jest.Mock).mockResolvedValue(mockBlob);
    mockGetTenant.mockResolvedValue({
      ...mockTenant,
      maintenanceRequests: [],
    });
    mockUpdateTenant.mockResolvedValue(undefined);
    mockUpdateMaintenanceRequest.mockResolvedValue(undefined);

    const { getByTestId } = render(<ReportScreen />);

    // Fill out form
    await act(async () => {
      fireEvent.changeText(getByTestId('testIssueNameField'), 'Test Issue');
      fireEvent.changeText(getByTestId('testRoomNameField'), 'Test Room');
      fireEvent.changeText(
        getByTestId('testDescriptionField'),
        'Test Description',
      );
    });

    // Important: Make sure the checkbox is checked before submission
    await act(async () => {
      // Since we're using react-native-bouncy-checkbox, we need to trigger its onPress
      const checkbox = getByTestId('messaging-checkbox');
      fireEvent(checkbox, 'onPress', true);
    });

    // Submit form
    await act(async () => {
      fireEvent.press(getByTestId('testSubmitButton'));
    });

    // Wait for navigation with increased timeout
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('Messaging', {
          chatID: 'test-id',
        });
      },
      { timeout: 5000 },
    );
  });
});
