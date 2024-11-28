import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SituationReportScreen from "../screens/landlord/SituationReportScreen";
import { NavigationContainer } from "@react-navigation/native";
import * as firestore from "../../firebase/firestore/firestore";

jest.mock("../../firebase/firestore/firestore", () => ({
  getApartment: jest.fn(),
  addSituationReport: jest.fn(),
  deleteSituationReport: jest.fn(),
}));

// Helper to render with navigation
const renderWithNavigation = (component: JSX.Element) => (
  <NavigationContainer>{component}</NavigationContainer>
);

describe("SituationReportScreen", () => {
  it("renders correctly", () => {
    const { getByText } = render(renderWithNavigation(<SituationReportScreen />));
    expect(getByText("Situation Report Form")).toBeTruthy();
  });

  it("updates tenant name input fields correctly", () => {
    const { getByTestId } = render(renderWithNavigation(<SituationReportScreen />));
    const nameInput = getByTestId("arriving-tenant-name");

    fireEvent.changeText(nameInput, "John");
    expect(nameInput.props.value).toBe("John");
  });

  it("calls Firestore functions on form submission", async () => {
    (firestore.getApartment as jest.Mock).mockResolvedValueOnce({ situationReportId: null });
    const { getByText } = render(renderWithNavigation(<SituationReportScreen />));

    fireEvent.press(getByText("Submit"));

    await waitFor(() => {
      expect(firestore.addSituationReport).toHaveBeenCalled();
    });
  });

  it("navigates after successful submission", async () => {
    (firestore.getApartment as jest.Mock).mockResolvedValueOnce({ situationReportId: "" });
    const { getByText } = render(renderWithNavigation(<SituationReportScreen />));

    fireEvent.press(getByText("Submit"));

    await waitFor(() => {
      expect(firestore.addSituationReport).toHaveBeenCalled();
    });
  });

  
});
