import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import LandlordListIssuesScreen from "../../screens/issues_landlord/LandlordListIssuesScreen";
import {
  getLandlord,
  getResidence,
  getTenant,
  getMaintenanceRequest,
} from "../../../firebase/firestore/firestore";
import { useAuth } from "../../context/AuthContext";
import "@testing-library/jest-native/extend-expect";

// Mock the entire firebase/auth module
jest.mock("firebase/auth", () => ({
  getAuth: () => ({
    currentUser: { uid: "landlord1" },
  }),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// Mock the Firebase functions
jest.mock("../../../firebase/firestore/firestore", () => ({
  getLandlord: jest.fn(),
  getResidence: jest.fn(),
  getTenant: jest.fn(),
  getMaintenanceRequest: jest.fn(),
}));

// Mock the auth context
jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(() => ({
    user: { uid: "testLandlordId" },
  })),
}));

jest.mock("@expo/vector-icons", () => ({
  Feather: "Feather",
}));

// Mock data
const RESIDENCE_DOC_ID = "residence1";

const mockLandlord = {
  userId: "testLandlordId",
  residenceIds: [RESIDENCE_DOC_ID],
};

const mockResidence = {
  residenceName: "Residence A",
  street: "123 Test St",
  number: "1",
  city: "Test City",
  canton: "TC",
  zip: "12345",
  country: "Test Country",
  landlordId: "testLandlordId",
  tenantIds: ["tenant1"],
  laundryMachineIds: [],
  apartments: [],
  tenantCodesID: [],
  situationReportLayout: [],
};

const mockTenant = {
  userId: "testUserId",
  maintenanceRequests: ["request1"],
  apartmentId: "apt1",
  residenceId: RESIDENCE_DOC_ID,
};

const mockMaintenanceRequest = {
  requestID: "request1",
  tenantId: "tenant1",
  residenceId: RESIDENCE_DOC_ID,
  apartmentId: "apt1",
  openedBy: "tenant1",
  requestTitle: "Fix faucet",
  requestDate: "2024-01-01",
  requestDescription: "Faucet is leaking",
  picture: [],
  requestStatus: "inProgress" as const,
};

// Wrapper component with navigation context
const renderWithNavigation = (component: React.ReactElement) => {
  return render(<NavigationContainer>{component}</NavigationContainer>);
};

describe("LandlordListIssuesScreen", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Set up mock implementations
    (getLandlord as jest.Mock).mockResolvedValue(mockLandlord);
    (getResidence as jest.Mock).mockResolvedValue(mockResidence);
    (getTenant as jest.Mock).mockResolvedValue(mockTenant);
    (getMaintenanceRequest as jest.Mock).mockResolvedValue(
      mockMaintenanceRequest
    );
  });

  it("renders correctly and displays maintenance issues", async () => {
    const { getByText, getByTestId } = renderWithNavigation(
      <LandlordListIssuesScreen />
    );

    await waitFor(() => {
      expect(getByText("Maintenance issues")).toBeTruthy();
      expect(getByText(/Residence.*123 Test St/)).toBeTruthy();
    });

    const residenceButton = getByTestId("residenceButton");
    await act(async () => {
      fireEvent.press(residenceButton);
    });

    await waitFor(() => {
      expect(getByText("Fix faucet")).toBeTruthy();
    });
  });

  it("expands and collapses residences", async () => {
    const { getByTestId, queryByText } = renderWithNavigation(
      <LandlordListIssuesScreen />
    );

    await waitFor(() => {
      expect(getByTestId("residenceButton")).toBeTruthy();
    });

    const residenceButton = getByTestId("residenceButton");

    await act(async () => {
      fireEvent.press(residenceButton);
    });

    await waitFor(() => {
      expect(queryByText("Fix faucet")).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(residenceButton);
    });

    await waitFor(() => {
      expect(queryByText("Fix faucet")).toBeFalsy();
    });
  });

  it("toggles archived issues when switch is pressed", async () => {
    const { getByTestId } = renderWithNavigation(<LandlordListIssuesScreen />);

    await waitFor(() => {
      expect(getByTestId("archivedSwitch")).toBeTruthy();
    });

    const archiveSwitch = getByTestId("archivedSwitch");
    await act(async () => {
      fireEvent(archiveSwitch, "onValueChange", true);
    });

    expect((archiveSwitch.props as any).value).toBe(true);
  });

  it("handles errors gracefully", async () => {
    (getLandlord as jest.Mock).mockRejectedValue(
      new Error("Error fetching landlord data")
    );

    const { getByText } = renderWithNavigation(<LandlordListIssuesScreen />);

    await waitFor(() => {
      expect(getByText("Maintenance issues")).toBeTruthy();
    });
  });
});

describe("LandlordListIssuesScreen Filtering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getLandlord as jest.Mock).mockResolvedValue(mockLandlord);
    (getResidence as jest.Mock).mockResolvedValue(mockResidence);
    (getTenant as jest.Mock).mockResolvedValue(mockTenant);
    (getMaintenanceRequest as jest.Mock).mockResolvedValue(
      mockMaintenanceRequest
    );
  });

  it("filters issues by status correctly", async () => {
    const { getByTestId, getByText, queryByText } = renderWithNavigation(
      <LandlordListIssuesScreen />
    );

    // Open filter section
    await act(async () => {
      fireEvent.press(getByTestId("filterSection"));
    });

    // Find and press the inProgress filter
    const inProgressFilter = getByText("inProgress");
    await act(async () => {
      fireEvent.press(inProgressFilter);
    });

    // Expand residence to see filtered issues
    const residenceButton = getByTestId("residenceButton");
    await act(async () => {
      fireEvent.press(residenceButton);
    });

    // Should show inProgress issue
    expect(queryByText("Fix faucet")).toBeTruthy();

    // Change filter to completed
    const completedFilter = getByText("completed");
    await act(async () => {
      fireEvent.press(completedFilter);
    });

    // Should not show inProgress issue anymore
    expect(queryByText("Fix faucet")).toBeFalsy();
  });

  it("filters issues by residence correctly", async () => {
    // Mock an additional residence and maintenance request
    const mockResidence2 = {
      ...mockResidence,
      residenceName: "Residence B",
      street: "456 Other St",
    };

    const mockMaintenanceRequest2 = {
      ...mockMaintenanceRequest,
      requestID: "request2",
      residenceId: "residence2",
      requestTitle: "Fix window",
    };

    (getResidence as jest.Mock).mockImplementation((id) => {
      if (id === RESIDENCE_DOC_ID) return mockResidence;
      if (id === "residence2") return mockResidence2;
      return null;
    });

    (getMaintenanceRequest as jest.Mock).mockImplementation((id) => {
      if (id === "request1") return mockMaintenanceRequest;
      if (id === "request2") return mockMaintenanceRequest2;
      return null;
    });

    const { getByTestId, getByText, queryByText } = renderWithNavigation(
      <LandlordListIssuesScreen />
    );

    // Open filter section
    await act(async () => {
      fireEvent.press(getByTestId("filterSection"));
    });

    // Select specific residence by name
    const residenceFilter = getByText("Residence A");
    await act(async () => {
      fireEvent.press(residenceFilter);
    });

    // Expand residence to see filtered issues
    const residenceButton = getByTestId("residenceButton");
    await act(async () => {
      fireEvent.press(residenceButton);
    });

    // Should only show issues from selected residence
    expect(queryByText("Fix faucet")).toBeTruthy();
    expect(queryByText("Fix window")).toBeFalsy();
  });

  it("resets filters when reset button is pressed", async () => {
    const { getByTestId, getByText } = renderWithNavigation(
      <LandlordListIssuesScreen />
    );

    // Open filter section
    await act(async () => {
      fireEvent.press(getByTestId("filterSection"));
    });

    // Apply some filters
    await act(async () => {
      fireEvent.press(getByText("inProgress"));
    });

    // Press reset button
    const resetButton = getByText("Reset Filters");
    await act(async () => {
      fireEvent.press(resetButton);
    });

    // Verify filter section is closed
    expect(getByText("Filter")).toBeTruthy();

    // Expand residence to verify all issues are shown
    const residenceButton = getByTestId("residenceButton");
    await act(async () => {
      fireEvent.press(residenceButton);
    });

    expect(getByText("Fix faucet")).toBeTruthy();
  });
});