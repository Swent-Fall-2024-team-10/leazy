import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Composer } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Color } from '@/styles/styles';

const CustomInputToolbar = (props: any) => {
  return (
    <View style={styles.input}>
        <View testID='input-field' style={{flex: 1}}>
        <Composer
            {...props}
            textInputStyle={styles.textInput}
            placeholder="New message"></Composer>    
        </View>
      <TouchableOpacity
      testID='send-button'
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
};

export default CustomInputToolbar;

const styles = StyleSheet.create({
    input: {
        flexDirection: "row",
        alignItems: "center",
        width: "90%",
        height: "9%",
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "#7F7F7F",
        backgroundColor: "#FFFFFF",
        elevation: 4,
        alignSelf: "center",
        marginVertical: "10%",
        paddingLeft: "5%",
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: "#000",
    },
    sendButton: {
        marginHorizontal: "5%",
      },
    sendIcon: {
    color: "#AAAAAA",
  },
});
