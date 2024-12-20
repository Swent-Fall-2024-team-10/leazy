import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import TenantHomeDrawerNavigator from '../Navigators/TenantHomeDrawerNavigator';

// Mock the navigation
jest.mock('@react-navigation/drawer', () => {
  const actual = jest.requireActual('@react-navigation/drawer');
  return {
    ...actual,
    createDrawerNavigator: () => ({
      Navigator: ({ children, screenOptions, initialRouteName, testID, ...rest }: any) => (
        <div testID={testID} data-initial-route={initialRouteName} data-screen-options={JSON.stringify(screenOptions)}>
          {children}
        </div>
      ),
      Screen: ({ name, options, ...rest }: any) => (
        <div testID={name} data-screen-name={name} data-screen-options={JSON.stringify(options)} />
      ),
    }),
  };
});

jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  memoryLocalCache: jest.fn(),
  initializeFirestore: jest.fn(),
}));

// Mock all the screen components
jest.mock('../screens/tenant/HomepageScreen', () => 'HomepageScreen');
jest.mock('../screens/tenant/MyRentScreen', () => 'MyRentScreen');
jest.mock('../screens/tenant/SharedElementsScreen', () => 'SharedElementsScreen');
jest.mock('../screens/tenant/SubrentScreen', () => 'SubrentScreen');
jest.mock('../screens/laundry_machines/WashingMachineScreen', () => 'WashingMachineScreen');
jest.mock('../screens/auth/SettingsScreen', () => 'SettingsScreen');
jest.mock('../screens/SnitchMode/SnitchModeScreen', () => 'SnitchModeScreen');
jest.mock('../Navigators/IssueStackNavigator', () => 'IssueStackNavigator');
jest.mock('../components/drawer/CustomDrawer', () => 'CustomDrawerContent');

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    {children}
  </NavigationContainer>
);

describe('TenantHomeDrawerNavigator', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <TenantHomeDrawerNavigator />
      </TestWrapper>
    );
    expect(getByTestId('tenant-drawer-navigator')).toBeTruthy();
  });

  it('contains all expected screens', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <TenantHomeDrawerNavigator />
      </TestWrapper>
    );

    const expectedScreens = [
      'Home',
      'Maintenance Requests',
      'My Rent',
      'Shared elements',
      'Subrent',
      'Washing Machines',
      'Snitch Mode',
      'Settings'
    ];

    expectedScreens.forEach(screenName => {
      expect(getByTestId(screenName)).toBeTruthy();
    });
  });

  it('navigates to the correct screen when pressed', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <TenantHomeDrawerNavigator />
      </TestWrapper>
    );

    // Check initial route is Home
    const navigator = getByTestId('tenant-drawer-navigator');
    expect(navigator.props['data-initial-route']).toBe('Home');

    // Verify navigation to different screens
    const maintenanceScreen = getByTestId('Maintenance Requests');
    fireEvent.press(maintenanceScreen);
    expect(maintenanceScreen.props['data-screen-name']).toBe('Maintenance Requests');

    const settingsScreen = getByTestId('Settings');
    fireEvent.press(settingsScreen);
    expect(settingsScreen.props['data-screen-name']).toBe('Settings');
  });

});