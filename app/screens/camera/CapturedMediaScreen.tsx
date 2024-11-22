import React, { useState, useEffect, useCallback } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { ReportStackParamList } from '../../../types/types';
import { usePictureContext } from '../../context/PictureContext';
import * as ImageManipulator from 'expo-image-manipulator';
import { cacheFile, picFileUri } from '../../utils/cache';
import { Color, IconDimension } from '../../../styles/styles';

type CapturedMediaScreenRouteProp = RouteProp<ReportStackParamList, 'CapturedMedia'>;

// Helper functions
const getImageDimensions = (uri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      (error) => reject(new Error(error?.message || 'Failed to get image dimensions'))
    );
  });
};

const resizeImage = async (uri: string, targetWidth: number, targetHeight: number) => {
  return ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: targetWidth, height: targetHeight } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );
};

// Media Components
const PhotoView = ({ uri }: { uri: string }) => (
  <>
    <Image source={{ uri }} style={styles.media} accessibilityLabel="Captured photo" />
    <Text style={styles.infoText}>Photo captured</Text>
  </>
);

const VideoView = ({ uri, isPlaying, togglePlayPause }: {
  uri: string;
  isPlaying: boolean;
  togglePlayPause: () => void;
}) => (
  <>
    <View style={styles.videoContainer}>
      <Video
        source={{ uri }}
        style={styles.media}
        useNativeControls
        isLooping
        shouldPlay={isPlaying}
      />
      <TouchableOpacity 
        testID="play-pause-button" 
        style={styles.playPauseButton} 
        onPress={togglePlayPause}
      >
        <Ionicons
          testID={isPlaying ? 'pause-icon' : 'play-icon'}
          name={isPlaying ? 'pause' : 'play'}
          size={50}
          color="white"
        />
      </TouchableOpacity>
    </View>
    <Text style={styles.infoText}>Video recorded</Text>
  </>
);

// Header Components
const HeaderLeftButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity testID='close-button' onPress={onPress} style={styles.headerButton}>
    <Ionicons name="close" size={IconDimension.mediumIcon} color={Color.ButtonBackground}/>
  </TouchableOpacity>
);

const HeaderRightButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity testID="upload-button" onPress={onPress} style={styles.headerButton}>
    <Ionicons 
      name="cloud-upload-outline" 
      size={IconDimension.mediumIcon} 
      color={Color.ButtonBackground} 
    />
  </TouchableOpacity>
);

export default function CapturedMediaScreen() {
  const route = useRoute<CapturedMediaScreenRouteProp>();
  const navigation = useNavigation();
  const { uri, type } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const { addPicture } = usePictureContext();

  const handleUpload = useCallback(async () => {
    try {
      const dimensions = await getImageDimensions(uri);
      const targetWidth = dimensions.width * 0.5;
      const targetHeight = dimensions.height * 0.5;

      const resizedImage = await resizeImage(uri, targetWidth, targetHeight);
      const response = await fetch(resizedImage.uri);
      const blob = await response.blob();

      const fileUri = picFileUri(Date.now().toString());
      await cacheFile(blob, fileUri);
      addPicture(fileUri);

      Alert.alert('Upload', 'Photo added to maintenance request!');
      navigation.goBack();
    } catch (error) {
      console.error('Error uploading media:', error);
      Alert.alert('Error', 'Failed to upload media to Firebase');
    }
  }, [uri, addPicture, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => <HeaderLeftButton onPress={() => navigation.goBack()} />,
      headerRight: () => <HeaderRightButton onPress={handleUpload} />,
    });
  }, [navigation, handleUpload]);

  const togglePlayPause = () => setIsPlaying(!isPlaying);

  const renderMedia = () => {
    if (type === 'photo') {
      return <PhotoView uri={uri} />;
    }
    if (type === 'video') {
      return <VideoView uri={uri} isPlaying={isPlaying} togglePlayPause={togglePlayPause} />;
    }
    return <Text style={styles.infoText}>Invalid media type</Text>;
  };

  return (
    <View style={styles.container}>
      {renderMedia()}
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