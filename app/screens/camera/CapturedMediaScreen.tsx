import React, { useState, useEffect, useCallback, useContext} from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';  // Firebase imports
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { storage } from '../../../firebase/firebase'; // Import storage from your Firebase config
import { ReportStackParamList } from '@/types/types';
import { usePictureContext } from '../../context/PictureContext';
import * as ImageManipulator from 'expo-image-manipulator';
import { cacheFile, picFileUri } from '../../utils/cache';
import { Color, IconDimension } from '../../../styles/styles';

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
    Alert.alert('Debug', 'Uploading media started'); // Debug Alert
    console.log('Uploading media...');
    // Define a type for the dimensions object
    type ImageDimensions = { width: number; height: number };

    // Step 1: Get the original dimensions of the image using a promise
    const getImageDimensions = (uri: string): Promise<ImageDimensions> => {
      return new Promise((resolve, reject) => {
        Image.getSize(
          uri,
          (width, height) => resolve({ width, height }),
          (error) => reject(error)
        );
      });
    };

    // Retrieve dimensions with the correct type
    const { width, height } = await getImageDimensions(uri);
    Alert.alert('Debug', `Image dimensions retrieved: ${width}x${height}`); // Debug Alert
    // Step 2: Calculate target dimensions (e.g., 50% of original)
    const targetWidth = width * 0.5; // Adjust 0.5 to the desired percentage
    const targetHeight = height * 0.5; // Adjust 0.5 to the desired percentage

    // Step 3: Resize the image using ImageManipulator
    Alert.alert('Debug', 'Resizing image'); // Debug Alert
    const resizedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: targetWidth, height: targetHeight } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );
    Alert.alert('Debug', `Image resized: ${resizedImage.uri}`); // Debug Alert

    // Get resized image size in MB
    Alert.alert('Debug', 'Fetching resized image'); // Debug Alert
    const response = await fetch(resizedImage.uri);
    const blob = await response.blob();
    Alert.alert('Debug', 'Blob created'); // Debug Alert
    
    // Store image in cache
    
    
    const fileUri = picFileUri(Date.now().toString());
    Alert.alert('Debug', `Caching file at: ${fileUri}`); // Debug Alert
    await cacheFile(blob, fileUri);
    console.log(`Image saved to cache: ${fileUri}`);
    addPicture(fileUri);
    Alert.alert('Upload', 'Photo added to maintenance request!'); // Success Alert

    navigation.goBack();
    

  } catch (error) {
    console.error('Error uploading media:', error);
    Alert.alert('Error', 'Failed to upload media to Firebase');
  }
}, [addPicture]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity testID='close-button' onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="close" size={IconDimension.mediumIcon} color={Color.ButtonBackground}/>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity testID= "upload-button" onPress={handleUpload} style={styles.headerButton}>
          <Ionicons name="cloud-upload-outline" size={IconDimension.mediumIcon} color={Color.ButtonBackground} />
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
        <>
          <Image source={{ uri }} style={styles.media} accessibilityLabel="Captured photo" />
          <Text style={styles.infoText}>Photo captured</Text> {/* Added Text for photos */}
        </>
      ) : type === 'video' ? (
        <>
          <View style={styles.videoContainer}>
            <Video
              source={{ uri }}
              style={styles.media}
              useNativeControls
              isLooping
              shouldPlay={isPlaying}
            />
            <TouchableOpacity testID="play-pause-button" style={styles.playPauseButton} onPress={togglePlayPause}>
              <Ionicons
                testID={isPlaying ? 'pause-icon' : 'play-icon'}
                name={isPlaying ? 'pause' : 'play'}
                size={50}
                color="white"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.infoText}>Video recorded</Text> {/* Added Text for videos */}
        </>
      ) : (
        <Text style={styles.infoText}>Invalid media type</Text>
      )}
      <View style={styles.infoContainer}>
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