
                <TouchableOpacity
                  onPress={() => toggleEditMode(typedField)}
                  style={styles.modifyButton}
                >
                  <Text style={styles.modifyButtonText}>
                    {editMode[typedField] ? 'Cancel' : 'Modify'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Save Button for the Entire Form */}
        <SubmitButton
          disabled={false}
          onPress={() => console.log('Save button pressed')}
          width={150}
          height={50}
          label='Save Changes'
          testID='button-save-changes'
          style={styles.submitButton}
        />

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
