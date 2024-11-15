import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  TenantFormScreen,
  SubrentScreen,
  SharedElementsScreen,
  SettingsScreen,
  HomepageScreen,
  MyRentScreen,
} from "./screens/tenant/";
import { registerRootComponent } from "expo"; // Ensures it works with Expo Go
import { auth } from "../firebase/firebase";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PictureProvider } from "./context/PictureContext";
import { Color } from "@/styles/styles";
import { appStyles } from "@/styles/styles";
import {
  ReportScreen,
  ListIssueScreen,
  IssueDetailsScreen,
} from "./screens/issues_tenant";
import {
  CodeApprovedScreen,
  CodeEntryScreen,
  SignInScreen,
  SignUpScreen,
} from "./screens/auth";
import { CameraScreen, CapturedMediaScreen } from "./screens/camera";
import { MessagingScreen } from "./screens/messaging";
import CustomDrawerContent from "@/app/components/drawer/CustomDrawer";
import CreateNewCode from "./screens/landlord/CreateNewCode";
import WashingMachineScreen from "./screens/laundry_machines/WashingMachineScreen";
import ManageMachinesScreen from "./screens/laundry_machines/ManageMachinesScreen";
import LandlordFormScreen from "./screens/landlord/LandlordFormScreen";

// portions of this code were generated with chatGPT as an AI assistant

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// Register the main component
registerRootComponent(App);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // To handle the loading state while we check auth

  useEffect(() => {
    // Firebase listener for authentication state
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user); // If user is not null, set as logged in
      setLoading(false); // Set loading to false once we have the auth status
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  if (loading) {
    // You could return a loading spinner here while Firebase checks the auth state
    return null;
  }

  return (
    <PictureProvider>
      <NavigationContainer>
        {isLoggedIn ? <RootNavigator /> : <AuthStackNavigator />}
      </NavigationContainer>
    </PictureProvider>
  );
}

const HomeDrawerNavigator = () => {
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
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Washing Machines" component={WashingMachineScreen} />
      <Drawer.Screen
        name="Manage Washing Machine"
        component={ManageMachinesScreen}
      />
    </Drawer.Navigator>
  );
};

// Stack Navigator that contains the drawer and other screens
const RootNavigator = () => {
  return (
    <Stack.Navigator>
      {/* Drawer is nested here */}
      <Stack.Screen
        name="HomeDrawer"
        component={HomeDrawerNavigator}
        options={{ headerShown: false }}
      />
      {/* Tenant Onboarding Screens */}
      <Stack.Screen
        name="CodeEntry"
        component={CodeEntryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CodeApproved"
        component={CodeApprovedScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TenantForm"
        component={TenantFormScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LandlordForm"
        component={LandlordFormScreen} // Ensure LandlordFormScreen is imported
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const AuthStackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="SignIn">
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

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
