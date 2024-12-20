import React from "react";
import DropDownPicker from "react-native-dropdown-picker";
import { View, Text, StyleSheet } from "react-native";
import { MaintenanceRequest } from "../../types/types";
import {
  appStyles,
  ButtonDimensions,
  Color,
  textInputHeight,
} from "../../styles/styles";

// portions of this code were generated with chatGPT as an AI assistant

interface StatusDropdownProps {
  value: string;
  setValue: React.Dispatch<
    React.SetStateAction<MaintenanceRequest["requestStatus"]>
  >;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({ value, setValue }) => {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState([
    { label: "Completed", value: "completed" },
    { label: "In Progress", value: "inProgress" },
    { label: "Not Started", value: "notStarted" },
  ]);

  return (
    <View style={styles.statusContainer}>
      <Text style={appStyles.inputFieldLabel}>Change status</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        style={styles.dropdown}
        textStyle={styles.dropdownText}
        dropDownContainerStyle={styles.dropdownContainer}
        listMode="SCROLLVIEW"
        testID='statusDropdown'
      />
    </View>
  );
};

export default StatusDropdown;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  statusContainer: {
    marginBottom: "5%",
  },
  dropdown: {
    backgroundColor: Color.TextInputBackground,
    borderColor: "black",
    borderWidth: 0.5,
    borderRadius: 32,
    width: "50%",
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownContainer: {
    backgroundColor: Color.TextInputBackground,
    borderColor: "black",
    borderWidth: 0.5,
    borderRadius: 32,
    width: "50%",
  },
});
