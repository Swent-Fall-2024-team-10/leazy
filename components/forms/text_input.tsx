import React from "react";
import { View, Text, TextInput, TextStyle, StyleSheet } from "react-native";

interface InputFieldProps {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
}


export default function InputField({ label, value, setValue, placeholder} : InputFieldProps) {
  return (
    <View>
    <Text style={styles.label}> {label} </Text>
    <TextInput
      style={styles.inputField}
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
    borderRadius: 100,
    borderColor: "#7F7F7F",
    borderWidth: 1,
    color: "#9C92A3",
  },

  label : {
    fontSize: 16,
    marginBottom: 2.5,
  }

});
