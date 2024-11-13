import React, { useState } from "react";
import { View, Text } from "react-native";
import {
  useNavigation,
  NavigationProp,
  useRoute,
} from "@react-navigation/native";
import { RootStackParamList } from "@/types/types";
import {
  validateTenantCode,
  add_new_tenant,
} from "@/firebase/firestore/firestore";
import { appStyles, ButtonDimensions, Color, stylesForHeaderScreens, stylesForNonHeaderScreens } from "@/styles/styles";
import { SafeAreaView } from "react-native-safe-area-context";
import InputField from "@/app/components/forms/text_input";
import SubmitButton from "@/app/components/buttons/SubmitButton";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

export default function CodeEntryScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { userId, email } = route.params as {
    userId: string;
    email: string;
  };
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<{ code?: string }>({});

  const handleSubmit = async () => {
    try {
      const tenantCodeId = await validateTenantCode(code);
      if (tenantCodeId === null) {
        setErrors({ code: "Invalid code" });
        throw new Error("Invalid code");
      }
      navigation.navigate("CodeApproved", { tenantCodeId }); // Navigate to the next screen and pass the code
    } catch (error) {
      console.error("Failed to add new tenant:", error);
      alert("There was an error adding the tenant. Please try again.");
    }
  };

  return (
    <SafeAreaView style={[appStyles.screenContainer, { flex: 1 }]} >

      <View style={[appStyles.screenContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={stylesForNonHeaderScreens.title}>Welcome to Leazy</Text>
        <Text style={stylesForNonHeaderScreens.text}>
          Do you already have a code?
        </Text>
        <View style={{ marginBottom: 25, width: '80%' }}>
          <InputField
            backgroundColor={Color.TextInputBackground}
            testID="code-input"
            placeholder="Enter code"
            value={code}
            height={40}
            setValue={setCode}
            style={[{ flex: 0 }]}
          />
        </View>

        <SubmitButton
          testID="submit-code-button"
          textStyle={appStyles.submitButtonText}
          onPress={handleSubmit}
          label="Submit code"
          width={ButtonDimensions.mediumButtonWidth}
          height={ButtonDimensions.mediumButtonHeight}
          disabled={false}
          style={[ appStyles.submitButton ,{ marginBottom: 20 }]}
        />
        {errors.code && (
          <Text style={stylesForNonHeaderScreens.errorText}>{errors.code}</Text>
        )}

        <Text style={[stylesForNonHeaderScreens.text, {padding : '5%'}]}>
          If you don't have a code please ask your residence manager to generate
          one for you.
        </Text>
      </View>
    </SafeAreaView>
  );
}
