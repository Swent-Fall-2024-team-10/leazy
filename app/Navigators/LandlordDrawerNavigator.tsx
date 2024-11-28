import { createDrawerNavigator } from '@react-navigation/drawer';
import ManageMachinesScreen from '../screens/laundry_machines/ManageMachinesScreen';
import WashingMachineScreen from '../screens/laundry_machines/WashingMachineScreen';
import LandlordListIssuesScreen from '../screens/issues_landlord/LandlordListIssuesScreen';
import SettingsScreen from '../screens/tenant/SettingsScreen';
import React from 'react';
import CustomDrawerContent from '../components/drawer/CustomDrawer';
import { Color, appStyles } from '../../styles/styles';
import SituationReport from '../screens/landlord/SituationReportScreen';


const Drawer = createDrawerNavigator();

const LandlordDrawerNavigator = () => {
  return (
    
    <LandlordProvider 
    >
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

      <Drawer.Screen name="List Issues" component={LandlordListIssuesScreen} />
      <Drawer.Screen name="Manage Machines" component={ManageMachinesScreen} />
      <Drawer.Screen name="Washing Machine" component={WashingMachineScreen} />
      <Drawer.Screen name="Manage Tenants" component={SettingsScreen} />
      <Drawer.Screen name="Situation Report" component={SituationReport} />
    </Drawer.Navigator>
  );
};

export default LandlordDrawerNavigator;