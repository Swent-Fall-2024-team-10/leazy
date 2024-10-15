import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React from 'react';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PhotoScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [flash, setFlash] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  const onCameraReady = () => {
    setIsCameraReady(true);
  };
     
  const takePicture = async () => {
    if (cameraRef.current) {
    const options = { quality: 0.5, base64: true, skipProcessing: true };
    }
  }



  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleFlash() {
    setFlash(!flash);
  }

  const ref = useRef()
  

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} enableTorch={flash}>
        <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
          <Text style={styles.flashText}>Flash</Text>
        </TouchableOpacity>
        <View style={styles.buttonContainer}>
          <View style={styles.button}>
            <Button title="Flip" onPress={() => setFacing(facing === 'back' ? 'front' : 'back')} />
          </View>
          <View style={styles.button}>
            <Button title="Take Picture" onPress={() => ref.current.takePictureAsync()} />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  flashButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background
    borderRadius: 10,
    padding: 10,
    elevation: 3, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  flashText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000', // Text color
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
});
