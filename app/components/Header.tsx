import React, { PropsWithChildren } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ToastAndroid,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/types";
import { Menu, User, ArrowLeft, LogOut } from "react-native-feather";
import { signOutUser } from "../../firebase/auth/auth";

const { height } = Dimensions.get("window");

interface HeaderProps extends PropsWithChildren<{}> {
  showMenu: boolean;
}

const Header: React.FC<HeaderProps> = ({ children, showMenu }) => {
  const navigation = useNavigation<
    DrawerNavigationProp<RootStackParamList> &
      StackNavigationProp<RootStackParamList>
  >();

  const handleSignOut = () => {
    signOutUser(
      () => {
        navigation.navigate("SignIn");
      },
      (error: any) => {
        ToastAndroid.show(
          "Unable to sign out. Please try again.",
          ToastAndroid.SHORT
        );
        console.error("Sign out error:", error);
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Left Icon (Menu or Back Arrow) */}
        {showMenu ? (
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Menu stroke="#0f5257" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft stroke="#0f5257" />
          </TouchableOpacity>
        )}

        {/* Centered Title */}
        <Text style={styles.headerTitle}>Leazy</Text>

        {/* Right icon (User or Sign Out Icon) */}
        {showMenu ? (
          <User stroke="#0f5257" />
        ) : (
          <TouchableOpacity onPress={handleSignOut}>
            <LogOut stroke="#0f5257" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.whiteBackground}>{children}</View>
      </View>
    </SafeAreaView>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9d5ff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#e9d5ff",
    marginTop: 15,
  },
  headerTitle: {
    flex: 1, // Centers the title
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 7.6,
    fontFamily: "Inter-Bold",
    color: "#0f5257",
    textAlign: "center",
  },
  whiteBackground: {
    width: "100%",
    position: "absolute",
    backgroundColor: "#fff",
    marginHorizontal: 0,
    marginVertical: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: height * 1.2,
    borderColor: "#0f5257",
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  contentContainer: {
    flex: 1,
  },
});
