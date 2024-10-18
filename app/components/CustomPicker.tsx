import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { UserType } from '../../firebase/auth/auth';

export default function CustomPicker({ selectedValue, onValueChange, style, testID }: { testID:string, selectedValue: UserType, onValueChange: (itemValue: UserType) => void, style?: object }) {
    return (
        <View style={[styles.pickerContainer, style]}>
            <Picker
                testID={testID}
                selectedValue={selectedValue}
                onValueChange={onValueChange}
                style={styles.picker}
                dropdownIconColor="#fff"  // Set arrow color to white
            >
                {Object.values(UserType).map((item, index) => (
                    <Picker.Item key={index} label={item} value={item} />
                ))}
            </Picker>
        </View>
    );
}

const styles = StyleSheet.create({
    pickerContainer: {
        width: 183,
        height: 43,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#000',
        backgroundColor: '#0F5257',
        justifyContent: 'center',  // Center content vertically
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,  // For Android shadow
        marginBottom: 23,
      },
      picker: {
        color: '#fff',       // Text color
        textAlign: 'center', // Center text horizontally
        width: '100%',       // Ensure picker takes full width
        fontFamily: 'Inter',    // Ensure Inter font is linked to the project
        fontSize: 20,
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 24,         // React Native needs an explicit lineHeight (adjusted from "normal")
        letterSpacing: 0.2,
      },
});
