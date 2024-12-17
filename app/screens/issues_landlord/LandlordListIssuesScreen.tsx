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
import { NavigationProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Color } from '../../../styles/styles';
import {
  getIssueStatusColor,
  getIssueStatusText,
} from '../../../app/utils/StatusHelper';

// Shared constants
const FILTER_OPTIONS = {
  status: ['all', 'notStarted', 'inProgress', 'completed'],
};

// Reusable Filter Chip component
const FilterChip = ({ 
  label, 
  selected, 
  onPress, 
  testID 
}: { 
  label: string; 
  selected: boolean; 
  onPress: () => void; 
  testID?: string;
}) => (
  <TouchableOpacity
    testID={testID}
    style={[styles.filterChip, selected && styles.filterChipSelected]}
    onPress={onPress}
  >
    <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
      {label === 'all' ? 'All' : label}
    </Text>
  </TouchableOpacity>
);

// Reusable Filter Section component
const FilterSection = ({ 
  label, 
  children 
}: { 
  label: string; 
  children: React.ReactNode;
}) => (
  <View style={styles.filterSection}>
    <Text style={styles.filterLabel}>{label}:</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {children}
    </ScrollView>
  </View>
);

// Issue Item component
const IssueItem = ({ 
  issue, 
  onPress 
}: { 
  issue: MaintenanceRequest; 
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.issueItem}
    onPress={onPress}
    testID={`issue-${issue.requestID}`}
  >
    <View style={styles.issueContent}>
      <View style={styles.issueTextContainer}>
        <Text style={styles.issueText} numberOfLines={1}>
          {issue.requestTitle}
        </Text>
      </View>
      <View
        style={[
          styles.statusTextContainer,
          { backgroundColor: getIssueStatusColor(issue.requestStatus) },
        ]}
      >
        <Text style={styles.statusText}>
          Status: {getIssueStatusText(issue.requestStatus)}
        </Text>
      </View>
    </View>
    <View style={styles.arrowButton}>
      <Feather name="chevron-right" size={24} color="black" />
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

  const refreshIssues = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const allIssues: MaintenanceRequest[] = [];
        
        for (const residence of residences) {
          const tenantsForResidence = await Promise.all(
            residence.tenantIds.map(getTenant)
          );
          
          const validTenants = tenantsForResidence.filter((tenant): tenant is Tenant => tenant !== null);
          
          for (const tenant of validTenants) {
            const requests = await Promise.all(
              tenant.maintenanceRequests.map(getMaintenanceRequest)
            );
            
            allIssues.push(...requests.filter((req): req is MaintenanceRequest => req !== null));
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
    if (selectedStatus !== 'all' && issue.requestStatus !== selectedStatus) return false;
    if (selectedResidenceId !== 'all' && issue.residenceId !== selectedResidenceId) return false;
    return true;
  };

  const toggleResidenceExpansion = (residenceId: string) => {
    setExpandedResidences(prev =>
      prev.includes(residenceId)
        ? prev.filter(id => id !== residenceId)
        : [...prev, residenceId]
    );
  };

  const displayedResidences = selectedResidenceId === 'all'
    ? residences
    : residences.filter(residence => residence.id === selectedResidenceId);

  const resetFilters = () => {
    setSelectedStatus('all');
    setSelectedResidenceId('all');
    setFilterVisible(false);
  };

  return (
    <View style={styles.container}>
      <Header>
        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: '85%' }}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Maintenance issues</Text>
          </View>

          <View style={styles.switchContainer}>
            <Text>Archived issues</Text>
            <Switch
              style={styles.switch}
              value={showArchived}
              onValueChange={setShowArchived}
              testID="archivedSwitch"
            />
            <TouchableOpacity
              onPress={() => setFilterVisible(!filterVisible)}
              style={styles.filterButton}
              testID="filterSection"
            >
              <Feather name="filter" size={24} color="black" />
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>

          {filterVisible && (
            <View style={styles.filterOptions}>
              <Text style={styles.filterTitle}>Sort by...</Text>

              <FilterSection label="Status">
                {FILTER_OPTIONS.status.map(status => (
                  <FilterChip
                    key={status}
                    label={status}
                    selected={selectedStatus === status}
                    onPress={() => setSelectedStatus(status)}
                    testID={`filter-status-${status}`}
                  />
                ))}
              </FilterSection>

              <FilterSection label="Residence">
                <FilterChip
                  label="All Residences"
                  selected={selectedResidenceId === 'all'}
                  onPress={() => setSelectedResidenceId('all')}
                />
                {residences.map(residence => (
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
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.residenceList}>
            {displayedResidences.map(residence => (
              <View key={residence.id}>
                <TouchableOpacity
                  style={styles.residenceHeader}
                  onPress={() => toggleResidenceExpansion(residence.id)}
                  testID="residenceButton"
                >
                  <Text style={styles.residenceName}>{residence.residenceName}</Text>
                  <Feather
                    name={expandedResidences.includes(residence.id) ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="black"
                  />
                </TouchableOpacity>

                {expandedResidences.includes(residence.id) && (
                  <View style={styles.issuesContainer}>
                    {issues
                      .filter(issue => issue.residenceId === residence.id && filterIssues(issue))
                      .map(issue => (
                        <IssueItem
                          key={issue.requestID}
                          issue={issue}
                          onPress={() => navigation.navigate('IssueDetails', {
                            requestID: issue.requestID,
                            source: 'LandlordListIssues',
                          })}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
  },
  switch: {
    marginLeft: 8,
    marginRight: 48,
    marginBottom: 8,
    marginTop: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  filterText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2C3E50',
  },
  filterOptions: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  applyButton: {
    marginTop: 10,
    textAlign: 'center',
    color: '#2C3E50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  residenceList: {
    paddingHorizontal: 16,
  },
  residenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EDEDED',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  residenceName: {
    fontSize: 18,
    color: '#2C3E50',
  },
  issuesContainer: {
    paddingLeft: 16,
    marginTop: 8,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Color.IssueBackground,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Color.IssueBorder,
    width: 340,
    height: 110,
    marginBottom: '2%',
    padding: '4%',
  },
  issueContent: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  issueTextContainer: {
    width: '100%',
    height: 32,
    borderRadius: 25,
    backgroundColor: Color.IssueTextBackground,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  issueText: {
    fontSize: 16,
    color: Color.TextInputText,
  },
  statusTextContainer: {
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: '8%',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  arrowButton: {
    marginLeft: '4%',
    width: '15%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#EDEDED',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#2C3E50',
  },
  filterChipText: {
    color: '#2C3E50',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  resetButton: {
    backgroundColor: Color.ButtonBackground,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default LandlordListIssuesScreen;
