// ApartmentItem.tsx
import React from 'react';
import { Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Apartment } from '@/types/types';
import { appStyles } from '@/styles/styles';

type ApartmentItemProps = {
  apartment: Apartment;
  onPress: (apartment: Apartment) => void;
};

function ApartmentItem({ apartment, onPress }: ApartmentItemProps) {
  return (
    <Pressable
      style={({pressed}) => ({
        width:'90%', 
        opacity: pressed ? 0.6 : 1, 
        backgroundColor: pressed ? '#bdbad4' : '#D6D3F0', 
        borderRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
      })}
      onPress={() => onPress(apartment)}
      android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
    >
      <Text style={appStyles.flatText}>
        Apartment {apartment.apartmentId} ({apartment.tenants.length} tenants)
      </Text>
      <Feather name="chevron-right" size={20} color="#666666" />
    </Pressable>
  );
}

export default ApartmentItem;