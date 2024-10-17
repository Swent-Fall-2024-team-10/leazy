// portions of this code were generated with chatGPT as an AI assistant

// Define the navigation stack types
export type RootStackParamList = {
    Home: undefined;         // No parameters for Home screen
    Settings: undefined;     // No parameters for Settings screen
  };
  
export declare type TTenantData ={}
export declare type TLandlordData ={}

// Define types for firestore
export type User = { // User document Id is the uid from the authentication 
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
}

export type Landlord = {
  userId: string; // uid of the user
  residenceIds: string[]; // list of residence ids
}

export type Tenant = {
  userId: string; // uid of the user
  maintenanceRequests: string[]; // list of maintenance request ids
  apartmentId: string;
}

export type Residence = {
  residenceId: string;
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
}

export type Apartment = {
  apartmentId: string;
  residenceId: string;
  tenants: string[]; // list of tenant uids
  maintenanceRequests: string[]; // list of maintenance request ids
}

export type LaundryMachine = {
  laundryMachineId: string;
  isAvailable: boolean;
  isFunctional: boolean;
}

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
}

