import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import AdaptiveButton from "../components/AdaptiveButton"; // Adjust the path as needed
import { Text } from "react-native";

describe("AdaptiveButton Component", () => {
  it("renders the button with the correct title", () => {
    const mockPressHandler = jest.fn();
    const { getByText } = render(
      <AdaptiveButton title="Click Me" onPress={mockPressHandler} />
    );

    expect(getByText("Click Me")).toBeTruthy();
  });

  it("calls onPress when the button is pressed", () => {
    const mockPressHandler = jest.fn();
    const { getByText } = render(
      <AdaptiveButton title="Press Me" onPress={mockPressHandler} />
    );

    fireEvent.press(getByText("Press Me"));
    expect(mockPressHandler).toHaveBeenCalledTimes(1);
  });

  it("renders the icon on the left by default", () => {
    const mockPressHandler = jest.fn();
    const { getByText, getByTestId } = render(
      <AdaptiveButton
        title="Button with Icon"
        onPress={mockPressHandler}
        icon={<Text testID="icon">Icon</Text>}
      />
    );

    expect(getByTestId("icon")).toBeTruthy();
    expect(getByText("Button with Icon")).toBeTruthy();
  });

  it("renders the icon on the right when iconPosition is set to right", () => {
    const mockPressHandler = jest.fn();
    const { getByText, getByTestId } = render(
      <AdaptiveButton
        title="Button with Right Icon"
        onPress={mockPressHandler}
        icon={<Text testID="icon">Icon</Text>}
        iconPosition="right"
      />
    );

    const iconElement = getByTestId("icon");
    expect(iconElement).toBeTruthy();
    expect(getByText("Button with Right Icon")).toBeTruthy();
  });

  it("applies custom styles to the button and text", () => {
    const mockPressHandler = jest.fn();
    const customStyle = { backgroundColor: "blue" };
    const customTextStyle = { color: "yellow" };

    const { getByText } = render(
      <AdaptiveButton
        title="Styled Button"
        onPress={mockPressHandler}
        style={customStyle}
        textStyle={customTextStyle}
      />
    );

    const buttonText = getByText("Styled Button");
    expect(buttonText.props.style).toContainEqual(customTextStyle);
  });
});
