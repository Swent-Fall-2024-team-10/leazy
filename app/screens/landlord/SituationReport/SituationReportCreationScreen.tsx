import Header from "@/app/components/Header";
import { appStyles, ButtonDimensions, defaultButtonRadius} from "@/styles/styles";
import { useState } from "react";
import React from "react";
import { Text, View, ScrollView, TouchableOpacity} from "react-native";
import { Button, Icon } from "react-native-elements";
import StraightLine from "../../../components/SeparationLine";
import { layoutCreationStyles, situationReportStyles } from "./SituationReportStyling";
import TickingBox from "../../../components/forms/TickingBox";
import { addGroupToLayout } from "../../../utils/SituationReport";
import SubmitButton from "@/app/components/buttons/SubmitButton";

type SituationReportItemProps = {
    label: string;
  };
  /**
 * represent a situation report item where the check boxes are displayed but not functional
 * 
 *
 *   
 * */
  function SituationReportItem({
    label,
  }: SituationReportItemProps) {
  
    return (
      <View style={situationReportStyles.item}>
        <View style={situationReportStyles.itemRow}>
          <Text style={[situationReportStyles.text, situationReportStyles.label]}>{label}</Text>
          <TickingBox
            checked={false}
            onChange={() => {}}
          />
          <TickingBox
            checked={false}
            onChange={() => {}}
          />
          <TickingBox
            checked={false}
            onChange={() => {}}
          />
        </View>
      </View>
    );
  }
  


type GroupedSituationReportProps = {
    layout: [string, [string, number][]][]; // Layout containing groups and items
    editMode: boolean; // Whether the layout is in edit mode this will allow the user to add new groups or items while in edit mode
    setTempLayout: (newLayout: [string, [string, number][]][]) => void;
    tempLayout: [string, [string, number][]][];
  };
  
  export function GroupedSituationReport({
    layout,
    editMode,
    setTempLayout,
    tempLayout
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
                      />
                                          
                    </View>
                  );
                })}
                {editMode &&
                <AddItemButton
                        label="Add New Item"
                        testID={"add-item-button-group-" + groupName}
                        buttonStyle={layoutCreationStyles.addButton}
                        textStyle={layoutCreationStyles.buttonText}
                        onPress={() => {
                          let nextLayout = addGroupToLayout(tempLayout, [["New Item", 0]], groupName);
                          setTempLayout(nextLayout);
                          console.log('Add new item')
                          console.log(groupIndex)
                        }}
                        />  }
              </View>
            );
          } else {
            const itemNumber = itemCounter++;
            return (
              <View key={groupIndex} style={situationReportStyles.singleItemContainer}>
                <SituationReportItem
                  label={`${itemNumber}: ${items[0][0]}`} // Label with item number
                />
              </View>
            );
          }
        })}
      </View>
    );
  }
  

type AddItemButtonProps = {
    label: string;
    testID: string;
    buttonStyle: any;
    textStyle: any;
    onPress: () => void;
};

export function AddItemButton({ label, testID, buttonStyle, textStyle, onPress }: AddItemButtonProps) {
    return (
            <TouchableOpacity
            testID={testID}
            style={buttonStyle}
            onPress={onPress}
        
            >
                <View style={{flex: 1, flexDirection : "row"}}>
                    <Icon
                        name="add"
                        size={20}
                        color="white"
                        backgroundColor={"green"}
                        style={{borderRadius: defaultButtonRadius}}
                        />

                    <Text style={textStyle}> {label} </Text>

                </View>
            </TouchableOpacity>
    );
}





