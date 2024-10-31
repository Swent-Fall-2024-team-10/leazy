import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, ScrollView, Dimensions, Modal } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { MaintenanceRequest, ReportStackParamList, RootStackParamList } from '../../types/types';
import { MessageSquare} from 'react-native-feather';
import StatusDropdown from '../components/StatusDropdown';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import AdaptiveButton from '../components/AdaptiveButton';
import { getMaintenanceRequest, updateMaintenanceRequest } from '@/firebase/firestore/firestore';
import Spacer from '../components/Spacer';

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
    const [fullScreenMode, setFullScreenMode] = useState(false); // Track full-screen mode
    const [fullImageDimensions, setFullImageDimensions] = useState({ width: 0, height: 0 });


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

    // Open full-screen mode with the clicked image index
  const openFullScreen = (index: number) => {
    if (issue) {
    setCurrentImageIndex(index);
    setFullScreenMode(true);

    Image.getSize(issue.picture[index], (width, height) => {
      const screenWidth = Dimensions.get('window').width * 0.9;
      const screenHeight = Dimensions.get('window').height * 0.9;

      const aspectRatio = width / height;

      let finalWidth, finalHeight;
      if (width > height) {
        // Landscape image
        finalWidth = screenWidth;
        finalHeight = screenWidth / aspectRatio;
      } else {
        // Portrait image
        finalHeight = screenHeight;
        finalWidth = screenHeight * aspectRatio;
      }

      setFullImageDimensions({ width: finalWidth, height: finalHeight });
    });
  }
  };

  // Close full-screen mode
  const closeFullScreen = () => {
    setFullScreenMode(false);
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
    <Header>
        <View style={styles.grayBackground}>
          <ScrollView style={styles.content} automaticallyAdjustKeyboardInsets = {true} showsVerticalScrollIndicator = {false}>
            <View style={styles.issueTitle}>
              <Text style={styles.issueTitleText}>Issue: {issue.requestTitle}</Text>
              <StatusBadge status={status} />
            </View>

            <AdaptiveButton title = 'Open chat about this subject' 
            onPress = { () => navigation.navigate('Messaging')}
            icon = {<MessageSquare stroke="white" width={18} height={18} />}
            iconPosition= {'right'}
            ></AdaptiveButton>
            
            <Text style={styles.sectionTitleImage}>Images submitted</Text>
            <View style={styles.imageCarouselContainer}>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContainer}
              >
                {issue.picture.map((image, index) => (
                  <TouchableOpacity key={index} onPress={() => openFullScreen(index)}>
                    <Image key={index} source={{ uri: image }} style={styles.squareImage} />
                  </TouchableOpacity>

                ))}
              </ScrollView>
            </View>

            <View style={styles.imagesTextView}>
            <Text style={styles.imagesText}>Click on an image to expand it</Text>
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

            {/* Full-Screen Modal */}
          <Modal visible={fullScreenMode} transparent={true} onRequestClose={closeFullScreen}>
            <View style={styles.modalBackground}>
              <TouchableOpacity onPress={closeFullScreen} style={styles.closeModalButton}>
                <Text style={styles.closeModalText}>X</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handlePreviousImage} style={[styles.arrowButton, styles.leftArrow]}>
                <Text style={styles.arrowText}>{'<'}</Text>
              </TouchableOpacity>

              <Image
                source={{ uri: issue.picture[currentImageIndex] }}
                style={[styles.fullImage, fullImageDimensions]}
                resizeMode="contain"
              />

              <TouchableOpacity onPress={handleNextImage} style={[styles.arrowButton, styles.rightArrow]}>
                <Text style={styles.arrowText}>{'>'}</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <Spacer height={20} />
          </ScrollView>
        </View>
    </Header>
  );
};

const styles = StyleSheet.create({
  imagesTextView:{
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 32,
  },
  imagesText:{
    fontFamily: "Inter-Regular",
    fontSize: 10,
  },
  closeModalButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
  },
  closeModalText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    borderRadius: 16,
    borderColor: 'lightgrey',
    borderWidth: 0.5,
  },
  imageCarouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  scrollViewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  squareImage: {
    width: 150, // Square dimension
    height: 150, // Square dimension
    marginHorizontal: 5,
    borderRadius: 8,
    borderColor: 'lightgrey',
    borderWidth: 0.5,
  },
  leftArrow: {
    left: 5,
  },
  rightArrow: {
    right: 5,
  },
  grayBackground: {
    height: Dimensions.get('window').height * 0.8,
    backgroundColor: '#F3F2F1',
    marginHorizontal: 10,
    marginVertical: 12,
    borderRadius: 32,
    overflow: 'hidden',
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
    marginBottom: 20,
    paddingLeft: 8,
    fontSize: 16,
    letterSpacing: 0.2,
    fontFamily: "Inter-Bold",
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
    marginTop: -8,
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
  sectionTitleImage: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
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
  arrowButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
    padding: 8,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default IssueDetailsScreen;