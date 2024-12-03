import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ApartmentItem from '../components/ApartmentItem';

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

const Stack = createStackNavigator();
const mockNavigate = jest.fn();

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
    apartmentName: '101',
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
      <ApartmentItem 
        apartment={mockApartment}
        editMode={false}
        navigation={mockNavigate as any}
      />
    );

    const apartmentItem = getByTestId('apartment-item-101');
    expect(apartmentItem).toBeTruthy();
    expect(getByText('101 (2 tenants)')).toBeTruthy();
  });

  it('renders with correct initial style', () => {
    const { getByTestId } = renderWithNavigation(
      <ApartmentItem 
        apartment={mockApartment}
        editMode={false}
        navigation={mockNavigate as any}
      />
    );

    const pressableElement = getByTestId('apartment-item-101');
    expect(pressableElement.props.style).toMatchObject({
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

  it('handles empty tenants array', () => {
    const emptyApartment = {
      apartmentName: '102',
      tenants: []
    };

    const { getByTestId, getByText } = renderWithNavigation(
      <ApartmentItem 
        apartment={emptyApartment}
        editMode={false}
        navigation={mockNavigate as any}
      />
    );

    const apartmentItem = getByTestId('apartment-item-102');
    expect(apartmentItem).toBeTruthy();
    expect(getByText('102 (0 tenants)')).toBeTruthy();
  });

  it('renders correctly with single tenant', () => {
    const singleTenantApartment = {
      apartmentName: '103',
      tenants: [{ id: '1', name: 'John Doe' }]
    };

    const { getByTestId, getByText } = renderWithNavigation(
      <ApartmentItem 
        apartment={singleTenantApartment}
        editMode={false}
        navigation={mockNavigate as any}
      />
    );

    const apartmentItem = getByTestId('apartment-item-103');
    expect(apartmentItem).toBeTruthy();
    expect(getByText('103 (1 tenants)')).toBeTruthy();
  });

  it('handles edit mode correctly', () => {
    const { getByTestId } = renderWithNavigation(
      <ApartmentItem 
        apartment={mockApartment}
        editMode={true}
        navigation={mockNavigate as any}
        onDelete={() => {}}
      />
    );

    expect(getByTestId('delete-button')).toBeTruthy();
  });
});