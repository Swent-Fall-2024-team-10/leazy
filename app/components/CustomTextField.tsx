import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function CustomTextField({
    value,
    onChangeText,
    placeholder,
    testID,
    keyboardType = 'default',   // default value for keyboardType
    autoCapitalize = 'none',    // default value for autoCapitalize
    secureTextEntry = false     // default value for secureTextEntry
  }: {
    testID: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad', // specify accepted types
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters',       // specify accepted types
    secureTextEntry?: boolean
  }) {
    return (
      <View>
        <TextInput
          testID={testID}
          style={[styles.input, styles.inputText]}
          placeholder={placeholder}
          placeholderTextColor={'#7F7F7F'}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}        // added keyboardType prop
          autoCapitalize={autoCapitalize}    // added autoCapitalize prop
          secureTextEntry={secureTextEntry}  // added secureTextEntry prop
        />
      </View>
    );
  }

const styles = StyleSheet.create({
    input: {
        width: 246,
        height: 47,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#7F7F7F',
        backgroundColor: '#D6D3F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,  // Required for Android shadow support
        flexShrink: 0, // Prevents the element from shrinking
        paddingLeft: 16,
        marginBottom: 23,
        textAlign: 'left',
        alignItems: 'center',
      },
      inputText: {
        flexShrink: 0,  // Prevents shrinking
        color: '#7F7F7F',
        textAlign: 'left',
        fontFamily: 'Inter',  // Ensure Inter font is loaded in your project
        fontSize: 20,
        fontStyle: 'normal',
        fontWeight: '400',
        letterSpacing: 0.2,
        alignItems: 'center',
      },
});