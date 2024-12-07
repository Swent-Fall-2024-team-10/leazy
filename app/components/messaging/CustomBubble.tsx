import { Color } from '@/styles/styles';
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
        backgroundColor: Color.chatBubbleLeftBackground,
        borderWidth: 1,
        borderColor: Color.chatBubbleLeftBorder,
        marginLeft: 8,
      },
      bubbleRight: {
        backgroundColor: Color.chatBubbleRightBackground,
        borderWidth: 1,
        borderColor: Color.chatBubbleRightBorder,
        marginRight: 8,
      },
      bubbleTextLeft: {
        color: Color.chatBubbleLeftText,
      },
      bubbleTextRight: {
        color: Color.chatBubbleRightText,
      },
      timeText: {
        color: Color.chatTimeText,
      },
});
