import React from 'react';

// Mock Firebase config
jest.mock('../../../../firebase/firebase', () => ({
  db: {},
  auth: {}
}));

// Mock navigation hooks
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      setOptions: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});
import { Alert } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import NewsfeedScreen, { isPostVisible, deduplicateNews, NewsfeedSection } from '../../../screens/newsfeed/ViewNewsfeedScreen';
import { getNewsByReceiver, markNewsAsRead, deleteNews } from '../../../../firebase/firestore/firestore';
import { useAuth } from '../../../context/AuthContext';
import { News } from '../../../../types/types';

// Mock Firebase initialization and core functionality
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({
    name: '[DEFAULT]',
    options: {},
  }))
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn()
}));

// Mock Firebase Firestore
const mockTimestamp = {
  seconds: Date.now() / 1000,
  toDate: () => new Date(),
};

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({
    type: 'firestore-mock',
    toJSON: () => ({})
  })),
  Timestamp: {
    now: () => mockTimestamp,
    fromDate: (date: Date) => ({
      seconds: Math.floor(date.getTime() / 1000),
      toDate: () => date
    })
  }
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  }
}));

// Mock other dependencies
jest.mock('../../../../firebase/firestore/firestore');
jest.mock('../../../context/AuthContext');
jest.mock('react-native/Libraries/Alert/Alert', () => ({ alert: jest.fn() }));

const mockTenant = {
  userId: 'test-user-id',
};

const createMockNews = (override = {}): News => ({
  maintenanceRequestID: 'test-id-1',
  type: 'normal',
  title: 'Test News',
  content: 'Test content',
  isRead: false,
  createdAt: mockTimestamp as Timestamp,
  ReceiverID: 'all',
  ReadAt: null,
  ...override
});

