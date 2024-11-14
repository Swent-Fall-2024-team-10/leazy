import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import IssueDetailsScreen from '../../screens/issues_tenant/IssueDetailsScreen';
import { getMaintenanceRequest, updateMaintenanceRequest } from '../../../firebase/firestore/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';

// Mock Firebase functions
jest.mock('../../../firebase/firestore/firestore', () => ({
  getMaintenanceRequest: jest.fn(),
  updateMaintenanceRequest: jest.fn(),
}));

// Mock Navigation
const navigateMock = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: navigateMock,
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { requestID: '123' },
  }),
}));

// Mock other components
jest.mock('react-native-elements', () => ({
  Icon: 'Icon',
}));
jest.mock('react-native-feather', () => ({
  MessageSquare: 'MessageSquare',
}));

describe('IssueDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Mock getMaintenanceRequest to delay response
    (getMaintenanceRequest as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { getByText } = render(<IssueDetailsScreen />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders correctly with fetched data', async () => {
    // Mock maintenance request data
    const mockData = {
      requestTitle: 'Leaking Pipe',
      requestStatus: 'inProgress',
      requestDescription: 'Pipe is leaking in the kitchen',
      picture: ['https://via.placeholder.com/400x300'],
    };
    (getMaintenanceRequest as jest.Mock).mockResolvedValue(mockData);

    const { getByText, getByTestId } = render(<IssueDetailsScreen />);

    // Wait for the data to be loaded
    await waitFor(() => expect(getByText('Issue : Leaking Pipe')).toBeTruthy());
    expect(getByText('Pipe is leaking in the kitchen')).toBeTruthy();
    expect(getByText('inProgress')).toBeTruthy();
    expect(getByText('Images submitted')).toBeTruthy();
    expect(getByTestId('saveChangesButton')).toBeTruthy();
  });

  it('navigates to the Messaging screen when "Open chat" button is pressed', async () => {
    // Mock maintenance request data
    const mockData = {
      requestTitle: 'Leaking Pipe',
      requestStatus: 'inProgress',
      requestDescription: 'Pipe is leaking in the kitchen',
      picture: ['https://via.placeholder.com/400x300'],
    };
    (getMaintenanceRequest as jest.Mock).mockResolvedValue(mockData);

    const { getByText } = render(<IssueDetailsScreen />);
    await waitFor(() => expect(getByText('Open chat about this subject')).toBeTruthy());

    fireEvent.press(getByText('Open chat about this subject'));
    expect(navigateMock).toHaveBeenCalledWith('Messaging');
  });

  it('opens full-screen modal when an image is pressed', async () => {
    // Mock maintenance request data with images
    const mockData = {
      requestTitle: 'Leaking Pipe',
      requestStatus: 'inProgress',
      requestDescription: 'Pipe is leaking in the kitchen',
      picture: ['https://via.placeholder.com/400x300'],
    };
    (getMaintenanceRequest as jest.Mock).mockResolvedValue(mockData);

    const { getByTestId, getByText, getByRole } = render(<IssueDetailsScreen />);

    await waitFor(() => expect(getByText('Images submitted')).toBeTruthy());

    // Open full-screen modal by clicking an image
    fireEvent.press(getByRole('button', { name: 'Expand image' })); // Assuming image has an accessibilityLabel of 'Expand image'

    // Expect modal content to be visible
    expect(getByTestId('modal-fullscreen-image')).toBeTruthy();
  });

  it('updates status and description in Firebase when the "Close" button is pressed', async () => {
    // Mock maintenance request data
    const mockData = {
      requestTitle: 'Leaking Pipe',
      requestStatus: 'inProgress',
      requestDescription: 'Pipe is leaking in the kitchen',
      picture: ['https://via.placeholder.com/400x300'],
    };
    (getMaintenanceRequest as jest.Mock).mockResolvedValue(mockData);

    const { getByTestId, getByText } = render(<IssueDetailsScreen />);

    await waitFor(() => expect(getByText('Pipe is leaking in the kitchen')).toBeTruthy());

    // Change status and description
    fireEvent.changeText(getByTestId('statusDropdown'), 'completed');
    fireEvent.changeText(getByTestId('descriptionInput'), 'Fixed the leaking pipe.');

    // Press the "Close" button
    fireEvent.press(getByTestId('saveChangesButton'));

    // Verify that the updateMaintenanceRequest function was called with the correct arguments
    expect(updateMaintenanceRequest).toHaveBeenCalledWith('123', {
      requestStatus: 'completed',
      requestDescription: 'Fixed the leaking pipe.',
    });

    // Verify navigation back to Issues screen
    expect(navigateMock).toHaveBeenCalledWith('Issues');
  });

  it('handles "Issue not found" case when data is null', async () => {
    // Mock getMaintenanceRequest to return null
    (getMaintenanceRequest as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(<IssueDetailsScreen />);

    // Wait for data fetching and expect "Issue not found" message
    await waitFor(() => expect(getByText('Issue not found.')).toBeTruthy());
  });
});
