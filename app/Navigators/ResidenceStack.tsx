import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import ResidencesListScreen from '../screens/landlord/ResidenceListScreen';
import CreateResidenceForm from '../screens/landlord/ResidenceCreationScreen';
import FlatDetails from '../screens/landlord/FlatDetails';

const Stack = createStackNavigator();

const ResidenceStack = () => {
    return (
            <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown:false}}>
                <Stack.Screen name="ResidenceList" component={ResidencesListScreen} />
                <Stack.Screen name="FlatDetails" component={FlatDetails}/>
                <Stack.Screen name="CreateResidence" component={CreateResidenceForm} />
            </Stack.Navigator>
    );
};

export default ResidenceStack;