import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { MaintenanceRequest } from "../../types/types";
import { getIssueStatusColor, getIssueStatusText } from "../utils/StatusHelper";
import { defaultButtonRadius } from "../../styles/styles";
// portions of this code were generated with chatGPT as an AI assistant

interface StatusBadgeProps {
  status: MaintenanceRequest["requestStatus"];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: getIssueStatusColor(status) },
      ]}
    >
      <Text style={styles.statusText}>
        Status: {getIssueStatusText(status)}
      </Text>
    </View>
  );
};

export default StatusBadge;

const styles = StyleSheet.create({
  statusBadge: {
    alignSelf: "center",
    borderRadius: defaultButtonRadius,
    marginBottom: "5%",
    paddingVertical: "1.5%",
    paddingHorizontal: "3%",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
});
