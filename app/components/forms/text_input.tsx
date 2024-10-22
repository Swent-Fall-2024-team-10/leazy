import React from "react";
import { View, Text, TextInput, TextStyle, StyleSheet, KeyboardAvoidingView } from "react-native";
import DropShadow from "react-native-drop-shadow";
import { Color } from "@/styles/styles";

interface InputFieldProps {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
  height: number;
  radius: number;
  width: number;
  backgroundColor: string;
}


export default function InputField({ label, value, setValue, placeholder, height = 40, width = 100, radius = 25} : InputFieldProps) {
  return (
    <View >
      <Text style={styles.label}> {label} </Text>
      <DropShadow style={styles.shadow}>
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
          placeholderTextColor={Color.TextInputPlaceholder}
        />
      </DropShadow>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#171717',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },

  inputField : {
    flex: 1,
    backgroundColor: Color.TextInputBackground,
    padding: 10,
    borderColor: Color.TextInputBorder,
    borderWidth: 1,
    color: Color.TextInputText,
  },

  label : {
    fontSize: 16,
    marginBottom: 2.5,
    fontWeight: "500",
    color: Color.TextInputLabel,
  }

});
