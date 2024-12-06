import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import CodeEntryScreen from "../../screens/auth/CodeEntryScreen";
import {
  validateTenantCode,
  getTenant,
  getResidence,
  getApartment,
  updateResidence,
  updateApartment,
  updateTenant,
} from "../../../firebase/firestore/firestore";
import { useAuth } from "../../Navigators/AuthContext";

// Mock the firestore functions
jest.mock("../../../firebase/firestore/firestore", () => ({
  validateTenantCode: jest.fn(),
  getTenant: jest.fn(),
  getResidence: jest.fn(),
  getApartment: jest.fn(),
  updateResidence: jest.fn(),
  updateApartment: jest.fn(),
  updateTenant: jest.fn(),
}));

// Mock the auth context
jest.mock("../../Navigators/AuthContext", () => ({
  useAuth: jest.fn(),
}));

// Mock Alert.alert
jest.spyOn(Alert, "alert");

describe("CodeEntryScreen", () => {
  const mockUser = { uid: "test-user-id" };
  const mockTenant = { userId: "test-user-id" };
  const mockResidence = { tenantIds: [] };
  const mockApartment = { tenants: [] };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
  });

  it("renders correctly", () => {
    const { getByText, getByTestId } = render(<CodeEntryScreen />);

    expect(getByText("Welcome to Leazy")).toBeTruthy();
    expect(getByText("Do you already have a code?")).toBeTruthy();
    expect(getByTestId("code-input")).toBeTruthy();
    expect(getByTestId("submit-code-button")).toBeTruthy();
  });

  it("updates code input value when user types", () => {
    const { getByTestId } = render(<CodeEntryScreen />);
    const input = getByTestId("code-input");

    fireEvent.changeText(input, "123456");
    expect(input.props.value).toBe("123456");
  });

  it("handles successful code submission", async () => {
    // Mock successful responses
    (validateTenantCode as jest.Mock).mockResolvedValue({
      residenceId: "res-123",
      apartmentId: "apt-123",
      tenantCodeUID: "code-123",
    });
    (getTenant as jest.Mock).mockResolvedValue(mockTenant);
    (getResidence as jest.Mock).mockResolvedValue(mockResidence);
    (getApartment as jest.Mock).mockResolvedValue(mockApartment);
    (updateResidence as jest.Mock).mockResolvedValue(undefined);
    (updateApartment as jest.Mock).mockResolvedValue(undefined);
    (updateTenant as jest.Mock).mockResolvedValue(undefined);

    const { getByTestId } = render(<CodeEntryScreen />);
    
    fireEvent.changeText(getByTestId("code-input"), "123456");
    fireEvent.press(getByTestId("submit-code-button"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        "Welcome to your tenant dashboard!",
        "You've successfully registered to your residence."
      );
    });

    expect(updateResidence).toHaveBeenCalledWith("res-123", {
      tenantIds: ["test-user-id"],
    });
    expect(updateApartment).toHaveBeenCalledWith("apt-123", {
      tenants: ["test-user-id"],
    });
    expect(updateTenant).toHaveBeenCalledWith("test-user-id", {
      apartmentId: "apt-123",
      residenceId: "res-123",
    });
  });

  it("displays error message when code validation fails", async () => {
    const errorMessage = "Invalid code";
    (validateTenantCode as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { getByTestId, getByText } = render(<CodeEntryScreen />);
    
    fireEvent.changeText(getByTestId("code-input"), "invalid-code");
    fireEvent.press(getByTestId("submit-code-button"));

    await waitFor(() => {
      expect(getByText(errorMessage)).toBeTruthy();
    });
  });

  it("handles case when tenant is not found", async () => {
    (validateTenantCode as jest.Mock).mockResolvedValue({
      residenceId: "res-123",
      apartmentId: "apt-123",
      tenantCodeUID: "code-123",
    });
    (getTenant as jest.Mock).mockResolvedValue(null);

    const { getByTestId, getByText } = render(<CodeEntryScreen />);
    
    fireEvent.changeText(getByTestId("code-input"), "123456");
    fireEvent.press(getByTestId("submit-code-button"));

    await waitFor(() => {
      expect(getByText(`Tenant with ID ${mockUser.uid} not found.`)).toBeTruthy();
    });
  });

  it("handles case when residence is not found", async () => {
    (validateTenantCode as jest.Mock).mockResolvedValue({
      residenceId: "res-123",
      apartmentId: "apt-123",
      tenantCodeUID: "code-123",
    });
    (getTenant as jest.Mock).mockResolvedValue(mockTenant);
    (getResidence as jest.Mock).mockResolvedValue(null);

    const { getByTestId, getByText } = render(<CodeEntryScreen />);
    
    fireEvent.changeText(getByTestId("code-input"), "123456");
    fireEvent.press(getByTestId("submit-code-button"));

    await waitFor(() => {
      expect(getByText(`Residence with ID res-123 not found.`)).toBeTruthy();
    });
  });

  it("handles case when apartment is not found", async () => {
    (validateTenantCode as jest.Mock).mockResolvedValue({
      residenceId: "res-123",
      apartmentId: "apt-123",
      tenantCodeUID: "code-123",
    });
    (getTenant as jest.Mock).mockResolvedValue(mockTenant);
    (getResidence as jest.Mock).mockResolvedValue(mockResidence);
    (getApartment as jest.Mock).mockResolvedValue(null);

    const { getByTestId, getByText } = render(<CodeEntryScreen />);
    
    fireEvent.changeText(getByTestId("code-input"), "123456");
    fireEvent.press(getByTestId("submit-code-button"));

    await waitFor(() => {
      expect(getByText(`Apartment with ID apt-123 not found.`)).toBeTruthy();
    });
  });

  it("does nothing when user is not authenticated", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });

    const { getByTestId } = render(<CodeEntryScreen />);
    
    fireEvent.changeText(getByTestId("code-input"), "123456");
    fireEvent.press(getByTestId("submit-code-button"));

    await waitFor(() => {
      expect(validateTenantCode).not.toHaveBeenCalled();
    });
  });
});
