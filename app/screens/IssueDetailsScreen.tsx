import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList } from '../../types/types';
import { MessageSquare} from 'react-native-feather';
import StatusDropdown from '../components/StatusDropdown';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import AdaptiveButton from '../components/AdaptiveButton';

// portions of this code were generated with chatGPT as an AI assistant

// for the first adaptive button, upon click, go to the messaging screen (replace the onPressFunction)
// container for the close button?

// to do: connect this screen with firebase (or just with the other screen?): 
//title, status (actually no because just change with button), image (this, with firebase), description

// for navigation: this is opened from ListIssuesScreen: button goBack to return to the list of issues 
//(maybe replace the hamburger with a go back button?)

const IssueDetailsScreen: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  
    // Manage the status in the parent component
    const [status, setStatus] = useState('in-progress');

  return (
    <Header>
        <View style={styles.grayBackground}>
          <View style={styles.content}>
            <View style={styles.issueTitle}>
              <Text style={styles.issueTitleText}>Issue #1: Radiator in bedroom stopped working overnight</Text>
              <StatusBadge status={status} />
            </View>

            <AdaptiveButton title = 'Open chat about this subject' 
            onPress = { () => navigation.navigate('Settings')}
            icon = {<MessageSquare stroke="white" width={18} height={18} />}
            iconPosition= {'right'}
            ></AdaptiveButton>
            
            <Text style={styles.sectionTitle}>Images submitted</Text>
            <Image
              source={{ uri: 'https://via.placeholder.com/400x300' }}
              style={styles.image}
            />

            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>
                  For some reason the radiator stopped working at night, it worked perfectly yesterday...
                </Text>
              </View>
            </View>

            <StatusDropdown value={status} setValue={setStatus} ></StatusDropdown>

            <AdaptiveButton title = {'Close'} onPress = {() => navigation.navigate('ListIssues')}>
            </AdaptiveButton>

          </View>
        </View>
    </Header>
  );
};

const styles = StyleSheet.create({
  grayBackground: {
    backgroundColor: '#F3F2F1',
    marginHorizontal: 10,
    marginVertical: 12,
    borderRadius: 32,
    // Add black border
    borderColor: 'light-grey',
    borderWidth: 0.5,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,

    // Shadow for Android
    elevation: 5,
  },
  content: {
    padding: 16,
  },
  issueTitle: {
    marginBottom: 16,
  },
  issueTitleText: {
    marginBottom: 8,
    fontSize: 16,
    letterSpacing: 0.2,
    fontFamily: "Inter-Regular",
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 32,
    marginBottom: 16,
    // Add black border
    borderColor: 'light-grey',
    borderWidth: 0.5,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionBox: {
    backgroundColor: 'white',
    borderRadius: 28,
    // Add black border
    borderColor: 'black',
    borderWidth: 0.5,
    padding: 12,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,

    // Shadow for Android
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4b5563',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // Add black border
    borderColor: 'black',
    borderWidth: 0.5,
    borderRadius: 9999,
    padding: 12,
    backgroundColor: 'white',
    width: '50%',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,

    // Shadow for Android
    elevation: 5,
  },
  closeButtonContainer: {
    alignItems: 'center',
  },
});

export default IssueDetailsScreen;