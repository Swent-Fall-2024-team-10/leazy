import React, { useState, useEffect, useRef } from "react";
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import TickingBox from "../../../components/forms/TickingBox";
import Header from "../../../components/Header";
import { appStyles, borderWidth, ButtonDimensions, Color, FontSizes, FontWeight } from "../../../../styles/styles";
import InputField from "../../../components/forms/text_input";
import StraightLine from "../../../components/SeparationLine";
import SubmitButton from "../../../components/buttons/SubmitButton";
import RNPickerSelect from 'react-native-picker-select';
import { changeStatus, toDatabaseFormat} from "../../../utils/SituationReport";
import { addSituationReport, getApartment, deleteSituationReport } from "../../../../firebase/firestore/firestore";
import { SituationReport } from "../../../../types/types";
import { pickerSelectStyles, situationReportStyles } from "../../../../styles/SituationReportStyling";


enum enumStatus {
    OC = 1,
    NW = 2,
    AW = 3,
    NONE = 0,
}

type PickerItem = {
    label: string;
    value: string | number;
  };


// ============== Temporary constant to be able to display and test the screen without the backend being completed ================

const originalLayout : [string, [string, number][]][] = [
  ["Floor", [["floor", 0]]],
  ["Wall", [["wall", 0]]],
  ["Ceiling", [["ceiling", 0]]],
  ["Window", [["window", 0]]],
  ["Bed", [["Bedframe", 0], ["Mattress", 0], ["Pillow", 0], ["Bedding", 0]]],
  ["Kitchen", [["Fridge", 0], ["Stove", 0], ["Microwave", 0], ["Sink", 0], ["Countertop", 0]]],
];


let newLayout = originalLayout;


const residences = [
  { label: "Vortex", value: "Vortex" },
  { label: "Triaude", value: "Triaude" },
  { label: "Estudiantine", value: "Estudiantine" }
];

const apartments = Array.from({ length: 10 }, (_, i) => ({ label: `${i + 1}`, value: `${i + 1}` }));

// ============================================ END OF TEMPORARY TEST CONSTANTS ================================================

type GroupedSituationReportProps = {
  layout: [string, [string, number][]][]; // Layout containing groups and items
  changeStatus: (
    layout: [string, [string, number][]][],
    groupIndex: number,
    itemIndex: number,
    newStatus: string,
  ) => void;
  resetState: boolean;
  setReset: (value: boolean) => void;
};

export function GroupedSituationReport({
  layout,
  changeStatus,
  resetState,
  setReset,
}: GroupedSituationReportProps) {
  // Flatten the layout to calculate the total number of items
  const totalItems = layout.reduce((sum, group) => sum + group[1].length, 0);

  // Counter for numbering items across the layout
  let itemCounter = 1;

  return (
    <View>
      {layout.map((group, groupIndex) => {
        const groupName = group[0];
        const items = group[1];

        if (items.length > 1) {
          // Render group with more than one item inside a purple container
          return (
            <View key={groupIndex} style={situationReportStyles.groupContainer}>
              <Text style={situationReportStyles.groupLabel}>{groupName} :</Text>
              {items.map((item, itemIndex) => {
                const itemNumber = itemCounter++;
                return (
                  <View key={itemIndex} style={situationReportStyles.groupItemContainer}>
                    <SituationReportItem
                      label={`${itemNumber}: ${item[0]}`} // Label with item number
                      groupIndex={groupIndex}
                      itemIndex={itemIndex}
                      currentStatus={item[1]} // Current status value
                      changeStatus={changeStatus}
                      resetState={resetState}
                      setReset={setReset}
                    />
                  </View>
                );
              })}
            </View>
          );
        } else {
          // Render single item outside of any group
          const itemNumber = itemCounter++;
          return (
            <View key={groupIndex} style={situationReportStyles.singleItemContainer}>
              <SituationReportItem
                label={`${itemNumber}: ${items[0][0]}`} // Label with item number
                groupIndex={groupIndex}
                itemIndex={0}
                currentStatus={items[0][1]} // Current status value
                changeStatus={changeStatus}
                resetState={resetState}
                setReset={setReset}
              />
            </View>
          );
        }
      })}
    </View>
  );
}


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

type SituationReportItemProps = {
  label: string;
  groupIndex: number;  // Index of the group in the layout
  itemIndex: number;   // Index of the item within the group
  currentStatus: number; // Current status (0 = OC, 1 = NW, 2 = AW)
  resetState: boolean;
  setReset: (value: boolean) => void;
  changeStatus: (layout: [string, [string, number][]][], groupIndex: number, itemIndex: number, newStatus: string) => void;
};

const STATUS_MAPPING = ["NONE","OC", "NW", "AW"];

