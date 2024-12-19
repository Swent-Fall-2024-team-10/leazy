import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import LandlordDashboard from '../screens/landlord/LandlordDashboard';
import '@testing-library/jest-native/extend-expect';
import * as Navigation from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import {
  getLandlord,
  getResidence,
  getApartment,
  getMaintenanceRequest,
} from '../../firebase/firestore/firestore';
import { NavigationContainer } from '@react-navigation/native';
import {
  TUser,
  Residence,
  Apartment,
  MaintenanceRequest,
} from '../../types/types';
import { User as FirebaseUser } from 'firebase/auth';
import { getDoc, getDocs } from 'firebase/firestore';

jest.mock('../context/AuthContext');
jest.mock('../../firebase/firestore/firestore');
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(),
}));

const consoleSpy = {
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
};

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedGetLandlord = getLandlord as jest.MockedFunction<
  typeof getLandlord
>;
const mockedGetResidence = getResidence as jest.MockedFunction<
  typeof getResidence
>;
const mockedGetApartment = getApartment as jest.MockedFunction<
  typeof getApartment
>;
const mockedGetMaintenanceRequest =
  getMaintenanceRequest as jest.MockedFunction<typeof getMaintenanceRequest>;

(getDoc as jest.Mock).mockResolvedValue({
  exists: () => false,
});

(getDocs as jest.Mock).mockResolvedValue({
  empty: true,
  docs: [],
});

