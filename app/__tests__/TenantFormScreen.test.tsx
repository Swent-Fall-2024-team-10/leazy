import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import TenantFormScreen from "../screens/tenant/TenantFormScreen";
import { add_new_tenant } from "../../firebase/firestore/firestore";
import { Alert } from "react-native";
import "@testing-library/jest-native/extend-expect";

jest.mock("../../firebase/firestore/firestore", () => ({
  add_new_tenant: jest.fn(),
}));

jest.spyOn(Alert, "alert");

const mockNavigate = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: {
      tenantCodeId: "testTenantCodeId",
    },
  }),
}));

describe("TenantFormScreen", () => {
  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    (add_new_tenant as jest.Mock).mockClear();
    (Alert.alert as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders correctly", () => {
    const { getByText } = render(<TenantFormScreen />);
    expect(getByText("Tenant Profile")).toBeTruthy();
  });

  test("input fields can be filled", () => {
    const { getByTestId } = render(<TenantFormScreen />);
    const firstNameField = getByTestId("testFirstNameField");
    fireEvent.changeText(firstNameField, "Johnny");
    expect(firstNameField.props.value).toBe("Johnny");

    const lastNameField = getByTestId("testLastNameField");
    fireEvent.changeText(lastNameField, "Hallyday");
    expect(lastNameField.props.value).toBe("Hallyday");
  });

  test("submit button is disabled when required fields are empty", () => {
    const { getByTestId } = render(<TenantFormScreen />);
    const submitButton = getByTestId("submitButton");
    expect(submitButton).toBeDisabled();
  });

  test("submit button is enabled when required fields are filled", async () => {
    const { getByTestId } = render(<TenantFormScreen />);

    const requiredFields = [
      { testId: "testFirstNameField", value: "Johnny" },
      { testId: "testLastNameField", value: "Hallyday" },
      { testId: "testEmailField", value: "johnny.hallyday@gmail.com" },
      { testId: "testPhoneField", value: "1234567890" },
      { testId: "testAddressField", value: "123 Main St" },
      { testId: "testZipField", value: "12345" },
      { testId: "testCityField", value: "Anytown" },
      { testId: "testProvinceField", value: "Anystate" },
      { testId: "testNumberField", value: "42" },
      { testId: "testGenreField", value: "Male" },
      { testId: "testCountryField", value: "USA" },
    ];

    await act(async () => {
      requiredFields.forEach(({ testId, value }) => {
        const field = getByTestId(testId);
        fireEvent.changeText(field, value);
      });
    });

    const submitButton = getByTestId("submitButton");
    expect(submitButton).toBeEnabled();
  });

  test("pressing submit button calls add_new_tenant and navigates to Home", async () => {
    const { getByTestId } = render(<TenantFormScreen />);

    const requiredFields = [
      { testId: "testFirstNameField", value: "Johnny" },
      { testId: "testLastNameField", value: "Hallyday" },
      { testId: "testEmailField", value: "johnny.hallyday@gmail.com" },
      { testId: "testPhoneField", value: "1234567890" },
      { testId: "testAddressField", value: "123 Main St" },
      { testId: "testZipField", value: "12345" },
      { testId: "testCityField", value: "Anytown" },
      { testId: "testProvinceField", value: "Anystate" },
      { testId: "testNumberField", value: "42" },
      { testId: "testGenreField", value: "Male" },
      { testId: "testCountryField", value: "USA" },
    ];

    requiredFields.forEach(({ testId, value }) => {
      const field = getByTestId(testId);
      fireEvent.changeText(field, value);
    });

    const submitButton = getByTestId("submitButton");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(add_new_tenant).toHaveBeenCalledWith(
        "testTenantCodeId",
        "Johnny Hallyday",
        "johnny.hallyday@gmail.com",
        "1234567890",
        "123 Main St",
        "42",
        "Anytown",
        "Anystate",
        "12345",
        "USA"
      );
      expect(mockNavigate).toHaveBeenCalledWith("Home");
    });
  });

  test("shows error alert when add_new_tenant fails", async () => {
    // There could be 5 different errors from add_new_tenant:
    // Error in add_new_tenant: Invalid tenant code data.
    // Error in add_new_tenant: Failed to create tenant profile.
    // Error in add_new_tenant: User not authenticated.
    // Error in add_new_tenant: Residence with ID ${residenceId} not found.
    // Error in add_new_tenant: Apartment with ID ${apartmentId} not found.
    (add_new_tenant as jest.Mock).mockRejectedValue(new Error("Test error"));

    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console.error

    const { getByTestId } = render(<TenantFormScreen />);

    const requiredFields = [
      { testId: "testFirstNameField", value: "Johnny" },
      { testId: "testLastNameField", value: "Hallyday" },
      { testId: "testEmailField", value: "johnny.hallyday@gmail.com" },
      { testId: "testPhoneField", value: "1234567890" },
      { testId: "testAddressField", value: "123 Main St" },
      { testId: "testZipField", value: "12345" },
      { testId: "testCityField", value: "Anytown" },
      { testId: "testProvinceField", value: "Anystate" },
      { testId: "testNumberField", value: "42" },
      { testId: "testGenreField", value: "Male" },
      { testId: "testCountryField", value: "USA" },
    ];

    await act(async () => {
      requiredFields.forEach(({ testId, value }) => {
        const field = getByTestId(testId);
        fireEvent.changeText(field, value);
      });
    });

    const submitButton = getByTestId("submitButton");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(add_new_tenant).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Test error");
    });

    (console.error as jest.Mock).mockRestore(); // Restore console.error
  });

  test('should show "An unknown error occurred" when add_new_tenant throws a non-Error', async () => {
    (add_new_tenant as jest.Mock).mockImplementation(() => {
      throw "Non-Error exception";
    });

    const navigation = { navigate: jest.fn() };

    const { getByTestId } = render(<TenantFormScreen />);

    const requiredFields = [
      { testId: "testFirstNameField", value: "Johnny" },
      { testId: "testLastNameField", value: "Hallyday" },
      { testId: "testEmailField", value: "johnny.hallyday@gmail.com" },
      { testId: "testPhoneField", value: "1234567890" },
      { testId: "testAddressField", value: "123 Main St" },
      { testId: "testZipField", value: "12345" },
      { testId: "testCityField", value: "Anytown" },
      { testId: "testProvinceField", value: "Anystate" },
      { testId: "testNumberField", value: "42" },
      { testId: "testGenreField", value: "Male" },
      { testId: "testCountryField", value: "USA" },
    ];

    await act(async () => {
      requiredFields.forEach(({ testId, value }) => {
        const field = getByTestId(testId);
        fireEvent.changeText(field, value);
      });
    });
    const submitButton = getByTestId("submitButton");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Error",
        "An unknown error occurred"
      );
    });

    // ensure that the navigation did not happen
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  test("should do nothing when uploading university proof", async () => {
    const navigation = { navigate: jest.fn() };

    const { getByText } = render(<TenantFormScreen />);
    
    // Find the button by its title
    const uploadButton = getByText('Upload university proof of attendance');
    fireEvent.press(uploadButton);

    // Wait to ensure no side-effects occur
    await waitFor(() => {
      expect(Alert.alert).not.toHaveBeenCalled();
      expect(navigation.navigate).not.toHaveBeenCalled();
    });
  });
});
