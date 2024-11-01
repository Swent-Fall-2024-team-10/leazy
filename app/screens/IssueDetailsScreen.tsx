import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { MaintenanceRequest, ReportStackParamList, RootStackParamList } from '../../types/types';
import { MessageSquare} from 'react-native-feather';
import StatusDropdown from '../components/StatusDropdown';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import AdaptiveButton from '../components/AdaptiveButton';
import { getMaintenanceRequest, updateMaintenanceRequest } from '@/firebase/firestore/firestore';

// portions of this code were generated with chatGPT as an AI assistant

// for the first adaptive button, upon click, go to the messaging screen (replace the onPressFunction)
// container for the close button?

// to do: connect this screen with firebase (or just with the other screen?): 
//title, status (actually no because just change with button), image (this, with firebase), description

// for navigation: this is opened from ListIssuesScreen: button goBack to return to the list of issues 
//(maybe replace the hamburger with a go back button?)

// uri: 'https://via.placeholder.com/400x300'

const IssueDetailsScreen: React.FC = () => {
  const navigation = useNavigation<DrawerNavigationProp<ReportStackParamList>>();
  
  const route = useRoute<RouteProp<ReportStackParamList, 'IssueDetails'>>();
  const { requestID } = route.params;

  const [issue, setIssue] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
    // Manage the status in the parent component
    const [status, setStatus] = useState<MaintenanceRequest["requestStatus"]>('inProgress');
    const [description, setDescription] = useState('');  // State pour la description modifiable
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Handle left arrow click
    const handlePreviousImage = () => {
      if (issue) {
        setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? issue.picture.length - 1 : prevIndex - 1));
      }
    };
  
    // Handle right arrow click
    const handleNextImage = () => {
      if (issue) {
        setCurrentImageIndex((prevIndex) => (prevIndex === issue.picture.length - 1 ? 0 : prevIndex + 1));
      }
    };

     // Récupérer l'issue depuis Firebase
  useEffect(() => {
    const fetchIssue = async () => {
      const fetchedIssue = await getMaintenanceRequest(requestID);
      if (fetchedIssue) {
        setIssue(fetchedIssue);
        setStatus(fetchedIssue.requestStatus);  // Mettre à jour le statut dans l'état
        setDescription(fetchedIssue.requestDescription);  // Mettre à jour la description dans l'état
      }
      setLoading(false);
    };

    fetchIssue();
  }, [requestID]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!issue) {
    return <Text>Issue not found.</Text>;
  }

  // Fonction pour mettre à jour le statut et la description dans Firebase lors de la fermeture
  const handleClose = async () => {
    if (issue) {
      await updateMaintenanceRequest(requestID, {
        requestStatus: status,
        requestDescription: description,  // On envoie la nouvelle description à Firebase
      });
      // Rediriger après la mise à jour
      // Navigation vers la liste des issues après la mise à jour
      navigation.navigate('Issues');
    }
  };

  return (
    <Header showMenu={true}>
        <View style={styles.grayBackground}>
          <View style={styles.content}>
            <View style={styles.issueTitle}>
              <Text style={styles.issueTitleText}>{issue.requestTitle}</Text>
              <StatusBadge status={status} />
            </View>

            <AdaptiveButton title = 'Open chat about this subject' 
            onPress = { () => navigation.navigate('Messaging')}
            icon = {<MessageSquare stroke="white" width={18} height={18} />}
            iconPosition= {'right'}
            ></AdaptiveButton>
            
            <Text style={styles.sectionTitle}>Images submitted</Text>
            <View style={styles.imageCarouselContainer}>
            <TouchableOpacity onPress={handlePreviousImage} style={styles.arrowButton}>
              <Text style={styles.arrowText}>{'<'}</Text>
            </TouchableOpacity>

            <Image
              source={{ uri: issue.picture[currentImageIndex] }}
              style={styles.image}
            />

            <TouchableOpacity onPress={handleNextImage} style={styles.arrowButton}>
              <Text style={styles.arrowText}>{'>'}</Text>
            </TouchableOpacity>
          </View>

            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Description</Text>
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>
                  {description}
                </Text>
              </View>
            </View>

            <StatusDropdown value={status} setValue={setStatus} ></StatusDropdown>

            <AdaptiveButton title = {'Close'} onPress = {handleClose}>
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
  imageCarouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  arrowButton: {
    padding: 10,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default IssueDetailsScreen;