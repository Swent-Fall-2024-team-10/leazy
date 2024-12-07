import { StyleSheet } from "react-native";
import { Dimensions } from "react-native";
import { Platform } from "react-native";
// portions of this code were generated with chatGPT as an AI assistant
// Define the navigation stack types
export type RootStackParamList = {
  Home: undefined; // No parameters for Home screen
  Settings: undefined; // No parameters for Settings screen
};

// Constants
export const defaultButtonRadius = 100;
export const textInputHeight = 40;



export const borderWidth = {
  thin: 0.5,
  thick: 1,
};
export const residenceManagementListStyles = StyleSheet.create({
  addApartmentButton: {
    height: 36,
    backgroundColor: 'white', 
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop:2,
    width: '80%',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addApartmentText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  searchContainer: {
    backgroundColor: 'white',
    borderRadius: 25,
    margin: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#333333',
  },
  searchClearButton: {
    padding: 4,
  },
  flatItem: {
    width: '90%',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#666666',
    fontSize: 14,
  },
});

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
  smallIcon: 24,
  mediumIcon: 34,
  largeIcon: 44,
};

export const LayoutPadding = {
  Header: '8%',
  LabelTop: '5%',
  LabelBottom: '5%',
  InputField: '1.25%',
} as const;

export const FontSizes = {
  ScreenHeader: 24,
  legend: 10,
  DateText: 14,
  ButtonText: 15,
  confirmText: 16,
  TextInputText: 16,
  TextInputLabel: 16,
  backArrow: 32,
  label: 16,
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
  CancelColor: '#E74C3C',
  ShadowColor: '#171717',
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


  // Chat
  chatTitle: "#000000",
  chatBackground: "#FFFFFF",
  chatGoBackIcon: "#000000",

  chatInputBackground: "#FFFFFF",
  chatInputBorder: "#7F7F7F",
  chatInputText: "#000000",
  chatSendIcon: "#AAAAAA",

  chatBubbleLeftBackground: "#0F5257",
  chatBubbleLeftBorder: "#E8E8E8",
  chatBubbleLeftText: "#FFFFFF",

  chatBubbleRightBackground: "#FFFFFF",
  chatBubbleRightBorder: "#7F7F7F",
  chatBubbleRightText: "#000000",

  chatTimeText: "#7F7F7F",
};

export const appStyles = StyleSheet.create({
  // Sign Up Styles
  signUpInputField: {
    width: 246,
    marginTop: 20,
  },

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

  // Image Related
  expandedImageNextButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
    padding: 8,
  },

  smallCaptionText: {
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
    width: 150,
    height: 150,
    marginHorizontal: 5,
    borderRadius: 8,
    borderColor: 'lightgrey',
    borderWidth: 0.5,
  },

  // Date and Time
  date: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
    color: Color.DateText,
  },

  // Input Fields
  inputFieldLabel: {
    fontSize: 16,
    marginBottom: 2.5,
    fontWeight: "600",
    color: Color.TextInputLabel,
    marginLeft: '3%',
    marginRight: '3%',
    paddingBottom: '1%',
    paddingTop: '1%',
  },

  // Layout
  scrollContainer: {
    flex: 1,
  },

  // Navigation
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

  // Buttons
  submitButton: {
    backgroundColor: Color.ButtonBackground,
    borderColor: Color.ButtonBorder,
    borderWidth: 1,
    borderRadius: defaultButtonRadius,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    marginTop: 16,
  },

  submitButtonText: {
    textAlign: 'center',
    fontSize: FontSizes.ButtonText,
    color: Color.ButtonText,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Header
  appHeader: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 7.6,
    fontFamily: "Inter-Bold",
    color: "#0f5257",
    flex: 1,
    textAlign: "center",
  },

  // General Screen
  screenContainer: {
    flex: 0.75,
    paddingVertical: '6%',
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

  // Drawer
  drawerLabel: {
    fontSize: 15,
    fontWeight: "800",
    fontFamily: "Inter-Bold",
    color: Color.ScreenHeader,
    alignItems: "center",
    borderColor: Color.ScreenHeader,
  },

  // Forms
  formContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '95%',
    alignSelf: 'center',
    marginBottom: 500
  },

  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },

  formFullWidth: {
    width: '100%',
    marginVertical: 10,
  },

  formHalfWidth: {
    width: '48%',
    marginVertical: 10,
  },

  formZipCode: {
    flex: 1,
    marginRight: 10,
  },

  formCity: {
    flex: 1,
    marginLeft: 10,
  },

  // Upload
  uploadButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#666',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '90%',
    marginTop: 10,
    flexDirection:'row'

  },

  uploadText: {
    color: '#666',
    marginTop: 8,
    marginLeft:20
  },

  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },

  // Residence List Styles
  residenceHeaderContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },

  residenceTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#0F2B46',
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    alignSelf: 'center',
  },

  residenceScrollView: {
    flex: 1,
    zIndex: 1,
  },

  residenceScrollViewContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 100,
  },

  residenceContainer: {
    marginBottom: 12,
  },

  residenceButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  expandedResidence: {
    backgroundColor: Color.TextInputBackground,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },

  residenceText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0F2B46',
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  residenceIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  residenceEditButton: {
    marginRight: 16,
    padding: 4,
  },

  flatsContainer: {
    backgroundColor: Color.TextInputBackground,
    paddingHorizontal:20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  flatText: {
    fontSize: 16,
    color: '#0F2B46',
    paddingVertical: 8,
    fontWeight: '400',
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    paddingRight: 10,
  },

  addResidenceButton: {
    zIndex: 2,
    position: 'absolute',
    bottom: '10%',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Color.ButtonBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  residenceBottomSpacing: {
    height: 80,
  },

  // Flat Details Styles
  flatCard: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  flatTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Color.ScreenHeader,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  idContainer: {
    backgroundColor: Color.TextInputBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },

  idText: {
    color: Color.TextInputText,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  flatImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },

  flatImage: {
    width: '100%',
    height: '100%',
  },

  tenantsSection: {
    backgroundColor: Color.TextInputBackground,
    padding: 16,
    borderRadius: 8,
  },

  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  tenantsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Color.TextInputText,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  tenantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },

  tenantNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  tenantName: {
    fontSize: 14,
    color: Color.TextInputText,
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  tenantId: {
    color: Color.TextInputPlaceholder,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
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
  tickingBox: {
    borderRadius: 5,
  }
});