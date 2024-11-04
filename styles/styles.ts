import { StyleSheet } from "react-native";
// portions of this code were generated with chatGPT as an AI assistant
// Define the navigation stack types
export type RootStackParamList = {
    Home: undefined;         // No parameters for Home screen
    Settings: undefined;     // No parameters for Settings screen
  };

export const FontSizes = {
  ScreenHeader : 24,
  
  DateText : 14,
  
  ButtonText : 16,
  
  TextInputText : 16,
  TextInputLabel : 16,

  label : 16,
}

export const FontWeight = {
  ScreenHeader : 'bold',
  DateText : 'normal',
  ButtonText : 'bold',
  TextInputText : 'normal',
  TextInputLabel : 'bold',
  label : 'bold',
}

export const Color = {


  HeaderText : "#0f5257",
  HeaderBackground : "#F5F5F5",

  ScreenHeader : "#0f5257",
  DateText : '#7F7F7F',

  ButtonBackgroundDisabled : "#7F7F7F",
  ButtonTextDisabled : "#FFFFFF",

  ButtonBackground : "#0F5257",
  ButtonBorder : "#7F7F7F",
  ButtonText : "#FFFFFF",

  ReportScreenBackground : "#F5F5F5",
  
  TextInputPlaceholder : "#7F7F7F",
  TextInputBackground : "#FFF",
  TextInputBorder : "#7F7F7F",
  TextInputText : "#0B3142",
  TextInputLabel : "#0B3142",

  CameraButtonBackground : "#0F5257",
  CameraButtonBorder : "#7F7F7F",

  inProgress : '#F39C12',
  notStarted : '#E74C3C',
  completed : '#2ECC71',
  rejected : '#95A5A6',
  default : '#95A5A6',
}

export const appStyles = StyleSheet.create({
  drawerLabel : {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: "Inter-Bold",
    color: Color.ScreenHeader,
    alignItems: 'center',
    borderColor: Color.ScreenHeader,
  },

  screenContainer : {
    flex: 1,
    padding: 20,
  },

  screenHeader : {

  },



});
