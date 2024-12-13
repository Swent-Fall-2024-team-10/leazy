import React, { useState, useEffect } from "react";
import { Text, View, Alert, Image, Modal } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import InputField from "../../components/forms/text_input";
import Spacer from "../../components/Spacer";
import SubmitButton from "../../components/buttons/SubmitButton";
import {
  appStyles,
  ButtonDimensions,
  Color,
  textInputHeight,
} from "../../../styles/styles";
import Close from "../..//components/buttons/Close";
import { NavigationProp, useNavigation } from "@react-navigation/native"; // Import NavigationProp
import { ReportStackParamList } from "../../../types/types"; // Import or define your navigation types
import CameraButton from "../../components/buttons/CameraButton";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import CloseConfirmation from "../../components/buttons/CloseConfirmation";
import { collection, addDoc } from "firebase/firestore"; // Import Firestore functions
import { MaintenanceRequest } from "../../../types/types";
import { db } from "../../../firebase/firebase";
import Header from "../../components/Header";
import { usePictureContext } from "../../context/PictureContext";
import { storage } from "../../../firebase/firebase"; // Import storage from your Firebase config
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase imports
import { useAuth } from "../../context/AuthContext";
import { getFileBlob, clearFiles } from "../../utils/cache";
import {
  createMaintenanceRequest,
  getTenant,
  updateMaintenanceRequest,
  updateTenant,
} from "../../../firebase/firestore/firestore";

// portions of this code were generated with chatGPT as an AI assistant

