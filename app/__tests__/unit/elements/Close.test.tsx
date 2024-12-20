import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Close from "../../../components/buttons/Close"; // Adjust the import path as necessary

jest.mock("@expo/vector-icons", () => {
  return {
    AntDesign: jest.fn(({ name, ...props }) => {
      const { Text } = require("react-native"); // Lazy require to fix out-of-scope issue
      return <Text {...props}>Icon: {name}</Text>;
    }),
  };
});

describe("Close Component", () => {
  it("renders the Close button with text and icon", () => {
    const mockPressHandler = jest.fn();
    const { getByText } = render(<Close onPress={mockPressHandler} />);

    // Check if "Close" text is present
    expect(getByText("Close")).toBeTruthy();

    // Check if the icon is rendered
    expect(getByText("Icon: down")).toBeTruthy();
  });

  it("calls onPress handler when the Close button is pressed", () => {
    const mockPressHandler = jest.fn();
    const { getByText } = render(<Close onPress={mockPressHandler} />);

    // Simulate button press
    fireEvent.press(getByText("Close"));

    // Ensure the mock handler was called
    expect(mockPressHandler).toHaveBeenCalled();
  });
});
