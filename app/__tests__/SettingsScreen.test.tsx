import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import SettingsScreen from '../screens/auth/SettingsScreen';
import { useAuth } from '../context/AuthContext';
import { getUser, updateUser } from '../../firebase/firestore/firestore';
import {
  updateUserEmail,
  resetUserPassword,
  emailAndPasswordLogIn,
  deleteAccount,
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
    (updateUserEmail as jest.Mock).mockResolvedValue(undefined);
    (resetUserPassword as jest.Mock).mockResolvedValue(undefined);
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
      expect(getByText('john.doe@example.com')).toBeTruthy();
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

  it('should update user email when saving changes', async () => {
    const { findByText, getAllByText, getByTestId } = renderWithNavigation(
      <SettingsScreen />,
    );

    await waitFor(() => findByText('john.doe@example.com'));

    const modifyButtons = getAllByText('Modify');
    fireEvent.press(modifyButtons[1]);

    const emailInput = getByTestId('input-field');
    fireEvent.changeText(emailInput, 'new.email@example.com');

    const saveButton = getByTestId('button-save-changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(updateUserEmail).toHaveBeenCalledWith('new.email@example.com');
      expect(updateUser).toHaveBeenCalled();
    });
  });

  it('should show error popup if update fails', async () => {
    (updateUser as jest.Mock).mockRejectedValueOnce(new Error('Update failed'));

    const { findByText, getByTestId, getAllByText, getByText } =
      renderWithNavigation(<SettingsScreen />);

    await waitFor(() => findByText('john.doe@example.com'));

    const modifyButtons = getAllByText('Modify');
    const emailModifyButton = modifyButtons[1];
    fireEvent.press(emailModifyButton);

    const emailInput = getByTestId('input-field');
    fireEvent.changeText(emailInput, 'failing.email@example.com');

    const saveButton = getByTestId('button-save-changes');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(
        getByText('Failed to save changes. Please try again.'),
      ).toBeTruthy();
    });
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
      expect(resetUserPassword).toHaveBeenCalledWith(
        'currentPass123',
        'newPass123',
      );
      expect(getByText('Password reset successfully!')).toBeTruthy();
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
