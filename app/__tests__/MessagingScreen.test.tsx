import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MessagingScreen from '../screens/messaging/MessagingScreen';
import { addDoc, collection } from 'firebase/firestore';

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
  })),
}));

// Mock authentication
jest.mock('../../firebase/firebase', () => ({
  auth: {
    currentUser: {
      email: 'test@example.com',
    },
  },
  db: {}, // Mock Firestore database object
}));

jest.mock('../Navigators/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { email: 'test@example.com' },
  })),
}));

// Mock GiftedChat
jest.mock('react-native-gifted-chat', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');

  const GiftedChat = ({ onSend, user }: { onSend: Function; user: any }) => (
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

  GiftedChat.append = jest.fn((currentMessages = [], messages = [], inverted = true) => {
    const allMessages = [...messages, ...currentMessages];
    return inverted ? allMessages.reverse() : allMessages;
  });

  return {
    GiftedChat,
    Bubble: 'Bubble',
    InputToolbar: 'InputToolbar',
    Composer: 'Composer',
  };
});

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
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: mockNavigate,
    });

    const { getByTestId } = render(<MessagingScreen />);
    const backButton = getByTestId('arrow-left');

    fireEvent.press(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('Issues');
  });

  it('should call append with correct parameters when a message is sent', async () => {
    const { getByTestId } = render(<MessagingScreen />);
    const sendButton = getByTestId('send-button');

    fireEvent.press(sendButton);

    // Assert that GiftedChat.append is called
    const { GiftedChat } = require('react-native-gifted-chat');
    expect(GiftedChat.append).toHaveBeenCalledWith(
      [],
      [
        {
          _id: '1',
          text: 'Test Message',
          createdAt: expect.any(Date),
          user: { _id: 'test@example.com' },
        },
      ],
    );
  });
});
