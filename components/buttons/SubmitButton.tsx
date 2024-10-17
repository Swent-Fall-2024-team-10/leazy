import React from "react";
import { View } from "react-native";
import { StyleSheet } from "react-native";
import { Button } from "react-native-elements";
import { Color, FontSizes } from "@/styles/styles";
import DropShadow from "react-native-drop-shadow";

interface SubmitButtonProps {
  disabled : boolean;
  onPress: () => void;
}

export default function SubmitButton({ disabled = true, onPress} : SubmitButtonProps) {
  return (
    <DropShadow style={styles.submitContainer}>
        <Button
        title="Submit"

        onPress={onPress}
        buttonStyle={[
          styles.submitButton,
        ]}

        titleStyle={[
          styles.submitText,
  
        ]}
        disabled={disabled} // Disable button interaction
        disabledStyle={styles.submitButtonDisabled}
      />
    </DropShadow>

  );
}

const styles = StyleSheet.create({
    submitContainer: {
        alignItems: 'center',
        shadowColor: '#171717',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 2,
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
        fontSize: FontSizes.ButtonText,
        color: Color.ButtonText
    },

});
