import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Keyboard } from 'react-native';
import MessagingScreen from '../../../screens/messaging/MessagingScreen';

// Mock Firebase functions
jest.mock('../../../../firebase/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'testUID',
    },
  },
  db: {}, // Mock Firestore database object
}));

// Mock chat functions
jest.mock('../../../../firebase/firestore/firestore', () => ({
  createChatIfNotPresent: jest.fn(),
  sendMessage: jest.fn(),
  getUser: jest.fn().mockResolvedValue({ type: 'landlord' }), // Changed to landlord to get tenant userType
  subscribeToMessages: jest.fn((chatID, callback) => {
    callback([
      {
        _id: '1',
        text: 'Test Message',
        createdAt: new Date(),
        user: { _id: 'testUID' },
      },
    ]);
    return jest.fn();
  }),
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: { chatID: 'mockChatID' },
  }),
}));

// Rest of the mocks remain the same...
jest.mock('../../../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { uid: 'testUID' },
  })),
}));

jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {
  return;
});

jest.mock('../../../components/Header', () => 'Header');
jest.mock('../../../components/messaging/CustomInputToolbar', () => 'CustomInputToolbar');
jest.mock('../../../components/messaging/CustomBubble', () => 'CustomBubble');

jest.mock('react-native-gifted-chat', () => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  
  const GiftedChat = ({ onSend, user, messages }) => (
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
  const { createChatIfNotPresent, sendMessage, subscribeToMessages } = require('../../../../firebase/firestore/firestore');
  
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

  it('navigates back and dismisses keyboard when pressing the back button for tenant user', async () => {
    // Mock getUser to return landlord type (which sets userType to "Tenant")
    const { getUser } = require('../../../../firebase/firestore/firestore');
    getUser.mockResolvedValue({ type: 'landlord' });

    const { getByTestId } = render(<MessagingScreen />);
    
    // Wait for userType to be set after getUser resolves
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const backButton = getByTestId('arrow-left');
    fireEvent.press(backButton);

    expect(Keyboard.dismiss).toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('navigates to Issues screen and dismisses keyboard when pressing the back button for landlord user', async () => {
    // Mock getUser to return tenant type (which sets userType to "Landlord")
    const { getUser } = require('../../../../firebase/firestore/firestore');
    getUser.mockResolvedValue({ type: 'tenant' });

    const { getByTestId } = render(<MessagingScreen />);
    
    // Wait for userType to be set after getUser resolves
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const backButton = getByTestId('arrow-left');
    fireEvent.press(backButton);

    expect(Keyboard.dismiss).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('Issues');
  });

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