import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import CodeApprovedScreen from "../screens/auth/CodeApprovedScreen";
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

// Create a wrapper component for testing
const Stack = createStackNavigator();
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="CodeApproved">{() => children}</Stack.Screen>
    </Stack.Navigator>
  </NavigationContainer>
);

describe("CodeApprovedScreen", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    const { getByText, getByTestId } = render(
      <TestWrapper>
        <CodeApprovedScreen />
      </TestWrapper>
    );

    // Check if main components are rendered
    expect(getByText("Code approved!")).toBeTruthy();
    expect(getByText(/Welcome to/)).toBeTruthy();
    expect(getByText(/18 Chemin de Renens, 1004 Lausanne/)).toBeTruthy();
    expect(getByTestId("next-button")).toBeTruthy();
  });

  it("navigates to TenantForm screen when Next button is pressed", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <CodeApprovedScreen />
      </TestWrapper>
    );

    const nextButton = getByTestId("next-button");
    fireEvent.press(nextButton);

    expect(mockNavigate).toHaveBeenCalledWith("TenantForm", {
      email: "test@example.com",
      userId: "test-user-id",
    });
  });

  it("calls console.log when Next button is pressed", () => {
    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    const { getByTestId } = render(
      <TestWrapper>
        <CodeApprovedScreen />
      </TestWrapper>
    );

    const nextButton = getByTestId("next-button");
    fireEvent.press(nextButton);

    expect(consoleLogSpy).toHaveBeenCalledWith("Next button pressed");

    consoleLogSpy.mockRestore();
  });
});
