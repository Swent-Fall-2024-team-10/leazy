import React, { useState } from 'react';
import { Text, StyleSheet, View, Alert} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import InputField from '../components/forms/text_input';
import Spacer from '@/app/components/Spacer';
import SubmitButton from '@/app/components/buttons/SubmitButton';
import { Color } from '@/styles/styles';
import Close from '@/app/components/buttons/Close';
import { NavigationProp, useNavigation } from '@react-navigation/native'; // Import NavigationProp
import { ReportStackParamList } from '../../types/types';  // Import or define your navigation types
import CameraButton from '@/app/components/buttons/CameraButton';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import CloseConfirmation from '@/app/components/buttons/CloseConfirmation';
import { collection, addDoc } from 'firebase/firestore'; // Import Firestore functions
import { MaintenanceRequest } from '@/types/types';
import { db, auth} from '@/firebase/firebase';
import { getTenant, updateMaintenanceRequest, updateTenant } from '@/firebase/firestore/firestore';
import Header from '../components/Header';

// portions of this code were generated with chatGPT as an AI assistant



export default function ReportScreen() {
  const navigation = useNavigation<NavigationProp<ReportStackParamList>>();

  const [room, setRoom] = useState('');
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [tick, setTick] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const [pictureList, setPictureList] = useState<string[]>([]);
  const currentDay = new Date();
  const day = currentDay.getDate().toString().padStart(2, '0');
  const month = (currentDay.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDay.getFullYear();
  const hours = currentDay.getHours().toString().padStart(2, '0');
  const minutes = currentDay.getMinutes().toString().padStart(2, '0');

  const handleClose = () => {
    setIsVisible(true);
  };

  // Placeholder function for adding pictures
  const handleAddPicture = () => {
    navigation.navigate('CameraScreen', { setPictureList, pictureList });
    // Add logic to upload and link pictures if needed
  };

  const handleSubmit = async () => {
    setLoading(true); // Set loading to true when starting the submission

    const tenantId = await getTenant(auth.currentUser?.uid || '');
    console.log('URL OF THE PICTURE : ' , pictureList)
    console.log(tenantId);
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
    
        const requestID = await addDoc(collection(db, 'maintenanceRequests'), newRequest);
        await updateTenant(tenantId.userId, { maintenanceRequests: [...tenantId.maintenanceRequests, requestID.id] });
        await updateMaintenanceRequest(requestID.id, { requestID: requestID.id });
        
        Alert.alert('Success', 'Your maintenance request has been submitted.');
        //reset the form 
        setRoom('');
        setIssue('');
        setDescription('');
        
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
      <ScrollView style={styles.container} automaticallyAdjustKeyboardInsets={true}>
        <Close onPress={handleClose} />
        <Text style={styles.header}>Create a new issue</Text>
        <Text style={styles.date}>
          Current day: {day}/{month}/{year} at {hours}:{minutes}
        </Text>

        <Spacer height={20} />

        {isVisible && (
          <CloseConfirmation
            isVisible={isVisible}
            onPressYes={() => {
              setRoom('');
              setIssue('');
              setDescription('');
              setTick(false);
              navigation.navigate('Issues');
              setIsVisible(false);
            }}
            onPressNo={() => {
              setIsVisible(false)
            }}
          />
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
        />

        <Spacer height={20} />

        <Text style={styles.label}>Please take a picture of the damage or situation if applicable</Text>
        <CameraButton onPress={handleAddPicture} />
        

        <InputField
          label="Which room is the issue in?"
          value={room}
          setValue={setRoom}
          placeholder="e.g: Bedroom, Kitchen, Bathroom..."
          radius={25}
          height={40}
          width={300}
          backgroundColor={Color.TextInputBackground}
        />

        <Spacer height={20} />

        <InputField
          label="Please provide some description of the issue:"
          value={description}
          setValue={setDescription}
          placeholder="e.g: The bathtub is leaking because of..."
          height={100}
          width={300}
          backgroundColor={Color.TextInputBackground}
          radius={20}
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
        />
        <Spacer height={250} />
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
    padding: 20,
  },

  subHeader: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
  },

  pictureContainer: {
    marginBottom: 20,
  },

  thumbnails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  thumbnailBox: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  cameraButton: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.CameraButtonBackground,
    borderWidth: 1,
    borderColor: Color.CameraButtonBorder,
    borderRadius: 5,
    marginBottom: 20,
  },

  date: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
    color: Color.DateText,
  },

  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: Color.ScreenHeader,
  },

  label : {
    fontSize: 16,
    marginBottom: 2.5,
    fontWeight: "500",
    color: Color.TextInputLabel,
  }

});
