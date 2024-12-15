import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
} from 'react-native';
import { TUser } from '../../../types/types';
import {
  updateUserEmailAuth,
  changeUserPassword,
  emailAndPasswordLogIn,
  deleteAccount,
} from '../../../firebase/auth/auth';

import { getUser, updateUser } from '../../../firebase/firestore/firestore';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../../firebase/firebase';
import Header from '../../components/Header';
import SubmitButton from '../../components/buttons/SubmitButton';
import InputField from '../../components/forms/text_input';
import {
  appStyles,
  Color,
  FontSizes,
  ButtonDimensions,
} from '../../../styles/styles';
import Spacer from '../../components/Spacer';
import SeparationLine from '../../components/SeparationLine';

export default function SettingsScreen() {
  type EditModeField =
    | 'name'
    | 'phone'
    | 'street'
    | 'number'
    | 'city'
    | 'canton'
    | 'zip'
    | 'country';

  const orderedFields: EditModeField[] = [
    'name',
    'phone',
    'street',
    'number',
    'city',
    'canton',
    'zip',
    'country',
  ];

  const [isChanged, setIsChanged] = useState(false);

  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');

  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    street: '',
    number: '',
    city: '',
    canton: '',
    zip: '',
    country: '',
  });

  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        throw new Error('User not found');
      }

      try {
        const userObj = await getUser(user.uid);

        if (!userObj) {
          throw new Error('User data not found');
        }

        setUserData({
          name: userObj.name,
          phone: userObj.phone,
          street: userObj.street,
          number: userObj.number,
          city: userObj.city,
          canton: userObj.canton,
          zip: userObj.zip,
          country: userObj.country,
        });
      } catch (error) {
        return error;
      }
    };

    fetchUserData();
  }, [user]);

  const [editMode, setEditMode] = useState<Record<EditModeField, boolean>>({
    name: false,
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
    type: 'error' | 'success' | 'loading';
  }>({ visible: false, text: '', type: 'loading' });

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    setTempData(userData);
  }, [userData]);

  useEffect(() => {
    const hasChanges = Object.keys(userData).some(
      (key) =>
        userData[key as keyof typeof userData] !==
        tempData[key as keyof typeof tempData],
    );
    setIsChanged(hasChanges);
  }, [tempData, userData]);

  const toggleEditMode = (field: EditModeField) => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
    setTempData((prev) => ({
      ...prev,
      [field]: userData[field],
    }));
  };

  const modifyUser = async () => {
    setPopup({ visible: true, text: 'Saving changes...', type: 'loading' });
    try {
      const newUser: TUser = {
        uid: user?.uid || '',
        type: user?.type || 'tenant',
        email: user?.email || '',
        ...tempData,
      };
      await updateUser(user?.uid || '', newUser);

      const updatedUser = await getUser(user?.uid || '');
      if (updatedUser) {
        setUserData(updatedUser);
      }

      setEditMode((prev) =>
        Object.keys(prev).reduce(
          (acc, key) => ({ ...acc, [key]: false }),
          {} as Record<EditModeField, boolean>,
        ),
      );

      setPopup({
        visible: true,
        text: 'Changes saved successfully!',
        type: 'success',
      });
    } catch (error) {
      setPopup({
        visible: true,
        text: 'Failed to save changes. Please try again.',
        type: 'error',
      });
    }
  };

  const handleSignOut = () => {
    auth.signOut().catch((error) => {
      setPopup({
        visible: true,
        text: `Error signing out: ${error.message}`,
        type: 'error',
      });
    });
  };

  const validateAndShowError = (
    condition: boolean,
    errorMessage: string,
    setPopup: Function,
  ): boolean => {
    if (condition) {
      setPopup({
        visible: true,
        text: errorMessage,
        type: 'error',
      });
      return true;
    }
    return false;
  };

  const handleChangePassword = async (currentPassword: string) => {
    if (
      validateAndShowError(
        !currentPassword,
        'Current password is required.',
        setPopup,
      )
    )
      return;

    if (
      validateAndShowError(
        !newPassword || !confirmPassword,
        'New password and confirmation password cannot be empty.',
        setPopup,
      )
    )
      return;

    if (
      validateAndShowError(
        newPassword !== confirmPassword,
        'New password and confirmation password do not match.',
        setPopup,
      )
    )
      return;

    // Check that the new password is different from the current password
    if (
      validateAndShowError(
        newPassword === currentPassword,
        'New password must be different from the current one.',
        setPopup,
      )
    )
      return;

    try {
      setPopup({
        visible: true,
        text: 'Changing password...',
        type: 'loading',
      });

      await changeUserPassword(currentPassword, newPassword);

      setPopup({
        visible: true,
        text: 'Password changed successfully!',
        type: 'success',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPopup({
        visible: true,
        text: `Failed to change password: ${error.message}`,
        type: 'error',
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setPopup({ visible: true, text: 'Deleting account...', type: 'loading' });
      const deletedUser = await emailAndPasswordLogIn(
        deleteEmail,
        deletePassword,
      );
      if (deletedUser) {
        await deleteAccount();
        setPopup({
          visible: true,
          text: 'Account deleted successfully.',
          type: 'success',
        });
      } else {
        setPopup({
          visible: true,
          text: 'Invalid email or password.',
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

  const handleChangeEmail = async () => {
    // Validate inputs
    if (validateAndShowError(!newEmail, 'New email cannot be empty.', setPopup))
      return;

    if (
      validateAndShowError(
        !emailPassword,
        'Password cannot be empty.',
        setPopup,
      )
    )
      return;

    // Check that the new email is different from the current one
    if (
      validateAndShowError(
        newEmail === user?.email,
        'New email must be different from the current one.',
        setPopup,
      )
    )
      return;

    try {
      setPopup({ visible: true, text: 'Updating email...', type: 'loading' });

      await updateUserEmailAuth(emailPassword, newEmail);

      // Update Firestore user document
      if (user?.uid) {
        // Update only the email field
        await updateUser(user.uid, { email: newEmail } as Partial<TUser>);

        const updatedUser = await getUser(user.uid);
        if (updatedUser) {
          setUserData(updatedUser);
        }

        setPopup({
          visible: true,
          text: 'Email changed successfully!',
          type: 'success',
        });
      }

      setNewEmail('');
      setEmailPassword('');
    } catch (error: any) {
      setPopup({
        visible: true,
        text: `Failed to change email: ${error.message}`,
        type: 'error',
      });
    }
  };

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Header>
      <KeyboardAvoidingView
        behavior='padding'
        style={[appStyles.screenContainer, { padding: 0 }]}
      >
        <ScrollView
          style={appStyles.screenContainer}
          automaticallyAdjustKeyboardInsets={true}
          showsVerticalScrollIndicator={true}
        >
          {/* Modal to replace the CustomPopUp */}
          <Modal
            transparent={true}
            visible={popup.visible}
            animationType='fade'
            onRequestClose={() =>
              setPopup({ visible: false, text: '', type: 'loading' })
            }
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                  {popup.type.toUpperCase()}
                </Text>
                <Text style={styles.modalMessage}>{popup.text}</Text>
                <Spacer height={20} />
                <SubmitButton
                  disabled={false}
                  onPress={() =>
                    setPopup({ visible: false, text: '', type: 'loading' })
                  }
                  width={ButtonDimensions.smallButtonWidth}
                  height={ButtonDimensions.smallButtonHeight}
                  label='Close'
                  style={{
                    backgroundColor: Color.ButtonBackground,
                    alignSelf: 'center',
                  }}
                />
              </View>
            </View>
          </Modal>

          <View
            style={[
              appStyles.scrollContainer,
              { paddingBottom: '90%', marginBottom: '10%' },
            ]}
          >
            <Text style={[appStyles.appHeader, { letterSpacing: 1 }]}>
              Settings & Profile
            </Text>
            <Spacer height={20} />

            <View>
              <Text style={appStyles.sectionHeader}>Profile Information</Text>
              <SeparationLine />

              {orderedFields.map((field) => {
                return (
                  <View key={field}>
                    <Text
                      style={[appStyles.inputFieldLabel, { marginLeft: '0%' }]}
                    >
                      {capitalize(field)}
                    </Text>
                    {editMode[field] ? (
                      <InputField
                        testID='input-field'
                        value={tempData[field]}
                        setValue={(value: string) =>
                          setTempData((prev) => ({ ...prev, [field]: value }))
                        }
                        placeholder={`Enter your ${field}`}
                      />
                    ) : (
                      <Text style={[appStyles.idText, { marginBottom: 5 }]}>
                        {userData[field]}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() => toggleEditMode(field)}
                      style={{ alignSelf: 'flex-start', marginBottom: 5 }}
                    >
                      <Text
                        style={{
                          color: Color.ButtonBackground,
                          fontSize: FontSizes.ButtonText,
                        }}
                      >
                        {editMode[field] ? 'Cancel' : 'Modify'}
                      </Text>
                    </TouchableOpacity>
                    <SeparationLine />
                  </View>
                );
              })}
            </View>

            <Spacer height={15} />

            {/* Save Button for the Entire Form */}
            <SubmitButton
              disabled={!isChanged}
              onPress={() => modifyUser()}
              width={ButtonDimensions.smallButtonWidth}
              height={ButtonDimensions.smallButtonHeight}
              label='Save Changes'
              testID='button-save-changes'
              style={[
                { alignSelf: 'center' },
                !isChanged && { opacity: 0.5 },
                { marginTop: 10 },
              ]}
            />

            <Spacer height={40} />

            {/* Password Change Section */}
            <View>
              <Text style={appStyles.sectionHeader}>Change Your Password</Text>
              <InputField
                label='Current Password'
                value={currentPassword}
                setValue={setCurrentPassword}
                placeholder='Enter current password'
                secureTextEntry
                testID='input-current-password'
              />

              {/* New Password Input Fields */}
              <InputField
                label='New Password'
                value={newPassword}
                setValue={setNewPassword}
                placeholder='Enter new password'
                secureTextEntry
                testID='input-new-password'
              />
              <InputField
                label='Confirm Password'
                value={confirmPassword}
                setValue={setConfirmPassword}
                placeholder='Confirm new password'
                secureTextEntry
                testID='input-confirm-password'
              />

              <Spacer height={20} />

              {/* Change Password Button */}
              <SubmitButton
                disabled={!currentPassword || !newPassword || !confirmPassword}
                onPress={() => handleChangePassword(currentPassword)}
                width={ButtonDimensions.smallButtonWidth}
                height={ButtonDimensions.smallButtonHeight}
                label='Change Password'
                testID='button-reset-password'
                style={[{ alignSelf: 'center' }]}
              />
            </View>

            <Spacer height={40} />

            {/* Change Email Section */}
            <Text style={appStyles.sectionHeader}>Change Your Email</Text>
            <InputField
              label='New Email'
              value={newEmail}
              setValue={setNewEmail}
              placeholder='Enter new email'
              testID='input-new-email'
            />

            <InputField
              label='Current Password'
              value={emailPassword}
              setValue={setEmailPassword}
              placeholder='Enter current password'
              secureTextEntry
              testID='input-email-password'
            />

            <View style={{ marginTop: 20 }}>
              <SubmitButton
                disabled={!newEmail || !emailPassword}
                onPress={() => handleChangeEmail()}
                width={ButtonDimensions.smallButtonWidth}
                height={ButtonDimensions.smallButtonHeight}
                label='Confirm'
                testID='button-confirm-change-email'
                style={{
                  backgroundColor: Color.ButtonBackground,
                  marginBottom: 10,
                  alignSelf: 'center',
                }}
              />
            </View>

            <Spacer height={40} />

            {/* Sign Out Button */}
            <SubmitButton
              disabled={false}
              onPress={handleSignOut}
              width={ButtonDimensions.fullWidthButtonWidth}
              height={ButtonDimensions.smallButtonHeight}
              label='Sign Out'
              testID='button-sign-out'
              style={{
                alignSelf: 'center',
                backgroundColor: Color.ButtonBackground,
              }}
            />

            {/* Delete Account Button */}
            <SubmitButton
              disabled={false}
              onPress={() => setShowDeleteConfirmation(true)}
              width={ButtonDimensions.fullWidthButtonWidth}
              height={ButtonDimensions.smallButtonHeight}
              label='Delete Account'
              testID='button-delete-account'
              style={{
                alignSelf: 'center',
                backgroundColor: Color.CancelColor,
                marginTop: 20,
              }}
            />

            {showDeleteConfirmation && (
              <View style={{ marginTop: 20 }}>
                <Text style={appStyles.sectionHeader}>
                  Confirm Account Deletion
                </Text>

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

                <View style={{ marginTop: 20 }}>
                  <SubmitButton
                    disabled={!deleteEmail || !deletePassword}
                    onPress={async () => {
                      await handleDeleteAccount();
                      setShowDeleteConfirmation(false); // Hide the confirmation form
                    }}
                    width={ButtonDimensions.smallButtonWidth}
                    height={ButtonDimensions.smallButtonHeight}
                    label='Delete'
                    testID='button-confirm-delete'
                    style={{
                      backgroundColor: Color.CancelColor,
                      marginBottom: 10,
                      alignSelf: 'center',
                    }}
                  />

                  <SubmitButton
                    disabled={false}
                    onPress={() => setShowDeleteConfirmation(false)} // Hide form on cancel
                    width={ButtonDimensions.smallButtonWidth}
                    height={ButtonDimensions.smallButtonHeight}
                    label='Cancel'
                    testID='button-cancel-delete'
                    style={{
                      backgroundColor: Color.ButtonBackground,
                      alignSelf: 'center',
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Header>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
});
