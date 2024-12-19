// Import React first
import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import ViewNewsfeedScreen from '../screens/newsfeed/ViewNewsfeedScreen';
import { Alert } from 'react-native';
import * as firestore from '../../firebase/firestore/firestore';
import { Timestamp } from 'firebase/firestore';

// Create mock implementation before the jest.mock call
const mockUseEffect = (effect: any, deps?: any[]) => {
  if (deps?.includes('checkExpiredPosts')) {
    return;
  }
};

// Then use the mock
jest.mock('../screens/newsfeed/ViewNewsfeedScreen', () => ({
  __esModule: true,
  default: (props: any) => {
    const original = jest.requireActual(
      '../screens/newsfeed/ViewNewsfeedScreen',
    ).default;
    jest.spyOn(require('react'), 'useEffect').mockImplementation(mockUseEffect);
    return original(props);
  },
}));

// Mock navigation hooks
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    setOptions: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock Timestamp.now() to return a consistent value
const mockNow = {
  seconds: Date.now() / 1000,
  toDate: () => new Date(),
};

jest.mock('firebase/firestore', () => ({
  Timestamp: {
    now: () => mockNow,
  },
}));

// Mock the firestore functions
jest.mock('../../firebase/firestore/firestore', () => ({
  getNewsByReceiver: jest.fn(),
  markNewsAsRead: jest.fn(),
  deleteNews: jest.fn(),
}));

// Update mock news data
const mockNews = [
  {
    maintenanceRequestID: '1',
    id: '1',
    title: 'Urgent Notice',
    content: 'Test content 1',
    type: 'urgent',
    isRead: false,
    createdAt: mockNow,
    ReceiverID: 'all',
    ReadAt: null,
  },
  {
    maintenanceRequestID: '2',
    id: '2',
    title: 'Regular Notice',
    content: 'Test content 2',
    type: 'info',
    isRead: false,
    createdAt: mockNow,
    ReceiverID: 'test-user-id',
    ReadAt: null,
  },
];

// Mock the Auth Context
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    tenant: {
      userId: 'test-user-id',
    },
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('ViewNewsfeedScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset useEffect mock
    jest.spyOn(require('react'), 'useEffect').mockImplementation(mockUseEffect);
    // Make sure getNewsByReceiver returns the correct mock data
    (firestore.getNewsByReceiver as jest.Mock).mockImplementation((receiverId) => 
      Promise.resolve(
        mockNews.filter(news => news.ReceiverID === receiverId || receiverId === 'all')
      )
    );
    // Mock Alert properly
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    // Restore useEffect
    jest.restoreAllMocks();
  });

  const renderAndWait = async () => {
    const result = render(<ViewNewsfeedScreen />);
    await act(async () => {
      await new Promise((resolve) => setImmediate(resolve));
    });
    return result;
  };

  it('renders loading state when tenant is not available', async () => {
    jest
      .spyOn(require('../context/AuthContext'), 'useAuth')
      .mockReturnValueOnce({ tenant: null });

    const { getByText } = await renderAndWait();
    expect(getByText('Setting Up Your Newsfeed')).toBeTruthy();
  });

  it('handles refresh action', async () => {
    const { getByTestId } = await renderAndWait();

    const scrollView = getByTestId('newsfeed-scroll');
    await act(async () => {
      const { refreshControl } = scrollView.props;
      refreshControl.props.onRefresh();
    });

    expect(firestore.getNewsByReceiver).toHaveBeenCalledWith('all');
    expect(firestore.getNewsByReceiver).toHaveBeenCalledWith('test-user-id');
  });

  it('shows "Nothing new to show" when no news available', async () => {
    (firestore.getNewsByReceiver as jest.Mock).mockResolvedValue([]);
    const { findAllByText } = await renderAndWait();
    const emptyMessages = await findAllByText('Nothing new to show');
    expect(emptyMessages.length).toBeGreaterThan(0);
  });

  it('filters out old read posts correctly', async () => {
    const oldReadNews = {
      ...mockNews[1],
      ReadAt: { 
        seconds: mockNow.seconds - 601, // Older than 10 minutes
        toDate: () => new Date(mockNow.seconds * 1000 - 601000)
      }
    };
    
    const newsWithOldRead = [mockNews[0], oldReadNews];
    (firestore.getNewsByReceiver as jest.Mock).mockResolvedValue(newsWithOldRead);
    
    const { queryByText } = await renderAndWait();
    expect(queryByText('Regular Notice')).toBeNull();
  });
});