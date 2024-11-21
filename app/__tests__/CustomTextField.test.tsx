import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CustomTextField from "../components/CustomTextField"; // Adjust path as necessary

describe("CustomTextField Component", () => {
  it("renders the text input with the correct placeholder", () => {
    const { getByPlaceholderText } = render(
      <CustomTextField
        value=""
        onChangeText={jest.fn()}
        placeholder="Enter text"
        testID="custom-text-field"
      />
    );

    // Verify the placeholder is rendered
    expect(getByPlaceholderText("Enter text")).toBeTruthy();
  });

  it("displays the correct value", () => {
    const { getByDisplayValue } = render(
      <CustomTextField
        value="Test value"
        onChangeText={jest.fn()}
        placeholder="Enter text"
        testID="custom-text-field"
      />
    );

    // Verify the text input displays the correct value
    expect(getByDisplayValue("Test value")).toBeTruthy();
  });

  it("calls onChangeText when input text changes", () => {
    const mockOnChangeText = jest.fn();
    const { getByTestId } = render(
      <CustomTextField
        value=""
        onChangeText={mockOnChangeText}
        placeholder="Enter text"
        testID="custom-text-field"
      />
    );

    const textInput = getByTestId("custom-text-field");
    fireEvent.changeText(textInput, "New text");

    // Verify onChangeText is called with the correct value
    expect(mockOnChangeText).toHaveBeenCalledWith("New text");
  });

  it("applies the correct keyboardType", () => {
    const { getByTestId } = render(
      <CustomTextField
        value=""
        onChangeText={jest.fn()}
        placeholder="Enter numeric value"
        testID="custom-text-field"
        keyboardType="numeric"
      />
    );

    const textInput = getByTestId("custom-text-field");
    expect(textInput.props.keyboardType).toBe("numeric");
  });

  it("applies the correct autoCapitalize setting", () => {
    const { getByTestId } = render(
      <CustomTextField
        value=""
        onChangeText={jest.fn()}
        placeholder="Enter text"
        testID="custom-text-field"
        autoCapitalize="words"
      />
    );

    const textInput = getByTestId("custom-text-field");
    expect(textInput.props.autoCapitalize).toBe("words");
  });

  it("uses secureTextEntry when set to true", () => {
    const { getByTestId } = render(
      <CustomTextField
        value="password"
        onChangeText={jest.fn()}
        placeholder="Enter password"
        testID="custom-text-field"
        secureTextEntry={true}
      />
    );

    const textInput = getByTestId("custom-text-field");
    expect(textInput.props.secureTextEntry).toBe(true);
  });
});
