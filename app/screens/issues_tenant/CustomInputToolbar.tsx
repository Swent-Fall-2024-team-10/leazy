import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Composer } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CustomInputToolbar = (props: any) => {
  return (
    <View style={styles.input}>
        <View testID='input-field'>
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
    sendIcon: {
    color: "#AAAAAA",
  },
});
