import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from '../components/drawer/CustomDrawer';
import HomepageScreen from '../screens/tenant/HomepageScreen';
import IssueStackNavigator from '../Navigators/IssueStackNavigator';
import WashingMachineScreen from '../screens/laundry_machines/WashingMachineScreen';
import ViewNewsfeedScreen from '../screens/newsfeed/ViewNewsfeedScreen';
import { Color, appStyles } from '../../styles/styles';
import SnitchModeScreen from '../screens/SnitchMode/SnitchModeScreen';
import SettingsStackNavigator from './SettingsStackNavigator';

const Drawer = createDrawerNavigator();

const TenantHomeDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            testID='tenant-drawer-navigator'
            initialRouteName="Home"
            useLegacyImplementation={false}
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false, // This hides the default header
                drawerStyle: {
                    backgroundColor: Color.HeaderBackground,
                },
                drawerActiveTintColor: Color.HeaderText,
                drawerLabelStyle: appStyles.drawerLabel,
            }}
        >
            <Drawer.Screen name="Home" component={ViewNewsfeedScreen} />
            <Drawer.Screen
                name="Maintenance Requests"
                component={IssueStackNavigator}
                options={{ unmountOnBlur: true }}
            />
            <Drawer.Screen name="Washing Machines" component={WashingMachineScreen} />
            <Drawer.Screen name="Snitch Mode" component={SnitchModeScreen} />
            <Drawer.Screen 
                name="Settings" 
                component={SettingsStackNavigator}
                options={{ unmountOnBlur: true }}    
            />
        </Drawer.Navigator>
    );
};

export default TenantHomeDrawerNavigator;