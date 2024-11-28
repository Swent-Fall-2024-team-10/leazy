// ResidenceItem.tsx
import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { appStyles } from '@/styles/styles';
import { Residence, Apartment } from '@/types/types';
import ApartmentItem from './ApartementItem';

type ResidenceItemProps = {
  residence: Residence;
  apartments: Apartment[];
  isExpanded: boolean;
  onPress: () => void;
  onApartmentPress: (apartment: Apartment) => void;
};

function ResidenceItem({ 
  residence, 
  apartments, 
  isExpanded, 
  onPress,
  onApartmentPress 
}: ResidenceItemProps) {
  const handleEditPress = (residenceId: string) => {
    console.log('Edit residence:', residenceId);
  };

  return (
    <View style={appStyles.residenceContainer}>
      <Pressable
        style={({ pressed }) => [
          appStyles.residenceButton,
          isExpanded && appStyles.expandedResidence
        ]}
        onPress={onPress}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
      >
        {({ pressed }) => (
          <>
            <Text style={appStyles.residenceText}>
              {residence.street} {residence.number}
            </Text>
            
            <View style={appStyles.residenceIconContainer}>
              {isExpanded && (
                <Pressable
                  onPress={() => handleEditPress(residence.residenceId)}
                  style={({ pressed }) => [
                    appStyles.residenceEditButton,
                    pressed && { opacity: Platform.OS === 'ios' ? 0.6 : 1 }
                  ]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  android_ripple={{ color: 'rgba(0, 0, 0, 0.1)', radius: 20 }}
                >
                  <Feather name="edit-2" size={20} color="#000000" />
                </Pressable>
              )}
              <Feather
                name={isExpanded ? 'chevron-down' : 'chevron-right'}
                size={24}
                color="#000000"
              />
            </View>
          </>
        )}
      </Pressable>

      {isExpanded && apartments.length > 0 && (
        <View style={appStyles.flatsContainer}>
          {apartments.map((apartment) => (
            <ApartmentItem 
              key={apartment.apartmentId} 
              apartment={apartment}
              onPress={onApartmentPress}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default ResidenceItem;