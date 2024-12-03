import React, { useState, useCallback } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { GiftedChat, Bubble, Composer, IMessage } from "react-native-gifted-chat";
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "../../../firebase/firebase";
import Header from "../../components/Header";
import { appStyles } from "../../../styles/styles";
import { ReportStackParamList } from "../../../types/types";
import { useAuth } from "../../Navigators/AuthContext";
import CustomInputToolbar from "../../components/messaging/CustomInputToolbar";
import CustomBubble from "../../components/messaging/CustomBubble";
import { Key } from "react-native-feather";


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
            _id: auth?.currentUser?.email || "",
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
    marginBottom: 10,
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
