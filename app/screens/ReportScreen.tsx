import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {CheckBox} from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import InputField from '../../components/forms/text_input';
import Spacer from '@/components/Spacer';
import SubmitButton from '@/components/buttons/SubmitButton';
import { Color } from '@/types/types';
import Close from '@/components/buttons/Close';
import { useNavigation, NavigationProp } from '@react-navigation/native'; // Import NavigationProp
import { RootStackParamList } from '../../types/types';  // Import or define your navigation types

// portions of this code were generated with chatGPT as an AI assistant

interface ReportScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

export default function ReportScreen( {navigation} : ReportScreenProps){
  const [room, setRoom] = useState('');
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [tick, setTick] = useState(false);

  const currentDay = new Date();

  const day = currentDay.getDate().toString().padStart(2, '0');
  const month = (currentDay.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDay.getFullYear();

  const hours = currentDay.getHours().toString().padStart(2, '0');
  const minutes = currentDay.getMinutes().toString().padStart(2, '0');

  // Placeholder function for adding pictures
  const handleAddPicture = () => {
    // Placeholder function to add pictures
  };

  return (
    <ScrollView style={styles.container}
    automaticallyAdjustKeyboardInsets={true}
    >
      <Close onPress={() => navigation.navigate('Home')}/>
      <Text style={styles.header}>Create a new issue</Text>
      <Text style={styles.date}>Current day : {day}/{month}/{year} at {hours}:{minutes} </Text>

      <Spacer height={20}/>

      <InputField 
        label="What kind of issue are you experiencing ?" 
        value={issue} 
        setValue={setIssue}
        placeholder="Your issue..."
      />
      
      <Spacer height={20} />

      <Text>Please take a picture of the damage or situation if applicable</Text>
      <TouchableOpacity style={styles.cameraButton} onPress={handleAddPicture}>
      </TouchableOpacity>

      <InputField 
        label="Which room is the issue in ?" 
        value={room} 
        setValue={setRoom}
        placeholder="e.g : Bedroom, Kitchen, Bathroom..."
      />

      <Spacer height={20} />

      <InputField 
        label="Please provide some description of the issue :" 
        value={description} 
        setValue={setDescription}
        placeholder="e.g : The bathtub is leaking because of..."
        height={100}
        radius={20}
        />

      <Spacer height={20} />

      <CheckBox
        title='I would like to start a chat with the manager about this issue'
        checked={tick}
        onPress={() => setTick(!tick)}
        />

      <Spacer height={20} />

      <SubmitButton 
      disabled={room == '' || description == '' || issue == ''}
      // For now navigate to the home screen, 
      // this should be replaced to use the firebase API to send the report
      // in the database and then navigate to the home screen
      onPress={() => navigation.navigate('Home')}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.ReportScreenBackground,
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
  }

});
