import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Composer } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { chatStyles } from '../../../styles/styles';

const CustomInputToolbar = (props: any) => {
  return (
    <View style={chatStyles.input}>
        <View testID='input-field' style={{flex: 1}}>
        <Composer
            {...props}
            textInputStyle={chatStyles.textInput}
            placeholder="New message"></Composer>    
        </View>
      <TouchableOpacity
      testID='send-button'
        onPress={() => {
          if (props.text && props.onSend) {
            props.onSend({ text: props.text.trim() }, true);
          }
        }}
        style={chatStyles.sendButton}
      >
        <Icon name="send" size={24} style={chatStyles.sendIcon} />
      </TouchableOpacity>
    </View>
  );
};

export default CustomInputToolbar;
