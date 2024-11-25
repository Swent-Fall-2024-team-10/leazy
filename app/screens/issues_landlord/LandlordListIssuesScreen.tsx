import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Header from '../../components/Header';
import { getLandlord, getResidence, getTenant, getMaintenanceRequest } from '../../../firebase/firestore/firestore';
import { MaintenanceRequest, Landlord, Residence, Tenant, RootStackParamList} from '../../../types/types';
import { getAuth } from 'firebase/auth';

// portions of this code were generated with chatGPT as an AI assistant

const LandlordListIssuesScreen: React.FC = () => {
  const [showArchived, setShowArchived] = useState(false);
  const [issues, setIssues] = useState<MaintenanceRequest[]>([]);
  const [expandedResidences, setExpandedResidences] = useState<string[]>([]);
  const [filterVisible, setFilterVisible] = useState(false); // Control the visibility of the filter
  const [residences, setResidences] = useState<Residence[]>([]); // Store residence data
  const [tenants, setTenants] = useState<{ [residenceId: string]: Tenant[] }>(
    {}
  ); // Store tenants data by residence

  const { user } = useAuth();
  if (!user) {
    throw new Error("User not found.");
  }
  const landlordId = user.uid;

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        if (!landlordId) {
          console.error("Landlord is not logged in");
          return;
        }

        // Fetch tenant data and maintenance requests for that tenant
        const landlord = await getLandlord(landlordId);
        if (!landlord) {
          console.error("Landlord not found");
          return;
        }

        if (landlord && landlord.residenceIds.length > 0) {
          const fetchedResidences: Residence[] = [];
          const residenceTenants: { [residenceId: string]: Tenant[] } = {};

          // Fetch each residence and its tenants
          for (const residenceId of landlord.residenceIds) {
            console.log("residenceId: ", residenceId);
            const residence: Residence | null = await getResidence(residenceId);
            if (residence) {
              fetchedResidences.push(residence);
              console.log("fetchedResidences: ", fetchedResidences);

              // Fetch tenants for each residence
              const tenantsForResidence = await Promise.all(
                residence.tenantIds.map(async (tenantId) => {
                  const tenant = await getTenant(tenantId);
                  return tenant ? tenant : null;
                })
              );

              console.log("tenantsForResidence: ", tenantsForResidence);

              // Filter out any null tenants
              residenceTenants[residenceId] = tenantsForResidence.filter(
                (tenant): tenant is Tenant => tenant !== null
              );
              console.log("after filter: ", residenceTenants);
            }
          }

          setResidences(fetchedResidences);
          setTenants(residenceTenants);

          // Fetch maintenance requests for each tenant
          const allIssues: MaintenanceRequest[] = [];
          for (const residenceId in residenceTenants) {
            const tenants = residenceTenants[residenceId];
            console.log("tenants in this residence: ", tenants);
            for (const tenant of tenants) {
              const requests = await Promise.all(
                tenant.maintenanceRequests.map(async (requestId) => {
                  const request = await getMaintenanceRequest(requestId);
                  if (request) {
                    const residence = await getResidence(request.residenceId);
                    return {
                      ...request,
                      residenceId: residence
                        ? residence.residenceId
                        : request.residenceId, // Update the residenceId
                    };
                  }
                  return null;
                })
              );
              console.log("list of request for a tenant: ", requests);
              // Filter out null requests
              const validRequests = requests.filter(
                (request): request is MaintenanceRequest => request !== null
              );
              allIssues.push(...validRequests);
            }
          }
          setIssues(allIssues);
        }
      } catch (error) {
        console.error("Error fetching landlord data:", error);
      }
    };

    fetchIssues();
  }, []);

  // Toggle the visibility of the filter section
  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
  };

  console.log("expandedResidences: ", expandedResidences);
  console.log("residences: ", residences);

  // Toggle residence expansion
  const toggleResidenceExpansion = (residenceId: string) => {
    if (expandedResidences.includes(residenceId)) {
      setExpandedResidences(
        expandedResidences.filter((id) => id !== residenceId)
      );
    } else {
      setExpandedResidences([...expandedResidences, residenceId]);
    }
  };

  // Filter the issues based on archived state
  const filteredIssues = issues.filter(
    (issue) => issue.requestStatus !== "completed" || showArchived
  );

  return (
    <View style={styles.container}>
      <Header>
        <ScrollView style={styles.scrollView}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Maintenance issues</Text>
          </View>

          {/* Archived switch */}
          <View style={styles.switchContainer}>
            <Text>Archived issues</Text>
            <Switch style={[{ marginLeft: 8 }, {marginRight: 48}, 
                {marginBottom: 8}, {marginTop: 8}]}
                value={showArchived} onValueChange={setShowArchived} testID='archivedSwitch' />
            {/* Filter button */}
            <TouchableOpacity
              onPress={toggleFilter}
              style={styles.filterButton}
            >
              <Feather name="filter" size={24} color="black" />
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Expandable Filter Section */}
          {filterVisible && (
            <View style={styles.filterOptions}>
              <Text>Filter by...</Text>
              <Text>Status</Text>
              <Text>Sort by...</Text>
              {/* Add filter options as needed */}
              <TouchableOpacity onPress={toggleFilter}>
                <Text style={styles.applyButton}>Apply</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Residences and issues */}
          <View style={styles.residenceList}>
            {residences.map((residence) => (
              <View key={residence.residenceId}>
                <TouchableOpacity
                  style={styles.residenceItem}
                  onPress={() => toggleResidenceExpansion(residence.residenceId)}
                  testID='residenceButton'
                >
                  <Text style={styles.residenceText}>
                    Residence {residence.street}
                  </Text>
                  <Feather
                    name={
                      expandedResidences.includes(residence.residenceId)
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={24}
                    color="black"
                  />
                </TouchableOpacity>

                {/* If expanded, show the related issues */}
                {expandedResidences.includes(residence.residenceId) && (
                  <View style={styles.issueList}>
                    {filteredIssues
                      .filter(
                        (issue) => issue.residenceId == residence.residenceId
                      )
                      .map((issue) => (
                        <View key={issue.requestID} style={styles.issueItem}>
                          <Text>{issue.requestTitle}</Text>
                          <View
                            style={[
                              styles.statusBadge,
                              {
                                backgroundColor:
                                  issue.requestStatus === "inProgress"
                                    ? "#F39C12"
                                    : issue.requestStatus === "notStarted"
                                    ? "#E74C3C"
                                    : "#2ECC71",
                              },
                            ]}
                          >
                            <Text style={styles.statusText}>
                              Status: {issue.requestStatus}
                            </Text>
                          </View>
                        </View>
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
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
  },
  switchContainer: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  filterText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#2C3E50",
  },
  filterOptions: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginBottom: 10,
  },
  applyButton: {
    marginTop: 10,
    textAlign: "center",
    color: "#2C3E50",
    fontSize: 16,
    fontWeight: "bold",
  },
  residenceList: {
    paddingHorizontal: 16,
  },
  residenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EDEDED",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  residenceText: {
    fontSize: 18,
    color: "#2C3E50",
  },
  issueList: {
    paddingLeft: 16,
  },
  issueItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  statusBadge: {
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
    paddingTop: 15,
  },
});

export default LandlordListIssuesScreen;
