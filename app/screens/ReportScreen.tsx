import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

interface IssueItemProps {
  issue: string;
  status: 'Not started' | 'In progress' | 'Completed';
  onStatusChange: (status: 'Not started' | 'In progress' | 'Completed') => void;
  onArchive: () => void;
  isArchived: boolean;
}

const IssueItem: React.FC<IssueItemProps> = ({ issue, status, onStatusChange, onArchive, isArchived }) => {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const getStatusColor = () => {
    switch (status) {
      case 'In progress':
        return '#F39C12';
      case 'Not started':
        return '#E74C3C';
      case 'Completed':
        return '#2ECC71';
      default:
        return '#95A5A6';
    }
  };

  return (
    <View style={styles.issueItem}>
      <View style={styles.issueContent}>
        <View style={styles.issueTextContainer}>
        <Text style={styles.issueText} numberOfLines={1}>{issue}</Text>
        </View>
        <TouchableOpacity
          style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
          onPress={() => !isArchived && setPickerVisible(true)}
        >
          <Text style={styles.statusText}>Status: {status}</Text>
        </TouchableOpacity>
      </View>
      {status === 'Completed' && !isArchived && (
        <TouchableOpacity onPress={onArchive} style={styles.archiveButton}>
          <Feather name="archive" size={24} color="#2C3E50" />
        </TouchableOpacity>
      )}
      <Modal visible={isPickerVisible} transparent animationType="slide">
        <View style={styles.pickerModalContainer}>
          <View style={styles.pickerModalContent}>
            <Picker
              selectedValue={status}
              onValueChange={(itemValue) => {
                onStatusChange(itemValue);
                setPickerVisible(false);
              }}
              style={styles.picker}
            >
              <Picker.Item label="Not started" value="Not started" />
              <Picker.Item label="In progress" value="In progress" />
              <Picker.Item label="Completed" value="Completed" />
            </Picker>
            <TouchableOpacity
              style={styles.closePickerButton}
              onPress={() => setPickerVisible(false)}
            >
              <Text style={styles.closePickerButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

interface AddIssueModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (issueText: string) => void;
}

const AddIssueModal: React.FC<AddIssueModalProps> = ({ visible, onClose, onAdd }) => {
  const [issueText, setIssueText] = useState('');

  const handleAdd = () => {
    if (issueText.trim()) {
      onAdd(issueText);
      setIssueText('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Issue</Text>
          <TextInput
            style={styles.input}
            value={issueText}
            onChangeText={setIssueText}
            placeholder="Enter issue description"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.addButton]} onPress={handleAdd}>
              <Text style={styles.modalButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const MaintenanceIssues = () => {
  const [issues, setIssues] = useState([
    { id: 1, text: 'Radiator in bedroom does...', status: 'In progress', archived: false },
    { id: 2, text: 'Light in the kitchen does no...', status: 'Not started', archived: false },
    { id: 3, text: 'Radiator in bedroom does...', status: 'Completed', archived: false },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const addIssue = (text) => {
    const newIssue = {
      id: issues.length + 1,
      text: text,
      status: 'Not started',
      archived: false
    };
    setIssues([...issues, newIssue]);
  };

  const updateIssueStatus = (id, newStatus) => {
    setIssues(issues.map(issue => 
      issue.id === id ? { ...issue, status: newStatus } : issue
    ));
  };

  const archiveIssue = (id) => {
    setIssues(issues.map(issue => 
      issue.id === id ? { ...issue, archived: true } : issue
    ));
  };

  const filteredIssues = issues.filter(issue => issue.archived === showArchived);

  return (
    <Header>    
    <SafeAreaView style={styles.safeAreContext}>
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Maintenance issues</Text>
        <View style={styles.switchContainer}>
          <Text> Archived Issues</Text>
          <Switch
            value={showArchived}
            onValueChange={setShowArchived}
          />
        </View>
      </View>
      <ScrollView style={styles.scrollView}>
        {filteredIssues.map((issue) => (
          <IssueItem
            key={issue.id}
            issue={issue.text}
            status={issue.status}
            onStatusChange={(newStatus) => updateIssueStatus(issue.id, newStatus)}
            onArchive={() => archiveIssue(issue.id)}
            isArchived={issue.archived}
          />
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
      <AddIssueModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={addIssue}
      />
    </View>
    </SafeAreaView>
    </Header>
  );
};

const styles = StyleSheet.create({
  safeAreContext: {
    flex: 1,
    backgroundColor: '#C6B9CD',
    paddingTop: -500,
    paddingBottom: -500,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#7F7F7F',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDEDED', 
    borderRadius: 30,           
    borderWidth: 1,             
    borderColor: '#7F7F7F',     
    width: 360,                 
    height: 110,                
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  issueContent: {
    flex: 1,
  },
  issueTextContainer: { 
    width: 330,         
    height: 32,         
    borderRadius: 25,   
    backgroundColor: '#FFF', 
    justifyContent: 'center',  
    paddingHorizontal: 12,
  },
  issueText: {
    fontSize: 16,
    color: '#2C3E50',
    //numberOfLines: 1,
  },
  statusBadge: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  archiveButton: {
    marginLeft: 8,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2C3E50',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalButtonText: {
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  pickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  picker: {
    marginBottom: 16,
  },
  closePickerButton: {
    alignSelf: 'center',
    padding: 12,
  },
  closePickerButtonText: {
    color: '#2C3E50',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MaintenanceIssues;