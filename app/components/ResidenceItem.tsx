import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { Residence, Apartment, ResidenceStackParamList } from '../../types/types';
import { appStyles} from '../../styles/styles';
import {residenceManagementListStyles} from '../../styles/styles';
import SearchBar from './SearchBar';
import AddApartmentForm from './AddApartmentForm';
import ApartmentItem from './ApartmentItem';

interface ResidenceItemProps {
  residence: Residence;
  apartments: Apartment[];
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

  const filteredApartments = apartments.filter(apt =>
    apt.apartmentId.toLowerCase().includes(apartmentSearch.toLowerCase())
  );

  const handleAddApartment = (name: string) => {
    console.log('Adding apartment:', name);
    setShowAddForm(false); // Close form after successful submission
  };

  const handleDeleteApartment = (apartmentId: string) => {
    console.log('Deleting apartment:', apartmentId);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false); // Close form when cancelled
  };

  return (
    <View testID={`residence-item-${residence.residenceId}`} style={appStyles.residenceContainer}>
      <Pressable
        testID={`residence-button-${residence.residenceId}`}
        style={({ pressed }) => [
          appStyles.residenceButton,
          isExpanded && appStyles.expandedResidence,
          { opacity: pressed ? 0.7 : 1 }
        ]}
        onPress={onPress}
      >
        <Text style={appStyles.residenceText}>
          {residence.street} {residence.number}
        </Text>
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
            <AddApartmentForm
              onSubmit={handleAddApartment}
              onCancel={handleCancelAdd}
            />
          )}

          {filteredApartments.map((apartment) => (
            <ApartmentItem
              key={apartment.apartmentId}
              apartment={apartment}
              editMode={editMode}
              navigation={navigation}
              onDelete={handleDeleteApartment}
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
