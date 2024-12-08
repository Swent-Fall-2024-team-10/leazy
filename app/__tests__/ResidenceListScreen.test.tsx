import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ResidencesListScreen from '../screens/landlord/ResidenceListScreen';
import { PropertyContext } from '../context/LandlordContext';
import '@testing-library/jest-native/extend-expect';
import { Residence, Apartment } from '../../types/types';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn()
  })
}));

jest.mock('../../styles/styles', () => ({
  appStyles: {
    screenContainer: {},
    residenceHeaderContainer: {},
    residenceTitle: {},
    residenceScrollView: {},
    residenceScrollViewContent: {},
    addResidenceButton: {}
  }
}));

jest.mock('../components/Header', () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: () => null
}));

const mockResidences: Residence[] = [
  {
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
];

const mockApartments: Apartment[] = [
  {
    apartmentName: '101',
    residenceId: 'R1',
    tenants: [],
    maintenanceRequests: [],
    situationReportId: 'SR1'
  }
];

describe('ResidencesListScreen', () => {
  const renderScreen = (props = {}) => {
    const defaultProps = {
      residences: mockResidences,
      residenceMap: new Map([[mockResidences[0], mockApartments]]),
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
      const { queryByTestId } = renderScreen({ residences: [] });
      expect(queryByTestId(/residence-item-/)).toBeNull();
    });
  });

  describe('Screen Content', () => {
    it('shows correct title', () => {
      const { getByTestId } = renderScreen();
      expect(getByTestId('screen-title')).toHaveTextContent('Your Residences');
    });

    it('renders all residences', () => {
      const { getByText } = renderScreen();
      mockResidences.forEach(residence => {
        const address = `${residence.street} ${residence.number}`;
        expect(getByText(address)).toBeTruthy();
      });
    });

    it('shows add residence button', () => {
      const { getByTestId } = renderScreen();
      expect(getByTestId('add-residence-button')).toBeTruthy();
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

  describe('Residence Map Handling', () => {
    it('handles empty residence map', () => {
      const { getByTestId } = renderScreen({ residenceMap: new Map() });
      expect(getByTestId('residences-screen')).toBeTruthy();
    });
  });

  describe('Scroll Behavior', () => {
    it('renders scrollview', () => {
      const { getByTestId } = renderScreen();
      expect(getByTestId('residences-scroll-view')).toBeTruthy();
    });
  });

  describe('Data Display', () => {
    it('displays residence information correctly', () => {
      const { getByTestId } = renderScreen();
      mockResidences.forEach(residence => {
        expect(getByTestId(`residence-item-${residence.residenceName}`)).toBeTruthy();
      });
    });
  });

  describe('Context Integration', () => {
    it('uses property context data', () => {
      const customResidences = [{
        ...mockResidences[0],
        residenceName: 'Custom Residence'
      }];
      
      const { getByTestId } = renderScreen({
        residences: customResidences
      });
      
      expect(getByTestId('residence-item-Custom Residence')).toBeTruthy();
    });
  });
});