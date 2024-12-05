import { createDrawerNavigator } from '@react-navigation/drawer';
import ManageMachinesScreen from '../screens/laundry_machines/ManageMachinesScreen';
import WashingMachineScreen from '../screens/laundry_machines/WashingMachineScreen';
import LandlordListIssuesScreen from '../screens/issues_landlord/LandlordListIssuesScreen';
import SettingsScreen from '../screens/tenant/SettingsScreen';
import React from 'react';
import CustomDrawerContent from '../components/drawer/CustomDrawer';
import { Color, appStyles } from '../../styles/styles';
import ResidenceStack from './ResidenceStack';
import { LandlordProvider } from '../context/LandlordContext';


const Drawer = createDrawerNavigator();

const LandlordDrawerNavigator = () => {
  return (
    
    <LandlordProvider>
      <Drawer.Navigator 
        initialRouteName="ListIssues"
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

        <Drawer.Screen name="Maintenance Requests" component={LandlordListIssuesScreen} />
        <Drawer.Screen name="Manage Washing Machines" component={ManageMachinesScreen} />
        <Drawer.Screen name="Washing Machines" component={WashingMachineScreen} />
        <Drawer.Screen name="Your Residences" component={ResidenceStack}/>
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </LandlordProvider>
  );
};

export default LandlordDrawerNavigator;