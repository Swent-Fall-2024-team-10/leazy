import React from 'react';
import { StyleSheet } from 'react-native';
import { Bubble } from 'react-native-gifted-chat';

const CustomBubble = (props: any) => {
  return (
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
};

export default CustomBubble;

const styles = StyleSheet.create({
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
});
