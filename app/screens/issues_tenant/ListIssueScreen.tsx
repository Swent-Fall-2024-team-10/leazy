import React, { useState, useEffect, useRef } from "react";
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
import { useNavigation, NavigationProp, useFocusEffect, useIsFocused } from "@react-navigation/native";
import { ReportStackParamList, MaintenanceRequest } from "../../../types/types"; // Assuming this also includes navigation types
import {
  updateMaintenanceRequest,
  getMaintenanceRequestsQuery,
  syncPendingRequests,
  getPendingRequests,
  createNews
} from "../../../firebase/firestore/firestore"; // Firestore functions
import { getAuth } from "firebase/auth";
import { onSnapshot, Timestamp } from "firebase/firestore";
import {
  getIssueStatusColor,
  getIssueStatusText,
} from "../../utils/StatusHelper";
import { appStyles, Color, IconDimension } from "../../../styles/styles";
import { Icon } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from '@react-native-community/netinfo';

interface IssueItemProps {
  issue: MaintenanceRequest;
  onStatusChange: (status: MaintenanceRequest["requestStatus"]) => void;
  onArchive: () => void;
  isArchived: boolean;
}

const IssueItem: React.FC<IssueItemProps> = ({
  issue,
  onStatusChange,
  onArchive,
  isArchived,
}) => {
  const navigation = useNavigation<NavigationProp<ReportStackParamList>>();
  const status = issue.requestStatus;

  return (
    <View style={styles.issueItem}>
      <View style={styles.issueContent}>

        <View style={styles.issueTextContainer}>
          <Text style={styles.issueText} numberOfLines={1}>{issue.requestTitle}</Text>
        </View >

        <View style={[styles.statusTextContainer, {backgroundColor: issue._isPending ? '#FFA500' : getIssueStatusColor(status)}]}>
           <Text style={styles.statusText}>Status: {issue._isPending ? 'Waiting to Sync' : getIssueStatusText(status)}</Text>
        </View>
      </View>
      
      {issue.requestStatus === 'completed' && !isArchived && (
        <TouchableOpacity onPress={onArchive} style={styles.archiveButton} testID="archiveButton">
          <Feather name="archive" size={24} color="#2C3E50" />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        testID="arrowButton"
        onPress={() =>
          navigation.navigate("IssueDetails", { requestID: issue.requestID })
        }
        style={styles.arrowButton}
      >
        <Icon name="chevron-right" size={IconDimension.mediumIcon} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const MaintenanceIssues = () => {
  const navigation = useNavigation<NavigationProp<ReportStackParamList>>();
  const [issues, setIssues] = useState<MaintenanceRequest[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const statusTrackingRef = useRef<Record<string, string>>({});
  const recentUpdatesRef = React.useRef<Record<string, number>>({});

  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  const getStatusUpdateMessage = (title: string, newStatus: string) => {
    switch (newStatus) {
      case 'inProgress':
        return `Work has begun on your maintenance request "${title}"`;
      case 'completed':
        return `Your maintenance request "${title}" has been completed`;
      case 'rejected':
        return `Your maintenance request "${title}" has been rejected`;
      case 'notStarted':
        return `Your maintenance request "${title}" has been opened`;
      default:
        return `Your maintenance request "${title}" has been updated to status: ${newStatus}`;
    }
  };
  
  const createStatusChangeNews = async (
    request: MaintenanceRequest,
    userId: string,
  ) => {
    try {
      console.log('Creating news item for request:', request.requestID);
      const newsItem = {
        maintenanceRequestID: `news_${request.requestID}_${Date.now()}`,
        title: 'Maintenance Request Status Update',
        content: getStatusUpdateMessage(
          request.requestTitle,
          request.requestStatus,
        ),
        type: request.requestStatus === 'rejected' ? 'urgent' : 'informational',
        isRead: false,
        createdAt: Timestamp.now(),
        UpdatedAt: Timestamp.now(),
        ReadAt: null,
        images: request.picture || [],
        ReceiverID: userId,
        SenderID: 'system',
      } as const;

      await createNews(newsItem);
      console.log('Successfully created news item');
    } catch (error) {
      console.error('Error creating status change news:', error);
    }
  };

  const handleStatusChange = async (
    requestID: string,
    newStatus: MaintenanceRequest['requestStatus'],
    title: string,
  ) => {
    if (!userId) return;
    try {
      await updateMaintenanceRequest(requestID, { requestStatus: newStatus });
    } catch (error) {
      console.error('Error updating issue status:', error);
    }
  };

  const hasRecentlyUpdated = (requestId: string, status: string) => {
    const key = `${requestId}_${status}`;
    const lastUpdate = recentUpdatesRef.current[key];
    const now = Date.now();

    if (lastUpdate && now - lastUpdate < 5000) {
      // Increased to 5 seconds
      console.log('Recent update detected, skipping');
      return true;
    }

    recentUpdatesRef.current[key] = now;
    console.log('No recent update found, proceeding');
    return false;
  };

  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchIssues();
      }
    }, [userId])
  );

    // Function to handle syncing - now returns a promise
  const handleSync = async () => {
    if (isSyncing) return;
    
    try {
      setIsSyncing(true);
      await syncPendingRequests();
      // Remove the onSnapshot here - we don't need it because fetchIssues already has one
      // await fetchIssues();
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Set up Firestore listener and merge with pending requests
  const fetchIssues = async () => {
    if (!userId) return () => {};

    try {
      const query = await getMaintenanceRequestsQuery(userId);
      let isInitialized = false;
      
      // Set up real-time listener for Firestore
      const unsubscribe = onSnapshot(query, 
        async (querySnapshot) => {
          if (!isInitialized) {
            querySnapshot.docs.forEach((doc) => {
              const data = doc.data() as MaintenanceRequest;
              if (data.requestID) {
                statusTrackingRef.current[data.requestID] = data.requestStatus;
              }
            });
            isInitialized = true;
          }

          // Process modified changes for status updates
          querySnapshot.docChanges().forEach((change) => {
            if (change.type !== 'modified') return;
            const newData = change.doc.data() as MaintenanceRequest;
            if (!newData.requestID) return;
            const oldStatus = statusTrackingRef.current[newData.requestID];
            const newStatus = newData.requestStatus;
            
            if (
              oldStatus &&
              oldStatus !== newStatus &&
              !hasRecentlyUpdated(newData.requestID, newStatus)
            ) {
              createStatusChangeNews(newData, userId);
              statusTrackingRef.current[newData.requestID] = newStatus;
            }
          });

          const firestoreIssues = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            requestID: doc.id
          })) as MaintenanceRequest[];

          // Get pending requests
      const pendingRequests = await getPendingRequests();
    
      // Ne garder que les pending requests qui n'ont pas leur équivalent dans Firestore
      const filteredPendingRequests = pendingRequests.filter(pending => 
        !firestoreIssues.some(fire => 
          fire.requestTitle === pending.requestTitle && 
          fire.requestDescription === pending.requestDescription &&
          fire.tenantId === pending.tenantId
        )
      );

      // Merge and set all issues
      setIssues([...firestoreIssues, ...filteredPendingRequests]);
        },
        (error) => {
          console.error("Firestore error:", error);
          // On error, just load pending requests
          getPendingRequests().then(setIssues);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up listeners:", error);
      // If initial setup fails, load pending requests
      const pendingRequests = await getPendingRequests();
      setIssues(pendingRequests);
      return () => {};  // return no-op cleanup si erreur
    }
  };

  useEffect(() => {
    if (!userId) return;

    // Set up network listener
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected);
      if (state.isConnected) {
        handleSync().catch(console.error);
      }
    });

    const setupListeners = async () => {
      const unsubscribeFirestore = await fetchIssues();
      return () => {
        unsubscribeFirestore();
        unsubscribeNetInfo();
      };
    };

    setupListeners();
  }, [userId]);

  const archiveIssue = (requestID: string) => {
    setIssues(
      issues.map((issue) =>
        issue.requestID === requestID
          ? { ...issue, requestStatus: "completed" }
          : issue
      )
    );
    updateMaintenanceRequest(requestID, { requestStatus: "completed" });
  };

  const filteredIssues = issues.filter(
    (issue) => issue.requestStatus !== "completed" || showArchived
  );

  return (
    <View style={styles.container}>
      <Header>
        <ScrollView style={styles.scrollView}>
          <View style={appStyles.scrollContainer}>
            <View style={styles.titleContainer}>
              <Text style={appStyles.screenHeader}>Maintenance Requests</Text>
            </View>

            <View style={styles.switchContainer}>
              <Text> Archived Issues</Text>
              <Switch
                style={[{ marginLeft: 8 }, {marginRight: 8}, {marginBottom: 8}, {marginTop: 8}]}
                value={showArchived}
                onValueChange={setShowArchived}
                testID="archiveSwitch"
              />
            </View>

            <View style={styles.viewBoxContainer}>
              {filteredIssues.map((issue) => (
                <IssueItem
                  key={issue.requestID}
                  issue={issue}
                  onStatusChange={(newStatus) => updateMaintenanceRequest(issue.requestID, { requestStatus: newStatus })}
                  onArchive={() => archiveIssue(issue.requestID)}
                  isArchived={issue.requestStatus === 'completed'}
                />
              ))}
            </View>

            <View style={[styles.viewBoxContainer, {height: 100}]}/>
          </View>
        </ScrollView>
      </Header>

      <TouchableOpacity
        testID="addButton"
        style={styles.addButton}
        onPress={() => navigation.navigate("Report")}
      >
        <Feather name="plus" size={IconDimension.smallIcon} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  statusTextContainer: {
    borderRadius: 25,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: '8%',
  },

  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
  },
  switchContainer: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    paddingTop: '6%',
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
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },

  issueTextContainer: {
    width: "100%",
    height: 32,
    borderRadius: 25,
    backgroundColor: Color.IssueTextBackground,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  issueText: {
    fontSize: 16,
    color: Color.TextInputText,
  },
  statusBadge: {
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 15,
  },
  statusText: {
    color: "white",
    fontSize: 12,
  },
  archiveButton: {
    marginTop: 5,
    marginLeft: 8,
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  addButton: {
    position: 'absolute',
    right: '6%',
    bottom: '3%',
    backgroundColor: Color.ButtonBackground,
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 1,
  },
  
  viewBoxContainer: {
    marginBottom: 80,
    paddingBottom: 80,
  },
  arrowButton: {
    marginLeft: '4%',
    width: '15%',
    height: '100%',
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MaintenanceIssues;