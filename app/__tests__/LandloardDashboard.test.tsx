// LandlordDashboard.test.tsx

import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import LandlordDashboard from "../screens/landlord/LandlordDashboard";
import "@testing-library/jest-native/extend-expect";
import * as Navigation from "@react-navigation/native";

import { useAuth } from "../context/AuthContext";
import {
  getLandlord,
  getResidence,
  getApartment,
  getMaintenanceRequest,
} from "../../firebase/firestore/firestore";
import { NavigationContainer } from "@react-navigation/native";
import {
  TUser,
  Residence,
  Apartment,
  MaintenanceRequest,
} from "../../types/types";
import { User as FirebaseUser } from "firebase/auth";

jest.mock("../context/AuthContext");
jest.mock("../../firebase/firestore/firestore");
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  memoryLocalCache: jest.fn(),
  initializeFirestore: jest.fn(),
}));

const consoleSpy = {
  error: jest.spyOn(console, "error").mockImplementation(() => {}),
  log: jest.spyOn(console, "log").mockImplementation(() => {}),
  warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
};
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedGetLandlord = getLandlord as jest.MockedFunction<typeof getLandlord>;
const mockedGetResidence = getResidence as jest.MockedFunction<typeof getResidence>;
const mockedGetApartment = getApartment as jest.MockedFunction<typeof getApartment>;
const mockedGetMaintenanceRequest = getMaintenanceRequest as jest.MockedFunction<typeof getMaintenanceRequest>;

