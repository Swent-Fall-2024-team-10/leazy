import React from "react";
import { render } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "../Navigators/RootNavigator";
import { useAuth } from "../context/AuthContext";

// Mock dependencies
jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../Navigators/AuthStackNavigator", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>AuthStackNavigator</Text>;
});

jest.mock("../Navigators/TenantHomeDrawerNavigator", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>TenantHomeDrawerNavigator</Text>;
});

jest.mock("../Navigators/LandlordDrawerNavigator", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>LandlordDrawerNavigator</Text>;
});

jest.mock("../screens/auth/CodeEntryScreen", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>CodeEntryScreen</Text>;
});

// Helper to render with NavigationContainer
const renderWithNavigation = (ui: React.ReactElement) => {
  return render(<NavigationContainer>{ui}</NavigationContainer>);
};

describe("RootNavigator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders AuthStackNavigator when user is not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      tenant: null,
      landlord: null,
    });

    const { getByText } = renderWithNavigation(<RootNavigator />);
    expect(getByText("AuthStackNavigator")).toBeTruthy();
  });

  it("renders TenantHomeDrawerNavigator when authenticated user is a tenant with residenceId", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { type: "tenant" },
      tenant: { residenceId: "12345" },
      landlord: null,
    });

    const { getByText } = renderWithNavigation(<RootNavigator />);
    expect(getByText("TenantHomeDrawerNavigator")).toBeTruthy();
  });

  it("renders CodeEntryScreen when authenticated user is a tenant without residenceId", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { type: "tenant" },
      tenant: { residenceId: "" },
      landlord: null,
    });

    const { getByText } = renderWithNavigation(<RootNavigator />);
    expect(getByText("CodeEntryScreen")).toBeTruthy();
  });

  it("renders LandlordDrawerNavigator when authenticated user is a landlord", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { type: "landlord" },
      tenant: null,
      landlord: { propertyId: "12345" },
    });

    const { getByText } = renderWithNavigation(<RootNavigator />);
    expect(getByText("LandlordDrawerNavigator")).toBeTruthy();
  });

  it("does not crash when user, tenant, or landlord is undefined", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: undefined,
      tenant: undefined,
      landlord: undefined,
    });

    const { getByText } = renderWithNavigation(<RootNavigator />);
    expect(getByText("AuthStackNavigator")).toBeTruthy();
  });

  it("renders nothing when user type is unknown", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { type: "unknown" },
      tenant: null,
      landlord: null,
    });

    const { queryByText } = renderWithNavigation(<RootNavigator />);
    expect(queryByText("AuthStackNavigator")).toBeNull();
    expect(queryByText("TenantHomeDrawerNavigator")).toBeNull();
    expect(queryByText("CodeEntryScreen")).toBeNull();
    expect(queryByText("LandlordDrawerNavigator")).toBeNull();
  });
});
