import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import WashingMachineScreen from "../../screens/laundry_machines/WashingMachineScreen";
import * as Notifications from "expo-notifications";
import { getLaundryMachine, updateLaundryMachine } from "../../../firebase/firestore/firestore";
import { NotificationPermissionsStatus } from "expo-notifications";

// Mock Firestore functions
jest.mock("../../../firebase/firestore/firestore", () => ({
  getLaundryMachine: jest.fn(),
  updateLaundryMachine: jest.fn(),
}));

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));

describe("WashingMachineScreen - Notifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests notification permissions when ensuring permissions", async () => {
    // Mock permissions to be undetermined initially
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "undetermined",
    } as NotificationPermissionsStatus);
    // Mock permissions granted on request
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "granted",
    } as NotificationPermissionsStatus);

    const { getByTestId } = render(<WashingMachineScreen />);
    const button = getByTestId("setTimerButton");

    // Simulate setting a timer
    await act(async () => {
      fireEvent.press(button);
    });

    expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  it("does not schedule a notification if permissions are denied", async () => {
    // Mock denied permissions
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "denied",
    } as NotificationPermissionsStatus);

    const { getByTestId } = render(<WashingMachineScreen />);
    const button = getByTestId("setTimerButton");

    // Simulate setting a timer
    await act(async () => {
      fireEvent.press(button);
    });

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it("schedules a notification if permissions are granted", async () => {
    // Mock permissions granted
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "granted",
    } as NotificationPermissionsStatus);

    (getLaundryMachine as jest.Mock).mockResolvedValueOnce({
      notificationScheduled: false,
    });

    const mockMachineId = "TestMachine1";
    const mockDelayS = 300; // 5 minutes

    await act(async () => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Laundry Machine ${mockMachineId}`,
          body: `Your laundry will be ready in 3 minutes!`,
        },
        trigger: { seconds: mockDelayS },
      });
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: `Laundry Machine ${mockMachineId}`,
        body: "Your laundry will be ready in 3 minutes!",
      },
      trigger: { seconds: mockDelayS },
    });
  });

  it("does not schedule a notification for past times", async () => {
    // Mock permissions granted
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "granted",
    } as NotificationPermissionsStatus);

    const { getByTestId } = render(<WashingMachineScreen />);
    const button = getByTestId("setTimerButton");

    // Simulate timer setup for a past time
    await act(async () => {
      fireEvent.press(button);
    });

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: { seconds: expect.any(Number) },
      })
    );
  });

  it("updates Firestore after scheduling a notification", async () => {
    // Mock permissions granted
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: "granted",
    } as NotificationPermissionsStatus);

    (getLaundryMachine as jest.Mock).mockResolvedValueOnce({
      notificationScheduled: false,
    });

    const mockResidenceId = "TestResidence1";
    const mockMachineId = "TestMachine1";
    const mockDelayS = 300; // 5 minutes

    await act(async () => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Laundry Machine ${mockMachineId}`,
          body: `Your laundry will be ready in 3 minutes!`,
        },
        trigger: { seconds: mockDelayS },
      });

      await updateLaundryMachine(mockResidenceId, mockMachineId, {
        notificationScheduled: true,
      });
    });

    expect(updateLaundryMachine).toHaveBeenCalledWith(
      mockResidenceId,
      mockMachineId,
      {
        notificationScheduled: true,
      }
    );
  });
});
