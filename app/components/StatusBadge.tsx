import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

// portions of this code were generated with chatGPT as an AI assistant

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed':
                return styles.completed;
            case 'in-progress':
                return styles.inProgress;
            case 'not-started':
                return styles.notStarted;
            default:
                return styles.defaultStatus;
        }
    };

    return (
        <View style={[styles.statusBadge, getStatusStyle(status)]}>
            <Text style={styles.statusText}>Status: {status.replace('-', ' ')}</Text>
        </View>
    );
};

export default StatusBadge;

const styles = StyleSheet.create({
  statusBadge: {
    alignSelf: 'center',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  completed: {
    backgroundColor: '#4caf50', // Green for completed
  },
  inProgress: {
    backgroundColor: '#ffc46b', // Orange for in progress
  },
  notStarted: {
    backgroundColor: '#ff7b70', // Red for not started
  },
  defaultStatus: {
    backgroundColor: '#ccc', // Default gray if status is undefined
  },
});
