import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { appStyles } from '../../styles/styles';
import { ApartmentWithId, ResidenceStackParamList } from '../../types/types';

interface ApartmentItemProps {
  apartment: ApartmentWithId;
  editMode: boolean;
  navigation: NavigationProp<ResidenceStackParamList>;
  onDelete?: (apartmentId: string) => void;
}

const ApartmentItem: React.FC<ApartmentItemProps> = ({
  apartment,
  editMode,
  navigation,
  onDelete
}) => {
  const handleMainPress = () => {
    navigation?.navigate?.('FlatDetails', { apartment });
  };

  const handleActionPress = () => {
    if (editMode && onDelete) {
      onDelete(apartment.id);
    } else if (!editMode && navigation?.navigate) {
      navigation.navigate('FlatDetails', { apartment });
    }
  };

  return (
    <Pressable
      testID={`apartment-item-${apartment.id}`}
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
      onPress={handleMainPress}
    >
      <Text style={appStyles.flatText}>
      {apartment.apartmentName} ({apartment.tenants.length} tenants)
      </Text>
      <View style={{ flex: 1 }} />
      {editMode ? (
      apartment.tenants.length === 0 && (
        <Pressable testID={'delete-button'} onPress={handleActionPress}>
        <Feather name={"trash-2"} size={20} color="#666666" />
        </Pressable>
      )
      ) : (
      <Pressable testID={'chevron-button'} onPress={handleActionPress}>
        <Feather name={"chevron-right"} size={20} color="#666666" />
      </Pressable>
      )}
    </Pressable>
  );
};

export default ApartmentItem;