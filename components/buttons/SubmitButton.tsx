import React from "react";
import { Pressable, Text, View } from "react-native";
import { StyleSheet } from "react-native";

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
        backgroundColor: "#0F5257",
        borderColor: "#7F7F7F",
        borderWidth: 1,
        color: "#9C92A3",
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
        color: '#fff'
    },

});
