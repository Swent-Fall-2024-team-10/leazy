// portions of this code were generated with chatGPT as an AI assistant

// Define the navigation stack types
export type RootStackParamList = {
    Home: undefined;         // No parameters for Home screen
    Settings: undefined;     // No parameters for Settings screen
  };
  
declare type TTenantData ={}
declare type TLandlordData ={}

// Define types for firestore
export type User = {
  uid: string;
  type: "tenant" | "landlord";
  details: Person;
}

export type Person = {
  name: string;
  email: string;
  phone: string;
  address: Address;
}

export type Landlord = {
  userId: string; // uid of the user
  residenceIds: string[]; // list of residence ids
}

export type Tenant = {
  userId: string; // uid of the user
  maintenanceRequests: string[]; // list of maintenance request ids
  apartmentId: Apartment;
}

export type Residence = {
  residenceId: string;
  address: Address;
  landlordId: string; // uid of the landlord
  tenants: string[]; // list of tenant uids
  laundryMachines: LaundryMachine[];
  apartments: string[]; // list of apartment ids
}

export type Apartment = {
  apartmentId: string;
  residence: Residence;
  tenants: string[]; // list of tenant uids
  maintenanceRequests: string[]; // list of maintenance request ids
}

export type Address = {
  street: string;
  number: string;
  city: string;
  canton: string;
  zip: string;
  country: string;
}

export type LaundryMachine = {
  id: string;
  isAvailable: boolean;
  isFunctional: boolean;
}

export type MaintenanceRequest = {
  requestID: string;
  tenantId: string; // uid of the tenant
  residenceId: string; // id of the residence
  apartmentId: string; // id of the apartment
  openedBy: User;
  requestDate: string;
  requestDescription: string;
  picture: string[]; // list of picture urls referenced in the database
  requestStatus: "inProgress" | "completed" | "notStarted" | "rejected";
}
