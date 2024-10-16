import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Color } from "@/types/types";

interface CloseProps {
    onPress: () => void;
}

export default function Close( { onPress } : CloseProps) {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton}
                onPress={onPress}
            >
                <Text style={styles.text}>Close</Text>
                <AntDesign name="down" style={styles.arrowDown} />
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({

    container : {
        alignItems: 'center',
        justifyContent: 'center',
        flex : 1,
        paddingBottom: 20,
    },

    closeButton: {
        backgroundColor: Color.ReportScreenBackground,
        padding: 2,
        width: 60,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },

    arrowDown: {
        color: Color.ScreenHeader,
        fontSize: 24,
        fontWeight: 'black',
    },

    text: {
        color: Color.ScreenHeader,
        fontSize: 16,
        fontWeight: 'bold',
    }
});