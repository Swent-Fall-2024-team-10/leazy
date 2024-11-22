import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { Button } from "react-native-elements";
import { appStyles, Color, FontSizes } from "../../../styles/styles";
//import DropShadow from "react-native-drop-shadow";

interface CloseConfirmationProps {
  isVisible: boolean;
  onPressYes: () => void;
  onPressNo: () => void;
}

export default function CloseConfirmation({
  isVisible,
  onPressYes,
  onPressNo,
}: CloseConfirmationProps) {
  if (!isVisible) return null;
  return (
    <View style={styles.overlay}>
      <View style={styles.frame}>
        <Text style={styles.text}>
          Are you sure you want to cancel the creation of this issue?
        </Text>

        <View style={styles.buttonsContainer}>
          <Button
            testID="yes-close-button"
            title="Yes, cancel"
            titleStyle={styles.buttonText}
            onPress={onPressYes}
            buttonStyle={[styles.buttonYes, styles.buttons, styles.shadow]}
          />

          <Button
            testID="no-close-button"
            title="No, Go back"
            titleStyle={styles.buttonText}
            onPress={onPressNo}
            buttonStyle={[styles.buttonNo, styles.buttons, styles.shadow]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: Color.ShadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },

  overlay: {
    flex: 1,
    position: "absolute",
    top: "0%",
    left: "0%",
    right: "0%",
    bottom: "0%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
    opacity: 0.2,
    zIndex: 1,
  },

  frame: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    width: "95%",

    shadowColor: Color.ShadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },

  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: Color.ScreenHeader,
  },

  text: {
    fontSize: 16,
    paddingBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },

  buttonsContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    padding: "5%",
  },

  buttonText: {
    fontSize: FontSizes.confirmText,
    color: Color.ButtonText,
    fontWeight: "600",
    textAlign: "center",
    alignItems: "center",
  },

  buttonYes: {
    backgroundColor: Color.CancelColor,
    borderColor: Color.ButtonBorder,
    marginRight: "5%",
  },

  buttonNo: {
    backgroundColor: Color.ButtonBackground,
    borderColor: Color.ButtonBorder,
  },

  buttons: {
    width: 150,
    height: 40,
    borderWidth: 1,
    borderRadius: 25,
  },
});
