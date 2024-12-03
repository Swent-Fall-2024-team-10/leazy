import { Timestamp } from "@firebase/firestore-types";


// Define the navigation stack types
export type RootStackParamList = {
  Home: undefined; // No parameters for Home screen
  Settings: undefined; // No parameters for Settings screen
  ListIssues: undefined; // No parameters for ListIssues screen
  WashingMachine: undefined; // No parameters for WashingMachine screen
  ManageWashingMachine: undefined; // No parameters for CreateWashingMachine screen
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  TenantForm: {
    email: string;
    password: string;
  };
  LandlordForm: {
    email: string;
    password: string;
  };
};
export type ResidenceStackParamList = {
  ResidenceList: undefined;
  FlatDetails: {
    apartment: Apartment;
  };
  CreateResidence: undefined;
};
export type ReportStackParamList = {
  Issues: undefined;
  Report: undefined;
  Messaging: undefined;

  CameraScreen: undefined;
  CapturedMedia: { uri: string; type: "photo" | "video" };
  IssueDetails: {
    requestID: string;
  };
};

// Define types for firestore
export type TUser = {
  uid: string; // uid of the user for authentication
  type: "tenant" | "landlord";
  name: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  city: string;
  canton: string;
  zip: string;
  country: string;
};

export type Landlord = {
  userId: string; // uid of the user
  residenceIds: string[]; // list of residence ids
};

export type Tenant = {
  userId: string; // uid of the user
  maintenanceRequests: string[]; // list of maintenance request ids
  apartmentId: string;
  residenceId: string;
};

export type Residence = {
  residenceName: string;
  street: string;
  number: string;
  city: string;
  canton: string;
  zip: string;
  country: string;
  landlordId: string; // uid of the landlord
  tenantIds: string[]; // list of tenant uids
  laundryMachineIds: string[];
  apartments: string[]; // list of apartment ids
  tenantCodesID: string[]; // list of IDs of tenant unique codes
  situationReportLayout: string[];
};

export type TenantCode = {
  tenantCode: string;
  apartmentId: string;
  residenceId: string;
  used: boolean;
};

export type Apartment = {
  apartmentName: string;
  residenceId: string;
  tenants: string[]; // list of tenant uids
  maintenanceRequests: string[]; // list of maintenance request ids
  situationReportId: string; 
};

export type LaundryMachine = {
  laundryMachineId: string;
  isAvailable: boolean;
  isFunctional: boolean;
  occupiedBy: string; //for a userID
  startTime: Timestamp;
  estimatedFinishTime: Timestamp;
  notificationScheduled: boolean;
};

export type MaintenanceRequest = {
  requestID: string;
  tenantId: string; // uid of the tenant
  residenceId: string; // id of the residence
  apartmentId: string; // id of the apartment
  openedBy: string;
  requestTitle: string;
  requestDate: string;
  requestDescription: string;
  picture: string[]; // list of picture urls referenced in the database
  requestStatus: "inProgress" | "completed" | "notStarted" | "rejected";
};

export type SituationReport = {
  reportDate: string;
  arrivingTenant: string;
  leavingTenant: string;
  apartmentId: string;
  reportForm: string[];
  remarks: string;
}
