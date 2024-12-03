import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SituationReport from '../screens/landlord/SituationReport/SituationReportScreen';
import { useNavigation } from '@react-navigation/native';

jest.mock('react-native-picker-select', () => {
  return jest.fn(({ onValueChange }) => {
    return <select onChange={(e) => onValueChange(e.target.value)} />;
  });
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('SituationReport', () => {
  let navigateMock: jest.Mock;

  beforeEach(() => {
    navigateMock = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({ navigate: navigateMock });
  });

  it('renders the SituationReport screen correctly', () => {
    const { getByText } = render(<SituationReport />);
    expect(getByText('Situation Report Form')).toBeTruthy();
  });

  it('renders the residence and apartment pickers', () => {
    const { getByText } = render(<SituationReport />);
    expect(getByText('Residence')).toBeTruthy();
    expect(getByText('Apartment')).toBeTruthy();
  });

  it('renders tenant name input fields', () => {
    const { getAllByPlaceholderText } = render(<SituationReport />);
    const nameInputs = getAllByPlaceholderText('Name');
    const surnameInputs = getAllByPlaceholderText('Surname');

    expect(nameInputs.length).toBe(2); // Two TenantNameGroup components
    expect(surnameInputs.length).toBe(2);
  });

  it('renders the remark input field', () => {
    const { getByPlaceholderText } = render(<SituationReport />);
    const remarkField = getByPlaceholderText('Enter your remarks here');
    expect(remarkField).toBeTruthy();
  });

  it('navigates to "List Issues" on submit button press', () => {
    const { getByTestId } = render(<SituationReport />);
    const submitButton = getByTestId('submit');

    fireEvent.press(submitButton);
    expect(navigateMock).toHaveBeenCalledWith('List Issues');
  });
  it('prevents checking multiple checkboxes in a SituationReportItem', () => {
    const { getByText, getAllByRole } = render(<SituationReport />);
  
    // Find the first SituationReportItem by its label
    const firstItemLabel = '1 : floor'; // Update the label if it differs
    const firstItem = getByText(firstItemLabel);
  
    // Get all checkboxes in the rendered component
    const allCheckboxes = getAllByRole('checkbox');
  
    // Narrow down to checkboxes belonging to the first item
    const itemIndex = firstItem && firstItem.parent ? Array.from(firstItem.parent.children).indexOf(firstItem) : -1;
    const relatedCheckboxes = allCheckboxes.slice(itemIndex, itemIndex + 3); // Assuming 3 checkboxes per item
  
    // Ensure initial states are unchecked
    relatedCheckboxes.forEach((checkbox) => {
      expect(checkbox.props.accessibilityState.checked).toBe(false);
    });
  
    // Attempt to check multiple checkboxes
    fireEvent.press(relatedCheckboxes[0]);
    expect(relatedCheckboxes[0].props.accessibilityState.checked).toBe(true);
  
    fireEvent.press(relatedCheckboxes[1]);
    expect(relatedCheckboxes[1].props.accessibilityState.checked).toBe(false); // Ensure others remain unchecked
  
    fireEvent.press(relatedCheckboxes[2]);
    expect(relatedCheckboxes[2].props.accessibilityState.checked).toBe(false); // Ensure others remain unchecked
  
    // Confirm the first checkbox is still checked
    expect(relatedCheckboxes[0].props.accessibilityState.checked).toBe(true);
  });
  


});
