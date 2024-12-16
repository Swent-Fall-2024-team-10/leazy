import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Header from "../../components/Header";
import {
  getLandlord,
  getResidence,
  getTenant,
  getMaintenanceRequest,
} from "../../../firebase/firestore/firestore";

import {
  MaintenanceRequest,
  Landlord,
  Residence,
  Tenant,
  RootStackParamList,
} from "../../../types/types";
import { getAuth } from "firebase/auth";
import { useAuth } from "../../context/AuthContext";

// portions of this code were generated with chatGPT as an AI assistant

type ResidenceWithId = Residence & { id: string };

const LandlordListIssuesScreen: React.FC = () => {
  const [showArchived, setShowArchived] = useState(false);
  const [issues, setIssues] = useState<MaintenanceRequest[]>([]);
  const [expandedResidences, setExpandedResidences] = useState<string[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [residences, setResidences] = useState<ResidenceWithId[]>([]);
  const [tenants, setTenants] = useState<{ [residenceId: string]: Tenant[] }>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedResidenceId, setSelectedResidenceId] = useState<string>("all");

  const { user } = useAuth();
  if (!user) {
    throw new Error("User not found.");
  }
  const landlordId = user.uid;

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setIsLoading(true);

        const landlord = await getLandlord(landlordId);
        if (!landlord) {
          throw new Error("Landlord not found");
        }

        if (landlord.residenceIds.length > 0) {
          const fetchedResidences: ResidenceWithId[] = [];
          const residenceTenants: { [residenceId: string]: Tenant[] } = {};
          const allIssues: MaintenanceRequest[] = [];

          for (const residenceId of landlord.residenceIds) {
            const residence = await getResidence(residenceId);
            if (residence) {
              fetchedResidences.push({
                ...residence,
                id: residenceId,
              });

              const tenantsForResidence = await Promise.all(
                residence.tenantIds.map(async (tenantId) => {
                  const tenant = await getTenant(tenantId);
                  return tenant;
                })
              );

              residenceTenants[residenceId] = tenantsForResidence.filter(
                (tenant): tenant is Tenant => tenant !== null
              );

              for (const tenant of residenceTenants[residenceId]) {
                const requests = await Promise.all(
                  tenant.maintenanceRequests.map(async (requestId) => {
                    const request = await getMaintenanceRequest(requestId);
                    if (request) {
                      return request;
                    }
                    return null;
                  })
                );

                const validRequests = requests.filter(
                  (request): request is MaintenanceRequest => request !== null
                );
                allIssues.push(...validRequests);
              }
            }
          }

          setResidences(fetchedResidences);
          setTenants(residenceTenants);
          setIssues(allIssues);
        }
      } catch (error) {
        console.error("Error fetching landlord data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssues();
  }, [landlordId]);

  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
  };

  const toggleResidenceExpansion = (residenceId: string) => {
    setExpandedResidences((prevExpanded) =>
      prevExpanded.includes(residenceId)
        ? prevExpanded.filter((id) => id !== residenceId)
        : [...prevExpanded, residenceId]
    );
  };

  const filterOptions = {
    status: ["all", "notStarted", "inProgress", "completed"],
  };

  const filteredIssues = issues.filter((issue) => {
    if (!showArchived && issue.requestStatus === "completed") {
      return false;
    }

    if (selectedStatus !== "all" && issue.requestStatus !== selectedStatus) {
      return false;
    }

    if (
      selectedResidenceId !== "all" &&
      issue.residenceId !== selectedResidenceId
    ) {
      return false;
    }

    return true;
  });

  return (
    <View style={styles.container}>
      <Header>
        <ScrollView style={styles.scrollView}>
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
              onPress={toggleFilter}
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
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedStatus === status &&
                            styles.filterChipTextSelected,
                        ]}
                      >
                        {status === "all" ? "All" : status}
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
                      selectedResidenceId === "all" &&
                        styles.filterChipSelected,
                    ]}
                    onPress={() => setSelectedResidenceId("all")}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedResidenceId === "all" &&
                          styles.filterChipTextSelected,
                      ]}
                    >
                      All
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
                  setSelectedStatus("all");
                  setSelectedResidenceId("all");
                  setFilterVisible(false);
                }}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.residenceList}>
            {residences.map((residence) => (
              <View key={residence.id}>
                <TouchableOpacity
                  style={styles.residenceItem}
                  onPress={() => toggleResidenceExpansion(residence.id)}
                  testID="residenceButton"
                >
                  <Text style={styles.residenceText}>
                    Residence {residence.street}
                  </Text>
                  <Feather
                    name={
                      expandedResidences.includes(residence.id)
                        ? "chevron-up"
                        : "chevron-down"
                    }
                    size={24}
                    color="black"
                  />
                </TouchableOpacity>

                {expandedResidences.includes(residence.id) && (
                  <View style={styles.issueList}>
                    {filteredIssues
                      .filter((issue) => issue.residenceId === residence.id)
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
  scrollView: {
    flex: 1,
    paddingTop: 15,
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
  switch: {
    marginLeft: 8,
    marginRight: 48,
    marginBottom: 8,
    marginTop: 8,
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
    marginTop: 8,
  },
  issueItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
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
    fontWeight: "500",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
    backgroundColor: "#EDEDED",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: "#2C3E50",
  },
  filterChipText: {
    color: "#2C3E50",
  },
  filterChipTextSelected: {
    color: "#FFFFFF",
  },
  resetButton: {
    backgroundColor: "#E74C3C",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default LandlordListIssuesScreen;
