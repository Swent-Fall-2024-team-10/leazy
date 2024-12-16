// RenderTenant.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TUser } from '@/types/types';
import { appStyles, Color } from '../../styles/styles';

interface RenderTenantProps {
  tenant: TUser | null;
  editMode: boolean;
  isLoading: boolean;
  onRemove: (tenantId: string) => void;
}

const RenderTenant: React.FC<RenderTenantProps> = ({ 
  tenant, 
  editMode, 
  isLoading, 
  onRemove 
}) => {
  if (!tenant) return null;

  return (
    <View style={appStyles.tenantRow}>
      <View style={appStyles.tenantNameContainer}>
        <Ionicons
          name="person-outline"
          size={20}
          color={Color.TextInputPlaceholder}
        />
        <Text style={appStyles.tenantName}>{tenant.name}</Text>
      </View>
      {editMode && (
        <TouchableOpacity 
          onPress={() => onRemove(tenant.uid)}
          disabled={isLoading}
          testID={`remove-tenant-${tenant.uid}`}
        >
          <Ionicons 
            name='trash' 
            size={20} 
            color={Color.TextInputPlaceholder} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default RenderTenant;