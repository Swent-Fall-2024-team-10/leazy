import { Color } from '../../styles/styles';
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const StraightLine: React.FC = () => {
  const screenWidth = Dimensions.get('window').width;
  const lineThickness = 1;

  return (
    <View style={styles.container}>
        <View
            style={[
            styles.line,
            {
                width: screenWidth * 0.9, 
                height: lineThickness, 
            },
            ]}
        />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    line: {
        backgroundColor: Color.ButtonBackground,
        opacity: 0.8,
    },
});

export default StraightLine;