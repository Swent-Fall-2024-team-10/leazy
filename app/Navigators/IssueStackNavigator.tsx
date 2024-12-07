import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ListIssueScreen from '../screens/issues_tenant/ListIssueScreen';
import IssueDetailsScreen from '../screens/issues_tenant/IssueDetailsScreen';
import ReportScreen from '../screens/issues_tenant/ReportScreen';
import CameraScreen from '../screens/camera/CameraScreen';
import CapturedMediaScreen from '../screens/camera/CapturedMediaScreen';
import MessagingScreen from '../screens/messaging/MessagingScreen';

const Stack = createStackNavigator();

const IssueStackNavigator = () => {
    return (
            <Stack.Navigator>
            <Stack.Screen
                name="Issues"
                component={ListIssueScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="IssueDetails"
                component={IssueDetailsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Report"
                component={ReportScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CameraScreen"
                component={CameraScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CapturedMedia"
                component={CapturedMediaScreen}
                options={{ headerShown: true }}
            />
            <Stack.Screen
                name="Messaging"
                component={MessagingScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default IssueStackNavigator;