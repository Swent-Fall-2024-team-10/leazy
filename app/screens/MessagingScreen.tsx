import React, { useState, useLayoutEffect, useCallback } from "react";
import { IMessage, GiftedChat } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth, db } from "../../firebase/firebase";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chat() {
  const [messages, setMessages] = useState<IMessage[]>([]);

  useLayoutEffect(() => {

    // Sign-in a mock user with email and password. Need to delete this code after testing
    const signInMockUser = async () => {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        "test@test.com",
        "test@test.com"
      );
    };
    signInMockUser();

    const collectionRef = collection(db, "chats");
    const q = query(collectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log("querySnapshot unsubscribe");
      setMessages(
        querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            _id: data._id,
            createdAt: data.createdAt.toDate(),
            text: data.text,
            user: data.user,
          } as IMessage;
        })
      );
    });
    return unsubscribe;
  }, []);

  const onSend = useCallback((messages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
    // setMessages([...messages, ...messages]);
    const { _id, createdAt, text, user } = messages[0];
    addDoc(collection(db, "chats"), {
      _id,
      createdAt,
      text,
      user,
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, paddingBottom: 5, backgroundColor: "red" }}>
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={false}
        showUserAvatar={false}
        onSend={(messages) => onSend(messages)} // what do we do when the user sends a message
        messagesContainerStyle={{
          backgroundColor: "#fff",
        }}
        user={{
          _id: auth?.currentUser?.email || "",
          avatar: "https://i.pravatar.cc/300",
        }}
      />
    </SafeAreaView>
  );
}
