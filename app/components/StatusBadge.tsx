import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { MaintenanceRequest } from '@/types/types';
import { getIssueStatusColor, getIssueStatusText } from '@/app/utils/StatusHelper';
// portions of this code were generated with chatGPT as an AI assistant

interface StatusBadgeProps {
  status: MaintenanceRequest["requestStatus"];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    return (
        <View style={[styles.statusBadge, {backgroundColor : getIssueStatusColor(status)}]}>
            <Text style={styles.statusText}>Status: {getIssueStatusText(status)}</Text>
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
});