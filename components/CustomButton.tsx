import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Image, View } from 'react-native';

export default function CustomButton({ title, onPress, size = 'small', style = {}, image }: { title: string, onPress: () => void, size?: 'small' | 'medium' | 'large', style?: object, image?: any }) {
    // Determine which style to use based on the size prop
    const getSizeStyle = () => {
        switch (size) {
            case 'medium':
                return styles.mediumButton;
            case 'large':
                return styles.largeButton;
            default:
                return styles.smallButton;
        }
    };

    return (
        <TouchableOpacity style={[getSizeStyle(), style]} onPress={onPress}>
            <View style={styles.contentContainer}>
                {image && <Image source={image} style={styles.buttonImage} />}
                <Text style={styles.buttonText}>{title}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  smallButton: {
    width: 126,
    height: 43,
    flexShrink: 0,  // Prevents shrinking
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#0F5257',
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',     // Center content horizontally
    marginBottom: 23,
  },
  mediumButton: {
    marginTop: 30,
    width: 181,
    height: 43,
    flexShrink: 0,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#0F5257',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 23,
  },
  largeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    width: 263,
    height: 43,
    flexShrink: 0,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    backgroundColor: '#0F5257',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginBottom: 23,
  },
  contentContainer: {
    flexDirection: 'row',       // Ensures the image and text are aligned horizontally
    alignItems: 'center',       // Vertically center the image and text
  },
  buttonImage: {
    width: 24,                  // Image width
    height: 24,                 // Image height
    marginRight: 10,            // Space between the image and text
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
    fontFamily: 'Inter',  // Make sure Inter font is loaded in your project
    fontSize: 20,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 20,  // Use a numeric value for lineHeight in React Native
    letterSpacing: 0.2,
  },
});
