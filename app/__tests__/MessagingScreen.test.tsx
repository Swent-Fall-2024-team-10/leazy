import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MessagingScreen from '../screens/issues_tenant/MessagingScreen';
import CustomInputToolbar from '../screens/issues_tenant/CustomInputToolbar';
import CustomBubble from '../screens/issues_tenant/CustomBubble';
import { addDoc } from 'firebase/firestore';
import { auth } from '../../firebase/firebase';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { Navigation } from 'react-native-feather';
import { View } from 'react-native';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('../../firebase/firebase', () => ({
  auth: {
    currentUser: {
      email: 'test@example.com',
    },
  },
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
}));

jest.mock('../Navigators/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
  }),
}));

jest.mock('react-native-gifted-chat', () => {
  const mockMessage = {
    _id: '123',
    text: 'Test message',
    createdAt: new Date(),
    user: { _id: 'test@example.com' },
  };

  return {
    GiftedChat: 'GiftedChat',
    Bubble: 'Bubble',
    InputToolbar: 'InputToolbar',
    Composer: 'Composer',
}});

describe('MessagingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByTestId } = render(<MessagingScreen />);
    
    expect(getByText('Apartment manager')).toBeTruthy();
    expect(getByTestId('gifted-chat')).toBeTruthy();
  });

  it('navigates back when pressing the back button', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockImplementation(() => ({
      navigate: mockNavigate,
    }));

    const { getByTestId } = render(<MessagingScreen />);
    const backButton = getByTestId('arrow-left');
    
    fireEvent.press(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('Issues');
  });
});


describe('Sending Messages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('appends a new message to the chat when onSend is called', () => {
    const { getByTestId, getByText } = render(<View>
      <MessagingScreen/>
      <CustomInputToolbar />
    </View>);
    
    // Get input field and send button
    const inputField = getByTestId('input-field');
    const sendButton = getByTestId('send-button');

    // Mock user input
    fireEvent.changeText(inputField, 'Hello, this is a test message');

    // Press the send button
    fireEvent.press(sendButton);

    // Check if the message appears in the chat
    waitFor(() => {
      expect(getByText('Hello, this is a test message')).toBeTruthy();
    });
  });

  it('calls addDoc with the correct parameters when a message is sent', () => {
    const { getByTestId } = render(<View>
      <MessagingScreen/>
      <CustomInputToolbar />
    </View>);
    
    // Get input field and send button
    const inputField = getByTestId('input-field');
    const sendButton = getByTestId('send-button');

    // Mock user input
    fireEvent.changeText(inputField, 'Another test message');

    // Press the send button
    fireEvent.press(sendButton);

    // Check if addDoc was called with the correct arguments
    waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(expect.any(Object), {
        _id: expect.any(String),
        createdAt: expect.any(Date),
        text: 'Another test message',
        user: { _id: 'test@example.com' },
      });
    });
  });

  it('does not call addDoc if message text is empty', () => {
    const { getByTestId } = render(
      <View>
        <MessagingScreen/>
        <CustomInputToolbar />
      </View>
    );
    
    // Get send button
    const sendButton = getByTestId('send-button');

    // Press the send button with no text input
    fireEvent.press(sendButton);

    // Ensure addDoc is not called
    expect(addDoc).not.toHaveBeenCalled();
  });

  it('updates the messages state correctly after sending a message', () => {
    const { getByTestId } = render(<View>
      <MessagingScreen/>
      <CustomInputToolbar />
    </View>);
    
    // Get input field and send button
    const inputField = getByTestId('input-field');
    const sendButton = getByTestId('send-button');

    // Mock user input
    fireEvent.changeText(inputField, 'State update test message');

    // Press the send button
    fireEvent.press(sendButton);

    // Check if the messages state has been updated
    waitFor(() => {
      expect(addDoc).toHaveBeenCalled();
    });
  });
});