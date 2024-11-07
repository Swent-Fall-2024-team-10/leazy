import React, { useState, useEffect, useCallback, useContext} from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';  // Firebase imports
import { storage } from '@/firebase/firebase'; // Import storage from your Firebase config
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { ReportStackParamList } from '@/types/types';
import { usePictureContext } from '@/app/context/PictureContext';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

// portions of this code were generated with chatGPT as an AI assistant

type CapturedMediaScreenRouteProp = RouteProp<ReportStackParamList, 'CapturedMedia'>;


const picDir = FileSystem.cacheDirectory + 'pictures/';
const picFileUri = (picId: string) => picDir + `picture_${picId}.jpg`;

/**
 * Ensures the pictures directory exists
 */
async function ensureDirExists() {
  const dirInfo = await FileSystem.getInfoAsync(picDir);
  if (!dirInfo.exists) {
    console.log("Pictures' directory doesn't exist, creating...");
    await FileSystem.makeDirectoryAsync(picDir, { intermediates: true });
  }
}

/**
 * Saves a blob to the pictures directory with the specified ID
 * @param {Blob} blob - The blob to save
 * @param {string} picId - The picture ID to use in the filename
 * @returns {Promise<string>} The URI of the saved file
 */
export const cacheImage = async (blob: Blob, picId: string): Promise<string> => {
  await ensureDirExists();
  
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    
    fr.onerror = () => {
      reject(new Error('Failed to read blob'));
    };
    
    fr.onload = async () => {
      try {
        if (fr.result == null || typeof fr.result !== 'string') {
          throw new Error('Failed to read file: result is null or not a string');
        }

        // Extract base64 data from data URL
        const base64String = fr.result.split(',')[1];
        
        if (!base64String) {
          throw new Error('Failed to extract base64 data from file');
        }
        
        // Get file URI using existing naming convention
        const fileUri = picFileUri(picId);
        
        // Write file
        await FileSystem.writeAsStringAsync(
          fileUri,
          base64String,
          { encoding: FileSystem.EncodingType.Base64 }
        );
        
        resolve(fileUri);
      } catch (error) {
        reject(error);
      }
    };
    
    // Start reading the blob as data URL
    fr.readAsDataURL(blob);
  });
};

export default function CapturedMediaScreen() {

  const route = useRoute<CapturedMediaScreenRouteProp>();
  const navigation = useNavigation();
  const { uri, type } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);

  const {addPicture} = usePictureContext();

const handleUpload = useCallback(async () => {
  try {

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

    // Step 2: Calculate target dimensions (e.g., 50% of original)
    const targetWidth = width * 0.5; // Adjust 0.5 to the desired percentage
    const targetHeight = height * 0.5; // Adjust 0.5 to the desired percentage

    // Step 3: Resize the image using ImageManipulator
    const resizedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: targetWidth, height: targetHeight } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Get resized image size in MB
    const response = await fetch(resizedImage.uri);
    const blob = await response.blob();
    
    // Store image in cache
    const fileUri = await cacheImage(blob, Date.now().toString());
    console.log(`Image saved to cache: ${fileUri}`);
    
    
    // Upload resized image as before
    //const fileName = `${type}-${Date.now()}.jpg`;
    //const storageRef = ref(storage, `uploads/${fileName}`);
    //await uploadBytes(storageRef, blob);

    //const downloadURL = await getDownloadURL(storageRef);
    //console.log(`Media uploaded to Firebase: ${downloadURL}`);
    //addPicture(downloadURL);

    //navigation.goBack();
    
    //Alert.alert('Upload', 'Media uploaded successfully!');
  } catch (error) {
    console.error('Error uploading media:', error);
    Alert.alert('Error', 'Failed to upload media to Firebase');
  }
}, [addPicture]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="close" size={IconDimension.mediumIcon} color={Color.ButtonBackground}/>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleUpload} style={styles.headerButton}>
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