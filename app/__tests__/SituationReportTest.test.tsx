import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SituationReportScreen from "../screens/landlord/SituationReport/SituationReportScreen";
import { NavigationContainer } from "@react-navigation/native";
import * as firestore from "../../firebase/firestore/firestore";
import { GroupedSituationReport } from "../screens/landlord/SituationReport/SituationReportScreen";
import * as StatusFunctions from "../utils/SituationReport";
import { AuthProvider } from "../context/AuthContext";
import { Alert } from "react-native";
import { getByText } from "@testing-library/dom";
import { Apartment } from "@/types/types";

jest.mock("../../firebase/firestore/firestore", () => ({
  getApartment: jest.fn(),
  addSituationReport: jest.fn(),
  updateApartment: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  writeBatch: jest.fn(),
}));



const { addSituationReport } = jest.mocked(require("../../firebase/firestore/firestore"));

const mockedResidences = [
  { id: '1', name: 'Residence A' },
  { id: '2', name: 'Residence B' },
];

const mockedApartments = [
  { id: '1', name: 'Apartment 101' },
  { id: '2', name: 'Apartment 102' },
];

const mockedLayouts = [
  { id: '1', name: 'Layout X' },
  { id: '2', name: 'Layout Y' },
];

const mockAuthProvider = {
  firebaseUser: null,
  fetchUser: jest.fn(),
  fetchTenant: jest.fn(),
  fetchLandlord: jest.fn(),
};



// Helper to render with navigation
const renderWithNavigation = (component: JSX.Element) => (
  <AuthProvider {...mockAuthProvider}>
      <NavigationContainer>{component}</NavigationContainer>
  </AuthProvider>
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
});
describe('GroupedSituationReport', () => {
  const mockChangeStatus = jest.fn();
  const mockSetReset = jest.fn();

  const layout: [string, [string, number][]][] = [
      ["Floor", [["floor", 0]]],
      ["Wall", [["wall", 1]]],
      ["Ceiling", [["ceiling", 2]]],
      ["Window", [["window", 3]]],
      ["Bed", [["Bedframe", 0], ["Mattress", 1], ["Pillow", 2], ["Bedding", 3]]],
  ];

  it('renders correctly with multiple groups and items', () => {
      const { getByText } = render(
          <GroupedSituationReport
              layout={layout}
              changeStatus={mockChangeStatus}
              resetState={false}
              setReset={mockSetReset}
          />
      );

      expect(getByText('1: floor')).toBeTruthy();
      expect(getByText('2: wall')).toBeTruthy();
      expect(getByText('3: ceiling')).toBeTruthy();
      expect(getByText('4: window')).toBeTruthy();
      expect(getByText('Bed :')).toBeTruthy();
      expect(getByText('5: Bedframe')).toBeTruthy();
      expect(getByText('6: Mattress')).toBeTruthy();
      expect(getByText('7: Pillow')).toBeTruthy();
      expect(getByText('8: Bedding')).toBeTruthy();
  });

  it('calls changeStatus when an item is checked', () => {
    // Create mock layout data based on actual structure used in the component
    const layout: [string, [string, number][]][] = [
      ["Floor", [["floor", 0]]],
      ["Wall", [["wall", 0]]],
      ["Ceiling", [["ceiling", 0]]],
      ["Window", [["window", 0]]],
      ["Bed", [["Bedframe", 0], ["Mattress", 0], ["Pillow", 0], ["Bedding", 0]]],
      ["Kitchen", [["Fridge", 0], ["Stove", 0], ["Microwave", 0], ["Sink", 0], ["Countertop", 0]]]
    ];

    const mockSetReset = jest.fn(); // Mock if needed
    
    // Create a spy for the changeStatus function
    const changeStatusSpy = jest.spyOn(StatusFunctions, 'changeStatus')
      .mockImplementation((layout, groupIndex, itemIndex, newStatus) => {
        return layout;  // Returning the layout as is for simplicity
      });

    // Render the component
    const { getAllByRole } = render(
      <GroupedSituationReport
        layout={layout}
        changeStatus={StatusFunctions.changeStatus}
        resetState={false}
        setReset={mockSetReset}
      />
    );

    // Simulate checking the first checkbox
    const checkboxes = getAllByRole('checkbox');
    fireEvent.press(checkboxes[0]); // Check the first item

    // Assert that changeStatus was called with the correct arguments
    expect(changeStatusSpy).toHaveBeenCalledWith(
      layout,   // Use the actual layout
      0,        // Group index for the first group ("Floor")
      0,        // Item index for the first item in the "Floor" group
      'OC'      // New status
    );
    
    // Optionally, you can restore the spy after the test
    changeStatusSpy.mockRestore();
  });
});


describe("SituationReportScreen", () => {
  it("renders correctly and handles input changes", () => {
    const { getByTestId } = render(renderWithNavigation(<SituationReportScreen />));

    // Check initial tenant name input
    const leavingTenantNameInput = getByTestId('leaving-tenant-name');
    fireEvent.changeText(leavingTenantNameInput, 'John');
    expect(leavingTenantNameInput.props.value).toBe('John');

    // Check surname input
    const leavingTenantSurnameInput = getByTestId('leaving-tenant-surname');
    fireEvent.changeText(leavingTenantSurnameInput, 'Doe');
    expect(leavingTenantSurnameInput.props.value).toBe('Doe');
  });

  it("renders status tags correctly", () => {
    const { getByTestId } = render(renderWithNavigation(<SituationReportScreen />));

    // Ensure the tags are rendered correctly
    expect(getByTestId('OC-tag')).toBeTruthy();
    expect(getByTestId('NW-tag')).toBeTruthy();
    expect(getByTestId('AW-tag')).toBeTruthy();

    // Check descriptions
    expect(getByTestId('OC-description')).toBeTruthy();
    expect(getByTestId('NW-description')).toBeTruthy();
    expect(getByTestId('AW-description')).toBeTruthy();
  });

  it("disables the submit button if conditions are not met", () => {
    const { getByTestId } = render(renderWithNavigation(<SituationReportScreen />));
  
    const submitButton = getByTestId('submit');
    
    // Simulate a press and check if onPress is not called
    const onPressSpy = jest.fn();
    submitButton.props.onPress = onPressSpy;
  
    fireEvent.press(submitButton);
  
    // Assert that the submit function is not called if the button is disabled
    expect(onPressSpy).not.toHaveBeenCalled();
  });
});

