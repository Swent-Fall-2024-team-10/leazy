import { 
  sendMessage, 
  subscribeToMessages, 
  createChatIfNotPresent 
} from '../../../../firebase/chat/chat';
import { auth } from '../../../../firebase/firebase';
import { getUser } from '../../../../firebase/firestore/firestore';
import { 
  doc, 
  getDoc, 
  addDoc, 
  collection, 
  onSnapshot, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Mock Firebase modules
jest.mock('../../../../firebase/firebase', () => ({
  db: {},
  auth: {
    get currentUser() { return this._currentUser; },
    set currentUser(user) { this._currentUser = user; },
    _currentUser: null
  }
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => 'mockedDocRef'),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  collection: jest.fn(() => 'mockedCollectionRef'),
  onSnapshot: jest.fn(),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn()
}));

jest.mock('../../../../firebase/firestore/firestore', () => ({
  getUser: jest.fn()
}));

describe('Chat Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('throws error if user is not logged in', async () => {
      auth.currentUser = null;
      await expect(sendMessage('chatId', 'message')).rejects.toThrow('User must be logged in');
    });

    it('throws error if chat does not exist', async () => {
      auth.currentUser = { uid: 'testUid' };
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
      
      await expect(sendMessage('chatId', 'message')).rejects.toThrow('Chat not found');
    });

    it('successfully sends a message', async () => {
      // Setup
      auth.currentUser = { uid: 'testUid' };
      (getUser as jest.Mock).mockResolvedValue({ uid: 'testUid' });
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });
      (collection as jest.Mock).mockReturnValue('mockedCollectionRef');
      
      // Action
      await sendMessage('chatId', 'Hello world');
      
      // Assert
      expect(addDoc).toHaveBeenCalledWith(
        'mockedCollectionRef',
        expect.objectContaining({
          content: 'Hello world',
          sentBy: 'testUid',
          sentOn: expect.any(Number)
        })
      );
    });
  });

  describe('subscribeToMessages', () => {
    it('returns unsubscribe function', () => {
      const unsubMock = jest.fn();
      (onSnapshot as jest.Mock).mockReturnValue(unsubMock);
      
      const onUpdate = jest.fn();
      const unsub = subscribeToMessages('requestId', onUpdate);
      
      expect(unsub).toBe(unsubMock);
    });

    it('transforms messages correctly', () => {
      const mockMessages = [
        {
          id: '1',
          data: () => ({
            content: 'test message',
            sentBy: 'user1',
            sentOn: new Date()
          })
        }
      ];

      let capturedCallback: any;
      (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
        capturedCallback = callback;
        return jest.fn();
      });

      const onUpdate = jest.fn();
      subscribeToMessages('requestId', onUpdate);

      capturedCallback({ docs: mockMessages });

      expect(onUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            text: 'test message',
            user: { _id: 'user1' }
          })
        ])
      );
    });
  });

  describe('createChatIfNotPresent', () => {

    it('does not create chat if it already exists', async () => {
      auth.currentUser = { uid: 'testUid' };
      (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });
      
      await createChatIfNotPresent('requestId');

      expect(setDoc).not.toHaveBeenCalled();    
    });
  });
});