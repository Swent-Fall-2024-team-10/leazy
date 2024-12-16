import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ResidencesListScreen from '../screens/landlord/ResidenceListScreen';
import { PropertyContext } from '../context/LandlordContext';
import { deleteResidence } from '../../firebase/firestore/firestore';
import '@testing-library/jest-native/extend-expect';
import { Residence, Apartment, ApartmentWithId, ResidenceWithId } from '../../types/types';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn()
  })
}));

// Mock styles
jest.mock('../../styles/styles', () => require('../__mocks__/styleMock'));

// Mock Header component
jest.mock('../components/Header', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock icons
jest.mock('@expo/vector-icons', () => ({
  Feather: () => null
}));

// Mock firestore function
jest.mock('../../firebase/firestore/firestore', () => ({
  deleteResidence: jest.fn()
}));

const mockResidences = [
  {
    id: 'R1',
    residenceName: 'Residence 1',
    street: 'Street 1',
    number: '1',
    city: 'City',
    canton: 'Canton',
    zip: '1000',
    country: 'Country',
    landlordId: 'L1',
    tenantIds: [],
    laundryMachineIds: [],
    apartments: [],
    tenantCodesID: [],
    situationReportLayout: []
  },
  {
    residenceName: 'Residence 2',
    street: 'Street 2',
    number: '2',
    city: 'City',
    canton: 'Canton',
    zip: '1000',
    country: 'Country',
    landlordId: 'L1',
    tenantIds: [],
    laundryMachineIds: [],
    apartments: [],
    tenantCodesID: [],
    situationReportLayout: []
  }
] as ResidenceWithId[];

const mockApartments: ApartmentWithId[] = [
  {
    id: 'A1',
    apartmentName: '101',
    residenceId: 'R1',
    tenants: [],
    maintenanceRequests: [],
    situationReportId: ['SR1']
  }
];

describe('ResidencesListScreen', () => {
  const renderScreen = (props = {}) => {
    const defaultProps = {
      residences: mockResidences,
      residenceMap: new Map([[mockResidences[0], mockApartments]]),
      apartments: mockApartments,
      isLoading: false,
      error: null,
      addResidence: jest.fn(),
      updateResidence: jest.fn(),
      deleteResidence: jest.fn(),
      addApartment: jest.fn(),
      updateApartment: jest.fn(),
      deleteApartment: jest.fn(),
      ...props
    };

    return render(
      <PropertyContext.Provider value={defaultProps}>
        <NavigationContainer>
          <ResidencesListScreen />
        </NavigationContainer>
      </PropertyContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Screen States', () => {
    it('shows loading state', () => {
      const { getByText } = renderScreen({ isLoading: true });
      expect(getByText('Loading...')).toBeTruthy();
    });

    it('shows error state', () => {
      const error = new Error('Test error');
      const { getByText } = renderScreen({ error });
      expect(getByText(`Error: ${error.message}`)).toBeTruthy();
    });

    it('shows empty state', () => {
      const { queryByText } = renderScreen({ residences: [] });
      expect(queryByText('Residence 1')).toBeNull();
      expect(queryByText('Residence 2')).toBeNull();
    });
  });

  describe('Screen Content', () => {
    it('shows correct title', () => {
      const { getByTestId } = renderScreen();
      expect(getByTestId('screen-title')).toHaveTextContent('Your Residences');
    });

    it('renders all residences with their addresses', () => {
      const { getByText } = renderScreen();
      mockResidences.forEach(residence => {
        expect(getByText(residence.residenceName)).toBeTruthy();
        const address = `${residence.street} ${residence.number}`;
        expect(getByText(address)).toBeTruthy();
      });
    });

    it('shows add residence button', () => {
      const { getByTestId } = renderScreen();
      expect(getByTestId('add-residence-button')).toBeTruthy();
    });
  });

  describe('Edit Mode', () => {
    it('toggles edit mode when edit button is pressed', () => {
      const { getByTestId, queryByTestId } = renderScreen();
      const editButton = getByTestId('edit-residences-button');
      
      // Initially, delete buttons should not be visible
      expect(queryByTestId('delete-residence-button-R1')).toBeNull();
      
      // Enter edit mode
      fireEvent.press(editButton);
      expect(getByTestId('delete-residence-button-R1')).toBeTruthy();
      
      // Exit edit mode
      fireEvent.press(editButton);
      expect(queryByTestId('delete-residence-button-R1')).toBeNull();
    });

    it('shows delete buttons for all residences in edit mode', () => {
      const { getByTestId } = renderScreen();
      
      // Enter edit mode
      fireEvent.press(getByTestId('edit-residences-button'));
      
      mockResidences.forEach(residence => {
        expect(getByTestId(`delete-residence-button-${residence.id}`)).toBeTruthy();
      });
    });
  });

  describe('Delete Modal', () => {
    it('shows delete confirmation modal when delete button is pressed', () => {
      const { getByTestId, getByText } = renderScreen();
      
      // Enter edit mode
      fireEvent.press(getByTestId('edit-residences-button'));
      
      // Press delete button for first residence
      fireEvent.press(getByTestId('delete-residence-button-R1'));
      
      // Check if modal is visible with correct content
      expect(getByText('Delete Residence')).toBeTruthy();
      expect(getByText('Are you sure you want to delete this residence?')).toBeTruthy();
    });

    it('closes modal when cancel is pressed', () => {
      const { getByTestId, getByText, queryByText } = renderScreen();
      
      // Enter edit mode and open modal
      fireEvent.press(getByTestId('edit-residences-button'));
      fireEvent.press(getByTestId('delete-residence-button-R1'));
      
      // Press cancel
      fireEvent.press(getByText('Cancel'));
      
      // Modal should be closed
      expect(queryByText('Delete Residence')).toBeNull();
    });

    it('calls deleteResidence when delete is confirmed', async () => {
      const { getByTestId, getByText } = renderScreen();
      
      // Enter edit mode and open modal
      fireEvent.press(getByTestId('edit-residences-button'));
      fireEvent.press(getByTestId('delete-residence-button-R1'));
      
      // Confirm deletion
      fireEvent.press(getByText('Delete'));
      
      await waitFor(() => {
        expect(deleteResidence).toHaveBeenCalledWith('R1');
      });
    });

    it('handles delete error gracefully', async () => {
      (deleteResidence as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));
      
      const { getByTestId, getByText, queryByText } = renderScreen();
      
      // Enter edit mode and open modal
      fireEvent.press(getByTestId('edit-residences-button'));
      fireEvent.press(getByTestId('delete-residence-button-R1'));
      
      // Confirm deletion
      fireEvent.press(getByText('Delete'));
      
      await waitFor(() => {
        // Modal should be closed even if deletion fails
        expect(queryByText('Delete Residence')).toBeNull();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to create residence screen', () => {
      const navigate = jest.fn();
      jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
        navigate
      });

      const { getByTestId } = renderScreen();
      fireEvent.press(getByTestId('add-residence-button'));
      
      expect(navigate).toHaveBeenCalledWith('CreateResidence');
    });
  });

  describe('Residence Expansion', () => {
    it('expands and collapses residence details when pressed', () => {
      const { getByTestId } = renderScreen();
      const residenceItem = getByTestId(`residence-item-R1`);

      // Expand
      fireEvent.press(residenceItem);
      expect(getByTestId('expanded-residence-R1')).toBeTruthy();

      // Collapse
      fireEvent.press(residenceItem);
      expect(() => getByTestId('expanded-residence-R1')).toThrow();
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for interactive elements', () => {
      const { getByTestId } = renderScreen();
      
      expect(getByTestId('add-residence-button').props.accessibilityLabel).toBe('Add new residence');
      expect(getByTestId('edit-residences-button').props.accessibilityLabel).toBe('Edit residences');
    });
  });
});