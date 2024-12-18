import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MaintenanceIssues from "../../screens/issues_tenant/ListIssueScreen";
import {
  updateMaintenanceRequest,
  getMaintenanceRequestsQuery,
} from "../../../firebase/firestore/firestore";
import { getAuth } from "firebase/auth";
import { onSnapshot } from "firebase/firestore";
import "@testing-library/jest-native/extend-expect";

// portions of this code were generated using chatGPT as an AI assistant

// Mock Firebase Auth
jest.mock("firebase/auth", () => ({
  getAuth: () => ({
    currentUser: { uid: "mockTenantId" },
  }),
}));

jest.mock('@expo/vector-icons', () => ({
    Feather: ({ name, size, color }: { name: string; size: number; color: string }) => 
      `Feather Icon: ${name}, ${size}, ${color}`,
  }));  

// Mock Firestore functions
jest.mock("../../../firebase/firestore/firestore", () => ({
  updateMaintenanceRequest: jest.fn(),
  getMaintenanceRequestsQuery: jest.fn(),
}));

// Mock onSnapshot from Firestore
jest.mock("firebase/firestore", () => ({
  ...jest.requireActual("firebase/firestore"),
  onSnapshot: jest.fn(),
}));

// Mock Navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe("MaintenanceIssues", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly with title", () => {
    const screen = render(<MaintenanceIssues />);
    expect(screen.getByText("Maintenance Requests")).toBeTruthy();
  });

  test("fetches and displays maintenance issues", async () => {
    // Mock Firestore query and onSnapshot behavior
    const mockQuery = jest.fn();
    const mockIssueData = {
      requestID: "request1",
      requestTitle: "Leaky faucet",
      requestStatus: "inProgress",
    };

    (getMaintenanceRequestsQuery as jest.Mock).mockResolvedValue(mockQuery);
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      callback({
        forEach: (fn: any) => fn({ data: () => mockIssueData }),
      });
    });

    const screen = render(<MaintenanceIssues />);

    // Wait for maintenance issues to load and display
    await waitFor(() => expect(getMaintenanceRequestsQuery).toHaveBeenCalledWith("mockTenantId"));
    expect(screen.getByText("Leaky faucet")).toBeTruthy();
    expect(screen.getByText("Status: In Progress")).toBeTruthy();
  });

  test("toggles archived issues switch and displays archived issues when toggled", async () => {
    const mockIssueData = {
      requestID: "request1",
      requestTitle: "Leaky faucet",
      requestStatus: "completed",
    };
        // Mock query and snapshot response
        const mockQuery = jest.fn();
        (getMaintenanceRequestsQuery as jest.Mock).mockResolvedValue(mockQuery);
        (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
          callback({
            forEach: (fn: any) => fn({ data: () => mockIssueData }),
          });
        });
    const screen = render(<MaintenanceIssues />);
    const archivedSwitch = await waitFor(() => screen.getByTestId("archiveSwitch"));
    const leaky_faucet = screen.queryByText('Leaky faucet');
    await waitFor(() => expect(leaky_faucet).toBeNull());

  // Toggle to true
  fireEvent(archivedSwitch, 'valueChange', true);
  await waitFor(() => expect(archivedSwitch.props.value).toBe(true));

  await waitFor(() => expect(screen.getByText("Leaky faucet")).toBeTruthy());

  // Toggle back to false
  fireEvent(archivedSwitch, 'valueChange', false);
  await waitFor(() => expect(archivedSwitch.props.value).toBe(false));

  const leaky_faucet_toggled = screen.queryByText('Leaky faucet');
  await waitFor(() => expect(leaky_faucet_toggled).toBeNull());

  });

  test("navigates to the report screen when add button is pressed", () => {
    const screen = render(<MaintenanceIssues />);
    const addButton = screen.getByTestId("addButton");

    fireEvent.press(addButton);
    expect(mockNavigate).toHaveBeenCalledWith("Report");
  });

  test("navigates to issue details when arrow button is pressed", async () => {
    const mockIssueData = {
      requestID: "request1",
      requestTitle: "Leaky faucet",
      requestStatus: "inProgress",
    };

    // Mock Firestore query and snapshot response
    const mockQuery = jest.fn();
    (getMaintenanceRequestsQuery as jest.Mock).mockResolvedValue(mockQuery);
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      callback({
        forEach: (fn: any) => fn({ data: () => mockIssueData }),
      });
    });

    const screen = render(<MaintenanceIssues />);

    // Wait for maintenance issues to load
    await waitFor(() => expect(screen.getByText("Leaky faucet")).toBeTruthy());

    // Press the arrow button to navigate to details
    const arrowButton = screen.getByTestId("arrowButton");
    fireEvent.press(arrowButton);
    expect(mockNavigate).toHaveBeenCalledWith("IssueDetails", { requestID: "request1" });
  });
});
