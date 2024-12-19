import React, { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, Keyboard, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { auth, db } from "../../../firebase/firebase";
import Header from "../../components/Header";
import { chatStyles, appStyles, IconDimension } from "../../../styles/styles";
import { ReportStackParamList } from "../../../types/types";
import { useAuth } from "../../context/AuthContext";
import CustomInputToolbar from "../../components/messaging/CustomInputToolbar";
import CustomBubble from "../../components/messaging/CustomBubble";

import {createChatIfNotPresent, sendMessage, subscribeToMessages} from "../../../firebase/firestore/firestore"
import NetInfo from '@react-native-community/netinfo';


export default function MessagingScreen() {
  const navigation = useNavigation<NavigationProp<ReportStackParamList>>();
  const route = useRoute<RouteProp<ReportStackParamList, "Messaging">>();
  const { chatID } = route.params;
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isAlertAcknowledged, setIsAlertAcknowledged] = useState(false);
  
  useEffect(() => {
    createChatIfNotPresent(chatID);

    console.log("Retrieving messages");
  
    // Subscribe to messages
    const unsub = subscribeToMessages(chatID, (newMessages) => {
      setMessages(newMessages); // Update state with new messages
    });

    // Cleanup subscription on component unmount
    return () => unsub();
  }, [isAlertAcknowledged]); // Include dependencies*/
  
  
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    // TODO add online check here if device isn't online alert
    const netInfo = await NetInfo.fetch();

    if (!netInfo.isConnected) {
      Alert.alert(
        'No Internet Connection',
        'You are offline. Please check your internet connection and try again.'
      );
      return;
    }

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
          <View style={chatStyles.container}>
            <TouchableOpacity
            testID="arrow-left" 
            onPress={() => {
              console.log("navigating to issues")
              Keyboard.dismiss();
              navigation.goBack();
            }}
            style={{padding: 10
          }}>
              <ArrowLeft size={IconDimension.smallIcon} color={chatStyles.gobackIcon.color} />
            </TouchableOpacity>
            <Text style={chatStyles.chatTitle}>Apartment manager</Text>
            <View style={{width:IconDimension.smallIcon}}>
              {/*For the centering of the title*/}
          </View>
          </View>
          
        </SafeAreaView>

        <View testID="gifted-chat" style={{flex:1}}>
        <GiftedChat
          renderBubble={renderBubble}
          messages={messages}
          onSend={onSend}
          messagesContainerStyle={chatStyles.chatContainer}
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