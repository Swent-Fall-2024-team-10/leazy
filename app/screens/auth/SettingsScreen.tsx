import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { TUser } from '../../../types/types';
import {
  updateUserEmail,
  resetUserPassword,
  emailAndPasswordLogIn,
  deleteAccount,
} from '../../../firebase/auth/auth';
import { Dimensions } from 'react-native';

import { getUser, updateUser } from '../../../firebase/firestore/firestore';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../../firebase/firebase';
import Header from '../../components/Header';
import SubmitButton from '../../components/buttons/SubmitButton';
import InputField from '../../components/forms/text_input';
import CustomPopUp from '../../components/CustomPopUp';
import { appStyles, Color, FontSizes } from '../../../styles/styles';
import Spacer from '../../components/Spacer';
import SeparationLine from '../../components/SeparationLine';

export default function SettingsScreen() {
  const screenWidth = Dimensions.get('window').width;

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

  const orderedFields: EditModeField[] = [
    'name',
    'email',
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
    email: '',
    phone: '',
    street: '',
    number: '',
    city: '',
    canton: '',
    zip: '',
    country: '',
  });

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
          email: userObj.email,
          phone: userObj.phone,
          street: userObj.street,
          number: userObj.number,
          city: userObj.city,
          canton: userObj.canton,
          zip: userObj.zip,
          country: userObj.country,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user]);

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
      if (userData.email !== tempData.email) {
        await updateUserEmail(tempData.email);
      }

      const newUser: TUser = {
        uid: user?.uid || '',
        type: 'tenant',
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
      console.error('Error updating user:', error);
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

  const handleResetPassword = async (currentPassword: string) => {
    if (!currentPassword) {
      setPopup({
        visible: true,
        text: 'Current password is required.',
        type: 'error',
      });
      return;
    }

    if (!newPassword || !confirmPassword) {
      setPopup({
        visible: true,
        text: 'New password and confirmation password cannot be empty.',
        type: 'error',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPopup({
        visible: true,
        text: 'New password and confirmation password do not match.',
        type: 'error',
      });
      return;
    }

    try {
      setPopup({
        visible: true,
        text: 'Resetting password...',
        type: 'loading',
      });

      // Pass current and new passwords to the resetUserPassword function
      await resetUserPassword(currentPassword, newPassword);

      setPopup({
        visible: true,
        text: 'Password reset successfully!',
        type: 'success',
      });

      // Clear inputs
      setCurrentPassword('');
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

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Header>
      <ScrollView
        style={appStyles.screenContainer}
        automaticallyAdjustKeyboardInsets={true}
        showsVerticalScrollIndicator={true}
      >
        {popup.visible && (
          <CustomPopUp
            title={popup.type}
            text={popup.text}
            onPress={() =>
              setPopup({ visible: false, text: '', type: 'loading' })
            }
            testID='popup'
          />
        )}

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
            width={150}
            height={50}
            label='Save Changes'
            testID='button-save-changes'
            style={[
              { alignSelf: 'center' },
              !isChanged && { opacity: 0.5 },
              { marginTop: 10 },
            ]}
          />

          <Spacer height={40} />

          {/* Password Reset Section */}

          <View>
            <Text style={appStyles.sectionHeader}>Change Password</Text>
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

            {/* Reset Password Button */}
            <SubmitButton
              disabled={!currentPassword || !newPassword || !confirmPassword}
              onPress={() => handleResetPassword(currentPassword)}
              width={150}
              height={50}
              label='Reset Password'
              testID='button-reset-password'
              style={[{ alignSelf: 'center' }]}
            />
          </View>

          <Spacer height={40} />

          {/* Sign Out Button */}
          <SubmitButton
            disabled={false}
            onPress={handleSignOut}
            width={0.85 * screenWidth}
            height={50}
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
            width={0.85 * screenWidth}
            height={50}
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
                  width={150}
                  height={50}
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
                  width={150}
                  height={50}
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
    </Header>
  );
}