export default function ReportScreen() {
  const navigation = useNavigation<NavigationProp<ReportStackParamList>>();
  const { user } = useAuth();

  const [room, setRoom] = useState("");
  const [issue, setIssue] = useState("");
  const [description, setDescription] = useState("");
  const [tick, setTick] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state in case we want to show a spinner
  const currentDay = new Date();
  const day = currentDay.getDate().toString().padStart(2, "0");
  const month = (currentDay.getMonth() + 1).toString().padStart(2, "0");
  const year = currentDay.getFullYear();
  const hours = currentDay.getHours().toString().padStart(2, "0");
  const minutes = currentDay.getMinutes().toString().padStart(2, "0");
  const { pictureList, resetPictureList } = usePictureContext();
  const { removePicture } = usePictureContext();

  async function resetStates() {
    setRoom("");
    setIssue("");
    setDescription("");
    clearFiles(pictureList);
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
    navigation.navigate("CameraScreen");
  };

  const handleSubmit = async () => {
    setLoading(true);
  
    try {
      console.log("in handle");
      if (!user) {
        throw new Error("User not found");
      }
  
      const tenant = await getTenant(user.uid);
      if (!tenant) {
        Alert.alert("Error", "Tenant not found");
        setLoading(false);
        return;
      }
  
      // Upload pictures to Firebase Storage
      let pictureURLs: string[] = [];
  
      try {
        // Only try to upload pictures if online
        for (const picture of pictureList) {
          const blob = await getFileBlob(picture);
          const filename = picture.substring(picture.lastIndexOf("/") + 1);
          const storageRef = ref(storage, `uploads/${filename}`);
          await uploadBytes(storageRef, blob);
          const downloadURL = await getDownloadURL(storageRef);
          pictureURLs.push(downloadURL);
        }
      } catch (error) {
        // If picture upload fails (likely offline), store local URIs temporarily
        pictureURLs = pictureList;
      }
  
      const newRequest: MaintenanceRequest = {
        requestID: "",
        tenantId: tenant.userId,
        residenceId: tenant.residenceId,
        apartmentId: tenant.apartmentId,
        openedBy: tenant.userId,
        requestTitle: issue,
        requestDate: `${day}/${month}/${year} at ${hours}:${minutes}`,
        requestDescription: description,
        picture: pictureURLs,
        requestStatus: "notStarted",
      };
      console.log("before");
      // Use the createMaintenanceRequest method that handles offline
      await createMaintenanceRequest(newRequest);
      console.log("after");
      
      // Don't update tenant's maintenanceRequests array here - it will be handled when syncing
  
      Alert.alert(
        "Success",
        "Your maintenance request has been submitted.",
        [
          {
            text: "OK",
            onPress: () => {
              resetStates();
              const nextScreen = tick ? "Messaging" : "Issues";
              setTick(false);
              navigation.navigate(nextScreen);
            }
          }
        ]
      );
  
    } catch (error) {
      console.log("huh");
      Alert.alert(
        "Error",
        "There was an error submitting your request. It will be synced when you're back online.",
        [
          {
            text: "OK",
            onPress: () => {
              resetStates();
              navigation.navigate("Issues");
            }
          }
        ]
      );
      console.log("Error submitting request:", error);
    } finally {
      setLoading(false);
      await clearFiles(pictureList);
    }
  };

  return (
    <Header>
      <ScrollView
        style={appStyles.screenContainer}
        automaticallyAdjustKeyboardInsets={true}
      >
        <View
          style={[
            appStyles.scrollContainer,
            { paddingBottom: "90%", marginBottom: "10%" },
          ]}
        >
          <Close  onPress={handleClose} />
          <Text style={appStyles.screenHeader}>Create a new issue</Text>
          <Text style={appStyles.date}>
            Current day: {day}/{month}/{year} at {hours}:{minutes}
          </Text>

          <Spacer height={20} />

          {isVisible && (
            <Modal
              testID="close-confirmation-modal"
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
                  navigation.navigate("Issues");
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
            height={textInputHeight}
            width={ButtonDimensions.fullWidthButtonWidth}
            backgroundColor={Color.TextInputBackground}
            testID="testIssueNameField"
            style={{ alignContent: "center" }}
          />

          <Spacer height={20} />

          <Text style={appStyles.inputFieldLabel}>
            Please take a picture of the damage or situation if applicable
          </Text>

          <CameraButton onPress={handleAddPicture} />

          <View style={appStyles.carouselImageContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {pictureList.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={appStyles.smallThumbnailImage}
                />
              ))}
            </ScrollView>
          </View>

          <InputField
            label="Which room is the issue in?"
            value={room}
            setValue={setRoom}
            placeholder="e.g: Bedroom, Kitchen, Bathroom..."
            radius={25}
            height={textInputHeight}
            width={ButtonDimensions.fullWidthButtonWidth}
            backgroundColor={Color.TextInputBackground}
            testID="testRoomNameField"
            style={{ alignContent: "center" }}
          />

          <Spacer height={20} />

          <InputField
            label="Please provide a description of your issue:"
            value={description}
            setValue={setDescription}
            placeholder="e.g: The bathtub is leaking because of..."
            height={100}
            width={ButtonDimensions.fullWidthButtonWidth}
            backgroundColor={Color.TextInputBackground}
            radius={20}
            testID="testDescriptionField"
            style={{ alignContent: "center" }}
          />

          <Spacer height={20} />

          <View style={{ flexDirection: "row" }}>
            <BouncyCheckbox
              testID="messaging-checkbox"
              iconImageStyle={appStyles.tickingBox}
              iconStyle={appStyles.tickingBox}
              innerIconStyle={appStyles.tickingBox}
              unFillColor={Color.TextInputBackground}
              fillColor={Color.ButtonBackground}
              onPress={(isChecked: boolean) => setTick(isChecked)}
            />
            <Text style={appStyles.inputFieldLabel}>
              I would like to start a chat with the manager about this issue
            </Text>
          </View>
          <View style={appStyles.submitContainer}>
            <SubmitButton
              disabled={room === "" || description === "" || issue === ""}
              onPress={handleSubmit}
              width={ButtonDimensions.mediumButtonWidth}
              height={ButtonDimensions.mediumButtonHeight}
              label="Submit"
              testID="testSubmitButton"
              style={appStyles.submitButton}
              textStyle={appStyles.submitButtonText}
            />
          </View>
        </View>
      </ScrollView>
    </Header>
  );
}
