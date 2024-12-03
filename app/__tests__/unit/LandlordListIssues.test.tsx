import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import LandlordListIssuesScreen from '../../screens/issues_landlord/LandlordListIssuesScreen';
import { getLandlord, getResidence, getTenant, getMaintenanceRequest } from '../../../firebase/firestore/firestore';
import { useAuth } from '../../Navigators/AuthContext';
import { NavigationContainer } from '@react-navigation/native';

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: jest.fn(() => ({
      navigate: jest.fn(),
      openDrawer: jest.fn(),
    })),
  };
});

// Mock the Firebase functions
jest.mock('../../../firebase/firestore/firestore', () => ({
  getLandlord: jest.fn(),
  getResidence: jest.fn(),
  getTenant: jest.fn(),
  getMaintenanceRequest: jest.fn(),
}));

// Mock the auth context
jest.mock('../../Navigators/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

// Mock data
const RESIDENCE_DOC_ID = 'residence1';

const mockLandlord = {
  userId: 'testLandlordId',
  residenceIds: [RESIDENCE_DOC_ID],
};

const mockResidence = {
  residenceName: 'Residence A',
  street: '123 Test St',
  number: '1',
  city: 'Test City',
  canton: 'TC',
  zip: '12345',
  country: 'Test Country',
  landlordId: 'testLandlordId',
  tenantIds: ['tenant1'],
  laundryMachineIds: [],
  apartments: [],
  tenantCodesID: [],
  situationReportLayout: [],
};

const mockTenant = {
  userId: 'testUserId',
  maintenanceRequests: ['request1'],
  apartmentId: 'apt1',
  residenceId: RESIDENCE_DOC_ID,
};

const mockMaintenanceRequest = {
  requestID: 'request1',
  tenantId: 'tenant1',
  residenceId: RESIDENCE_DOC_ID,
  apartmentId: 'apt1',
  openedBy: 'tenant1',
  requestTitle: 'Fix faucet',
  requestDate: '2024-01-01',
  requestDescription: 'Faucet is leaking',
  picture: [],
  requestStatus: 'inProgress' as const,
};

// Wrapper component with navigation context
const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('LandlordListIssuesScreen', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock auth context
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: 'testLandlordId' },
    });

    // Set up mock implementations
    (getLandlord as jest.Mock).mockResolvedValue(mockLandlord);
    (getResidence as jest.Mock).mockResolvedValue(mockResidence);
    (getTenant as jest.Mock).mockResolvedValue(mockTenant);
    (getMaintenanceRequest as jest.Mock).mockResolvedValue(mockMaintenanceRequest);
  });

  it('renders correctly and displays maintenance issues', async () => {
    const { getByText, getByTestId } = renderWithNavigation(<LandlordListIssuesScreen />);

    await waitFor(() => {
      expect(getByText('Maintenance issues')).toBeTruthy();
      expect(getByText(/Residence.*123 Test St/)).toBeTruthy();
    });

    const residenceButton = getByTestId('residenceButton');
    await act(async () => {
      fireEvent.press(residenceButton);
    });

    await waitFor(() => {
      expect(getByText('Fix faucet')).toBeTruthy();
    });
  });

  it('expands and collapses residences', async () => {
    const { getByTestId, queryByText } = renderWithNavigation(<LandlordListIssuesScreen />);

    await waitFor(() => {
      expect(getByTestId('residenceButton')).toBeTruthy();
    });

    const residenceButton = getByTestId('residenceButton');

    await act(async () => {
      fireEvent.press(residenceButton);
    });

    await waitFor(() => {
      expect(queryByText('Fix faucet')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(residenceButton);
    });

    await waitFor(() => {
      expect(queryByText('Fix faucet')).toBeFalsy();
    });
  });

  it('shows filter options when filter button is pressed', async () => {
    const { getByTestId, getByText } = renderWithNavigation(<LandlordListIssuesScreen />);

    await act(async () => {
      fireEvent.press(getByTestId('filterSection'));
    });

    expect(getByText('Filter by...')).toBeTruthy();
  });

  it('toggles archived issues when switch is pressed', async () => {
    const { getByTestId } = renderWithNavigation(<LandlordListIssuesScreen />);

    await waitFor(() => {
      expect(getByTestId('archivedSwitch')).toBeTruthy();
    });

    const archiveSwitch = getByTestId('archivedSwitch');
    await act(async () => {
      fireEvent(archiveSwitch, 'onValueChange', true);
    });

    expect((archiveSwitch.props as any).value).toBe(true);
  });

  it('handles errors gracefully', async () => {
    (getLandlord as jest.Mock).mockRejectedValue(new Error('Error fetching landlord data'));

    const { getByText } = renderWithNavigation(<LandlordListIssuesScreen />);

    await waitFor(() => {
      expect(getByText('Maintenance issues')).toBeTruthy();
    });
  });
});