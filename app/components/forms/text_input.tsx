import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { appStyles, Color } from '../../../styles/styles';

interface InputFieldProps {
  label?: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  height?: number;
  width?: number;
  radius?: number;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  testID: string;
}

export default function InputField({
  label,
  value,
  setValue,
  placeholder,
  testID,
  height,
  width,
  radius,
  secureTextEntry = false,
  backgroundColor,
  style,
}: InputFieldProps) {
  const inputFieldStyles = [
    styles.inputField,
    width !== undefined && { width },
    height !== undefined && { height },
    radius !== undefined && { borderRadius: radius },
    backgroundColor !== undefined && { backgroundColor },
    style || {}, // Make style optional by providing an empty object as default
  ];

  const textInputComponent = (
    <TextInput
      style={inputFieldStyles}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      value={value}
      onChangeText={setValue}
      multiline={true}
      placeholderTextColor={Color.TextInputPlaceholder}
      testID={testID}
    />
  );

  if (label !== undefined) {
    return (
      <View>
        <Text style={appStyles.inputFieldLabel}>{label}</Text>
        {textInputComponent}
      </View>
    );
  } else {
    return textInputComponent;
  }
}

const styles = StyleSheet.create({
  inputField: {
    flex: 1,
    padding: 10,
    borderColor: Color.TextInputBorder,
    borderWidth: 1,
    color: Color.TextInputText,
    shadowColor: Color.ShadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
});
