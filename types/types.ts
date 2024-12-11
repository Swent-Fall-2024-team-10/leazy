import { Timestamp } from "@firebase/firestore";

// WithId type helper
export type WithId<T> = T & { id: string };
// Define the navigation stack types
export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  ListIssues: undefined;
  WashingMachine: undefined;
  ManageWashingMachine: undefined;
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
    apartment: ApartmentWithId;
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
export type LandlordStackParamList = {
  LandlordDashboard: undefined;
  Issues: undefined;
  IssueDetails: {
    requestID: string;
  };
  Messaging: undefined;
}

export type TUser = {
  uid: string;
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
  userId: string;
  residenceIds: string[];
};

export type Tenant = {
  userId: string;
  maintenanceRequests: string[];
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
  landlordId: string;
  tenantIds: string[];
  laundryMachineIds: string[];
  apartments: string[];
  tenantCodesID: string[];
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
  tenants: string[];
  maintenanceRequests: string[];
  situationReportId: string;
};

export type LaundryMachine = {
  laundryMachineId: string;
  isAvailable: boolean;
  isFunctional: boolean;
  occupiedBy: string;
  startTime: Timestamp;
  estimatedFinishTime: Timestamp;
  notificationScheduled: boolean;
};

export type MaintenanceRequest = {
  requestID: string;
  tenantId: string;
  residenceId: string;
  apartmentId: string;
  openedBy: string;
  requestTitle: string;
  requestDate: string;
  requestDescription: string;
  picture: string[];
  requestStatus: "inProgress" | "completed" | "notStarted" | "rejected";
};

export type SituationReport = {
  reportDate: string;
  arrivingTenant: string;
  leavingTenant: string;
  residenceId: string;
  apartmentId: string;
  reportForm: string;
  remarks: string;
};

// Types with IDs
export type ResidenceWithId = WithId<Residence>;
export type ApartmentWithId = WithId<Apartment>;
export type TenantCodeWithId = WithId<TenantCode>;
export type LaundryMachineWithId = WithId<LaundryMachine>;
export type MaintenanceRequestWithId = WithId<MaintenanceRequest>;
export type SituationReportWithId = WithId<SituationReport>;