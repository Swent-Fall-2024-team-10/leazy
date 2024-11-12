import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import ReportScreen from '../screens/issues_tenant/ReportScreen'; // Adjust import according to your file structure
import { NavigationProp } from '@react-navigation/native';
import { db, auth } from '@/firebase/firebase'; // Import the Firebase functions if needed

// Mock necessary Firebase functions
jest.mock('../../firebase/firestore/firestore', () => ({
  getUser: jest.fn(),
  getTenant: jest.fn(),
  updateTenant: jest.fn(),
  updateMaintenanceRequest: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
}));

jest.mock('../context/PictureContext', () => ({
  usePictureContext: jest.fn(() => ({
    pictureList: ['fakePic1', 'fakePic2'],
    resetPictureList: jest.fn(),
  })),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('ReportScreen', () => {
  let navigation: NavigationProp<any>;

  beforeEach(() => {
    // Mock navigation prop
    navigation = {
      navigate: jest.fn(),
    } as unknown as NavigationProp<any>;

    jest.mock('@react-navigation/native', () => ({
        useNavigation: jest.fn(),
      }));

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should render the ReportScreen and display form elements', () => {
    render(<ReportScreen />);

    // Check if input fields, buttons, and other UI elements are rendered
    expect(screen.getByTestId('testIssueNameField')).toBeTruthy();
    expect(screen.getByTestId('testRoomNameField')).toBeTruthy();
    expect(screen.getByTestId('testDescriptionField')).toBeTruthy();
    expect(screen.getByText('Submit')).toBeTruthy();
  });

  it('should call handleSubmit on Submit button press', async () => {
    const mockGetUser = require('@/firebase/firestore/firestore').getUser;
    const mockGetTenant = require('@/firebase/firestore/firestore').getTenant;
    const mockAddDoc = require('firebase/firestore').addDoc;
    const mockUpdateTenant = require('@/firebase/firestore/firestore').updateTenant;
    const mockUpdateMaintenanceRequest = require('@/firebase/firestore/firestore').updateMaintenanceRequest;

    mockGetUser.mockResolvedValue({ user: { userUID: 'user123' }, userUID: 'user123' });
    mockGetTenant.mockResolvedValue({ tenant: { userId: 'user123', apartmentId: 'apt123' }, tenantUID: 'tenant123' });
    mockAddDoc.mockResolvedValue({ id: 'request123' });
    mockUpdateTenant.mockResolvedValue(true);
    mockUpdateMaintenanceRequest.mockResolvedValue(true);

    render(<ReportScreen />);

    // Fill in the form
    fireEvent.changeText(screen.getByTestId('testIssueNameField'), 'Leaky faucet');
    fireEvent.changeText(screen.getByTestId('testRoomNameField'), 'Kitchen');
    fireEvent.changeText(screen.getByTestId('testDescriptionField'), 'The faucet is leaking water.');

    // Press the Submit button
    fireEvent.press(screen.getByText('Submit'));

    // Wait for the submission to complete
    await waitFor(() => expect(mockAddDoc).toHaveBeenCalledTimes(1));
    expect(mockGetUser).toHaveBeenCalledWith(auth.currentUser?.uid);
    expect(mockGetTenant).toHaveBeenCalledTimes(1);
    expect(mockAddDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      requestTitle: 'Leaky faucet',
      requestDescription: 'The faucet is leaking water.',
    }));
    expect(mockUpdateTenant).toHaveBeenCalledTimes(1);
    expect(mockUpdateMaintenanceRequest).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).toHaveBeenCalledWith('Issues');
  });

  it('should show an error alert if user or tenant is not found', async () => {
    const mockGetUser = require('@/firebase/firestore/firestore').getUser;
    const mockGetTenant = require('@/firebase/firestore/firestore').getTenant;

    mockGetUser.mockResolvedValue(null); // Simulate user not found

    render(<ReportScreen />);

    // Fill in the form
    fireEvent.changeText(screen.getByTestId('testIssueNameField'), 'Leaky faucet');
    fireEvent.changeText(screen.getByTestId('testRoomNameField'), 'Kitchen');
    fireEvent.changeText(screen.getByTestId('testDescriptionField'), 'The faucet is leaking water.');

    // Press the Submit button
    fireEvent.press(screen.getByText('Submit'));

    // Wait for the alert to be called
    await waitFor(() => expect(mockGetUser).toHaveBeenCalledTimes(1));

    // Check for alert display (you can spy on the alert if you want)
    expect(screen.getByText('Error')).toBeTruthy();
    expect(screen.getByText('User not found')).toBeTruthy();
  });

  it('should navigate to "CameraScreen" when Camera button is pressed', () => {
    render(<ReportScreen />);

    fireEvent.press(screen.getByText('Please take a picture of the damage or situation if applicable'));

    expect(navigation.navigate).toHaveBeenCalledWith('CameraScreen');
  });
});
