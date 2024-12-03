import Header from "@/app/components/Header";
import { appStyles } from "@/styles/styles";
import React from "react";
import { Text, View, ScrollView } from "react-native";
import StraightLine from "../../../components/SeparationLine";
import { situationReportStyles } from "./SituationReportStyling";

export default function SituationReportCreation() {
    
  return (
    <Header>
      <ScrollView style={[appStyles.screenContainer]} 
      automaticallyAdjustKeyboardInsets={true}
      removeClippedSubviews={true}
      >
        <View style={{ marginBottom: "90%", paddingBottom: "30%" }}>
          <Text style={appStyles.screenHeader}>Situation Report Form</Text>
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

        </View>
      </ScrollView>
    </Header>
  );
}