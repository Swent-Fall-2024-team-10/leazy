import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";
// portions of this code were generated with chatGPT as an AI assistant
// Define the navigation stack types
export type RootStackParamList = {
  Home: undefined; // No parameters for Home screen
  Settings: undefined; // No parameters for Settings screen
};

export const defaultButtonRadius = 100;
export const textInputHeight = 40;
export const ButtonDimensions = {

  fullWidthButtonWidth : Dimensions.get('window').width * 0.85,

  veryLargeButtonWidth : 300,
  veryLargeButtonHeight : 44,

  largeButtonWidth : 263,
  largeButtonHeight : 44,
  
  smallButtonWidth : 170,
  smallButtonHeight : 44,

  mediumButtonWidth : 200,
  mediumButtonHeight : 44,
}

export const IconDimension = {
  smallIcon : 24,
  mediumIcon : 34,
  largeIcon : 44,
}

export const LayoutPadding = {
  Header : '8%',
  LabelTop : '5%',
  LabelBottom : '5%',

  InputField : '1.25%',
} as const;

export const FontSizes = {
  ScreenHeader : 24,
  
  legend : 10,
  DateText : 14,
  
  ButtonText : 15,
  
  confirmText : 16,

  TextInputText : 16,
  TextInputLabel : 16,

  backArrow : 32,

  label : 16,
} as const;

export const FontWeight = {
  ScreenHeader: "bold",
  DateText: "normal",
  ButtonText: "bold",
  TextInputText: "normal",
  TextInputLabel: "bold",
  label: "bold",
} as const;

export const Color = {
  //ScreenBackground: "#FFFFFF",
  GrayGroupMargin: "#A3A3A3CC",
  GrayGroupBackground: "#f2f2f2",

  IssueTextBackground: "#FFFFFF",
  CancelColor : '#E74C3C',

  ShadowColor : '#171717',

  HeaderText: "#0f5257",
  HeaderBackground: "#e9d5ff",

  ScreenHeader: "#0f5257",
  DateText: "#7F7F7F",

  ButtonBackgroundDisabled: "#7F7F7F",
  ButtonTextDisabled: "#FFFFFF",

  ButtonBackground: "#0F5257",
  ButtonBorder: "#7F7F7F",
  ButtonText: "#FFFFFF",

  IssueBorder : "#7F7F7F",
  IssueBackground : "#EDEDED",
  ScreenBackground : "#F5F5F5",
  
  TextInputPlaceholder : "#7F7F7F",
  TextInputBackground : "#D6D3F0",
  TextInputBorder : "#7F7F7F",
  TextInputText : "#0B3142",
  TextInputLabel : "#0F5257",

  CameraButtonBackground: "#0F5257",
  CameraButtonBorder: "#7F7F7F",

  inProgress: "#F39C12",
  notStarted: "#E74C3C",
  completed: "#2ECC71",
  rejected: "#95A5A6",
  default: "#95A5A6",
};

export const appStyles = StyleSheet.create({

  grayGroupBackground: {
    backgroundColor: Color.GrayGroupBackground,
    borderWidth: 0.5,
    borderColor: Color.GrayGroupMargin, /* Purple border */
    borderRadius: 15, /* Rounded corners */
    justifyContent: "center",
    padding: "2%",
    marginBottom: "3%",
  },

  tickingBox : {
    borderRadius: 5,
  },
  
  expandedImageNextButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
    padding: 8,
  },
  
  smallCaptionText:{
    fontFamily: "Inter-Regular",
    fontSize: FontSizes.legend,
  },

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
      fontWeight: "600",
      color: Color.TextInputLabel,
      marginLeft: '3%',
      marginRight: '3%',
      paddingBottom: '1%',
      paddingTop: '1%',
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
      borderRadius: defaultButtonRadius,
      justifyContent: 'center',
      alignItems: 'center',
  },

  appHeader: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 7.6,
    fontFamily: "Inter-Bold",
    color: "#0f5257",
    flex: 1,
    textAlign: "center",
  },

  InputFieldContainer : {
    padding: LayoutPadding.InputField,
  },

  drawerLabel: {
    fontSize: 15,
    fontWeight: "800",
    fontFamily: "Inter-Bold",
    color: Color.ScreenHeader,
    alignItems: "center",
    borderColor: Color.ScreenHeader,
  },

  screenContainer: {
    flex: 1,
    padding: '6%',
  },

  screenHeader: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: '3%',
    alignItems: 'center',
    textAlign: 'center',
    color: Color.ScreenHeader,
  },
});


export const stylesForNonHeaderScreens = StyleSheet.create({
  approvedText: {
    color: "#3AB700",
    textAlign: "center",
    fontFamily: "Inter",
    fontSize: 40,
    fontWeight: "400",
    lineHeight: 48,
    letterSpacing: 0.4,
    marginBottom: 23,
  },
  title: {
    color: Color.TextInputText,
    textAlign: "center",
    fontFamily: "Inter",
    fontSize: 40,
    fontWeight: "400",
    lineHeight: 40,
    letterSpacing: 0.4,
    marginBottom: 24,
  },
  text: {
    color: Color.TextInputText,
    textAlign: "center",
    fontFamily: "Inter",
    fontSize: 24,
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: 0.24,
    marginBottom: 23,
  },
  errorText: {
    color: "#FF0004",
    textAlign: "center",
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 16,
    letterSpacing: 0.16,
    marginBottom: 20,
    marginTop: 20,
    width: 186,
  },
});

export const stylesForHeaderScreens = StyleSheet.create({
  titleContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
  },
  text: {
    color: "#0B3142",
    textAlign: "center",
    fontFamily: "Inter",
    fontSize: 24,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: 0.24,
    marginBottom: 23,
  },
  CodeText: {
    color: "#00ff88",
    textAlign: "center",
    fontFamily: "Inter",
    fontSize: 24,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 24,
    letterSpacing: 0.24,
    marginBottom: 25,
  },
  errorText: {
    color: "#FF0004",
    textAlign: "center",
    fontFamily: "Inter",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 16,
    letterSpacing: 0.16,
    marginBottom: 20,
    marginTop: 20,
    width: 186,
  },

  tickingBox : {
    borderRadius: 5,
  },



});
