import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SettingsScreen from "../screens/auth/SettingsScreen";
import SituationReportConsultationScreen from "../screens/landlord/SituationReport/SituationReportConsultationScreen";

const Stack = createNativeStackNavigator();

const SettingsStackNavigator = () => {
    
    return (
        <Stack.Navigator initialRouteName="Settings">
            <Stack.Screen
                name="SettingsStack"
                component={SettingsScreen}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="SituationReportConsultation"
                component={SituationReportConsultationScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
  );
};

export default SettingsStackNavigator;