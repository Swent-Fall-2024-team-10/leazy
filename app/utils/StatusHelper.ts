import { Color } from '../../styles/styles';

export function getIssueStatusColor(status: string) {
    switch (status) {
        case 'completed':
            return Color.completed; // Green for completed
        case 'inProgress':
            return Color.inProgress; // Orange for in progress
        case 'notStarted':
            return Color.notStarted; // Red for not started
        default:
            return Color.default; // Gray for default
    }
}

export function getIssueStatusText(status: string) {
    switch (status) {
        case 'completed':
            return 'Completed';
        case 'inProgress':
            return 'In Progress';
        case 'notStarted':
            return 'Not Started';
        case 'rejected':
            return 'Rejected';
        default:
            return 'Not Started';
    }
}