import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  Modal,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { appStyles, Color } from '../../../styles/styles';
import { ResidenceStackParamList, ResidenceWithId } from '../../../types/types';
import Header from '../../components/Header';
import ApartmentItem from '../../components/ApartmentItem';
import ResidenceItem from '../../components/ResidenceItem';
import { useProperty } from '../../context/LandlordContext';
import { deleteResidence } from '../../../firebase/firestore/firestore';
import { stylesForResidenceList } from '../../../styles/styles';

// New DeleteModal component
interface DeleteModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isVisible,
  onClose,
  onDelete,
}) => (
  <Modal
    visible={isVisible}
    transparent={true}
    animationType='fade'
    onRequestClose={onClose}
  >
    <View style={stylesForResidenceList.modalOverlay}>
      <View style={stylesForResidenceList.modalContent}>
        <Text style={stylesForResidenceList.modalTitle}>Delete Residence</Text>
        <Text style={stylesForResidenceList.modalText}>
          Are you sure you want to delete this residence?
        </Text>
        <View style={stylesForResidenceList.modalButtons}>
          <Pressable
            onPress={onClose}
            style={[
              stylesForResidenceList.modalButton,
              stylesForResidenceList.cancelButton,
            ]}
          >
            <Text style={stylesForResidenceList.buttonText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={onDelete}
            style={[
              stylesForResidenceList.modalButton,
              stylesForResidenceList.deleteButton,
            ]}
          >
            <Text
              style={[
                stylesForResidenceList.buttonText,
                stylesForResidenceList.deleteText,
              ]}
            >
              Delete
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);

const ResidencesListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ResidenceStackParamList>>();
  const [expandedResidence, setExpandedResidence] = useState<string | null>(
    null,
  );
  const { residences, residenceMap, isLoading, error } = useProperty();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedResidenceId, setSelectedResidenceId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (
      expandedResidence &&
      !residences.find((r) => r.id === expandedResidence)
    ) {
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
    <View key={residence.id} style={stylesForResidenceList.residenceContainer}>
      <View style={stylesForResidenceList.residenceContent}>
        <ResidenceItem
          residence={residence}
          apartments={residenceMap.get(residence) || []}
          isExpanded={expandedResidence === residence.id}
          onPress={() =>
            setExpandedResidence(
              expandedResidence === residence.id ? null : residence.id,
            )
          }
          navigation={navigation}
          isEditMode={isEditMode}
          onDelete={() => {
            setSelectedResidenceId(residence.id);
            setIsModalVisible(true);
          }}
        />
        {expandedResidence === residence.id && (
          <View testID={`expanded-residence-${residence.id}`}></View>
        )}
      </View>
    </View>
  ));

  return (
    <Header>
      <View testID='residences-screen' style={appStyles.screenContainer}>
        <View style={appStyles.residenceHeaderContainer}>
          <Text testID='screen-title' style={appStyles.residenceTitle}>
            Your Residences
          </Text>
          <Pressable
            testID='edit-residences-button'
            accessibilityLabel='Edit residences'
            onPress={() => setIsEditMode(!isEditMode)}
            style={stylesForResidenceList.editButton}
          >
            <Feather
              name={isEditMode ? 'x' : 'edit-2'}
              size={24}
              color='#007AFF'
            />
          </Pressable>
        </View>
        <ScrollView
          testID='residences-scroll-view'
          style={appStyles.residenceScrollView}
          contentContainerStyle={appStyles.residenceScrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {residenceElements}
        </ScrollView>
        <DeleteModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onDelete={() =>
            selectedResidenceId && handleDeleteResidence(selectedResidenceId)
          }
        />
        <Pressable
          testID='add-residence-button'
          accessibilityLabel='Add new residence'
          style={({ pressed }) => [
            appStyles.addResidenceButton,
            { opacity: pressed && Platform.OS === 'ios' ? 0.8 : 1 },
          ]}
          onPress={() => navigation.navigate('CreateResidence')}
        >
          <Feather name='plus' size={32} color='#FFFFFF' />
        </Pressable>
      </View>
    </Header>
  );
};

export default ResidencesListScreen;
