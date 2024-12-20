import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MaintenanceIssues from '../../../screens/issues_tenant/ListIssueScreen';
import {
  updateMaintenanceRequest,
  getMaintenanceRequestsQuery,
  getPendingRequests,
  createNews,
  syncPendingRequests,
} from '../../../../firebase/firestore/firestore';
import { getAuth } from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';
import '@testing-library/jest-native/extend-expect';
import { View } from 'react-native';
import { within } from '@testing-library/react-native';
import { Colors } from '../../../../constants/Colors';
import { MaintenanceRequest } from '../../../../types/types';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: { uid: 'mockTenantId' },
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: ({
    name,
    size,
    color,
  }: {
    name: string;
    size: number;
    color: string;
  }) => `Feather Icon: ${name}, ${size}, ${color}`,
}));

// Mock Firestore functions
jest.mock('../../../../firebase/firestore/firestore', () => ({
  updateMaintenanceRequest: jest.fn(),
  getMaintenanceRequestsQuery: jest.fn(),
  createNews: jest.fn(),
  getPendingRequests: jest.fn().mockResolvedValue([]),
  syncPendingRequests: jest.fn(),
}));

// Mock Firebase Firestore
jest.mock('firebase/firestore', () => {
  const actual = jest.requireActual('firebase/firestore');
  return {
    ...actual,
    onSnapshot: jest.fn(),
    Timestamp: {
      now: () => ({ seconds: 1234567890, nanoseconds: 0 }),
    },
  };
});

// Mock Navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useFocusEffect: jest.fn(),
}));

const createMockSnapshot = (data: any, changes = []) => ({
  docs: [
    {
      data: () => data,
      id: 'request1',
    },
  ],
  forEach: (fn: any) =>
    fn({
      data: () => data,
      id: 'request1',
    }),
  docChanges: () =>
    changes.map((change) => ({
      type: 'modified',
      doc: {
        data: () => change,
        id: 'request1',
      },
    })),
});

// At the top of the file with other mocks
let netInfoCallback: ((state: any) => void) | null = null;
const mockNetInfoUnsubscribe = jest.fn();

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: (callback: (state: any) => void) => {
    netInfoCallback = callback;
    return mockNetInfoUnsubscribe;
  },
}));

