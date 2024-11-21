import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SituationReport from '../screens/landlord/SituationReportScreen';
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

});
