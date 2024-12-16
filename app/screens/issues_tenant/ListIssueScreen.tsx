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
import { useNavigation, NavigationProp } from '@react-navigation/native';
import {
  ReportStackParamList,
  MaintenanceRequest,
  News,
} from '../../../types/types';
import {
  updateMaintenanceRequest,
  getMaintenanceRequestsQuery,
  createNews,
} from '../../../firebase/firestore/firestore';
import { getAuth } from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';
import {
  getIssueStatusColor,
  getIssueStatusText,
} from '../../utils/StatusHelper';
import { appStyles, Color, IconDimension } from '../../../styles/styles';
import { Icon } from 'react-native-elements';
import { Timestamp } from 'firebase/firestore';

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

        <View
          style={[
            styles.statusTextContainer,
            { backgroundColor: getIssueStatusColor(status) },
          ]}
        >
          <Text style={styles.statusText}>
            Status: {getIssueStatusText(status)}
          </Text>
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

const createStatusNews = async (
  request: MaintenanceRequest,
  previousStatus: string | null,
  currentStatus: string,
  userId: string
) => {
  // Don't create news if there's no status change
  if (previousStatus === currentStatus) return;

  const newsItem: News = {
    maintenanceRequestID: `news_${request.requestID}_${Date.now()}`,
    title: 'Maintenance Request Status Update',
    content: getStatusUpdateMessage(request.requestTitle, currentStatus),
    type: currentStatus === 'rejected' ? 'urgent' : 'informational',
    isRead: false,
    createdAt: Timestamp.now(),
    UpdatedAt: Timestamp.now(),
    ReadAt: null,
    images: request.picture || [],
    ReceiverID: userId,
    SenderID: 'system'
  };

  try {
    await createNews(newsItem);
    console.log('News item created for status change:', newsItem);
  } catch (error) {
    console.error('Error creating news item:', error);
  }
};

const MaintenanceIssues = () => {
  const navigation = useNavigation<NavigationProp<ReportStackParamList>>();
  const [issues, setIssues] = useState<MaintenanceRequest[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [statusChangeTracking, setStatusChangeTracking] = useState<
    Record<string, string>
  >({});

  const auth = getAuth();
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  useEffect(() => {
    const fetchTenantRequests = async () => {
      try {
        if (!userId) {
          console.error('User is not logged in');
          return;
        }

        const query = await getMaintenanceRequestsQuery(userId);

        const unsubscribe = onSnapshot(query, (querySnapshot) => {
          const updatedIssues: MaintenanceRequest[] = [];

          querySnapshot.docChanges().forEach((change) => {
            const newData = change.doc.data() as MaintenanceRequest;
            
            // Handle status changes and news creation
            if (change.type === 'modified') {
              const previousStatus = statusChangeTracking[newData.requestID];
              const currentStatus = newData.requestStatus;
              
              // Create news item for status changes
              createStatusNews(newData, previousStatus, currentStatus, userId);
            }

            // For new documents, create initial news
            if (change.type === 'added') {
              createStatusNews(newData, null, newData.requestStatus, userId);
            }
          });

          // Update issues state and status tracking
          querySnapshot.forEach((doc) => {
            const data = doc.data() as MaintenanceRequest;
            updatedIssues.push(data);

            // Update status tracking
            setStatusChangeTracking((prev) => ({
              ...prev,
              [data.requestID]: data.requestStatus,
            }));
          });

          setIssues(updatedIssues);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error setting up maintenance requests listener:', error);
      }
    };

    fetchTenantRequests();
  }, [userId]);

  const archiveIssue = async (requestID: string) => {
    if (!userId) return;

    try {
      await updateMaintenanceRequest(requestID, { requestStatus: 'completed' });

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
                    updateMaintenanceRequest(issue.requestID, {
                      requestStatus: newStatus,
                    })
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
  arrowButton: {
    marginLeft: '4%',
    width: '15%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MaintenanceIssues;