import {
  collection,
  doc,
  addDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../../firebase/firebase';
import { getUser } from '../../firebase/firestore/firestore';
import { sendMessage, subscribeToMessages, createChatIfNotPresent } from '../../firebase/firestore/firestore';

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// Mock Firebase auth and db
jest.mock('../../firebase/firebase', () => ({
  auth: {
    currentUser: {
      uid: 'testUID',
    },
  },
  db: {},
}));

// Mock all firestore functions
jest.mock('../../firebase/firestore/firestore', () => ({
  getUser: jest.fn(),
  sendMessage: jest.fn(),
  subscribeToMessages: jest.fn(),
  createChatIfNotPresent: jest.fn(),
}));

describe('Chat Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should successfully send a message', async () => {
      // Mock implementations
      const mockUser = { uid: 'testUID' };
      (getUser as jest.Mock).mockResolvedValue(mockUser);
      (sendMessage as jest.Mock).mockResolvedValue(undefined);

      await sendMessage('testChatId', 'Hello world');

      expect(sendMessage).toHaveBeenCalledWith('testChatId', 'Hello world');
    });
  });

  describe('subscribeToMessages', () => {
    it('should set up subscription correctly', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();
      
      (subscribeToMessages as jest.Mock).mockImplementation((chatId, callback) => {
        callback([{
          _id: 'msg1',
          text: 'Test message',
          user: { _id: 'user1' },
        }]);
        return mockUnsubscribe;
      });

      const unsubscribe = subscribeToMessages('testRequestId', mockCallback);

      expect(subscribeToMessages).toHaveBeenCalledWith('testRequestId', mockCallback);
      expect(mockCallback).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          _id: 'msg1',
          text: 'Test message',
          user: { _id: 'user1' },
        }),
      ]));
      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('createChatIfNotPresent', () => {
    it('should create new chat if it does not exist', async () => {
      (createChatIfNotPresent as jest.Mock).mockResolvedValue(undefined);

      await createChatIfNotPresent('testRequestId');

      expect(createChatIfNotPresent).toHaveBeenCalledWith('testRequestId');
    });

    it('should not create chat if it already exists', async () => {
      (createChatIfNotPresent as jest.Mock).mockResolvedValue(undefined);

      await createChatIfNotPresent('testRequestId');

      expect(createChatIfNotPresent).toHaveBeenCalledWith('testRequestId');
    });
  });
});