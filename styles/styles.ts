import { StyleSheet } from "react-native";
import { Header } from "react-native-elements";
// portions of this code were generated with chatGPT as an AI assistant
// Define the navigation stack types
export type RootStackParamList = {
    Home: undefined;         // No parameters for Home screen
    Settings: undefined;     // No parameters for Settings screen
  };

export const buttonRadius = 100;

export const buttonSizes = {
  largeButtonWidth : 263,
  largeButtonHeight : 44,
  
  smallButtonWidth : 170,
  smallButtonHeight : 44,

  mediumButtonWidth : 200,
  mediumButtonHeight : 44,
}

export const Padding = {
  Header : '8%',
  LabelTop : '5%',
  LabelBottom : '5%',

  InputField : '1.25%',
} as const;

export const FontSizes = {
  ScreenHeader : 24,
  
  DateText : 14,
  
  ButtonText : 15,
  
  confirmText : 16,

  TextInputText : 16,
  TextInputLabel : 16,

  backArrow : 32,

  label : 16,
} as const;

export const FontWeight = {
  ScreenHeader : 'bold',
  DateText : 'normal',
  ButtonText : 'bold',
  TextInputText : 'normal',
  TextInputLabel : 'bold',
  label : 'bold',
}

export const Color = {

  CancelColor : '#E74C3C',

  ShadowColor : '#171717',

  HeaderText : "#0f5257",
  HeaderBackground : '#e9d5ff',

  ScreenHeader : "#0f5257",
  DateText : '#7F7F7F',

  ButtonBackgroundDisabled : "#7F7F7F",
  ButtonTextDisabled : "#FFFFFF",

  ButtonBackground : "#0F5257",
  ButtonBorder : "#7F7F7F",
  ButtonText : "#FFFFFF",

  ReportScreenBackground : "#F5F5F5",
  
  TextInputPlaceholder : "#7F7F7F",
  TextInputBackground : "#D6D3F0",
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
  
  carouselImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },

  carouselScrollViewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  smallThumbnailImage: {
    marginHorizontal: 5,
    width: 100,
    height: 100,
    borderRadius: 10,
  },

  mediumThumbnailImage: {
    width: 150, // Square dimension
    height: 150, // Square dimension
    marginHorizontal: 5,
    borderRadius: 8,
    borderColor: 'lightgrey',
    borderWidth: 0.5,
  },

  date: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
    color: Color.DateText,
  },  

  inputFieldLabel : {
      fontSize: 16,
      marginBottom: 2.5,
      fontWeight: "500",
      color: Color.TextInputLabel,
      marginLeft: '3%',
  },

  scrollContainer : {
    flex: 1,
    paddingBottom: '15%',
  },

  backButton: {
    top: '7.5%',
    left: '7.5%',
    position: 'absolute',
    borderRadius: 5,
  },

  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  submitButtonText : {
      textAlign: 'center',
      fontSize: FontSizes.ButtonText,
      color: Color.ButtonText,
      fontWeight: '300',
      fontFamily: 'Inter-SemiBold',
  },

  submitButton : {
      backgroundColor: Color.ButtonBackground,
      borderColor: Color.ButtonBorder,
      borderWidth: 1,
      borderRadius: buttonRadius,
      justifyContent: 'center',
      alignItems: 'center',
  },

  appHeader :{
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 7.6,
    fontFamily: "Inter-Bold",
    color: "#0f5257",
    flex : 1,
    textAlign: 'center',
  },

  InputFieldContainer : {
    padding: Padding.InputField,
  },
  
  
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
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    alignItems: 'center',
    textAlign: 'center',
    color: Color.ScreenHeader,
  },

  



});
