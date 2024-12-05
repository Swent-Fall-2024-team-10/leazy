import React from 'react';
import {TextInput, StyleSheet, ViewStyle} from 'react-native';

export default function CustomTextField({
  value,
  onChangeText,
  placeholder,
  testID,
  keyboardType = 'default',
  autoCapitalize = 'none',
  secureTextEntry = false,
  style
}: {
  testID: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  style?: ViewStyle | ViewStyle[];
}) {
  return (
      <TextInput
        testID={testID}
        style={[styles.input, styles.inputText, style]}
        placeholder={placeholder}
        placeholderTextColor={'#7F7F7F'}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
      />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 47,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#7F7F7F',
    backgroundColor: '#D6D3F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    flexShrink: 0,
    paddingLeft: 16,
    textAlign: 'left',
    alignItems: 'center',
  },
  inputText: {
    flexShrink: 0,
    color: '#7F7F7F',
    textAlign: 'left',
    fontFamily: 'Inter',
    fontSize: 20,
    fontStyle: 'normal',
    fontWeight: '400',
    letterSpacing: 0.2,
    alignItems: 'center',
  },
});