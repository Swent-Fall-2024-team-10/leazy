import React from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native";
import { Button } from "react-native-elements";
import { Color } from "@/types/types";

interface SubmitButtonProps {
  height?: number;
}

export default function SubmitButton({ height } : SubmitButtonProps) {
  return (
    <View style={styles.submitContainer}>
        <Pressable 
        style={styles.submitButton}>
            <Text style={styles.submitText}>Submit</Text>
        </Pressable>
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

    submitText : {
        textAlign: 'center',
        fontSize: 20,
        color: Color.ButtonText
    },

});
