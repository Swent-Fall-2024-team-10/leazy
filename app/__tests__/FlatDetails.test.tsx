import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import FlatDetails from '../screens/landlord/FlatDetails';
import { getUser, updateApartment } from '../../firebase/firestore/firestore';
import { useProperty } from '../context/LandlordContext';

// Mock the navigation
const mockNavigation = {
  goBack: jest.fn(),
};

// Mock the route
const mockRoute = {
  params: {
    apartment: {
      id: '123',
      apartmentName: 'Test Apartment',
      tenants: ['tenant1', 'tenant2'],
    },
  },
};

// Mock the hooks and modules
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
}));

jest.mock('../../firebase/firestore/firestore', () => ({
  getUser: jest.fn(),
  updateApartment: jest.fn(),
}));

jest.mock('../context/LandlordContext', () => ({
  useProperty: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('FlatDetails Component', () => {
  const mockApartments = [
    {
      id: '123',
      apartmentName: 'Test Apartment',
      tenants: ['tenant1', 'tenant2'],
    },
  ];

  const mockTenantUsers = [
    { uid: 'tenant1', name: 'John Doe' },
    { uid: 'tenant2', name: 'Jane Smith' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useProperty.mockReturnValue({ apartments: mockApartments });
    getUser.mockImplementation((id) => 
      Promise.resolve(mockTenantUsers.find(user => user.uid === id))
    );
  });

  it('renders correctly with apartment details', async () => {
    const { getByText, getByTestId } = render(<FlatDetails />);
    
    await waitFor(() => {
      expect(getByText('Flat Details')).toBeTruthy();
      expect(getByText('Apartment ID: Test Apartment')).toBeTruthy();
      expect(getByText('List Of Tenants (2)')).toBeTruthy();
      expect(getByTestId('pencil')).toBeTruthy();
      expect(getByTestId('close-button')).toBeTruthy();
    });
  });

  // Rest of the tests remain the same

  it('fetches and displays tenant users on mount', async () => {
    const { findByText } = render(<FlatDetails />);

    await waitFor(() => {
      expect(getUser).toHaveBeenCalledTimes(2);
      expect(getUser).toHaveBeenCalledWith('tenant1');
      expect(getUser).toHaveBeenCalledWith('tenant2');
    });

    expect(await findByText('John Doe')).toBeTruthy();
    expect(await findByText('Jane Smith')).toBeTruthy();
  });

  it('handles empty tenants array', async () => {
    useProperty.mockReturnValue({
      apartments: [{
        id: '123',
        apartmentName: 'Test Apartment',
        tenants: [],
      }],
    });

    const { findByText } = render(<FlatDetails />);
    
    expect(await findByText('List Of Tenants (0)')).toBeTruthy();
    expect(getUser).not.toHaveBeenCalled();
  });

  it('toggles edit mode when pencil icon is pressed', async () => {
    const { getByTestId, findByTestId } = render(<FlatDetails />);

    await waitFor(() => {
      expect(getByTestId('pencil')).toBeTruthy();
    });
    
    await act(async () => {
      fireEvent.press(getByTestId('pencil'));
    });

    expect(await findByTestId('remove-tenant-tenant1')).toBeTruthy();
    expect(await findByTestId('remove-tenant-tenant2')).toBeTruthy();
  });

  it('handles tenant removal', async () => {
    updateApartment.mockResolvedValue(true);
    const { getByTestId, findByTestId } = render(<FlatDetails />);
    
    await waitFor(() => {
      expect(getByTestId('pencil')).toBeTruthy();
    });

    // Toggle edit mode
    await act(async () => {
      fireEvent.press(getByTestId('pencil'));
    });

    // Find and press the remove button
    const removeButton = await findByTestId('remove-tenant-tenant1');
    await act(async () => {
      fireEvent.press(removeButton);
    });

    expect(updateApartment).toHaveBeenCalledWith('123', {
      tenants: ['tenant2'],
    });
  });

  it('handles navigation back when close button is pressed', async () => {
    const { getByTestId } = render(<FlatDetails />);
    
    await waitFor(() => {
      expect(getByTestId('close-button')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(getByTestId('close-button'));
    });
    
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('handles errors during tenant user fetching', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Failed to fetch');
    getUser.mockRejectedValue(error);

    render(<FlatDetails />);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Error fetching tenant users:',
        error
      );
    });

    consoleError.mockRestore();
  });

  it('handles errors during tenant removal', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Failed to update');
    updateApartment.mockRejectedValue(error);

    const { getByTestId, findByTestId } = render(<FlatDetails />);

    await waitFor(() => {
      expect(getByTestId('pencil')).toBeTruthy();
    });

    // Toggle edit mode
    await act(async () => {
      fireEvent.press(getByTestId('pencil'));
    });

    // Find and press the remove button
    const removeButton = await findByTestId('remove-tenant-tenant1');
    await act(async () => {
      fireEvent.press(removeButton);
    });

    expect(consoleError).toHaveBeenCalledWith(
      'Error removing tenant:',
      error
    );

    consoleError.mockRestore();
  });

  it('disables interactions while loading', async () => {
    // Create a promise that won't resolve to keep loading state
    let resolvePromise: (value: any) => void;
    const loadingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    getUser.mockImplementation(() => loadingPromise);

    const { getByTestId } = render(<FlatDetails />);

    await waitFor(() => {
      const closeButton = getByTestId('close-button');
      const pencilButton = getByTestId('pencil');

      expect(closeButton.props.accessibilityState.disabled).toBeTruthy();
      expect(pencilButton.props.accessibilityState.disabled).toBeTruthy();
    });
  });
});