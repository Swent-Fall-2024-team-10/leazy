import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import IssueStackLandlord from '../../../Navigators/IssueStackLandlord';

// Mock the navigation stack
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn().mockReturnValue({
    Navigator: ({ children }: any) => <>{children}</>,
    Screen: ({ name }: any) => (
      <screen testID={`screen-${name}`}>{name}</screen>
    ),
  }),
}));

// Mock the screen components
jest.mock('../../../screens/landlord/LandlordDashboard', () => 'LandlordDashboard');
jest.mock('../../../screens/issues_landlord/LandlordListIssuesScreen', () => 'LandlordListIssuesScreen');
jest.mock('../../../screens/issues_tenant/IssueDetailsScreen', () => 'IssueDetailsScreen');
jest.mock('../../../screens/messaging/MessagingScreen', () => 'MessagingScreen');

describe('IssueStackLandlord', () => {
  it('renders without crashing', () => {
    const rendered = render(
      <NavigationContainer>
        <IssueStackLandlord />
      </NavigationContainer>
    );
    expect(rendered.toJSON()).toBeTruthy();
  });

  it('contains all required screens', () => {
    const { queryByTestId } = render(
      <NavigationContainer>
        <IssueStackLandlord />
      </NavigationContainer>
    );

    // Verify all expected screens are present
    expect(queryByTestId('screen-Dashboard')).toBeTruthy();
    expect(queryByTestId('screen-Issues')).toBeTruthy();
    expect(queryByTestId('screen-IssueDetails')).toBeTruthy();
    expect(queryByTestId('screen-Messaging')).toBeTruthy();
  });
});
