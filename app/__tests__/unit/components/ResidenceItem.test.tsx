import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ResidenceItem from '../../../components/ResidenceItem';
import {
  createApartment,
  updateResidence,
  deleteApartment,
} from '../../../../firebase/firestore/firestore';
import { ResidenceWithId, ApartmentWithId } from '../../../../types/types';

// Mock the firebase functions
jest.mock('../../../../firebase/firestore/firestore', () => ({
  createApartment: jest.fn(),
  updateResidence: jest.fn(),
  deleteApartment: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

// Mock navigation
const mockNavigation: any = {
  navigate: jest.fn(),
};

describe('ResidenceItem', () => {
  const mockResidence = {
    id: 'residence1',
    residenceName: 'Test Residence',
    street: 'Test Street',
    number: '123',
    city: 'Test City',
    canton: 'Test Canton',
    zip: '12345',
    country: 'Test Country',
    landlordId: 'landlord1',
    tenantIds: [],
    laundryMachineIds: [],
    apartments: ['apt1', 'apt2'],
    tenantCodesID: [],
    situationReportLayout: [],
  } as ResidenceWithId;

  const mockApartments = [
    {
      id: 'apt1',
      apartmentName: 'Apartment 1',
      residenceId: 'residence1',
      tenants: [],
      maintenanceRequests: [],
      situationReportId: ['SR1'],
    },
    {
      id: 'apt2',
      apartmentName: 'Apartment 2',
      residenceId: 'residence1',
      tenants: [],
      maintenanceRequests: [],
      situationReportId: ['SR2'],
    },
  ] as ApartmentWithId[];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly in collapsed state', () => {
    const { getByTestId, queryByTestId } = render(
      <ResidenceItem
        residence={mockResidence}
        apartments={mockApartments}
        isExpanded={false}
        navigation={mockNavigation}
        onPress={() => {}}
      />,
    );

    expect(getByTestId(`residence-item-${mockResidence.id}`)).toBeTruthy();
    expect(getByTestId('chevron-right')).toBeTruthy();
    expect(queryByTestId('expanded-content')).toBeNull();
  });

  it('renders correctly in expanded state', () => {
    const { getByTestId, getAllByText } = render(
      <ResidenceItem
        residence={mockResidence}
        apartments={mockApartments}
        isExpanded={true}
        navigation={mockNavigation}
        onPress={() => {}}
      />,
    );

    expect(getByTestId(`residence-item-${mockResidence.id}`)).toBeTruthy();
    expect(getByTestId('chevron-down')).toBeTruthy();
    expect(getByTestId('expanded-content')).toBeTruthy();
    expect(getAllByText(/Apartment [12]/)).toHaveLength(2);
  });

  it('shows trash icon when in edit mode', () => {
    const { getByTestId, queryByTestId } = render(
      <ResidenceItem
        residence={mockResidence}
        apartments={mockApartments}
        isExpanded={true}
        navigation={mockNavigation}
        onPress={() => {}}
        isEditMode={true}
      />,
    );

    expect(
      getByTestId(`delete-residence-button-${mockResidence.id}`),
    ).toBeTruthy();
    expect(queryByTestId('chevron-down')).toBeNull();
  });

  it('calls onDelete when trash icon is pressed', () => {
    const mockOnDelete = jest.fn();
    const { getByTestId } = render(
      <ResidenceItem
        residence={mockResidence}
        apartments={mockApartments}
        isExpanded={true}
        navigation={mockNavigation}
        onPress={() => {}}
        isEditMode={true}
        onDelete={mockOnDelete}
      />,
    );

    fireEvent.press(getByTestId(`delete-residence-button-${mockResidence.id}`));
    expect(mockOnDelete).toHaveBeenCalled();
  });

  it('filters apartments based on search input', () => {
    const { getByTestId, getAllByText, queryByText } = render(
      <ResidenceItem
        residence={mockResidence}
        apartments={mockApartments}
        isExpanded={true}
        navigation={mockNavigation}
        onPress={() => {}}
      />,
    );

    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, '1');

    expect(getAllByText(/Apartment 1/)).toHaveLength(1);
    expect(queryByText(/Apartment 2/)).toBeNull();
  });

  it('displays no apartments message when filter returns no results', () => {
    const { getByTestId, getByText } = render(
      <ResidenceItem
        residence={mockResidence}
        apartments={mockApartments}
        isExpanded={true}
        navigation={mockNavigation}
        onPress={() => {}}
      />,
    );

    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, 'NonexistentApartment');

    expect(getByText('No apartments found')).toBeTruthy();
  });

  it('calls onPress when residence is clicked', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <ResidenceItem
        residence={mockResidence}
        apartments={mockApartments}
        isExpanded={false}
        navigation={mockNavigation}
        onPress={mockOnPress}
      />,
    );

    fireEvent.press(getByTestId(`residence-button-${mockResidence.id}`));
    expect(mockOnPress).toHaveBeenCalled();
  });

  describe('Apartment Management', () => {
    it('shows add apartment button when in edit mode', () => {
      const { getByTestId } = render(
        <ResidenceItem
          residence={mockResidence}
          apartments={mockApartments}
          isExpanded={true}
          navigation={mockNavigation}
          onPress={() => {}}
          isEditMode={true}
        />,
      );

      expect(getByTestId('show-add-form-button')).toBeTruthy();
    });

    it('shows add apartment form when add button is clicked', () => {
      const { getByTestId, getByPlaceholderText } = render(
        <ResidenceItem
          residence={mockResidence}
          apartments={mockApartments}
          isExpanded={true}
          navigation={mockNavigation}
          onPress={() => {}}
          isEditMode={true}
        />,
      );

      fireEvent.press(getByTestId('show-add-form-button'));
      expect(getByPlaceholderText('Apartment name')).toBeTruthy();
    });

    it('successfully adds a new apartment', async () => {
      const newApartmentId = 'new-apt-id';
      (createApartment as jest.Mock).mockResolvedValueOnce(newApartmentId);
      (updateResidence as jest.Mock).mockResolvedValueOnce(undefined);

      const { getByTestId, getByPlaceholderText } = render(
        <ResidenceItem
          residence={mockResidence}
          apartments={mockApartments}
          isExpanded={true}
          navigation={mockNavigation}
          onPress={() => {}}
          isEditMode={true}
        />,
      );

      fireEvent.press(getByTestId('show-add-form-button'));
      fireEvent.changeText(
        getByPlaceholderText('Apartment name'),
        'New Apartment',
      );
      fireEvent.press(getByTestId('confirm-add-apartment'));

      await waitFor(() => {
        expect(createApartment).toHaveBeenCalledWith(
          expect.objectContaining({
            apartmentName: 'New Apartment',
            residenceId: mockResidence.id,
          }),
        );
        expect(updateResidence).toHaveBeenCalledWith(mockResidence.id, {
          apartments: expect.arrayContaining([
            ...mockResidence.apartments,
            newApartmentId,
          ]),
        });
      });
    });

    it('successfully deletes an apartment', async () => {
      const { getByTestId, getAllByTestId } = render(
        <ResidenceItem
          residence={mockResidence}
          apartments={mockApartments}
          isExpanded={true}
          navigation={mockNavigation}
          onPress={() => {}}
          isEditMode={true}
        />,
      );

      const deleteButtons = getAllByTestId('delete-button');
      fireEvent.press(deleteButtons[0]);

      await waitFor(() => {
        expect(deleteApartment).toHaveBeenCalledWith(mockApartments[0].id);
        expect(updateResidence).toHaveBeenCalledWith(mockResidence.id, {
          apartments: expect.not.arrayContaining([mockApartments[0].id]),
        });
      });
    });
    
    it('handles add apartment error gracefully', async () => {
      (createApartment as jest.Mock).mockRejectedValueOnce(
        new Error('Failed to add'),
      );

      const { getByTestId, getByPlaceholderText } = render(
        <ResidenceItem
          residence={mockResidence}
          apartments={mockApartments}
          isExpanded={true}
          navigation={mockNavigation}
          onPress={() => {}}
          isEditMode={true}
        />,
      );

      fireEvent.press(getByTestId('show-add-form-button'));
      fireEvent.changeText(
        getByPlaceholderText('Apartment name'),
        'New Apartment',
      );

      await act(async () => {
        fireEvent.press(getByTestId('confirm-add-apartment'));
      });

      await waitFor(() => {
        expect(createApartment).toHaveBeenCalled();
      });
    });
  });
});
