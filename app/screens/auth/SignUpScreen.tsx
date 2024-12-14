import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import CustomTextField from '../../components/CustomTextField';
import CustomPicker from '../../components/CustomPicker';
import { UserType } from '../../../firebase/auth/auth';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import CustomPopUp from '../../components/CustomPopUp';
import {
  Color,
  FontSizes,
  LayoutPadding,
  appStyles,
  ButtonDimensions,
  stylesForNonHeaderScreens,
} from '../../../styles/styles';
import { Ionicons } from '@expo/vector-icons';
import SubmitButton from '../../components/buttons/SubmitButton';
import { AuthStackParamList } from '../../../types/types';

export default function SignUpScreen() {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const [userType, setUserType] = useState(UserType.TENANT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  interface Errors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }

  const [errors, setErrors] = useState<Errors>({});
  const [popup, setPopup] = useState(false);

  const validateForm = () => {
    let newErrors: Errors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (!confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password';
    if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSignUpPress = () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    if (userType == UserType.TENANT) {
      navigation.navigate('TenantForm', { email: email, password: password });
    } else {
      navigation.navigate('LandlordForm', { email: email, password: password });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {popup && (
          <Modal
            transparent={true}
            animationType='fade'
            visible={popup}
            onRequestClose={() => setPopup(false)}
          >
            <CustomPopUp
              testID='signUpPopup'
              text='An error occurred while signing up. Please make sure you are connected to the internet and that your email is not already used by another account.'
              onPress={() => setPopup(false)}
            />
          </Modal>
        )}

        <TouchableOpacity
          style={appStyles.backButton}
          onPress={navigation.goBack}
          testID='backButton'
        >
          <Ionicons
            name='arrow-back'
            size={FontSizes.backArrow}
            color={Color.ButtonBackground}
            style={appStyles.backButton}
          />
        </TouchableOpacity>

        <Text style={[appStyles.screenHeader, { fontSize: 40, flex: 0 }]}>
          Welcome to Leazy
        </Text>
        <Text style={styles.label}>
          Are you renting or the manager of a property?
        </Text>

        <CustomPicker
          testID='userTypePicker'
          selectedValue={userType}
          onValueChange={(itemValue) => setUserType(itemValue)}
        />

        <Text style={styles.label}> Choose an email and a password</Text>

        <CustomTextField
          testID='emailInput'
          placeholder='Email'
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          autoCapitalize='none'
          style={appStyles.signUpInputField}
        />
        {errors.email && (
          <Text style={stylesForNonHeaderScreens.errorText}>
            {errors.email}
          </Text>
        )}

        <CustomTextField
          testID='passwordInput'
          placeholder='Password'
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={appStyles.signUpInputField}
        />
        {errors.password && (
          <Text style={stylesForNonHeaderScreens.errorText}>
            {errors.password}
          </Text>
        )}

        <CustomTextField
          testID='confirmPasswordInput'
          placeholder='Confirm Password'
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={appStyles.signUpInputField}
          secureTextEntry
        />
        {errors.confirmPassword && (
          <Text style={stylesForNonHeaderScreens.errorText}>
            {errors.confirmPassword}
          </Text>
        )}

        <SubmitButton
          testID='signUpButton'
          disabled={false}
          onPress={handleSignUpPress}
          width={ButtonDimensions.largeButtonWidth}
          height={ButtonDimensions.largeButtonHeight}
          label='Sign up'
          style={appStyles.submitButton}
          textStyle={appStyles.submitButtonText}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  inputError: {
    borderColor: '#FF004',
    borderWidth: 1,
  },

  scrollContainer: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 70,
    backgroundColor: 'white',
  },

  label: {
    color: Color.TextInputLabel,
    textAlign: 'center',
    fontFamily: 'Inter SemiBold',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: '400',
    lineHeight: 24, // Adjust if necessary, using numeric value for lineHeight
    letterSpacing: 0.24,
    paddingTop: LayoutPadding.LabelTop,
    paddingBottom: LayoutPadding.LabelBottom,
  },
});
