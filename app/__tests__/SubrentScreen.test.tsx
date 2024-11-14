// app/__tests__/SubrentScreen.test.tsx

import React from "react";
import { render } from "@testing-library/react-native";
import SubrentScreen from "../screens/tenant/SubrentScreen";
import "@testing-library/jest-native/extend-expect";

// Mock the navigation
const mockNavigate = jest.fn();
const mockOpenDrawer = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      openDrawer: mockOpenDrawer,
    }),
  };
});

describe("SubrentScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    const { getByText } = render(<SubrentScreen />);

    expect(getByText("Subrent Screen")).toBeTruthy();
    expect(
      getByText("This will display subrent-related information.")
    ).toBeTruthy();
  });
});
