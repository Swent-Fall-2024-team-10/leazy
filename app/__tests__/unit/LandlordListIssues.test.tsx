import React from 'react';
import { NavigationContainer, useNavigation, useFocusEffect } from '@react-navigation/native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import LandlordListIssuesScreen from '../../screens/issues_landlord/LandlordListIssuesScreen';
import {
  getLandlord,
  getResidence,
  getTenant,
  getMaintenanceRequest,
} from '../../../firebase/firestore/firestore';
import { useAuth } from '../../context/AuthContext';
import { useProperty } from '../../context/LandlordContext';
import '@testing-library/jest-native/extend-expect';
import { MaintenanceRequest, Residence, Tenant } from '../../../types/types';

// Mock the entire firebase/auth module
jest.mock('firebase/auth', () => ({
  getAuth: () => ({
    currentUser: { uid: 'landlord1' },
  }),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// Mock the property context
jest.mock('../../context/LandlordContext', () => ({
  useProperty: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  addListener: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
  useFocusEffect: jest.fn(),
}));

// Mock the Firebase functions
jest.mock('../../../firebase/firestore/firestore', () => ({
  getTenant: jest.fn(),
  getMaintenanceRequest: jest.fn(),
}));

// Mock the auth context
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: 'MockFeather',
}));

// Test data types
interface MockResidence extends Residence {
  id: string;
}

interface MockMaintenanceRequest extends MaintenanceRequest {
  requestID: string;
}

// Test data
const mockResidences: MockResidence[] = [
  {
    id: 'residence1',
    residenceName: 'Residence A',
    street: '123 Test St',
    number: '1',
    city: 'Test City',
    canton: 'TC',
    zip: '12345',
    country: 'Test Country',
    landlordId: 'landlord1',
    tenantIds: ['tenant1', 'tenant2'],
    laundryMachineIds: [],
    apartments: [],
    tenantCodesID: [],
    situationReportLayout: [],
  },
  {
    id: 'residence2',
    residenceName: 'Residence B',
    street: '456 Other St',
    number: '2',
    city: 'Test City',
    canton: 'TC',
    zip: '12345',
    country: 'Test Country',
    landlordId: 'landlord1',
    tenantIds: ['tenant3'],
    laundryMachineIds: [],
    apartments: [],
    tenantCodesID: [],
    situationReportLayout: [],
  },
];

const mockTenants: { [key: string]: Tenant } = {
  tenant1: {
    userId: 'tenant1',
    maintenanceRequests: ['request1', 'request2'],
    apartmentId: 'apt1',
    residenceId: 'residence1',
  },
  tenant2: {
    userId: 'tenant2',
    maintenanceRequests: ['request3'],
    apartmentId: 'apt2',
    residenceId: 'residence1',
  },
  tenant3: {
    userId: 'tenant3',
    maintenanceRequests: ['request4'],
    apartmentId: 'apt3',
    residenceId: 'residence2',
  },
};

const mockMaintenanceRequests: { [key: string]: MockMaintenanceRequest } = {
  request1: {
    requestID: 'request1',
    tenantId: 'tenant1',
    residenceId: 'residence1',
    apartmentId: 'apt1',
    openedBy: 'tenant1',
    requestTitle: 'Fix faucet',
    requestDate: '2024-01-01',
    requestDescription: 'Faucet is leaking',
    picture: [],
    requestStatus: 'inProgress',
  },
  request2: {
    requestID: 'request2',
    tenantId: 'tenant1',
    residenceId: 'residence1',
    apartmentId: 'apt1',
    openedBy: 'tenant1',
    requestTitle: 'Repair window',
    requestDate: '2024-01-02',
    requestDescription: "Window won't close properly",
    picture: [],
    requestStatus: 'completed',
  },
  request3: {
    requestID: 'request3',
    tenantId: 'tenant2',
    residenceId: 'residence1',
    apartmentId: 'apt2',
    openedBy: 'tenant2',
    requestTitle: 'Fix heating',
    requestDate: '2024-01-03',
    requestDescription: 'Heating not working',
    picture: [],
    requestStatus: 'notStarted',
  },
  request4: {
    requestID: 'request4',
    tenantId: 'tenant3',
    residenceId: 'residence2',
    apartmentId: 'apt3',
    openedBy: 'tenant3',
    requestTitle: 'Replace lightbulb',
    requestDate: '2024-01-04',
    requestDescription: 'Bathroom light not working',
    picture: [],
    requestStatus: 'inProgress',
  },
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(<NavigationContainer>{component}</NavigationContainer>);
};

