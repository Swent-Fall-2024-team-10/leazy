import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { ref, uploadBytes } from 'firebase/storage';  // Firebase imports
import { storage } from '../../firebase/firebase'; // Import storage from your Firebase config

export type RootStackParamList = {
  Camera: undefined;
  CapturedMedia: { uri: string; type: 'photo' | 'video' };
};

type CapturedMediaScreenRouteProp = RouteProp<RootStackParamList, 'CapturedMedia'>;

export default function CapturedMediaScreen() {
  const route = useRoute<CapturedMediaScreenRouteProp>();
  const navigation = useNavigation();
  const { uri, type } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);

  const handleUpload = useCallback(async () => {
    try {
      // Convert the URI to a blob for Firebase
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileType = type === 'photo' ? 'image/jpeg' : 'video/mp4';
      const fileName = type === 'photo' ? 'photo.jpg' : 'video.mp4';

      // Create a reference to Firebase Storage
      const storageRef = ref(storage, `uploads/${fileName}`);

      // Upload the file
      await uploadBytes(storageRef, blob);
      Alert.alert('Upload', 'Media uploaded successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to upload media to Firebase');
      console.error(error);
    }
  }, [uri, type, navigation]);

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