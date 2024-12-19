import React from 'react';
import { render } from '@testing-library/react-native';
import CustomBubble from '../components/messaging/CustomBubble';
import { chatStyles } from '../../styles/styles';
import { Bubble } from 'react-native-gifted-chat';

// Mock react-native-gifted-chat
jest.mock('react-native-gifted-chat', () => ({
  Bubble: jest.fn(
    ({ wrapperStyle, textStyle, timeTextStyle, renderTime, ...props }) => (
      <div
        testID='mock-bubble'
        data-wrapper-style={JSON.stringify(wrapperStyle)}
        data-text-style={JSON.stringify(textStyle)}
        data-time-style={JSON.stringify(timeTextStyle)}
        data-render-time={renderTime === null ? 'null' : 'function'}
        {...props}
      />
    ),
  ),
}));

describe('CustomBubble', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<CustomBubble />);
    expect(getByTestId('mock-bubble')).toBeTruthy();
  });
});
