import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { AuthProvider, useAuth } from '../../../context/AuthContext';
import { User as FirebaseUser } from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';
import { TUser, Tenant, Landlord } from '../../../../types/types';


jest.mock('firebase/firestore', () => ({
  onSnapshot: jest.fn(),
  doc: jest.fn()
}));


jest.mock('../../../../firebase/firebase', () => ({
  db: {}
}));

const mockTUser: TUser = {
  uid: 'test-uid',
  type: 'tenant',
  name: 'Test User',
  email: 'test@test.com',
  phone: '1234567890',
  street: 'Test Street',
  number: '123',
  city: 'Test City',
  canton: 'Test Canton',
  zip: '12345',
  country: 'Test Country'
};

const mockTenant: Tenant = {
  userId: 'test-uid',
  maintenanceRequests: [],
  apartmentId: 'apt-123',
  residenceId: 'res-123'
};

const mockLandlord: Landlord = {
  userId: 'test-uid',
  residenceIds: ['res-123', 'res-456']
};


const TestComponent = () => {
  const auth = useAuth();
  return (
    <View>
      <Text testID="loading">{auth.isLoading.toString()}</Text>
      <Text testID="user-type">{auth.user?.type}</Text>
      <Text testID="user-name">{auth.user?.name}</Text>
      <Text testID="tenant-id">{auth.tenant?.userId}</Text>
      <Text testID="tenant-residence">{auth.tenant?.residenceId}</Text>
      <Text testID="landlord-id">{auth.landlord?.userId}</Text>
      {auth.error && <Text testID="error">{auth.error.message}</Text>}
    </View>
  );
};

