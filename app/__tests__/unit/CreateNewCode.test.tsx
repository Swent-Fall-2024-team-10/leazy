import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert, Share } from 'react-native';
import CodeCreationScreen from '../../screens/landlord/CreateNewCode';
import { getDocs } from 'firebase/firestore';
import { generate_unique_code } from '../../../firebase/firestore/firestore';
import ClipBoard from '@react-native-clipboard/clipboard';
import { NavigationContainer } from '@react-navigation/native';

// Mock the dependencies
jest.mock('../../../firebase/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

jest.mock('../../../firebase/firestore/firestore', () => ({
  generate_unique_code: jest.fn(),
}));

jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
}));

jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      toggleDrawer: jest.fn(),
    }),
  };
});

jest.spyOn(Alert, 'alert');

// Wrapper component to provide navigation context
const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('CodeCreationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockResidenceData = {
    data: () => ({
      residenceId: 'res123',
      apartments: ['apt789'],
    }),
    id: 'res789',
  };

  const mockApartmentData = {
    data: () => ({
      apartmentId: 'apt123',
      residenceId: 'res789',
    }),
    id: 'apt789',
  };

  test('renders correctly with initial state', () => {
    const { getByText, getByTestId } = renderWithNavigation(<CodeCreationScreen />);
    
    expect(getByText('Create a new code for a new tenant')).toBeTruthy();
    expect(getByTestId('Residence ID')).toBeTruthy();
    expect(getByTestId('Apartment ID')).toBeTruthy();
    expect(getByTestId('create-code-button')).toBeTruthy();
  });

  test('shows alert when fields are empty', async () => {
    const { getByTestId } = renderWithNavigation(<CodeCreationScreen />);
    
    fireEvent.press(getByTestId('create-code-button'));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Please enter both residence number and apartment number.'
    );
  });

  test('successfully creates and displays a code', async () => {
    const mockGeneratedCode = 'ABC123';
    (getDocs as jest.Mock)
      .mockResolvedValueOnce({ empty: false, docs: [mockResidenceData] })
      .mockResolvedValueOnce({ empty: false, docs: [mockApartmentData] });
    (generate_unique_code as jest.Mock).mockResolvedValueOnce(mockGeneratedCode);

    const { getByTestId, getByText } = renderWithNavigation(<CodeCreationScreen />);

    // Fill in the form
    fireEvent.changeText(getByTestId('Residence ID'), 'res123');
    fireEvent.changeText(getByTestId('Apartment ID'), 'apt123');

    // Create code
    fireEvent.press(getByTestId('create-code-button'));

    // Wait for the code to be generated and displayed
    await waitFor(() => {
      expect(getByText(mockGeneratedCode)).toBeTruthy();
      expect(getByTestId('share-code-button')).toBeTruthy();
    });
  });

  test('handles clipboard copy', async () => {
    const mockGeneratedCode = 'ABC123';
    (getDocs as jest.Mock)
      .mockResolvedValueOnce({ empty: false, docs: [mockResidenceData] })
      .mockResolvedValueOnce({ empty: false, docs: [mockApartmentData] });
    (generate_unique_code as jest.Mock).mockResolvedValueOnce(mockGeneratedCode);

    const { getByTestId, getByText } = renderWithNavigation(<CodeCreationScreen />);

    // Fill in the form
    fireEvent.changeText(getByTestId('Residence ID'), 'res123');
    fireEvent.changeText(getByTestId('Apartment ID'), 'apt123');

    // Create code
    fireEvent.press(getByTestId('create-code-button'));

    // Wait for the code to be displayed
    await waitFor(() => {
      expect(getByText(mockGeneratedCode)).toBeTruthy();
    });

    // Copy code
    fireEvent.press(getByText(mockGeneratedCode));

    expect(ClipBoard.setString).toHaveBeenCalledWith(mockGeneratedCode);
    expect(Alert.alert).toHaveBeenCalledWith('Code copied to clipboard!');
  });

  test('handles sharing code', async () => {
    const mockGeneratedCode = 'ABC123';
    (getDocs as jest.Mock)
      .mockResolvedValueOnce({ empty: false, docs: [mockResidenceData] })
      .mockResolvedValueOnce({ empty: false, docs: [mockApartmentData] });
    (generate_unique_code as jest.Mock).mockResolvedValueOnce(mockGeneratedCode);

    const { getByTestId, getByText } = renderWithNavigation(<CodeCreationScreen />);

    // Fill in the form
    fireEvent.changeText(getByTestId('Residence ID'), 'res123');
    fireEvent.changeText(getByTestId('Apartment ID'), 'apt123');

    // Create code
    fireEvent.press(getByTestId('create-code-button'));

    // Wait for the share button to appear
    await waitFor(() => {
      expect(getByTestId('share-code-button')).toBeTruthy();
    });

    // Share code
    fireEvent.press(getByTestId('share-code-button'));

    expect(Share.share).toHaveBeenCalledWith({
      message: `Here is your code: ${mockGeneratedCode}`,
    });
  });

  test('handles share error', async () => {
    const mockError = new Error('Share failed');
    (Share.share as jest.Mock).mockRejectedValueOnce(mockError);
    
    const mockGeneratedCode = 'ABC123';
    (getDocs as jest.Mock)
      .mockResolvedValueOnce({ empty: false, docs: [mockResidenceData] })
      .mockResolvedValueOnce({ empty: false, docs: [mockApartmentData] });
    (generate_unique_code as jest.Mock).mockResolvedValueOnce(mockGeneratedCode);

    const { getByTestId } = renderWithNavigation(<CodeCreationScreen />);

    // Fill in the form
    fireEvent.changeText(getByTestId('Residence ID'), 'res123');
    fireEvent.changeText(getByTestId('Apartment ID'), 'apt123');

    // Create code
    fireEvent.press(getByTestId('create-code-button'));

    // Wait for share button and press it
    await waitFor(() => {
      fireEvent.press(getByTestId('share-code-button'));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Share failed');
    });
  });

  test('handles unexpected error during code generation', async () => {
    const { getByTestId } = renderWithNavigation(<CodeCreationScreen />);
    
    (getDocs as jest.Mock)
      .mockResolvedValueOnce({ empty: false, docs: [mockResidenceData] })
      .mockResolvedValueOnce({ empty: false, docs: [mockApartmentData] });
    
    // Mock code generation to throw a non-Error object
    (generate_unique_code as jest.Mock).mockRejectedValueOnce('Unexpected error');

    // Fill in the form
    fireEvent.changeText(getByTestId('Residence ID'), 'res123');
    fireEvent.changeText(getByTestId('Apartment ID'), 'apt123');

    // Create code
    fireEvent.press(getByTestId('create-code-button'));

    // Wait for error alert
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.'
      );
    });
  });

});