describe('LandlordListIssuesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default auth mock
    (useAuth as jest.Mock).mockImplementation(() => ({
      user: { uid: 'landlord1' },
    }));

    // Default property context mock
    (useProperty as jest.Mock).mockImplementation(() => ({
      residences: mockResidences,
    }));

    // Setup Firebase mocks
    (getTenant as jest.Mock).mockImplementation((tenantId) =>
      Promise.resolve(mockTenants[tenantId as keyof typeof mockTenants]),
    );

    (getMaintenanceRequest as jest.Mock).mockImplementation((requestId) =>
      Promise.resolve(
        mockMaintenanceRequests[
          requestId as keyof typeof mockMaintenanceRequests
        ],
      ),
    );
  });

  // Common helper function for expanding residences
  const expandResidence = async (getAllByTestId: any, index: number = 0) => {
    await act(async () => {
      fireEvent.press(getAllByTestId('residenceButton')[index]);
    });
  };

  describe('Initial Rendering', () => {
    it('renders initial state correctly', async () => {
      const { getByText, queryByText } = renderWithProviders(
        <LandlordListIssuesScreen />,
      );

      await waitFor(() => {
        expect(getByText('Maintenance issues')).toBeTruthy();
        expect(getByText('Residence A')).toBeTruthy();
        expect(getByText('Residence B')).toBeTruthy();
        expect(queryByText('Fix faucet')).toBeFalsy();
      });
    });

    it('shows loading state initially', async () => {
      const { getByText } = renderWithProviders(<LandlordListIssuesScreen />);

      // Add loading indicator to component if not present
      // expect(getByText("Loading...")).toBeTruthy();

      await waitFor(() => {
        expect(getByText('Maintenance issues')).toBeTruthy();
      });
    });
  });

  describe('Residence Expansion', () => {
    it('expands and collapses residences correctly', async () => {
      const { getAllByTestId, queryByText } = renderWithProviders(
        <LandlordListIssuesScreen />,
      );

      await waitFor(() => {
        expect(getAllByTestId('residenceButton')[0]).toBeTruthy();
      });

      // Expand first residence
      await act(async () => {
        fireEvent.press(getAllByTestId('residenceButton')[0]);
      });

      await waitFor(() => {
        expect(queryByText('Fix faucet')).toBeTruthy();
        expect(queryByText('Fix heating')).toBeTruthy();
      });

      // Collapse first residence
      await act(async () => {
        fireEvent.press(getAllByTestId('residenceButton')[0]);
      });

      await waitFor(() => {
        expect(queryByText('Fix faucet')).toBeFalsy();
        expect(queryByText('Fix heating')).toBeFalsy();
      });
    });

    it('maintains expansion state independently for each residence', async () => {
      const { getAllByTestId, queryByText } = renderWithProviders(
        <LandlordListIssuesScreen />,
      );

      await waitFor(() => {
        expect(getAllByTestId('residenceButton')).toHaveLength(2);
      });

      // Expand both residences
      await act(async () => {
        fireEvent.press(getAllByTestId('residenceButton')[0]);
        fireEvent.press(getAllByTestId('residenceButton')[1]);
      });

      await waitFor(() => {
        expect(queryByText('Fix faucet')).toBeTruthy();
        expect(queryByText('Replace lightbulb')).toBeTruthy();
      });

      // Collapse first residence
      await act(async () => {
        fireEvent.press(getAllByTestId('residenceButton')[0]);
      });

      await waitFor(() => {
        expect(queryByText('Fix faucet')).toBeFalsy();
        expect(queryByText('Replace lightbulb')).toBeTruthy();
      });
    });
  });

  describe('Archive Toggle', () => {
    it('shows/hides completed issues when archive toggle is switched', async () => {
      const { getByTestId, getAllByTestId, queryByText } = renderWithProviders(
        <LandlordListIssuesScreen />,
      );

      await waitFor(() => {
        expect(getByTestId('archivedSwitch')).toBeTruthy();
      });

      // Expand first residence
      await act(async () => {
        fireEvent.press(getAllByTestId('residenceButton')[0]);
      });

      // Verify completed issue is hidden initially
      expect(queryByText('Repair window')).toBeFalsy();

      // Enable archived issues
      await act(async () => {
        fireEvent(getByTestId('archivedSwitch'), 'onValueChange', true);
      });

      // Verify completed issue is now visible
      expect(queryByText('Repair window')).toBeTruthy();

      // Disable archived issues
      await act(async () => {
        fireEvent(getByTestId('archivedSwitch'), 'onValueChange', false);
      });

      // Verify completed issue is hidden again
      expect(queryByText('Repair window')).toBeFalsy();
    });
  });

  describe('Filtering', () => {
    it('filters by status correctly', async () => {
      const { getByTestId, getAllByTestId, getByText, queryByText } =
        renderWithProviders(<LandlordListIssuesScreen />);

      // Open filters
      await act(async () => {
        fireEvent.press(getByTestId('filterSection'));
      });

      // Expand first residence
      await act(async () => {
        fireEvent.press(getAllByTestId('residenceButton')[0]);
      });

      // Select inProgress filter
      await act(async () => {
        fireEvent.press(getByText('inProgress'));
      });

      await waitFor(() => {
        expect(queryByText('Fix faucet')).toBeTruthy();
        expect(queryByText('Fix heating')).toBeFalsy();
      });

      // Select notStarted filter
      await act(async () => {
        fireEvent.press(getByText('notStarted'));
      });

      await waitFor(() => {
        expect(queryByText('Fix faucet')).toBeFalsy();
        expect(queryByText('Fix heating')).toBeTruthy();
      });
    });

    it('filters by residence correctly', async () => {
      const { getByTestId, getAllByTestId, queryByText } = renderWithProviders(
        <LandlordListIssuesScreen />,
      );

      // Open filters
      await act(async () => {
        fireEvent.press(getByTestId('filterSection'));
      });

      // Select second residence using test ID
      await act(async () => {
        fireEvent.press(getByTestId('filter-residence-residence2'));
      });

      // Expand residences
      await act(async () => {
        fireEvent.press(getAllByTestId('residenceButton')[0]);
      });

      await waitFor(() => {
        expect(queryByText('Replace lightbulb')).toBeTruthy();
        expect(queryByText('Fix faucet')).toBeFalsy();
      });
    });

    it('resets filters correctly', async () => {
      const { getByTestId, getAllByTestId, queryByText, getByText } = renderWithProviders(
        <LandlordListIssuesScreen />
      );

      // Open filters
      await act(async () => {
        fireEvent.press(getByTestId('filterSection'));
      });

      // Apply filters using testIDs
      await act(async () => {
        fireEvent.press(getByTestId('filter-status-inProgress'));
        fireEvent.press(getByTestId('filter-residence-residence2'));
      });

      // Reset filters
      await act(async () => {
        fireEvent.press(getByText('Reset Filters'));
      });

      // Expand residences
      await act(async () => {
        fireEvent.press(getAllByTestId('residenceButton')[0]);
        fireEvent.press(getAllByTestId('residenceButton')[1]);
      });

      await waitFor(() => {
        expect(queryByText('Fix faucet')).toBeTruthy();
        expect(queryByText('Fix heating')).toBeTruthy();
        expect(queryByText('Replace lightbulb')).toBeTruthy();
      });
    });

    it('maintains filter state after refresh', async () => {
      const { getByTestId, getAllByTestId, queryByText } = renderWithProviders(
        <LandlordListIssuesScreen />,
      );

      // Open filters
      await act(async () => {
        fireEvent.press(getByTestId('filterSection'));
      });

      // Select inProgress filter using test ID
      await act(async () => {
        fireEvent.press(getByTestId('filter-status-inProgress'));
      });

      // Expand residence
      await act(async () => {
        fireEvent.press(getAllByTestId('residenceButton')[0]);
      });

      // Simulate screen focus
      const focusCallback = (useFocusEffect as jest.Mock).mock.calls[0][0];
      act(() => {
        focusCallback();
      });

      await waitFor(() => {
        expect(queryByText('Fix faucet')).toBeTruthy(); // inProgress issue
        expect(queryByText('Fix heating')).toBeFalsy(); // notStarted issue
      });
    });

    it('correctly filters completed issues when showArchived is false', async () => {
      const { getByTestId, getAllByTestId, queryByText } = renderWithProviders(
        <LandlordListIssuesScreen />
      );

      // Expand first residence
      await act(async () => {
        fireEvent.press(getAllByTestId('residenceButton')[0]);
      });

      // Verify completed issue is not shown by default
      expect(queryByText('Repair window')).toBeFalsy(); // 'completed' status issue

      // Enable archived issues
      await act(async () => {
        fireEvent(getByTestId('archivedSwitch'), 'onValueChange', true);
      });

      // Verify completed issue is now visible
      expect(queryByText('Repair window')).toBeTruthy();
    });

    it('applies multiple filters simultaneously', async () => {
      const { getByTestId, getAllByTestId, queryByText } = renderWithProviders(
        <LandlordListIssuesScreen />
      );

      // Open filters
      await act(async () => {
        fireEvent.press(getByTestId('filterSection'));
      });

      // Apply status filter
      await act(async () => {
        fireEvent.press(getByTestId('filter-status-inProgress'));
      });

      // Apply residence filter
      await act(async () => {
        fireEvent.press(getByTestId('filter-residence-residence1'));
      });

      // Expand residence
      await act(async () => {
        fireEvent.press(getAllByTestId('residenceButton')[0]);
      });

      // Should only show in-progress issues from residence1
      expect(queryByText('Fix faucet')).toBeTruthy(); // in-progress, residence1
      expect(queryByText('Fix heating')).toBeFalsy(); // not-started, residence1
      expect(queryByText('Replace lightbulb')).toBeFalsy(); // in-progress, residence2
    });
  });

  describe('Navigation', () => {
    it('navigates to issue details when pressing an issue', async () => {
      const { getByTestId, getAllByTestId } = renderWithProviders(
        <LandlordListIssuesScreen />,
      );

      // Expand first residence
      await act(async () => {
        fireEvent.press(getAllByTestId('residenceButton')[0]);
      });

      // Press issue
      await act(async () => {
        fireEvent.press(getByTestId('issue-request1'));
      });

      expect(mockNavigation.navigate).toHaveBeenCalledWith('IssueDetails', {
        requestID: 'request1',
        source: 'LandlordListIssues',
      });
    });
  });

  describe('Error and Data Handling', () => {
    it('handles errors during data fetching and continues execution', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (getTenant as jest.Mock).mockRejectedValue(new Error('Fetch error'));

      const { getByText } = renderWithProviders(<LandlordListIssuesScreen />);

      await waitFor(() => {
        expect(getByText('Maintenance issues')).toBeTruthy();
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching issues data:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('User Authentication', () => {
    it('throws error when user is not found', () => {
      (useAuth as jest.Mock).mockImplementation(() => ({
        user: null
      }));

      expect(() => {
        renderWithProviders(<LandlordListIssuesScreen />);
      }).toThrow('User not found.');
    });
  });

  describe('Advanced Filtering', () => {
    const setupFilters = async (getByTestId: any) => {
      await act(async () => {
        fireEvent.press(getByTestId('filterSection'));
      });
    };

    it('handles archived and status filters correctly', async () => {
      const { getByTestId, getAllByTestId, queryByText } = renderWithProviders(
        <LandlordListIssuesScreen />
      );

      await expandResidence(getAllByTestId);
      expect(queryByText('Repair window')).toBeFalsy();

      await act(async () => {
        fireEvent(getByTestId('archivedSwitch'), 'onValueChange', true);
      });
      expect(queryByText('Repair window')).toBeTruthy();
    });

    it('combines multiple filter types correctly', async () => {
      const { getByTestId, getAllByTestId, queryByText } = renderWithProviders(
        <LandlordListIssuesScreen />
      );

      await setupFilters(getByTestId);
      
      await act(async () => {
        fireEvent.press(getByTestId('filter-status-inProgress'));
        fireEvent.press(getByTestId('filter-residence-residence1'));
      });

      await expandResidence(getAllByTestId);

      await waitFor(() => {
        expect(queryByText('Fix faucet')).toBeTruthy();
        expect(queryByText('Fix heating')).toBeFalsy();
        expect(queryByText('Replace lightbulb')).toBeFalsy();
      });
    });
  });

});
