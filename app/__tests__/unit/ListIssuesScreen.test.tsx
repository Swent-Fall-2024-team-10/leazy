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
  createNews: jest.fn(),
}));

// Mock Firebase Firestore
jest.mock("firebase/firestore", () => {
  const actual = jest.requireActual("firebase/firestore");
  return {
    ...actual,
    onSnapshot: jest.fn(),
    Timestamp: {
      now: () => ({ seconds: 1234567890, nanoseconds: 0 }),
    },
  };
});

// Mock Navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe("MaintenanceIssues", () => {
  const mockIssueData = {
    requestID: "request1",
    requestTitle: "Leaky faucet",
    requestStatus: "inProgress",
    requestDescription: "Test description",
    picture: [],
    createdAt: { seconds: 1234567890, nanoseconds: 0 },
    updatedAt: { seconds: 1234567890, nanoseconds: 0 },
    tenantID: "mockTenantId",
    landlordID: "mockLandlordId",
    propertyID: "mockPropertyId",
  };

  const setupMockSnapshot = (data = mockIssueData) => {
    let snapshotCallback: any;
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      snapshotCallback = callback;
      // First call for initialization
      callback({
        docs: [{
          data: () => data,
          id: 'request1'
        }],
        forEach: (fn: any) => fn({
          data: () => data,
          id: 'request1'
        }),
        docChanges: () => []
      });

      // Second call after initialization
      setTimeout(() => {
        callback({
          docs: [{
            data: () => data,
            id: 'request1'
          }],
          forEach: (fn: any) => fn({
            data: () => data,
            id: 'request1'
          }),
          docChanges: () => [{
            type: 'modified',
            doc: {
              data: () => data,
              id: 'request1'
            }
          }]
        });
      }, 0);

      return () => {};
    });

    return snapshotCallback;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getMaintenanceRequestsQuery as jest.Mock).mockResolvedValue("mockQuery");
  });

  test("renders correctly with title", () => {
    const screen = render(<MaintenanceIssues />);
    expect(screen.getByText("Maintenance Requests")).toBeTruthy();
  });

  test("fetches and displays maintenance issues", async () => {
    setupMockSnapshot();
    const screen = render(<MaintenanceIssues />);

    // Wait for both the query call and the data to be displayed
    await waitFor(() => {
      expect(getMaintenanceRequestsQuery).toHaveBeenCalledWith("mockTenantId");
    });

    await waitFor(() => {
      expect(screen.getByText("Leaky faucet")).toBeTruthy();
    }, { timeout: 3000 });

    expect(screen.getByText("Status: In Progress")).toBeTruthy();
  });

  test("toggles archived issues switch and displays archived issues when toggled", async () => {
    const archivedIssueData = {
      ...mockIssueData,
      requestStatus: "completed"
    };

    setupMockSnapshot(archivedIssueData);
    const screen = render(<MaintenanceIssues />);
    
    // Wait for component to initialize
    await waitFor(() => {
      expect(getMaintenanceRequestsQuery).toHaveBeenCalledWith("mockTenantId");
    });

    const archivedSwitch = screen.getByTestId("archiveSwitch");
    
    // Initially the completed issue should not be visible
    expect(screen.queryByText("Leaky faucet")).toBeNull();

    // Toggle to show archived
    fireEvent(archivedSwitch, 'valueChange', true);
    
    await waitFor(() => {
      expect(screen.getByText("Leaky faucet")).toBeTruthy();
    }, { timeout: 3000 });

    // Toggle back to hide archived
    fireEvent(archivedSwitch, 'valueChange', false);
    
    await waitFor(() => {
      expect(screen.queryByText("Leaky faucet")).toBeNull();
    });
  });

  test("navigates to issue details when arrow button is pressed", async () => {
    setupMockSnapshot();
    const screen = render(<MaintenanceIssues />);

    await waitFor(() => {
      expect(getMaintenanceRequestsQuery).toHaveBeenCalledWith("mockTenantId");
    });

    await waitFor(() => {
      expect(screen.getByText("Leaky faucet")).toBeTruthy();
    }, { timeout: 3000 });

    const arrowButton = screen.getByTestId("arrowButton");
    fireEvent.press(arrowButton);

    expect(mockNavigate).toHaveBeenCalledWith("IssueDetails", { requestID: "request1" });
  });
});