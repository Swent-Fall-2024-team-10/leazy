import React, { useState, useEffect } from 'react';
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
import { useNavigation, NavigationProp, useFocusEffect } from "@react-navigation/native";
import { ReportStackParamList, MaintenanceRequest } from "../../../types/types";
import {
  updateMaintenanceRequest,
  getMaintenanceRequestsQuery,
  syncPendingRequests,
  getPendingRequests,
  createNews
} from "../../../firebase/firestore/firestore";
import { getAuth } from "firebase/auth";
import { onSnapshot, Timestamp } from 'firebase/firestore';
import {
  getIssueStatusColor,
  getIssueStatusText,
} from "../../utils/StatusHelper";
import { appStyles, Color, IconDimension } from "../../../styles/styles";
import { Icon } from "react-native-elements";
import NetInfo from '@react-native-community/netinfo';

interface IssueItemProps {
  issue: MaintenanceRequest;
  onStatusChange: (status: MaintenanceRequest['requestStatus']) => void;
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
          <Text style={styles.issueText} numberOfLines={1}>
            {issue.requestTitle}
          </Text>
        </View>

        <View style={[styles.statusTextContainer, {backgroundColor: issue._isPending ? '#FFA500' : getIssueStatusColor(status)}]}>
           <Text style={styles.statusText}>Status: {issue._isPending ? 'Waiting to Sync' : getIssueStatusText(status)}</Text>
        </View>
      </View>

      {issue.requestStatus === 'completed' && !isArchived && (
        <TouchableOpacity
          onPress={onArchive}
          style={styles.archiveButton}
          testID='archiveButton'
        >
          <Feather name='archive' size={24} color='#2C3E50' />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        testID='arrowButton'
        onPress={() =>
          navigation.navigate('IssueDetails', { requestID: issue.requestID })
        }
        style={styles.arrowButton}
      >
        <Icon
          name='chevron-right'
          size={IconDimension.mediumIcon}
          color='black'
        />
      </TouchableOpacity>
    </View>
  );
};

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

const MaintenanceIssues = () => {
  const navigation = useNavigation<NavigationProp<ReportStackParamList>>();
  const [issues, setIssues] = useState<MaintenanceRequest[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Status tracking refs for news updates
  const statusTrackingRef = React.useRef<Record<string, string>>({});
  const recentUpdatesRef = React.useRef<Record<string, number>>({});

  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  const hasRecentlyUpdated = (requestId: string, status: string) => {
    const key = `${requestId}_${status}`;
    const lastUpdate = recentUpdatesRef.current[key];
    const now = Date.now();

    if (lastUpdate && now - lastUpdate < 5000) {
      console.log('Recent update detected, skipping');
      return true;
    }

    recentUpdatesRef.current[key] = now;
    return false;
  };

  // Function to handle syncing
  const handleSync = async () => {
    if (isSyncing) return;
    
    try {
      setIsSyncing(true);
      await syncPendingRequests();
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
      
      // Set up real-time listener for Firestore
      const unsubscribe = onSnapshot(query, 
        async (querySnapshot) => {
          // Track if this is the first initialization
          let isInitialized = !statusTrackingRef.current.initialized;
          
          const firestoreIssues = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            requestID: doc.id
          })) as MaintenanceRequest[];

          // Initialize status tracking on first load
          if (isInitialized) {
            firestoreIssues.forEach((issue) => {
              if (issue.requestID) {
                statusTrackingRef.current[issue.requestID] = issue.requestStatus;
              }
            });
            statusTrackingRef.current.initialized = true;
          }

          // Process status changes for news updates
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

          // Get and merge pending requests
          const pendingRequests = await getPendingRequests();
          const filteredPendingRequests = pendingRequests.filter(pending => 
            !firestoreIssues.some(fire => 
              fire.requestTitle === pending.requestTitle && 
              fire.requestDescription === pending.requestDescription &&
              fire.tenantId === pending.tenantId
            )
          );

          setIssues([...firestoreIssues, ...filteredPendingRequests]);
        },
        (error) => {
          console.error("Firestore error:", error);
          getPendingRequests().then(setIssues);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up listeners:", error);
      const pendingRequests = await getPendingRequests();
      setIssues(pendingRequests);
      return () => {};
    }
  };

  // Set up effect hooks
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchIssues();
      }
    }, [userId])
  );

  useEffect(() => {
    if (!userId) return;

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

  const createStatusChangeNews = async (
    request: MaintenanceRequest,
    userId: string,
  ) => {
    try {
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

  const archiveIssue = async (requestID: string) => {
    if (!userId) return;

    try {
      const issue = issues.find((issue) => issue.requestID === requestID);
      if (!issue) return;

      await handleStatusChange(requestID, 'completed', issue.requestTitle);
      setIssues(
        issues.map((issue) =>
          issue.requestID === requestID
            ? { ...issue, requestStatus: 'completed' }
            : issue,
        ),
      );
    } catch (error) {
      console.error('Error archiving issue:', error);
    }
  };

  const filteredIssues = issues.filter(
    (issue) => issue.requestStatus !== 'completed' || showArchived,
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
              <Text>Archived Issues</Text>
              <Switch
                style={[
                  { marginLeft: 8 },
                  { marginRight: 8 },
                  { marginBottom: 8 },
                  { marginTop: 8 },
                ]}
                value={showArchived}
                onValueChange={setShowArchived}
                testID='archiveSwitch'
              />
            </View>

            <View style={styles.viewBoxContainer}>
              {filteredIssues.map((issue) => (
                <IssueItem
                  key={issue.requestID}
                  issue={issue}
                  onStatusChange={(newStatus) =>
                    handleStatusChange(
                      issue.requestID,
                      newStatus,
                      issue.requestTitle,
                    )
                  }
                  onArchive={() => archiveIssue(issue.requestID)}
                  isArchived={issue.requestStatus === 'completed'}
                />
              ))}
            </View>

            <View style={[styles.viewBoxContainer, { height: 100 }]} />
          </View>
        </ScrollView>
      </Header>

      <TouchableOpacity
        testID='addButton'
        style={styles.addButton}
        onPress={() => navigation.navigate('Report')}
      >
        <Feather name='plus' size={IconDimension.smallIcon} color='white' />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
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
  statusBadge: {
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  archiveButton: {
    marginTop: 5,
    marginLeft: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
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
})