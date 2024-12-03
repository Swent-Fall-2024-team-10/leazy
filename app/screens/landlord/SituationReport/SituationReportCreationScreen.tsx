import Header from "@/app/components/Header";
import { appStyles } from "@/styles/styles";
import { useState } from "react";
import React from "react";
import { Text, View, ScrollView } from "react-native";
import StraightLine from "../../../components/SeparationLine";
import { situationReportStyles } from "./SituationReportStyling";
import TickingBox from "../../../components/forms/TickingBox";

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
  };
  
  export function GroupedSituationReport({
    layout,
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
  






export default function SituationReportCreation() {
    const [layout, setLayout] = useState<[string, [string, number][]][]>([]);
    
    const originalLayout : [string, [string, number][]][] = [
        ["Floor", [["floor", 0]]],
        ["Wall", [["wall", 0]]],
        ["Ceiling", [["ceiling", 0]]],
        ["Window", [["window", 0]]],
        ["Bed", [["Bedframe", 0], ["Mattress", 0], ["Pillow", 0], ["Bedding", 0]]],
        ["Kitchen", [["Fridge", 0], ["Stove", 0], ["Microwave", 0], ["Sink", 0], ["Countertop", 0]]],
      ];
    
    return (
        <Header>
        <ScrollView style={[appStyles.screenContainer]} 
        automaticallyAdjustKeyboardInsets={true}
        removeClippedSubviews={true}
        >
            <View style={{ marginBottom: "90%", paddingBottom: "30%" }}>
            <Text style={appStyles.screenHeader}>Situation Report : Layout Creation </Text>
            
            
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

            {layout.length === 0 ? (
                <Text style={appStyles.emptyListText}> Tap the "Edit" button to start creating a new situation report layout  </Text>
            ) : (
                <GroupedSituationReport layout={layout} />
            )}

            </View>
        </ScrollView>
        </Header>
    );
}