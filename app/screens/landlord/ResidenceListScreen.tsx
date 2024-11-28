import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { appStyles, residenceManagementListStyles, Color} from '@/styles/styles';
import { Residence, ResidenceStackParamList, Apartment } from '@/types/types';
import Header from '@/app/components/Header';
import CustomButton from '@/app/components/CustomButton';
import CustomTextField from '@/app/components/CustomTextField';


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
  },
  {
    residenceId: 'R3',
    street: 'Pine Road',
    number: '789',
    city: 'Springfield',
    canton: 'VD',
    zip: '1000',
    country: 'Switzerland',
    landlordId: 'L123',
    tenantIds: ['T10', 'T11', 'T12'],
    laundryMachineIds: ['LM5'],
    apartments: ['A6', 'A7', 'A8'],
    tenantCodesID: ['TC6', 'TC7', 'TC8'],
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
    maintenanceRequests: ['MR4', 'MR5', 'MR6'],
    situationReportId: 'none'
  },
  {
    apartmentId: 'A5',
    residenceId: 'R2',
    tenants: ['T8', 'T9'],
    maintenanceRequests: [],
    situationReportId: 'none'
  },
  {
    apartmentId: 'A6',
    residenceId: 'R3',
    tenants: ['T10'],
    maintenanceRequests: [],
    situationReportId: 'none'
  },
  {
    apartmentId: 'A7',
    residenceId: 'R3',
    tenants: ['T11'],
    maintenanceRequests: ['MR7'],
    situationReportId: 'none'
  },
  {
    apartmentId: 'A8',
    residenceId: 'R3',
    tenants: ['T12'],
    maintenanceRequests: [],
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

type ApartmentItemProps = {
  apartment: Apartment;
  editMode: boolean;
  navigation: NavigationProp<ResidenceStackParamList>;
};

function ApartmentItem({ apartment, editMode, navigation }: ApartmentItemProps) {

  return (
      <Pressable
        style={({pressed}) => ({
          width:'100%', 
          opacity: pressed ? 0.6 : 1, 
          backgroundColor: pressed ? '#bdbad4' : '#D6D3F0', 
          borderRadius: 4,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal:10,
          marginVertical: 4
        })}
        onPress={() => navigation.navigate('FlatDetails', { apartment })}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
      >
        <Text style={appStyles.flatText}>
          {apartment.apartmentId} ({apartment.tenants.length} tenants)
        </Text>
        <View style={{ flex: 1 }} />
        <Feather name={editMode ? "trash-2" : "chevron-right"} size={20} color="#666666" onPress={() => {
          editMode ? console.log("delete apartmenet") : navigation.navigate('FlatDetails', { apartment })
        }}/>
      </Pressable>
  );
}

type ResidenceItemProps = {
  residence: Residence;
  apartments: Apartment[];
  isExpanded: boolean;
  navigation: NavigationProp<ResidenceStackParamList>;
  onPress: () => void;
};

function ResidenceItem({ residence, apartments, isExpanded, onPress, navigation }: ResidenceItemProps) {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [apartmentSearch, setApartmentSearch] = useState('');
  const [addAppartement, setAddApartement] = useState<boolean>(false);

  const filteredApartments = apartments.filter(apt => 
    apt.apartmentId.toLowerCase().includes(apartmentSearch.toLowerCase())
  );

  const handleEditPress = () => {
    setEditMode(!editMode);
  };

  return (
    <View style={appStyles.residenceContainer}>
      <Pressable
        style={({ pressed }) => [
          appStyles.residenceButton,
          isExpanded && appStyles.expandedResidence,
          { opacity: pressed ? 0.7 : 1 }
        ]}
        onPress={onPress}
        android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
      >
        <Text style={appStyles.residenceText}>
          {residence.street} {residence.number}
        </Text>
        
        <View style={appStyles.residenceIconContainer}>
          {isExpanded && (
            <Pressable
              onPress={handleEditPress}
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
      </Pressable>

      {isExpanded && apartments.length > 0 && (
        <View style={appStyles.flatsContainer}>
          <View style={{
            backgroundColor: '#D6D3F0',
            borderRadius: 30, 
            marginBottom:10,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            borderColor: '#666666',
            borderWidth: 1,
            height: 36,
            alignContent: 'center',
            width: '40%'
          }}>
            <Feather name="search" size={16} color="#666666" />
            <TextInput
              placeholder="Search"
              value={apartmentSearch}
              onChangeText={setApartmentSearch}
              style={{
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 8,
                fontSize: 14,
              }}
              placeholderTextColor="#999999"
            />
            {apartmentSearch !== '' && (
              <Pressable 
                onPress={() => setApartmentSearch('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={16} color="#666666" />
              </Pressable>
            )}
          </View>
          {isExpanded && editMode && (
          addAppartement ? 
          <View style={{width:'90%', height:80, backgroundColor:'white', borderRadius:18,  paddingVertical:20, paddingHorizontal:10}}>
            <TextInput style={{width:'60%', borderWidth:1, borderRadius:20, height:30, backgroundColor: Color.TextInputBackground, paddingHorizontal:10, fontSize:14}} placeholder='Apartment name'/>
            <Feather name="check" style={{alignSelf:'flex-end', marginBottom:10}} size={20} onPress={() => setAddApartement(false)}/>
          </View> : 
        <Pressable 
        style={({ pressed }) => [
          residenceManagementListStyles.addApartmentButton,
          { opacity: pressed ? 0.8 : 1 }
        ]}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
        onPress={() => setAddApartement(true)}
      >
        <Text style={residenceManagementListStyles.addApartmentText}>Add an apartment</Text>
        <Feather name="plus" size={14} color='#333333'/>
      </Pressable>
      )}
          
          {filteredApartments.map((apartment) => (
            <ApartmentItem 
              key={apartment.apartmentId} 
              apartment={apartment}
              editMode={editMode}
              navigation={navigation}
            />
          ))}
          
          {filteredApartments.length === 0 && (
            <Text style={{
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
}

function ResidencesListScreen() {
  const navigation = useNavigation<NavigationProp<ResidenceStackParamList>>();
  const [expandedResidence, setExpandedResidence] = useState<string | null>(null);

  const residenceElements: JSX.Element[] = [];

  mockResidenceMap.forEach((apartments, residence) => {
    residenceElements.push(
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
    );
  });

  return (
    <Header>
      <View style={appStyles.screenContainer}>
        <View style={appStyles.residenceHeaderContainer}>
          <Text style={appStyles.residenceTitle}>Your Residences</Text>
        </View>
        <ScrollView 
          style={appStyles.residenceScrollView}
          contentContainerStyle={appStyles.residenceScrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {residenceElements}
          <View style={appStyles.residenceBottomSpacing} />
        </ScrollView>
        <Pressable 
          style={({ pressed }) => [
            appStyles.addResidenceButton,
            pressed && { opacity: Platform.OS === 'ios' ? 0.8 : 1, transform: [{ scale: 0.98 }] }
          ]}
          onPress={() => navigation.navigate("CreateResidence")}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', radius: 28 }}
        >
          <Feather name="plus" size={32} color="#FFFFFF" />
        </Pressable>
      </View>
    </Header>
  );
}

export default ResidencesListScreen;