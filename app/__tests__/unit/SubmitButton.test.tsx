import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SubmitButton from "../../components/buttons/SubmitButton"; // Adjust the import path
import { Image } from "react-native";

describe("SubmitButton Component", () => {
  it("renders correctly with label and optional image", () => {
    const mockOnPress = jest.fn();
    const mockImage = { uri: "https://example.com/icon.png" };

    const { getByText, getByTestId } = render(
      <SubmitButton
        disabled={false}
        onPress={mockOnPress}
        width={200}
        height={50}
        label="Submit"
        testID="submit-button"
        image={mockImage}
      />
    );

    // Check if label is rendered
    expect(getByText("Submit")).toBeTruthy();

    // Check if image is rendered
    const image = getByTestId("submit-button").findByType(Image);
    expect(image).toBeTruthy();
  });

  it("calls onPress when the button is pressed", () => {
    const mockOnPress = jest.fn();

    const { getByTestId } = render(
      <SubmitButton
        disabled={false}
        onPress={mockOnPress}
        width={200}
        height={50}
        label="Submit"
        testID="submit-button"
      />
    );

    const button = getByTestId("submit-button");
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalled();
  });

  it("disables the button when disabled is true", () => {
    const mockOnPress = jest.fn();

    const { getByTestId } = render(
      <SubmitButton
        disabled={true}
        onPress={mockOnPress}
        width={200}
        height={50}
        label="Submit"
        testID="submit-button"
      />
    );

    const button = getByTestId("submit-button");
    fireEvent.press(button);

    // Ensure the button is not clickable
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
