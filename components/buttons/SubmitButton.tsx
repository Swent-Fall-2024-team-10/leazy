import React from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native";
import { Button } from "react-native-elements";
import { Color } from "@/types/types";

interface SubmitButtonProps {
  height?: number;
  disabled? : boolean;
}

export default function SubmitButton({ height, disabled = true } : SubmitButtonProps) {
  return (
    <View style={styles.submitContainer}>
        <Button
        title="Submit"
        
        onPress={() => console.log('Button Pressed')}
        buttonStyle={[
          styles.submitButton,
        ]}

        titleStyle={[
          styles.submitText,
  
        ]}
        disabled={disabled} // Disable button interaction
        disabledStyle={styles.submitButtonDisabled}
      />
    </View>

  );
}

const styles = StyleSheet.create({
    submitContainer: {
        alignItems: 'center',
    },

    submitButton : {
        backgroundColor: Color.ButtonBackground,
        borderColor: Color.ButtonBorder,
        borderWidth: 1,
        marginBottom: 100,
        width: 170,
        height: 44,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },

    submitButtonDisabled : {
      backgroundColor: Color.ButtonBackgroundDisabled,
      borderColor: Color.ButtonBorder,
      borderWidth: 1,
      marginBottom: 100,
      width: 170,
      height: 44,
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },

    submitText : {
        textAlign: 'center',
        fontSize: 20,
        color: Color.ButtonText
    },

});
