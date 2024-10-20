
// portions of this code were generated with chatGPT as an AI assistant

// Define the navigation stack types
export type RootStackParamList = {
    Home: undefined;         // No parameters for Home screen
    Settings: undefined;     // No parameters for Settings screen
    IssueDetails: {
      requestID: string
    };
    ListIssues: undefined;
    Messaging: undefined;
  };

declare type TTenantData ={}
declare type TLandlordData ={}

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

export const FontSizes = {
  ScreenHeader : 24,
  
  DateText : 14,
  
  ButtonText : 16,
  
  TextInputText : 16,
  TextInputLabel : 16,

  label : 16,
}

export const FontWeight = {
  ScreenHeader : 'bold',
  DateText : 'normal',
  ButtonText : 'bold',
  TextInputText : 'normal',
  TextInputLabel : 'bold',
  label : 'bold',
}

export const Color = {

  ScreenHeader : "#0B3142",
  DateText : '#7F7F7F',

  ButtonBackgroundDisabled : "#7F7F7F",
  ButtonTextDisabled : "#FFFFFF",

  ButtonBackground : "#0F5257",
  ButtonBorder : "#7F7F7F",
  ButtonText : "#FFFFFF",

  ReportScreenBackground : "#F5F5F5",
  
  TextInputPlaceholder : "#7F7F7F",
  TextInputBackground : "#FFF",
  TextInputBorder : "#7F7F7F",
  TextInputText : "#0B3142",
  TextInputLabel : "#0B3142",

  CameraButtonBackground : "#0F5257",
  CameraButtonBorder : "#7F7F7F",
}