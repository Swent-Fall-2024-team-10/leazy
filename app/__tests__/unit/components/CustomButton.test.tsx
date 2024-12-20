import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CustomButton from "../../../components/CustomButton"; // Adjust path as needed
import { Image, StyleSheet } from "react-native";

describe("CustomButton Component", () => {
  it("renders the button with the correct title", () => {
    const { getByText } = render(
      <CustomButton
        title="Click Me"
        onPress={jest.fn()}
        testID="custom-button"
      />
    );

    expect(getByText("Click Me")).toBeTruthy();
  });

  it("calls onPress when the button is pressed", () => {
    const mockPressHandler = jest.fn();
    const { getByTestId } = render(
      <CustomButton
        title="Press Me"
        onPress={mockPressHandler}
        testID="custom-button"
      />
    );

    fireEvent.press(getByTestId("custom-button"));
    expect(mockPressHandler).toHaveBeenCalledTimes(1);
  });

  it("applies the small size style by default", () => {
    const { getByTestId } = render(
      <CustomButton
        title="Default Size"
        onPress={jest.fn()}
        testID="custom-button"
      />
    );

    const button = getByTestId("custom-button");
    const flattenedStyle = StyleSheet.flatten(button.props.style);
    expect(flattenedStyle).toMatchObject({ width: 126, height: 43 });
  });

  it("applies the medium size style when size='medium'", () => {
    const { getByTestId } = render(
      <CustomButton
        title="Medium Size"
        onPress={jest.fn()}
        size="medium"
        testID="custom-button"
      />
    );

    const button = getByTestId("custom-button");
    const flattenedStyle = StyleSheet.flatten(button.props.style);
    expect(flattenedStyle).toMatchObject({ width: 181, height: 43 });
  });

  it("applies the large size style when size='large'", () => {
    const { getByTestId } = render(
      <CustomButton
        title="Large Size"
        onPress={jest.fn()}
        size="large"
        testID="custom-button"
      />
    );

    const button = getByTestId("custom-button");
    const flattenedStyle = StyleSheet.flatten(button.props.style);
    expect(flattenedStyle).toMatchObject({ width: 263, height: 43 });
  });

  it("renders an image when the image prop is provided", () => {
    const mockImage = { uri: "https://example.com/icon.png" };
    const { getByTestId } = render(
      <CustomButton
        title="With Image"
        onPress={jest.fn()}
        image={mockImage}
        testID="custom-button"
      />
    );

    const image = getByTestId("custom-button").findByType(Image);
    expect(image).toBeTruthy();
  });

  it("applies custom styles to the button", () => {
    const customStyle = { backgroundColor: "blue" };
    const { getByTestId } = render(
      <CustomButton
        title="Styled Button"
        onPress={jest.fn()}
        style={customStyle}
        testID="custom-button"
      />
    );

    const button = getByTestId("custom-button");
    const flattenedStyle = StyleSheet.flatten(button.props.style);
    expect(flattenedStyle).toMatchObject(customStyle);
  });
});
