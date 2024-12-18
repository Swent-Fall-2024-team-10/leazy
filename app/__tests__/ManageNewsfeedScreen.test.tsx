import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ManageNewsfeedScreen from '../screens/newsfeed/ManageNewsfeedScreen';
import { useAuth } from '../context/AuthContext';
import {
  createNews,
  deleteNews,
  getNewsByReceiver,
} from '../../firebase/firestore/firestore';

// Mock Firebase and Firestore
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApp: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  Timestamp: {
    now: () => ({
      toDate: () => new Date(),
      seconds: 1234567890,
      nanoseconds: 123456789,
    }),
  },
}));

// Add console.error mock
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Mock the entire firebase module
jest.mock('../../firebase/firebase', () => ({
  db: {},
  auth: {},
}));

// Mock dependencies
jest.mock('../context/AuthContext');
jest.mock('../../firebase/firestore/firestore', () => ({
  createNews: jest.fn(),
  updateNews: jest.fn(),
  deleteNews: jest.fn(),
  getNewsByReceiver: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('ManageNewsFeedScreen', () => {
  const mockUser = { uid: 'test-uid' };
  const mockNewsItems = [
    {
      maintenanceRequestID: '1',
      title: 'Test News 1',
      content: 'Content 1',
      createdAt: { toDate: () => new Date() },
      type: 'informational',
    },
    {
      maintenanceRequestID: '2',
      title: 'Test News 2',
      content: 'Content 2',
      createdAt: { toDate: () => new Date() },
      type: 'urgent',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (getNewsByReceiver as jest.Mock).mockResolvedValue(mockNewsItems);
  });

  it('renders correctly with news items', async () => {
    const { getByText, findByText } = render(<ManageNewsfeedScreen />);

    // Verify the screen title is present
    expect(getByText('Newsfeed management')).toBeTruthy();

    // Wait for news items to load and verify they're displayed
    await findByText('Test News 1');
    await findByText('Test News 2');
  });

  it('handles adding new news item', async () => {
    const { getByTestId, getByText } = render(<ManageNewsfeedScreen />);

    // Open add news modal
    fireEvent.press(getByTestId('add-news-button'));

    // Fill in the form
    fireEvent.changeText(getByTestId('title-input'), 'New Test News');
    fireEvent.changeText(getByTestId('content-input'), 'New Test Content');

    // Test urgent/informational selection
    fireEvent.press(getByTestId('urgent-button'));
    fireEvent.press(getByTestId('informational-button'));

    // Submit the form using the "Add to newsfeed" button
    const submitButton = getByText('Add to newsfeed');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(createNews).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test News',
          content: 'New Test Content',
          type: 'informational',
        }),
      );
    });
  });

  it('handles deleting news item', async () => {
    const { getAllByTestId, findByText } = render(<ManageNewsfeedScreen />);

    // Wait for the news items to load
    await findByText('Test News 1');

    // Find and click delete button
    const deleteButtons = getAllByTestId('delete-news-button');
    fireEvent.press(deleteButtons[0]);

    // Verify delete function was called
    await waitFor(() => {
      expect(deleteNews).toHaveBeenCalledWith('1');
    });
  });

  it('validates form inputs before submission', async () => {
    const { getByTestId, getByText } = render(<ManageNewsfeedScreen />);

    // Open add news modal
    fireEvent.press(getByTestId('add-news-button'));

    // Get the submit button and verify initial disabled state
    const submitButton = getByTestId('submit-button');
    expect(submitButton.props.accessibilityState.disabled).toBe(true);

    // Fill only title
    fireEvent.changeText(getByTestId('title-input'), 'Test Title');

    // Button should still be disabled
    expect(submitButton.props.accessibilityState.disabled).toBe(true);

    // Fill content
    fireEvent.changeText(getByTestId('content-input'), 'Test Content');

    // Button should be enabled
    expect(submitButton.props.accessibilityState.disabled).toBe(false);
  });

  it('toggles between urgent and informational news types', async () => {
    const { getByTestId, getByText } = render(<ManageNewsfeedScreen />);

    // Open add news modal
    fireEvent.press(getByTestId('add-news-button'));

    // Test urgent selection
    fireEvent.press(getByTestId('urgent-button'));
    fireEvent.changeText(getByTestId('title-input'), 'Urgent News');
    fireEvent.changeText(getByTestId('content-input'), 'Urgent Content');

    const submitButton = getByText('Add to newsfeed');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(createNews).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'urgent',
          title: 'Urgent News',
          content: 'Urgent Content',
        }),
      );
    });
  });

  it('handles error when adding news item', async () => {
    (createNews as jest.Mock).mockRejectedValue(
      new Error('Failed to add news'),
    );

    const { getByTestId, getByText } = render(<ManageNewsfeedScreen />);

    // Open add news modal
    fireEvent.press(getByTestId('add-news-button'));

    // Fill in the form
    fireEvent.changeText(getByTestId('title-input'), 'Test Title');
    fireEvent.changeText(getByTestId('content-input'), 'Test Content');

    // Submit the form
    const submitButton = getByText('Add to newsfeed');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error creating news:',
        expect.any(Error),
      );
    });
  });
});