describe('NewsfeedScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ tenant: mockTenant });
    (getNewsByReceiver as jest.Mock).mockResolvedValue([]);
  });

  describe('News Display', () => {
    const mockGeneralNews = [createMockNews()];
    const mockPersonalNews = [createMockNews({ ReceiverID: mockTenant.userId })];

    beforeEach(() => {
      (getNewsByReceiver as jest.Mock)
        .mockImplementation((receiverId) => 
          Promise.resolve(receiverId === 'all' ? mockGeneralNews : mockPersonalNews)
        );
    });

    it('should display both general and personal news sections', async () => {
      const { getByText } = render(<NewsfeedScreen />);
      
      await waitFor(() => {
        expect(getByText('Important information regarding your residence')).toBeTruthy();
        expect(getByText('Updates for you')).toBeTruthy();
      });
    });

    it('should show "Nothing new to show" when no visible news', async () => {
      (getNewsByReceiver as jest.Mock).mockResolvedValue([]);
      const { getAllByText } = render(<NewsfeedScreen />);
      
      await waitFor(() => {
        const emptyMessages = getAllByText('Nothing new to show');
        expect(emptyMessages.length).toBe(2);
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh news when pull-to-refresh is triggered', async () => {
      const { getByTestId } = render(<NewsfeedScreen />);
      
      await waitFor(() => {
        const scrollView = getByTestId('newsfeed-scroll');
        const { refreshControl } = scrollView.props;
        act(() => {
          refreshControl.props.onRefresh();
        });
      });

      // Called twice initially (for 'all' and personal) and twice again for refresh
      expect(getNewsByReceiver).toHaveBeenCalledTimes(4); 
    });
  });

  describe('Error Handling', () => {
    it('should show error alert when news fetch fails', async () => {
      (getNewsByReceiver as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
      
      render(<NewsfeedScreen />);
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Failed to fetch news. Please pull down to refresh and try again.'
        );
      });
    });
  });

  describe('Utility Functions', () => {
    describe('isPostVisible', () => {
      it('should return true for unread posts', () => {
        const unreadNews = createMockNews({ isRead: false });
        expect(isPostVisible(unreadNews)).toBe(true);
      });

      it('should return true for recently read posts', () => {
        const recentlyReadNews = createMockNews({
          isRead: true,
          ReadAt: {
            seconds: Math.floor(Date.now() / 1000) - (5 * 60),
            toDate: () => new Date(Date.now() - 5 * 60 * 1000)
          }
        });
        expect(isPostVisible(recentlyReadNews)).toBe(true);
      });

      it('should return false for old read posts', () => {
        const oldReadNews = createMockNews({
          isRead: true,
          ReadAt: {
            seconds: Math.floor(Date.now() / 1000) - (15 * 60),
            toDate: () => new Date(Date.now() - 15 * 60 * 1000)
          }
        });
        expect(isPostVisible(oldReadNews)).toBe(false);
      });
    });
  });

  // Add additional tests here, taken from the second file
  describe('Additional Tests (from second file)', () => {
    it('renders loading state when tenant is not available', async () => {
      // Override the Auth mock for this test
      (useAuth as jest.Mock).mockReturnValueOnce({ tenant: null });
      const { getByText } = render(<NewsfeedScreen />);
      await waitFor(() => {
        expect(getByText('Setting Up Your Newsfeed')).toBeTruthy();
      });
    });

    it('handles refresh action (additional test)', async () => {
      // This test is similar to what we have, but we'll just confirm behavior again
      const { getByTestId } = render(<NewsfeedScreen />);
      await waitFor(() => {
        const scrollView = getByTestId('newsfeed-scroll');
        const { refreshControl } = scrollView.props;
        act(() => {
          refreshControl.props.onRefresh();
        });
      });

      // Expect getNewsByReceiver called again for 'all' and personal after refresh
      // The initial call has already happened (2 calls), plus 2 more now
      expect(getNewsByReceiver).toHaveBeenCalledTimes(4);
    });
  });

  // Test for lines 157-175 (loading state)
  describe('Loading State', () => {
    it('should show loading state with correct messages', () => {
      (useAuth as jest.Mock).mockReturnValueOnce({ tenant: null });
      
      const { getByText } = render(<NewsfeedScreen />);
      
      expect(getByText('Setting Up Your Newsfeed')).toBeTruthy();
      expect(getByText(/We're getting your latest updates/)).toBeTruthy();
    });
  });

  // Test for lines 181-182 (refresh handling)
  describe('Refresh Handling', () => {
    it('should handle refresh completion', async () => {
      const { getByTestId } = render(<NewsfeedScreen />);
      
      let refreshingState = false;
      
      await act(async () => {
        const scrollView = getByTestId('newsfeed-scroll');
        const { refreshControl } = scrollView.props;
        refreshingState = refreshControl.props.refreshing;
        refreshControl.props.onRefresh();
      });
      
      expect(refreshingState).toBe(false);
    });
  });

  describe('deduplicateNews', () => {
    it('should remove duplicate news items', () => {
      const mockNews = [
        createMockNews({ content: 'Test 1', createdAt: { seconds: 100 } }),
        createMockNews({ content: 'Test 1', createdAt: { seconds: 100 } }), // Duplicate
        createMockNews({ content: 'Test 2', createdAt: { seconds: 200 } })
      ];
      
      const result = deduplicateNews(mockNews);
      expect(result.length).toBe(2);
      expect(result.map((n: News) => n.content)).toEqual(['Test 1', 'Test 2']);
    });
  });

  // Test for lines 81-100 (NewsfeedSection component empty state)
  describe('NewsfeedSection', () => {
    it('should display empty state when no visible news', () => {
      const { getByText } = render(
        <NewsfeedSection 
          title="Test Section" 
          news={[]} 
          onNewsPress={() => {}}
        />
      );
      
      expect(getByText('Nothing new to show')).toBeTruthy();
    });
  });

  describe('handleNewsPress', () => {
    it('should handle urgent news acknowledgment', async () => {
      // Create urgent news item
      const mockUrgentNews = createMockNews({ 
        type: 'urgent',
        maintenanceRequestID: 'urgent-123'
      });
  
      // Mock the getNewsByReceiver to return our urgent news
      (getNewsByReceiver as jest.Mock).mockImplementation((receiverId) => 
        Promise.resolve(receiverId === 'all' ? [mockUrgentNews] : [])
      );
  
      // Mock markNewsAsRead to resolve successfully
      (markNewsAsRead as jest.Mock).mockResolvedValue(undefined);
  
      // Render the component
      const { getByTestId } = render(<NewsfeedScreen />);
  
      // Wait for the news to be loaded and rendered
      await waitFor(() => {
        const newsItem = getByTestId(`news-item-${mockUrgentNews.maintenanceRequestID}`);
        expect(newsItem).toBeTruthy();
      });
  
      // Trigger the press event
      const newsItem = getByTestId(`news-item-${mockUrgentNews.maintenanceRequestID}`);
      await act(async () => {
        fireEvent.press(newsItem);
      });
  
      // Verify the alert was shown
      expect(Alert.alert).toHaveBeenCalledWith(
        'Important Notice Acknowledged',
        'You have marked this urgent notification as read.'
      );
    });
  
    it('should handle error when marking news as read', async () => {
      // Create news item
      const mockNews = createMockNews({ 
        maintenanceRequestID: 'error-123'
      });
  
      // Mock getNewsByReceiver to return our news
      (getNewsByReceiver as jest.Mock).mockImplementation((receiverId) => 
        Promise.resolve(receiverId === 'all' ? [mockNews] : [])
      );
  
      // Mock markNewsAsRead to reject
      (markNewsAsRead as jest.Mock).mockRejectedValue(new Error('Failed to mark as read'));
  
      // Render the component
      const { getByTestId } = render(<NewsfeedScreen />);
  
      // Wait for the news to be loaded and rendered
      await waitFor(() => {
        const newsItem = getByTestId(`news-item-${mockNews.maintenanceRequestID}`);
        expect(newsItem).toBeTruthy();
      });
  
      // Trigger the press event
      const newsItem = getByTestId(`news-item-${mockNews.maintenanceRequestID}`);
      await act(async () => {
        fireEvent.press(newsItem);
      });
  
      // Verify error alert was shown
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to mark notification as read. Please try again.'
      );
    });
  });
});
