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
  import { sendMessage, subscribeToMessages, createChatIfNotPresent } from '../../firebase/chat/chat';
  
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
  
  // Mock getUser function
  jest.mock('../../firebase/firestore/firestore', () => ({
    getUser: jest.fn(),
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
        (doc as jest.Mock).mockReturnValue('chatRef');
        (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });
        (collection as jest.Mock).mockReturnValue('messagesCollection');
        (addDoc as jest.Mock).mockResolvedValue({});
  
        await sendMessage('testChatId', 'Hello world');
  
        // Verify function calls
        expect(getUser).toHaveBeenCalledWith('testUID');
        expect(doc).toHaveBeenCalledWith(db, 'chats', 'testChatId');
        expect(collection).toHaveBeenCalledWith(db, 'chats', 'testChatId', 'messages');
        expect(addDoc).toHaveBeenCalledWith('messagesCollection', {
          content: 'Hello world',
          sentBy: 'testUID',
          sentOn: expect.any(Number),
        });
      });
    });
  
    describe('subscribeToMessages', () => {
      it('should set up subscription correctly', () => {
        const mockCallback = jest.fn();
        const mockUnsubscribe = jest.fn();
        
        // Mock implementations
        (doc as jest.Mock).mockReturnValue('chatRef');
        (collection as jest.Mock).mockReturnValue('messagesCollection');
        (query as jest.Mock).mockReturnValue('query');
        (orderBy as jest.Mock).mockReturnValue('orderedQuery');
        (onSnapshot as jest.Mock).mockImplementation((query, callback) => {
          // Simulate snapshot
          callback({
            docs: [{
              id: 'msg1',
              data: () => ({
                content: 'Test message',
                sentBy: 'user1',
                sentOn: new Date(),
              }),
            }],
          });
          return mockUnsubscribe;
        });
  
        const unsubscribe = subscribeToMessages('testRequestId', mockCallback);
  
        // Verify query setup
        expect(doc).toHaveBeenCalledWith(db, 'chats', 'testRequestId');
        expect(collection).toHaveBeenCalledWith('chatRef', 'messages');
        expect(query).toHaveBeenCalledWith('messagesCollection', 'orderedQuery');
        expect(orderBy).toHaveBeenCalledWith('sentOn', 'desc');
  
        // Verify callback was called with transformed messages
        expect(mockCallback).toHaveBeenCalledWith(expect.arrayContaining([
          expect.objectContaining({
            _id: 'msg1',
            text: 'Test message',
            user: { _id: 'user1' },
          }),
        ]));
  
        // Verify unsubscribe function is returned
        expect(unsubscribe).toBe(mockUnsubscribe);
      });
    });
  
    describe('createChatIfNotPresent', () => {
      it('should create new chat if it does not exist', async () => {
        // Mock implementations
        (collection as jest.Mock).mockReturnValue('chatsCollection');
        (doc as jest.Mock).mockReturnValue('chatRef');
        (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
        (serverTimestamp as jest.Mock).mockReturnValue('timestamp');
        (setDoc as jest.Mock).mockResolvedValue(undefined);
  
        await createChatIfNotPresent('testRequestId');
  
        expect(collection).toHaveBeenCalledWith(db, 'chats');
        expect(doc).toHaveBeenCalledWith('chatsCollection', 'testRequestId');
        expect(setDoc).toHaveBeenCalledWith('chatRef', {
          createdAt: 'timestamp',
        });
      });
  
      it('should not create chat if it already exists', async () => {
        // Mock implementations
        (collection as jest.Mock).mockReturnValue('chatsCollection');
        (doc as jest.Mock).mockReturnValue('chatRef');
        (getDoc as jest.Mock).mockResolvedValue({ exists: () => true });
  
        await createChatIfNotPresent('testRequestId');
  
        expect(setDoc).not.toHaveBeenCalled();
      });
    });
  });