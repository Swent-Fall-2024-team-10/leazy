import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "./AuthContext";
import AuthStackNavigator from "./AuthStackNavigator";
import TenantHomeDrawerNavigator from "./TenantHomeDrawerNavigator";
import React, { useEffect } from "react";
import CodeEntryScreen from "../screens/auth/CodeEntryScreen";
import LandlordDrawerNavigator from "./LandlordDrawerNavigator";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const { user, tenantData, landlordData } = useAuth();
    useEffect(() => {}, [user, tenantData, landlordData]);
    if(user) {
        if(user.type === "tenant" && tenantData) {
            if(tenantData.residenceId !== "") {
                return(
                    <TenantHomeDrawerNavigator/>
                )
            } else {
                return(
                    <Stack.Navigator 
                    initialRouteName="CodeEntry">
                        <Stack.Screen
                            name="CodeEntry"
                            component={CodeEntryScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="CodeApproved"
                            component={CodeEntryScreen}
                            options={{ headerShown: false }}
                        />
                    </Stack.Navigator>
                   
                )
            }
        } else if(user.type === "landlord" && landlordData) {
            return(
                <LandlordDrawerNavigator/>
            )
           
        }
    } else {
        return(
            <AuthStackNavigator/>
        )
    }
}

export default RootNavigator;