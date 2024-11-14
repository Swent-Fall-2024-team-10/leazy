import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { Button } from "react-native-elements";
import { Color, FontSizes} from "../../../styles/styles";

interface SubmitButtonProps {
  disabled: boolean;
  onPress: () => void;
  width: number;
  height: number;
  label: string;
  testID: string;
  style: any;
  textStyle: any;
  image?: any;
}

export default function SubmitButton({ disabled, onPress, width, height, label, testID, style, textStyle, image} : SubmitButtonProps) {
  return (
    <View style={styles.submitContainer}>
      <Button
        title={label}
        onPress={onPress}
        buttonStyle={[
          style,
          {
            width: width,
            height: height,
          },
        ]}
        icon={
          image ? (
            <Image
              source={image}
              style={styles.iconStyle}
              resizeMode="contain"  
            />
          ) : undefined
        }
        iconPosition="left"  
        disabled={disabled}
        disabledStyle={styles.submitButtonDisabled}
        testID={testID}

        titleStyle={[
          textStyle
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    submitContainer: {
        alignItems: 'center',
        shadowColor: '#171717',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 2,
        padding: '5%',
    },

    submitButtonDisabled : {
      backgroundColor: Color.ButtonBackgroundDisabled,
      borderColor: Color.ButtonBorder,
      borderWidth: 1,
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
    },

    iconStyle: {
      position: 'absolute',
      width: 25,      
      height: 25,   
      marginRight: '1%',
      left: '5%'
    },
});
