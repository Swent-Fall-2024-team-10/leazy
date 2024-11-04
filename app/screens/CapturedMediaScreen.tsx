import React, { useState, useEffect, useCallback, useContext} from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';  // Firebase imports
import { storage } from '../../firebase/firebase'; // Import storage from your Firebase config
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { ReportStackParamList } from '@/types/types';
import { usePictureContext } from '../context/PictureContext';
import * as ImageManipulator from 'expo-image-manipulator';

// portions of this code were generated with chatGPT as an AI assistant

type CapturedMediaScreenRouteProp = RouteProp<ReportStackParamList, 'CapturedMedia'>;

export default function CapturedMediaScreen() {
  const route = useRoute<CapturedMediaScreenRouteProp>();
  const navigation = useNavigation();
  const { uri, type } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);

  const {addPicture} = usePictureContext();

const handleUpload = useCallback(async () => {
  try {
    // Resize the image
    const resizedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800, height: 600 } }], // Set target dimensions
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Get resized image size in MB
    const response = await fetch(resizedImage.uri);
    const blob = await response.blob();
    
    // Upload resized image as before
    const fileName = `${type}-${Date.now()}.jpg`;
    const storageRef = ref(storage, `uploads/${fileName}`);
    await uploadBytes(storageRef, blob);

    const downloadURL = await getDownloadURL(storageRef);
    addPicture(downloadURL);

    navigation.goBack();
    
    Alert.alert('Upload', 'Media uploaded successfully!');
  } catch (error) {
    console.error('Error uploading media:', error);
    Alert.alert('Error', 'Failed to upload media to Firebase');
  }
}, [addPicture]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleUpload} style={styles.headerButton}>
          <Ionicons name="cloud-upload-outline" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleUpload]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={styles.container}>
      {type === 'photo' ? (
        <Image source={{ uri }} style={styles.media} accessibilityLabel="Captured photo" />
      ) : (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri }}
            style={styles.media}
            useNativeControls
            isLooping
            shouldPlay={isPlaying}
          />
          <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={50}
              color="white"
            />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {type === 'photo' ? 'Photo captured' : 'Video recorded'}
        </Text>
        <Text style={styles.infoText}>Tap upload to save to the server</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width * (4 / 3),
    resizeMode: 'contain',
  },
  videoContainer: {
    position: 'relative',
  },
  playPauseButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  headerButton: {
    paddingHorizontal: 15,
    backgroundColor: 'black',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  infoText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
});