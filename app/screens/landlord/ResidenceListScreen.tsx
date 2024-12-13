import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { appStyles } from '../../../styles/styles';
import { ResidenceStackParamList, ResidenceWithId } from '../../../types/types';
import Header from '../../components/Header';
import ApartmentItem from '../../components/ApartmentItem';
import ResidenceItem from '../../components/ResidenceItem';
import { useProperty } from '../../context/LandlordContext';

const ResidencesListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ResidenceStackParamList>>();
  const [expandedResidence, setExpandedResidence] = useState<string | null>(null);
  const { residences, residenceMap, isLoading, error } = useProperty();

  // This useEffect will trigger whenever the data from useProperty changes
  useEffect(() => {
    // If residenceMap changes and the currently expanded residence no longer exists,
    // reset the expanded state
    if (expandedResidence && !residences.find(r => r.id === expandedResidence)) {
      setExpandedResidence(null);
    }
  }, [residences, residenceMap, isLoading, error, expandedResidence]);

  if (isLoading) {
    return (
      <Header>
        <View style={appStyles.screenContainer}>
          <Text>Loading...</Text>
        </View>
      </Header>
    );
  }

  if (error) {
    return (
      <Header>
        <View style={appStyles.screenContainer}>
          <Text>Error: {error.message}</Text>
        </View>
      </Header>
    );
  }

  const residenceElements = residences.map((residence: ResidenceWithId) => (
    <ResidenceItem
      key={residence.id}
      residence={residence}
      apartments={residenceMap.get(residence) || []}
      isExpanded={expandedResidence === residence.id}
      onPress={() => setExpandedResidence(
        expandedResidence === residence.id ? null : residence.id
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

export default ResidencesListScreen;