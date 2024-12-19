import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Header from '../../components/Header';
import {
  getTenant,
  getMaintenanceRequest,
} from '../../../firebase/firestore/firestore';
import {
  MaintenanceRequest,
  Tenant,
  RootStackParamList,
} from '../../../types/types';
import { useAuth } from '../../context/AuthContext';
import { useProperty } from '../../context/LandlordContext';
import {
  NavigationProp,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import { Color } from '../../../styles/styles';
import {
  getIssueStatusColor,
  getIssueStatusText,
} from '../../../app/utils/StatusHelper';
import { stylesForLandlordListIssues } from '../../../styles/styles';
// Shared constants
const FILTER_OPTIONS = {
  status: ['all', 'notStarted', 'inProgress', 'completed'],
};

// Reusable Filter Chip component
const FilterChip = ({
  label,
  selected,
  onPress,
  testID,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}) => (
  <TouchableOpacity
    testID={testID}
    style={[
      stylesForLandlordListIssues.filterChip,
      selected && stylesForLandlordListIssues.filterChipSelected,
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        stylesForLandlordListIssues.filterChipText,
        selected && stylesForLandlordListIssues.filterChipTextSelected,
      ]}
    >
      {label === 'all' ? 'All' : label}
    </Text>
  </TouchableOpacity>
);

// Reusable Filter Section component
const FilterSection = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <View style={stylesForLandlordListIssues.filterSection}>
    <Text style={stylesForLandlordListIssues.filterLabel}>{label}:</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {children}
    </ScrollView>
  </View>
);

