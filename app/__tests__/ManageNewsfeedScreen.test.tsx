import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import NewsfeedManagementScreen from '../screens/NewsfeedManagementScreen';
import * as firestoreModule from '../../firebase/firestore/firestore';
import { Timestamp } from 'firebase/firestore';

// Mock Timestamp.now() functionality
const mockTimestamp = {
  seconds: Math.floor(Date.now() / 1000),
  nanoseconds: 0,
  toDate: () => new Date(),
  valueOf: () => Date.now(),
};

jest.mock('firebase/firestore', () => ({
  Timestamp: {
    now: () => mockTimestamp,
    fromMillis: (milliseconds: number) => ({
      toDate: () => new Date(milliseconds),
      seconds: Math.floor(milliseconds / 1000),
      nanoseconds: (milliseconds % 1000) * 1000000,
    }),
  },
}));

jest.mock('../../firebase/firestore/firestore');
const mockFirestore = firestoreModule as jest.Mocked<typeof firestoreModule>;

// Mock the Header component
jest.mock('../../../app/components/Header', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('NewsfeedManagementScreen', () => {
  const mockNews = [
    {
      maintenanceRequestID: 'news_1',
      title: 'Test News',
      content: 'Test Content',
      type: 'informational',
      isRead: false,
      createdAt: mockTimestamp,
      UpdatedAt: mockTimestamp,
      ReadAt: mockTimestamp,
      images: [],
      ReceiverID: 'all',
      SenderID: 'landlord'
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFirestore.getNewsByReceiver.mockResolvedValue(mockNews);
    mockFirestore.createNews.mockResolvedValue(undefined);
    mockFirestore.deleteNews.mockResolvedValue(undefined);
    mockFirestore.updateNews.mockResolvedValue(undefined);
  });

  it('renders correctly with initial news items', async () => {
    const { getByText } = renderWithNavigation(<NewsfeedManagementScreen />);
    
    await waitFor(() => {
      expect(getByText('Newsfeed management')).toBeTruthy();
      expect(getByText('Test News')).toBeTruthy();
      expect(getByText('Test Content')).toBeTruthy();
    });
  });

  it('opens modal when add news button is pressed', async () => {
    const { getByText, getByTestId } = renderWithNavigation(<NewsfeedManagementScreen />);
    
    await waitFor(() => {
      fireEvent.press(getByTestId('add-news-button'));
      expect(getByText('Add to the residence Newsfeed')).toBeTruthy();
    });
  });

  it('creates new news successfully', async () => {
    const { getByTestId, getByPlaceholderText, getByText } = renderWithNavigation(<NewsfeedManagementScreen />);
    
    await waitFor(() => {
      fireEvent.press(getByTestId('add-news-button'));
    });
    
    fireEvent.changeText(getByPlaceholderText('Enter title'), 'New Test Title');
    fireEvent.changeText(getByPlaceholderText('What would you like to announce?'), 'New Test Content');
    
    await waitFor(() => {
      fireEvent.press(getByText('Add to newsfeed'));
    });

    await waitFor(() => {
      expect(mockFirestore.createNews).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Title',
          content: 'New Test Content',
          type: 'informational'
        })
      );
    });
  });

  it('updates existing news successfully', async () => {
    const { getByPlaceholderText, getByText } = renderWithNavigation(<NewsfeedManagementScreen />);
    
    await waitFor(() => {
      const editButtons = document.querySelectorAll('[data-testid="edit-news-button"]');
      if (editButtons.length > 0) {
        fireEvent.press(editButtons[0]);
      }
    });
    
    fireEvent.changeText(getByPlaceholderText('Enter title'), 'Updated Title');
    fireEvent.changeText(getByPlaceholderText('What would you like to announce?'), 'Updated Content');
    
    await waitFor(() => {
      fireEvent.press(getByText('Add to newsfeed'));
    });

    expect(mockFirestore.updateNews).toHaveBeenCalledWith(
      'news_1',
      expect.objectContaining({
        title: 'Updated Title',
        content: 'Updated Content'
      })
    );
  });

  it('deletes news successfully', async () => {
    const { getByTestId } = renderWithNavigation(<NewsfeedManagementScreen />);
    
    await waitFor(() => {
      const deleteButton = getByTestId('delete-news-button');
      fireEvent.press(deleteButton);
    });

    await waitFor(() => {
      expect(mockFirestore.deleteNews).toHaveBeenCalledWith('news_1');
    });
  });

  it('toggles between urgent and informational news type', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = renderWithNavigation(<NewsfeedManagementScreen />);
    
    await waitFor(() => {
      fireEvent.press(getByTestId('add-news-button'));
    });
    
    fireEvent.changeText(getByPlaceholderText('Enter title'), 'Test Title');
    fireEvent.changeText(getByPlaceholderText('What would you like to announce?'), 'Test Content');
    
    await waitFor(() => {
      fireEvent.press(getByText('Set as urgent'));
      fireEvent.press(getByText('Add to newsfeed'));
    });

    expect(mockFirestore.createNews).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'urgent'
      })
    );
  });

  it('disables submit button when title or content is empty', async () => {
    const { getByTestId, getByText } = renderWithNavigation(<NewsfeedManagementScreen />);
    
    await waitFor(() => {
      fireEvent.press(getByTestId('add-news-button'));
    });

    expect(getByText('Add to newsfeed').props.disabled).toBeTruthy();
  });

  it('fetches news on component mount', async () => {
    renderWithNavigation(<NewsfeedManagementScreen />);
    
    await waitFor(() => {
      expect(mockFirestore.getNewsByReceiver).toHaveBeenCalledWith('all');
    });
  });
});