import CustomButton from "@/app/components/CustomButton";
import React from "react";
import { View, Text } from "react-native";
import {
  useNavigation,
  NavigationProp,
  useRoute,
} from "@react-navigation/native";
import { RootStackParamList } from "@/types/types";
import { appStyles, stylesForNonHeaderScreens } from "@/styles/styles"; // Import globalStyles
import { SafeAreaView } from "react-native-safe-area-context";
import SubmitButton from "@/app/components/buttons/SubmitButton";

export default function CodeApprovedScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { tenantCodeId } = route.params as { tenantCodeId: string };

  const address = "18 Chemin de Renens, 1004 Lausanne";

  return (
    <SafeAreaView style={appStyles.screenContainer}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={stylesForNonHeaderScreens.approvedText}>
          Code approved!
        </Text>
        <Text style={stylesForNonHeaderScreens.text}>
          Welcome to {"\n"}
          {address}!
        </Text>
        <SubmitButton
          testID="next-button"
          textStyle={appStyles.submitButtonText}
          onPress={onNext}
          label="Next"
          width={200}
          height={40}
          disabled={false}
          style={appStyles.submitButton}
        />
      </View>
    </SafeAreaView>
  );
}
