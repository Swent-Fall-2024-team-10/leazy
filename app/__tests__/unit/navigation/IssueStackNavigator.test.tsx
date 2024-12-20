import React from 'react';
import { render } from '@testing-library/react-native';
import IssueStackNavigator from '../../../Navigators/IssueStackNavigator';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mock-navigator': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        initialRouteName: string;
      };
      'mock-screen': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        name: string;
        component: React.ComponentType<any>;
        options: any;
      };
    }
  }
}

jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  memoryLocalCache: jest.fn(),
  initializeFirestore: jest.fn(),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn().mockReturnValue({
    Navigator: ({ children, initialRouteName }: { children: React.ReactNode, initialRouteName: string }) => (
      <mock-navigator data-testid="navigator" initialRouteName={initialRouteName}>{children}</mock-navigator>
    ),
    Screen: ({ name, component, options }: { name: string, component: React.ComponentType<any>, options: any }) => (
      <mock-screen data-testid={`screen-${name}`} name={name} component={component} options={options} />
    ),
  }),
}));

jest.mock('../../../screens/issues_tenant/ListIssueScreen', () => 'MockListIssueScreen');
jest.mock('../../../screens/issues_tenant/IssueDetailsScreen', () => 'MockIssueDetailsScreen');
jest.mock('../../../screens/issues_tenant/ReportScreen', () => 'MockReportScreen');
jest.mock('../../../screens/camera/CameraScreen', () => 'MockCameraScreen');
jest.mock('../../../screens/camera/CapturedMediaScreen', () => 'MockCapturedMediaScreen');

describe('IssueStack Tests', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<IssueStackNavigator />);
    expect(toJSON()).toBeTruthy();
  });

  it('has correct headerShown options for all screens', () => {
    const { queryAllByTestId } = render(<IssueStackNavigator />);
    const screens = queryAllByTestId(/^screen-/);
    
    const headerShownMap = {
      Issues: false,
      IssueDetails: false,
      Report: false,
      CameraScreen: false,
      CapturedMedia: true,
    };

    screens.forEach(screen => {
      const screenName = screen.props.name;
      expect(screen.props.options.headerShown).toBe(headerShownMap[screenName as keyof typeof headerShownMap]);
    });
  });

  it('uses correct component references', () => {
    const { queryAllByTestId } = render(<IssueStackNavigator />);
    const screens = queryAllByTestId(/^screen-/);
    
    const componentMap = {
      Issues: 'MockListIssueScreen',
      IssueDetails: 'MockIssueDetailsScreen',
      Report: 'MockReportScreen',
      CameraScreen: 'MockCameraScreen',
      CapturedMedia: 'MockCapturedMediaScreen'
    };

    screens.forEach(screen => {
      const expectedComponent = componentMap[screen.props.name as keyof typeof componentMap];
      expect(screen.props.component).toBe(expectedComponent);
    });
  });
});