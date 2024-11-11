import React, { useState, useEffect } from "react";
import { Text, View, Alert, Image, Modal } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import InputField from "@/app/components/forms/text_input";
import Spacer from "@/app/components/Spacer";
import SubmitButton from "@/app/components/buttons/SubmitButton";
import { appStyles, ButtonDimensions, Color, textInputHeight } from "@/styles/styles";
import Close from "@/app/components/buttons/Close";
import { NavigationProp, useNavigation } from "@react-navigation/native"; // Import NavigationProp
import { ReportStackParamList } from "@/types/types"; // Import or define your navigation types
import CameraButton from "@/app/components/buttons/CameraButton";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import CloseConfirmation from "@/app/components/buttons/CloseConfirmation";
import { collection, addDoc } from "firebase/firestore"; // Import Firestore functions
import { MaintenanceRequest } from "@/types/types";
import { db, auth } from "@/firebase/firebase";
import {
  getTenant,
  updateMaintenanceRequest,
  updateTenant,
  getUser,
} from "@/firebase/firestore/firestore";
import Header from "@/app/components/Header";
import { usePictureContext } from "@/app/context/PictureContext";

// portions of this code were generated with chatGPT as an AI assistant

export default function ReportScreen() {
  const navigation = useNavigation<NavigationProp<ReportStackParamList>>();

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

  function resetStates() {
    setRoom("");
    setIssue("");
    setDescription("");
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
    setLoading(true); // Set loading to true when starting the submission

    // first get user then get tenantId
    const userObj = await getUser(auth.currentUser?.uid || "");
    if (userObj == null) {
      Alert.alert("Error", "User not found");
      setLoading(false);
      return;
    }
    const { user, userUID } = userObj;

    const tenantDoc = await getTenant(userUID);
    console.log("tenantDoc: ", tenantDoc);

    if (tenantDoc == null) {
      console.log("user not found");
      Alert.alert("Error", "Tenant not found");
      setLoading(false);
      return;
    }

    const {tenant, tenantUID} = tenantDoc;

    console.log("url list for the pictures : ", pictureList);
    try {
      if (!tenant) {
        throw new Error("Tenant not found");
      }
      const newRequest: MaintenanceRequest = {
        requestID: "",
        tenantId: tenant.userId,
        residenceId: "apartment.residenceId",
        apartmentId: tenant.apartmentId,
        openedBy: tenant.userId,
        requestTitle: issue,
        requestDate: `${day}/${month}/${year} at ${hours}:${minutes}`,
        requestDescription: description,
        picture: pictureList,
        requestStatus: "notStarted",
      };

      //this should be changed when the database function are updated
      //this is not respecting the model view model pattern for now but this is a temporary solution
      const requestID = await addDoc(
        collection(db, "maintenanceRequests"),
        newRequest
      );
      await updateTenant(tenantUID, {
        maintenanceRequests: [...tenant.maintenanceRequests, requestID.id],
      });
      await updateMaintenanceRequest(requestID.id, { requestID: requestID.id });

      Alert.alert("Success", "Your maintenance request has been submitted.");
      resetStates();
      const nextScreen = tick ? "Messaging" : "Issues";
      setTick(false);
      navigation.navigate(nextScreen);
    } catch (error) {
      Alert.alert(
        "Error",
        "There was an error submitting your request. Please try again."
      );
      console.log("Error submitting request:", error);
    } finally {
      setLoading(false); // Set loading to false after submission is complete
    }
  };

  return (
    <Header>
      <ScrollView style={appStyles.screenContainer} 
      automaticallyAdjustKeyboardInsets={true}
      >
        <View style={[appStyles.scrollContainer, {paddingBottom : '90%', marginBottom : '10%'}]}>

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
            height={textInputHeight}
            width={ButtonDimensions.fullWidthButtonWidth}
            backgroundColor={Color.TextInputBackground}
            testID="testIssueNameField"
            style={{alignContent: 'center'}}
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
            height={textInputHeight}
            width={ButtonDimensions.fullWidthButtonWidth}
            backgroundColor={Color.TextInputBackground}
            testID="testRoomNameField"
            style={{alignContent: 'center'}}
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
            style={{alignContent: 'center'}}
          />

          <Spacer height={20} />

          <View style={{ flexDirection: 'row' }}>
            <BouncyCheckbox
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

          <SubmitButton
            disabled={room === '' || description === '' || issue === ''}
            onPress={handleSubmit}
            width={ButtonDimensions.mediumButtonWidth}
            height={ButtonDimensions.mediumButtonHeight}
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

