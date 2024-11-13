import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import ReportScreen from '../screens/issues_tenant/ReportScreen'; // Adjust import according to your file structure
import { NavigationProp } from '@react-navigation/native';
import { db, auth } from '../../firebase/firebase'; // Import the Firebase functions if needed

// Mock necessary Firebase functions
jest.mock('../../firebase/firebase', () => ({
  getUser: jest.fn(),
  getTenant: jest.fn(),
  updateTenant: jest.fn(),
  updateMaintenanceRequest: jest.fn(),
  addDoc: jest.fn(),
  collection: jest.fn(),
  auth: {
    currentUser: { uid: 'user123' }, // Mock currentUser object
  },
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

// Mock Context
jest.mock('../context/PictureContext', () => ({
  usePictureContext: jest.fn(() => ({
    pictureList: ['fakePic1', 'fakePic2'],
    resetPictureList: jest.fn(),
  })),
}));

// Mock global alert function
global.alert = jest.fn();

describe('ReportScreen', () => {
  let navigation: NavigationProp<any>;

  beforeEach(() => {
    // Mock navigation prop
    navigation = {
      navigate: jest.fn(),
    } as unknown as NavigationProp<any>;

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
    const { getUser, getTenant, addDoc, updateTenant, updateMaintenanceRequest } = require('../../firebase/firebase');

    // Mock Firebase functions
    getUser.mockResolvedValue({ user: { userUID: 'user123' }, userUID: 'user123' });
    getTenant.mockResolvedValue({ tenant: { userId: 'user123', apartmentId: 'apt123' }, tenantUID: 'tenant123' });
    addDoc.mockResolvedValue({ id: 'request123' });
    updateTenant.mockResolvedValue(true);
    updateMaintenanceRequest.mockResolvedValue(true);

    render(<ReportScreen />);

    // Fill in the form
    fireEvent.changeText(screen.getByTestId('testIssueNameField'), 'Leaky faucet');
    fireEvent.changeText(screen.getByTestId('testRoomNameField'), 'Kitchen');
    fireEvent.changeText(screen.getByTestId('testDescriptionField'), 'The faucet is leaking water.');

    // Press the Submit button
    fireEvent.press(screen.getByText('Submit'));

    // Wait for the submission to complete
    await waitFor(() => expect(addDoc).toHaveBeenCalledTimes(1));

    // Check Firebase function calls and data passed
    expect(getUser).toHaveBeenCalledWith('user123');
    expect(getTenant).toHaveBeenCalledTimes(1);
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      requestTitle: 'Leaky faucet',
      requestDescription: 'The faucet is leaking water.',
    }));
    expect(updateTenant).toHaveBeenCalledTimes(1);
    expect(updateMaintenanceRequest).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).toHaveBeenCalledWith('Issues');
  });

  it('should show an error alert if user or tenant is not found', async () => {
    const { getUser } = require('../../firebase/firebase');

    // Mock getUser to return null (user not found)
    getUser.mockResolvedValue(null);

    render(<ReportScreen />);

    // Fill in the form
    fireEvent.changeText(screen.getByTestId('testIssueNameField'), 'Leaky faucet');
    fireEvent.changeText(screen.getByTestId('testRoomNameField'), 'Kitchen');
    fireEvent.changeText(screen.getByTestId('testDescriptionField'), 'The faucet is leaking water.');

    // Press the Submit button
    fireEvent.press(screen.getByText('Submit'));

    // Wait for the alert to be called
    await waitFor(() => expect(getUser).toHaveBeenCalledTimes(1));

    // Check for alert display (mocked global alert)
    expect(global.alert).toHaveBeenCalledWith('Error', 'User not found');
  });

  it('should navigate to "CameraScreen" when Camera button is pressed', () => {
    render(<ReportScreen />);

    fireEvent.press(screen.getByText('Please take a picture of the damage or situation if applicable'));

    expect(navigation.navigate).toHaveBeenCalledWith('CameraScreen');
  });
});
