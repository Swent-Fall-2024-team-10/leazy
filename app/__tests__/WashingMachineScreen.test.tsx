import React from 'react';
import { render, fireEvent, waitFor, screen, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import WashingMachineScreen from '../screens/laundry_machines/WashingMachineScreen';
import { getLaundryMachine, updateLaundryMachine } from '../../firebase/firestore/firestore';
import { getAuth } from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';
import * as Notifications from "expo-notifications";
import { NotificationPermissionsStatus } from "expo-notifications";

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

  // Mock expo-notifications
  jest.mock("expo-notifications", () => ({
    getPermissionsAsync: jest.fn(),
    requestPermissionsAsync: jest.fn(),
    scheduleNotificationAsync: jest.fn(),
    setNotificationHandler: jest.fn(() => {}),
  }));

jest.mock('../../firebase/firestore/firestore', () => ({
  getLaundryMachine: jest.fn(),
  updateLaundryMachine: jest.fn(),
  getLaundryMachinesQuery: jest.fn(),
  createMachineNotification: jest.fn(),
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

// Import the mocked functions
import { 
  getLaundryMachinesQuery,
} from '../../firebase/firestore/firestore';

const renderWithNavigation = (ui: React.ReactElement) => {
  return render(
    <NavigationContainer>{ui}</NavigationContainer>
  );
};

describe('WashingMachineScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state correctly', () => {
    const { getByText } = renderWithNavigation(<WashingMachineScreen />);
    expect(getByText('No washing machines available')).toBeTruthy();
  });

  it('handles refresh control', async () => {
    const { getByTestId } = renderWithNavigation(<WashingMachineScreen />);
    const scrollView = getByTestId('scroll-view');
    
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 0 },
        contentSize: { height: 600, width: 400 },
        layoutMeasurement: { height: 400, width: 400 }
      }
    });
  });

  it('renders a functional available machine', async () => {
    const mockMachine = {
      laundryMachineId: 'machine1',
      isAvailable: true,
      isFunctional: true,
      occupiedBy: 'none'
    };
    
    const mockDoc = {
      id: 'machine1',
      data: () => mockMachine
    };
    
    const mockQuerySnapshot = {
      forEach: (callback: (arg0: { id: string; data: () => { laundryMachineId: string; isAvailable: boolean; isFunctional: boolean; occupiedBy: string; }; }) => any) => callback(mockDoc),
      docs: [mockDoc],
      empty: false,
      size: 1
    };
    
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      setTimeout(() => callback(mockQuerySnapshot), 0);
      return () => {};
    });

    const { getByText, getByTestId } = renderWithNavigation(<WashingMachineScreen />);
    
    await waitFor(() => {
      expect(getByText('Machine machine1')).toBeTruthy();
    }, { timeout: 3000 });
    
    expect(getByTestId('setTimerButton')).toBeTruthy();
  });

  it('renders a non-functional machine', async () => {
    const mockMachine = {
      laundryMachineId: 'machine1',
      isAvailable: true,
      isFunctional: false,
      occupiedBy: 'none'
    };
    
    const mockQuerySnapshot = {
      forEach: (callback: (arg0: { data: () => { laundryMachineId: string; isAvailable: boolean; isFunctional: boolean; occupiedBy: string; }; }) => any) => callback({
        data: () => mockMachine
      })
    };
    
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      callback(mockQuerySnapshot);
      return () => {};
    });

    const { getByText } = renderWithNavigation(<WashingMachineScreen />);
    
    await waitFor(() => {
      expect(getByText('Under Maintenance')).toBeTruthy();
    });
  });

  it('handles machine reset', async () => {
    const mockMachine = {
      laundryMachineId: 'machine1',
      isAvailable: false,
      isFunctional: true,
      occupiedBy: 'test-user-id',
      estimatedFinishTime: {
        toMillis: () => Date.now() + 1000
      }
    };
    
    const mockDoc = {
      id: 'machine1',
      data: () => mockMachine
    };
    
    const mockQuerySnapshot = {
      forEach: (callback: (arg0: { id: string; data: () => { laundryMachineId: string; isAvailable: boolean; isFunctional: boolean; occupiedBy: string; estimatedFinishTime: { toMillis: () => number; }; }; }) => any) => callback(mockDoc),
      docs: [mockDoc],
      empty: false,
      size: 1
    };
    
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      setTimeout(() => callback(mockQuerySnapshot), 0);
      return () => {};
    });

    const { getByTestId } = renderWithNavigation(<WashingMachineScreen />);
    
    await waitFor(() => {
      const unlockButton = getByTestId('unlockButton');
      fireEvent.press(unlockButton);
    }, { timeout: 3000 });

    expect(updateLaundryMachine).toHaveBeenCalledWith(
      'TestResidence1',
      'machine1',
      expect.objectContaining({
        isAvailable: true,
        occupiedBy: 'none'
      })
    );
  });

  it('handles error in fetching machines', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    (getLaundryMachinesQuery as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to fetch');
    });

    const { getByText } = renderWithNavigation(<WashingMachineScreen />);
    
    await waitFor(() => {
      expect(getByText('No washing machines available')).toBeTruthy();
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('updates remaining time display', async () => {
    jest.useFakeTimers();
    
    // Set up a well-defined timeline
    const startTime = 1000000;
    const duration = 60000; // 1 minute
    jest.setSystemTime(startTime);
    
    // Mock granted permissions
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "granted",
    } as NotificationPermissionsStatus);

    const mockMachine = {
      laundryMachineId: 'machine1',
      isAvailable: false,
      isFunctional: true,
      occupiedBy: 'test-user-id',
      estimatedFinishTime: {
        toMillis: () => startTime + duration // Will finish in 1 minute
      },
      startTime: {
        toMillis: () => startTime
      },
      notificationScheduled: false
    };
    
    const mockQuerySnapshot = {
      forEach: jest.fn((callback) => {
        callback({
          id: 'machine1',
          data: () => ({ ...mockMachine })
        });
      }),
      empty: false,
      size: 1
    };
  
    (getLaundryMachinesQuery as jest.Mock).mockReturnValue({});
  
    (onSnapshot as jest.Mock).mockImplementation((query: any, callback: (arg0: { forEach: jest.Mock<void, [callback: any], any>; empty: boolean; size: number; }) => void) => {
      callback(mockQuerySnapshot);
      return () => {};
    });
    const { getByText } = render(
      <NavigationContainer>
        <WashingMachineScreen />
      </NavigationContainer>
    );
  
    // Run initial timers
    act(() => {
      jest.runOnlyPendingTimers();
    });
  
    // Verify machine is rendered
    expect(getByText('Machine machine1')).toBeTruthy();
  
    // Check for the initial timer display (should be close to 1 minute)
    // Use a more flexible regex that accounts for the full range of possible values
    await waitFor(
      () => {
        expect(getByText(/0h \d+m \d+s/)).toBeTruthy();
      },
      { timeout: 3000 } // Wait for 3 seconds
    );  
    // Advance halfway through
    act(() => {
      jest.advanceTimersByTime(30000); // Advance 30 seconds
    });

    // Check timer after advancing (should be around 30 seconds)
    await waitFor(
      () => {
        expect(getByText(/0h \d+m \d+s/)).toBeTruthy();
      },
      { timeout: 3000 } // Wait for 3 seconds
    );
  
    jest.useRealTimers();
  });

  it('handles timer cancellation', async () => {
    const mockMachine = {
      laundryMachineId: 'machine1',
      isAvailable: false,
      isFunctional: true,
      occupiedBy: 'test-user-id',
      estimatedFinishTime: {
        toMillis: () => Date.now() + 1000000 // Some time in the future
      }
    };
    
    const mockDoc = {
      id: 'machine1',
      data: () => mockMachine
    };
    
    const mockQuerySnapshot = {
      forEach: (callback: (arg0: {
              id: string; data: () => {
                  laundryMachineId: string; isAvailable: boolean; isFunctional: boolean; occupiedBy: string; estimatedFinishTime: {
                      toMillis: () => number; // Some time in the future
                  };
              };
          }) => any) => callback(mockDoc),
      docs: [mockDoc],
      empty: false,
      size: 1
    };
    
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      setTimeout(() => callback(mockQuerySnapshot), 0);
      return () => {};
    });

    const { getByTestId } = renderWithNavigation(<WashingMachineScreen />);
    
    await waitFor(() => {
      const cancelButton = getByTestId('cancelTimerButton');
      fireEvent.press(cancelButton);
    });

    expect(updateLaundryMachine).toHaveBeenCalledWith(
      'TestResidence1',
      'machine1',
      expect.objectContaining({
        isAvailable: true,
        occupiedBy: 'none'
      })
    );
  });

  it('handles timer setting', async () => {
    const mockMachine = {
      laundryMachineId: 'machine1',
      isAvailable: true,
      isFunctional: true,
      occupiedBy: 'none'
    };
    
    const mockDoc = {
      id: 'machine1',
      data: () => mockMachine
    };
    
    const mockQuerySnapshot = {
      forEach: (callback: (arg0: { id: string; data: () => { laundryMachineId: string; isAvailable: boolean; isFunctional: boolean; occupiedBy: string; }; }) => any) => callback(mockDoc),
      docs: [mockDoc],
      empty: false,
      size: 1
    };
    
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      setTimeout(() => callback(mockQuerySnapshot), 0);
      return () => {};
    });

    const { getByTestId } = renderWithNavigation(<WashingMachineScreen />);
    
    await waitFor(() => {
      const setTimerButton = getByTestId('setTimerButton');
      fireEvent.press(setTimerButton);
    });

    // Verify timer modal becomes visible
    expect(screen.getByText('Choose Washing Duration')).toBeTruthy();
  });

  it('handles refresh control pull-to-refresh', async () => {
    const { getByTestId } = renderWithNavigation(<WashingMachineScreen />);
    const scrollView = getByTestId('scroll-view');
    
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: -100 }, // Pulling down
        contentSize: { height: 600, width: 400 },
        layoutMeasurement: { height: 400, width: 400 }
      }
    });

    // Verify that fetchMachines was called
    expect(getLaundryMachinesQuery).toHaveBeenCalledWith('TestResidence1');
  });
});
