jest.mock('react-native-keyboard-aware-scroll-view', () => {
  const { ScrollView } = require('react-native');
  return {
    KeyboardAwareScrollView: ScrollView,
  };
});

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import TenantFormScreen from '../screens/auth/TenantFormScreen';
import { createUser, createTenant } from '../../firebase/firestore/firestore';
import { emailAndPasswordSignIn } from '../../firebase/auth/auth';
import { Alert } from 'react-native';
import '@testing-library/jest-native/extend-expect';

jest.mock('../../firebase/firestore/firestore', () => ({
  createUser: jest.fn(),
  createTenant: jest.fn(),
}));

jest.mock('../../firebase/auth/auth', () => ({
  emailAndPasswordSignIn: jest.fn(),
}));

jest.spyOn(console, 'error').mockImplementation(() => {});

jest.spyOn(Alert, 'alert');

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
  useRoute: () => ({
    params: {
      email: 'johnny.hallyday@gmail.com',
      password: 'password123',
    },
  }),
}));

describe('TenantFormScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    const { getByText } = render(<TenantFormScreen />);
    expect(getByText('Tenant Profile')).toBeTruthy();
  });

  test('input fields can be filled', async () => {
    const { getByTestId } = render(<TenantFormScreen />);
    const firstNameField = getByTestId('testFirstNameField');
    await act(async () => {
      fireEvent.changeText(firstNameField, 'Johnny');
    });

    expect(firstNameField.props.value).toBe('Johnny');

    const lastNameField = getByTestId('testLastNameField');
    await act(async () => {
      fireEvent.changeText(lastNameField, 'Hallyday');
    });
    expect(lastNameField.props.value).toBe('Hallyday');
  });

  test('submit button is disabled when required fields are empty', () => {
    const { getByTestId } = render(<TenantFormScreen />);
    const submitButton = getByTestId('submitButton');
    expect(submitButton).toBeDisabled();
  });

  test('submit button is enabled when required fields are filled', async () => {
    const { getByTestId } = render(<TenantFormScreen />);

    const requiredFields = [
      { testId: 'testFirstNameField', value: 'Johnny' },
      { testId: 'testLastNameField', value: 'Hallyday' },
      { testId: 'testPhoneField', value: '1234567890' },
      { testId: 'testAddressField', value: '123 Main St' },
      { testId: 'testZipField', value: '12345' },
      { testId: 'testCityField', value: 'Anytown' },
      { testId: 'testProvinceField', value: 'Anystate' },
      { testId: 'testNumberField', value: '42' },
      { testId: 'testGenreField', value: 'Male' },
      { testId: 'testCountryField', value: 'USA' },
    ];

    await act(async () => {
      requiredFields.forEach(({ testId, value }) => {
        const field = getByTestId(testId);
        fireEvent.changeText(field, value);
      });
    });

    const submitButton = getByTestId('submitButton');
    expect(submitButton).toBeEnabled();
  });

  test('pressing submit button calls emailAndPasswordSignIn, createUser, and createTenant', async () => {
    const { getByTestId } = render(<TenantFormScreen />);

    // Mock implementations
    (emailAndPasswordSignIn as jest.Mock).mockResolvedValue({
      uid: 'testUserId',
    });
    (createUser as jest.Mock).mockResolvedValue(undefined);
    (createTenant as jest.Mock).mockResolvedValue(undefined);

    const requiredFields = [
      { testId: 'testFirstNameField', value: 'Johnny' },
      { testId: 'testLastNameField', value: 'Hallyday' },
      { testId: 'testPhoneField', value: '1234567890' },
      { testId: 'testAddressField', value: '123 Main St' },
      { testId: 'testZipField', value: '12345' },
      { testId: 'testCityField', value: 'Anytown' },
      { testId: 'testProvinceField', value: 'Anystate' },
      { testId: 'testNumberField', value: '42' },
      { testId: 'testGenreField', value: 'Male' },
      { testId: 'testCountryField', value: 'USA' },
    ];

    requiredFields.forEach(async ({ testId, value }) => {
      const field = getByTestId(testId);
      await act(async () => {
        fireEvent.changeText(field, value);
      });
    });

    const submitButton = getByTestId('submitButton');
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(emailAndPasswordSignIn).toHaveBeenCalledWith(
        'johnny.hallyday@gmail.com',
        'password123',
      );
      expect(createUser).toHaveBeenCalledWith({
        uid: 'testUserId',
        type: 'tenant',
        name: 'Johnny Hallyday',
        email: 'johnny.hallyday@gmail.com',
        phone: '1234567890',
        street: '123 Main St',
        number: '42',
        city: 'Anytown',
        canton: 'Anystate',
        zip: '12345',
        country: 'USA',
      });
      expect(createTenant).toHaveBeenCalledWith({
        userId: 'testUserId',
        maintenanceRequests: [],
        apartmentId: '',
        residenceId: '',
      });
      // Since there's no navigation in the component, we check that navigation does not happen
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('shows error alert when createTenant fails', async () => {
    (emailAndPasswordSignIn as jest.Mock).mockResolvedValue({
      uid: 'testUserId',
    });
    (createUser as jest.Mock).mockResolvedValue(undefined);
    (createTenant as jest.Mock).mockRejectedValue(new Error('Test error'));

    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

    const { getByTestId } = render(<TenantFormScreen />);

    const requiredFields = [
      { testId: 'testFirstNameField', value: 'Johnny' },
      { testId: 'testLastNameField', value: 'Hallyday' },
      { testId: 'testPhoneField', value: '1234567890' },
      { testId: 'testAddressField', value: '123 Main St' },
      { testId: 'testZipField', value: '12345' },
      { testId: 'testCityField', value: 'Anytown' },
      { testId: 'testProvinceField', value: 'Anystate' },
      { testId: 'testNumberField', value: '42' },
      { testId: 'testGenreField', value: 'Male' },
      { testId: 'testCountryField', value: 'USA' },
    ];

    await act(async () => {
      requiredFields.forEach(({ testId, value }) => {
        const field = getByTestId(testId);
        fireEvent.changeText(field, value);
      });
    });

    const submitButton = getByTestId('submitButton');

    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(createTenant).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Test error');
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    (console.error as jest.Mock).mockRestore(); // Restore console.error
  });

  test('should show "An unknown error occurred" when createTenant throws a non-Error', async () => {
    (emailAndPasswordSignIn as jest.Mock).mockResolvedValue({
      uid: 'testUserId',
    });
    (createUser as jest.Mock).mockResolvedValue(undefined);
    (createTenant as jest.Mock).mockImplementation(() => {
      throw 'Non-Error exception';
    });

    const { getByTestId } = render(<TenantFormScreen />);

    const requiredFields = [
      { testId: 'testFirstNameField', value: 'Johnny' },
      { testId: 'testLastNameField', value: 'Hallyday' },
      { testId: 'testPhoneField', value: '1234567890' },
      { testId: 'testAddressField', value: '123 Main St' },
      { testId: 'testZipField', value: '12345' },
      { testId: 'testCityField', value: 'Anytown' },
      { testId: 'testProvinceField', value: 'Anystate' },
      { testId: 'testNumberField', value: '42' },
      { testId: 'testGenreField', value: 'Male' },
      { testId: 'testCountryField', value: 'USA' },
    ];

    await act(async () => {
      requiredFields.forEach(({ testId, value }) => {
        const field = getByTestId(testId);
        fireEvent.changeText(field, value);
      });
    });

    const submitButton = getByTestId('submitButton');
    await act(async () => {
      fireEvent.press(submitButton);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'An unknown error occurred',
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('should do nothing when uploading university proof', async () => {
    const { getByText } = render(<TenantFormScreen />);

    // Find the button by its title
    const uploadButton = getByText('Upload university proof of attendance');
    await act(async () => {
      fireEvent.press(uploadButton);
    });

    // Wait to ensure no side-effects occur
    await waitFor(() => {
      expect(Alert.alert).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