export default function SituationReportCreation() {
    const [layout, setLayout] = useState<[string, [string, number][]][]>([]);
    const [editMode, setEditMode] = useState(false);

    const [tempLayout, setTempLayout] = useState<[string, [string, number][]][]>([]);

    function resetStates() {
        setLayout([]);
        setEditMode(false);
        setTempLayout([]);
    }

    
    return (
    <Header>
        <ScrollView style={[appStyles.screenContainer]} 
        automaticallyAdjustKeyboardInsets={true}
        removeClippedSubviews={true}
        >
            <View style={{ marginBottom: "90%", paddingBottom: "30%" }}>
                <Text style={appStyles.screenHeader}>Situation Report : Layout Creation </Text>
                
                
                <View style={situationReportStyles.layoutCreationSeparationLine}>
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

                {editMode ? (
                    <View style={layoutCreationStyles.cancelOrSaveContainer}>
                            <Button
                                testID="cancel-button"
                                title="Cancel"
                                titleStyle={appStyles.submitButtonText}
                                onPress={()=> {
                                    setLayout(layout);
                                    setEditMode(false);
                                }}
                                buttonStyle={[
                                    appStyles.buttonCancel, 
                                    layoutCreationStyles.layoutModificationButton
                                ]}
                            />

                            <Button
                                testID="save-button"
                                title="Save"
                                titleStyle={appStyles.submitButtonText}
                                onPress={()=> {
                                    setLayout(tempLayout);
                                    setEditMode(false);                                
                                }}
                                buttonStyle={[
                                    appStyles.buttonAccept, 
                                    layoutCreationStyles.layoutModificationButton,
                                ]}
                            />
                    </View>
                    ) : (
                    <View style={layoutCreationStyles.editButton}>
                        <Button
                                testID="edit-button"
                                title="Edit"
                                titleStyle={appStyles.submitButtonText}
                                onPress={()=> {
                                    setEditMode(true); 
                                    setTempLayout(layout);                               
                                }}
                                buttonStyle={[
                                    appStyles.buttonAccept, 
                                    layoutCreationStyles.layoutModificationButton,
                                ]}
                        />
                    </View>
                )}

                {layout.length === 0 && !editMode ? (
                    <Text style={appStyles.emptyListText}> Tap the "Edit" button to start creating a new situation report layout  </Text>
                ) : (
                    editMode ? (
                        <GroupedSituationReport 
                            layout={tempLayout} 
                            editMode={editMode} 
                            setTempLayout={(value) => setTempLayout}
                            tempLayout={tempLayout}
                        />
                    ) : (
                        <GroupedSituationReport 
                            layout={layout} 
                            editMode={editMode} 
                            setTempLayout={(value) => setTempLayout}
                            tempLayout={tempLayout}
                        />
                    )
                )}

                {editMode && (
                <View style={layoutCreationStyles.addButtonContainer}>
                    <AddItemButton
                        label="Add New Group"
                        testID="add-group-button"
                        buttonStyle={layoutCreationStyles.addButton}
                        textStyle={layoutCreationStyles.buttonText}
                        onPress={() => {
                          let nextLayout = addGroupToLayout(tempLayout, [["New Item 1", 0], ["New Item 2", 0]], "New Group");
                          setTempLayout(nextLayout);
                          console.log('Add new group')
                        
                        }}
                    />

                    <AddItemButton
                        label="Add New Single Item"
                        testID="add-single-item-button"
                        buttonStyle={layoutCreationStyles.addButton}
                        textStyle={layoutCreationStyles.buttonText}
                        onPress={() =>{
                            let nextLayout = addGroupToLayout(tempLayout, [["New Item", 0]], "New Group");
                            setTempLayout(nextLayout);
                        } 
                        }
                    />
                </View>
                )}
                    <View style={[appStyles.submitContainer, situationReportStyles.submitMargin]}>
                        <SubmitButton
                            disabled={false}
                            label="Submit"
                            testID="submit-button"
                            width={ButtonDimensions.mediumButtonWidth}
                            height={ButtonDimensions.mediumButtonHeight}
                            style={appStyles.submitButton}
                            textStyle={appStyles.submitButtonText}
                            onPress={() => {
                                console.log("Submit")
                                resetStates();
                                setLayout([]);
                                }
                            }
                        />
                    </View>
                </View>
        </ScrollView>
    </Header>
    );
}