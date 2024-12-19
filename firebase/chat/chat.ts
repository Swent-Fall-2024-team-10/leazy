import { 
    getFirestore, 
    collection, 
    doc,
    addDoc,
    getDoc,
    query,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    Timestamp, 
    onSnapshot,
    where,
    setDoc
  } from 'firebase/firestore';
  
  interface ChatData {
    issue: string;
    tenant: string;
    landlord: string;
    createdAt: Timestamp;
  }
  
  interface MessageData {
    content: string;
    sentBy: 'tenant' | 'landlord';
    sentOn: Timestamp;
  }
  
  import { db } from "../../firebase/firebase";
  import { auth } from "../../firebase/firebase";
import { getUser } from '../firestore/firestore';
import { IMessage } from 'react-native-gifted-chat';

  
  export async function sendMessage(chatId: string, content: string): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('User must be logged in');
    }

    const user = await getUser(auth.currentUser.uid)
  
    const chatRef = doc(db, 'chats', chatId);
    const chat = await getDoc(chatRef);
  
    if (!chat.exists()) {
      throw new Error('Chat not found');
    }
  
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      content: content,
      sentBy: user?.uid,
      sentOn: Date.now()
    });
  }
  
  // Subscribe to messages in a chat
export function subscribeToMessages(
  requestId: string,
  onMessagesUpdate: (messages: IMessage[]) => void
): () => void {
  const chatRef = doc(db, 'chats', requestId);
  const messagesRef = collection(chatRef, 'messages');
  const q = query(messagesRef, orderBy('sentOn', 'desc'));

  // Subscribe to the query
  const unsub = onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        _id: doc.id,
        text: data["content"],
        createdAt: data["sentOn"],
        user: {
          _id: data["sentBy"],
        },
      } as IMessage;
    });

    // Update the messages state in the View
    onMessagesUpdate(messages);
  });

  // Return the unsubscribe function
  return unsub;
}

  export async function createChatIfNotPresent(requestId: string): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('User must be logged in');
    }
  
    const chatRef = collection(db, 'chats');
    const chatDocRef = doc(chatRef, requestId); // Create a reference with requestId as the document ID
  
    // Check if a chat with the given requestId already exists
    const existingChat = await getDoc(chatDocRef);
    if (existingChat.exists()) {
      console.log('Chat already exists');
      return;
    }
  
    // If no matching chat exists, create a new one with requestId as the document ID
    console.log('Creating new chat');
    await setDoc(chatDocRef, {
      createdAt: serverTimestamp(),
    });
}
  
  