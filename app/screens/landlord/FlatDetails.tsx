import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ResidenceStackParamList } from '@/types/types';
import Header from '../../components/Header';
import { appStyles, Color } from '../../../styles/styles';

function FlatDetails() {
  const navigation = useNavigation<NavigationProp<ResidenceStackParamList>>();
  const route = useRoute<RouteProp<ResidenceStackParamList>>();
  const apartment = route.params;

  return (
    <Header>
      <ScrollView style={appStyles.screenContainer}>
        <View style={appStyles.flatCard}>
          <Text style={appStyles.flatTitle}>Flat Details</Text>
          
          <View style={appStyles.idContainer}>
            <Text style={appStyles.idText}>
              Apartment ID: {apartment?.apartment.apartmentName}
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
                List Of Tenants ({apartment?.apartment.tenants.length})
              </Text>
              <TouchableOpacity>
                <Ionicons name="pencil" size={20} color={Color.TextInputPlaceholder} />
              </TouchableOpacity>
            </View>

            {apartment?.apartment.tenants.map((tenant, index) => (
              <View key={index} style={appStyles.tenantRow}>
                <View style={appStyles.tenantNameContainer}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={Color.TextInputPlaceholder} 
                  />
                  <Text style={appStyles.tenantName}>Tenant {index + 1}</Text>
                </View>
                <Text style={appStyles.tenantId}>{tenant}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={appStyles.submitButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={appStyles.submitButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Header>
  );
}

export default FlatDetails;