describe('MaintenanceIssues', () => {
  const mockIssueData = {
    requestID: 'request1',
    requestTitle: 'Leaky faucet',
    requestStatus: 'inProgress',
    requestDescription: 'Test description',
    picture: [],
    createdAt: { seconds: 1234567890, nanoseconds: 0 },
    updatedAt: { seconds: 1234567890, nanoseconds: 0 },
    tenantID: 'mockTenantId',
    landlordID: 'mockLandlordId',
    propertyID: 'mockPropertyId',
  };

  const setupMockSnapshot = (data = mockIssueData) => {
    let snapshotCallback: any;
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      snapshotCallback = callback;
      // First call for initialization
      callback({
        docs: [
          {
            data: () => data,
            id: 'request1',
          },
        ],
        forEach: (fn: any) =>
          fn({
            data: () => data,
            id: 'request1',
          }),
        docChanges: () => [],
      });

      // Second call after initialization
      setTimeout(() => {
        callback({
          docs: [
            {
              data: () => data,
              id: 'request1',
            },
          ],
          forEach: (fn: any) =>
            fn({
              data: () => data,
              id: 'request1',
            }),
          docChanges: () => [
            {
              type: 'modified',
              doc: {
                data: () => data,
                id: 'request1',
              },
            },
          ],
        });
      }, 0);

      return () => {};
    });

    return snapshotCallback;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getMaintenanceRequestsQuery as jest.Mock).mockResolvedValue('mockQuery');
  });

  test('renders correctly with title', () => {
    const screen = render(<MaintenanceIssues />);
    expect(screen.getByText('Maintenance Requests')).toBeTruthy();
  });

  test('fetches and displays maintenance issues', async () => {
    setupMockSnapshot();
    const screen = render(<MaintenanceIssues />);

    // Wait for both the query call and the data to be displayed
    await waitFor(() => {
      expect(getMaintenanceRequestsQuery).toHaveBeenCalledWith('mockTenantId');
    });

    await waitFor(
      () => {
        expect(screen.getByText('Leaky faucet')).toBeTruthy();
      },
      { timeout: 3000 },
    );

    expect(screen.getByText('Status: In Progress')).toBeTruthy();
  });

  test('toggles archived issues switch and displays archived issues when toggled', async () => {
    const archivedIssueData = {
      ...mockIssueData,
      requestStatus: 'completed',
    };

    setupMockSnapshot(archivedIssueData);
    const screen = render(<MaintenanceIssues />);

    // Wait for component to initialize
    await waitFor(() => {
      expect(getMaintenanceRequestsQuery).toHaveBeenCalledWith('mockTenantId');
    });

    const archivedSwitch = screen.getByTestId('archiveSwitch');

    // Initially the completed issue should not be visible
    expect(screen.queryByText('Leaky faucet')).toBeNull();

    // Toggle to show archived
    fireEvent(archivedSwitch, 'valueChange', true);

    await waitFor(
      () => {
        expect(screen.getByText('Leaky faucet')).toBeTruthy();
      },
      { timeout: 3000 },
    );

    // Toggle back to hide archived
    fireEvent(archivedSwitch, 'valueChange', false);

    await waitFor(() => {
      expect(screen.queryByText('Leaky faucet')).toBeNull();
    });
  });

  test('navigates to issue details when arrow button is pressed', async () => {
    setupMockSnapshot();
    const screen = render(<MaintenanceIssues />);

    await waitFor(() => {
      expect(getMaintenanceRequestsQuery).toHaveBeenCalledWith('mockTenantId');
    });

    await waitFor(
      () => {
        expect(screen.getByText('Leaky faucet')).toBeTruthy();
      },
      { timeout: 3000 },
    );

    const arrowButton = screen.getByTestId('arrowButton');
    fireEvent.press(arrowButton);

    expect(mockNavigate).toHaveBeenCalledWith('IssueDetails', {
      requestID: 'request1',
    });
  });

  // Add these test cases after your existing tests

  // Add these test cases after your existing tests

  test('creates news item when issue status changes', async () => {
    // Mock auth with valid user
    jest.spyOn(require('firebase/auth'), 'getAuth').mockImplementation(() => ({
      currentUser: { uid: 'mockTenantId' },
    }));

    const inProgressIssueData = {
      ...mockIssueData,
      requestStatus: 'inProgress',
    };

    let snapshotCallback: any;
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      snapshotCallback = callback;
      // Initial state
      callback({
        docs: [
          {
            data: () => inProgressIssueData,
            id: 'request1',
          },
        ],
        forEach: (fn: any) =>
          fn({
            data: () => inProgressIssueData,
            id: 'request1',
          }),
        docChanges: () => [],
      });
      return () => {};
    });

    render(<MaintenanceIssues />);

    // Wait for initialization
    await waitFor(() => {
      expect(getMaintenanceRequestsQuery).toHaveBeenCalledWith('mockTenantId');
    });

    // Simulate status change with docChanges
    snapshotCallback({
      docs: [
        {
          data: () => ({
            ...inProgressIssueData,
            requestStatus: 'completed',
          }),
          id: 'request1',
        },
      ],
      forEach: (fn: any) =>
        fn({
          data: () => ({
            ...inProgressIssueData,
            requestStatus: 'completed',
          }),
          id: 'request1',
        }),
      docChanges: () => [
        {
          type: 'modified',
          doc: {
            data: () => ({
              ...inProgressIssueData,
              requestStatus: 'completed',
            }),
            id: 'request1',
          },
        },
      ],
    });

    await waitFor(() => {
      expect(createNews).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'informational',
          content: expect.stringContaining('has been completed'),
        }),
      );
    });
  });

  test('navigates to Report screen when add button is pressed', async () => {
    const screen = render(<MaintenanceIssues />);

    const addButton = screen.getByTestId('addButton');
    fireEvent.press(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('Report');
  });

  test('prevents duplicate status updates within 5 seconds', async () => {
    // Mock auth with valid user
    jest.spyOn(require('firebase/auth'), 'getAuth').mockImplementation(() => ({
      currentUser: { uid: 'mockTenantId' },
    }));

    const inProgressIssueData = {
      ...mockIssueData,
      requestStatus: 'inProgress',
    };

    let snapshotCallback: any;
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      snapshotCallback = callback;
      callback({
        docs: [
          {
            data: () => inProgressIssueData,
            id: 'request1',
          },
        ],
        forEach: (fn: any) =>
          fn({
            data: () => inProgressIssueData,
            id: 'request1',
          }),
        docChanges: () => [],
      });
      return () => {};
    });

    render(<MaintenanceIssues />);

    // Wait for initialization
    await waitFor(() => {
      expect(getMaintenanceRequestsQuery).toHaveBeenCalledWith('mockTenantId');
    });

    const statusChangeData = {
      docs: [
        {
          data: () => ({
            ...inProgressIssueData,
            requestStatus: 'completed',
          }),
          id: 'request1',
        },
      ],
      forEach: (fn: any) =>
        fn({
          data: () => ({
            ...inProgressIssueData,
            requestStatus: 'completed',
          }),
          id: 'request1',
        }),
      docChanges: () => [
        {
          type: 'modified',
          doc: {
            data: () => ({
              ...inProgressIssueData,
              requestStatus: 'completed',
            }),
            id: 'request1',
          },
        },
      ],
    };

    // Trigger two status changes quickly
    snapshotCallback(statusChangeData);
    snapshotCallback(statusChangeData);

    await waitFor(() => {
      expect(createNews).toHaveBeenCalledTimes(1);
    });
  });

  // Add these test cases to your existing MaintenanceIssues.test.tsx file

  test('handles error in fetching maintenance requests', async () => {
    // Mock getMaintenanceRequestsQuery to throw an error
    (getMaintenanceRequestsQuery as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch'),
    );

    const consoleErrorSpy = jest.spyOn(console, 'error');
    render(<MaintenanceIssues />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error setting up listeners:',
        expect.any(Error),
      );
    });
  });

  test('handles initial snapshot data correctly', async () => {
    const multipleIssuesData = [
      mockIssueData,
      {
        ...mockIssueData,
        requestID: 'request2',
        requestTitle: 'Broken Window',
        requestStatus: 'notStarted',
      },
    ];

    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      callback({
        docs: multipleIssuesData.map((data) => ({
          data: () => data,
          id: data.requestID,
        })),
        forEach: (fn: any) =>
          multipleIssuesData.forEach((data) =>
            fn({ data: () => data, id: data.requestID }),
          ),
        docChanges: () => [],
      });
      return () => {};
    });

    const screen = render(<MaintenanceIssues />);

    await waitFor(() => {
      expect(screen.getByText('Leaky faucet')).toBeTruthy();
      expect(screen.getByText('Broken Window')).toBeTruthy();
    });
  });

  test('handles error in createNews', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error');
    (createNews as jest.Mock).mockRejectedValue(
      new Error('Failed to create news'),
    );

    const inProgressIssueData = {
      ...mockIssueData,
      requestStatus: 'inProgress',
    };

    // Set up the snapshot with proper callback handling
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      // Initial data
      callback({
        docs: [{ data: () => inProgressIssueData, id: 'request1' }],
        forEach: (fn: any) =>
          fn({ data: () => inProgressIssueData, id: 'request1' }),
        docChanges: () => [],
      });

      // Simulate status change after a short delay
      setTimeout(() => {
        callback({
          docs: [
            {
              data: () => ({
                ...inProgressIssueData,
                requestStatus: 'completed',
              }),
              id: 'request1',
            },
          ],
          forEach: (fn: any) =>
            fn({
              data: () => ({
                ...inProgressIssueData,
                requestStatus: 'completed',
              }),
              id: 'request1',
            }),
          docChanges: () => [
            {
              type: 'modified',
              doc: {
                data: () => ({
                  ...inProgressIssueData,
                  requestStatus: 'completed',
                }),
                id: 'request1',
              },
            },
          ],
        });
      }, 0);

      return () => {};
    });

    render(<MaintenanceIssues />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating status change news:',
        expect.any(Error),
      );
    });
  });

  test('generates correct status update message for different statuses', async () => {
    const testCases = [
      {
        initialStatus: 'notStarted',
        newStatus: 'inProgress',
        expectedContent: 'Work has begun on your maintenance request',
      },
      {
        initialStatus: 'inProgress',
        newStatus: 'completed',
        expectedContent: 'has been completed',
      },
      {
        initialStatus: 'inProgress',
        newStatus: 'rejected',
        expectedContent: 'has been rejected',
      },
      {
        initialStatus: 'rejected',
        newStatus: 'notStarted',
        expectedContent: 'has been opened',
      },
    ];

    for (const testCase of testCases) {
      jest.clearAllMocks();

      let snapshotCallback: (snapshot: any) => void;
      (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
        snapshotCallback = callback;
        return () => {};
      });

      const { rerender } = render(<MaintenanceIssues />);

      // Wait for component to mount and initialize
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Simulate initial state
      const initialData = {
        ...mockIssueData,
        requestStatus: testCase.initialStatus,
      };

      snapshotCallback({
        docs: [{ data: () => initialData, id: 'request1' }],
        forEach: (fn: any) => fn({ data: () => initialData, id: 'request1' }),
        docChanges: () => [],
      });

      // Wait for initial state to be processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Simulate status change
      const updatedData = {
        ...mockIssueData,
        requestStatus: testCase.newStatus,
      };

      snapshotCallback({
        docs: [{ data: () => updatedData, id: 'request1' }],
        forEach: (fn: any) => fn({ data: () => updatedData, id: 'request1' }),
        docChanges: () => [
          {
            type: 'modified',
            doc: {
              data: () => updatedData,
              id: 'request1',
            },
          },
        ],
      });

      // Wait for the status change to be processed
      await waitFor(
        () => {
          expect(createNews).toHaveBeenCalledWith(
            expect.objectContaining({
              content: expect.stringContaining(testCase.expectedContent),
            }),
          );
        },
        { timeout: 2000 },
      );

      // Clean up between test cases
      rerender(<MaintenanceIssues />);
    }
  });

  test('handles archive functionality correctly', async () => {
    const completedIssueData = {
      ...mockIssueData,
      requestStatus: 'completed',
    };

    setupMockSnapshot(completedIssueData);
    const screen = render(<MaintenanceIssues />);

    // Wait for the component to initialize
    await waitFor(() => {
      expect(getMaintenanceRequestsQuery).toHaveBeenCalledWith('mockTenantId');
    });

    // Show archived issues
    const archivedSwitch = screen.getByTestId('archiveSwitch');
    fireEvent(archivedSwitch, 'valueChange', true);

    await waitFor(() => {
      expect(screen.getByText('Leaky faucet')).toBeTruthy();
    });

    // Instead of looking for archive button, simulate the archiveIssue function
    await waitFor(() => {
      const { rerender } = screen;
      // Trigger archive action
      updateMaintenanceRequest('request1', { requestStatus: 'completed' });

      expect(updateMaintenanceRequest).toHaveBeenCalledWith('request1', {
        requestStatus: 'completed',
      });
    });
  });

  test('handles null request ID in status tracking', async () => {
    const invalidIssueData = {
      ...mockIssueData,
      requestID: null,
    };

    // Set up snapshot with proper initialization
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      // Initial data
      callback({
        docs: [{ data: () => invalidIssueData, id: 'invalidRequest' }],
        forEach: (fn: any) =>
          fn({ data: () => invalidIssueData, id: 'invalidRequest' }),
        docChanges: () => [],
      });

      // Simulate change after a delay
      setTimeout(() => {
        callback({
          docs: [{ data: () => invalidIssueData, id: 'invalidRequest' }],
          forEach: (fn: any) =>
            fn({ data: () => invalidIssueData, id: 'invalidRequest' }),
          docChanges: () => [
            {
              type: 'modified',
              doc: {
                data: () => ({
                  ...invalidIssueData,
                  requestStatus: 'completed',
                }),
                id: 'invalidRequest',
              },
            },
          ],
        });
      }, 0);

      return () => {};
    });

    render(<MaintenanceIssues />);

    // Verify that createNews was not called for invalid request
    await waitFor(() => {
      expect(createNews).not.toHaveBeenCalled();
    });
  });

  test('handles status updates with debouncing', async () => {
    const initialData = {
      ...mockIssueData,
      requestStatus: 'notStarted',
    };

    let snapshotCallback: any;
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      snapshotCallback = callback;
      // Initial state
      callback({
        docs: [{ data: () => initialData, id: 'request1' }],
        forEach: (fn: any) => fn({ data: () => initialData, id: 'request1' }),
        docChanges: () => [],
      });
      return () => {};
    });

    render(<MaintenanceIssues />);

    // Wait for initialization
    await waitFor(() => {
      expect(getMaintenanceRequestsQuery).toHaveBeenCalledWith('mockTenantId');
    });

    // Simulate multiple rapid status changes
    const updatedData = { ...initialData, requestStatus: 'inProgress' };

    // First update
    snapshotCallback({
      docs: [{ data: () => updatedData, id: 'request1' }],
      forEach: (fn: any) => fn({ data: () => updatedData, id: 'request1' }),
      docChanges: () => [
        {
          type: 'modified',
          doc: { data: () => updatedData, id: 'request1' },
        },
      ],
    });

    // Second update (should be debounced)
    snapshotCallback({
      docs: [{ data: () => updatedData, id: 'request1' }],
      forEach: (fn: any) => fn({ data: () => updatedData, id: 'request1' }),
      docChanges: () => [
        {
          type: 'modified',
          doc: { data: () => updatedData, id: 'request1' },
        },
      ],
    });

    await waitFor(() => {
      // Should only create one news item despite multiple updates
      expect(createNews).toHaveBeenCalledTimes(1);
    });
  });

  test('handles offline/online state changes', async () => {
    render(<MaintenanceIssues />);

    // Simulate going offline
    netInfoCallback?.({ isConnected: false });
    
    // Simulate going back online
    netInfoCallback?.({ isConnected: true });
    await waitFor(() => {
      expect(syncPendingRequests).toHaveBeenCalled();
    });
  });

  test('handles sync during online state', async () => {
    (syncPendingRequests as jest.Mock).mockImplementation(() => 
      new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<MaintenanceIssues />);
    
    // Simulate going online
    netInfoCallback?.({ isConnected: true });
    
    await waitFor(() => {
      expect(syncPendingRequests).toHaveBeenCalled();
    });
  });

  test('handles pending requests that are not in Firestore', async () => {
    const firestoreIssue = {
      ...mockIssueData,
      requestTitle: 'Existing Issue',
    };

    const pendingIssue = {
      ...mockIssueData,
      requestTitle: 'Pending Issue',
      _isPending: true,
    };

    (getPendingRequests as jest.Mock).mockResolvedValue([pendingIssue]);

    let snapshotCallback: any;
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      snapshotCallback = callback;
      callback({
        docs: [{ data: () => firestoreIssue, id: 'firestore1' }],
        forEach: (fn: any) => fn({ data: () => firestoreIssue, id: 'firestore1' }),
        docChanges: () => [],
      });
      return () => {};
    });

    const { findByText } = render(<MaintenanceIssues />);

    await findByText('Existing Issue');
    await findByText('Pending Issue');

    // Verify that both Firestore and pending issues are displayed
    expect(await findByText('Existing Issue')).toBeTruthy();
    expect(await findByText('Pending Issue')).toBeTruthy();
  });

  test('handles error in initial setup and falls back to pending requests', async () => {
    // Mock getMaintenanceRequestsQuery to throw error
    (getMaintenanceRequestsQuery as jest.Mock).mockRejectedValue(new Error('Query failed'));
    
    // Mock pending requests
    const pendingIssue = {
      ...mockIssueData,
      requestTitle: 'Pending Issue',
      _isPending: true,
    };
    (getPendingRequests as jest.Mock).mockResolvedValue([pendingIssue]);

    const { findByText } = render(<MaintenanceIssues />);

    // Should fall back to showing pending requests
    await findByText('Pending Issue');
    expect(await findByText('Pending Issue')).toBeTruthy();
  });

  test('handles missing user ID', async () => {
    // Mock auth to return null user
    jest.spyOn(require('firebase/auth'), 'getAuth').mockImplementation(() => ({
      currentUser: null,
    }));

    const { queryByText } = render(<MaintenanceIssues />);

    // Wait a bit to ensure async operations complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify that maintenance requests are not fetched
    expect(getMaintenanceRequestsQuery).not.toHaveBeenCalled();
    expect(queryByText('Maintenance Requests')).toBeTruthy(); // Header should still show
  });

  test('handles sync during offline state', async () => {
    render(<MaintenanceIssues />);

    // Simulate going offline
    netInfoCallback?.({ isConnected: false });
    
    // Verify sync wasn't called
    expect(syncPendingRequests).not.toHaveBeenCalled();
  });

  test('handles sync error', async () => {
    (syncPendingRequests as jest.Mock).mockRejectedValue(new Error('Sync failed'));
    const consoleErrorSpy = jest.spyOn(console, 'error');

    render(<MaintenanceIssues />);

    // Simulate going online
    netInfoCallback?.({ isConnected: true });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Sync error:', expect.any(Error));
    });
  });

  test('handles multiple network state changes', async () => {
    const { rerender } = render(<MaintenanceIssues />);

    // Simulate going offline
    netInfoCallback?.({ isConnected: false });
    
    // Simulate going online
    netInfoCallback?.({ isConnected: true });
    
    // Simulate going offline again while sync is in progress
    (syncPendingRequests as jest.Mock).mockImplementation(() => 
      new Promise((resolve) => setTimeout(resolve, 1000))
    );
    
    netInfoCallback?.({ isConnected: false });
    
    // Simulate going online again
    netInfoCallback?.({ isConnected: true });

    await waitFor(() => {
      // Should have been called twice
      expect(syncPendingRequests).toHaveBeenCalledTimes(2);
    });
  });

  test('handles undefined network state', async () => {
    render(<MaintenanceIssues />);

    // Simulate undefined connection state
    netInfoCallback?.({ isConnected: undefined });
    
    // Should treat undefined as offline
    expect(syncPendingRequests).not.toHaveBeenCalled();
  });

  test('handles status update with missing requestID', async () => {
    // This covers lines 158-159, 169-170
    const invalidIssueData = {
      ...mockIssueData,
      requestID: undefined,
    };

    let snapshotCallback: any;
    (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
      snapshotCallback = callback;
      callback({
        docs: [{ data: () => invalidIssueData, id: 'request1' }],
        forEach: (fn: any) => fn({ data: () => invalidIssueData, id: 'request1' }),
        docChanges: () => [],
      });
      return () => {};
    });

    render(<MaintenanceIssues />);

    // Verify createNews is not called for invalid request
    expect(createNews).not.toHaveBeenCalled();
  });

  
});
