import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomDrawerContent from '../../../components/drawer/CustomDrawer';

jest.mock('@react-navigation/drawer', () => ({
  DrawerContentScrollView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DrawerItemList: () => null,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('../../../../styles/styles', () => ({
  appStyles: {
    appHeader: {},
  },
}));

describe('CustomDrawerContent', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  const mockProps = {
    navigation: mockNavigation,
  };

  beforeEach(() => {

    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<CustomDrawerContent {...mockProps} />);
    

    expect(getByText('Leazy')).toBeTruthy();
  });


  it('applies correct styles', () => {
    const { getByTestId } = render(<CustomDrawerContent {...mockProps} />);
    
    const headerContainer = getByTestId('header-container');
    

    expect(headerContainer.props.style).toMatchObject({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
    });
  });
});