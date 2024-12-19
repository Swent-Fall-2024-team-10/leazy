import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ApartmentItem from '../components/ApartmentItem';
import { NavigationProp } from '@react-navigation/native';

const mockNavigate = jest.fn();

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

const mockNavigation: Partial<NavigationProp<any>> = {
  navigate: mockNavigate,
};

describe('ApartmentItem Component', () => {
  const apartment = {
    id: '1',
    apartmentName: 'Sunrise Villa',
    tenants: [{ id: '101' }, { id: '102' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with apartment details', () => {
    const { getByText } = render(
      <ApartmentItem
        apartment={apartment}
        editMode={false}
        navigation={mockNavigation}
      />
    );
    expect(getByText('Sunrise Villa (2 tenants)')).toBeTruthy();
  });

  it('navigates to FlatDetails on press when not in edit mode', () => {
    const { getByTestId } = render(
      <ApartmentItem
        apartment={apartment}
        editMode={false}
        navigation={mockNavigation}
      />
    );
    fireEvent.press(getByTestId(`apartment-item-${apartment.id}`));
    expect(mockNavigate).toHaveBeenCalledWith('FlatDetails', { apartment });
  });

  it('calls onDelete when in edit mode and delete button is pressed', () => {
    const mockOnDelete = jest.fn();
    const { getByTestId } = render(
      <ApartmentItem
        apartment={apartment}
        editMode={true}
        navigation={mockNavigation}
        onDelete={mockOnDelete}
      />
    );
    fireEvent.press(getByTestId('delete-button'));
    expect(mockOnDelete).toHaveBeenCalledWith(apartment.id);
  });

  it('renders correct icon based on editMode', () => {
    const { getByTestId, rerender } = render(
      <ApartmentItem
        apartment={apartment}
        editMode={false}
        navigation={mockNavigation}
      />
    );
    expect(getByTestId('chevron-button')).toBeTruthy();
    rerender(
      <ApartmentItem
        apartment={apartment}
        editMode={true}
        navigation={mockNavigation}
      />
    );
    expect(getByTestId('delete-button')).toBeTruthy();
  });

  it('does not navigate when clicking chevron button in edit mode', () => {
    const { getByTestId } = render(
      <ApartmentItem
        apartment={apartment}
        editMode={true}
        navigation={mockNavigation}
      />
    );
    fireEvent.press(getByTestId('delete-button'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not call onDelete when clicking delete button without onDelete prop', () => {
    const { getByTestId } = render(
      <ApartmentItem
        apartment={apartment}
        editMode={true}
        navigation={mockNavigation}
      />
    );
    fireEvent.press(getByTestId('delete-button'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to FlatDetails on chevron press when not in edit mode', () => {
    const { getByTestId } = render(
      <ApartmentItem
        apartment={apartment}
        editMode={false}
        navigation={mockNavigation}
      />
    );
    fireEvent.press(getByTestId('chevron-button'));
    expect(mockNavigate).toHaveBeenCalledWith('FlatDetails', { apartment });
  });
});