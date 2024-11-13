import React from "react";
import { StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import { Button } from "react-native-elements";
import { Color, FontSizes } from "../../../styles/styles";

interface SubmitButtonProps {
  disabled: boolean;
  onPress: () => void;
  width: number;
  height: number;
  label: string;
  style?: StyleProp<ViewStyle>; // Add an optional style prop
}

export default function SubmitButton({
  disabled,
  onPress,
  width,
  height,
  label,
  style,
}: SubmitButtonProps) {
  return (
    <View style={styles.submitContainer}>
      <Button
        title={label}
        onPress={onPress}
        buttonStyle={[
          styles.submitButton,
          {
            width: width,
            height: height,
          },
          style, // Merge custom style prop
        ]}
        titleStyle={[styles.submitText]}
        disabled={disabled} // Disable button interaction
        disabledStyle={styles.submitButtonDisabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  submitContainer: {
    alignItems: "center",
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },

  submitButton: {
    backgroundColor: Color.ButtonBackground,
    borderColor: Color.ButtonBorder,
    borderWidth: 1,
    marginBottom: 200,
    width: 170,
    height: 44,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },

  submitButtonDisabled: {
    backgroundColor: Color.ButtonBackgroundDisabled,
    borderColor: Color.ButtonBorder,
    borderWidth: 1,
    width: 170,
    height: 44,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },

  submitText: {
    textAlign: "center",
    fontSize: FontSizes.ButtonText,
    color: Color.ButtonText,
  },
});
