import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image } from 'react-native';

// portions of this code were generated with chatGPT as an AI assistant

export default function ReportScreen() {
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  
  // Placeholder function for adding pictures
  const handleAddPicture = () => {
    // Placeholder function to add pictures
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Report an issue</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name the issue"
          value={issue}
          onChangeText={setIssue}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline={true}
        />
      </View>

      <View style={styles.pictureContainer}>
        <Text style={styles.subHeader}>Add a picture</Text>
        <Button title="Add Picture" onPress={handleAddPicture} />
        {/* Picture Thumbnails Placeholder */}
        <View style={styles.thumbnails}>
          <View style={styles.thumbnailBox}><Text>Thumbnail 1</Text></View>
          <View style={styles.thumbnailBox}><Text>Thumbnail 2</Text></View>
        </View>
      </View>

      <View style={styles.submitContainer}>
        <Button title="Submit" onPress={() => { /* Handle submit */ }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3d3d3',
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
  },
  pictureContainer: {
    marginBottom: 20,
  },
  thumbnails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  thumbnailBox: {
    width: 100,
    height: 100,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  submitContainer: {
    marginTop: 20,
  },
});
