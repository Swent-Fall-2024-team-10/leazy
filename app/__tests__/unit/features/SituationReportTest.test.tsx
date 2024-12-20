import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SituationReportScreen from "../../../screens/landlord/SituationReport/SituationReportScreen";
import { NavigationContainer } from "@react-navigation/native";
import * as firestore from "../../../../firebase/firestore/firestore";
import { GroupedSituationReport } from "../../../screens/landlord/SituationReport/SituationReportScreen";
import * as StatusFunctions from "../../../utils/SituationReport";
import { AuthProvider } from "../../../context/AuthContext";
import { Alert } from "react-native";
import { getByText } from "@testing-library/dom";
import { Apartment } from "@/types/types";

jest.mock("../../../../firebase/firestore/firestore", () => ({
  getApartment: jest.fn(),
  addSituationReport: jest.fn(),
  updateApartment: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  writeBatch: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  memoryLocalCache: jest.fn(),
  initializeFirestore: jest.fn()
}));

const { addSituationReport } = jest.mocked(require("../../../../firebase/firestore/firestore"));

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
  const mockSetReset = jest.fn();
  let mockChangeStatus: jest.Mock;

  const layout: [string, [string, number][]][] = [
    ["Floor", [["floor", 0]]],
    ["Wall", [["wall", 0]]],
    ["Ceiling", [["ceiling", 0]]],
    ["Window", [["window", 0]]],
    ["Bed", [["Bedframe", 0], ["Mattress", 0], ["Pillow", 0], ["Bedding", 0]]],
    ["Kitchen", [["Fridge", 0], ["Stove", 0], ["Microwave", 0], ["Sink", 0], ["Countertop", 0]]]
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockChangeStatus = jest.fn();
  });

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
    // Render the component with the mock function
    const { getAllByRole } = render(
      <GroupedSituationReport
        layout={layout}
        changeStatus={mockChangeStatus}
        resetState={false}
        setReset={mockSetReset}
      />
    );

    // Simulate checking the first checkbox
    const checkboxes = getAllByRole('checkbox');
    fireEvent.press(checkboxes[0]);

    // Assert that changeStatus was called with the correct arguments
    expect(mockChangeStatus).toHaveBeenCalledTimes(1);
    expect(mockChangeStatus).toHaveBeenCalledWith(
      layout,
      0,
      0,
      'OC'
    );
  });

  it('handles multiple status changes correctly', () => {
    const { getAllByRole } = render(
      <GroupedSituationReport
        layout={layout}
        changeStatus={mockChangeStatus}
        resetState={false}
        setReset={mockSetReset}
      />
    );
    
    const checkboxGroups = getAllByRole('checkbox');
    
    fireEvent.press(checkboxGroups[0]); 
    expect(mockChangeStatus).toHaveBeenCalledWith(layout, 0, 0, 'OC');
    
    fireEvent.press(checkboxGroups[3]);
    expect(mockChangeStatus).toHaveBeenCalledWith(layout, 1, 0, 'OC');
    
    expect(mockChangeStatus).toHaveBeenCalledTimes(2);
});

  it('respects resetState prop', () => {
    const { rerender, getAllByRole } = render(
      <GroupedSituationReport
        layout={layout}
        changeStatus={mockChangeStatus}
        resetState={false}
        setReset={mockSetReset}
      />
    );

    const checkboxes = getAllByRole('checkbox');
    fireEvent.press(checkboxes[0]);

    // Rerender with resetState true
    rerender(
      <GroupedSituationReport
        layout={layout}
        changeStatus={mockChangeStatus}
        resetState={true}
        setReset={mockSetReset}
      />
    );

    expect(mockSetReset).toHaveBeenCalled();
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
    const { getByTestId } = render(renderWithNavigation(<SituationReportScreen enableSubmit/>));
  
    const submitButton = getByTestId('submit');
    
    // Simulate a press and check if onPress is not called
    const onPressSpy = jest.fn();
    submitButton.props.onPress = onPressSpy;
  
    fireEvent.press(submitButton);
  
    // Assert that the submit function is not called if the button is disabled
    expect(onPressSpy).not.toHaveBeenCalled();
  });
});

