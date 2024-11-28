import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { appStyles, residenceManagementListStyles, Color} from '@/styles/styles';
import { Residence, ResidenceStackParamList, Apartment } from '@/types/types';
import Header from '@/app/components/Header';
import ApartmentItem from '@/app/components/ApartmentItem';
import ResidenceItem  from '@/app/components/ResidenceItem';

// Mock Data
const mockResidences: Residence[] = [
  {
    residenceId: 'R1',
    street: 'Maple Avenue',
    number: '123',
    city: 'Springfield',
    canton: 'VD',
    zip: '1000',
    country: 'Switzerland',
    landlordId: 'L123',
    tenantIds: ['T1', 'T2', 'T3', 'T4', 'T5'],
    laundryMachineIds: ['LM1', 'LM2'],
    apartments: ['A1', 'A2', 'A3'],
    tenantCodesID: ['TC1', 'TC2', 'TC3'],
    situationReportLayout: []
  },
  {
    residenceId: 'R2',
    street: 'Oak Street',
    number: '456',
    city: 'Springfield',
    canton: 'VD',
    zip: '1000',
    country: 'Switzerland',
    landlordId: 'L123',
    tenantIds: ['T6', 'T7', 'T8', 'T9'],
    laundryMachineIds: ['LM3', 'LM4'],
    apartments: ['A4', 'A5'],
    tenantCodesID: ['TC4', 'TC5'],
    situationReportLayout: []
  }
];

const mockApartments: Apartment[] = [
  {
    apartmentId: 'A1',
    residenceId: 'R1',
    tenants: ['T1', 'T2'],
    maintenanceRequests: ['MR1', 'MR2'],
    situationReportId: 'none'
  },
  {
    apartmentId: 'A2',
    residenceId: 'R1',
    tenants: ['T3'],
    maintenanceRequests: [],
    situationReportId: 'none'
  },
  {
    apartmentId: 'A3',
    residenceId: 'R1',
    tenants: ['T4', 'T5'],
    maintenanceRequests: ['MR3'],
    situationReportId: 'none'
  },
  {
    apartmentId: 'A4',
    residenceId: 'R2',
    tenants: ['T6', 'T7'],
    maintenanceRequests: ['MR4'],
    situationReportId: 'none'
  }
];

const mockResidenceMap = new Map<Residence, Apartment[]>();
mockResidences.forEach(residence => {
  const residenceApartments = mockApartments.filter(apt =>
    apt.residenceId === residence.residenceId
  );
  mockResidenceMap.set(residence, residenceApartments);
});

// Main Screen Component
const ResidencesListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ResidenceStackParamList>>();
  const [expandedResidence, setExpandedResidence] = useState<string | null>(null);

  const residenceElements = Array.from(mockResidenceMap.entries()).map(([residence, apartments]) => (
    <ResidenceItem
      key={residence.residenceId}
      residence={residence}
      apartments={apartments}
      isExpanded={expandedResidence === residence.residenceId}
      onPress={() => setExpandedResidence(
        expandedResidence === residence.residenceId ? null : residence.residenceId
      )}
      navigation={navigation}
    />
  ));

  return (
    <Header>
      <View testID="residences-screen" style={appStyles.screenContainer}>
        <View style={appStyles.residenceHeaderContainer}>
          <Text testID="screen-title" style={appStyles.residenceTitle}>
            Your Residences
          </Text>
        </View>
        
        <ScrollView
          testID="residences-scroll-view"
          style={appStyles.residenceScrollView}
          contentContainerStyle={appStyles.residenceScrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {residenceElements}
        </ScrollView>

        <Pressable
          testID="add-residence-button"
          style={({ pressed }) => [
            appStyles.addResidenceButton,
            pressed && { opacity: Platform.OS === 'ios' ? 0.8 : 1, transform: [{ scale: 0.98 }] }
          ]}
          onPress={() => navigation.navigate("CreateResidence")}
        >
          <Feather name="plus" size={32} color="#FFFFFF" />
        </Pressable>
      </View>
    </Header>
  );
};
export {ApartmentItem, ResidenceItem };

export default ResidencesListScreen;