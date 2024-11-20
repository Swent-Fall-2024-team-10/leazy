import Header from "@/app/components/Header";
import { appStyles } from "@/styles/styles";
import React from "react";
import { View, Text } from "react-native";




function SituationReportItem(){
    return (
        <View>
            <Text>Situation Report Item</Text>
        </View>
    );
}

export default function SituationReport() {
    return (
        <Header>
            <View style={appStyles.screenContainer}>
                <Text style={appStyles.screenHeader}>Situation Report Form</Text>
            </View>
        </Header>       
        );

}