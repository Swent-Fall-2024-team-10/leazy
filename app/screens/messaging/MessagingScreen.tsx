import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { auth, db } from "../../../firebase/firebase";
import Header from "../../components/Header";
import { appStyles } from "../../../styles/styles";
import { ReportStackParamList } from "../../../types/types";
import { useAuth } from "../../context/AuthContext";
import CustomInputToolbar from "../../components/messaging/CustomInputToolbar";
import CustomBubble from "../../components/messaging/CustomBubble";

import {createChatIfNotPresent, sendMessage, subscribeToMessages} from "../../../firebase/chat/chat"


export default function MessagingScreen() {
  const navigation = useNavigation<NavigationProp<ReportStackParamList>>();
  const route = useRoute<RouteProp<ReportStackParamList, "Messaging">>();
  const { chatID } = route.params;
  const [messages, setMessages] = useState<IMessage[]>([]);

  
  useEffect(() => {
    createChatIfNotPresent(chatID);

    console.log("Retrieving messages");
  
    // Subscribe to messages
    const unsub = subscribeToMessages(chatID, (newMessages) => {
      setMessages(newMessages); // Update state with new messages
    });

    // Cleanup subscription on component unmount
    return () => unsub();
  }, []); // Include dependencies*/
  
  
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    //setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
    try {
      await sendMessage(chatID, newMessages[0].text);
    } catch (error) {
      console.error('Error sending message:', (error as Error).message);
    }

  }, []);
  
  const renderInputToolbar = (props: any) => (
    <CustomInputToolbar {...props}>
    </CustomInputToolbar>
  );

  const renderBubble = (props: any) => (
    <CustomBubble {...props}>
    </CustomBubble>
  );

  return (
    <Header>
      <View style={appStyles.screenContainer}>
        <SafeAreaView>
          <View style={styles.container}>
            <TouchableOpacity
            testID="arrow-left" 
            onPress={() => {
              console.log("navigating to issues")
              Keyboard.dismiss();
              navigation.navigate("Issues");
            }}
            style={{padding: 10
          }}>
              <ArrowLeft size={24} color={styles.gobackIcon.color} />
            </TouchableOpacity>
            <Text style={styles.chatTitle}>Apartment manager</Text>
          </View>
        </SafeAreaView>

        <View testID="gifted-chat" style={{flex:1}}>
        <GiftedChat
          renderBubble={renderBubble}
          messages={messages}
          onSend={onSend}
          messagesContainerStyle={styles.chatContainer}
          placeholder="New message"
          user={{
            _id: auth?.currentUser?.uid || "0", // "0" is a fallback
          }}
          renderInputToolbar={renderInputToolbar}
        />
        </View>
      </View>
    </Header>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "5%",
    marginHorizontal: "5%",
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    flex: 1,
    marginLeft: -24, // Offset the back button width
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
});
