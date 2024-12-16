import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { ResidenceWithId, ApartmentWithId, ResidenceStackParamList } from '../../types/types';
import { appStyles } from '../../styles/styles';
import { residenceManagementListStyles } from '../../styles/styles';
import SearchBar from './SearchBar';
import AddApartmentForm from './AddApartmentForm';
import ApartmentItem from './ApartmentItem';
import { createApartment, updateResidence, deleteApartment } from '../../firebase/firestore/firestore';

interface ResidenceItemProps {
  residence: ResidenceWithId;
  apartments: ApartmentWithId[];
  isExpanded: boolean;
  navigation: NavigationProp<ResidenceStackParamList>;
  onPress: () => void;
}

const ResidenceItem: React.FC<ResidenceItemProps> = ({
  residence,
  apartments,
  isExpanded,
  onPress,
  navigation
}) => {
  const [editMode, setEditMode] = useState(false);
  const [apartmentSearch, setApartmentSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use apartments prop directly instead of maintaining local state
  const filteredApartments = apartments.filter(apt =>
    apt.apartmentName.toLowerCase().includes(apartmentSearch.toLowerCase())
  );

  const handleAddApartment = async (name: string) => {
    console.log('Adding apartment:', name);
    setIsSubmitting(true);
    try {
      const newApartment = {
        apartmentName: name,
        residenceId: residence.id,
        tenants: [],
        maintenanceRequests: [],
        situationReportId: []
      };
      const apartmentId = await createApartment(newApartment);
      console.log('Apartment added:', apartmentId);
      if (apartmentId) {
        const updatedApartments = [...residence.apartments, apartmentId];
        console.log('Updated apartments:', updatedApartments);
        await updateResidence(residence.id, {
          apartments: updatedApartments
        });
        console.log('Residence updated:', residence.id);
      }
    } catch (error) {
      console.log('Error adding apartment:', error);
      Alert.alert('Error adding apartment');
    } finally {
      setIsSubmitting(false);
      setShowAddForm(false);
    }
  };

  const handleDeleteApartment = async (apartmentId: string) => {
    console.log('Deleting apartment:', apartmentId);
    try {
      await deleteApartment(apartmentId);
      console.log('Apartment deleted:', apartmentId);
      const updatedApartments = residence.apartments.filter(id => id !== apartmentId);
      console.log('Updated apartments:', updatedApartments);
      await updateResidence(residence.id, {
        apartments: updatedApartments
      });
    } catch (error) {
      console.log('Error deleting apartment:', error);
      Alert.alert('Error deleting apartment');  
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  return (
    <View testID={`residence-item-${residence.id}`} style={appStyles.residenceContainer}>
      <Pressable
        testID={`residence-button-${residence.id}`}
        style={({ pressed }) => [
          appStyles.residenceButton,
          isExpanded && appStyles.expandedResidence,
          { opacity: pressed ? 0.7 : 1 }
        ]}
        onPress={onPress}
      >
        <View>
          <Text style={appStyles.residenceText}>
            {residence.residenceName}
          </Text>
          <Text style={appStyles.residenceAddressText}>
            {`${residence.street} ${residence.number}`}
          </Text>
        </View>
        <View style={appStyles.residenceIconContainer}>
          {isExpanded && (
            <Pressable
              testID="edit-mode-toggle"
              onPress={() => setEditMode(!editMode)}
              style={appStyles.residenceEditButton}
            >
              <Feather name="edit-2" size={20} color="#000000" />
            </Pressable>
          )}
          <Feather
            testID={`chevron-${isExpanded ? 'down' : 'right'}`}
            name={isExpanded ? 'chevron-down' : 'chevron-right'}
            size={24}
            color="#000000"
          />
        </View>
      </Pressable>

      {isExpanded && (
        <View testID="expanded-content" style={appStyles.flatsContainer}>
          <SearchBar
            value={apartmentSearch}
            onChangeText={setApartmentSearch}
            onClear={() => setApartmentSearch('')}
          />

          {editMode && !showAddForm && (
            <Pressable
              testID="show-add-form-button"
              style={residenceManagementListStyles.addApartmentButton}
              onPress={() => setShowAddForm(true)}
            >
              <Text style={residenceManagementListStyles.addApartmentText}>
                Add an apartment
              </Text>
              <Feather name="plus" size={14} color="#333333" />
            </Pressable>
          )}

          {showAddForm && (
            <>
              <AddApartmentForm
                onSubmit={handleAddApartment}
                onCancel={handleCancelAdd}
              />
              {isSubmitting && (
                <ActivityIndicator style={{ marginTop: 10 }} />
              )}
            </>
          )}

          {filteredApartments.map((apartment) => (
            <ApartmentItem
              key={apartment.id}
              apartment={apartment}
              editMode={editMode}
              navigation={navigation}
              onDelete={() => handleDeleteApartment(apartment.id)}
            />
          ))}

          {filteredApartments.length === 0 && (
            <Text testID="no-apartments-message" style={{
              textAlign: 'center',
              marginTop: 12,
              color: '#666666',
              fontSize: 14,
            }}>
              No apartments found
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default ResidenceItem;