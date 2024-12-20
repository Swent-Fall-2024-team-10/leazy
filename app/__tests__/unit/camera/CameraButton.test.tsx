import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CameraButton from "../../../components/buttons/CameraButton"; // Adjust the import path

jest.mock("@expo/vector-icons", () => {
  const { Text } = require("react-native"); // Lazy import inside the mock

  return {
    AntDesign: jest.fn().mockImplementation(({ name, size, color }) => {
      return <Text>{`Icon: ${name} Size: ${size} Color: ${color}`}</Text>;
    }),
  };
});

describe("CameraButton Component", () => {
  it("renders correctly with the correct text and icon", () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<CameraButton onPress={mockOnPress} />);

    // Check if the label is rendered
    expect(getByText("Take Picture")).toBeTruthy();

    // Check if the icon is rendered correctly
    expect(getByText("Icon: camera Size: 50 Color: white")).toBeTruthy();
  });

  it("calls onPress when the button is pressed", () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(<CameraButton onPress={mockOnPress} />);

    const button = getByRole("button"); // Use getByRole for role queries
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalled();
  });
});
