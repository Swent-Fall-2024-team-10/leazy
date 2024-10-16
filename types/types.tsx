// portions of this code were generated with chatGPT as an AI assistant

// Define the navigation stack types
export type RootStackParamList = {
    Home: undefined;         // No parameters for Home screen
    Settings: undefined;     // No parameters for Settings screen
    IssueDetails: {
        issue: {
          title: string;
          description: string;
          status: 'Not started' | 'In progress' | 'Completed';
        };
      };
      ListIssues: undefined;
  };
  