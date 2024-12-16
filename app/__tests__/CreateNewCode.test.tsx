import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import CodeCreationScreen from '../screens/landlord/CreateNewCode';
import * as Clipboard from 'expo-clipboard';
import { NavigationContainer } from '@react-navigation/native';
import { PropertyContext } from '../context/LandlordContext';
import { generate_unique_code } from '../../firebase/firestore/firestore';

// Mock Firebase and Firestore
jest.mock('../../firebase/firebase', () => ({
  db: {},
}));

jest.mock('../../firebase/firestore/firestore', () => ({
  generate_unique_code: jest.fn(),
}));

// Mock Clipboard functionality
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

// Spy on Alert
jest.spyOn(Alert, 'alert');

// Mock data
const mockResidences = [
  { id: 'res1', residenceName: 'Residence 1' },
  { id: 'res2', residenceName: 'Residence 2' },
];

const mockApartments = [
  { id: 'apt1', apartmentName: 'Apartment 1', residenceId: 'res1' },
  { id: 'apt2', apartmentName: 'Apartment 2', residenceId: 'res1' },
  { id: 'apt3', apartmentName: 'Apartment 3', residenceId: 'res2' },
];

// Helper function to render component with all necessary providers
const renderScreen = async () => {
  const component = render(
    <NavigationContainer>
      <PropertyContext.Provider
        value={{
          residences: mockResidences,
          apartments: mockApartments,
          loading: false,
          error: null,
          refreshProperties: jest.fn(),
        }}
      >
        <CodeCreationScreen />
      </PropertyContext.Provider>
    </NavigationContainer>
  );

  // Wait for initial render and animations
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  return component;
};

// Helper function to make residence and apartment selections
const makeSelections = async (
  getAllByTestId: (id: string) => any[],
  residenceId: string,
  apartmentId: string
) => {
  const pickers = getAllByTestId('ios_touchable_wrapper');
  await act(async () => {
    fireEvent(pickers[0], 'onValueChange', residenceId);
    fireEvent(pickers[1], 'onValueChange', apartmentId);
  });
};

describe('CodeCreationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial render', () => {
    it('shows the main screen elements', async () => {
      const { getByText, getByTestId } = await renderScreen();

      // Title
      expect(getByText('Create a new code for a new tenant')).toBeTruthy();
      
      // Create button
      expect(getByTestId('create-code-button')).toBeTruthy();
      
      // Initial placeholder
      expect(getByText('******')).toBeTruthy();
    });
  });

  describe('Code generation', () => {
    it('shows error when no selections made', async () => {
      const { getByTestId } = await renderScreen();

      await act(async () => {
        fireEvent.press(getByTestId('create-code-button'));
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Please enter both residence number and apartment number.'
      );
    });

    it('generates code when all selections are made', async () => {
      const mockCode = 'TEST123';
      (generate_unique_code as jest.Mock).mockResolvedValueOnce(mockCode);

      const { getAllByTestId, getByTestId, findByText } = await renderScreen();

      await makeSelections(getAllByTestId, 'res1', 'apt1');

      await act(async () => {
        fireEvent.press(getByTestId('create-code-button'));
      });

      const generatedCode = await findByText(mockCode);
      expect(generatedCode).toBeTruthy();
      expect(generate_unique_code).toHaveBeenCalledWith('res1', 'apt1');
      expect(await findByText('Share the following code with a tenant:')).toBeTruthy();
    });

    it('shows expected error message', async () => {
      const errorMessage = 'Failed to generate code';
      (generate_unique_code as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { getAllByTestId, getByTestId } = await renderScreen();

      await makeSelections(getAllByTestId, 'res1', 'apt1');

      await act(async () => {
        fireEvent.press(getByTestId('create-code-button'));
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(errorMessage);
      });
    });

    it('shows generic error for unexpected errors', async () => {
      (generate_unique_code as jest.Mock).mockRejectedValueOnce('Unexpected error');

      const { getAllByTestId, getByTestId } = await renderScreen();

      await makeSelections(getAllByTestId, 'res1', 'apt1');

      await act(async () => {
        fireEvent.press(getByTestId('create-code-button'));
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'An unexpected error occurred. Please try again.'
        );
      });
    });
  });

  describe('Code sharing', () => {
    it('copies code to clipboard when code is tapped', async () => {
      const mockCode = 'TEST123';
      (generate_unique_code as jest.Mock).mockResolvedValueOnce(mockCode);

      const { getAllByTestId, getByTestId, findByText } = await renderScreen();

      // Generate code first
      await makeSelections(getAllByTestId, 'res1', 'apt1');
      await act(async () => {
        fireEvent.press(getByTestId('create-code-button'));
      });

      // Tap the code
      const codeElement = await findByText(mockCode);
      await act(async () => {
        fireEvent.press(codeElement);
      });

      expect(Clipboard.setStringAsync).toHaveBeenCalledWith(mockCode);
      expect(Alert.alert).toHaveBeenCalledWith('Code copied to clipboard!');
    });

    it('shares code via share button', async () => {
      const mockCode = 'TEST123';
      (generate_unique_code as jest.Mock).mockResolvedValueOnce(mockCode);

      const { getAllByTestId, getByTestId, findByTestId } = await renderScreen();

      // Generate code first
      await makeSelections(getAllByTestId, 'res1', 'apt1');
      await act(async () => {
        fireEvent.press(getByTestId('create-code-button'));
      });

      // Click share button
      const shareButton = await findByTestId('share-code-button');
      await act(async () => {
        fireEvent.press(shareButton);
      });

      expect(Clipboard.setStringAsync).toHaveBeenCalledWith(mockCode);
    });
  });
});