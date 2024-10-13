import React from "react";
import { View, Text, TextInput, TextStyle, StyleSheet } from "react-native";

interface InputFieldProps {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
  height?: number;
  radius?: number;
}


export default function InputField({ label, value, setValue, placeholder, height, radius} : InputFieldProps) {
  return (
    <View>
    <Text style={styles.label}> {label} </Text>
    <TextInput
      style={[
        styles.inputField,
        {
          height: height,
          borderRadius: radius || 100,
        },
        
      ]}
      placeholder= {placeholder}
      value={value}
      onChangeText={setValue}
      multiline={true}
      placeholderTextColor={"#7F7F7F"}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  inputField : {
    flex: 1,
    backgroundColor: "#D6D3F0",
    padding: 10,
    borderColor: "#7F7F7F",
    borderWidth: 1,
    color: "#0B3142",
  },

  label : {
    fontSize: 16,
    marginBottom: 2.5,
  }

});
