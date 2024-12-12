import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawerContent from '../components/drawer/CustomDrawer';
import HomepageScreen from '../screens/tenant/HomepageScreen';
import IssueStackNavigator from '../Navigators/IssueStackNavigator';
import MyRentScreen from '../screens/tenant/MyRentScreen';
import SharedElementsScreen from '../screens/tenant/SharedElementsScreen';
import SubrentScreen from '../screens/tenant/SubrentScreen';
import SettingsScreen from '../screens/tenant/SettingsScreen';
import WashingMachineScreen from '../screens/laundry_machines/WashingMachineScreen';
import ViewNewsfeedScreen from '../screens/newsfeed/ViewNewsfeedScreen';
import { Color, appStyles } from '../../styles/styles';

const Drawer = createDrawerNavigator();

const TenantHomeDrawerNavigator = () => {
    return (
        <Drawer.Navigator
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
            <Drawer.Screen name="Home" component={HomepageScreen} />
            <Drawer.Screen
                name="Maintenance Requests"
                component={IssueStackNavigator}
                options={{ unmountOnBlur: true }}
            />
            <Drawer.Screen name="My Rent" component={MyRentScreen} />
            <Drawer.Screen name="Shared elements" component={SharedElementsScreen} />
            <Drawer.Screen name="Subrent" component={SubrentScreen} />
            <Drawer.Screen name="Washing Machines" component={WashingMachineScreen} />
            <Drawer.Screen name="Newsfeed" component={ViewNewsfeedScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
        </Drawer.Navigator>
    );
};

export default TenantHomeDrawerNavigator;