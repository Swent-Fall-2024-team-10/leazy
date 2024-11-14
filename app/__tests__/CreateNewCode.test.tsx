import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CodeCreationScreen from "../screens/landlord/CreateNewCode";
import { Alert, Share } from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { generate_unique_code } from "../../firebase/firestore/firestore";
import "@testing-library/jest-native/extend-expect";

// Mock the necessary modules and functions
jest.mock("../../firebase/firestore/firestore", () => ({
  generate_unique_code: jest.fn(),
}));

jest.mock("@react-native-clipboard/clipboard", () => ({
  setString: jest.fn(),
}));

// Mock the navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  // Add other navigation methods if needed
};

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => mockNavigation,
  };
});


// Inside your test cases or before them
jest.spyOn(Clipboard, "setString").mockImplementation();
jest.spyOn(Share, "share").mockImplementation();
jest.spyOn(Alert, "alert").mockImplementation();

describe("CodeCreationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    const { getByText, getByTestId } = render(<CodeCreationScreen />);

    // Check if main components are rendered
    expect(getByText("Create a new code for a new tenant")).toBeTruthy();
    expect(getByText("Enter the Residence ID")).toBeTruthy();
    expect(getByTestId("Residence ID")).toBeTruthy();
    expect(getByText("Enter the Apartment ID")).toBeTruthy();
    expect(getByTestId("Apartment ID")).toBeTruthy();
    expect(getByTestId("create-code-button")).toBeTruthy();
    // Initially, the code should not be displayed
    expect(getByText("******")).toBeTruthy();
  });

  it("handles input correctly", () => {
    const { getByTestId } = render(<CodeCreationScreen />);

    const residenceInput = getByTestId("Residence ID");
    const apartmentInput = getByTestId("Apartment ID");

    fireEvent.changeText(residenceInput, "RES123");
    fireEvent.changeText(apartmentInput, "APT456");

    expect(residenceInput.props.value).toBe("RES123");
    expect(apartmentInput.props.value).toBe("APT456");
  });

  it("shows alert when inputs are missing", () => {
    const alertMock = jest.spyOn(Alert, "alert").mockImplementation();

    const { getByTestId } = render(<CodeCreationScreen />);

    const createCodeButton = getByTestId("create-code-button");

    // Press create code without entering any inputs
    fireEvent.press(createCodeButton);

    expect(alertMock).toHaveBeenCalledWith(
      "Please enter both Residence ID and Apartment ID."
    );

    alertMock.mockRestore();
  });

  it("successfully creates code", async () => {
    // Mock generate_unique_code to return a code
    (generate_unique_code as jest.Mock).mockResolvedValue("CODE123");

    const { getByTestId, getByText } = render(<CodeCreationScreen />);

    const residenceInput = getByTestId("Residence ID");
    const apartmentInput = getByTestId("Apartment ID");
    const createCodeButton = getByTestId("create-code-button");

    // Enter valid inputs
    fireEvent.changeText(residenceInput, "RES123");
    fireEvent.changeText(apartmentInput, "APT456");

    fireEvent.press(createCodeButton);

    // Wait for the code to be generated and displayed
    await waitFor(() => {
      expect(generate_unique_code).toHaveBeenCalledWith("RES123", "APT456");
      expect(getByText("Share the following code with a tenant:")).toBeTruthy();
      expect(getByText("CODE123")).toBeTruthy();
      expect(getByTestId("share-code-button")).toBeTruthy();
    });
  });

  it("handles error during code generation", async () => {
    const alertMock = jest.spyOn(Alert, "alert").mockImplementation();

    (generate_unique_code as jest.Mock).mockRejectedValue(
      new Error("Error generating code")
    );

    const { getByTestId } = render(<CodeCreationScreen />);

    const residenceInput = getByTestId("Residence ID");
    const apartmentInput = getByTestId("Apartment ID");
    const createCodeButton = getByTestId("create-code-button");

    // Enter valid inputs
    fireEvent.changeText(residenceInput, "RES123");
    fireEvent.changeText(apartmentInput, "APT456");

    fireEvent.press(createCodeButton);

    await waitFor(() => {
      expect(generate_unique_code).toHaveBeenCalledWith("RES123", "APT456");
      expect(Alert.alert).toHaveBeenCalledWith("Error generating code");
    });

    alertMock.mockRestore();
  });

  it("copies code to clipboard when code is pressed", async () => {
    // Mock generate_unique_code to return a code
    (generate_unique_code as jest.Mock).mockResolvedValue("CODE123");

    const alertMock = jest.spyOn(Alert, "alert").mockImplementation();
    const clipboardSetStringMock = jest
      .spyOn(Clipboard, "setString")
      .mockImplementation();

    const { getByTestId, getByText } = render(<CodeCreationScreen />);

    const residenceInput = getByTestId("Residence ID");
    const apartmentInput = getByTestId("Apartment ID");
    const createCodeButton = getByTestId("create-code-button");

    // Enter valid inputs
    fireEvent.changeText(residenceInput, "RES123");
    fireEvent.changeText(apartmentInput, "APT456");

    fireEvent.press(createCodeButton);

    // Wait for the code to be displayed
    await waitFor(() => {
      expect(getByText("CODE123")).toBeTruthy();
    });

    const codeText = getByText("CODE123");

    fireEvent.press(codeText);

    expect(Clipboard.setString).toHaveBeenCalledWith("CODE123");
    expect(Alert.alert).toHaveBeenCalledWith("Code copied to clipboard!");

    alertMock.mockRestore();
    clipboardSetStringMock.mockRestore();
  });

  it("shares code when Share Code button is pressed", async () => {
    // Mock generate_unique_code to return a code
    (generate_unique_code as jest.Mock).mockResolvedValue("CODE123");

    const shareMock = jest
      .spyOn(Share, "share")
      .mockResolvedValue({ action: "sharedAction" });

    const { getByTestId, getByText } = render(<CodeCreationScreen />);

    const residenceInput = getByTestId("Residence ID");
    const apartmentInput = getByTestId("Apartment ID");
    const createCodeButton = getByTestId("create-code-button");

    // Enter valid inputs
    fireEvent.changeText(residenceInput, "RES123");
    fireEvent.changeText(apartmentInput, "APT456");

    fireEvent.press(createCodeButton);

    // Wait for the code to be displayed
    await waitFor(() => {
      expect(getByText("CODE123")).toBeTruthy();
    });

    const shareCodeButton = getByTestId("share-code-button");

    fireEvent.press(shareCodeButton);

    expect(Share.share).toHaveBeenCalledWith({
      message: "Here is your code: CODE123",
    });

    shareMock.mockRestore();
  });

  it("handles error during share code", async () => {
    // Mock generate_unique_code to return a code
    (generate_unique_code as jest.Mock).mockResolvedValue("CODE123");

    const shareMock = jest
      .spyOn(Share, "share")
      .mockRejectedValue(new Error("Some share error"));
    const alertMock = jest.spyOn(Alert, "alert").mockImplementation();

    const { getByTestId, getByText } = render(<CodeCreationScreen />);

    const residenceInput = getByTestId("Residence ID");
    const apartmentInput = getByTestId("Apartment ID");
    const createCodeButton = getByTestId("create-code-button");

    // Enter valid inputs
    fireEvent.changeText(residenceInput, "RES123");
    fireEvent.changeText(apartmentInput, "APT456");

    fireEvent.press(createCodeButton);

    // Wait for the code to be displayed
    await waitFor(() => {
      expect(getByText("CODE123")).toBeTruthy();
    });

    const shareCodeButton = getByTestId("share-code-button");

    fireEvent.press(shareCodeButton);

    await waitFor(() => {
      expect(Share.share).toHaveBeenCalledWith({
        message: "Here is your code: CODE123",
      });

      expect(Alert.alert).toHaveBeenCalledWith("Some share error");
    });

    shareMock.mockRestore();
    alertMock.mockRestore();
  });
});
