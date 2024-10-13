import React from "react";
import { View, Text, TextInput, TextStyle } from "react-native";

interface InputFieldProps {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
  containerStyle? : TextStyle;
  labelStyle? : TextStyle;
}


export default function InputField({ label, value, setValue, placeholder, containerStyle, labelStyle} : InputFieldProps) {
  return (
    <View>
    <Text style={labelStyle}> {label} </Text>
    <TextInput
      style={containerStyle}
      placeholder= {placeholder}
      value={value}
      onChangeText={setValue}
      multiline={true}
      placeholderTextColor={"#D6D3F0"}
    />
    </View>
  );
}
