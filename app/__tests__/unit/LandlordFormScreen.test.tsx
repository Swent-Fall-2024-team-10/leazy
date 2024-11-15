import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import LandlordFormScreen from "../../screens/landlord/LandlordFormScreen"; // Adjust the import path if necessary
import { add_new_landlord } from "../../../firebase/firestore/firestore";
import { Alert } from "react-native";
import "@testing-library/jest-native/extend-expect";

// Mock the add_new_landlord Firestore function
jest.mock("../../../firebase/firestore/firestore", () => ({
  add_new_landlord: jest.fn(),
}));

// Mock Navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe("LandlordFormScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly with the title 'Landlord Profile'", () => {
    const { getByText } = render(<LandlordFormScreen />);
    expect(getByText("Landlord Profile")).toBeTruthy();
  });

  test("input fields can be filled", () => {
    const { getByTestId } = render(<LandlordFormScreen />);
    
    const firstNameField = getByTestId("testFirstNameField");
    fireEvent.changeText(firstNameField, "John");
    expect(firstNameField.props.value).toBe("John");

    const lastNameField = getByTestId("testLastNameField");
    fireEvent.changeText(lastNameField, "Doe");
    expect(lastNameField.props.value).toBe("Doe");

    // Add assertions for the other fields...
  });

  /*
  test("submit button is disabled when required fields are empty", () => {
    const { getByTestId } = render(<LandlordFormScreen />);
    const submitButton = getByTestId("submitButton");
    expect(submitButton.props.disabled).toBe(true); // Check directly for `disabled` prop
  });
  
  test("submit button is enabled when all required fields are filled", async () => {
    const { getByTestId } = render(<LandlordFormScreen />);
  
    const requiredFields = [
      { testId: "testFirstNameField", value: "John" },
      { testId: "testLastNameField", value: "Doe" },
      { testId: "testEmailField", value: "john.doe@example.com" },
      { testId: "testPhoneField", value: "1234567890" },
      { testId: "testStreetField", value: "Main Street" },
      { testId: "testZipField", value: "12345" },
      { testId: "testCityField", value: "Anytown" },
      { testId: "testCantonField", value: "Anystate" },
      { testId: "testNumberField", value: "42" },
      { testId: "testCountryField", value: "Countryland" },
    ];

    await act(async () => {
      requiredFields.forEach(({ testId, value }) => {
        const field = getByTestId(testId);
        fireEvent.changeText(field, value);
      });
    });

    const submitButton = getByTestId("submitButton");
    expect(submitButton.props.disabled).toBe(false); // Verify button is enabled
  });
  */

  test("does not call add_new_landlord when submit button is pressed if disabled", () => {
    const { getByTestId } = render(<LandlordFormScreen />);
    const submitButton = getByTestId("submitButton");
    fireEvent.press(submitButton);
    expect(add_new_landlord).not.toHaveBeenCalled(); // Should not trigger action
  });

  test("successful form submission navigates to Home screen", async () => {
    (add_new_landlord as jest.Mock).mockResolvedValueOnce(undefined);

    const { getByTestId } = render(<LandlordFormScreen />);

    const requiredFields = [
      { testId: "testFirstNameField", value: "John" },
      { testId: "testLastNameField", value: "Doe" },
      { testId: "testEmailField", value: "john.doe@example.com" },
      { testId: "testPhoneField", value: "1234567890" },
      { testId: "testStreetField", value: "Main Street" },
      { testId: "testZipField", value: "12345" },
      { testId: "testCityField", value: "Anytown" },
      { testId: "testCantonField", value: "Anystate" },
      { testId: "testNumberField", value: "42" },
      { testId: "testCountryField", value: "Countryland" },
    ];

    await act(async () => {
      requiredFields.forEach(({ testId, value }) => {
        const field = getByTestId(testId);
        fireEvent.changeText(field, value);
      });
    });

    jest.spyOn(Alert, "alert");

    const submitButton = getByTestId("submitButton");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(add_new_landlord).toHaveBeenCalledWith(
        "John Doe",
        "john.doe@example.com",
        "1234567890",
        "Main Street",
        "42",
        "Anytown",
        "Anystate",
        "12345",
        "Countryland"
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Landlord profile created successfully!"
      );
      expect(mockNavigate).toHaveBeenCalledWith("Home");
    });
  });
});
