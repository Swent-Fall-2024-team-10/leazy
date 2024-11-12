import { getIssueStatusColor, getIssueStatusText } from '../StatusHelper';
import { Color } from '../../../styles/styles';

describe('getIssueStatusColor', () => {
  test('returns Color.completed for status "completed"', () => {
    expect(getIssueStatusColor('completed')).toBe(Color.completed);
  });

  test('returns Color.inProgress for status "inProgress"', () => {
    expect(getIssueStatusColor('inProgress')).toBe(Color.inProgress);
  });

  test('returns Color.notStarted for status "notStarted"', () => {
    expect(getIssueStatusColor('notStarted')).toBe(Color.notStarted);
  });

  test('returns Color.default for unknown status', () => {
    expect(getIssueStatusColor('unknown')).toBe(Color.default);
  });
});

describe('getIssueStatusText', () => {
  test('returns "Completed" for status "completed"', () => {
    expect(getIssueStatusText('completed')).toBe('Completed');
  });

  test('returns "In Progress" for status "inProgress"', () => {
    expect(getIssueStatusText('inProgress')).toBe('In Progress');
  });

  test('returns "Not Started" for status "notStarted"', () => {
    expect(getIssueStatusText('notStarted')).toBe('Not Started');
  });

  test('returns "Rejected" for status "rejected"', () => {
    expect(getIssueStatusText('rejected')).toBe('Rejected');
  });

  test('returns "Not Started" for unknown status', () => {
    expect(getIssueStatusText('unknown')).toBe('Not Started');
  });
});
