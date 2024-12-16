import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Button } from 'react-native-elements';
import { Color, FontSizes } from '../../../styles/styles';

interface SubmitButtonProps {
  disabled: boolean;
  onPress: () => void;
  width: number;
  height: number;
  label: string;
  style?: any; // Add an optional style prop
  testID?: string;
  image?: any;
  textStyle?: any;
}

export default function SubmitButton({
  disabled,
  onPress,
  width,
  height,
  label,
  testID,
  style,
  textStyle,
  image,
}: SubmitButtonProps) {
  return (
    <Button
      title={label}
      onPress={onPress}
      buttonStyle={[
        {
          width: width,
          height: height,
          backgroundColor: Color.ButtonBackground,
          borderRadius: 100,
          borderColor: Color.ButtonBorder,
        },
        style,
      ]}
      icon={
        image ? (
          <Image source={image} style={styles.iconStyle} resizeMode='contain' />
        ) : undefined
      }
      iconPosition='left'
      disabled={disabled}
      disabledStyle={styles.submitButtonDisabled}
      testID={testID}
      titleStyle={[textStyle]}
    />
  );
}

const styles = StyleSheet.create({
  submitContainer: {
    alignItems: 'center',
    shadowColor: Color.ButtonBackground,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    padding: '5%',
  },

  submitButtonDisabled: {
    backgroundColor: Color.ButtonBackgroundDisabled,
    borderColor: Color.ButtonBorder,
    borderWidth: 1,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconStyle: {
    position: 'absolute',
    width: 25,
    height: 25,
    marginRight: '1%',
    left: '5%',
  },
});
