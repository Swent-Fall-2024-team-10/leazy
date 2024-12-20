import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ManageMachinesScreen from '../../../screens/laundry_machines/ManageMachinesScreen';
import * as firestoreModule from '../../../../firebase/firestore/firestore';
import { getFirestore } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { AuthProvider } from '../../../context/AuthContext';

jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(() => ({
    type: 'asyncStorage'
  }))
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  memoryLocalCache: jest.fn(),
  initializeFirestore: jest.fn(),
  Timestamp: {
    fromMillis: (milliseconds: number) => ({
      toMillis: () => milliseconds,
      seconds: Math.floor(milliseconds / 1000),
      nanoseconds: (milliseconds % 1000) * 1000000,
    }),
  },
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn()
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('../../../../firebase/firestore/firestore');
const mockFirestore = firestoreModule as jest.Mocked<typeof firestoreModule>;

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <AuthProvider 
      firebaseUser={null}
      fetchUser={jest.fn()}
      fetchTenant={jest.fn()}
      fetchLandlord={jest.fn()}
    >
      <NavigationContainer>
        {component}
      </NavigationContainer>
    </AuthProvider>
  );
};

describe('ManageMachinesScreen', () => {
  const mockUser = {
    uid: 'testUid',
    email: 'test@example.com'
  };

  const mockLandlord = {
    uid: 'testUid',
    residenceIds: ['residence1'],
  };

  const mockResidence = {
    residenceId: 'residence1',
    residenceName: 'Test Residence',
  };

  const mockMachines = [
    {
      laundryMachineId: 'machine1',
      isAvailable: true,
      isFunctional: true,
      occupiedBy: 'none',
      startTime: Timestamp.fromMillis(Date.now()),
      estimatedFinishTime: Timestamp.fromMillis(Date.now()),
      notificationScheduled: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFirestore.getAllLaundryMachines.mockResolvedValue(mockMachines);
    mockFirestore.getLandlord.mockResolvedValue(mockLandlord);
    mockFirestore.getResidence.mockResolvedValue(mockResidence);
    mockFirestore.createLaundryMachine.mockResolvedValue(undefined);
    mockFirestore.deleteLaundryMachine.mockResolvedValue(undefined);
    mockFirestore.updateLaundryMachine.mockResolvedValue(undefined);
    
    jest.spyOn(require('../../../context/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: mockUser,
      loading: false,
      error: null,
    }));
  });

  it('renders correctly with initial machines', async () => {
    const { getByText, findByText } = renderWithNavigation(<ManageMachinesScreen />);
    expect(getByText('Manage Laundry Machines')).toBeTruthy();
    await findByText('Washing machine machine1');
    expect(getByText('Available')).toBeTruthy();
    expect(getByText('Functional')).toBeTruthy();
  });

  it('adds a new machine successfully', async () => {
    const { getByPlaceholderText, getByText } = renderWithNavigation(<ManageMachinesScreen />);
    
    await waitFor(() => {
      expect(getByText('Test Residence')).toBeTruthy();
    });

    const input = getByPlaceholderText('Enter Machine ID');
    fireEvent.changeText(input, 'newMachine');
    
    const addButton = getByText('Add Machine');
    await act(async () => {
      fireEvent.press(addButton);
    });

    await waitFor(() => {
      expect(mockFirestore.createLaundryMachine).toHaveBeenCalledWith(
        'residence1',
        expect.objectContaining({
          laundryMachineId: 'newMachine',
          isAvailable: true,
          isFunctional: true,
          occupiedBy: 'none',
          notificationScheduled: false,
        })
      );
    });
  });

  it('shows error when adding duplicate machine ID', async () => {
    const { getByPlaceholderText, getByText, findByText } = renderWithNavigation(<ManageMachinesScreen />);
    
    await waitFor(() => {
      expect(getByText('Test Residence')).toBeTruthy();
    });

    mockFirestore.createLaundryMachine.mockRejectedValueOnce(new Error('Machine ID already exists'));

    const input = getByPlaceholderText('Enter Machine ID');
    fireEvent.changeText(input, 'machine1');
    
    const addButton = getByText('Add Machine');
    await act(async () => {
      fireEvent.press(addButton);
    });

    await waitFor(() => {
      expect(getByText('Failed to add machine. Please try again.')).toBeTruthy();
    });
  });

  it('deletes a machine successfully', async () => {
    const { findByText } = renderWithNavigation(<ManageMachinesScreen />);
    await findByText('Washing machine machine1');
    const deleteButton = await findByText('Delete Machine');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(mockFirestore.deleteLaundryMachine).toHaveBeenCalledWith('residence1', 'machine1');
    });
  });

  it('toggles maintenance status successfully', async () => {
    const { findByText } = renderWithNavigation(<ManageMachinesScreen />);
    await findByText('Washing machine machine1');
    const toggleButton = await findByText('Mark as Under Maintenance');
    fireEvent.press(toggleButton);

    await waitFor(() => {
      expect(mockFirestore.updateLaundryMachine).toHaveBeenCalledWith(
        'residence1',
        'machine1',
        { isFunctional: false }
      );
    });
  });

  it('handles empty machine ID input', async () => {
    const { getByText } = renderWithNavigation(<ManageMachinesScreen />);
    const addButton = getByText('Add Machine');
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(mockFirestore.createLaundryMachine).not.toHaveBeenCalled();
    });
  });

  it('fetches machines on mount', async () => {
    renderWithNavigation(<ManageMachinesScreen />);
    await waitFor(() => {
      expect(mockFirestore.getAllLaundryMachines).toHaveBeenCalledWith('residence1');
    });
  });

  it('updates machine list after adding new machine', async () => {
    const { getByPlaceholderText, getByText, findByText } = renderWithNavigation(<ManageMachinesScreen />);
    
    await waitFor(() => {
      expect(getByText('Test Residence')).toBeTruthy();
    });

    const input = getByPlaceholderText('Enter Machine ID');
    fireEvent.changeText(input, 'newMachine');
    
    const updatedMachines = [...mockMachines, {
      laundryMachineId: 'newMachine',
      isAvailable: true,
      isFunctional: true,
      occupiedBy: 'none',
      startTime: Timestamp.fromMillis(Date.now()),
      estimatedFinishTime: Timestamp.fromMillis(Date.now()),
      notificationScheduled: false,
    }];
    mockFirestore.getAllLaundryMachines.mockResolvedValueOnce(updatedMachines);

    const addButton = getByText('Add Machine');
    await act(async () => {
      fireEvent.press(addButton);
    });

    await findByText('Washing machine newMachine');
  });

  it('updates machine list after deleting a machine', async () => {
    const { findByText, queryByText } = renderWithNavigation(<ManageMachinesScreen />);
    await findByText('Washing machine machine1');
    fireEvent.press(await findByText('Delete Machine'));
    
    await waitFor(() => {
      expect(queryByText('Washing machine machine1')).toBeNull();
    });
  });
});
