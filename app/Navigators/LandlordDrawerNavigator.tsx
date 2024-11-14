import { createDrawerNavigator } from '@react-navigation/drawer';
import ManageMachinesScreen from '../screens/laundry_machines/ManageMachinesScreen';
import WashingMachineScreen from '../screens/laundry_machines/WashingMachineScreen';
import LandlordListIssuesScreen from '../screens/issues_landlord/LandlordListIssuesScreen';
import SettingsScreen from '../screens/tenant/SettingsScreen';
import React from 'react';
import CustomDrawerContent from '../components/drawer/CustomDrawer';
import { Color, appStyles } from '../../styles/styles';


const Drawer = createDrawerNavigator();

const LandlordDrawerNavigator = () => {
  return (
    <Drawer.Navigator 
    screenOptions={{
        headerShown: false, // This hides the default header
        drawerStyle: {
            backgroundColor: Color.HeaderBackground,
        },
        drawerActiveTintColor: Color.HeaderText,
        drawerLabelStyle: appStyles.drawerLabel,
    }}
    drawerContent={(props) => <CustomDrawerContent {...props} />}

    >
      <Drawer.Screen name="ManageMachines" component={ManageMachinesScreen} />
      <Drawer.Screen name="WashingMachine" component={WashingMachineScreen} />
      <Drawer.Screen name="ListIssues" component={LandlordListIssuesScreen} />
      <Drawer.Screen name="ManageTenants" component={SettingsScreen} />
    </Drawer.Navigator>
  );
};

export default LandlordDrawerNavigator;