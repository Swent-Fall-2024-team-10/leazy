jest.mock('../../firebase/firebase', () => {
  return {
    db: {},
    auth: {},
  };
});

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
  getUser,
} from '../../firebase/firestore/firestore';
import { NavigationContainer } from '@react-navigation/native';
import {
  TUser,
  Residence,
  Apartment,
  MaintenanceRequest,
} from '../../types/types';
import { User as FirebaseUser } from 'firebase/auth';
import {
  getDoc,
  getDocs,
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';

jest.mock('../context/AuthContext');
jest.mock('../../firebase/firestore/firestore');
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(),
}));

// Mocking firestore methods to prevent "is not a function" errors
jest.mock('firebase/firestore', () => {
  const original = jest.requireActual('firebase/firestore');
  return {
    ...original,
    getDoc: jest.fn().mockResolvedValue({ exists: () => false }),
    getDocs: jest.fn().mockResolvedValue({ empty: true, docs: [] }),
    collection: jest.fn((...args) => args),
    doc: jest.fn((...args) => args),
    query: jest.fn((...args) => args),
    where: jest.fn((...args) => ({ type: 'where', args })),
    orderBy: jest.fn((...args) => ({ type: 'orderBy', args })),
    limit: jest.fn((...args) => ({ type: 'limit', args })),
  };
});

const consoleSpy = {
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
};

const mockGetDoc = getDoc as jest.Mock;
const mockGetDocs = getDocs as jest.Mock;

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
const mockedGetUser = getUser as jest.MockedFunction<typeof getUser>;

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

  const mockedMessageData = (
    content: string,
    sentOn: number,
    sentBy: string,
  ) => ({
    content,
    sentOn,
    sentBy,
  });

  const mockMessageDocs = (docsData: any[]) => {
    return {
      empty: docsData.length === 0,
      docs: docsData.map((data, idx) => ({
        id: `msg${idx}`,
        data: () => data,
      })),
    };
  };

  const mockLandlordWithRequests = () => {
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
      maintenanceRequests: ['req1'],
      residenceId: 'res1',
      tenants: [],
      situationReportId: [],
    } as Apartment);

    mockedGetMaintenanceRequest.mockResolvedValue({
      requestID: 'req1',
      requestTitle: 'Leaky faucet',
      requestStatus: 'inProgress',
      requestDate: '04/01/2023 at 12:00',
    } as MaintenanceRequest);
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
    expect(residenceItems).toHaveLength(2);

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

    const { getByTestId } = renderWithNavigation(<LandlordDashboard />);

    await waitFor(() => {
      expect(getByTestId('LandlordDashboard_NoMessagesText')).toHaveTextContent(
        'You have no messages',
      );
    });
  });

  test('fetches and displays the latest message normally', async () => {
    mockLandlordWithRequests();

    // docSnapshot exists
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
    });

    // Primary query returns one message
    mockGetDocs.mockResolvedValueOnce(
      mockMessageDocs([
        mockedMessageData('Hello from tenant', 1690000000000, 'tenant123'),
      ]),
    );

    const mockNavigate = jest.fn();
    (Navigation.useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });

    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    const { findByTestId, getByTestId } = renderWithNavigation(
      <LandlordDashboard />,
    );

    await findByTestId('LandlordDashboard_NewMessagesContainer');
    expect(getByTestId('LandlordDashboard_MessageText_0')).toHaveTextContent(
      'Hello from tenant',
    );
  });

  test('falls back to the catch block query when main query fails', async () => {
    mockLandlordWithRequests();

    // docSnapshot exists
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
    });

    // Primary query throws an error
    mockGetDocs.mockImplementationOnce(() => {
      throw new Error('Primary query failed');
    });

    // Fallback query returns one message
    mockGetDocs.mockResolvedValueOnce(
      mockMessageDocs([
        mockedMessageData('Fallback message', 1690000001000, 'tenant456'),
      ]),
    );

    // getUser returns a name for tenant456
    mockedGetUser.mockResolvedValue({
      uid: 'tenant-uid',
      type: 'tenant',
      name: 'Tenant User',
      email: 'tenantuser@example.com',
      phone: '123456789',
      street: 'Tenant Street',
      number: '10',
      city: 'Tenant City',
      canton: 'Tenant Canton',
      zip: '12345',
      country: 'Tenant Country',
    });

    const mockNavigate = jest.fn();
    (Navigation.useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });

    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    const { findByTestId, getByTestId } = renderWithNavigation(
      <LandlordDashboard />,
    );

    await findByTestId('LandlordDashboard_NewMessagesContainer');
    expect(getByTestId('LandlordDashboard_MessageText_0')).toHaveTextContent(
      'Fallback message',
    );
    expect(getByTestId('LandlordDashboard_MessageText_0')).toHaveTextContent(
      'From Tenant User:',
    );
  });

  test('displays no messages if fetchLastMessage returns null (no messages found)', async () => {
    mockLandlordWithRequests();

    // docSnapshot exists but no messages
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
    });

    // Primary query returns empty
    mockGetDocs.mockResolvedValueOnce(mockMessageDocs([]));

    const mockNavigate = jest.fn();
    (Navigation.useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });

    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    const { findByTestId, getByTestId } = renderWithNavigation(
      <LandlordDashboard />,
    );

    await findByTestId('LandlordDashboard_NewMessagesContainer');
    expect(getByTestId('LandlordDashboard_NoMessagesText')).toHaveTextContent(
      'You have no messages',
    );
  });

  test('tests handleRefresh by mocking a message after refresh', async () => {
    mockLandlordWithRequests();

    // First load: no messages
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
    });
    mockGetDocs.mockResolvedValueOnce(mockMessageDocs([]));

    const mockNavigate = jest.fn();
    (Navigation.useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });

    mockedUseAuth.mockReturnValue({
      ...mockedAuthContext,
    });

    const { findByTestId, getByTestId } = renderWithNavigation(
      <LandlordDashboard />,
    );

    await findByTestId('LandlordDashboard_NewMessagesContainer');
    expect(getByTestId('LandlordDashboard_NoMessagesText')).toHaveTextContent(
      'You have no messages',
    );

    // After refresh, new message appears
    mockGetDocs.mockReset();
    mockGetDocs.mockResolvedValueOnce(
      mockMessageDocs([
        mockedMessageData('Refreshed message', 1690000002000, 'tenant789'),
      ]),
    );

    const refreshButton = getByTestId('testRefreshButton');
    fireEvent.press(refreshButton);
  });
});