import React from 'react';
import {
  render,
  fireEvent,
  waitFor,
  screen,
  act,
} from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import WashingMachineScreen from '../../../screens/laundry_machines/WashingMachineScreen';
import {
  getLaundryMachine,
  getTenant,
  updateLaundryMachine,
} from '../../../../firebase/firestore/firestore';
import { getAuth } from 'firebase/auth';
import { onSnapshot, Timestamp } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { NotificationPermissionsStatus } from 'expo-notifications';
import { LaundryMachine } from '../../../../types/types';
// Import the mocked functions
import {
  getLaundryMachinesQuery,
} from '../../../../firebase/firestore/firestore';

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(() => {}),
}));

jest.mock('../../../../firebase/firestore/firestore', () => ({
  getLaundryMachine: jest.fn(),
  updateLaundryMachine: jest.fn(),
  getLaundryMachinesQuery: jest.fn(),
  createMachineNotification: jest.fn(),
  getTenant: jest.fn(() =>
    Promise.resolve({
      residenceId: 'TestResidence1',
    }),
  ),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'test-user-id' },
  })),
}));

jest.mock('firebase/firestore', () => ({
  onSnapshot: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({
      toMillis: jest.fn(() => Date.now()),
    })),
    fromMillis: jest.fn((ms) => ({
      toMillis: jest.fn(() => ms),
    })),
  },
  query: jest.fn(),
  collection: jest.fn(),
  where: jest.fn(),
}));

// Mock clearInterval globally
global.clearInterval = jest.fn();

// Move this helper function before renderWithNavigation
const waitForAsync = async () => {
  await act(async () => {
    await Promise.resolve();
    jest.runAllTimers();
  });
};

const renderWithNavigation = async (component: React.ReactElement) => {
  const rendered = render(
    <NavigationContainer>{component}</NavigationContainer>,
  );

  await waitForAsync();
  return rendered;
};

declare global {
  interface Global {
    alert?: (message?: any) => void;
  }
}

async function mountComponentWithMachine(machineData: Partial<LaundryMachine>) {
  const mockMachine = {
    laundryMachineId: 'machine1',
    isAvailable: true,
    isFunctional: true,
    occupiedBy: 'none',
    ...machineData,
  };

  const mockQuerySnapshot = {
    forEach: (callback: any) =>
      callback({ id: 'machine1', data: () => mockMachine }),
    docs: [{ id: 'machine1', data: () => mockMachine }],
    empty: false,
    size: 1,
  };

  (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
    act(() => {
      callback(mockQuerySnapshot);
    });
    return () => {};
  });

  const rendered = await renderWithNavigation(<WashingMachineScreen />);

  // Wait for initial mount and data fetch
  await act(async () => {
    await waitForAsync();
  });

  return rendered;
}

