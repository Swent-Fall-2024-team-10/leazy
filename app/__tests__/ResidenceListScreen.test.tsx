import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ResidencesListScreen from '../screens/landlord/ResidenceListScreen';
import { PropertyContext } from '../context/LandlordContext';
import { deleteResidence } from '../../firebase/firestore/firestore';
import '@testing-library/jest-native/extend-expect';
import { Residence, Apartment, ApartmentWithId, ResidenceWithId } from '../../types/types';

// Mock Firebase
jest.mock('../../firebase/firebase', () => ({
  db: {},
  auth: {
    currentUser: { uid: 'testUid' }
  }
}));

// Mock Firebase/Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  getDoc: jest.fn(),
  deleteDoc: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  arrayRemove: (value: any) => value,
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn()
}));

// Mock Firebase/Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'testUid' }
  }))
}));

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
  deleteResidence: jest.fn().mockImplementation(async (residenceId) => {
    const mockResidenceRef = 'mockResidenceRef';
    mockDoc.mockReturnValue(mockResidenceRef);
    
    // First getDoc call for residence
    await mockGetDoc(mockResidenceRef);
    
    // Delete residence and update landlord
    await mockDeleteDoc(mockResidenceRef);
    await mockUpdateDoc(mockResidenceRef, {
      residenceIds: residenceId
    });
  })
}));

// Mock Firestore functions at the top level
const mockGetDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  doc: (...args: any[]) => mockDoc(...args),
  arrayRemove: (value: any) => value,
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn()
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

    it('deletes residence and its apartments with tenants', async () => {
      // Setup mock data
      const mockResidenceData = {
        apartments: ['apt1', 'apt2'],
        residenceName: 'Test Residence'
      };
      
      const mockApartment1 = {
        tenants: ['tenant1', 'tenant2']
      };
      
      const mockApartment2 = {
        tenants: ['tenant3']
      };

      // Setup mock responses
      mockGetDoc
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockResidenceData
        })
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockApartment1
        })
        .mockResolvedValueOnce({
          exists: () => true,
          data: () => mockApartment2
        });

      mockDoc.mockReturnValue('mockedDocRef');
      mockDeleteDoc.mockResolvedValue(undefined);
      mockUpdateDoc.mockResolvedValue(undefined);

      const { getByTestId, getByText } = renderScreen();
      
      // Enter edit mode and open modal
      fireEvent.press(getByTestId('edit-residences-button'));
      fireEvent.press(getByTestId('delete-residence-button-R1'));
      
      // Confirm deletion
      await act(async () => {
        fireEvent.press(getByText('Delete'));
      });
      
      await waitFor(() => {
        // Verify residence document was fetched
        expect(mockGetDoc).toHaveBeenCalled();
        
        // Verify apartments were deleted
        expect(mockDeleteDoc).toHaveBeenCalled();
        
        // Verify landlord document was updated
        expect(mockUpdateDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            residenceIds: 'R1'
          })
        );
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