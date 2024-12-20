import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ManageMachinesScreen from '../screens/laundry_machines/ManageMachinesScreen';
import * as firestoreModule from '../../firebase/firestore/firestore';
import { getFirestore } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

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

jest.mock('../../firebase/firestore/firestore');
const mockFirestore = firestoreModule as jest.Mocked<typeof firestoreModule>;

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('ManageMachinesScreen', () => {
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

  beforeAll(() => {
    (getFirestore as jest.Mock).mockReturnValue({});
    (getAuth as jest.Mock).mockReturnValue({});
    (initializeApp as jest.Mock).mockReturnValue({
      name: '[DEFAULT]',
      options: {},
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFirestore.getAllLaundryMachines.mockResolvedValue(mockMachines);
    mockFirestore.createLaundryMachine.mockResolvedValue(undefined);
    mockFirestore.deleteLaundryMachine.mockResolvedValue(undefined);
    mockFirestore.updateLaundryMachine.mockResolvedValue(undefined);
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
    const input = getByPlaceholderText('Enter Machine ID');
    fireEvent.changeText(input, 'newMachine');
    const addButton = getByText('Add Machine');
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(mockFirestore.createLaundryMachine).toHaveBeenCalled();
    });
  });

  it('shows error when adding duplicate machine ID', async () => {
    const { getByPlaceholderText, getByText } = renderWithNavigation(<ManageMachinesScreen />);
    await waitFor(() => {});
    const input = getByPlaceholderText('Enter Machine ID');
    fireEvent.changeText(input, 'machine1');
    const addButton = getByText('Add Machine');
    fireEvent.press(addButton);
    expect(getByText('A machine with this ID already exists.')).toBeTruthy();
  });

  it('deletes a machine successfully', async () => {
    const { findByText } = renderWithNavigation(<ManageMachinesScreen />);
    await findByText('Washing machine machine1');
    const deleteButton = await findByText('Delete Machine');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(mockFirestore.deleteLaundryMachine).toHaveBeenCalledWith('TestResidence1', 'machine1');
    });
  });

  it('toggles maintenance status successfully', async () => {
    const { findByText } = renderWithNavigation(<ManageMachinesScreen />);
    await findByText('Washing machine machine1');
    const toggleButton = await findByText('Mark as Under Maintenance');
    fireEvent.press(toggleButton);

    await waitFor(() => {
      expect(mockFirestore.updateLaundryMachine).toHaveBeenCalledWith(
        'TestResidence1',
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
      expect(mockFirestore.getAllLaundryMachines).toHaveBeenCalledWith('TestResidence1');
    });
  });

  it('updates machine list after adding new machine', async () => {
    const { getByPlaceholderText, getByText, findByText } = renderWithNavigation(<ManageMachinesScreen />);
    const input = getByPlaceholderText('Enter Machine ID');
    fireEvent.changeText(input, 'newMachine');
    fireEvent.press(getByText('Add Machine'));
    
    await waitFor(() => {
      expect(mockFirestore.createLaundryMachine).toHaveBeenCalled();
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
