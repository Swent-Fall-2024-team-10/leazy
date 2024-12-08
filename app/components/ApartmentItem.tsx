import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { appStyles } from '../../styles/styles';
import { Apartment, ResidenceStackParamList } from '../../types/types';

interface ApartmentItemProps {
  apartment: Apartment;
  editMode: boolean;
  navigation: NavigationProp<ResidenceStackParamList>;
  onDelete?: (apartmentId: string) => void;
}

const ApartmentItem: React.FC<ApartmentItemProps> = ({
  apartment,
  editMode,
  navigation,
  onDelete
}) => (
  <Pressable
    testID={`apartment-item-${apartment.apartmentName}`}
    style={({ pressed }: { pressed: boolean }) => ({
      width: '100%',
      opacity: pressed ? 0.6 : 1,
      backgroundColor: pressed ? '#bdbad4' : '#D6D3F0',
      borderRadius: 4,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 10,
      marginVertical: 4
    })}
    onPress={() => navigation.navigate('FlatDetails', { apartment })}
  >
    <Text style={appStyles.flatText}>
      {apartment.apartmentName} ({apartment.tenants.length} tenants)
    </Text>
    <View style={{ flex: 1 }} />
    <Pressable
      testID={editMode ? 'delete-button' : 'chevron-button'}
      onPress={() => {
        if (editMode && onDelete) {
          onDelete(apartment.apartmentName);
        } else {
          navigation.navigate('FlatDetails', { apartment });
        }
      }}
    >
      <Feather
        name={editMode ? "trash-2" : "chevron-right"}
        size={20}
        color="#666666"
      />
    </Pressable>
  </Pressable>
);

export default ApartmentItem;