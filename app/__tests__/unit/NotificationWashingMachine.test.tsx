import React from "react";
import { render, fireEvent, act, waitFor, within } from "@testing-library/react-native";
import WashingMachineScreen from "../../screens/laundry_machines/WashingMachineScreen";
import * as Notifications from "expo-notifications";
import { getAllLaundryMachines, getLaundryMachinesQuery, updateLaundryMachine } from "../../../firebase/firestore/firestore";
import { NotificationPermissionsStatus } from "expo-notifications";

// portions of this code were generated by chatGPT as an AI assistant

// Mock Firestore functions
jest.mock("../../../firebase/firestore/firestore", () => ({
    getLaundryMachinesQuery: jest.fn(),
    updateLaundryMachine: jest.fn(),
    getLaundryMachine: jest.fn(() =>
        Promise.resolve({
          laundryMachineId: "coucou",
          isAvailable: true,
          isFunctional: true,
          occupiedBy: "none",
          startTime: { toMillis: () => Date.now() },
          estimatedFinishTime: { toMillis: () => Date.now() + 3600000 }, // 1 hour from now
          notificationScheduled: false,
        })
      ),
    getTenant: jest.fn(() => Promise.resolve({ residenceId: 'test-residence' })),
}));

jest.mock('expo-notifications', () => ({
    getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    scheduleNotificationAsync: jest.fn(() => Promise.resolve('mocked-notification-id')), // Fix here
    setNotificationHandler: jest.fn(() => {}),
    cancelScheduledNotificationAsync: jest.fn()
  }));
  
    
jest.mock('firebase/firestore', () => {
const actualFirestore = jest.requireActual('firebase/firestore');

return {
    ...actualFirestore, // Include the actual implementations for non-mocked parts
    Timestamp: {
    now: jest.fn(() => ({
        toMillis: jest.fn(() => Date.now()),
    })),
    fromMillis: jest.fn((millis) => ({
        toMillis: jest.fn(() => millis),
    })),
    },
    onSnapshot: jest.fn((query, callback) => {
      // Create a mock snapshot that matches the expected data structure
      const mockSnapshot = {
        forEach: (fn: (doc: {
          id: string;
          data: () => {
            laundryMachineId: string;
            isAvailable: boolean;
            isFunctional: boolean;
            occupiedBy: string;
            startTime: any;
            estimatedFinishTime: any;
            notificationScheduled: boolean;
          };
        }) => void) => {
          fn({
            id: 'coucou',
            data: () => ({
              laundryMachineId: 'coucou',
              isAvailable: true,
              isFunctional: true,
              occupiedBy: 'none',
              startTime: actualFirestore.Timestamp.now(),
              estimatedFinishTime: actualFirestore.Timestamp.fromMillis(Date.now() + 3600000),
              notificationScheduled: false,
            }),
          });
        },
      };

      // Call the callback immediately with the mock data
      setTimeout(() => callback(mockSnapshot), 0);

      // Return an unsubscribe function
      return () => {};
    }),
};
});  
  
  jest.mock('expo-linear-gradient', () => ({
    LinearGradient: jest.fn().mockImplementation(({ children }) => children),
  }));
  
  jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  }));
  

describe("WashingMachineScreen - Notifications", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    global.alert = jest.fn();

// Setup mock for getLaundryMachinesQuery to return a query
(getLaundryMachinesQuery as jest.Mock).mockReturnValue({});

// Mock auth to provide a user
jest.spyOn(require("firebase/auth"), "getAuth").mockReturnValue({
  currentUser: { uid: 'testUser' }
});  });

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders the washing machine fetched from Firestore", async () => {
  
    const { getByText } = render(<WashingMachineScreen />);
  
    // Wait for async rendering
    await act(async () => {});
  
    await waitFor(() => {expect(getByText("Machine coucou")).toBeTruthy()});
  });

  it("does not schedule a notification for past times", async () => {
    // Mock permissions granted
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "granted",
    } as NotificationPermissionsStatus);

    const { getByText, getByTestId } = render(<WashingMachineScreen />);
  
    // Wait for the component to render with mock data
    await waitFor(() => {
      expect(getByText("Machine coucou")).toBeTruthy();
    });

    // Simulate setting a timer
    const button = getByTestId("setTimerButton");
    await act(async () => {
      fireEvent.press(button);
    });

    // Step 2: Simulate confirming a duration of 5 minutes
    const modal = getByTestId("timer-picker-modal");
    await act(async () => {
      fireEvent(modal, "onConfirm", new Date(0, 0, 0, 0, 2, 0));
    });

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("updates Firestore after scheduling a notification", async () => {
    // Mock permissions granted
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "granted",
    } as NotificationPermissionsStatus);

    const { getByText, getByTestId } = render(<WashingMachineScreen />);
  
    // Wait for the component to render with mock data
    await waitFor(() => {
      expect(getByText("Machine coucou")).toBeTruthy();
    });
  
    // Simulate setting a timer
    const button = getByTestId("setTimerButton");
    await act(async () => {
      fireEvent.press(button);
    });
  
    // Step 2: Simulate confirming a duration of 5 minutes
    const modal = getByTestId("timer-picker-modal");
    await act(async () => {
      fireEvent(modal, "onConfirm", { hours: 0, minutes: 5, seconds: 0 });
    });

    await waitFor(() => {
      expect(updateLaundryMachine).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          notificationScheduled: true,
        })
      );
    }, { timeout: 3000 });
  });
});
