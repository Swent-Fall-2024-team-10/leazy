import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NavigationProp, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ResidenceStackParamList, TUser, ApartmentWithId } from '@/types/types';
import Header from '../../components/Header';
import { appStyles, Color } from '../../../styles/styles';
import { getUser, updateApartment } from '../../../firebase/firestore/firestore';
import { useProperty } from '../../context/LandlordContext';

function FlatDetails() {
  const navigation = useNavigation<NavigationProp<ResidenceStackParamList>>();
  const route = useRoute<RouteProp<ResidenceStackParamList, 'FlatDetails'>>();
  const { apartments } = useProperty();
  
  // Get real-time apartment data from context
  const currentApartment = apartments.find(apt => apt.id === route.params.apartment.id);
  const apartment = currentApartment || route.params.apartment;
  
  const [tenantUsers, setTenantUsers] = useState<(TUser | null)[]>([]);
  const [editTenants, setEditTenants] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTenantUsers = useCallback(async () => {
    if (!apartment?.tenants?.length) {
      setTenantUsers([]);
      return;
    }

    try {
      setIsLoading(true);
      const users = await Promise.all(
        apartment.tenants.map(tenantId => getUser(tenantId))
      );
      setTenantUsers(users);
    } catch (error) {
      console.error('Error fetching tenant users:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apartment?.tenants]);

  const removeTenant = async (tenantId: string) => {
    try {
      setIsLoading(true);
      const newTenants = apartment.tenants.filter(tenant => tenant !== tenantId);
      await updateApartment(apartment.id, { tenants: newTenants });
      // No need to manually update tenantUsers - it will update via useEffect when apartment changes
    } catch (error) {
      console.error('Error removing tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tenant users whenever apartment.tenants changes
  useEffect(() => {
    fetchTenantUsers();
  }, [fetchTenantUsers]);

  const renderTenant = (tenant: TUser | null, index: number) => {
    if (!tenant) return null;

    return (
      <View key={tenant.uid || index} style={appStyles.tenantRow}>
        <View style={appStyles.tenantNameContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color={Color.TextInputPlaceholder}
          />
          <Text style={appStyles.tenantName}>{tenant.name}</Text>
        </View>
        {editTenants && (
            <TouchableOpacity 
            onPress={() => removeTenant(tenant.uid)}
            disabled={isLoading}
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

  return (
    <Header>
      <ScrollView style={appStyles.screenContainer}>
        <View style={appStyles.flatCard}>
          <Text style={appStyles.flatTitle}>Flat Details</Text>
          <View style={appStyles.idContainer}>
            <Text style={appStyles.idText}>
              Apartment ID: {apartment?.apartmentName}
            </Text>
          </View>
          <View style={appStyles.flatImageContainer}>
            <Image
              source={require('../../../assets/images/react-logo.png')}
              style={appStyles.flatImage}
              resizeMode="cover"
            />
          </View>
          <View style={appStyles.tenantsSection}>
            <View style={appStyles.tenantHeader}>
              <Text style={appStyles.tenantsTitle}>
                List Of Tenants ({apartment?.tenants?.length || 0})
              </Text>
              <TouchableOpacity 
                onPress={() => setEditTenants(!editTenants)}
                disabled={isLoading}
              >
                <MaterialCommunityIcons 
                  name={editTenants ? "pencil-off" : "pencil"} 
                  size={20} 
                  color={Color.TextInputPlaceholder} 
                />
              </TouchableOpacity>
            </View>
            {tenantUsers.map(renderTenant)}
          </View>
          <TouchableOpacity
            style={[
              appStyles.submitButton,
            ]}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={appStyles.submitButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Header>
  );
}

export default FlatDetails;