// Issue Item component
const IssueItem = ({
  issue,
  onPress,
}: {
  issue: MaintenanceRequest;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={stylesForLandlordListIssues.issueItem}
    onPress={onPress}
    testID={`issue-${issue.requestID}`}
  >
    <View style={stylesForLandlordListIssues.issueContent}>
      <View style={stylesForLandlordListIssues.issueTextContainer}>
        <Text style={stylesForLandlordListIssues.issueText} numberOfLines={1}>
          {issue.requestTitle}
        </Text>
      </View>
      <View
        style={[
          stylesForLandlordListIssues.statusTextContainer,
          { backgroundColor: getIssueStatusColor(issue.requestStatus) },
        ]}
      >
        <Text style={stylesForLandlordListIssues.statusText}>
          Status: {getIssueStatusText(issue.requestStatus)}
        </Text>
      </View>
    </View>
    <View style={stylesForLandlordListIssues.arrowButton}>
      <Feather name='chevron-right' size={24} color='black' />
    </View>
  </TouchableOpacity>
);

const LandlordListIssuesScreen: React.FC = () => {
  const [showArchived, setShowArchived] = useState(false);
  const [issues, setIssues] = useState<MaintenanceRequest[]>([]);
  const [expandedResidences, setExpandedResidences] = useState<string[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedResidenceId, setSelectedResidenceId] = useState<string>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { user } = useAuth();
  const { residences } = useProperty();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  if (!user) {
    throw new Error('User not found.');
  }

  const refreshIssues = () => setRefreshTrigger((prev) => prev + 1);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const allIssues: MaintenanceRequest[] = [];

        for (const residence of residences) {
          const tenantsForResidence = await Promise.all(
            residence.tenantIds.map(getTenant),
          );

          const validTenants = tenantsForResidence.filter(
            (tenant): tenant is Tenant => tenant !== null,
          );

          for (const tenant of validTenants) {
            const requests = await Promise.all(
              tenant.maintenanceRequests.map(getMaintenanceRequest),
            );

            allIssues.push(
              ...requests.filter(
                (req): req is MaintenanceRequest => req !== null,
              ),
            );
          }
        }

        setIssues(allIssues);
      } catch (error) {
        console.error('Error fetching issues data:', error);
      }
    };

    fetchIssues();
  }, [residences, refreshTrigger]);

  useFocusEffect(React.useCallback(refreshIssues, []));

  const filterIssues = (issue: MaintenanceRequest) => {
    if (!showArchived && issue.requestStatus === 'completed') return false;
    if (selectedStatus !== 'all' && issue.requestStatus !== selectedStatus)
      return false;
    if (
      selectedResidenceId !== 'all' &&
      issue.residenceId !== selectedResidenceId
    )
      return false;
    return true;
  };

  const toggleResidenceExpansion = (residenceId: string) => {
    setExpandedResidences((prev) =>
      prev.includes(residenceId)
        ? prev.filter((id) => id !== residenceId)
        : [...prev, residenceId],
    );
  };

  const displayedResidences =
    selectedResidenceId === 'all'
      ? residences
      : residences.filter((residence) => residence.id === selectedResidenceId);

  const resetFilters = () => {
    setSelectedStatus('all');
    setSelectedResidenceId('all');
    setFilterVisible(false);
  };

  return (
    <View style={stylesForLandlordListIssues.container}>
      <Header>
        <ScrollView
          style={stylesForLandlordListIssues.scrollView}
          contentContainerStyle={{ paddingBottom: '85%' }}
        >
          <View style={stylesForLandlordListIssues.titleContainer}>
            <Text style={stylesForLandlordListIssues.title}>
              Maintenance issues
            </Text>
          </View>

          <View style={stylesForLandlordListIssues.switchContainer}>
            <Text>Archived issues</Text>
            <Switch
              style={stylesForLandlordListIssues.switch}
              value={showArchived}
              onValueChange={setShowArchived}
              testID='archivedSwitch'
            />
            <TouchableOpacity
              onPress={() => setFilterVisible(!filterVisible)}
              style={stylesForLandlordListIssues.filterButton}
              testID='filterSection'
            >
              <Feather name='filter' size={24} color='black' />
              <Text style={stylesForLandlordListIssues.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>

          {filterVisible && (
            <View style={stylesForLandlordListIssues.filterOptions}>
              <Text style={stylesForLandlordListIssues.filterTitle}>
                Sort by...
              </Text>

              <FilterSection label='Status'>
                {FILTER_OPTIONS.status.map((status) => (
                  <FilterChip
                    key={status}
                    label={status}
                    selected={selectedStatus === status}
                    onPress={() => setSelectedStatus(status)}
                    testID={`filter-status-${status}`}
                  />
                ))}
              </FilterSection>

              <FilterSection label='Residence'>
                <FilterChip
                  label='All Residences'
                  selected={selectedResidenceId === 'all'}
                  onPress={() => setSelectedResidenceId('all')}
                />
                {residences.map((residence) => (
                  <FilterChip
                    key={residence.id}
                    label={residence.residenceName}
                    selected={selectedResidenceId === residence.id}
                    onPress={() => setSelectedResidenceId(residence.id)}
                    testID={`filter-residence-${residence.id}`}
                  />
                ))}
              </FilterSection>

              <TouchableOpacity
                style={stylesForLandlordListIssues.resetButton}
                onPress={resetFilters}
              >
                <Text style={stylesForLandlordListIssues.resetButtonText}>
                  Reset Filters
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={stylesForLandlordListIssues.residenceList}>
            {displayedResidences.map((residence) => (
              <View key={residence.id}>
                <TouchableOpacity
                  style={stylesForLandlordListIssues.residenceHeader}
                  onPress={() => toggleResidenceExpansion(residence.id)}
                  testID='residenceButton'
                >
                  <Text style={stylesForLandlordListIssues.residenceName}>
                    {residence.residenceName}
                  </Text>
                  <Feather
                    name={
                      expandedResidences.includes(residence.id)
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={24}
                    color='black'
                  />
                </TouchableOpacity>

                {expandedResidences.includes(residence.id) && (
                  <View style={stylesForLandlordListIssues.issuesContainer}>
                    {issues
                      .filter(
                        (issue) =>
                          issue.residenceId === residence.id &&
                          filterIssues(issue),
                      )
                      .map((issue) => (
                        <IssueItem
                          key={issue.requestID}
                          issue={issue}
                          onPress={() =>
                            navigation.navigate('IssueDetails', {
                              requestID: issue.requestID,
                              source: 'LandlordListIssues',
                            })
                          }
                        />
                      ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </Header>
    </View>
  );
};

export default LandlordListIssuesScreen;
