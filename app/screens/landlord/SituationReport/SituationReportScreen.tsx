import React, { useState } from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import TickingBox from "../../../components/forms/TickingBox";
import Header from "../../../components/Header";
import { appStyles, ButtonDimensions, Color} from "../../../../styles/styles";
import InputField from "../../../components/forms/text_input";
import StraightLine from "../../../components/SeparationLine";
import SubmitButton from "../../../components/buttons/SubmitButton";
import RNPickerSelect from 'react-native-picker-select';
import { situationReportStyles, pickerSelectStyles } from "./SituationReportStyling";

type PickerItem = {
    label: string;
    value: string | number;
  };


// ============== Temporary constant to be able to display and test the screen without the backend being completed ================
const SituationReportItemsWithoutGroups = [["floor", 0], ["wall", 0], ["ceiling", 0], ["window", 0]];

const residences = [
  { label: "Vortex", value: "Vortex" },
  { label: "Triaude", value: "Triaude" },
  { label: "Estudiantine", value: "Estudiantine" }
];

const apartments = Array.from({ length: 10 }, (_, i) => ({ label: `${i + 1}`, value: `${i + 1}` }));

// ============================================ END OF TEMPORARY TEST CONSTANTS ================================================

  // Picker group to select residence and apartment
function PickerGroup({label, data, chosed, testID ,setValue}: { testID: string, label: string, data: PickerItem[] ,chosed: string, setValue: (value: string) => void}) {
    return (
        <View style={[appStyles.grayGroupBackground, situationReportStyles.pickerContainer]}>
            <Text style={situationReportStyles.label}>{label}</Text>

            <View style={situationReportStyles.pickerWrapper} testID="">
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

function SituationReportItem({ label, n }: { label: string; n: number }) {
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(false);
    const [checked3, setChecked3] = useState(false);

    function canBeChecked({checked1, checked2, checked3} : {checked1: boolean, checked2: boolean, checked3: boolean}) {
      if (checked1 || checked2 || checked3) {
        return false;
      }
      return true;
    }

    function handleCheck(setCheck : (value: boolean) => void) {
      if (canBeChecked({checked1, checked2, checked3})) {
        setCheck(true);
      } else {
        setCheck(false);
      }
    }


return (
    <View style={situationReportStyles.item}>
        <View style={situationReportStyles.itemRow}>
        <Text style={[situationReportStyles.text, situationReportStyles.label]}>
            {n} : {label}
        </Text>
            <TickingBox checked={checked1} onChange={(value) => handleCheck(setChecked1)} />
            <TickingBox checked={checked2} onChange={(value) => handleCheck(setChecked2)} />
            <TickingBox checked={checked3} onChange={(value) => handleCheck(setChecked3)} />
        </View>
    </View>
    );
}


  // Component representing a group of input fields for the tenant's name (either arriving or leaving)
  function TenantNameGroup(
    { label, testID, name, surname, onNameChange, onSurnameChange }:
     {  name: string, 
        surname: string,
        label: string,
        testID: string, 
        onSurnameChange: (value: string) => void,
        onNameChange: (value: string) => void }) {
    const width = 140;
    return (
      <View style={appStyles.grayGroupBackground}>
            <View style={situationReportStyles.tenantNameContainer}>
                <View style={situationReportStyles.tenantLabelContainer}>
                    <Text testID={testID} style={[situationReportStyles.tenantLabel]}>{label}</Text>
                </View>

                <View style={[situationReportStyles.tenantRow, {justifyContent: "flex-end", flexDirection: 'column' }]}>
                    <InputField
                        value={name}
                        setValue={onNameChange}
                        placeholder="Name"
                        height={40} // Increased height for the input field
                        width={width}
                        backgroundColor={Color.TextInputBackground}
                        radius={20}
                        testID="testNameField"
                        style={{ marginBottom: "5%" }}
                    />

                    <InputField
                        value={surname}
                        setValue={onSurnameChange}
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
      </View>
    );
  }


export default function SituationReport() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [selectedApartment, setSelectedApartment] = useState("");
    const [selectedResidence, setSelectedResidence] = useState("");
    const [remark, setRemark] = useState("");
    
    const [arrivingTenantName, setArrivingTenantName] = useState("");
    const [arrivingTenantSurname, setArrivingTenantSurname] = useState("");

    const [leavingTenantName, setLeavingTenantName] = useState("");
    const [leavingTenantSurname, setLeavingTenantSurname] = useState("");


  return (
    <Header>
      <ScrollView style={[appStyles.screenContainer]} 
      automaticallyAdjustKeyboardInsets={true}
      removeClippedSubviews={true}
      >
        <View style={{ marginBottom: "90%", paddingBottom: "30%" }}>
          <Text style={appStyles.screenHeader}>Situation Report Form</Text>

          <PickerGroup testID="residence-picker" label={"Residence"} data={residences} chosed={selectedResidence} setValue={setSelectedResidence} />
          <PickerGroup testID="apartment-picker" label={"Apartment"} data={apartments} chosed={selectedApartment} setValue={setSelectedApartment} />

          <TenantNameGroup 
            name={arrivingTenantName}
            onNameChange={setArrivingTenantName}
            surname={arrivingTenantSurname}
            onSurnameChange={setArrivingTenantSurname}
            testID={"arriving-tenant-label"} 
            label={"Arriving Tenant"} 
            />

          <TenantNameGroup
            name={leavingTenantName}
            onNameChange={(value) => {setLeavingTenantName(value)}}
            surname={leavingTenantSurname}
            onSurnameChange={(value) => {setLeavingTenantSurname(value)}}
            testID={"leavning-tenant-label"} 
            label={"Leaving Tenant"}
            />

          <View style={situationReportStyles.lineContainer}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>

              <View style={{ marginBottom: "2%" }}>
                <Text testID="OC-description">OC = Original Condition </Text>
                <Text testID="NW-description">NW = Natural Wear</Text>
                <Text testID="AW-description">AW = Abnormal Wear</Text>
              </View>

              <View style={situationReportStyles.labels}>
                <Text testID="OC-tag" style={situationReportStyles.wearStatus}>OC</Text>
                <Text testID="NW-tag" style={situationReportStyles.wearStatus}>NW</Text>
                <Text testID="AW-tag" style={situationReportStyles.wearStatus}>AW</Text>
              </View>
            </View>

            <StraightLine />
          </View>

            {SituationReportItemsWithoutGroups.map((item, index) =>(
                <SituationReportItem key={index} label={String(item[0])} n={index + 1}/>
            ))}

          <View style={situationReportStyles.lineContainer}>
            <Text style={situationReportStyles.remark}> Remark :</Text>
            <StraightLine />

            <InputField
              value={remark}
              setValue={(value) => {setRemark(value)}}
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
            onPress={() => {navigation.navigate("List Issues" as never)}}
            style={appStyles.submitButton}
          />
        </View>
      </ScrollView>
    </Header>
  );
}


  
