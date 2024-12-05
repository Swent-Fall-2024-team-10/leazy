import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the context type, including the setter for requestID
type ReportContextType = {
  requestID: string;
  setRequestID: (id: string)=> void;
};

// Create the context with an undefined initial value
const ReportContext = createContext<ReportContextType | undefined>(undefined);

// Provider component
export const ReportProvider = ({ children }: { children: ReactNode }) => {
  const [requestID
, setRequestID] = useState<string>("");

  return (
    <ReportContext.Provider value={{requestID, setRequestID}}>
      {children}
    </ReportContext.Provider>
  );
};

// Custom hook to use the context
export const useReportContext = () => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReportContext must be used within a ReportProvider');
  }
  return context;
};