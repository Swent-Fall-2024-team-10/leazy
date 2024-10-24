import React, { useCallback, useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import { Camera, CameraType, FlashMode, CameraView } from 'expo-camera';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { ReportStackParamList } from '@/types/types';

export type CameraStackParamList = {
  setURL: (url: string) => void;
}

type CameraRouteProp = RouteProp<ReportStackParamList, 'CameraScreen'>;


export default function CameraScreen() {
  const route = useRoute<CameraRouteProp>();
  const navigation = useNavigation<NavigationProp<ReportStackParamList>>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [zoom, setZoom] = useState(0);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(
        cameraStatus === 'granted' && 
        audioStatus === 'granted' && 
        mediaLibraryStatus === 'granted'
      );
    })();
  }, []);

  const takePicture = useCallback(async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: true,
        });
        if (photo){
          {await MediaLibrary.saveToLibraryAsync(photo.uri);
          const pictureList = route.params.pictureList;
          const setPictureList = route.params.setPictureList;
 
            navigation.navigate('CapturedMedia', { uri: photo.uri, type: 'photo', setPictureList, pictureList })
          ;}
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
        console.error(error);
      }
    }
  }, [navigation]);

  const toggleCameraType = useCallback(() => {
    setType(current => (current === "back" ? "front" : "back"));
  }, []);

  const toggleFlash = useCallback(() => {
    setFlash(current => (current === "off" ? "on" : "off"));
  }, []);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setZoom(currentZoom => {
      const newZoom = direction === 'in' ? currentZoom + 0.1 : currentZoom - 0.1;
      return Math.max(0, Math.min(1, newZoom));
    });
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={type} 
        flash={flash} 
        ref={cameraRef}
        zoom={zoom}
      >
        <View style={styles.topButtonContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={toggleCameraType}>
            <Ionicons name="camera-reverse" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
            <Ionicons name={flash === "on" ? "flash" : "flash-off"} size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.zoomContainer}>
          <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom('in')}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom('out')}>
            <Ionicons name="remove" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  topButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  iconButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    padding: 10,
  },
  zoomContainer: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -50 }],
  },
  zoomButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    padding: 10,
    marginVertical: 5,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
});