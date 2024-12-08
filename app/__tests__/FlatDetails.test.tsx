import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import FlatDetails from '../screens/landlord/FlatDetails';

// Mock expo vector icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons'
}));

// Mock the navigation
const mockNavigation = {
  goBack: jest.fn(),
};

// Mock the route with sample data
const mockRoute = {
  params: {
    apartment: {
      apartmentName: 'APT123',
      tenants: ['TEN001', 'TEN002', 'TEN003'],
    },
  },
};

// Mock the Header component using relative path
jest.mock('../components/Header', () => {
  return {
    __esModule: true,
    default: ({ children }) => <>{children}</>,
  };
});

// Mock the image require
jest.mock('../../assets/images/react-logo.png', () => 'mocked-image-path');

// Mock the navigation hooks
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
}));

describe('FlatDetails Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with apartment details', () => {
    render(
      <NavigationContainer>
        <FlatDetails />
      </NavigationContainer>
    );

    // Check if main elements are rendered
    expect(screen.getByText('Flat Details')).toBeTruthy();
    expect(screen.getByText('Apartment ID: APT123')).toBeTruthy();
    expect(screen.getByText('List Of Tenants (3)')).toBeTruthy();
  });

  it('displays correct number of tenants', () => {
    render(
      <NavigationContainer>
        <FlatDetails />
      </NavigationContainer>
    );

    // Check if all tenant rows are rendered
    const tenantRows = screen.getAllByText(/Tenant \d/);
    expect(tenantRows).toHaveLength(3);

    // Check if tenant IDs are displayed
    expect(screen.getByText('TEN001')).toBeTruthy();
    expect(screen.getByText('TEN002')).toBeTruthy();
    expect(screen.getByText('TEN003')).toBeTruthy();
  });

  it('handles navigation when close button is pressed', () => {
    render(
      <NavigationContainer>
        <FlatDetails />
      </NavigationContainer>
    );

    // Find and press the close button
    const closeButton = screen.getByText('Close');
    fireEvent.press(closeButton);

    // Verify navigation.goBack was called
    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('renders the image correctly', () => {
    render(
      <NavigationContainer>
        <FlatDetails />
      </NavigationContainer>
    );

    // Check if the image is rendered with correct props
    const image = screen.UNSAFE_getByType('Image');
    expect(image.props.source).toBe('mocked-image-path');
    expect(image.props.resizeMode).toBe('cover');
  });
});