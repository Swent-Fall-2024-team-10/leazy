import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import TickingBox from "@/app/components/forms/TickingBox";
import Header from "@/app/components/Header";
import { appStyles, ButtonDimensions, Color, FontSizes, FontWeight } from "@/styles/styles";
import InputField from "@/app/components/forms/text_input";
import StraightLine from "../../components/SeparationLine";
import SubmitButton from "@/app/components/buttons/SubmitButton";
import { Picker } from "@react-native-picker/picker";

const SituationReportLayout = [1, "floor", 0, 1, "wall", 0, 1, "ceiling", 0, 1, "window", 0];
const residences = [
  { label: "Vortex", value: "Vortex" },
  { label: "Triaude", value: "Triaude" },
  { label: "Estudiantine", value: "Estudiantine" }
];

const apartments = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
  { label: "7", value: "7" },
  { label: "8", value: "8" },
  { label: "9", value: "9" },
  { label: "10", value: "10" }
];

export default function SituationReport() {
  // Component representing a single situation report item
  function SituationReportItem({ label, n }: { label: string; n: number }) {
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(false);
    const [checked3, setChecked3] = useState(false);

    return (
      <View style={styles.item}>
        <View style={styles.itemRow}>
          <Text style={styles.text}>
            {n} : {label}
          </Text>
          <TickingBox checked={checked1} onChange={setChecked1} />
          <TickingBox checked={checked2} onChange={setChecked2} />
          <TickingBox checked={checked3} onChange={setChecked3} />
        </View>
      </View>
    );
  }

  // Picker group to select residence and apartment
  function PickerGroup() {
    const [selectedResidence, setSelectedResidence] = useState("");
    const [selectedApartment, setSelectedApartment] = useState("");
  
    const residences = ["Vortex", "Triaude", "Estudiantine"];
    const apartments = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  
    return (
      <Picker
        selectedValue={selectedApartment}
        style={{ height: 50, width: 100 }}
        onValueChange={(itemValue, itemIndex) =>
          setSelectedApartment(itemValue)
        }>
        <Picker.Item label="Java" value="java" />
        <Picker.Item label="JavaScript" value="js" />
      </Picker>
    );
  }

  // Component representing a group of input fields for the tenant's name (either arriving or leaving)
  function TenantNameGroup({ label }: { label: string }) {
    const width = 140;
    return (
      <View style={styles.greyGroupBackground}>
        <View style={styles.tenantRow}>
          <Text style={styles.tenantLabel}>{label}</Text>
          <InputField
            value={""}
            setValue={() => {}}
            placeholder="Name"
            height={40} // Increased height for the input field
            width={width}
            backgroundColor={Color.TextInputBackground}
            radius={20}
            testID="testNameField"
          />
        </View>

        <View style={[styles.tenantRow2, { justifyContent: "flex-end" }]}>
          <InputField
            value={""}
            setValue={() => {}}
            placeholder="Surname"
            height={40} // Increased height for the input field
            width={width}
            backgroundColor={Color.TextInputBackground}
            radius={20}
            testID="testSurnameField"
            style={{ justifyContent: "flex-end" }}
          />
        </View>
      </View>
    );
  }

  return (
    <Header>
      <ScrollView style={[appStyles.screenContainer]} automaticallyAdjustKeyboardInsets={true}>
        <View style={{ marginBottom: "90%", paddingBottom: "30%" }}>
          <Text style={appStyles.screenHeader}>Situation Report Form</Text>

          {/* Picker for Residence and Apartment */}
          <PickerGroup />

          {/* Tenant Information */}
          <TenantNameGroup label={"Arriving Tenant"} />
          <TenantNameGroup label={"Leaving Tenant"} />

          <View style={styles.lineContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ marginBottom: "2%" }}>
                <Text>OC = Original Condition </Text>
                <Text>NW = Natural Wear</Text>
                <Text>AW = Abnormal Wear</Text>
              </View>

              <View style={styles.labels}>
                <Text style={styles.wearStatus}>OC</Text>
                <Text style={styles.wearStatus}>NW</Text>
                <Text style={styles.wearStatus}>AW</Text>
              </View>
            </View>

            <StraightLine />
          </View>

          <SituationReportItem label="test" n={1} />

          <View style={styles.lineContainer}>
            <Text style={styles.remark}> Remark :</Text>
            <StraightLine />

            <InputField
              value={""}
              setValue={() => {}}
              placeholder="Enter your remarks here"
              height={100} // Increased height for the input field
              width={Dimensions.get("window").width * 0.85}
              backgroundColor={Color.TextInputBackground}
              radius={20}
              testID="testRemarkField"
              style={{ marginTop: "5%" }}
            />
          </View>

          <SubmitButton
            label="Submit"
            testID="submit"
            width={ButtonDimensions.smallButtonWidth}
            height={ButtonDimensions.smallButtonHeight}
            disabled={false}
            textStyle={appStyles.submitButtonText}
            style={appStyles.submitButton}
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </Header>
  );
}

const styles = StyleSheet.create({
  lineContainer: {
    marginBottom: "5%",
    marginTop: "5%",
  },

  labels: {
    flexDirection: "row",
    alignSelf: "flex-end",
    position: "absolute",
    left: "65%",
    bottom: "10%",
  },
  wearStatus: {
    color: Color.ButtonBackground, /* Purple border */
    fontSize: FontSizes.label,
    fontWeight: "600", // Use a valid fontWeight value
    marginRight: "15%",
  },
  remark: {
    color: Color.ButtonBackground, /* Purple border */
    marginBottom: "2%",
    fontSize: FontSizes.label,
    fontWeight: "600", // Use a valid fontWeight value
  },
  item: {
    backgroundColor: "#f2f2f2", /* Light gray background */
    borderWidth: 0.5,
    borderColor: "#A3A3A3CC", /* Purple border */
    borderRadius: 15, /* Rounded corners */
    height: 100,
    width: "100%",
    justifyContent: "center",
    padding: "2%",
  },
  itemRow: {
    flexDirection: "row", /* Align items horizontally */
    alignItems: "flex-start", /* Align items to the start */
    flexWrap: "wrap", /* Allow text to wrap to the next line */
  },
  text: {
    fontSize: 20, /* Font size */
    color: "#0f5257", /* Dark green text */
    fontWeight: "600", /* Bold text */
    marginRight: 10, /* Add some spacing between the text and the checkboxes */
    flex: 1, /* Allow the text to take up remaining space */
  },
  greyGroupBackground: {
    backgroundColor: "#f2f2f2", /* Light gray background */
    borderWidth: 0.5,
    borderColor: "#A3A3A3CC", /* Purple border */
    borderRadius: 15, /* Rounded corners */
    justifyContent: "center",
    padding: "2%",
    marginBottom: "3%",
  },
  tenantLabel: {
    fontSize: 20,
    color: "#0f5257",
    fontWeight: "600",
    marginTop: "2%",
    marginRight: "2%",
    marginLeft: "2%",
  },
  tenantRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "2%",
  },
  tenantRow2: {
    width: "51%",
    flexDirection: "row",
    alignItems: "flex-end",
    alignSelf: "flex-end",
    marginBottom: "2%",
  },

  pickerContainer: {
    marginBottom: 20,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#f2f2f2",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  pickerLabel: {
    marginBottom: 5,
    fontSize: FontSizes.label,
    color: Color.ButtonBackground,
    fontWeight: "600", // Use a valid fontWeight value
  },

  
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
