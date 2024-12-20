import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { MaintenanceRequest, ReportStackParamList } from "../../../types/types";
import { MessageSquare } from "react-native-feather";
import StatusDropdown from "../../components/StatusDropdown";
import Header from "../../components/Header";
import StatusBadge from "../../components/StatusBadge";
import AdaptiveButton from "../../components/AdaptiveButton";
import {
  getMaintenanceRequest,
  updateMaintenanceRequest,
} from "../../../firebase/firestore/firestore";
import Spacer from "../../components/Spacer";
import {
  Color,
  FontSizes,
  ButtonDimensions,
  IconDimension,
  appStyles,
} from "../../../styles/styles";
import { Icon } from "react-native-elements";
import SubmitButton from "../../components/buttons/SubmitButton";


// portions of this code were generated with chatGPT as an AI assistant

// for the first adaptive button, upon click, go to the messaging screen (replace the onPressFunction)
// container for the close button?

// to do: connect this screen with firebase (or just with the other screen?):
//title, status (actually no because just change with button), image (this, with firebase), description

// for navigation: this is opened from ListIssuesScreen: button goBack to return to the list of issues
//(maybe replace the hamburger with a go back button?)

// uri: 'https://via.placeholder.com/400x300'

const IssueDetailsScreen: React.FC = () => {
  const navigation =
    useNavigation<DrawerNavigationProp<ReportStackParamList>>();

  const route = useRoute<RouteProp<ReportStackParamList, "IssueDetails">>();
  const { requestID } = route.params;

  const [issue, setIssue] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  // Manage the status in the parent component
  const [status, setStatus] =
    useState<MaintenanceRequest["requestStatus"]>("notStarted");
  const [description, setDescription] = useState(""); // State pour la description modifiable
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullScreenMode, setFullScreenMode] = useState(false); // Track full-screen mode
  const [fullImageDimensions, setFullImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Handle left arrow click
  const handlePreviousImage = () => {
    if (issue) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? issue.picture.length - 1 : prevIndex - 1
      );
    }
  };

  // Handle right arrow click
  const handleNextImage = () => {
    if (issue) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === issue.picture.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const openFullScreen = (index: number) => {
    if (issue) {
      setCurrentImageIndex(index);

      Image.getSize(issue.picture[index], (width, height) => {
        const screenWidth = Dimensions.get("window").width * 0.9;
        const screenHeight = Dimensions.get("window").height * 0.9;

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
        setFullScreenMode(true); // Show the modal
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
        setStatus(fetchedIssue.requestStatus); // Mettre à jour le statut dans l'état
        setDescription(fetchedIssue.requestDescription); // Mettre à jour la description dans l'état
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
        requestDescription: description, // On envoie la nouvelle description à Firebase
      });
      // Rediriger après la mise à jour
      // Navigation vers la liste des issues après la mise à jour
      navigation.goBack();
    }
  };

  return (
    <Header>
      <View style={styles.grayBackground}>
        <ScrollView
          style={appStyles.screenContainer}
          automaticallyAdjustKeyboardInsets={true}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text
              style={[
                appStyles.screenHeader,
                {
                  textAlign: "left",
                  letterSpacing: 1.5,
                  fontSize: 20,
                  marginBottom: "10%",
                },
              ]}
            >
              Issue : {issue.requestTitle}
            </Text>
            <StatusBadge status={status} />
          </View>
            <AdaptiveButton title = 'Open chat about this subject' 
              onPress = { () => {
                navigation.navigate('Messaging', {chatID: requestID})
              }
            }
              icon = {<MessageSquare stroke="white" width={IconDimension.smallIcon} height={IconDimension.smallIcon} />}
              iconPosition= {'right'}
              style = {appStyles.submitButton}
            ></AdaptiveButton>
            
            <Text style={appStyles.inputFieldLabel}>Images submitted</Text>
            <View style={appStyles.carouselImageContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={appStyles.carouselScrollViewContainer}
                testID='scrollview'
              >
                {issue.picture.map((image, index) => (
                  <TouchableOpacity key={index} onPress={() => {openFullScreen(index)}} testID={`imageItem-${index}`}>
                    <Image key={index} source={{ uri: image }} style={appStyles.mediumThumbnailImage} />
                  </TouchableOpacity>

                ))}
              </ScrollView>
            </View>
          <View style={styles.imagesTextView}>
            <Text style={appStyles.smallCaptionText}>
              Click on an image to expand it
            </Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={appStyles.inputFieldLabel}>Description</Text>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>
          </View>

          <StatusDropdown value={status} setValue={setStatus}></StatusDropdown>
          <SubmitButton
            disabled={false}
            label={"Close"}
            onPress={handleClose}
            width={ButtonDimensions.veryLargeButtonWidth}
            height={ButtonDimensions.veryLargeButtonHeight}
            testID={"saveChangesButton"}
            style={appStyles.submitButton}
            textStyle={appStyles.submitButtonText}
          ></SubmitButton>
          {/* Full-Screen Modal */}
          <Modal
            visible={fullScreenMode}
            transparent={true}
            onRequestClose={closeFullScreen}
            testID="fullModal"
          >
            <View style={styles.modalBackground}>
              <TouchableOpacity
                onPress={closeFullScreen}
                style={styles.closeModalButton}
                testID="closeModalButton"
              >
                <Icon
                  name="close"
                  type="font-awesome"
                  color="white"
                  size={IconDimension.smallIcon}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePreviousImage}
                style={[appStyles.expandedImageNextButton, styles.leftArrow]}
                testID="leftButton"
              >
                <Icon
                  name="chevron-left"
                  type="font-awesome"
                  color="white"
                  size={IconDimension.smallIcon}
                />
              </TouchableOpacity>

              <Image
                source={{ uri: issue.picture[currentImageIndex] }}
                style={[styles.fullImage, fullImageDimensions]}
                resizeMode="contain"
                testID="imageFull"
              />

              <TouchableOpacity
                onPress={handleNextImage}
                style={[appStyles.expandedImageNextButton, styles.rightArrow]}
                testID="rightButton"
              >
                <Icon
                  name="chevron-right"
                  type="font-awesome"
                  color={"white"}
                  size={IconDimension.smallIcon}
                />
              </TouchableOpacity>
            </View>
          </Modal>

          <Spacer height={50} />
        </ScrollView>
      </View>
    </Header>
  );
};

