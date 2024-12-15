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
});
