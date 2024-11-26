import React from 'react';
import { render } from '@testing-library/react-native';
import CameraStack from '../Navigators/cameraStack';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mock-nav-container': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'mock-navigator': React.ClassAttributes<HTMLElement> & React.HTMLAttributes<HTMLElement> & { initialRouteName: string };
      'mock-screen': React.ClassAttributes<HTMLElement> & React.HTMLAttributes<HTMLElement> & { name: string; component: React.ComponentType<any>; options: any };
    }
  }
}

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => (
    <mock-nav-container data-testid="navigation-container">
      {children}
    </mock-nav-container>
  ),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn().mockReturnValue({
    Navigator: ({ children, initialRouteName }: { children: React.ReactNode, initialRouteName: string }) => (
      <mock-navigator data-testid="stack-navigator" initialRouteName={initialRouteName}>
        {children}
      </mock-navigator>
    ),
    Screen: ({ name, component, options }: { name: string, component: React.ComponentType<any>, options: any }) => (
      <mock-screen data-testid={`stack-screen-${name.toLowerCase()}`} name={name} component={component} options={options} />
    ),
  }),
}));

jest.mock('../screens/camera/CameraScreen', () => 'MockCameraScreen');
jest.mock('../screens/camera/CapturedMediaScreen', () => 'MockCapturedMediaScreen');

describe('CameraStack', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<CameraStack />);
    expect(toJSON()).toBeTruthy();
  });

});