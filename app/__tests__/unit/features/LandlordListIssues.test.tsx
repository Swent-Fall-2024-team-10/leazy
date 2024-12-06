import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LandlordListIssuesScreen from "../../../screens/issues_landlord/LandlordListIssuesScreen";
import { getLandlord, getResidence, getTenant, getMaintenanceRequest } from "../../../../firebase/firestore/firestore";
import "@testing-library/jest-native/extend-expect";

// Mock the entire firebase/auth module
jest.mock("firebase/auth", () => ({
  getAuth: () => ({
    currentUser: { uid: "landlord1" },
  }),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));

// Mock the AuthContext
jest.mock("../../../Navigators/AuthContext", () => ({
  useAuth: () => ({
    user: { uid: "landlord1" },
  }),
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// Mocking Firestore functions
jest.mock("../../../../firebase/firestore/firestore", () => ({
  getLandlord: jest.fn(),
  getResidence: jest.fn(),
  getTenant: jest.fn(),
  getMaintenanceRequest: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: ({ name, size, color }: { name: string; size: number; color: string }) => 
    `Feather Icon: ${name}, ${size}, ${color}`,
}));

describe("LandlordListIssuesScreen", () => {

  const mockLandlord = {
    residenceIds: ["residence1"],
    landlordId: "landlord1",
  };

  const mockResidence = {
    residenceId: "residence1",
    street: "123 Main St",
    tenantIds: ["tenant1"],
  };

  const mockTenant = {
    tenantId: "tenant1",
    maintenanceRequests: ["request1"],
  };

  const mockMaintenanceRequest = {
    requestID: "request1",
    requestTitle: "Fix leaky faucet",
    requestStatus: "inProgress",
    residenceId: "residence1",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (getLandlord as jest.Mock).mockResolvedValue(mockLandlord);
    (getResidence as jest.Mock).mockResolvedValue(mockResidence);
    (getTenant as jest.Mock).mockResolvedValue(mockTenant);
    (getMaintenanceRequest as jest.Mock).mockResolvedValue(mockMaintenanceRequest);
  });

  test("renders correctly with title", () => {
    const screen = render(<LandlordListIssuesScreen />);
    expect(screen.getByText("Maintenance issues")).toBeTruthy();
  });

  test("fetches and displays residences and tenants", async () => {
    const screen = render(<LandlordListIssuesScreen />);

    // Wait for landlord data to be fetched
    await waitFor(() => {
      expect(getLandlord).toHaveBeenCalledWith("landlord1");
    });

    // Wait for residence data to be loaded and displayed
    await waitFor(() => {
      expect(getResidence).toHaveBeenCalledWith("residence1");
      expect(screen.getByText("Residence 123 Main St")).toBeTruthy();
    });

    // Press the residence button to expand it
    fireEvent.press(screen.getByTestId('residenceButton'));

    // Wait for maintenance request to be displayed
    await waitFor(() => {
      expect(screen.getByText("Fix leaky faucet")).toBeTruthy();
      expect(screen.getByText("Status: inProgress")).toBeTruthy();
    });
  });


  test("toggles archived issues switch and displays archived issues when toggled", async () => {
    // Update mock for completed maintenance request
    const completedRequest = {
      ...mockMaintenanceRequest,
      requestStatus: "completed",
    };
    (getMaintenanceRequest as jest.Mock).mockResolvedValue(completedRequest);

    const screen = render(<LandlordListIssuesScreen />);

    // Wait for the initial data to load
    await waitFor(() => {
      expect(screen.getByText("Residence 123 Main St")).toBeTruthy();
    });

    // Expand the residence
    fireEvent.press(screen.getByTestId('residenceButton'));

    // Initially, completed issue should not be visible
    expect(screen.queryByText("Fix leaky faucet")).toBeNull();

    // Toggle archived switch
    const archivedSwitch = screen.getByTestId("archivedSwitch");
    fireEvent(archivedSwitch, "valueChange", true);

    // Now the completed issue should be visible
    await waitFor(() => {
      expect(screen.getByText("Fix leaky faucet")).toBeTruthy();
    });

    // Toggle back
    fireEvent(archivedSwitch, "valueChange", false);

    // Issue should be hidden again
    await waitFor(() => {
      expect(screen.queryByText("Fix leaky faucet")).toBeNull();
    });
  });

  test("toggles filter section visibility", () => {
    const screen = render(<LandlordListIssuesScreen />);

    // Find and press the Filter button
    const filterButton = screen.getByText("Filter");
    fireEvent.press(filterButton);

    // Check that filter section is displayed
    expect(screen.getByText("Filter by...")).toBeTruthy();

    // Press Filter button again to hide
    fireEvent.press(filterButton);

    // Verify the filter section is no longer visible
    expect(screen.queryByText("Filter by...")).toBeNull();
  });

  test("expands and collapses a residence to show issues", async () => {
    const screen = render(<LandlordListIssuesScreen />);

    // Wait for the residence to be displayed
    await waitFor(() => {
      expect(screen.getByText("Residence 123 Main St")).toBeTruthy();
    });

    // Expand the residence
    fireEvent.press(screen.getByTestId('residenceButton'));

    // Check that the issue is visible
    await waitFor(() => {
      expect(screen.getByText("Fix leaky faucet")).toBeTruthy();
    });

    // Collapse the residence
    fireEvent.press(screen.getByTestId('residenceButton'));

    // Check that the issue is hidden
    await waitFor(() => {
      expect(screen.queryByText("Fix leaky faucet")).toBeNull();
    });
  });
});