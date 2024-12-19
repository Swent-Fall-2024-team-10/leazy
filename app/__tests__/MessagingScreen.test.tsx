import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import MessagingScreen from '../screens/messaging/MessagingScreen';

// Mock Firebase functions
jest.mock('../../firebase/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'testUID',
    },
  },
  db: {}, // Mock Firestore database object
}));


// Mock chat functions
jest.mock('../../firebase/firestore/firestore', () => ({
  createChatIfNotPresent: jest.fn(),
  sendMessage: jest.fn(),
  getUser: jest.fn().mockResolvedValue({ type: 'tenant' }), // Add this line
  subscribeToMessages: jest.fn((chatID, callback) => {
    // Simulate initial messages load
    callback([
      {
        _id: '1',
        text: 'Test Message',
        createdAt: new Date(),
        user: { _id: 'testUID' },
      },
    ]);
    // Return mock unsubscribe function
    return jest.fn();
  }),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { chatID: 'mockChatID' },
  }),
}));

// Mock authentication context
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { uid: 'testUID' },
  })),
}));

// Mock Keyboard.dismiss
jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {
  return;
});

// Mock custom components
jest.mock('../components/Header', () => 'Header');
jest.mock('../components/messaging/CustomInputToolbar', () => 'CustomInputToolbar');
jest.mock('../components/messaging/CustomBubble', () => 'CustomBubble');

// Mock GiftedChat
jest.mock('react-native-gifted-chat', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  
  const GiftedChat = ({ onSend, user, messages }: { onSend: Function; user: any; messages: any[] }) => (
    <TouchableOpacity
      testID="send-button"
      onPress={() =>
        onSend([
          { _id: '1', text: 'Test Message', createdAt: new Date(), user },
        ])
      }
    >
      <Text>Send</Text>
    </TouchableOpacity>
  );

  return {
    GiftedChat,
    Bubble: 'Bubble',
    InputToolbar: 'InputToolbar',
    Composer: 'Composer',
  };
});

describe('MessagingScreen', () => {
  const { createChatIfNotPresent, sendMessage, subscribeToMessages } = require('../../firebase/firestore/firestore');
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByTestId } = render(<MessagingScreen />);
    expect(getByTestId('gifted-chat')).toBeTruthy();
  });

  it('initializes chat and subscribes to messages on mount', () => {
    render(<MessagingScreen />);
    expect(createChatIfNotPresent).toHaveBeenCalledWith('mockChatID');
    expect(subscribeToMessages).toHaveBeenCalledWith('mockChatID', expect.any(Function));
  });

  it('navigates back and dismisses keyboard when pressing the back button', () => {
    const mockGoBack = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: jest.fn(),
      goBack: mockGoBack,
    });

    const { getByTestId } = render(<MessagingScreen />);
    const backButton = getByTestId('arrow-left');
    fireEvent.press(backButton);

    expect(Keyboard.dismiss).toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  /*it('should send message when pressing send button', async () => {
    const { getByTestId } = render(<MessagingScreen />);
    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    expect(sendMessage).toHaveBeenCalledWith('mockChatID', 'Test Message');
  });*/

  it('should handle send message error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    sendMessage.mockRejectedValueOnce(new Error('Send failed'));

    const { getByTestId } = render(<MessagingScreen />);
    const sendButton = getByTestId('send-button');
    fireEvent.press(sendButton);

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(consoleSpy).toHaveBeenCalledWith('Error sending message:', 'Send failed');
    consoleSpy.mockRestore();
  });
});