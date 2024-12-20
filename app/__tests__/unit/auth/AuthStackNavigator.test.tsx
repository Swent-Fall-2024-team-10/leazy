import React from 'react';
import { render } from '@testing-library/react-native';
import AuthStackNavigator from '../../../Navigators/AuthStackNavigator';

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

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn().mockReturnValue({
    Navigator: ({ children, initialRouteName }: { children: React.ReactNode, initialRouteName: string }) => (
      <mock-navigator data-testid="navigator" initialRouteName={initialRouteName}>{children}</mock-navigator>
    ),
    Screen: ({ name, component, options }: { name: string, component: React.ComponentType<any>, options: any }) => (
      <mock-screen data-testid={`screen-${name}`} name={name} component={component} options={options} />
    ),
  }),
}));

jest.mock('../../../screens/auth/SignInScreen', () => 'MockSignInScreen');
jest.mock('../../../screens/auth/SignUpScreen', () => 'MockSignUpScreen');
jest.mock('../../../screens/auth/TenantFormScreen', () => 'MockTenantFormScreen');
jest.mock('../../../screens/auth/LandlordFormScreen', () => 'MockLandlordFormScreen');

describe('AuthStackNavigator', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<AuthStackNavigator />);
    expect(toJSON()).toBeTruthy();
  });

  describe('Navigation options', () => {
    it('has headerShown false for all screens', () => {
      const { queryAllByTestId } = render(<AuthStackNavigator />);
      const screens = queryAllByTestId(/^screen-/);
      
      screens.forEach(screen => {
        expect(screen.props.options.headerShown).toBe(false);
      });
    });
  });

  describe('Component references', () => {
    it('uses correct component references', () => {
      const { queryAllByTestId } = render(<AuthStackNavigator />);
      const screens = queryAllByTestId(/^screen-/);
      
      const componentMap = {
        SignIn: 'MockSignInScreen',
        SignUp: 'MockSignUpScreen',
        TenantForm: 'MockTenantFormScreen',
        LandlordForm: 'MockLandlordFormScreen'
      };

      screens.forEach(screen => {
        const expectedComponent = componentMap[screen.props.name as keyof typeof componentMap];
        expect(screen.props.component).toBe(expectedComponent);
      });
    });
  });
});