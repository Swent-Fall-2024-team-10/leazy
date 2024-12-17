import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Platform, Modal, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { appStyles, Color } from '../../../styles/styles';
import { ResidenceStackParamList, ResidenceWithId } from '../../../types/types';
import Header from '../../components/Header';
import ApartmentItem from '../../components/ApartmentItem';
import ResidenceItem from '../../components/ResidenceItem';
import { useProperty } from '../../context/LandlordContext';
import { deleteResidence } from '../../../firebase/firestore/firestore';

const ResidencesListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ResidenceStackParamList>>();
  const [expandedResidence, setExpandedResidence] = useState<string | null>(null);
  const { residences, residenceMap, isLoading, error } = useProperty();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedResidenceId, setSelectedResidenceId] = useState<string | null>(null);

  useEffect(() => {
    if (expandedResidence && !residences.find(r => r.id === expandedResidence)) {
      setExpandedResidence(null);
    }
  }, [residences, residenceMap, isLoading, error, expandedResidence]);

  const handleDeleteResidence = async (residenceId: string) => {
    try {
      await deleteResidence(residenceId);
      setSelectedResidenceId(null);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error deleting residence:', error);
      setIsModalVisible(false);
    }
  };

  if (isLoading) {
    return (
      <Header>
        <View style={appStyles.screenContainer}>
          <Text>Loading...</Text>
        </View>
      </Header>
    );
  }

  if (error) {
    return (
      <Header>
        <View style={appStyles.screenContainer}>
          <Text>Error: {error.message}</Text>
        </View>
      </Header>
    );
  }

  const residenceElements = residences.map((residence: ResidenceWithId) => (
    <View key={residence.id} style={styles.residenceContainer}>
      <View style={styles.residenceContent}>
        <ResidenceItem
          residence={residence}
          apartments={residenceMap.get(residence) || []}
          isExpanded={expandedResidence === residence.id}
          onPress={() => setExpandedResidence(
            expandedResidence === residence.id ? null : residence.id
          )}
          navigation={navigation}
          isEditMode={isEditMode}
          onDelete={() => {
            setSelectedResidenceId(residence.id);
            setIsModalVisible(true);
          }}
        />
        {expandedResidence === residence.id && (
          <View testID={`expanded-residence-${residence.id}`}>
          </View>
        )}
      </View>
    </View>
  ));

  return (
    <Header>
      <View testID="residences-screen" style={appStyles.screenContainer}>
        <View style={appStyles.residenceHeaderContainer}>
          <Text testID="screen-title" style={appStyles.residenceTitle}>
            Your Residences
          </Text>
          <Pressable
            testID="edit-residences-button"
            accessibilityLabel="Edit residences"
            onPress={() => setIsEditMode(!isEditMode)}
            style={styles.editButton}
          >
            <Feather 
              name={isEditMode ? "x" : "edit-2"} 
              size={24} 
              color="#007AFF"
            />
          </Pressable>
        </View>
        <ScrollView
          testID="residences-scroll-view"
          style={appStyles.residenceScrollView}
          contentContainerStyle={appStyles.residenceScrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {residenceElements}
        </ScrollView>
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Residence</Text>
              <Text style={styles.modalText}>
                Are you sure you want to delete this residence?
              </Text>
              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() => setIsModalVisible(false)}
                  style={[styles.modalButton, styles.cancelButton]}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => selectedResidenceId && handleDeleteResidence(selectedResidenceId)}
                  style={[styles.modalButton, styles.deleteButton]}
                >
                  <Text style={[styles.buttonText, styles.deleteText]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
        <Pressable
          testID="add-residence-button"
          accessibilityLabel="Add new residence"
          style={({ pressed }) => [
            appStyles.addResidenceButton,
            { opacity: pressed && Platform.OS === 'ios' ? 0.8 : 1 }
          ]}
          onPress={() => navigation.navigate("CreateResidence")}
        >
          <Feather name="plus" size={32} color="#FFFFFF" />
        </Pressable>
      </View>
    </Header>
  );
};

const styles = StyleSheet.create({
  editButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 2,
    paddingTop: 20,
  },
  residenceContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingRight: 16, 
  },
  residenceContent: {
    flex: 1, 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  deleteButton: {
    backgroundColor: Color.ButtonBackground,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteText: {
    color: 'white',
  },
});

export default ResidencesListScreen;