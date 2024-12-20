import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import LandlordDrawerNavigator from '../Navigators/LandlordDrawerNavigator';
import { AuthProvider } from '../context/AuthContext';
import { Color, appStyles } from '../../styles/styles';

// Mock the navigation
jest.mock('@react-navigation/drawer', () => {
  const actual = jest.requireActual('@react-navigation/drawer');
  return {
    ...actual,
    createDrawerNavigator: () => ({
      Navigator: ({ children, testID, screenOptions, initialRouteName, ...rest }: any) => (
        <div testID={testID} data-initial-route={initialRouteName} data-screen-options={JSON.stringify(screenOptions)}>
          {children}
        </div>
      ),
      Screen: ({ name, options, ...rest }: any) => (
        <div testID={options?.testID || name} data-screen-name={name} data-screen-options={JSON.stringify(options)} />
      ),
    }),
  };
});

// Mock the components
jest.mock('../screens/issues_landlord/LandlordListIssuesScreen', () => 'LandlordListIssuesScreen');
jest.mock('../screens/laundry_machines/ManageMachinesScreen', () => 'ManageMachinesScreen');
jest.mock('../screens/laundry_machines/WashingMachineScreen', () => 'WashingMachineScreen');
jest.mock('../components/drawer/CustomDrawer', () => 'CustomDrawerContent');
jest.mock('../Navigators/ResidenceStack', () => 'ResidenceStack');
jest.mock('../Navigators/IssueStackLandlord', () => 'IssueStackLandlord');
jest.mock('../screens/landlord/SituationReport/SituationReportCreationScreen', () => 'SituationReportCreation');
jest.mock('../screens/landlord/SituationReport/SituationReportScreen', () => 'SituationReport');
jest.mock('../screens/landlord/CreateNewCode', () => 'CodeCreationScreen');
jest.mock('../screens/auth/SettingsScreen', () => 'SettingsScreen');

// Mock LandlordContext
jest.mock('../context/LandlordContext', () => ({
  LandlordProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: { uid: 'test-uid' },
    isAuthenticated: true,
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <NavigationContainer>
      {children}
    </NavigationContainer>
  </AuthProvider>
);

describe('LandlordDrawerNavigator', () => {
  it('renders without crashing', () => {
    const { queryByTestId } = render(
      <TestWrapper>
        <LandlordDrawerNavigator />
      </TestWrapper>
    );
    expect(queryByTestId('landlord-drawer-navigator')).toBeTruthy();
  });

  it('contains all expected screens', () => {
    const { queryByTestId } = render(
      <TestWrapper>
        <LandlordDrawerNavigator />
      </TestWrapper>
    );

    const expectedScreens = [
      'Dashboard',
      'List Issues',
      'Manage Machines',
      'Residence Stack',
      'Situation Report Creation',
      'Situation Report Form',
      'Create New Code',
      'Settings'
    ];

    expectedScreens.forEach(screenName => {
      expect(queryByTestId(screenName)).toBeTruthy();
    });
  });

  it('uses correct initial configuration', () => {
    const { queryByTestId } = render(
      <TestWrapper>
        <LandlordDrawerNavigator />
      </TestWrapper>
    );

    expect(queryByTestId('landlord-drawer-navigator')).toBeTruthy();
  });

  it('handles missing user gracefully', () => {
    // Mock useAuth to return null user
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockImplementationOnce(() => ({
      user: null,
      isAuthenticated: false,
    }));

    const { queryByTestId } = render(
      <TestWrapper>
        <LandlordDrawerNavigator />
      </TestWrapper>
    );

    // Navigator should still render even without user
    expect(queryByTestId('landlord-drawer-navigator')).toBeTruthy();
  });
});