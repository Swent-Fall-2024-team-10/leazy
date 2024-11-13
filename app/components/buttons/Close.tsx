import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Color } from "../../../styles/styles";
import Icon from "react-native-vector-icons/MaterialIcons";

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
                <Icon name="close" size={50} color="white" />
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({

    container : {
        alignItems: 'center',
        justifyContent: 'center',
        flex : 1,
        paddingBottom: 3,
    },

    closeButton: {
      
        width: 60,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },

    arrowDown: {
        color: Color.ScreenHeader,
        fontSize: 24,
        fontWeight: '800',
    },

    text: {
        color: Color.ScreenHeader,
        fontSize: 16,
        fontWeight: '800',
    }
});