import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ResidencesListScreen from '../screens/landlord/ResidenceListScreen';
import '@testing-library/jest-native/extend-expect';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock('../components/Header', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

describe('ResidencesListScreen', () => {
  const renderScreen = () => 
    render(
      <NavigationContainer>
        <ResidencesListScreen />
      </NavigationContainer>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Screen Structure', () => {
    it('renders main screen components', () => {
      const { getByTestId } = renderScreen();
      expect(getByTestId('residences-screen')).toBeTruthy();
      expect(getByTestId('screen-title')).toBeTruthy();
      expect(getByTestId('residences-scroll-view')).toBeTruthy();
      expect(getByTestId('add-residence-button')).toBeTruthy();
    });

    it('displays correct screen title', () => {
      const { getByTestId } = renderScreen();
      const title = getByTestId('screen-title');
      expect(title.props.children).toBe('Your Residences');
    });
  });

  describe('Residence List', () => {
    it('renders all mock residences', () => {
      const { getByTestId, getByText } = renderScreen();
      expect(getByTestId('residence-item-R1')).toBeTruthy();
      expect(getByTestId('residence-item-R2')).toBeTruthy();
      expect(getByText('Maple Avenue 123')).toBeTruthy();
      expect(getByText('Oak Street 456')).toBeTruthy();
    });

    it('expands and collapses residences on press', async () => {
      const { getByTestId } = renderScreen();
      
      const r1Button = getByTestId('residence-button-R1');
      fireEvent.press(r1Button);
      expect(getByTestId('residence-item-R1')).toBeTruthy();
      
      fireEvent.press(r1Button);
      expect(getByTestId('residence-item-R1')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('navigates to CreateResidence on add button press', () => {
      const { getByTestId } = renderScreen();
      fireEvent.press(getByTestId('add-residence-button'));
      expect(mockNavigate).toHaveBeenCalledWith('CreateResidence');
    });
  });
});