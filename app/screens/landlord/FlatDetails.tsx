import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ResidenceStackParamList, TUser, ApartmentWithId } from '@/types/types';
import Header from '../../components/Header';
import { appStyles, Color } from '../../../styles/styles';
import { getTenant, getUser, updateApartment, updateTenant } from '../../../firebase/firestore/firestore';
import { useProperty } from '../../context/LandlordContext';
import RenderTenant from '../../components/RenderTenant';

function FlatDetails() {
  const navigation = useNavigation<NavigationProp<ResidenceStackParamList>>();
  const route = useRoute<RouteProp<ResidenceStackParamList, 'FlatDetails'>>();
  const { apartments } = useProperty();
  
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
      const tenant = await getTenant(tenantId);
      if (tenant) {
        const updatedTenant = { ...tenant, apartmentId: '', residenceId: '' };
        await updateTenant(tenantId, updatedTenant);
      }
    } catch (error) {
      console.error('Error removing tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantUsers();
  }, [fetchTenantUsers]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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
          <View style={appStyles.tenantsSection}>
            <View style={appStyles.tenantHeader}>
              <Text style={appStyles.tenantsTitle}>
                List Of Tenants ({apartment?.tenants?.length || 0})
              </Text>
              <TouchableOpacity 
                onPress={() => setEditTenants(!editTenants)}
                disabled={isLoading}
                testID="pencil"
              >
                {editTenants ? <Ionicons name="close" size={24} color="black" /> : <Ionicons name="pencil" size={24} color="black" />}
                
              </TouchableOpacity>
            </View>
            {tenantUsers.map((tenant, index) => (
              <RenderTenant
                key={tenant?.uid || index}
                tenant={tenant}
                editMode={editTenants}
                isLoading={isLoading}
                onRemove={removeTenant}
              />
            ))}
          </View>
          <TouchableOpacity
            style={appStyles.submitButton}
            onPress={handleClose}
            disabled={isLoading}
            testID="close-button"
          >
            <Text style={appStyles.submitButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Header>
  );
}

export default FlatDetails;