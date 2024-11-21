import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import TickingBox from "@/app/components/forms/TickingBox";
import Header from "@/app/components/Header";
import { appStyles, ButtonDimensions, Color, FontSizes, FontWeight } from "@/styles/styles";
import InputField from "@/app/components/forms/text_input";
import StraightLine from "../../components/SeparationLine";
import SubmitButton from "@/app/components/buttons/SubmitButton";
import RNPickerSelect from 'react-native-picker-select';

type PickerItem = {
    label: string;
    value: string | number;
  };


// ============== Temporary constant to be able to display and test the screen without the backend being completed ================
const SituationReportLayout = [1, "floor", 0, 1, "wall", 0, 1, "ceiling", 0, 1, "window", 0, 3, "Bed", "Faces", 0, "Materas", 0, "Strucutre", 0];

const SituationReportItemsWithoutGroups = [["floor", 0], ["wall", 0], ["ceiling", 0], ["window", 0]];

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
    { label: "10", value: "10" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "10", value: "10" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "10", value: "10" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "10", value: "10" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "10", value: "10" },
    { label: "1", value: "1" },
    { label: "2", value: "2" },
    { label: "3", value: "3" },
    { label: "4", value: "4" },
    { label: "5", value: "5" },
    { label: "6", value: "6" },
    { label: "7", value: "7" },
    { label: "8", value: "8" },
    { label: "9", value: "9" },
    { label: "10", value: "10" },
  ];
// ============================================ END OF TEMPORARY TEST CONSTANTS ================================================


export default function SituationReport() {
    const [selectedResidence, setSelectedResidence] = useState("");
    const [selectedApartment, setSelectedApartment] = useState("");    

  // Component representing a single situation report item
  function SituationReportItem({ label, n }: { label: string; n: number }) {
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(false);
    const [checked3, setChecked3] = useState(false);

    return (
      <View style={styles.item}>
        <View style={styles.itemRow}>
          <Text style={[styles.text, styles.label]}>
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
  function PickerGroup({label, data, chosed, setValue}: {label: string, data: PickerItem[] ,chosed: string, setValue: (value: string) => void}) {
    return (
        <View style={[styles.greyGroupBackground, styles.pickerContainer]}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.pickerWrapper}>
                <RNPickerSelect
                    onValueChange={(value) => setValue(value)}
                    items={data}
                    value={chosed}
                    placeholder={{label}}
                    style={pickerSelectStyles}
                />
            </View>
      </View>
    );
  };


  // Component representing a group of input fields for the tenant's name (either arriving or leaving)
  function TenantNameGroup({ label }: { label: string }) {
    const width = 140;
    return (
      <View style={styles.greyGroupBackground}>
        <View style={styles.tenantRow}>
          <Text style={[styles.tenantLabel, {marginRight : "9.85%"}]}>{label}</Text>
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
          <PickerGroup label={"Residence"} data={residences} chosed={selectedResidence} setValue={setSelectedResidence} />


          <PickerGroup label={"Apartment"} data={apartments} chosed={selectedApartment} setValue={setSelectedApartment} />


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

            {SituationReportItemsWithoutGroups.map((item, index) =>(
                <SituationReportItem label={String(item[0])} n={index + 1}/>
            ))}

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
    groupSituationReport: {
        margin : "2%",
    },


  lineContainer: {
    marginBottom: "5%",
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
    height: 80,
    width: "100%",
    justifyContent: "center",
    padding: "2%",
    marginBottom : "2%",
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
    fontSize: 16,
    color: "#0f5257",
    fontWeight: "700",
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

  container: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
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

  selectedValues: {
    marginTop: 10,
  },
  selectedText: {
    fontSize: 14,
    color: "#555",
  },
});

const pickerSelectStyles = {
    inputIOS: {
        color: "black",
    },
    inputAndroid: {
        color : "black",
    },
  };
  
