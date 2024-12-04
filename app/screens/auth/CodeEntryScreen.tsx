import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import {
  validateTenantCode,
  getTenant,
  getResidence,
  getApartment,
  updateResidence,
  updateApartment,
  updateTenant,
} from "../../../firebase/firestore/firestore";
import {
  appStyles,
  ButtonDimensions,
  Color,
  stylesForNonHeaderScreens,
} from "../../../styles/styles";
import { SafeAreaView } from "react-native-safe-area-context";
import InputField from "../../components/forms/text_input";
import SubmitButton from "../../components/buttons/SubmitButton";
import { useAuth } from "../../context/AuthContext";

export default function CodeEntryScreen() {
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<{ code?: string }>({});
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (user) {
      try {
        const { residenceId, apartmentId, tenantCodeUID } =
          await validateTenantCode(code);

        // Add new tenant to its residence and apartment
        const tenant = await getTenant(user.uid);
        const residence = await getResidence(residenceId);
        const apartment = await getApartment(apartmentId);

        if (!tenant) {
          throw new Error(`Tenant with ID ${user.uid} not found.`);
        }
        if (!residence) {
          throw new Error(`Residence with ID ${residenceId} not found.`);
        }
        if (!apartment) {
          throw new Error(`Apartment with ID ${apartmentId} not found.`);
        }

        await updateResidence(residenceId, {
          tenantIds: [...residence.tenantIds, tenant.userId],
        });

        await updateApartment(apartmentId, {
          tenants: [...apartment.tenants, tenant.userId],
        });

        await updateTenant(tenant.userId, {
          apartmentId: apartmentId,
          residenceId: residenceId,
        });

        Alert.alert(
          "Welcome to your tenant dashboard!",
          "You've successfully registered to your residence."
        );
      } catch (error: any) {
        setErrors({ code: error.message });
      }
    }
  };

  return (
    <SafeAreaView style={[appStyles.screenContainer, { flex: 1 }]}>
      <View
        style={[
          appStyles.screenContainer,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={stylesForNonHeaderScreens.title}>Welcome to Leazy</Text>
        <Text style={stylesForNonHeaderScreens.text}>
          Do you already have a code?
        </Text>
        <View style={{ marginBottom: 25, width: "80%" }}>
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
          style={[appStyles.submitButton, { marginBottom: 20 }]}
        />
        {errors.code && (
          <Text style={stylesForNonHeaderScreens.errorText}>{errors.code}</Text>
        )}

        <Text style={[stylesForNonHeaderScreens.text, { padding: "5%" }]}>
          If you don't have a code please ask your residence manager to generate
          one for you.
        </Text>
      </View>
    </SafeAreaView>
  );
}
