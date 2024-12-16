import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import SettingsScreen from '../screens/auth/SettingsScreen';
import { useAuth } from '../context/AuthContext';
import { getUser, updateUser } from '../../firebase/firestore/firestore';
import {
  changeUserPassword,
  emailAndPasswordLogIn,
  deleteAccount,
  updateUserEmailAuth,
} from '../../firebase/auth/auth';
import { auth } from '../../firebase/firebase';

jest.mock('../context/AuthContext');
jest.mock('../../firebase/firestore/firestore');
jest.mock('../../firebase/auth/auth');
jest.mock('../../firebase/firebase', () => ({
  auth: { signOut: jest.fn() },
}));

const waitForModalText = async (getByText: Function, text: string) => {
  await waitFor(() => {
    expect(getByText(text)).toBeTruthy();
  });
};

const mockUser = { uid: 'test-uid' };
const mockUserData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '1234567890',
  street: 'Main St',
  number: '42',
  city: 'Example City',
  canton: 'Example Canton',
  zip: '12345',
  country: 'Example Country',
};

const renderWithNavigation = (component: React.ReactElement) => {
  return render(<NavigationContainer>{component}</NavigationContainer>);
};

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (getUser as jest.Mock).mockResolvedValue(mockUserData);
    (updateUser as jest.Mock).mockResolvedValue(undefined);
    (updateUserEmailAuth as jest.Mock).mockResolvedValue(undefined);
    (changeUserPassword as jest.Mock).mockResolvedValue(undefined);
    (emailAndPasswordLogIn as jest.Mock).mockResolvedValue({ uid: 'test-uid' });
    (deleteAccount as jest.Mock).mockResolvedValue(undefined);
    (auth.signOut as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
    (console.error as jest.Mock).mockRestore();
  });

  it('should render user data correctly', async () => {
    const { getByText } = renderWithNavigation(<SettingsScreen />);
    await waitFor(() => {
      expect(getByText('Settings & Profile')).toBeTruthy();
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('1234567890')).toBeTruthy();
      expect(getByText('Main St')).toBeTruthy();
      expect(getByText('42')).toBeTruthy();
      expect(getByText('Example City')).toBeTruthy();
      expect(getByText('Example Canton')).toBeTruthy();
      expect(getByText('12345')).toBeTruthy();
      expect(getByText('Example Country')).toBeTruthy();
    });
  });

  it('should enter edit mode and cancel editing a field', async () => {
    const { findByText, getAllByText, getByText } = renderWithNavigation(
      <SettingsScreen />,
    );

    await waitFor(() =>
      expect(findByText('Settings & Profile')).resolves.toBeTruthy(),
    );

    const modifyButtons = getAllByText('Modify');

    fireEvent.press(modifyButtons[0]);

    const cancelButton = await findByText('Cancel');
    expect(cancelButton).toBeTruthy();

    fireEvent.press(cancelButton);

    const updatedModifyButtons = getAllByText('Modify');
    expect(updatedModifyButtons.length).toBe(modifyButtons.length);
  });

  it('should update user email when pressing confirm', async () => {
    (emailAndPasswordLogIn as jest.Mock).mockResolvedValueOnce({
      uid: 'test-uid',
    });

    const { getByTestId, findByText } = renderWithNavigation(
      <SettingsScreen />,
    );

    const newEmailInput = getByTestId('input-new-email');
    const emailPasswordInput = getByTestId('input-email-password');
    const confirmButton = getByTestId('button-confirm-change-email');

    fireEvent.changeText(newEmailInput, 'new.email@example.com');
    fireEvent.changeText(emailPasswordInput, 'currentPass123');

    fireEvent.press(confirmButton);

    // Wait for the success popup message
    const successMessage = await findByText('Email changed successfully!');
    expect(successMessage).toBeTruthy();
  });

  it('should show an error modal if update fails', async () => {
    // Correctly mock the updateUserEmailAuth to reject
    (updateUserEmailAuth as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to change email'),
    );

    const { getByTestId, findByText } = renderWithNavigation(
      <SettingsScreen />,
    );

    const newEmailInput = getByTestId('input-new-email');
    const emailPasswordInput = getByTestId('input-email-password');
    const confirmButton = getByTestId('button-confirm-change-email');

    fireEvent.changeText(newEmailInput, 'new.email@example.com');
    fireEvent.changeText(emailPasswordInput, 'wrongPass');

    fireEvent.press(confirmButton);

    // Wait for the error popup message
    const errorMessage = await findByText(
      'Failed to change email: Failed to change email',
    );
    expect(errorMessage).toBeTruthy();
  });

  it('should reset password successfully', async () => {
    const { findByText, getByTestId, getByText } = renderWithNavigation(
      <SettingsScreen />,
    );

    await waitFor(() => findByText('Change Password'));

    const currentPasswordInput = getByTestId('input-current-password');
    const newPasswordInput = getByTestId('input-new-password');
    const confirmPasswordInput = getByTestId('input-confirm-password');

    fireEvent.changeText(currentPasswordInput, 'currentPass123');
    fireEvent.changeText(newPasswordInput, 'newPass123');
    fireEvent.changeText(confirmPasswordInput, 'newPass123');

    const resetButton = getByTestId('button-reset-password');
    fireEvent.press(resetButton);

    await waitFor(() => {
      expect(changeUserPassword).toHaveBeenCalledWith(
        'currentPass123',
        'newPass123',
      );
      expect(getByText('Password changed successfully!')).toBeTruthy();
    });
  });

  it('should sign out successfully', async () => {
    const { findByText, getByTestId } = renderWithNavigation(
      <SettingsScreen />,
    );
    await waitFor(() => findByText('Sign Out'));

    const signOutButton = getByTestId('button-sign-out');
    fireEvent.press(signOutButton);

    await waitFor(() => {
      expect(auth.signOut).toHaveBeenCalled();
    });
  });

  it('should not trigger reset password when inputs are empty', async () => {
    const { getByTestId } = renderWithNavigation(<SettingsScreen />);

    const resetButton = getByTestId('button-reset-password');

    expect(resetButton.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(resetButton);
    expect(() => getByTestId('popup')).toThrow();
  });

  it('should delete account successfully', async () => {
    (emailAndPasswordLogIn as jest.Mock).mockResolvedValueOnce({
      uid: 'test-uid',
    });
    (deleteAccount as jest.Mock).mockResolvedValueOnce(undefined);

    const { getByTestId, findByText } = renderWithNavigation(
      <SettingsScreen />,
    );

    fireEvent.press(getByTestId('button-delete-account'));

    fireEvent.changeText(
      getByTestId('input-delete-email'),
      'john.doe@example.com',
    );
    fireEvent.changeText(getByTestId('input-delete-password'), 'password123');

    fireEvent.press(getByTestId('button-confirm-delete'));

    const successMessage = await findByText('Account deleted successfully.');
    expect(successMessage).toBeTruthy();
  });

  it('should disable delete button if email or password is missing', async () => {
    const { getByTestId } = renderWithNavigation(<SettingsScreen />);

    fireEvent.press(getByTestId('button-delete-account'));

    const deleteButton = getByTestId('button-confirm-delete');
    expect(deleteButton.props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(
      getByTestId('input-delete-email'),
      'john.doe@example.com',
    );
    expect(deleteButton.props.accessibilityState.disabled).toBe(true);

    fireEvent.changeText(getByTestId('input-delete-password'), 'password123');
    expect(deleteButton.props.accessibilityState.disabled).toBe(false);
  });

  it('should show an error modal if resetting password fails', async () => {
    // Mock the changeUserPassword to reject with an error
    (changeUserPassword as jest.Mock).mockRejectedValueOnce(
      new Error('Incorrect current password'),
    );

    const { getByTestId, findByText } = renderWithNavigation(
      <SettingsScreen />,
    );

    // Wait for the "Change Password" section to be available
    await waitFor(() => findByText('Change Password'));

    const currentPasswordInput = getByTestId('input-current-password');
    const newPasswordInput = getByTestId('input-new-password');
    const confirmPasswordInput = getByTestId('input-confirm-password');

    // Enter the current password, new password, and confirm password
    fireEvent.changeText(currentPasswordInput, 'wrongCurrentPass');
    fireEvent.changeText(newPasswordInput, 'newPass123');
    fireEvent.changeText(confirmPasswordInput, 'newPass123');

    const resetButton = getByTestId('button-reset-password');
    fireEvent.press(resetButton);

    // Wait for the error popup message to appear
    const errorMessage = await findByText(
      'Failed to change password: Incorrect current password',
    );
    expect(errorMessage).toBeTruthy();
  });

  it('should show an error modal if sign out fails', async () => {
    // Mock the signOut function to reject with an error
    (auth.signOut as jest.Mock).mockRejectedValueOnce(
      new Error('Network error'),
    );

    const { getByTestId, findByText } = renderWithNavigation(
      <SettingsScreen />,
    );

    // Wait for the "Sign Out" button to be available
    await waitFor(() => findByText('Sign Out'));

    const signOutButton = getByTestId('button-sign-out');
    fireEvent.press(signOutButton);

    // Wait for the error popup message to appear
    const errorMessage = await findByText('Error signing out: Network error');
    expect(errorMessage).toBeTruthy();
  });

  it('should show an error modal if deleting account fails', async () => {
    // Mock the emailAndPasswordLogIn to resolve successfully
    (emailAndPasswordLogIn as jest.Mock).mockResolvedValueOnce({
      uid: 'test-uid',
    });

    // Mock the deleteAccount function to reject with an error
    (deleteAccount as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to delete account'),
    );

    const { getByTestId, findByText } = renderWithNavigation(
      <SettingsScreen />,
    );

    // Press the 'Delete Account' button to show the confirmation form
    fireEvent.press(getByTestId('button-delete-account'));

    // Enter email and password
    fireEvent.changeText(
      getByTestId('input-delete-email'),
      'john.doe@example.com',
    );
    fireEvent.changeText(getByTestId('input-delete-password'), 'password123');

    // Press the 'Delete' button to attempt account deletion
    fireEvent.press(getByTestId('button-confirm-delete'));

    // Wait for the error popup message to appear
    const errorMessage = await findByText(
      'Failed to delete account: Failed to delete account',
    );
    expect(errorMessage).toBeTruthy();
  });

  it('should execute fetchUserData from useEffect', async () => {
    // Mock useAuth to return a valid user
    (useAuth as jest.Mock).mockReturnValueOnce({ user: { uid: 'test-uid' } });

    // Mock getUser to return mock user data
    (getUser as jest.Mock).mockResolvedValueOnce(mockUserData);

    // Render the component
    renderWithNavigation(<SettingsScreen />);

    // Use waitFor to ensure useEffect runs
    await waitFor(() => {
      expect(getUser).toHaveBeenCalledWith('test-uid');
    });
  });

  it('should disable the reset password button when current password is empty', () => {
    const { getByTestId } = renderWithNavigation(<SettingsScreen />);

    // Set new password and confirm password, but leave current password empty
    fireEvent.changeText(getByTestId('input-new-password'), 'newPass123');
    fireEvent.changeText(getByTestId('input-confirm-password'), 'newPass123');

    const resetButton = getByTestId('button-reset-password');

    // Check if the button is disabled
    expect(resetButton.props.accessibilityState.disabled).toBe(true);
  });

  it('should disable the reset password button when new password or confirm password is empty', () => {
    const { getByTestId } = renderWithNavigation(<SettingsScreen />);

    // Set current password but leave new password and confirm password empty
    fireEvent.changeText(
      getByTestId('input-current-password'),
      'currentPass123',
    );
    fireEvent.changeText(getByTestId('input-new-password'), '');
    fireEvent.changeText(getByTestId('input-confirm-password'), '');

    const resetButton = getByTestId('button-reset-password');

    // Check if the button is disabled
    expect(resetButton.props.accessibilityState.disabled).toBe(true);
  });

  it('should handle error when user is not found during email update', async () => {
    // Mock useAuth to return user initially but then null
    (useAuth as jest.Mock).mockReturnValue({
      user: { ...mockUser, email: 'current@example.com' },
    });

    (updateUserEmailAuth as jest.Mock).mockResolvedValue(undefined);
    (updateUser as jest.Mock).mockRejectedValue(
      new Error('Error updating user in Firestore'),
    );

    const { getByTestId, getByText } = renderWithNavigation(<SettingsScreen />);

    // Fill in the form
    fireEvent.changeText(getByTestId('input-new-email'), 'new@example.com');
    fireEvent.changeText(getByTestId('input-email-password'), 'password123');

    // Submit form
    fireEvent.press(getByTestId('button-confirm-change-email'));

    // Wait for the error message in the modal
    await waitForModalText(
      getByText,
      'Failed to change email: Error updating user in Firestore',
    );
  });

  it('should handle error when getUser fails after update', async () => {
    // Mock successful update but failed getUser
    (updateUser as jest.Mock).mockResolvedValue(undefined);
    (getUser as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch updated user'),
    );

    const { getAllByText, getByTestId, getByText } = renderWithNavigation(
      <SettingsScreen />,
    );

    // Enter edit mode
    const modifyButtons = getAllByText('Modify');
    fireEvent.press(modifyButtons[0]);

    // Change the value
    const nameInput = getByTestId('input-field');
    fireEvent.changeText(nameInput, 'New Name');

    // Try to save changes
    const saveButton = getByTestId('button-save-changes');
    fireEvent.press(saveButton);

    // Wait for error message in modal
    await waitForModalText(
      getByText,
      'Failed to save changes. Please try again.',
    );
  });
});
