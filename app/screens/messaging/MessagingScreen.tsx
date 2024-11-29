import React, { useState, useCallback } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { Icon } from 'react-native-elements'
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { GiftedChat, Bubble, Composer, IMessage } from "react-native-gifted-chat";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase/firebase";
import Header from "../../components/Header";
import { appStyles } from "../../../styles/styles";
import { ReportStackParamList } from "../../../types/types";
import { useAuth } from "@/app/Navigators/AuthContext";

export default function MessagingScreen() {
  const navigation = useNavigation<NavigationProp<ReportStackParamList>>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<IMessage[]>([]);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));

    const { _id, createdAt, text, user } = newMessages[0];
    addDoc(collection(db, "chats"), { _id, createdAt, text, user });
  }, []);

  const renderInputToolbar = (props: any) => (
    <View style={styles.input}>
      <Composer
        {...props}
        textInputProps={{
          ...props.textInputProps,
          style: styles.textInput,
        }}
      />
      <TouchableOpacity
        onPress={() => {
          if (props.text && props.onSend) {
            props.onSend({ text: props.text.trim() }, true);
          }
        }}
        style={styles.sendButton}
      >
        <Icon name="send" size={24} style={styles.sendIcon} />
      </TouchableOpacity>
    </View>
  );

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: styles.bubbleLeft,
        right: styles.bubbleRight,
      }}
      textStyle={{
        left: styles.bubbleTextLeft,
        right: styles.bubbleTextRight,
      }}
      timeTextStyle={{
        left: styles.timeText,
        right: styles.timeText,
      }}
      renderTime={() => null}
    />
  );

  return (
    <Header>
      <View style={appStyles.screenContainer}>
        <SafeAreaView>
          <View style={styles.container}>
            <TouchableOpacity onPress={() => {
              console.log("navifating to issues")
              navigation.navigate("Issues");
            }}
            style={{padding: 10
          }}>
              <ArrowLeft size={24} color={styles.gobackIcon.color} />
            </TouchableOpacity>
            <Text style={styles.title}>Apartment manager</Text>
          </View>
        </SafeAreaView>

        <GiftedChat
          renderBubble={renderBubble}
          messages={messages}
          onSend={onSend}
          messagesContainerStyle={styles.chatContainer}
          placeholder="New message"
          user={{
            _id: auth?.currentUser?.email || "",
          }}
          renderInputToolbar={renderInputToolbar}
        />
      </View>
    </Header>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    flex: 1,
    marginLeft: -24, // Offset the back button width
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    height: 47,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#7F7F7F",
    backgroundColor: "#FFFFFF",
    elevation: 4,
    alignSelf: "center",
    marginVertical: 25,
    paddingLeft: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  sendButton: {
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  bubbleLeft: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    marginLeft: 8,
  },
  bubbleRight: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#7F7F7F",
    marginRight: 8,
  },
  bubbleTextLeft: {
    color: "#000000",
  },
  bubbleTextRight: {
    color: "#000000",
  },
  timeText: {
    color: "#7F7F7F",
  },
  chatContainer: {
    backgroundColor: "#fff",
  },
  gobackIcon: {
    color: "#000000",
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sendIcon: {
    color: "#CCCCCC",
  },
});