const styles = StyleSheet.create({
  imagesTextView: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "10%",
  },

  closeModalButton: {
    position: "absolute",
    top: "5.5%",
    right: "7%",
    zIndex: 2,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  fullImage: {
    borderRadius: 16,
    borderColor: "lightgrey",
    borderWidth: 0.5,
  },

  leftArrow: {
    left: "5%",
  },

  rightArrow: {
    right: "5%",
  },

  grayBackground: {
    height: Dimensions.get("window").height * 0.8,
    backgroundColor: Color.IssueBackground,
    marginHorizontal: "3%",
    marginVertical: "3%",
    borderRadius: 32,
    overflow: "hidden",
    // Add black border
    borderColor: Color.IssueBorder,
    borderWidth: 1,
    // Shadow for iOS
    shadowColor: Color.ShadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,

    // Shadow for Android
    elevation: 5,
  },

  descriptionContainer: {
    marginBottom: 16,
    marginTop: -8,
  },

  descriptionBox: {
    backgroundColor: Color.TextInputBackground,
    borderRadius: 28,
    // Add black border
    borderColor: "black",
    borderWidth: 0.5,
    padding: 12,
    // Shadow for iOS
    shadowColor: Color.ShadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,

    // Shadow for Android
    elevation: 5,
  },

  descriptionText: {
    fontSize: FontSizes.TextInputText,
    color: Color.TextInputText,
  },
});

export default IssueDetailsScreen;