describe('LandlordDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.error.mockClear();
    consoleSpy.log.mockClear();
    consoleSpy.warn.mockClear();
  });

  afterAll(() => {
    consoleSpy.error.mockRestore();
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
  });

  const renderWithNavigation = (component: React.ReactElement) => {
    return render(<NavigationContainer>{component}</NavigationContainer>);
  };

  const mockedUser: TUser = {
    uid: 'test-uid',
    type: 'landlord',
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '123456789',
    street: 'Main Street',
    number: '123',
    city: 'Anytown',
    canton: 'Anycanton',
    zip: '12345',
    country: 'Anycountry',
  };

  const mockedFirebaseUser: FirebaseUser = {
    uid: 'test-uid',
    email: 'johndoe@example.com',
  } as unknown as FirebaseUser;

  const mockedAuthContext = {
    firebaseUser: mockedFirebaseUser,
    user: mockedUser,
    tenant: null,
    landlord: null,
    isLoading: false,
    error: undefined,
  };

  test('renders loading state initially', () => {
    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
      isLoading: true,
    });

    const { getByTestId } = renderWithNavigation(<LandlordDashboard />);
    expect(getByTestId('LandlordDashboard_LoadingIndicator')).toBeTruthy();
    expect(getByTestId('LandlordDashboard_LoadingText')).toHaveTextContent(
      'Loading...',
    );
  });

  test('renders error state when data fetching fails', async () => {
    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    mockedGetLandlord.mockRejectedValue(new Error('Network Error'));

    const { findByTestId } = renderWithNavigation(<LandlordDashboard />);
    const errorMessage = await findByTestId('LandlordDashboard_ErrorMessage');
    expect(errorMessage).toHaveTextContent(
      'Unable to load data. Please check your connection and try again.',
    );
    expect(await findByTestId('LandlordDashboard_RetryButton')).toBeTruthy();
  });

  test('retries data fetching when retry button is pressed', async () => {
    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    // First attempt fails
    mockedGetLandlord.mockRejectedValueOnce(new Error('Network Error'));
    // Second attempt succeeds
    mockedGetLandlord.mockResolvedValueOnce({
      userId: mockedUser.uid,
      residenceIds: [],
    });

    const { findByTestId, getByTestId } = renderWithNavigation(
      <LandlordDashboard />,
    );

    const retryButton = await findByTestId('LandlordDashboard_RetryButton');
    fireEvent.press(retryButton);

    await waitFor(() => {
      expect(mockedGetLandlord).toHaveBeenCalledTimes(2);
    });

    expect(getByTestId('LandlordDashboard_NoResidencesText')).toHaveTextContent(
      'No residences available',
    );
  });

  test('renders residences and maintenance issues correctly', async () => {
    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    mockedGetLandlord.mockResolvedValue({
      userId: mockedUser.uid,
      residenceIds: ['res1', 'res2'],
    });

    mockedGetResidence.mockImplementation((resId) => {
      if (resId === 'res1') {
        return Promise.resolve({
          residenceName: 'Residence 1',
          apartments: ['apt1', 'apt2'],
        } as Residence);
      } else if (resId === 'res2') {
        return Promise.resolve({
          residenceName: 'Residence 2',
          apartments: ['apt3'],
        } as Residence);
      }
      return Promise.resolve(null);
    });

    mockedGetApartment.mockImplementation((aptId) => {
      if (aptId === 'apt1') {
        return Promise.resolve({
          apartmentName: 'Apartment 1',
          maintenanceRequests: ['req1'],
        } as Apartment);
      } else if (aptId === 'apt2') {
        return Promise.resolve({
          apartmentName: 'Apartment 2',
          maintenanceRequests: ['req2', 'req3'],
        } as Apartment);
      } else if (aptId === 'apt3') {
        return Promise.resolve({
          apartmentName: 'Apartment 3',
          residenceId: 'res1',
          tenants: [],
          maintenanceRequests: [],
          situationReportId: ['situation1'],
        } as Apartment);
      }
      return Promise.resolve(null);
    });

    mockedGetMaintenanceRequest.mockImplementation((reqId) => {
      if (reqId === 'req1') {
        return Promise.resolve({
          requestID: 'req1',
          requestTitle: 'Fix sink',
          requestStatus: 'notStarted',
          requestDate: '01/01/2023 at 12:00',
        } as MaintenanceRequest);
      } else if (reqId === 'req2') {
        return Promise.resolve({
          requestID: 'req2',
          requestTitle: 'Broken window',
          requestStatus: 'inProgress',
          requestDate: '02/01/2023 at 12:00',
        } as MaintenanceRequest);
      } else if (reqId === 'req3') {
        return Promise.resolve({
          requestID: 'req3',
          requestTitle: 'Leaky roof',
          requestStatus: 'completed',
          requestDate: '03/01/2023 at 12:00',
        } as MaintenanceRequest);
      }
      return Promise.resolve(null);
    });

    const { findByTestId, getByTestId, getAllByTestId } = renderWithNavigation(
      <LandlordDashboard />,
    );

    await findByTestId('LandlordDashboard_ListedResidencesContainer');

    const residenceItems = getAllByTestId(/^LandlordDashboard_ResidenceItem_/);
    expect(residenceItems.length).toBe(2);

    expect(getByTestId('LandlordDashboard_ResidenceName_0')).toHaveTextContent(
      'Residence 1',
    );
    expect(getByTestId('LandlordDashboard_ResidenceName_1')).toHaveTextContent(
      'Residence 2',
    );

    expect(getByTestId('LandlordDashboard_NotStartedIssues')).toHaveTextContent(
      '1 Not Started',
    );
    expect(getByTestId('LandlordDashboard_InProgressIssues')).toHaveTextContent(
      '1 In Progress',
    );
    expect(getByTestId('LandlordDashboard_CompletedIssues')).toHaveTextContent(
      '1 Completed',
    );

    expect(getByTestId('LandlordDashboard_MostRecentIssue')).toHaveTextContent(
      'Leaky roof',
    );
  });

  test('navigates to IssueDetails when most recent issue is pressed', async () => {
    const mockNavigate = jest.fn();
    (Navigation.useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });

    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    mockedGetLandlord.mockResolvedValue({
      userId: mockedUser.uid,
      residenceIds: ['res1'],
    });

    mockedGetResidence.mockResolvedValue({
      residenceName: 'Residence 1',
      apartments: ['apt1'],
    } as Residence);

    mockedGetApartment.mockResolvedValue({
      apartmentName: 'Apartment 1',
      maintenanceRequests: ['req3'],
    } as Apartment);

    mockedGetMaintenanceRequest.mockResolvedValue({
      requestID: 'req3',
      requestTitle: 'Leaky roof',
      requestStatus: 'completed',
      requestDate: '03/01/2023 at 12:00',
    } as MaintenanceRequest);

    const { findByTestId, getByTestId } = renderWithNavigation(
      <LandlordDashboard />,
    );

    await findByTestId('LandlordDashboard_MostRecentIssue');
    const mostRecentTouchable = getByTestId(
      'LandlordDashboard_MostRecentIssue',
    ).parent;

    fireEvent.press(mostRecentTouchable!);

    expect(mockNavigate).toHaveBeenCalledWith('IssueDetails', {
      requestID: 'req3',
    });
  });

  test('renders correctly when there are no maintenance requests', async () => {
    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    mockedGetLandlord.mockResolvedValue({
      userId: mockedUser.uid,
      residenceIds: ['res1'],
    });

    mockedGetResidence.mockResolvedValue({
      residenceName: 'Residence 1',
      apartments: ['apt1'],
    } as Residence);

    mockedGetApartment.mockResolvedValue({
      apartmentName: 'Apartment 1',
      residenceId: 'res1',
      tenants: [],
      maintenanceRequests: [],
      situationReportId: ['situation1'],
    } as Apartment);

    const { getByTestId } = renderWithNavigation(<LandlordDashboard />);

    await waitFor(() => {
      expect(
        getByTestId('LandlordDashboard_NotStartedIssues'),
      ).toHaveTextContent('0 Not Started');
    });

    expect(getByTestId('LandlordDashboard_InProgressIssues')).toHaveTextContent(
      '0 In Progress',
    );
    expect(getByTestId('LandlordDashboard_CompletedIssues')).toHaveTextContent(
      '0 Completed',
    );
    expect(getByTestId('LandlordDashboard_MostRecentIssue')).toHaveTextContent(
      'No recent issues',
    );
  });

  test('renders correctly when there are no residences', async () => {
    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    mockedGetLandlord.mockResolvedValue({
      userId: mockedUser.uid,
      residenceIds: [],
    });

    const { getByTestId } = renderWithNavigation(<LandlordDashboard />);

    await waitFor(() => {
      expect(
        getByTestId('LandlordDashboard_NoResidencesText'),
      ).toHaveTextContent('No residences available');
    });
  });

  // New tests for messages:

  test('displays "You have no messages" when no messages are found', async () => {
    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    // Setup landlord with a residence and request
    mockedGetLandlord.mockResolvedValue({
      userId: mockedUser.uid,
      residenceIds: ['res1'],
    });

    mockedGetResidence.mockResolvedValue({
      residenceName: 'Residence 1',
      apartments: ['apt1'],
    } as Residence);

    mockedGetApartment.mockResolvedValue({
      apartmentName: 'Apartment 1',
      maintenanceRequests: [],
      residenceId: 'res1',
      tenants: [],
      situationReportId: [],
    } as Apartment);

    // No maintenance requests means no chat doc will be found
    // So no messages should appear.
    const { getByTestId } = renderWithNavigation(<LandlordDashboard />);

    await waitFor(() => {
      expect(getByTestId('LandlordDashboard_NoMessagesText')).toHaveTextContent(
        'You have no messages',
      );
    });
  });
});
