import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LandlordListIssuesScreen from "../../screens/issues_landlord/LandlordListIssuesScreen";
import { getLandlord, getResidence, getTenant, getMaintenanceRequest, getMaintenanceRequestsQuery } from "../../../firebase/firestore/firestore";
import "@testing-library/jest-native/extend-expect";
import { onSnapshot } from "firebase/firestore";

// portions of this code were generated using chatGPT as an AI assistant

// Mocking Firestore functions
jest.mock("../../../firebase/firestore/firestore", () => ({
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

jest.mock("firebase/auth", () => ({
    getAuth: () => ({
      currentUser: { uid: "landlord1" },
    }),
  }));
  

jest.mock('@expo/vector-icons', () => ({
    Feather: ({ name, size, color }: { name: string; size: number; color: string }) => 
      `Feather Icon: ${name}, ${size}, ${color}`,
  }));
  

describe("LandlordListIssuesScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly with title", () => {
    const screen = render(<LandlordListIssuesScreen />);
    expect(screen.getByText("Maintenance issues")).toBeTruthy();
  });

  test("fetches and displays residences and tenants", async () => {
    // Mock data for residences, tenants, and maintenance requests
    const landlordData = {
      landlord: { residenceIds: ["residence1"] },
      landlordUID: "landlord1",
    };
    const residenceData = {
      residenceId: "residence1",
      street: "123 Main St",
      tenantIds: ["tenant1"],
    };
    const tenantData = {
      tenant: { tenantId: "tenant1", maintenanceRequests: ["request1"] },
    };
    const maintenanceRequestData = {
      requestID: "request1",
      requestTitle: "Fix leaky faucet",
      requestStatus: "in Progress",
      residenceId: "residence1",
    };

    // Set up mocks
    (getLandlord as jest.Mock).mockResolvedValue(landlordData);
    (getResidence as jest.Mock).mockResolvedValue(residenceData);
    (getTenant as jest.Mock).mockResolvedValue(tenantData);
    (getMaintenanceRequest as jest.Mock).mockResolvedValue(maintenanceRequestData);

    const screen = render(<LandlordListIssuesScreen />);

    // Wait for data to load and assert correct rendering
    expect(getLandlord).toHaveBeenCalledWith("landlord1");
    await waitFor(() => expect(getResidence).toHaveBeenCalledWith("residence1"));
    fireEvent.press(screen.getByTestId('residenceButton'));
    await waitFor(() => expect(getTenant).toHaveBeenCalledWith("tenant1"));
    await waitFor(() => expect(getMaintenanceRequest).toHaveBeenCalledWith("request1"));

    expect(screen.getByText("Residence 123 Main St")).toBeTruthy();
    expect(screen.getByText("Fix leaky faucet")).toBeTruthy();
    expect(screen.getByText("Status: in Progress")).toBeTruthy();
  });

  test("toggles archived issues switch and displays archived issues when toggled", async () => {
    // Mock data for residence, tenants, and maintenance requests
    const landlordData = {
      landlord: { residenceIds: ["residence1"] },
      landlordUID: "landlord1",
    };
    const residenceData = {
      residenceId: "residence1",
      street: "123 Main St",
      tenantIds: ["tenant1"],
    };
    const tenantData = {
      tenant: { tenantId: "tenant1", maintenanceRequests: ["request1"] },
    };
    const maintenanceRequestData = {
      requestID: "request1",
      requestTitle: "Fix leaky faucet",
      requestStatus: "completed",
      residenceId: "residence1",
    };
  
    // Mock Firestore functions
    (getLandlord as jest.Mock).mockResolvedValue(landlordData);
    (getResidence as jest.Mock).mockResolvedValue(residenceData);
    (getTenant as jest.Mock).mockResolvedValue(tenantData);
    (getMaintenanceRequest as jest.Mock).mockResolvedValue(maintenanceRequestData);
  
    const screen = render(<LandlordListIssuesScreen />);
  
    // Wait for residence and issues to load
    await waitFor(() => expect(screen.getByText("Residence 123 Main St")).toBeTruthy());
    // try to display all the residence's issues to ensure nothing is displayed
    fireEvent.press(screen.getByTestId('residenceButton'));
  
    // Ensure the archived issue is not shown initially
    const issue = screen.queryByText("Fix leaky faucet");
    expect(issue).toBeNull();
  
    // Find the archived switch
    const archivedSwitch = screen.getByTestId("archivedSwitch");
  
    // Toggle the archived switch to `true`
    fireEvent(archivedSwitch, "valueChange", true);
    await waitFor(() => expect(archivedSwitch.props.value).toBe(true));
  
    // Now the completed issue should be visible
    await waitFor(() => {
      expect(screen.getByText("Fix leaky faucet")).toBeTruthy();
    });
  
    // Toggle the archived switch back to `false`
    fireEvent(archivedSwitch, "valueChange", false);
    await waitFor(() => expect(archivedSwitch.props.value).toBe(false));
  
    // Ensure the completed issue is hidden again
    const toggledIssue = screen.queryByText("Fix leaky faucet");
    expect(toggledIssue).toBeNull();
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
    // Mock data for residences and maintenance requests
    const landlordData = {
      landlord: { residenceIds: ["residence1"] },
      landlordUID: "landlord1",
    };
    const residenceData = {
      residenceId: "residence1",
      street: "123 Main St",
      tenantIds: ["tenant1"],
    };
    const tenantData = {
      tenant: { tenantId: "tenant1", maintenanceRequests: ["request1"] },
    };
    const maintenanceRequestData = {
      requestID: "request1",
      requestTitle: "Fix leaky faucet",
      requestStatus: "inProgress",
      residenceId: "residence1",
    };

    (getLandlord as jest.Mock).mockResolvedValue(landlordData);
    (getResidence as jest.Mock).mockResolvedValue(residenceData);
    (getTenant as jest.Mock).mockResolvedValue(tenantData);
    (getMaintenanceRequest as jest.Mock).mockResolvedValue(maintenanceRequestData);

    const screen = render(<LandlordListIssuesScreen />);

    // Wait for residence to load
    const residenceItem = await screen.findByText("Residence 123 Main St");

    // Expand the residence to show issues
    fireEvent.press(residenceItem);

    expect(screen.getByText("Fix leaky faucet")).toBeTruthy();

    // Collapse the residence
    fireEvent.press(residenceItem);

    // Ensure the issue is hidden when collapsed
    await waitFor(() => {
      expect(screen.queryByText("Fix leaky faucet")).toBeNull();
    });
  });
});
