import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ManageNewsfeedScreen from '../screens/newsfeed/ManageNewsfeedScreen';
import { useAuth } from '../context/AuthContext';
import {
  createNews,
  deleteNews,
  getNewsByReceiver,
  updateNews,
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
  const mockLandlord = { userId: 'test-uid' };
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
    (useAuth as jest.Mock).mockReturnValue({ landlord: mockLandlord });
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
          SenderID: 'test-uid',
        }),
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'News post created successfully!',
        expect.any(Array),
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

    // Verify delete confirmation dialog
    expect(Alert.alert).toHaveBeenCalledWith(
      'Confirm Delete',
      'Are you sure you want to delete this news post?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Delete' }),
      ]),
    );

    // Get the delete confirmation dialog and simulate pressing delete
    const [[, , buttons]] = (Alert.alert as jest.Mock).mock.calls;
    const deleteButton = buttons.find(
      (button: any) => button.text === 'Delete',
    );
    await deleteButton.onPress();

    await waitFor(() => {
      expect(deleteNews).toHaveBeenCalledWith('1');
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'News post deleted successfully!',
        expect.any(Array),
      );
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
          SenderID: 'test-uid',
        }),
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'News post created successfully!',
        expect.any(Array),
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
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Unable to create news post. Please try again.',
        expect.any(Array),
      );
    });
  });

  it('handles missing landlord information', async () => {
    // Mock useAuth to return null landlord
    (useAuth as jest.Mock).mockReturnValue({ landlord: null });

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
      expect(createNews).toHaveBeenCalledWith(
        expect.objectContaining({
          SenderID: 'landlord',
        }),
      );
    });
  });

  it('shows error alert when fetching news fails', async () => {
    (getNewsByReceiver as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch'),
    );

    render(<ManageNewsfeedScreen />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Unable to fetch news items. Please try again later.',
        expect.any(Array),
      );
    });
  });

  it('shows success alert when updating news item', async () => {
    const { getAllByTestId, getByTestId, getByText, findByText } = render(
      <ManageNewsfeedScreen />,
    );
    await findByText('Test News 1');

    // Click edit button
    const editButtons = getAllByTestId('edit-news-button');
    fireEvent.press(editButtons[0]);

    // Update the news item
    fireEvent.changeText(getByTestId('title-input'), 'Updated Title');
    fireEvent.changeText(getByTestId('content-input'), 'Updated Content');
    fireEvent.press(getByText('Add to newsfeed'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'News post updated successfully!',
        expect.any(Array),
      );
    });
  });

  it('shows error alert when updating news item fails', async () => {
    (updateNews as jest.Mock).mockRejectedValue(new Error('Failed to update'));

    const { getAllByTestId, getByTestId, getByText, findByText } = render(
      <ManageNewsfeedScreen />,
    );
    await findByText('Test News 1');

    // Click edit button
    const editButtons = getAllByTestId('edit-news-button');
    fireEvent.press(editButtons[0]);

    // Update the news item
    fireEvent.changeText(getByTestId('title-input'), 'Updated Title');
    fireEvent.changeText(getByTestId('content-input'), 'Updated Content');
    fireEvent.press(getByText('Add to newsfeed'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Unable to update news post. Please try again.',
        expect.any(Array),
      );
    });
  });

  it('displays long text correctly in news item list', async () => {
    // Create a mock news item with long text
    const longTextNews = {
      maintenanceRequestID: '3',
      title: 'This is a very long title that could potentially overflow',
      content:
        'This is a very long content that contains multiple paragraphs and could potentially cause layout issues. eoqrhféqeuabféq3wubflsa ubqwel fulqweuaf',
      createdAt: { toDate: () => new Date() },
      type: 'informational',
    };

    // Add the long text news item to mock data
    const mockNewsWithLongText = [...mockNewsItems, longTextNews];
    (getNewsByReceiver as jest.Mock).mockResolvedValue(mockNewsWithLongText);

    const { findByText, getByText } = render(<ManageNewsfeedScreen />);

    // Wait for the long text news item to be displayed
    await findByText(longTextNews.title);

    // Verify the content is also displayed
    expect(getByText(longTextNews.content)).toBeTruthy();
  });

  it('handles editing news item with long text', async () => {
    // Mock successful update
    (updateNews as jest.Mock).mockResolvedValue(undefined);

    const { getAllByTestId, getByTestId, getByText, findByText } = render(
      <ManageNewsfeedScreen />,
    );
    await findByText('Test News 1');

    // Click edit button
    const editButtons = getAllByTestId('edit-news-button');
    fireEvent.press(editButtons[0]);

    // Create long text strings
    const longTitle =
      'This is a very long title that could potentially overflow';
    const longContent =
      'This is a very long content that contains multiple paragraphs and could potentially cause layout issues. eoqrhféqeuabféq3wubflsa ubqwel fulqweuaf';

    // Update with long text
    fireEvent.changeText(getByTestId('title-input'), longTitle);
    fireEvent.changeText(getByTestId('content-input'), longContent);
    fireEvent.press(getByText('Add to newsfeed'));

    await waitFor(() => {
      expect(updateNews).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          title: longTitle,
          content: longContent,
          type: 'informational',
          isRead: false,
          ReceiverID: 'all',
          createdAt: expect.any(Object),
          UpdatedAt: expect.any(Object),
          ReadAt: expect.any(Object),
        }),
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'News post updated successfully!',
        expect.any(Array),
      );
    });
  });
});
