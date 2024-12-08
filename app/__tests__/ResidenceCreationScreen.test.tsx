import React from 'react';
import { render, fireEvent, RenderAPI } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ResidencesListScreen from '../screens/landlord/ResidenceListScreen';
import { PropertyContext } from '../context/LandlordContext';
import '@testing-library/jest-native/extend-expect';
import { Residence, Apartment } from '../../types/types';

// Navigation mock
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Component mocks
jest.mock('../components/Header', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: ({ name, size, color }: { name: string; size: number; color: string }) => 
    <div data-testid={`icon-${name}`}>{name}</div>,
}));

// Mock styles to prevent undefined style errors
jest.mock('../../styles/styles', () => ({
  appStyles: {
    screenContainer: {},
    residenceHeaderContainer: {},
    residenceTitle: {},
    residenceScrollView: {},
    residenceScrollViewContent: {},
    addResidenceButton: {},
    flatText: {},
  },
}));

// Test data setup
const mockResidences: Residence[] = [
  {
    residenceName: 'Maple Avenue 123',
    street: 'Maple Avenue',
    number: '123',
    city: 'Zurich',
    canton: 'ZH',
    zip: '8000',
    country: 'Switzerland',
    landlordId: 'L1',
    tenantIds: ['T1'],
    laundryMachineIds: [],
    apartments: ['A1'],
    tenantCodesID: ['TC1'],
    situationReportLayout: [],
  },
  {
    residenceName: 'Oak Street 456',
    street: 'Oak Street',
    number: '456',
    city: 'Bern',
    canton: 'BE',
    zip: '3000',
    country: 'Switzerland',
    landlordId: 'L1',
    tenantIds: ['T2'],
    laundryMachineIds: [],
    apartments: ['A2'],
    tenantCodesID: ['TC2'],
    situationReportLayout: [],
  },
];

const mockApartments: Apartment[] = [
  {
    apartmentName: '101',
    residenceId: 'R1',
    tenants: [],
    maintenanceRequests: [],
    situationReportId: 'SR1',
  },
  {
    apartmentName: '201',
    residenceId: 'R2',
    tenants: ['T2'],
    maintenanceRequests: ['MR1'],
    situationReportId: 'SR2',
  },
];

const mockResidenceMap = new Map([
  [mockResidences[0], [mockApartments[0]]],
  [mockResidences[1], [mockApartments[1]]],
]);

const mockPropertyContext = {
  residences: mockResidences,
  residenceMap: mockResidenceMap,
  isLoading: false,
  error: null,
  addResidence: jest.fn(),
  updateResidence: jest.fn(),
  deleteResidence: jest.fn(),
  addApartment: jest.fn(),
  updateApartment: jest.fn(),
  deleteApartment: jest.fn(),
};

// Helper function to render the component with all required providers
const renderResidencesListScreen = (contextOverrides = {}): RenderAPI => {
  const contextValue = {
    ...mockPropertyContext,
    ...contextOverrides,
  };

  return render(
    <PropertyContext.Provider value={contextValue}>
      <NavigationContainer>
        <ResidencesListScreen />
      </NavigationContainer>
    </PropertyContext.Provider>
  );
};

describe('ResidencesListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Screen Structure', () => {
    it('renders main screen components', () => {
      const { getByTestId } = renderResidencesListScreen();
      
      expect(getByTestId('residences-screen')).toBeTruthy();
      expect(getByTestId('screen-title')).toBeTruthy();
      expect(getByTestId('residences-scroll-view')).toBeTruthy();
      expect(getByTestId('add-residence-button')).toBeTruthy();
    });

    it('displays correct screen title', () => {
      const { getByTestId } = renderResidencesListScreen();
      
      const title = getByTestId('screen-title');
      expect(title).toHaveTextContent('Your Residences');
    });
  });

  describe('Residence List Display', () => {
    it('renders all residences with correct items', () => {
      const { getByTestId } = renderResidencesListScreen();
      
      mockResidences.forEach(residence => {
        expect(getByTestId(`residence-item-${residence.residenceName}`)).toBeTruthy();
      });
    });

    it('displays residence information correctly', () => {
      const { getByText } = renderResidencesListScreen();
      
      mockResidences.forEach(residence => {
        expect(getByText(residence.residenceName)).toBeTruthy();
        expect(getByText(`${residence.street} ${residence.number}`)).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to CreateResidence screen when add button is pressed', () => {
      const { getByTestId } = renderResidencesListScreen();
      
      const addButton = getByTestId('add-residence-button');
      fireEvent.press(addButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('CreateResidence');
    });
  });

  describe('Loading State', () => {
    it('displays loading indicator when isLoading is true', () => {
      const { getByText } = renderResidencesListScreen({ isLoading: true });
      expect(getByText('Loading...')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('displays error message when error occurs', () => {
      const errorMessage = 'Failed to load residences';
      const { getByText } = renderResidencesListScreen({
        error: new Error(errorMessage),
      });
      
      expect(getByText(`Error: ${errorMessage}`)).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('handles empty residence list gracefully', () => {
      const { getByTestId } = renderResidencesListScreen({
        residences: [],
        residenceMap: new Map(),
      });
      
      expect(getByTestId('residences-scroll-view')).toBeTruthy();
    });
  });
});