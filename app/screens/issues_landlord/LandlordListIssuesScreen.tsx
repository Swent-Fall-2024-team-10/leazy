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
  Residence,
  Tenant,
  RootStackParamList,
} from '../../../types/types';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useProperty } from '../../context/LandlordContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Color } from '../../..//styles/styles';
import {
  getIssueStatusColor,
  getIssueStatusText,
} from '../../../app/utils/StatusHelper';

// portions of this code were generated with chatGPT as an AI assistant

type ResidenceWithId = Residence & { id: string };

const LandlordListIssuesScreen: React.FC = () => {
  const [showArchived, setShowArchived] = useState(false);
  const [issues, setIssues] = useState<MaintenanceRequest[]>([]);
  const [expandedResidences, setExpandedResidences] = useState<string[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [tenants, setTenants] = useState<{ [residenceId: string]: Tenant[] }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedResidenceId, setSelectedResidenceId] = useState<string>('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { user } = useAuth();
  const { residences } = useProperty();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  if (!user) {
    throw new Error('User not found.');
  }

  const refreshIssues = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setIsLoading(true);
        const residenceTenants: { [residenceId: string]: Tenant[] } = {};
        const allIssues: MaintenanceRequest[] = [];

        for (const residence of residences) {
          const tenantsForResidence = await Promise.all(
            residence.tenantIds.map(async (tenantId) => {
              const tenant = await getTenant(tenantId);
              return tenant;
            }),
          );

          residenceTenants[residence.id] = tenantsForResidence.filter(
            (tenant): tenant is Tenant => tenant !== null,
          );

          for (const tenant of residenceTenants[residence.id]) {
            const requests = await Promise.all(
              tenant.maintenanceRequests.map(async (requestId) => {
                const request = await getMaintenanceRequest(requestId);
                if (request) {
                  return request;
                }
                return null;
              }),
            );

            const validRequests = requests.filter(
              (request): request is MaintenanceRequest => request !== null,
            );
            allIssues.push(...validRequests);
          }
        }

        setTenants(residenceTenants);
        setIssues(allIssues);
      } catch (error) {
        console.error('Error fetching issues data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();
  }, [residences, refreshTrigger]);

  useFocusEffect(
    React.useCallback(() => {
      refreshIssues();
    }, []),
  );

  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
  };

  const toggleResidenceExpansion = (residenceId: string) => {
    setExpandedResidences((prevExpanded) =>
      prevExpanded.includes(residenceId)
        ? prevExpanded.filter((id) => id !== residenceId)
        : [...prevExpanded, residenceId],
    );
  };

  const filterOptions = {
    status: ['all', 'notStarted', 'inProgress', 'completed'],
  };

  const filteredIssues = issues.filter((issue) => {
    if (!showArchived && issue.requestStatus === 'completed') {
      return false;
    }

    if (selectedStatus !== 'all' && issue.requestStatus !== selectedStatus) {
      return false;
    }

    if (
      selectedResidenceId !== 'all' &&
      issue.residenceId !== selectedResidenceId
    ) {
      return false;
    }

    return true;
  });

  // Filter residences based on selection
  const displayedResidences =
    selectedResidenceId === 'all'
      ? residences
      : residences.filter((residence) => residence.id === selectedResidenceId);

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
              testID='archivedSwitch'
            />
            <TouchableOpacity
              onPress={toggleFilter}
              style={styles.filterButton}
              testID='filterSection'
            >
              <Feather name='filter' size={24} color='black' />
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>

          {filterVisible && (
            <View style={styles.filterOptions}>
              <Text style={styles.filterTitle}>Sort by...</Text>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Status:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {filterOptions.status.map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterChip,
                        selectedStatus === status && styles.filterChipSelected,
                      ]}
                      onPress={() => setSelectedStatus(status)}
                      testID={`filter-status-${status}`}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedStatus === status &&
                            styles.filterChipTextSelected,
                        ]}
                      >
                        {status === 'all' ? 'All' : status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Residence:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      selectedResidenceId === 'all' &&
                        styles.filterChipSelected,
                    ]}
                    onPress={() => setSelectedResidenceId('all')}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedResidenceId === 'all' &&
                          styles.filterChipTextSelected,
                      ]}
                    >
                      All Residences
                    </Text>
                  </TouchableOpacity>
                  {residences.map((residence) => (
                    <TouchableOpacity
                      key={residence.id}
                      style={[
                        styles.filterChip,
                        selectedResidenceId === residence.id &&
                          styles.filterChipSelected,
                      ]}
                      onPress={() => setSelectedResidenceId(residence.id)}
                      testID={`filter-residence-${residence.id}`}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedResidenceId === residence.id &&
                            styles.filterChipTextSelected,
                        ]}
                      >
                        {residence.residenceName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => {
                  setSelectedStatus('all');
                  setSelectedResidenceId('all');
                  setFilterVisible(false);
                }}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.residenceList}>
            {displayedResidences.map((residence) => (
              <View key={residence.id}>
                <TouchableOpacity
                  style={styles.residenceHeader}
                  onPress={() => toggleResidenceExpansion(residence.id)}
                  testID='residenceButton'
                >
                  <Text style={styles.residenceName}>
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
                  <View style={styles.issuesContainer}>
                    {filteredIssues
                      .filter((issue) => issue.residenceId === residence.id)
                      .map((issue) => (
                        <TouchableOpacity
                          key={issue.requestID}
                          style={styles.issueItem}
                          onPress={() =>
                            navigation.navigate('IssueDetails', {
                              requestID: issue.requestID,
                              source: 'LandlordListIssues',
                            })
                          }
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
                                {
                                  backgroundColor: getIssueStatusColor(
                                    issue.requestStatus,
                                  ),
                                },
                              ]}
                            >
                              <Text style={styles.statusText}>
                                Status:{' '}
                                {getIssueStatusText(issue.requestStatus)}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.arrowButton}>
                            <Feather
                              name='chevron-right'
                              size={24}
                              color='black'
                            />
                          </View>
                        </TouchableOpacity>
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
