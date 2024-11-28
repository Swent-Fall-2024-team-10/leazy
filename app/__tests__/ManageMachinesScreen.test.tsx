import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ManageMachinesScreen from '../screens/laundry_machines/ManageMachinesScreen';
import * as firestoreModule from '../../firebase/firestore/firestore';
import { Timestamp } from 'firebase/firestore';

// Mock the firestore module
jest.mock('../../firebase/firestore/firestore');
const mockFirestore = firestoreModule as jest.Mocked<typeof firestoreModule>;

// Mock Firebase Timestamp
jest.mock('firebase/firestore', () => ({
  Timestamp: {
    fromMillis: (milliseconds: number) => ({
      toMillis: () => milliseconds,
      seconds: Math.floor(milliseconds / 1000),
      nanoseconds: (milliseconds % 1000) * 1000000,
    }),
  },
}));

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

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockFirestore.getAllLaundryMachines.mockResolvedValue(mockMachines);
    mockFirestore.createLaundryMachine.mockResolvedValue(undefined);
    mockFirestore.deleteLaundryMachine.mockResolvedValue(undefined);
    mockFirestore.updateLaundryMachine.mockResolvedValue(undefined);
  });

  it('renders correctly with initial machines', async () => {
    const { getByText, findByText } = render(<ManageMachinesScreen />);
    
    // Check for header
    expect(getByText('Manage Laundry Machines')).toBeTruthy();
    
    // Wait for machines to load
    await findByText('Washing machine machine1');
    expect(getByText('Available')).toBeTruthy();
    expect(getByText('Functional')).toBeTruthy();
  });

  it('adds a new machine successfully', async () => {
    const { getByPlaceholderText, getByText } = render(<ManageMachinesScreen />);
    
    const input = getByPlaceholderText('Enter Machine ID');
    fireEvent.changeText(input, 'newMachine');
    
    const addButton = getByText('Add Machine');
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(mockFirestore.createLaundryMachine).toHaveBeenCalled();
    });
  });

  it('shows error when adding duplicate machine ID', async () => {
    const { getByPlaceholderText, getByText } = render(<ManageMachinesScreen />);
    
    // Wait for initial machines to load
    await waitFor(() => {});
    
    const input = getByPlaceholderText('Enter Machine ID');
    fireEvent.changeText(input, 'machine1'); // Use existing ID
    
    const addButton = getByText('Add Machine');
    fireEvent.press(addButton);

    expect(getByText('A machine with this ID already exists.')).toBeTruthy();
  });

  it('deletes a machine successfully', async () => {
    const { findByText, getByText } = render(<ManageMachinesScreen />);
    
    // Wait for machine to appear
    await findByText('Washing machine machine1');
    
    const deleteButton = getByText('Delete Machine');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(mockFirestore.deleteLaundryMachine).toHaveBeenCalledWith('TestResidence1', 'machine1');
    });
  });

  it('toggles maintenance status successfully', async () => {
    const { findByText, getByText } = render(<ManageMachinesScreen />);
    
    // Wait for machine to appear
    await findByText('Washing machine machine1');
    
    const toggleButton = getByText('Mark as Under Maintenance');
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
    const { getByText } = render(<ManageMachinesScreen />);
    
    const addButton = getByText('Add Machine');
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(mockFirestore.createLaundryMachine).not.toHaveBeenCalled();
    });
  });

  it('fetches machines on mount', async () => {
    render(<ManageMachinesScreen />);
    
    await waitFor(() => {
      expect(mockFirestore.getAllLaundryMachines).toHaveBeenCalledWith('TestResidence1');
    });
  });

  it('clears error message when adding valid machine', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<ManageMachinesScreen />);
    
    // First try to add an existing machine to trigger error
    const input = getByPlaceholderText('Enter Machine ID');
    fireEvent.changeText(input, 'machine1');
    fireEvent.press(getByText('Add Machine'));
    
    // Verify error appears
    expect(getByText('A machine with this ID already exists.')).toBeTruthy();
    
    // Now add a valid machine
    fireEvent.changeText(input, 'newMachine');
    fireEvent.press(getByText('Add Machine'));
    
    await waitFor(() => {
      // Error message should be gone
      expect(queryByText('A machine with this ID already exists.')).toBeNull();
    });
  });

  it('updates machine list after adding new machine', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<ManageMachinesScreen />);
    
    const input = getByPlaceholderText('Enter Machine ID');
    fireEvent.changeText(input, 'newMachine');
    fireEvent.press(getByText('Add Machine'));
    
    await waitFor(() => {
      expect(mockFirestore.createLaundryMachine).toHaveBeenCalled();
    });
    
    // Verify the new machine appears in the list
    await findByText('Washing machine newMachine');
  });

  it('updates machine list after deleting a machine', async () => {
    const { findByText, queryByText } = render(<ManageMachinesScreen />);
    
    // Wait for machine to appear
    await findByText('Washing machine machine1');
    
    // Delete the machine
    fireEvent.press(await findByText('Delete Machine'));
    
    await waitFor(() => {
      // Verify the machine is no longer in the list
      expect(queryByText('Washing machine machine1')).toBeNull();
    });
  });
});
