import React from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Color, FontSizes } from '../../styles/styles';

export default function CustomPopUp({
  title,
  text,
  onPress,
  testID,
}: {
  title: string;
  text: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <View testID={testID} style={styles.overlay}>
      <View style={styles.frame}>
        <Text style={styles.header}>{title}</Text>

        <Text style={styles.text}>{text}</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            onPress={onPress}
            style={[styles.button, styles.shadow]}
          >
            <Text style={styles.buttonText}>Ok</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {},
  shadow: {
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },

  overlay: {
    position: 'absolute',
    top: -200,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 1,
  },

  frame: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: '95%',

    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: Color.HeaderText,
  },

  text: {
    fontSize: 16,
    paddingBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  buttonsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  buttonText: {
    fontSize: FontSizes.ButtonText,
    color: Color.ButtonText,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 40,
  },

  buttonYes: {
    backgroundColor: '#FF7B70',
    borderColor: Color.ButtonBorder,
  },
  button: {
    backgroundColor: Color.ButtonBackground,
    borderColor: Color.ButtonBorder,
    width: 150,
    height: 40,
    borderWidth: 1,
    borderRadius: 25,
  },
});
