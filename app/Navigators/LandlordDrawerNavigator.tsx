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
import SituationReportCreation from '../screens/landlord/SituationReport/SituationReportCreationScreen';
import SituationReport from '../screens/landlord/SituationReport/SituationReportScreen';

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

        <Drawer.Screen name="ListIssues" component={LandlordListIssuesScreen} />
        <Drawer.Screen name="ManageMachines" component={ManageMachinesScreen} />
        <Drawer.Screen name="WashingMachine" component={WashingMachineScreen} />
        <Drawer.Screen name="ResidenceStack" component={ResidenceStack}/>
        <Drawer.Screen name="Situation Report Creation" component={SituationReportCreation} />
        <Drawer.Screen name="Situation Report Form" component={SituationReport} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </LandlordProvider>
  );
};

export default LandlordDrawerNavigator;