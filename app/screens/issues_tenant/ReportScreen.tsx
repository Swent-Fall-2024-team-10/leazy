import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, Alert, Image, Modal} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import InputField from '@/app/components/forms/text_input';
import Spacer from '@/app/components/Spacer';
import SubmitButton from '@/app/components/buttons/SubmitButton';
import { appStyles, Color } from '@/styles/styles';
import Close from '@/app/components/buttons/Close';
import { NavigationProp, useNavigation } from '@react-navigation/native'; // Import NavigationProp
import { ReportStackParamList } from '@/types/types';  // Import or define your navigation types
import CameraButton from '@/app/components/buttons/CameraButton';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import CloseConfirmation from '@/app/components/buttons/CloseConfirmation';
import { collection, addDoc } from 'firebase/firestore'; // Import Firestore functions
import { MaintenanceRequest } from '@/types/types';
import { db, auth} from '@/firebase/firebase';
import { getTenant, updateMaintenanceRequest, updateTenant } from '@/firebase/firestore/firestore';
import Header from '@/app/components/Header';
import { usePictureContext } from '@/app/context/PictureContext';

// portions of this code were generated with chatGPT as an AI assistant

export default function ReportScreen() {
  const navigation = useNavigation<NavigationProp<ReportStackParamList>>();

  const [room, setRoom] = useState('');
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [tick, setTick] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state in case we want to show a spinner
  const currentDay = new Date();
  const day = currentDay.getDate().toString().padStart(2, '0');
  const month = (currentDay.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDay.getFullYear();
  const hours = currentDay.getHours().toString().padStart(2, '0');
  const minutes = currentDay.getMinutes().toString().padStart(2, '0');
  const {pictureList, resetPictureList} = usePictureContext();
  const {removePicture} = usePictureContext();

  
  function resetStates() {
    setRoom('');
    setIssue('');
    setDescription('');
    resetPictureList();
  }
  const handleClose = () => {
    setIsVisible(true);
  };

  useEffect(() => {
    // Reset picture list when navigating away from the screen
    return () => {
      resetPictureList();
    };
  }, []);
  
  const handleAddPicture = () => {
    navigation.navigate('CameraScreen');
  };

  const handleSubmit = async () => {
    setLoading(true); // Set loading to true when starting the submission

    const tenantId = await getTenant(auth.currentUser?.uid || '');
    console.log('url list for the pictures : ' , pictureList)
      try {
        if (!tenantId) {
          throw new Error('Tenant not found');
        }
        const newRequest: MaintenanceRequest = {
          requestID: '', 
          tenantId: tenantId.userId, 
          residenceId: "apartment.residenceId", 
          apartmentId: tenantId.apartmentId, 
          openedBy: tenantId.userId, 
          requestTitle: issue,
          requestDate: `${day}/${month}/${year} at ${hours}:${minutes}`,
          requestDescription: description,
          picture: pictureList, 
          requestStatus: "notStarted",
        };
    
        //this should be changed when the database function are updated
        //this is not respecting the model view model pattern for now but this is a temporary solution
        const requestID = await addDoc(collection(db, 'maintenanceRequests'), newRequest);
        await updateTenant(tenantId.userId, { maintenanceRequests: [...tenantId.maintenanceRequests, requestID.id] });
        await updateMaintenanceRequest(requestID.id, { requestID: requestID.id });
        
        Alert.alert('Success', 'Your maintenance request has been submitted.');
        resetStates();
        const nextScreen = tick ? 'Messaging' : 'Issues';
        setTick(false);
        navigation.navigate(nextScreen);

      } catch (error) {
        Alert.alert('Error', 'There was an error submitting your request. Please try again.');
        console.log('Error submitting request:', error);
      } finally {
        setLoading(false); // Set loading to false after submission is complete
      }
  };


  return (
    <Header>
      <ScrollView style={styles.container} 
      automaticallyAdjustKeyboardInsets={true}
      >
        <View style={[appStyles.scrollContainer, {paddingBottom : '100%'}]}>

          <Close onPress={handleClose} />
          <Text style={appStyles.screenHeader}>Create a new issue</Text>
          <Text style={appStyles.date}>
            Current day: {day}/{month}/{year} at {hours}:{minutes}
          </Text>

          <Spacer height={20} />

          {isVisible && (
            <Modal
                transparent={true}
                animationType="fade"
                visible={isVisible}
                onRequestClose={() => setIsVisible(false)}
            >
                <CloseConfirmation
                    isVisible={isVisible}
                    onPressYes={() => {
                        resetStates();
                        setTick(false);
                        navigation.navigate('Issues');
                        setIsVisible(false);
                    }}
                    onPressNo={() => setIsVisible(false)}
                />
            </Modal>
          )}

          <InputField
            label="What kind of issue are you experiencing?"
            value={issue}
            setValue={setIssue}
            placeholder="Your issue..."
            radius={25}
            height={40}
            width={300}
            backgroundColor={Color.TextInputBackground}
            testID="testIssueNameField"
          />

          <Spacer height={20} />

          <Text style={appStyles.inputFieldLabel}>Please take a picture of the damage or situation if applicable</Text>
          
          <CameraButton onPress={handleAddPicture} />
          
          <View style={appStyles.carouselImageContainer}>
            <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    {pictureList.map((image, index) => (
                        <Image key={index} source={{ uri: image }} style={appStyles.smallThumbnailImage} />
                    ))}
            </ScrollView>
          </View>

          
          <InputField
            label="Which room is the issue in?"
            value={room}
            setValue={setRoom}
            placeholder="e.g: Bedroom, Kitchen, Bathroom..."
            radius={25}
            height={40}
            width={300}
            backgroundColor={Color.TextInputBackground}
            testID="testRoomNameField"
          />

          <Spacer height={20} />

          <InputField
            label="Please provide a description of your issue:"
            value={description}
            setValue={setDescription}
            placeholder="e.g: The bathtub is leaking because of..."
            height={100}
            width={300}
            backgroundColor={Color.TextInputBackground}
            radius={20}
            testID="testDescriptionField"
          />

          <Spacer height={20} />

          <View style={{ flexDirection: 'row' }}>
            <BouncyCheckbox
              iconImageStyle={styles.tickingBox}
              iconStyle={styles.tickingBox}
              innerIconStyle={styles.tickingBox}
              unFillColor={Color.ReportScreenBackground}
              fillColor={Color.ButtonBackground}
              onPress={(isChecked: boolean) => setTick(isChecked)}
            />
            <Text style={styles.tickingBoxText}>
              I would like to start a chat with the manager about this issue
            </Text>
          </View>

          <Spacer height={20} />

          <SubmitButton
            disabled={room === '' || description === '' || issue === ''}
            onPress={handleSubmit}
            width={170}
            height={44}
            label="Submit"
            testID="testSubmitButton"
            style={appStyles.submitButton}
            textStyle={appStyles.submitButtonText}
          />
        </View>
      </ScrollView>
    </Header>
  );
}

const styles = StyleSheet.create({
  tickingBoxText : {
    color: Color.TextInputLabel,
    fontSize: 16,
    width: 300,
    fontWeight: '500',
  },

  tickingBox : {
    borderRadius: 5,
  },

  container: {
    flex: 1,
    padding: '6%',
  },
});
