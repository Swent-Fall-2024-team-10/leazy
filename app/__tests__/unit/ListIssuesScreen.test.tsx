import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MaintenanceIssues from "../../screens/issues_tenant/ListIssueScreen";
import {
  updateMaintenanceRequest,
  getMaintenanceRequestsQuery,
  getPendingRequests,
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
  getPendingRequests: jest.fn().mockResolvedValue([]), // Return an empty array by default
}));

jest.mock("firebase/firestore", () => ({
  ...jest.requireActual("firebase/firestore"),
  onSnapshot: jest.fn().mockImplementation((query, callback) => {
    // Properly structure the querySnapshot with docs array
    callback({
      docs: [
        {
          id: "request1",
          data: () => ({
            requestID: "request1",
            requestTitle: "Leaky faucet",
            requestStatus: "completed"
          })
        }
      ],
      forEach: function(fn: any) {
        this.docs.forEach(fn);
      }
    });
    return jest.fn(); // Cleanup function
  })
}));

// Mock Navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useFocusEffect: jest.fn()
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

    const screen = render(<MaintenanceIssues />);

    // Wait for maintenance issues to load and display
    await waitFor(() => expect(getMaintenanceRequestsQuery).toHaveBeenCalledWith("mockTenantId"));
    expect(screen.getByText("Leaky faucet")).toBeTruthy();
    expect(screen.getByText("Status: In Progress")).toBeTruthy();
  });

  test("toggles archived issues switch and displays archived issues when toggled", async () => {
    // Mock pending requests
    (getPendingRequests as jest.Mock).mockResolvedValue([{
      requestTitle: "Leaky faucet",
      requestDescription: "Bathroom faucet is leaking",
      requestStatus: "pending"
  }]);
    
    // Mock the query response
    const mockIssueData = [{
        id: "request1",
        data: () => ({
            requestID: "request1",
            requestTitle: "Leaky faucet",
            requestStatus: "completed",
        })
    }];

    const screen = render(<MaintenanceIssues />);
    const archivedSwitch = await waitFor(() => screen.getByTestId("archiveSwitch"));

    // Check initial state (should not show completed issues)
    expect(screen.queryByText("Leaky faucet")).toBeNull();

    // Toggle switch to show archived issues
    fireEvent(archivedSwitch, 'valueChange', true);
    
    // Verify archived issues are shown
    await waitFor(() => {
        expect(archivedSwitch.props.value).toBe(true);
        expect(screen.getByText("Leaky faucet")).toBeTruthy();
    });

    // Toggle switch back to hide archived issues
    fireEvent(archivedSwitch, 'valueChange', false);
    
    // Verify archived issues are hidden
    await waitFor(() => {
        expect(archivedSwitch.props.value).toBe(false);
        expect(screen.queryByText("Leaky faucet")).toBeNull();
    });
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

    const screen = render(<MaintenanceIssues />);

    // Wait for maintenance issues to load
    await waitFor(() => expect(screen.getByText("Leaky faucet")).toBeTruthy());

    // Press the arrow button to navigate to details
    const arrowButton = screen.getByTestId("arrowButton");
    fireEvent.press(arrowButton);
    expect(mockNavigate).toHaveBeenCalledWith("IssueDetails", { requestID: "request1" });
  });
});
