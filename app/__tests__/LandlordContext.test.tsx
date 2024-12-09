/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LandlordProvider, useProperty } from '../context/LandlordContext';
import { useAuth } from '../context/AuthContext';
import { onSnapshot, getDocs } from 'firebase/firestore';

// Mock Firebase
jest.mock('../../firebase/firebase', () => ({
  db: {}
}));

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  onSnapshot: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  collection: jest.fn(),
  where: jest.fn(),
  doc: jest.fn()
}));

// Mock Auth Context
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Test Component
const TestComponent = ({ showError = false }) => {
  const propertyContext = useProperty();
  return (
    <div data-testid="test-component">
      <span data-testid="residences-length">{propertyContext.residences.length}</span>
      <span data-testid="loading-state">{propertyContext.isLoading ? 'loading' : 'loaded'}</span>
      {showError && propertyContext.error && (
        <span data-testid="error-message">{propertyContext.error.message}</span>
      )}
    </div>
  );
};

describe('PropertyContext', () => {
  const mockLandlord = {
    userId: 'test-landlord-id'
  };

  const mockResidence = {
    residenceId: 'test-residence-id',
    landlordId: 'test-landlord-id',
    name: 'Test Residence'
  };

  const mockApartment = {
    apartmentId: 'test-apartment-id',
    residenceId: 'test-residence-id',
    number: '101'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      landlord: mockLandlord,
      isLoading: false
    });
  });

  it('should initialize with empty data when landlord is not available', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      landlord: null,
      isLoading: false
    });

    const { getByTestId } = render(
      <LandlordProvider>
        <TestComponent />
      </LandlordProvider>
    );

    await waitFor(() => {
      expect(getByTestId('residences-length')).toHaveTextContent('0');
      expect(getByTestId('loading-state')).toHaveTextContent('loaded');
    });
  });

  it('should load residence and apartment data successfully', async () => {
    const mockResidenceSnapshot = {
      docs: [{
        id: mockResidence.residenceId,
        data: () => mockResidence
      }]
    };

    const mockApartmentSnapshot = {
      docs: [{
        id: mockApartment.apartmentId,
        data: () => mockApartment
      }],
      forEach: function(callback) {
        this.docs.forEach(callback);
      }
    };

    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      callback(mockResidenceSnapshot);
      return () => {};
    });

    (getDocs as jest.Mock).mockResolvedValue(mockApartmentSnapshot);

    const { getByTestId } = render(
      <LandlordProvider>
        <TestComponent />
      </LandlordProvider>
    );

    await waitFor(() => {
      expect(getByTestId('residences-length')).toHaveTextContent('1');
      expect(getByTestId('loading-state')).toHaveTextContent('loaded');
    });
  });

  it('should handle errors during data fetching', async () => {
    const testError = new Error('Test error');
    (onSnapshot as jest.Mock).mockImplementation((query, callback, errorCallback) => {
      errorCallback(testError);
      return () => {};
    });

    const { getByTestId } = render(
      <LandlordProvider>
        <TestComponent showError />
      </LandlordProvider>
    );

    await waitFor(() => {
      expect(getByTestId('error-message')).toHaveTextContent('Residences listener error: Test error');
    });
  });

  it('should throw error when useProperty is used outside provider', () => {
    const originalError = console.error;
    console.error = jest.fn();

    const renderOutsideProvider = () => render(<TestComponent />);
    expect(renderOutsideProvider).toThrow('useProperty must be used within a PropertyProvider');

    console.error = originalError;
  });
  
  it('should handle auth loading state', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      landlord: null,
      isLoading: true
    });

    const { getByTestId } = render(
      <LandlordProvider>
        <TestComponent />
      </LandlordProvider>
    );

    await waitFor(() => {
      expect(getByTestId('residences-length')).toHaveTextContent('0');
      expect(getByTestId('loading-state')).toHaveTextContent('loaded');
    });
  });
});