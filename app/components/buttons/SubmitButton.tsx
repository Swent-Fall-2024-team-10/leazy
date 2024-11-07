import React from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "react-native-elements";
import { Color, FontSizes, FontWeight } from "@/styles/styles";
//import DropShadow from "react-native-drop-shadow";

interface SubmitButtonProps {
  disabled : boolean;
  onPress: () => void;
  width: number;
  height: number;
  label: string;
  testID: string;
  style: any;
  textStyle: any;
}

export default function SubmitButton({ disabled, onPress, width, height, label, testID, style, textStyle } : SubmitButtonProps) {
  return (
    <View style={styles.submitContainer}>
        <Button
        title={label}

        onPress={onPress}
        buttonStyle={[
          style,
          {
            width: width,
            height: height,
          },
        ]}

        titleStyle={[
          textStyle
        ]}
        disabled={disabled} // Disable button interaction
        disabledStyle={styles.submitButtonDisabled}
        testID={testID}
      />
    </View>

  );
}

const styles = StyleSheet.create({
    submitContainer: {
        alignItems: 'center',
        shadowColor: '#171717',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 2,
        padding: '5%',
    },

    submitButton : {
        backgroundColor: Color.ButtonBackground,
        borderColor: Color.ButtonBorder,
        borderWidth: 1,
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
      width: 170,
      height: 44,
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },

    submitText : {
        textAlign: 'center',
        fontSize: FontSizes.ButtonText,
        color: Color.ButtonText,
        fontWeight: '800'
    },

});
