import { chatStyles } from '../../../styles/styles';
import React from 'react';
import { Bubble } from 'react-native-gifted-chat';

const CustomBubble = (props: any) => {
  return (
    <Bubble
      {...props}
      wrapperStyle={{
        left: chatStyles.bubbleLeft,
        right: chatStyles.bubbleRight,
      }}
      textStyle={{
        left: chatStyles.bubbleTextLeft,
        right: chatStyles.bubbleTextRight,
      }}
      timeTextStyle={{
        left: chatStyles.timeText,
        right: chatStyles.timeText,
      }}
      renderTime={() => null}
    />
  );
};

export default CustomBubble;
