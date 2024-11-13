import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Color, FontSizes } from "../../../styles/styles";
import { Icon } from "react-native-elements/dist/icons/Icon";
//import DropShadow from "react-native-drop-shadow";

interface CloseProps {
    onPress: () => void;
}

export default function CameraButton( { onPress } : CloseProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Take Picture</Text>
            <View style={styles.shadow}>

                <TouchableOpacity style={styles.cameraButton}
                    onPress={onPress}>
                    <Icon name="camera" size={50} color="white" />
                </TouchableOpacity>

            </View>
        </View>
    );

}

const styles = StyleSheet.create({

        shadow: {
            shadowColor: '#171717',
            shadowOffset: {width: 0, height: 3},
            shadowOpacity: 0.4,
            shadowRadius: 2,
        },

        container : {
            alignItems: 'center',
            justifyContent: 'center',
            flex : 1,
            paddingBottom: 20,
            paddingTop: 20,
        },

        cameraButton: {
            backgroundColor: Color.CameraButtonBackground,
            borderColor: Color.CameraButtonBorder,
            borderWidth: 1,
            width: 200,
            height: 75,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
        },
    
        text: {
            color: Color.ScreenHeader,
            fontSize: FontSizes.label,
            fontWeight: '500',
            paddingBottom: 10,
        }


});