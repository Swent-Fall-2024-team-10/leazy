import { createNativeStackNavigator } from "@react-navigation/native-stack";
import  SignInScreen  from "../screens/auth/SignInScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import TenantFormScreen from "../screens/auth/TenantFormScreen";
import LandlordFormScreen from "../screens/auth/LandlordFormScreen";
import React from "react";

const Stack = createNativeStackNavigator();

const AuthStackNavigator = () => {
    
    return (
        <Stack.Navigator initialRouteName="SignIn">
            <Stack.Screen
                name="SignIn"
                component={SignInScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="TenantForm"
                component={TenantFormScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="LandlordForm"
                component={LandlordFormScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
  );
};

export default AuthStackNavigator;