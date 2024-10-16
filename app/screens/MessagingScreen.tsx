import React, { useState, useLayoutEffect, useCallback } from "react";
import { IMessage, GiftedChat } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  where,
} from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth, db } from "../../firebase/firebase";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chat() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [userSignedIn, setUserSignedIn] = useState(false); // Track if the user is signed in

  useLayoutEffect(() => {
    const signInMockUser = async () => {
      try {
        // Attempt to sign in the mock user
        await signInWithEmailAndPassword(
          auth,
          "mockuser@example.com",
          "mockPassword123"
        );
        console.log("User signed in successfully");
        setUserSignedIn(true); // User signed in successfully
      } catch (error) {
        console.error("Error signing in:", error);
      }
    };

    signInMockUser();
  }, []);

  useLayoutEffect(() => {
    if (!userSignedIn) return; // Wait until the user is signed in

    const currentUserEmail = auth?.currentUser?.email;
    console.log("currentUserEmail: ", currentUserEmail);

    if (currentUserEmail) {
      const collectionRef = collection(db, "chats");

      // Add a where clause to filter by the current user's email
      const q = query(
        collectionRef,
        orderBy("createdAt", "desc") // Order by createdAt without filtering on Firestore
      );

      console.log("list of messages: ", q);

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const allMessages = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            _id: data._id,
            createdAt: data.createdAt.toDate(),
            text: data.text,
            user: data.user,
          } as IMessage;
        });

        // Filter the messages that belong to the current user
        const userMessages = allMessages.filter(
          (message) => message.user._id === currentUserEmail
        );

        setMessages(userMessages);

        console.log("messages", userMessages);
      });

      return () => unsubscribe();
    }
  }, [userSignedIn]); // Depend on the user being signed in

  const onSend = useCallback((messages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
    const { _id, createdAt, text, user } = messages[0];

    // Add the message to Firestore
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
        onSend={(messages) => onSend(messages)}
        messagesContainerStyle={{
          backgroundColor: "#fff",
        }}
        user={{
          _id: auth?.currentUser?.email || "", // Using current user's email as the ID
          avatar: "https://i.pravatar.cc/300",
        }}
      />
    </SafeAreaView>
  );
}