async function setupTimerTest() {
  // Mock timing functions
  jest.useFakeTimers();
  const currentTime = Date.now();
  jest.setSystemTime(currentTime);

  // Mock notification permissions
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
    status: 'granted',
  } as NotificationPermissionsStatus);

  // Mock notification scheduling
  (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
    'notification-id-1',
  );

  const machine = {
    laundryMachineId: 'machine1',
    isAvailable: true,
    isFunctional: true,
    occupiedBy: 'none',
    startTime: Timestamp.now(),
    estimatedFinishTime: Timestamp.fromMillis(currentTime + 5000000), // Far in the future
  };

  return { machine, currentTime };
}
describe('WashingMachineScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Mock window.alert since it's not available in the test environment
    global.alert = jest.fn();
    // Mock getTenant to return a residenceId consistently
    (getTenant as jest.Mock).mockResolvedValue({
      residenceId: 'TestResidence1',
    });
    // Mock getLaundryMachinesQuery to prevent "Failed to fetch" errors
    (getLaundryMachinesQuery as jest.Mock).mockReturnValue({});
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
    global.alert = () => {};
  });

  it('renders empty state correctly', async () => {
    const { getByText } = await renderWithNavigation(<WashingMachineScreen />);
    expect(getByText('No washing machines available')).toBeTruthy();
  });

  it('handles refresh control', async () => {
    const { getByTestId } = await renderWithNavigation(
      <WashingMachineScreen />,
    );
    const scrollView = getByTestId('scroll-view');

    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 0 },
        contentSize: { height: 600, width: 400 },
        layoutMeasurement: { height: 400, width: 400 },
      },
    });
  });

  it('renders a functional available machine', async () => {
    const mockMachine = {
      laundryMachineId: 'machine1',
      isAvailable: true,
      isFunctional: true,
      occupiedBy: 'none',
    };

    const mockDoc = {
      id: 'machine1',
      data: () => mockMachine,
    };

    const mockQuerySnapshot = {
      forEach: (
        callback: (arg0: {
          id: string;
          data: () => {
            laundryMachineId: string;
            isAvailable: boolean;
            isFunctional: boolean;
            occupiedBy: string;
          };
        }) => any,
      ) => callback(mockDoc),
      docs: [mockDoc],
      empty: false,
      size: 1,
    };

    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      setTimeout(() => callback(mockQuerySnapshot), 0);
      return () => {};
    });

    const { getByText, getByTestId } = await renderWithNavigation(
      <WashingMachineScreen />,
    );

    await waitFor(
      () => {
        expect(getByText('Machine machine1')).toBeTruthy();
      },
      { timeout: 3000 },
    );

    expect(getByTestId('setTimerButton')).toBeTruthy();
  });

  it('renders a non-functional machine', async () => {
    const mockMachine = {
      laundryMachineId: 'machine1',
      isAvailable: true,
      isFunctional: false,
      occupiedBy: 'none',
    };

    const mockQuerySnapshot = {
      forEach: (
        callback: (arg0: {
          data: () => {
            laundryMachineId: string;
            isAvailable: boolean;
            isFunctional: boolean;
            occupiedBy: string;
          };
        }) => any,
      ) =>
        callback({
          data: () => mockMachine,
        }),
    };

    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      callback(mockQuerySnapshot);
      return () => {};
    });

    const { getByText } = await renderWithNavigation(<WashingMachineScreen />);

    await waitFor(() => {
      expect(getByText('Under Maintenance')).toBeTruthy();
    });
  });

  it('handles error in fetching machines', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    (getLaundryMachinesQuery as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to fetch');
    });

    const { getByText } = await renderWithNavigation(<WashingMachineScreen />);

    await waitFor(() => {
      expect(getByText('No washing machines available')).toBeTruthy();
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('handles refresh control pull-to-refresh', async () => {
    const { getByTestId } = await renderWithNavigation(
      <WashingMachineScreen />,
    );

    await waitForAsync();

    const scrollView = getByTestId('scroll-view');
    await act(async () => {
      fireEvent(scrollView, 'refresh');
    });

    await waitForAsync();

    expect(getLaundryMachinesQuery).toHaveBeenCalledWith('TestResidence1');
  });

  // Test status display (lines 331-333)
  it('displays correct machine status', async () => {
    // Test maintenance status
    const maintenanceMachine = {
      laundryMachineId: 'machine1',
      isAvailable: true,
      isFunctional: false,
      occupiedBy: 'none',
    };
    
    const { getByText: getByText1 } = await mountComponentWithMachine(maintenanceMachine);
    expect(getByText1('Under Maintenance')).toBeTruthy();

    // Test in-use status
    const inUseMachine = {
      laundryMachineId: 'machine1',
      isAvailable: false,
      isFunctional: true,
      occupiedBy: 'some-user',
    };
    
    const { getByText: getByText2 } = await mountComponentWithMachine(inUseMachine);
    expect(getByText2('In Use')).toBeTruthy();
  });

  // Test timer modal interactions (lines 397-441)
  it('handles timer modal interactions', async () => {
    const { machine } = await setupTimerTest();
    const { getByTestId, getByText } = await mountComponentWithMachine(machine);

    // Open timer modal
    await act(async () => {
      const setTimerButton = getByTestId('setTimerButton');
      fireEvent.press(setTimerButton);
      await waitForAsync();
    });

    // Select duration and confirm
    await act(async () => {
      const confirmButton = getByText('Confirm');
      fireEvent.press(confirmButton);
      await waitForAsync();
    });

    expect(updateLaundryMachine).toHaveBeenCalledWith(
      'TestResidence1',
      'machine1',
      expect.objectContaining({
        isAvailable: false,
        occupiedBy: 'test-user-id',
      })
    );
  });

});
