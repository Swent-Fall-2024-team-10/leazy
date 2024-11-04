import React, { useState, useLayoutEffect, useCallback } from "react";
import { IMessage, GiftedChat, Bubble } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth, db } from "../../../firebase/firebase";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chat() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [userSignedIn, setUserSignedIn] = useState(false); // Track if the user is signed in

  useLayoutEffect(() => {
    // const signInMockUser = async () => {
    //   try {
    //     // Attempt to sign in the mock user
    //     await signInWithEmailAndPassword(
    //       auth,
    //       "mockuser@example.com",
    //       "mockPassword123"
    //     );
    //     console.log("User signed in successfully");
    //     setUserSignedIn(true); // User signed in successfully
    //   } catch (error) {
    //     console.error("Error signing in:", error);
    //   }
    // };

    // signInMockUser();
  }, []);

  useLayoutEffect(() => {
    if (!userSignedIn) return; // Wait until the user is signed in

    const currentUserEmail = auth?.currentUser?.email;
    console.log("currentUserEmail: ", currentUserEmail);

    if (currentUserEmail) {
      const collectionRef = collection(db, "chats");

      // Fetch all messages in Firestore
      const q = query(
        collectionRef,
        orderBy("createdAt", "desc") // Order by createdAt without filtering on Firestore
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const allMessages = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            _id: data._id,
            createdAt: data.createdAt.toDate(),
            text: data.text,
            user: data.user, // Sender info
          } as IMessage;
        });

        // Filter messages where the current user is either the sender or the receiver
        const userMessages = allMessages.filter(
          (message) => message.user._id === currentUserEmail
        );

        setMessages(userMessages);
        console.log("filtered messages", userMessages);
      });

      return () => unsubscribe();
    }
  }, [userSignedIn]); // Depend on the user being signed in

  const onSend = useCallback((messages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
    const { _id, createdAt, text, user } = messages[0];

    // Define the receiver email (this could come from the chat context, or manually set for now)
    const receiverEmail = "fakelandlord@leasyswent.com"; // Replace with dynamic receiver if needed

    // Add the message to Firestore with sender and receiver info
    addDoc(collection(db, "chats"), {
      _id,
      createdAt,
      text,
      user, // Sender's info
    });
  }, []);

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#0F5257", // Other user's bubble background color
          },
          right: {
            backgroundColor: "#FFFFFF", // Current user's bubble background color
            borderWidth: 1, // Add stroke (border)
            borderColor: "#7F7F7F", // Stroke color
          },
        }}
        textStyle={{
          left: {
            color: "#FFFFFF", // Text color for other user's message
          },
          right: {
            color: "#000000", // Text color for current user's message
          },
        }}
      />
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, paddingBottom: 5, backgroundColor: "white" }}
    >
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={false}
        showUserAvatar={false}
        onSend={(messages) => onSend(messages)}
        messagesContainerStyle={{
          backgroundColor: "#fff",
        }}
        placeholder={"New message"}
        user={{
          _id: auth?.currentUser?.email || "", // Using current user's email as the ID
        }}
        renderBubble={renderBubble}
      />
    </SafeAreaView>
  );
}
