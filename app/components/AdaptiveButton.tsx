import { appStyles, defaultButtonRadius, ButtonDimensions, Color } from '../../styles/styles';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';

// portions of this code were generated with chatGPT as an AI assistant

interface ButtonProps {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  // parameters marked with ? are optional
}

const AdaptiveButton: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  icon, 
  iconPosition = 'left', 
  style, 
  textStyle 
}) => {
    // body of the function
  const iconElement = icon && (
    <View style={styles.iconContainer}>
      {icon}
    </View>
    // In tsx, && renders the right side if the left side is true
  );

  return (
    // rendering of the function
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      {iconPosition === 'left' && iconElement}
      <Text style={[appStyles.submitButtonText, textStyle]}>{title}</Text>
      {iconPosition === 'right' && iconElement}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: ButtonDimensions.veryLargeButtonWidth,
    height: ButtonDimensions.veryLargeButtonHeight,
    backgroundColor: Color.ButtonBackground, // dark green
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: defaultButtonRadius,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  iconContainer: {
    marginHorizontal: 5,
  },
});

export default AdaptiveButton;