function SituationReportItem({
  label,
  groupIndex,
  itemIndex,
  currentStatus,
  changeStatus,
  resetState,
  setReset,
}: SituationReportItemProps) {
  const [checked, setChecked] = useState<number>(currentStatus);

  useEffect(() => {
    if (resetState) {
      setChecked(0);
      setReset(false);
    }
  }, [resetState]);
  

  function handleCheck(newStatus: number) {
    if (checked === newStatus) {
      setChecked(0);
      changeStatus(newLayout, groupIndex, itemIndex, STATUS_MAPPING[enumStatus.NONE]);
    } else {
      setChecked(newStatus);
      changeStatus(newLayout, groupIndex, itemIndex, STATUS_MAPPING[newStatus]);
    }
  }

  return (
    <View style={situationReportStyles.item}>
      <View style={situationReportStyles.itemRow}>
        <Text style={[situationReportStyles.text, situationReportStyles.label]}>{label}</Text>
        <TickingBox
          checked={checked === enumStatus.OC}
          onChange={() => handleCheck(enumStatus.OC)}
        />
        <TickingBox
          checked={checked === enumStatus.NW}
          onChange={() => handleCheck(enumStatus.NW)}
        />
        <TickingBox
          checked={checked === enumStatus.AW}
          onChange={() => handleCheck(enumStatus.AW)}
        />
      </View>
    </View>
  );
}

  function TenantNameGroup(
    { label, testID, name, surname, onNameChange, onSurnameChange, testIDName, testIDSurname }:
     {  name: string, 
        surname: string,
        label: string,
        testID: string, 
        testIDName: string,
        testIDSurname: string,
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
                        testID={testIDName}
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
                        testID={testIDSurname}
                        style={{ justifyContent: "flex-end" }}
                        />
                </View>
            </View>
      </View>
    );
  }


export default function SituationReportScreen() {
    const navigation = useNavigation<NavigationProp<any>>();

    const [selectedApartment, setSelectedApartment] = useState("");
    const [selectedResidence, setSelectedResidence] = useState("");
    const [remark, setRemark] = useState("");
    
    const [arrivingTenantName, setArrivingTenantName] = useState("");
    const [arrivingTenantSurname, setArrivingTenantSurname] = useState("");

    const [leavingTenantName, setLeavingTenantName] = useState("");
    const [leavingTenantSurname, setLeavingTenantSurname] = useState("");

    const [resetState, setResetState] = useState(false);

    function reset() {
        setSelectedApartment("");
        setSelectedResidence("");
        setRemark("");
        setArrivingTenantName("");
        setArrivingTenantSurname("");
        setLeavingTenantName("");
        setLeavingTenantSurname("");
        setResetState((prev) => !prev);
    }

    const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    }, [])
  );


  return (
    <Header>
      <ScrollView style={[appStyles.screenContainer]} 
      automaticallyAdjustKeyboardInsets={true}
      removeClippedSubviews={true}
      ref={scrollViewRef}
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
            testIDName="arriving-tenant-name"
            testIDSurname="arriving-tenant-surname"
            />

          <TenantNameGroup
            name={leavingTenantName}
            onNameChange={(value) => {setLeavingTenantName(value)}}
            surname={leavingTenantSurname}
            onSurnameChange={(value) => {setLeavingTenantSurname(value)}}
            testID={"leavning-tenant-label"} 
            label={"Leaving Tenant"}
            testIDName="leaving-tenant-name"
            testIDSurname="leaving-tenant-surname"
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

          <GroupedSituationReport layout={newLayout} changeStatus={changeStatus} resetState={resetState} setReset={() => setResetState(false)}/>


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
            onPress={async () => {

              // Hardcoded value for the apartmentId since residence and apartment
              const report : SituationReport = {
                reportDate: new Date().toISOString(),
                residenceId: selectedResidence,
                apartmentId: "damH2jH7NRxIVZa0cZgL",
                arrivingTenant: JSON.stringify({
                  name: arrivingTenantName,
                  surname: arrivingTenantSurname,
                }),
                leavingTenant: JSON.stringify({
                  name: leavingTenantName,
                  surname: leavingTenantSurname,
                }),
                remarks: remark,
                reportForm: toDatabaseFormat(newLayout, arrivingTenantName + " Situation Report"),
              }

              console.log(report);
              reset();


              const apartment = await getApartment("damH2jH7NRxIVZa0cZgL");
              if (!apartment) {
                console.log("Apartment not found");
              }
              
              if (apartment?.situationReportId) {
                await deleteSituationReport(apartment.situationReportId);
              }

              addSituationReport(report,"damH2jH7NRxIVZa0cZgL");
              navigation.navigate("List Issues" as never)
            }}
            style={appStyles.submitButton}
          />
        </View>
      </ScrollView>
    </Header>
  );
}