describe('AuthProvider', () => {
  const mockFirebaseUser = { uid: 'test-uid' } as FirebaseUser;
  const mockFetchUser = jest.fn();
  const mockFetchTenant = jest.fn();
  const mockFetchLandlord = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (onSnapshot as jest.Mock).mockImplementation(() => () => {});
  });

  it('throws error when useAuth is used outside of AuthProvider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');
    consoleError.mockRestore();
  });

  it('loads tenant user data correctly', async () => {
    mockFetchUser.mockResolvedValue({ ...mockTUser, type: 'tenant' });
    mockFetchTenant.mockResolvedValue(mockTenant);

    (onSnapshot as jest.Mock).mockImplementation((_, callback) => {
      callback({
        exists: () => true,
        data: () => mockTenant
      });
      return () => {};
    });

    const { getByTestId } = render(
      <AuthProvider
        firebaseUser={mockFirebaseUser}
        fetchUser={mockFetchUser}
        fetchTenant={mockFetchTenant}
        fetchLandlord={mockFetchLandlord}
      >
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user-type').props.children).toBe('tenant');
      expect(getByTestId('tenant-id').props.children).toBe('test-uid');
      expect(getByTestId('tenant-residence').props.children).toBe('res-123');
    });
  });

  it('loads landlord user data correctly', async () => {
    mockFetchUser.mockResolvedValue({ ...mockTUser, type: 'landlord' });
    mockFetchLandlord.mockResolvedValue(mockLandlord);

    (onSnapshot as jest.Mock).mockImplementation((_, callback) => {
      callback({
        exists: () => true,
        data: () => mockLandlord
      });
      return () => {};
    });

    const { getByTestId } = render(
      <AuthProvider
        firebaseUser={mockFirebaseUser}
        fetchUser={mockFetchUser}
        fetchTenant={mockFetchTenant}
        fetchLandlord={mockFetchLandlord}
      >
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user-type').props.children).toBe('landlord');
      expect(getByTestId('landlord-id').props.children).toBe('test-uid');
    });
  });

  it('handles tenant snapshot updates correctly', async () => {
    mockFetchUser.mockResolvedValue({ ...mockTUser, type: 'tenant' });
    mockFetchTenant.mockResolvedValue(mockTenant);

    const updatedTenant = {
      ...mockTenant,
      residenceId: 'new-res-123'
    };

    let snapshotCallback: any;
    (onSnapshot as jest.Mock).mockImplementation((_, callback) => {
      snapshotCallback = callback;
      callback({
        exists: () => true,
        data: () => mockTenant
      });
      return () => {};
    });

    const { getByTestId } = render(
      <AuthProvider
        firebaseUser={mockFirebaseUser}
        fetchUser={mockFetchUser}
        fetchTenant={mockFetchTenant}
        fetchLandlord={mockFetchLandlord}
      >
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('tenant-residence').props.children).toBe('res-123');
    });

    act(() => {
      snapshotCallback({
        exists: () => true,
        data: () => updatedTenant
      });
    });

    await waitFor(() => {
      expect(getByTestId('tenant-residence').props.children).toBe('new-res-123');
    });
  });

  it('handles fetch errors gracefully', async () => {
    mockFetchUser.mockRejectedValue(new Error('Failed to fetch user'));

    const { getByTestId } = render(
      <AuthProvider
        firebaseUser={mockFirebaseUser}
        fetchUser={mockFetchUser}
        fetchTenant={mockFetchTenant}
        fetchLandlord={mockFetchLandlord}
      >
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('error').props.children).toBe('Failed to fetch user');
      expect(getByTestId('loading').props.children).toBe('false');
    });
  });

  it('handles snapshot listener errors', async () => {
    mockFetchUser.mockResolvedValue({ ...mockTUser, type: 'tenant' });
    mockFetchTenant.mockResolvedValue(mockTenant);

    (onSnapshot as jest.Mock).mockImplementation((_, __, errorCallback) => {
      errorCallback(new Error('Snapshot listener failed'));
      return () => {};
    });

    const { getByTestId } = render(
      <AuthProvider
        firebaseUser={mockFirebaseUser}
        fetchUser={mockFetchUser}
        fetchTenant={mockFetchTenant}
        fetchLandlord={mockFetchLandlord}
      >
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('error').props.children).toBe('Tenant listener error: Snapshot listener failed');
    });
  });

  it('cleans up listeners on unmount', async () => {
    const unsubscribeMock = jest.fn();
    (onSnapshot as jest.Mock).mockImplementation((_, callback) => {
      callback({
        exists: () => true,
        data: () => mockTenant
      });
      return unsubscribeMock;
    });
    
    mockFetchUser.mockResolvedValue({ ...mockTUser, type: 'tenant' });
    mockFetchTenant.mockResolvedValue(mockTenant);

    const { unmount } = render(
      <AuthProvider
        firebaseUser={mockFirebaseUser}
        fetchUser={mockFetchUser}
        fetchTenant={mockFetchTenant}
        fetchLandlord={mockFetchLandlord}
      >
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockFetchUser).toHaveBeenCalled();
    });

    unmount();

    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('resets state when firebase user becomes null', async () => {
    mockFetchUser.mockResolvedValue({ ...mockTUser, type: 'tenant' });
    mockFetchTenant.mockResolvedValue(mockTenant);

    (onSnapshot as jest.Mock).mockImplementation((_, callback) => {
      callback({
        exists: () => true,
        data: () => mockTenant
      });
      return () => {};
    });

    const { rerender, getByTestId } = render(
      <AuthProvider
        firebaseUser={mockFirebaseUser}
        fetchUser={mockFetchUser}
        fetchTenant={mockFetchTenant}
        fetchLandlord={mockFetchLandlord}
      >
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user-type').props.children).toBe('tenant');
    });

    mockFetchUser.mockResolvedValue(null);

    await act(async () => {
      rerender(
        <AuthProvider
          firebaseUser={null}
          fetchUser={mockFetchUser}
          fetchTenant={mockFetchTenant}
          fetchLandlord={mockFetchLandlord}
        >
          <TestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(getByTestId('user-type').props.children).toBeFalsy();
      expect(getByTestId('tenant-id').props.children).toBeFalsy();
      expect(getByTestId('landlord-id').props.children).toBeFalsy();
    });
  });

  it('manages loading state correctly', async () => {
    let promiseResolve: (value: any) => void;
    const fetchPromise = new Promise(resolve => {
      promiseResolve = resolve;
    });

    mockFetchUser.mockReset();
    mockFetchUser.mockReturnValue(fetchPromise);

    const component = render(
      <AuthProvider
        firebaseUser={mockFirebaseUser}
        fetchUser={mockFetchUser}
        fetchTenant={mockFetchTenant}
        fetchLandlord={mockFetchLandlord}
      >
        <TestComponent />
      </AuthProvider>
    );
    expect(mockFetchUser).toHaveBeenCalledWith(mockFirebaseUser.uid);

    await act(async () => {
      promiseResolve!(null);
    });

    await waitFor(() => {
      expect(component.getByTestId('loading').props.children).toBe('false');
    });
  });

  it('starts with isLoading true', () => {
    mockFetchUser.mockImplementation(() => new Promise(() => {}));
    
    const { getByTestId } = render(
      <AuthProvider
        firebaseUser={mockFirebaseUser}
        fetchUser={mockFetchUser}
        fetchTenant={mockFetchTenant}
        fetchLandlord={mockFetchLandlord}
      >
        <TestComponent />
      </AuthProvider>
    );
    expect(getByTestId('loading').props.children).toBe('true');
  });

  it('handles landlord snapshot listener errors', async () => {
    const landlordUser = { ...mockTUser, type: 'landlord' };
    mockFetchUser.mockResolvedValue(landlordUser);
    mockFetchLandlord.mockResolvedValue(mockLandlord);
    (onSnapshot as jest.Mock).mockImplementation((_, __, errorCallback) => {
      errorCallback(new Error('Snapshot listener failed'));
      return () => {};
    });

    const { getByTestId } = render(
      <AuthProvider
        firebaseUser={mockFirebaseUser}
        fetchUser={mockFetchUser}
        fetchTenant={mockFetchTenant}
        fetchLandlord={mockFetchLandlord}
      >
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('error').props.children).toBe(
        'Landlord listener error: Snapshot listener failed'
      );
    });
  });

  it('handles non-existent landlord snapshot data', async () => {
    const landlordUser = { ...mockTUser, type: 'landlord' };
    mockFetchUser.mockResolvedValue(landlordUser);
    mockFetchLandlord.mockResolvedValue(mockLandlord);
    let snapshotCallback: any;
    (onSnapshot as jest.Mock).mockImplementation((_, callback) => {
      snapshotCallback = callback;
      callback({
        exists: () => true,
        data: () => mockLandlord
      });
      return () => {};
    });

    const { getByTestId } = render(
      <AuthProvider
        firebaseUser={mockFirebaseUser}
        fetchUser={mockFetchUser}
        fetchTenant={mockFetchTenant}
        fetchLandlord={mockFetchLandlord}
      >
        <TestComponent />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByTestId('landlord-id').props.children).toBe('test-uid');
    });
    act(() => {
      snapshotCallback({
        exists: () => false
      });
    });
    await waitFor(() => {
      expect(getByTestId('landlord-id').props.children).toBeFalsy();
    });
  });

  it('updates landlord data when snapshot changes', async () => {
    const landlordUser = { ...mockTUser, type: 'landlord' };
    mockFetchUser.mockResolvedValue(landlordUser);
    mockFetchLandlord.mockResolvedValue(mockLandlord);
    let snapshotCallback: any;
    (onSnapshot as jest.Mock).mockImplementation((_, callback) => {
      snapshotCallback = callback;
      callback({
        exists: () => true,
        data: () => mockLandlord
      });
      return () => {};
    });

    const { getByTestId } = render(
      <AuthProvider
        firebaseUser={mockFirebaseUser}
        fetchUser={mockFetchUser}
        fetchTenant={mockFetchTenant}
        fetchLandlord={mockFetchLandlord}
      >
        <TestComponent />
      </AuthProvider>
    );
    await waitFor(() => {
      expect(getByTestId('landlord-id').props.children).toBe('test-uid');
    });
    const updatedLandlord = {
      ...mockLandlord,
      residenceIds: ['res-789', 'res-012']
    };

    act(() => {
      snapshotCallback({
        exists: () => true,
        data: () => updatedLandlord
      });
    });

    await waitFor(() => {
      expect(getByTestId('landlord-id').props.children).toBe('test-uid');
    });
  });
});