import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ApartmentItem from '../../../components/ApartmentItem';

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

describe('ApartmentItem', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const mockApartment = {
    id: '1',
    apartmentName: 'Test Apartment',
    tenants: []
  };

  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders apartment name and tenant count correctly with no tenants', () => {
      const { getByText } = render(
        <ApartmentItem
          apartment={mockApartment}
          editMode={false}
          navigation={mockNavigation}
        />
      );
      expect(getByText('Test Apartment (0 tenants)')).toBeTruthy();
    });

    it('renders apartment name and tenant count correctly with multiple tenants', () => {
      const apartmentWithTenants = {
        ...mockApartment,
        tenants: [{ id: '1', name: 'John' }, { id: '2', name: 'Jane' }]
      };
      const { getByText } = render(
        <ApartmentItem
          apartment={apartmentWithTenants}
          editMode={false}
          navigation={mockNavigation}
        />
      );
      expect(getByText('Test Apartment (2 tenants)')).toBeTruthy();
    });

    it('renders correctly with undefined navigation prop', () => {
      const { getByTestId } = render(
        <ApartmentItem
          apartment={mockApartment}
          editMode={false}
          navigation={undefined as any}
        />
      );
      expect(getByTestId(`apartment-item-${mockApartment.id}`)).toBeTruthy();
    });
  });

  describe('Edit Mode', () => {
    it('shows delete icon in edit mode when there are no tenants', () => {
      const { getByTestId } = render(
        <ApartmentItem
          apartment={mockApartment}
          editMode={true}
          navigation={mockNavigation}
          onDelete={mockOnDelete}
        />
      );
      expect(getByTestId('delete-button')).toBeTruthy();
    });

    it('does not show delete icon in edit mode when there are tenants', () => {
      const apartmentWithTenants = {
        ...mockApartment,
        tenants: [{ id: '1', name: 'John Doe' }]
      };
      const { queryByTestId } = render(
        <ApartmentItem
          apartment={apartmentWithTenants}
          editMode={true}
          navigation={mockNavigation}
          onDelete={mockOnDelete}
        />
      );
      expect(queryByTestId('delete-button')).toBeNull();
    });

    it('handles delete action with undefined onDelete prop', () => {
      const { getByTestId } = render(
        <ApartmentItem
          apartment={mockApartment}
          editMode={true}
          navigation={mockNavigation}
        />
      );
      fireEvent.press(getByTestId(`apartment-item-${mockApartment.id}`));
      // Should not throw an error
    });

    it('handles delete button press with undefined onDelete prop', () => {
      const { getByTestId } = render(
        <ApartmentItem
          apartment={mockApartment}
          editMode={true}
          navigation={mockNavigation}
        />
      );
      const deleteButton = getByTestId('delete-button');
      fireEvent.press(deleteButton);
      // Should not throw an error
    });
  });

  describe('Navigation', () => {
    it('navigates to FlatDetails when pressed in normal mode', () => {
      const { getByTestId } = render(
        <ApartmentItem
          apartment={mockApartment}
          editMode={false}
          navigation={mockNavigation}
        />
      );
      fireEvent.press(getByTestId(`apartment-item-${mockApartment.id}`));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('FlatDetails', { apartment: mockApartment });
    });

    it('handles press with undefined navigation prop', () => {
      const { getByTestId } = render(
        <ApartmentItem
          apartment={mockApartment}
          editMode={false}
          navigation={undefined as any}
        />
      );
      fireEvent.press(getByTestId(`apartment-item-${mockApartment.id}`));
      // Should not throw an error
    });

    it('handles chevron press with undefined navigation prop', () => {
      const { getByTestId } = render(
        <ApartmentItem
          apartment={mockApartment}
          editMode={false}
          navigation={undefined as any}
        />
      );
      const chevronButton = getByTestId('chevron-button');
      fireEvent.press(chevronButton);
      // Should not throw an error
    });

    it('handles navigation with missing navigate method', () => {
      const invalidNavigation = {} as any;
      const { getByTestId } = render(
        <ApartmentItem
          apartment={mockApartment}
          editMode={false}
          navigation={invalidNavigation}
        />
      );
      fireEvent.press(getByTestId(`apartment-item-${mockApartment.id}`));
      // Should not throw an error
    });
  });

  describe('Pressable Styling', () => {
    it('applies normal styles when not pressed', () => {
      const { getByTestId } = render(
        <ApartmentItem
          apartment={mockApartment}
          editMode={false}
          navigation={mockNavigation}
        />
      );
      const pressable = getByTestId(`apartment-item-${mockApartment.id}`);
      
      expect(pressable.props.style).toEqual(
        expect.objectContaining({
          opacity: 1,
          backgroundColor: '#D6D3F0'
        })
      );
    });
  });

  describe('Button Interactions', () => {
    it('calls onDelete when delete button is pressed', () => {
      const { getByTestId } = render(
        <ApartmentItem
          apartment={mockApartment}
          editMode={true}
          navigation={mockNavigation}
          onDelete={mockOnDelete}
        />
      );
      fireEvent.press(getByTestId('delete-button'));
      expect(mockOnDelete).toHaveBeenCalledWith(mockApartment.id);
    });

    it('navigates to FlatDetails when chevron is pressed', () => {
      const { getByTestId } = render(
        <ApartmentItem
          apartment={mockApartment}
          editMode={false}
          navigation={mockNavigation}
        />
      );
      fireEvent.press(getByTestId('chevron-button'));
      expect(mockNavigation.navigate).toHaveBeenCalledWith('FlatDetails', { apartment: mockApartment });
    });

    it('does not navigate when pressed in edit mode', () => {
      const { getByTestId } = render(
        <ApartmentItem
          apartment={mockApartment}
          editMode={true}
          navigation={mockNavigation}
        />
      );
      fireEvent.press(getByTestId(`apartment-item-${mockApartment.id}`));
      expect(mockNavigation.navigate).not.toHaveBeenCalled();
    });
  });
});