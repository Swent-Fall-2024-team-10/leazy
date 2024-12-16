import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ResidenceItem from '../components/ResidenceItem';
import { createApartment, updateResidence, deleteApartment } from '../../firebase/firestore/firestore';

// Mock the firebase functions
jest.mock('../../firebase/firestore/firestore', () => ({
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
    apartments: ['apt1', 'apt2'],
  };

  const mockApartments = [
    {
      id: 'apt1',
      apartmentName: 'Apartment 1',
      residenceId: 'residence1',
      tenants: [],
      maintenanceRequests: [],
      situationReportId: '',
    },
    {
      id: 'apt2',
      apartmentName: 'Apartment 2',
      residenceId: 'residence1',
      tenants: [],
      maintenanceRequests: [],
      situationReportId: '',
    },
  ];

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
      />
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
      />
    );

    expect(getByTestId(`residence-item-${mockResidence.id}`)).toBeTruthy();
    expect(getByTestId('chevron-down')).toBeTruthy();
    expect(getByTestId('expanded-content')).toBeTruthy();
    expect(getAllByText(/Apartment [12]/)).toHaveLength(2);
  });

  it('filters apartments based on search input', () => {
    const { getByTestId, getAllByText, queryByText } = render(
      <ResidenceItem
        residence={mockResidence}
        apartments={mockApartments}
        isExpanded={true}
        navigation={mockNavigation}
        onPress={() => {}}
      />
    );

    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, '1');

    expect(getAllByText(/Apartment 1/)).toHaveLength(1);
    expect(queryByText(/Apartment 2/)).toBeNull();
  });

  it('shows add apartment form when in edit mode', () => {
    const { getByTestId, getByPlaceholderText } = render(
      <ResidenceItem
        residence={mockResidence}
        apartments={mockApartments}
        isExpanded={true}
        navigation={mockNavigation}
        onPress={() => {}}
      />
    );

    fireEvent.press(getByTestId('edit-mode-toggle'));
    fireEvent.press(getByTestId('show-add-form-button'));

    expect(getByPlaceholderText('Apartment name')).toBeTruthy();
    expect(getByTestId('cancel-add-apartment')).toBeTruthy();
    expect(getByTestId('confirm-add-apartment')).toBeTruthy();
  });

  it('successfully adds a new apartment', async () => {
    const newApartmentId = 'new-apt-id';
    (createApartment as jest.Mock).mockResolvedValueOnce(newApartmentId);

    const { getByTestId, getByPlaceholderText } = render(
      <ResidenceItem
        residence={mockResidence}
        apartments={mockApartments}
        isExpanded={true}
        navigation={mockNavigation}
        onPress={() => {}}
      />
    );

    // Enter edit mode and show add form
    fireEvent.press(getByTestId('edit-mode-toggle'));
    fireEvent.press(getByTestId('show-add-form-button'));

    // Fill and submit form
    const input = getByPlaceholderText('Apartment name');
    fireEvent.changeText(input, 'New Apartment');
    fireEvent.press(getByTestId('confirm-add-apartment'));

    await waitFor(() => {
      expect(createApartment).toHaveBeenCalledWith(expect.objectContaining({
        apartmentName: 'New Apartment',
        residenceId: mockResidence.id,
      }));
      expect(updateResidence).toHaveBeenCalledWith(
        mockResidence.id,
        expect.objectContaining({
          apartments: [...mockResidence.apartments, newApartmentId],
        })
      );
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
      />
    );

    // Enter edit mode
    fireEvent.press(getByTestId('edit-mode-toggle'));

    // Find and press delete button for first apartment
    const deleteButtons = getAllByTestId('delete-button');
    fireEvent.press(deleteButtons[0]);

    await waitFor(() => {
      expect(deleteApartment).toHaveBeenCalledWith('apt1');
      expect(updateResidence).toHaveBeenCalledWith(
        mockResidence.id,
        expect.objectContaining({
          apartments: expect.not.arrayContaining(['apt1']),
        })
      );
    });
  });

  it('displays no apartments message when filter returns no results', () => {
    const { getByTestId } = render(
      <ResidenceItem
        residence={mockResidence}
        apartments={mockApartments}
        isExpanded={true}
        navigation={mockNavigation}
        onPress={() => {}}
      />
    );

    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, 'NonexistentApartment');

    expect(getByTestId('no-apartments-message')).toBeTruthy();
  });
});