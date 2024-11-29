import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import ResidencesListScreen, { ResidenceItem, ApartmentItem } from '../screens/landlord/ResidenceListScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

// Mock components
jest.mock('../components/Header', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>
  };
});

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather'
}));

const Stack = createNativeStackNavigator();

describe('ResidencesListScreen', () => {
  // Create a proper wrapper component to avoid navigation warnings
  const TestScreen = () => <ResidencesListScreen />;
  
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Test" component={TestScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders correctly with all initial elements', () => {
    render(<ResidencesListScreen />, { wrapper });

    expect(screen.getByTestId('residences-screen')).toBeTruthy();
    expect(screen.getByTestId('screen-title')).toBeTruthy();
    expect(screen.getByText('Your Residences')).toBeTruthy();
    expect(screen.getByTestId('residences-scroll-view')).toBeTruthy();
    expect(screen.getByTestId('add-residence-button')).toBeTruthy();
  });

  it('displays all mock residences', () => {
    render(<ResidencesListScreen />, { wrapper });

    expect(screen.getByText('Maple Avenue 123')).toBeTruthy();
    expect(screen.getByText('Oak Street 456')).toBeTruthy();
  });

  it('navigates to CreateResidence screen when add button is pressed', () => {
    render(<ResidencesListScreen />, { wrapper });

    const addButton = screen.getByTestId('add-residence-button');
    fireEvent.press(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('CreateResidence');
  });

  it('expands and collapses residence details when pressed', () => {
    render(<ResidencesListScreen />, { wrapper });

    // Find and press the first residence button
    const firstResidence = screen.getByTestId('residence-button-R1');
    
    // Initially, apartment items should not be visible
    expect(screen.queryByTestId('apartment-item-A1')).toBeNull();
    
    // Press to expand
    fireEvent.press(firstResidence);
    
    // Apartment items should now be visible
    expect(screen.getByTestId('apartment-item-A1')).toBeTruthy();
    expect(screen.getByTestId('apartment-item-A2')).toBeTruthy();
    expect(screen.getByTestId('apartment-item-A3')).toBeTruthy();
    
    // Press again to collapse
    fireEvent.press(firstResidence);
    
    // Apartment items should be hidden again
    expect(screen.queryByTestId('apartment-item-A1')).toBeNull();
  });

  it('shows correct number of tenants for each apartment', () => {
    render(<ResidencesListScreen />, { wrapper });

    // Expand the first residence
    const firstResidence = screen.getByTestId('residence-button-R1');
    fireEvent.press(firstResidence);

    // Check tenant counts using the actual text format from the component
    expect(screen.getByText('A1 (2 tenants)')).toBeTruthy();
    expect(screen.getByText('A2 (1 tenants)')).toBeTruthy();
  });

  it('shows edit mode toggle for residences', () => {
    render(<ResidencesListScreen />, { wrapper });

    // Expand the first residence
    const firstResidence = screen.getByTestId('residence-button-R1');
    fireEvent.press(firstResidence);

    expect(screen.getByTestId('edit-mode-toggle')).toBeTruthy();
  });
});

describe('ResidenceItem', () => {
  const mockResidence = {
    residenceId: 'R1',
    street: 'Test Street',
    number: '1',
    city: 'Test City',
    canton: 'TC',
    zip: '1234',
    country: 'Test Country',
    landlordId: 'L1',
    tenantIds: ['T1'],
    laundryMachineIds: ['LM1'],
    apartments: ['A1'],
    tenantCodesID: ['TC1'],
    situationReportLayout: []
  };

  const mockApartments = [{
    apartmentId: 'A1',
    residenceId: 'R1',
    tenants: ['T1'],
    maintenanceRequests: [],
    situationReportId: 'none'
  }];

  const mockNavigation = {
    navigate: jest.fn()
  };

  it('renders residence information correctly', () => {
    render(
      <ResidenceItem
        residence={mockResidence}
        apartments={mockApartments}
        isExpanded={false}
        onPress={() => {}}
        navigation={mockNavigation as any}
      />
    );

    expect(screen.getByText('Test Street 1')).toBeTruthy();
    expect(screen.getByTestId('residence-item-R1')).toBeTruthy();
  });
});