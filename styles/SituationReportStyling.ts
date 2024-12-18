import { Dimensions, StyleSheet } from "react-native";
import { borderWidth, ButtonDimensions, Color, defaultButtonRadius, FontSizes, FontWeight } from "./styles";

export const situationReportStyles = StyleSheet.create({
    reportContainer: {
        marginTop: "5%",
    },

    groupSituationReport: {
        margin : "2%",
    },

    tenantNameContainer : {
        flexDirection: "row",
        justifyContent: "space-between",
    },

  lineContainer: {
    marginBottom: "5%",
    marginTop: "5%",
  },

  submitMargin: {
    position: "absolute",
    bottom: "2%",
  },

  layoutCreationSeparationLine : {
    marginTop: "5%",
  },

  labels: {
    fontSize: FontSizes.label,
    flexDirection: "row",
    alignSelf: "flex-end",
    position: "absolute",
    left: "65%",
    bottom: "10%",
  },

  wearStatus: {
    color: Color.TextInputLabel, /* Purple border */
    fontSize: FontSizes.TextInputLabel,
    fontWeight: FontWeight.TextInputLabel, // Use a valid fontWeight value
    marginRight: "15%",
  },

  remarkTextContainer: {
    backgroundColor: Color.TextInputBackground, /* Light gray background */
    padding: "5%",
    borderRadius: 8,
    marginVertical: 10,
    marginLeft: "1%",
    marginRight: "1%",

  },

  backButton: {
    position: "absolute",
    top: "2%",
    left: "5%",
  },

  remarkText: {
    color: Color.TextInputText,
    fontSize: FontSizes.TextInputText,
    fontWeight: FontWeight.TextInputText,
    textAlign: "justify",
  },

  remark: {
    color: Color.ButtonBackground, /* Purple border */
    marginBottom: "2%",
    fontSize: FontSizes.label,
    fontWeight: "600", // Use a valid fontWeight value
  },

  item: {
    backgroundColor: Color.GrayGroupBackground, /* Light gray background */
    borderWidth: 0.5,
    borderColor: Color.GrayGroupMargin, /* Purple border */
    borderRadius: 15, /* Rounded corners */
    height: 80,
    width: "100%",
    justifyContent: "center",
    padding: "2%",
    marginBottom : "2%",
  },

  removeContainer:{
    flex: 1,
    flexDirection: "row", 
    alignItems: "center"
  },
  
  itemRow: {
    flexDirection: "row", 
    alignItems: "center", 
    flexWrap: "wrap", 
  },

  text: {
    fontSize: FontSizes.TextInputLabel,
    color: Color.ButtonBackground,
    fontWeight: FontWeight.TextInputLabel, 
    marginRight: '2%', 
    flex: 1,
  },

  tenantLabelContainer: {
    marginTop : "3%",
  },

  tenantLabel: {
    fontSize: FontSizes.TextInputLabel,
    color: Color.ButtonBackground,
    fontWeight: FontWeight.TextInputLabel,
    marginRight: "2%",
    marginLeft: "2%",
  },
  
  tenantRow: {
    flexDirection: "row",
  },

  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding : '2%',
  },

  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 25,
    backgroundColor: Color.TextInputBackground,
    borderColor: Color.TextInputBorder,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    marginLeft: '2%',
    marginRight: '10%',
    color: Color.ButtonBackground,
  },

  groupContainer: {
    backgroundColor: Color.TextInputBackground, // Light purple background
    padding : "4%",
    paddingRight: "1%",
    borderRadius: 15,
    marginBottom: '2%',
  },

  groupLabel: {
    fontSize: FontSizes.TextInputText,
    color: Color.TextInputLabel,
    fontWeight: FontWeight.TextInputLabel,
    marginBottom: '2%',

  },

  groupItemContainer: {
    borderColor: 'transparent',
  },

  singleItemContainer: {
    borderColor: 'transparent',
    paddingLeft: "2%",
  },
});

export const pickerSelectStyles = {
    inputIOS: {
        color: "black",
    },
    inputAndroid: {
        color : "black",
    },
  };


export const layoutCreationStyles = StyleSheet.create({
    addButtonContainer: {
      padding: "2%",
      marginBottom: "4%",
    },

    inputField:{
      width: Dimensions.get("screen").width * 0.5,
      marginBottom: '2%',
    },

    removeButton: {
        padding: "2%",
    },

    addButton: {
        padding: "2%",
    },

    buttonText:{    
        fontSize: FontSizes.label,
        color: Color.TextInputLabel,
        fontWeight: FontWeight.DateText,
        textAlign: "center",
        alignItems: "center",    
    },

    globalButton: {
      marginLeft: "4%",
    },

    layoutModificationButton : {
        width: ButtonDimensions.smallerButtonWidth,
        height: ButtonDimensions.smallerButtonHeight,
        borderRadius: defaultButtonRadius,
    },
    
    editButton: {
        flex : 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        padding : "2%",
        marginRight : "3%",
    },

    cancelOrSaveContainer: {
        flexDirection: "row",
        marginRight : "3%",
        padding : "2%",
        justifyContent: "space-between",
      },

    layoutNameContainer:{
        backgroundColor: Color.GrayGroupBackground,
        padding: "2%",
        borderRadius: 15,
        borderWidth: borderWidth.thin,
        borderColor: Color.GrayGroupMargin,
        marginBottom: "10%",
        marginTop: "10%",
    },
});

export const reportConsStyles = StyleSheet.create({
    reportHeader: {
      marginLeft: "10%",
      marginRight: "10%",
    }

});