describe("LandlordDashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.error.mockClear();
    consoleSpy.log.mockClear();
    consoleSpy.warn.mockClear();
  });

  afterAll(() => {
    consoleSpy.error.mockRestore();
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
  });

  const renderWithNavigation = (component: React.ReactElement) => {
    return render(<NavigationContainer>{component}</NavigationContainer>);
  };

  const mockedUser: TUser = {
    uid: "test-uid",
    type: "landlord",
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "123456789",
    street: "Main Street",
    number: "123",
    city: "Anytown",
    canton: "Anycanton",
    zip: "12345",
    country: "Anycountry",
  };

  const mockedFirebaseUser: FirebaseUser = {
    uid: "test-uid",
    email: "johndoe@example.com",
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: "",
    tenantId: null,
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
    providerId: "",
    displayName: null,
    photoURL: null,
  };

  const mockedAuthContext = {
    firebaseUser: mockedFirebaseUser,
    user: mockedUser,
    tenant: null,
    landlord: null,
    isLoading: false,
    error: undefined,
  };

  test("renders loading state initially", () => {
    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
      isLoading: true,
    });

    const { getByTestId } = renderWithNavigation(<LandlordDashboard />);

    expect(getByTestId("LandlordDashboard_LoadingIndicator")).toBeTruthy();
    expect(getByTestId("LandlordDashboard_LoadingText")).toHaveTextContent(
      "Loading..."
    );
  });

  test("renders error state when data fetching fails", async () => {
    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    mockedGetLandlord.mockRejectedValue(new Error("Network Error"));

    const { findByTestId } = renderWithNavigation(<LandlordDashboard />);

    const errorMessage = await findByTestId("LandlordDashboard_ErrorMessage");
    expect(errorMessage).toHaveTextContent(
      "Unable to load data. Please check your connection and try again."
    );
    expect(await findByTestId("LandlordDashboard_RetryButton")).toBeTruthy();
  });

  test("retries data fetching when retry button is pressed", async () => {
    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    mockedGetLandlord
      .mockRejectedValueOnce(new Error("Network Error"))
      .mockResolvedValueOnce({
        userId: mockedUser.uid,
        residenceIds: [],
      });

    const { findByTestId, getByTestId } = renderWithNavigation(
      <LandlordDashboard />
    );

    const retryButton = await findByTestId("LandlordDashboard_RetryButton");
    fireEvent.press(retryButton);

    await waitFor(() => {
      expect(mockedGetLandlord).toHaveBeenCalledTimes(2);
    });

    expect(getByTestId("LandlordDashboard_NoResidencesText")).toHaveTextContent(
      "No residences available"
    );
  });

  test("renders residences and maintenance issues correctly", async () => {
    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    mockedGetLandlord.mockResolvedValue({
      userId: mockedUser.uid,
      residenceIds: ["res1", "res2"],
    });

    mockedGetResidence.mockImplementation((resId) => {
      const residences = {
        res1: {
          residenceName: "Residence 1",
          apartments: ["apt1", "apt2"],
          pictures: ["https://example.com/pic1.jpg"],
          id: "res1",
        } as Residence,
        res2: {
          residenceName: "Residence 2",
          apartments: ["apt3"],
          pictures: ["https://example.com/pic2.jpg"],
          id: "res2",
        } as Residence,
      };
      return Promise.resolve(residences[resId] || null);
    });

    mockedGetApartment.mockImplementation((aptId) => {
      const apartments = {
        apt1: {
          apartmentName: "Apartment 1",
          maintenanceRequests: ["req1"],
          id: "apt1",
          residenceId: "res1",
        } as Apartment,
        apt2: {
          apartmentName: "Apartment 2",
          maintenanceRequests: ["req2", "req3"],
          id: "apt2",
          residenceId: "res1",
        } as Apartment,
        apt3: {
          apartmentName: "Apartment 3",
          residenceId: "res2",
          tenants: [],
          maintenanceRequests: [],
          id: "apt3",
          situationReportId: "situation1",
        } as Apartment,
      };
      return Promise.resolve(apartments[aptId] || null);
    });

    mockedGetMaintenanceRequest.mockImplementation((reqId) => {
      const requests = {
        req1: {
          requestID: "req1",
          requestTitle: "Fix sink",
          requestStatus: "notStarted",
          requestDate: "01/01/2023 at 12:00",
          apartmentId: "apt1",
        } as MaintenanceRequest,
        req2: {
          requestID: "req2",
          requestTitle: "Broken window",
          requestStatus: "inProgress",
          requestDate: "02/01/2023 at 12:00",
          apartmentId: "apt2",
        } as MaintenanceRequest,
        req3: {
          requestID: "req3",
          requestTitle: "Leaky roof",
          requestStatus: "completed",
          requestDate: "03/01/2023 at 12:00",
          apartmentId: "apt2",
        } as MaintenanceRequest,
      };
      return Promise.resolve(requests[reqId] || null);
    });

    const { findByTestId, getByTestId, getAllByTestId } = renderWithNavigation(
      <LandlordDashboard />
    );

    await waitFor(() => {
      expect(getByTestId("LandlordDashboard_ListedResidencesContainer")).toBeTruthy();
    });

    const residenceItems = getAllByTestId(/^LandlordDashboard_ResidenceItem_/);
    expect(residenceItems).toHaveLength(2);

    expect(getByTestId("LandlordDashboard_ResidenceName_0")).toHaveTextContent(
      "Residence 1"
    );
    expect(getByTestId("LandlordDashboard_ResidenceName_1")).toHaveTextContent(
      "Residence 2"
    );

    expect(getByTestId("LandlordDashboard_NotStartedIssues")).toHaveTextContent(
      "1 Not Started"
    );
    expect(getByTestId("LandlordDashboard_InProgressIssues")).toHaveTextContent(
      "1 In Progress"
    );
    expect(getByTestId("LandlordDashboard_CompletedIssues")).toHaveTextContent(
      "1 Completed"
    );

    expect(getByTestId("LandlordDashboard_MostRecentIssue")).toHaveTextContent(
      "Leaky roof"
    );
  });

  test("navigates to IssueDetails when most recent issue is pressed", async () => {
    const mockNavigate = jest.fn();
    (Navigation.useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });

    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    mockedGetLandlord.mockResolvedValue({
      userId: mockedUser.uid,
      residenceIds: ["res1"],
    });

    mockedGetResidence.mockResolvedValue({
      residenceName: "Residence 1",
      apartments: ["apt1"],
      pictures: ["https://example.com/pic1.jpg"],
      id: "res1",
    } as Residence);

    mockedGetApartment.mockResolvedValue({
      apartmentName: "Apartment 1",
      maintenanceRequests: ["req1"],
      id: "apt1",
      residenceId: "res1",
    } as Apartment);

    mockedGetMaintenanceRequest.mockResolvedValue({
      requestID: "req1",
      requestTitle: "Fix sink",
      requestStatus: "notStarted",
      requestDate: "01/01/2023 at 12:00",
      apartmentId: "apt1",
    } as MaintenanceRequest);

    const { findByTestId } = renderWithNavigation(<LandlordDashboard />);

    await waitFor(async () => {
      const mostRecentIssue = await findByTestId("LandlordDashboard_MostRecentIssue");
      expect(mostRecentIssue).toBeTruthy();
    });

    const mostRecentTouchable = (await findByTestId("LandlordDashboard_MostRecentIssue")).parent;
    if (!mostRecentTouchable) {
      throw new Error("Touchable not found");
    }
    fireEvent.press(mostRecentTouchable);

    expect(mockNavigate).toHaveBeenCalledWith("IssueDetails", {
      requestID: "req1",
    });
  });

  test("renders correctly when there are no maintenance requests", async () => {
    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    mockedGetLandlord.mockResolvedValue({
      userId: mockedUser.uid,
      residenceIds: ["res1"],
    });

    mockedGetResidence.mockResolvedValue({
      residenceName: "Residence 1",
      apartments: ["apt1"],
      pictures: ["https://example.com/pic1.jpg"],
      id: "res1",
    } as Residence);

    mockedGetApartment.mockResolvedValue({
      apartmentName: "Apartment 1",
      residenceId: "res1",
      tenants: [],
      maintenanceRequests: [],
      id: "apt1",
      situationReportId: "situation1",
    } as Apartment);

    const { getByTestId } = renderWithNavigation(<LandlordDashboard />);

    await waitFor(() => {
      expect(getByTestId("LandlordDashboard_NotStartedIssues")).toHaveTextContent(
        "0 Not Started"
      );
    });

    expect(getByTestId("LandlordDashboard_InProgressIssues")).toHaveTextContent(
      "0 In Progress"
    );
    expect(getByTestId("LandlordDashboard_CompletedIssues")).toHaveTextContent(
      "0 Completed"
    );
    expect(getByTestId("LandlordDashboard_MostRecentIssue")).toHaveTextContent(
      "No recent issues"
    );
  });

  test("navigates to Residence Stack when residence is pressed", async () => {
    const mockNavigate = jest.fn();
    (Navigation.useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });

    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    mockedGetLandlord.mockResolvedValue({
      userId: mockedUser.uid,
      residenceIds: ["res1"],
    });

    mockedGetResidence.mockResolvedValue({
      residenceName: "Residence 1",
      apartments: ["apt1"],
      pictures: ["https://example.com/pic1.jpg"],
      id: "res1",
    } as Residence);

    mockedGetApartment.mockResolvedValue({
      apartmentName: "Apartment 1",
      maintenanceRequests: [],
      id: "apt1",
      residenceId: "res1",
    } as Apartment);

    const { findByTestId } = renderWithNavigation(<LandlordDashboard />);

    await waitFor(async () => {
      const residenceItem = await findByTestId("LandlordDashboard_ResidenceItem_0");
      expect(residenceItem).toBeTruthy();
    });

    const residenceItem = await findByTestId("LandlordDashboard_ResidenceItem_0");
    fireEvent.press(residenceItem);

    expect(mockNavigate).toHaveBeenCalledWith("Residence Stack", {
      screen: "ResidenceList"
    });
    expect(mockConsoleLog).toHaveBeenCalledWith("Pressed residence", {"apartments": ["apt1"], "id": "res1", "pictures": ["https://example.com/pic1.jpg"], "residenceName": "Residence 1"});

  });


  test("renders correctly when there are no residences", async () => {
    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    mockedGetLandlord.mockResolvedValue({
      userId: mockedUser.uid,
      residenceIds: [],
    });

    const { findByTestId } = renderWithNavigation(<LandlordDashboard />);

    await waitFor(async () => {
      const noResidencesText = await findByTestId("LandlordDashboard_NoResidencesText");
      expect(noResidencesText).toHaveTextContent("No residences available");
    });
  });
});