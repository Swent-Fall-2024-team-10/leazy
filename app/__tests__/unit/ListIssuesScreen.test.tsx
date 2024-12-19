import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MaintenanceIssues from '../../screens/issues_tenant/ListIssueScreen';
import {
  updateMaintenanceRequest,
  getMaintenanceRequestsQuery,
} from '../../../firebase/firestore/firestore';
import { getAuth } from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';
import '@testing-library/jest-native/extend-expect';
import { createNews } from '../../../firebase/firestore/firestore';

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
jest.mock('../../../firebase/firestore/firestore', () => ({
  updateMaintenanceRequest: jest.fn(),
  getMaintenanceRequestsQuery: jest.fn(),
  createNews: jest.fn(),
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

  test('handles error when user is not logged in', async () => {
    // Mock auth with null user before rendering
    jest.spyOn(require('firebase/auth'), 'getAuth').mockImplementation(() => ({
      currentUser: null,
    }));

    const consoleErrorSpy = jest.spyOn(console, 'error');
    render(<MaintenanceIssues />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('User is not logged in');
    });
  });

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
});
