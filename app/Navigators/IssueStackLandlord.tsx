import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LandlordListIssuesScreen from "../screens/issues_landlord/LandlordListIssuesScreen";
import IssueDetailsScreen from "../screens/issues_tenant/IssueDetailsScreen";
import MessagingScreen from "../screens/messaging/MessagingScreen";
import LandloardDashboard from "../screens/landlord/LandloardDashboard";

const Stack = createStackNavigator();

const IssueStackLandlord = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={LandloardDashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Issues"
        component={LandlordListIssuesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IssueDetails"
        component={IssueDetailsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Messaging"
        component={MessagingScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default IssueStackLandlord;
