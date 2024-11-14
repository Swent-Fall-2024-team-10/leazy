import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CloseConfirmation from "../components/buttons/CloseConfirmation"; // Adjust the import path

describe("CloseConfirmation Component", () => {
  it("renders confirmation message and buttons correctly when visible", () => {
    const { getByText } = render(
      <CloseConfirmation
        isVisible={true}
        onPressYes={jest.fn()}
        onPressNo={jest.fn()}
      />
    );

    expect(
      getByText("Are you sure you want to cancel the creation of this issue?")
    ).toBeTruthy();

    expect(getByText("Yes, cancel")).toBeTruthy();
    expect(getByText("No, Go back")).toBeTruthy();
  });

  it('calls onPressYes when "Yes, cancel" button is pressed', () => {
    const mockPressYes = jest.fn();
    const { getByText } = render(
      <CloseConfirmation
        isVisible={true}
        onPressYes={mockPressYes}
        onPressNo={jest.fn()}
      />
    );

    fireEvent.press(getByText("Yes, cancel"));
    expect(mockPressYes).toHaveBeenCalled();
  });

  it('calls onPressNo when "No, Go back" button is pressed', () => {
    const mockPressNo = jest.fn();
    const { getByText } = render(
      <CloseConfirmation
        isVisible={true}
        onPressYes={jest.fn()}
        onPressNo={mockPressNo}
      />
    );

    fireEvent.press(getByText("No, Go back"));
    expect(mockPressNo).toHaveBeenCalled();
  });

  it("does not render when isVisible is false", () => {
    const { queryByText } = render(
      <CloseConfirmation
        isVisible={false}
        onPressYes={jest.fn()}
        onPressNo={jest.fn()}
      />
    );

    expect(
      queryByText("Are you sure you want to cancel the creation of this issue?")
    ).toBeNull();
    expect(queryByText("Yes, cancel")).toBeNull();
    expect(queryByText("No, Go back")).toBeNull();
  });
});
