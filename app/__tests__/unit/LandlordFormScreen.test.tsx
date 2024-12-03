import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import LandlordFormScreen from "../../screens/auth/LandlordFormScreen";
import { createLandlord, createUser } from "../../../firebase/firestore/firestore";
import { Alert } from "react-native";
import "@testing-library/jest-native/extend-expect";
import { emailAndPasswordSignIn } from "../../../firebase/auth/auth";

// portions of this code were generated using chatGPT as an AI assistant

// Mock the add_new_landlord Firestore function
jest.mock("../../../firebase/firestore/firestore", () => ({
  createLandlord: jest.fn(),
  createUser: jest.fn(),
}));

jest.mock("../../../firebase/auth/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  emailAndPasswordSignIn: jest.fn(),
}));

// Mock Navigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: { email: "john.doe@example.com", password: "password123" },
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
  
    // Test First Name field
    const firstNameField = getByTestId("testFirstNameField");
    fireEvent.changeText(firstNameField, "John");
    expect(firstNameField.props.value).toBe("John");
  
    // Test Last Name field
    const lastNameField = getByTestId("testLastNameField");
    fireEvent.changeText(lastNameField, "Doe");
    expect(lastNameField.props.value).toBe("Doe");
  
    // Test Phone field
    const phoneField = getByTestId("testPhoneField");
    fireEvent.changeText(phoneField, "1234567890");
    expect(phoneField.props.value).toBe("1234567890");
  
    // Test Street field
    const streetField = getByTestId("testStreetField");
    fireEvent.changeText(streetField, "Main Street");
    expect(streetField.props.value).toBe("Main Street");
  
    // Test Number field
    const numberField = getByTestId("testNumberField");
    fireEvent.changeText(numberField, "42");
    expect(numberField.props.value).toBe("42");
  
    // Test City field
    const cityField = getByTestId("testCityField");
    fireEvent.changeText(cityField, "Anytown");
    expect(cityField.props.value).toBe("Anytown");
  
    // Test Canton/State field
    const cantonField = getByTestId("testCantonField");
    fireEvent.changeText(cantonField, "Anystate");
    expect(cantonField.props.value).toBe("Anystate");
  
    // Test ZIP field
    const zipField = getByTestId("testZipField");
    fireEvent.changeText(zipField, "12345");
    expect(zipField.props.value).toBe("12345");
  
    // Test Country field
    const countryField = getByTestId("testCountryField");
    fireEvent.changeText(countryField, "Countryland");
    expect(countryField.props.value).toBe("Countryland");
  });
  

  test("submit button is disabled when required fields are empty", () => {
    const screen = render(<LandlordFormScreen />);
    const submitButton = screen.getByTestId("testSubmitButtonLandlord");
    expect(submitButton.props.accessibilityState.disabled).toBe(true); // Check directly for `disabled` prop
  });
  
  test("submit button is enabled when all required fields are filled", async () => {
    const { getByTestId } = render(<LandlordFormScreen />);
  
    const requiredFields = [
      { testId: "testFirstNameField", value: "John" },
      { testId: "testLastNameField", value: "Doe" },
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

    const submitButton = getByTestId("testSubmitButtonLandlord");
    expect(submitButton.props.accessibilityState.disabled).toBe(false); // Verify button is enabled
  });


  test("does not update Firebase when submit button is pressed if disabled", () => {
    const { getByTestId } = render(<LandlordFormScreen />);
    const submitButton = getByTestId("testSubmitButtonLandlord");
    fireEvent.press(submitButton);
    expect(createLandlord).not.toHaveBeenCalled(); // Should not trigger action
    expect(createUser).not.toHaveBeenCalled();
    expect(emailAndPasswordSignIn).not.toHaveBeenCalled();
  });

  test("successful form submission creates a user, a landlord, and logs them in", async () => {
    (emailAndPasswordSignIn as jest.Mock).mockResolvedValueOnce({ uid: "12345" });
    (createUser as jest.Mock).mockResolvedValueOnce(undefined);
    (createLandlord as jest.Mock).mockResolvedValueOnce(undefined);
  
    const screen = render(<LandlordFormScreen />);
  
    const requiredFields = [
      { testId: "testFirstNameField", value: "John" },
      { testId: "testLastNameField", value: "Doe" },
      { testId: "testPhoneField", value: "1234567890" },
      { testId: "testStreetField", value: "Main Street" },
      { testId: "testZipField", value: "12345" },
      { testId: "testCityField", value: "Anytown" },
      { testId: "testCantonField", value: "Anystate" },
      { testId: "testNumberField", value: "42" },
      { testId: "testCountryField", value: "Countryland" },
    ];
  
    // Fill out the form fields
    await act(async () => {
      requiredFields.forEach(({ testId, value }) => {
        const field = screen.getByTestId(testId);
        fireEvent.changeText(field, value);
      });
    });
  
    jest.spyOn(Alert, "alert");
  
    // Submit the form
    const submitButton = screen.getByTestId("testSubmitButtonLandlord");
    await act(() => {
      fireEvent.press(submitButton);
    });
  
    // Assertions
    await waitFor(() => {
      // Check if emailAndPasswordSignIn was called with correct email and password
      expect(emailAndPasswordSignIn).toHaveBeenCalledWith(
        "john.doe@example.com",
        "password123"
      );
  
      // Check if createUser was called with the correct user data
      expect(createUser).toHaveBeenCalledWith({
        uid: "12345",
        type: "landlord",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "1234567890",
        street: "Main Street",
        number: "42",
        city: "Anytown",
        canton: "Anystate",
        zip: "12345",
        country: "Countryland",
      });
  
      // Check if createLandlord was called with the correct landlord data
      expect(createLandlord).toHaveBeenCalledWith({
        userId: "12345",
        residenceIds: [],
      });
  
      // Check if Alert.alert was called with success message
      expect(Alert.alert).toHaveBeenCalledWith(
        "Success",
        "Landlord profile created successfully!"
      );
    });
  });
});
