import { createDrawerNavigator } from '@react-navigation/drawer';
import ManageMachinesScreen from '../screens/laundry_machines/ManageMachinesScreen';
import WashingMachineScreen from '../screens/laundry_machines/WashingMachineScreen';
import LandlordListIssuesScreen from '../screens/issues_landlord/LandlordListIssuesScreen';
import React from 'react';
import CustomDrawerContent from '../components/drawer/CustomDrawer';
import { Color, appStyles } from '../../styles/styles';
import ResidenceStack from './ResidenceStack';
import { LandlordProvider } from '../context/LandlordContext';
import SituationReportCreation from '../screens/landlord/SituationReport/SituationReportCreationScreen';
import SituationReport from '../screens/landlord/SituationReport/SituationReportScreen';
import CodeCreationScreen from '../screens/landlord/CreateNewCode';
import IssueStackLandlord from './IssueStackLandlord';
import SettingsScreen from '../screens/auth/SettingsScreen';

const Drawer = createDrawerNavigator();

const LandlordDrawerNavigator = () => {
  return (
    <LandlordProvider>
      <Drawer.Navigator
        testID='landlord-drawer-navigator'
        initialRouteName='Dashboard'
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: Color.HeaderBackground,
          },
          drawerActiveTintColor: Color.HeaderText,
          drawerLabelStyle: appStyles.drawerLabel,
        }}
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen name='Dashboard' component={IssueStackLandlord}/>
        <Drawer.Screen name='List Issues' component={LandlordListIssuesScreen}/>
        <Drawer.Screen name='Manage Machines' component={ManageMachinesScreen}/>
        <Drawer.Screen name='Washing Machine' component={WashingMachineScreen}/>
        <Drawer.Screen name='Residence Stack' component={ResidenceStack}/>
        <Drawer.Screen
          name='Situation Report Creation'
          component={SituationReportCreation}
        />
        <Drawer.Screen
          name='Situation Report Form'
          component={SituationReport}
        />
        <Drawer.Screen name='Create New Code' component={CodeCreationScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </LandlordProvider>
  );
};

export default LandlordDrawerNavigator;
