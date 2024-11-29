import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ApartmentItem from '../components/ApartmentItem';

// Mock the Feather icon component
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

const Stack = createStackNavigator();
const mockNavigate = jest.fn();

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

describe('ApartmentItem', () => {
  const mockApartment = {
    apartmentId: '101',
    tenants: [
      { id: '1', name: 'John Doe' },
      { id: '2', name: 'Jane Smith' }
    ]
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderWithNavigation = (component) => {
    return render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Test">
            {() => component}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  };

  it('renders apartment information correctly', () => {
    const { getByTestId, getByText } = renderWithNavigation(
      <ApartmentItem apartment={mockApartment} />
    );

    const apartmentItem = getByTestId('apartment-item-101');
    expect(apartmentItem).toBeTruthy();
    
    const text = getByText(/101.*2 tenants/);
    expect(text).toBeTruthy();
  });

  it('renders with correct initial style', () => {
    const { getByTestId } = renderWithNavigation(
      <ApartmentItem apartment={mockApartment} />
    );

    const pressableElement = getByTestId('apartment-item-101');
    expect(pressableElement.props.style).toEqual({
      width: '100%',
      opacity: 1,
      backgroundColor: '#D6D3F0',
      borderRadius: 4,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 12,
      marginVertical: 4
    });
  });

  it('renders the Feather icon', () => {
    const { getByTestId } = renderWithNavigation(
      <ApartmentItem apartment={mockApartment} />
    );

    const icon = getByTestId('chevron-button');
    expect(icon).toBeTruthy();
  });

  it('handles empty tenants array', () => {
    const emptyApartment = {
      apartmentId: '102',
      tenants: []
    };

    const { getByTestId, getByText } = renderWithNavigation(
      <ApartmentItem apartment={emptyApartment} />
    );

    const apartmentItem = getByTestId('apartment-item-102');
    expect(apartmentItem).toBeTruthy();
    
    const text = getByText(/102.*0 tenants/);
    expect(text).toBeTruthy();
  });

  it('renders correctly with single tenant', () => {
    const singleTenantApartment = {
      apartmentId: '103',
      tenants: [{ id: '1', name: 'John Doe' }]
    };

    const { getByTestId, getByText } = renderWithNavigation(
      <ApartmentItem apartment={singleTenantApartment} />
    );

    const apartmentItem = getByTestId('apartment-item-103');
    expect(apartmentItem).toBeTruthy();
    
    const text = getByText(/103.*1 tenant/);
    expect(text).toBeTruthy();
  });
});