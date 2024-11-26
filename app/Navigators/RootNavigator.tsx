import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "./AuthContext";
import AuthStackNavigator from "./AuthStackNavigator";
import TenantHomeDrawerNavigator from "./TenantHomeDrawerNavigator";
import React, { useEffect } from "react";
import CodeEntryScreen from "../screens/auth/CodeEntryScreen";
import LandlordDrawerNavigator from "./LandlordDrawerNavigator";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { user, tenant, landlord } = useAuth();
  useEffect(() => {}, [user, tenant, landlord]);
  if (user) {
    if (user.type === "tenant" && tenant) {
      if (tenant.residenceId !== "") {
        return <TenantHomeDrawerNavigator />;
      } else {
        return (
          <Stack.Navigator initialRouteName="CodeEntry">
            <Stack.Screen
              name="CodeEntry"
              component={CodeEntryScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        );
      }
    } else if (user.type === "landlord" && landlord) {
      return <LandlordDrawerNavigator />;
    }
  } else {
    return <AuthStackNavigator />;
  }
};

export default RootNavigator;
