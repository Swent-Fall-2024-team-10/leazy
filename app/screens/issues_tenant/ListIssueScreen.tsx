import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Header from '../../components/Header';
import { useNavigation, NavigationProp } from '@react-navigation/native'; 
import { ReportStackParamList } from '../../../types/types';  // Assuming this also includes navigation types
import { updateMaintenanceRequest, getMaintenanceRequestsQuery } from '../../../firebase/firestore/firestore'; // Firestore functions
import { MaintenanceRequest} from '../../../types/types'; // Importing types
import { getAuth } from 'firebase/auth';
import { onSnapshot } from 'firebase/firestore';
import { getIssueStatusColor, getIssueStatusText } from '@/app/utils/StatusHelper'; 
import { appStyles } from '@/styles/styles';

// portions of this code were generated with chatGPT as an AI assistant

interface IssueItemProps {
  issue: MaintenanceRequest;
  onStatusChange: (status: MaintenanceRequest['requestStatus']) => void;
  onArchive: () => void;
  isArchived: boolean;
}

const IssueItem: React.FC<IssueItemProps> = ({ issue, onStatusChange, onArchive, isArchived }) => {
  const navigation = useNavigation<NavigationProp<ReportStackParamList>>();
  const status = issue.requestStatus;

  return (
    <View style={styles.issueItem}>
      <View style={styles.issueContent}>
        <View style={styles.issueTextContainer}>
          <Text style={styles.issueText} numberOfLines={1}>{issue.requestTitle}</Text>
        </View>
        <TouchableOpacity
          style={[styles.statusBadge, { backgroundColor: getIssueStatusColor(status) }]}
        >
          <Text style={styles.statusText}>Status: {getIssueStatusText(status)}</Text>
        </TouchableOpacity>
      </View>
      {issue.requestStatus === 'completed' && !isArchived && (
        <TouchableOpacity onPress={onArchive} style={styles.archiveButton}>
          <Feather name="archive" size={24} color="#2C3E50" />
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        testID='arrowButton'
        onPress={() => navigation.navigate('IssueDetails', { requestID: issue.requestID })}
        style={styles.arrowButton}>
        <Feather name="chevron-right" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const MaintenanceIssues = () => {
  const navigation = useNavigation<NavigationProp<ReportStackParamList>>();
  const [issues, setIssues] = useState<MaintenanceRequest[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  // Initialize auth instance
  const auth = getAuth();

  // Access the current user's UID
  const user = auth.currentUser;
  const userId = user ? user.uid : null;

  useEffect(() => {
    const fetchTenantRequests = async () => {
      try {
        if (!userId) {
          console.error("User is not logged in");
          return;
        }

        // Get the Firestore query from the ViewModel
        const query = getMaintenanceRequestsQuery(userId);

        // Set up the Firestore real-time listener using the query from the ViewModel
        const unsubscribe = onSnapshot(query, (querySnapshot) => {
          const updatedIssues: MaintenanceRequest[] = [];
          querySnapshot.forEach((doc) => {
            updatedIssues.push(doc.data() as MaintenanceRequest);
          });
          setIssues(updatedIssues); // Update state with real-time data
        });

        // Cleanup the listener when the component unmounts
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching tenant requests:", error);
      }
    };

    fetchTenantRequests();
  }, [userId]); // Re-run useEffect when userId changes


  const archiveIssue = (requestID: string) => {
    setIssues(issues.map(issue => 
      issue.requestID === requestID ? { ...issue, requestStatus: 'completed' } : issue
    ));
    updateMaintenanceRequest(requestID, { requestStatus: 'completed' }); // Update Firestore status
  };

  const filteredIssues = issues.filter(issue => issue.requestStatus !== 'completed' || showArchived);

  return (
    <View style={styles.container}>
      <Header>
        <ScrollView style={styles.scrollView}>
          <View style={styles.titleContainer}>
            <Text style={appStyles.screenHeader}>Maintenance Requests</Text>
          </View>

          <View style={styles.switchContainer}>
            <Text> Archived Issues</Text>
            <Switch
              style={[{ marginLeft: 8 }, {marginRight: 8}, {marginBottom: 8}, {marginTop: 8}]}
              value={showArchived}
              onValueChange={setShowArchived}
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

          <View style={[styles.viewBoxContainer, {height: 100}]}>
          </View>
        </ScrollView>
      </Header>

      <TouchableOpacity testID="addButton" style={styles.addButton} onPress={() => navigation.navigate('Report')}>
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  scrollView: {
    flex: 1,
    paddingTop: 15,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#EDEDED', 
    borderRadius: 30,           
    borderWidth: 1,             
    borderColor: '#7F7F7F',     
    width: 340,                 
    height: 110,                
    marginBottom: 12,
    padding: 16,
  },
  issueContent: {
    justifyContent:'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    flex: 1,
  },
  issueTextContainer: { 
    width: '100%',         
    height: 32,         
    borderRadius: 25,   
    backgroundColor: '#FFF', 
    justifyContent: 'center',
    alignContent: 'stretch',  
    paddingHorizontal: 12,
  },
  issueText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  statusBadge: {
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
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
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2C3E50',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    zIndex: 1,
    marginBottom: 10,
    marginRight: 10,
  },
  viewBoxContainer: {
    marginBottom: 80,
    paddingBottom: 80,
  },
  arrowButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MaintenanceIssues;