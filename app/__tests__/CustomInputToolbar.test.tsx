import React from 'react';
import { fireEvent, render } from "@testing-library/react-native";
import CustomInputToolbar from "../screens/issues_tenant/CustomInputToolbar";

describe('CustomInputToolbar', () => {
    it('renders correctly', () => {
      const props = {
        text: 'Test message',
        onSend: jest.fn(),
      };
  
      const { getByTestId } = render(<CustomInputToolbar {...props} />);
      expect(getByTestId('input-field')).toBeTruthy();
      expect(getByTestId('send-button')).toBeTruthy();
    });
  
    it('calls onSend when send button is pressed with valid text', () => {
      const onSend = jest.fn();
      const props = {
        text: 'Test message',
        onSend,
      };
  
      const { getByTestId } = render(<CustomInputToolbar {...props} />);
      const sendButton = getByTestId('send-button');
      
      fireEvent.press(sendButton);
      expect(onSend).toHaveBeenCalledWith({ text: 'Test message' }, true);
    });
  
    it('does not call onSend when send button is pressed with empty text', () => {
      const onSend = jest.fn();
      const props = {
        text: '',
        onSend,
      };
  
      const { getByTestId } = render(<CustomInputToolbar {...props} />);
      const sendButton = getByTestId('send-button');
      
      fireEvent.press(sendButton);
      expect(onSend).not.toHaveBeenCalled();
    });
  });