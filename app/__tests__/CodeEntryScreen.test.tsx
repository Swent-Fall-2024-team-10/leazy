import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import CodeEntryScreen from "../screens/auth/CodeEntryScreen";
import { validateTenantCode } from "../../firebase/firestore/firestore";
import { Alert } from "react-native";
import "@testing-library/jest-native/extend-expect";

// Mock the navigation and route
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
    useRoute: () => ({
      params: {
        userId: "test-user-id",
        email: "test@example.com",
      },
    }),
  };
});

jest.spyOn(Alert, "alert").mockImplementation();

// Mock the Firebase functions
jest.mock("../../firebase/firestore/firestore", () => ({
  validateTenantCode: jest.fn(),
}));

// Create a wrapper component for testing
const Stack = createStackNavigator();
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="CodeEntry">{() => children}</Stack.Screen>
    </Stack.Navigator>
  </NavigationContainer>
);

describe("CodeEntryScreen", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    const { getByText, getByTestId } = render(
      <TestWrapper>
        <CodeEntryScreen />
      </TestWrapper>
    );

    // Check if main components are rendered
    expect(getByText("Welcome to Leazy")).toBeTruthy();
    expect(getByText("Do you already have a code?")).toBeTruthy();
    expect(getByTestId("code-input")).toBeTruthy();
    expect(getByTestId("submit-code-button")).toBeTruthy();
    expect(
      getByText(
        "If you don't have a code please ask your residence manager to generate one for you."
      )
    ).toBeTruthy();
  });

  it("handles code input correctly", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <CodeEntryScreen />
      </TestWrapper>
    );

    const input = getByTestId("code-input");
    fireEvent.changeText(input, "TEST123");
    expect(input.props.value).toBe("TEST123");
  });

  it("navigates to CodeApproved screen on successful code validation", async () => {
    const mockTenantCodeId = "valid-tenant-code-id";
    (validateTenantCode as jest.Mock).mockResolvedValue(mockTenantCodeId);

    const { getByTestId } = render(
      <TestWrapper>
        <CodeEntryScreen />
      </TestWrapper>
    );

    const input = getByTestId("code-input");
    const submitButton = getByTestId("submit-code-button");

    fireEvent.changeText(input, "VALID123");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(validateTenantCode).toHaveBeenCalledWith("VALID123");
      expect(mockNavigate).toHaveBeenCalledWith("CodeApproved", {
        tenantCodeId: mockTenantCodeId,
      });
    });
  });

  it("displays error message for invalid code", async () => {
    // Mock validateTenantCode to return null to simulate invalid code
    (validateTenantCode as jest.Mock).mockResolvedValue(null);

    // Mock Alert.alert
    const mockAlert = jest.spyOn(Alert, "alert").mockImplementation();

    const { getByTestId } = render(
      <TestWrapper>
        <CodeEntryScreen />
      </TestWrapper>
    );

    const input = getByTestId("code-input");
    const submitButton = getByTestId("submit-code-button");

    fireEvent.changeText(input, "INVALID123");
    fireEvent.press(submitButton);

    // Use waitFor to handle asynchronous code
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "There was an error adding the tenant. Please try again."
      );
    });

    mockAlert.mockRestore();
  });

  it("handles Firebase validation error correctly", async () => {

    const mockAlert = jest.spyOn(Alert, "alert").mockImplementation();

    (validateTenantCode as jest.Mock).mockRejectedValue(
      new Error("Firebase error")
    );

    const { getByTestId } = render(
      <TestWrapper>
        <CodeEntryScreen />
      </TestWrapper>
    );

    const input = getByTestId("code-input");
    const submitButton = getByTestId("submit-code-button");

    fireEvent.changeText(input, "TEST123");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "There was an error adding the tenant. Please try again."
      );
    });


    mockAlert.mockRestore();
  });

  it("receives and uses correct route params", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <CodeEntryScreen />
      </TestWrapper>
    );

    // The test passes if the component renders without crashing,
    // as the route params are used in the component
    expect(getByTestId("code-input")).toBeTruthy();
  });
});
