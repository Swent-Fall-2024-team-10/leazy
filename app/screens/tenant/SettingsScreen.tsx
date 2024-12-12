import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../../types/types';
import {
  updateUserEmail,
  resetUserPassword,
  emailAndPasswordLogIn,
  deleteAccount,
} from '../../../firebase/auth/auth';
import { auth } from '../../../firebase/firebase';
import Header from '../../components/Header';
import SubmitButton from '../../components/buttons/SubmitButton';
import InputField from '../../components/forms/text_input';
import CustomPopUp from '../../components/CustomPopUp';
import { appStyles, Color } from '../../../styles/styles';
import Spacer from '../../components/Spacer';

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

  type EditModeField =
    | 'name'
    | 'email'
    | 'phone'
    | 'street'
    | 'number'
    | 'city'
    | 'canton'
    | 'zip'
    | 'country';

  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '123-456-7890',
    street: 'Main St',
    number: '123',
    city: 'Anytown',
    canton: 'Anycanton',
    zip: '12345',
    country: 'Anycountry',
  });

  const [editMode, setEditMode] = useState<Record<EditModeField, boolean>>({
    name: false,
    email: false,
    phone: false,
    street: false,
    number: false,
    city: false,
    canton: false,
    zip: false,
    country: false,
  });

  const [tempData, setTempData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    street: userData.street,
    number: userData.number,
    city: userData.city,
    canton: userData.canton,
    zip: userData.zip,
    country: userData.country,
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [deleteEmail, setDeleteEmail] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const [popup, setPopup] = useState<{
    visible: boolean;
    text: string;
    type: string;
  }>({ visible: false, text: '', type: '' });

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    setTempData(userData);
  }, [userData]);

  const toggleEditMode = (field: EditModeField) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
    setTempData((prev) => ({
      ...prev,
      [field]: userData[field],
    }));
  };

  const saveField = async (field: string) => {
    try {
      if (field === 'email') {
        await updateUserEmail(tempData.email);
      }

      setUserData((prev) => ({
        ...prev,
        [field]: tempData[field as keyof typeof userData],
      }));
      setEditMode((prev) => ({ ...prev, [field]: false }));
      setPopup({
        visible: true,
        text: `${capitalize(field)} updated successfully.`,
        type: 'success',
      });
    } catch (error: any) {
      setPopup({
        visible: true,
        text: `Failed to update ${capitalize(field)}: ${error.message}`,
        type: 'error',
      });
    }
  };

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.navigate('SignIn');
      })
      .catch((error) => {
        setPopup({
          visible: true,
          text: `Error signing out: ${error.message}`,
          type: 'error',
        });
      });
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setPopup({
        visible: true,
        text: `Passwords do not match.`,
        type: 'error',
      });
      return;
    }
    try {
      await resetUserPassword(newPassword);
      setPopup({
        visible: true,
        text: `Password reset successfully.`,
        type: 'success',
      });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPopup({
        visible: true,
        text: `Failed to reset password: ${error.message}`,
        type: 'error',
      });
    }
  };


  const handleDeleteAccount = async () => {
    try {
      const user = await emailAndPasswordLogIn(deleteEmail, deletePassword);
      if (user) {
        await deleteAccount();
        setPopup({
          visible: true,
          text: `Account deleted successfully.`,
          type: 'success',
        });
        navigation.navigate('SignIn');
      } else {
        setPopup({
          visible: true,
          text: `Invalid email or password.`,
          type: 'error',
        });
      }
    } catch (error: any) {
      setPopup({
        visible: true,
        text: `Failed to delete account: ${error.message}`,
        type: 'error',
      });
    }
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Header>
      <ScrollView
        style={appStyles.screenContainer}
        automaticallyAdjustKeyboardInsets={true}
        showsVerticalScrollIndicator={true}
      >
        <View
          style={[
            appStyles.scrollContainer,
            { paddingBottom: '90%', marginBottom: '10%' },
          ]}
        >
          <Text style={styles.title}>Settings & Profile</Text>
          <Spacer height={20} />
          <View>
            <Text style={styles.sectionHeader}>Profile Information</Text>
            {Object.keys(userData).map((field) => {
              const typedField = field as EditModeField;
              return (
                <View key={typedField} style={styles.fieldContainer}>
                  <Text style={styles.label}>{capitalize(typedField)}</Text>
                  {editMode[typedField] ? (
                    <InputField
                      label={capitalize(typedField)}
                      value={tempData[typedField]}
                      setValue={(value: string) =>
                        setTempData((prev) => ({
                          ...prev,
                          [typedField]: value,
                        }))
                      }
                      placeholder={`Enter your ${typedField}`}
                      testID={`input-${typedField}`}
                    />
                  ) : (
                    <Text style={styles.value}>{userData[typedField]}</Text>
                  )}
                  <TouchableOpacity
                    onPress={() => toggleEditMode(typedField)}
                    style={styles.modifyButton}
                  >
                    <Text style={styles.modifyButtonText}>
                      {editMode[typedField] ? 'Cancel' : 'Modify'}
                    </Text>
                  </TouchableOpacity>
                  {editMode[typedField] && (
                    <SubmitButton
                      disabled={false}
                      onPress={() => saveField(typedField)}
                      width={100}
                      height={40}
                      label='Save'
                      testID={`save-${typedField}`}
                      style={styles.saveButton}
                    />
                  )}
                </View>
              );
            })}
          </View>

          {/* Password Reset Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Change Password</Text>
            <InputField
              label='New Password'
              value={newPassword}
              setValue={setNewPassword}
              placeholder='Enter new password'
              testID='input-new-password'
            />
            <InputField
              label='Confirm Password'
              value={confirmPassword}
              setValue={setConfirmPassword}
              placeholder='Confirm new password'
              testID='input-confirm-password'
            />
            <SubmitButton
              disabled={false}
              onPress={handleResetPassword}
              width={150}
              height={50}
              label='Reset Password'
              testID='button-reset-password'
              style={styles.submitButton}
            />
          </View>

          {/* Sign Out Button */}
          <SubmitButton
            disabled={false}
            onPress={handleSignOut}
            width={150}
            height={50}
            label='Sign Out'
            testID='button-sign-out'
            style={styles.signOutButton}
          />

          {/* Delete Account Button */}
          <SubmitButton
            disabled={false}
            onPress={() => setShowDeleteConfirmation(true)}
            width={150}
            height={50}
            label='Delete Account'
            testID='button-delete-account'
            style={styles.deleteButton}
          />

          {/* CustomPopUp for general messages */}
          {popup.visible && popup.type !== 'delete' && (
            <CustomPopUp
              text={popup.text}
              onPress={() => setPopup({ visible: false, text: '', type: '' })}
              testID='popup'
            />
          )}

          {/* Delete Account Confirmation */}
          {showDeleteConfirmation && (
            <View style={styles.deleteConfirmationContainer}>
              <Text style={styles.sectionHeader}>Confirm Account Deletion</Text>
              <InputField
                label='Email'
                value={deleteEmail}
                setValue={setDeleteEmail}
                placeholder='Enter your email'
                testID='input-delete-email'
              />
              <InputField
                label='Password'
                value={deletePassword}
                setValue={setDeletePassword}
                placeholder='Enter your password'
                testID='input-delete-password'
              />
              <SubmitButton
                disabled={false}
                onPress={handleDeleteAccount}
                width={150}
                height={50}
                label='Delete'
                testID='button-confirm-delete'
                style={styles.deleteButton}
              />
              <SubmitButton
                disabled={false}
                onPress={() => setShowDeleteConfirmation(false)}
                width={150}
                height={50}
                label='Cancel'
                testID='button-cancel-delete'
                style={styles.cancelButton}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </Header>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Color.IssueTextBackground,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: Color.HeaderText,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: Color.HeaderText,
  },
  fieldContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Color.TextInputBorder,
    paddingBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Color.TextInputText,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: Color.TextInputText,
    marginBottom: 5,
  },
  modifyButton: {
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  modifyButtonText: {
    color: Color.ButtonBackground,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: Color.ButtonBackground,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: Color.ButtonBackground,
    alignSelf: 'center',
    marginTop: 10,
  },
  signOutButton: {
    backgroundColor: Color.ButtonBackground,
    alignSelf: 'center',
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: Color.CancelColor, 
    alignSelf: 'center',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: Color.CancelColor, 
    alignSelf: 'center',
    marginTop: 10,
  },
  deleteConfirmationContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20, 
    marginBottom: -20, 
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
});
