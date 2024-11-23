import React from 'react';
import { render } from '@testing-library/react-native';
import StraightLine from '../components/SeparationLine';
import { Color } from '../../styles/styles';

// Mock Dimensions to control the screen width
jest.mock('react-native', () => {
  const originalModule = jest.requireActual('react-native');
  return {
    ...originalModule,
    Dimensions: {
      get: jest.fn(() => ({ width: 360, height: 640 })), // Mock screen dimensions
    },
  };
});

// Mock NativeSettingsManager to prevent errors
jest.mock('react-native/Libraries/Settings/Settings', () => ({
  default: {
    getConstants: jest.fn(() => ({})), // Mock getConstants method
  },
}));

describe('StraightLine component', () => {
  it('renders the container and line correctly', () => {
    const { getByTestId } = render(<StraightLine />);
    const container = getByTestId('container');

    expect(container).toBeTruthy();
  });

});
