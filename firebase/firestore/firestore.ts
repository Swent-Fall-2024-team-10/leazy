// Import Firestore database instance and necessary Firestore functions.
import { db } from "../firebase";
import {
  setDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  collection,
  where,
} from "firebase/firestore";

// Import type definitions used throughout the functions.
import {
  User,
  Landlord,
  Tenant,
  Residence,
  Apartment,
  LaundryMachine,
  MaintenanceRequest,
} from "../../types/types";

/**
 * Creates a new user document in Firestore.
 * @param user - The user object to be added to the 'users' collection.
 */
export async function createUser(user: User) {
  const docRef = doc(db, "users", user.uid);
  await setDoc(docRef, user);
}

/**
 * Retrieves a user document from Firestore by UID.
 * @param uid - The unique identifier of the user.
 * @returns The user data or null if no user is found.
 */
export async function getUser(uid: string): Promise<User | null> {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as User) : null;
}

/**
 * Updates an existing user document in Firestore by UID.
 * @param uid - The unique identifier of the user to update.
 * @param user - The partial user data to update.
 */
export async function updateUser(uid: string, user: Partial<User>) {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, user);
}

/**
 * Deletes a user document from Firestore by UID.
 * @param uid - The unique identifier of the user to delete.
 */
export async function deleteUser(uid: string) {
  const docRef = doc(db, "users", uid);
  await deleteDoc(docRef);
}

/**
 * Creates a new landlord document in Firestore.
 * @param landlord - The landlord object to be added to the 'landlords' collection.
 */
export async function createLandlord(landlord: Landlord) {
  const docRef = doc(db, "landlords", landlord.userId);
  await setDoc(docRef, landlord);
}

/**
 * Retrieves a landlord document from Firestore by user ID.
 * @param userId - The unique identifier of the landlord.
 * @returns The landlord data or null if no landlord is found.
 */
export async function getLandlord(userId: string): Promise<Landlord | null> {
  const docRef = doc(db, "landlords", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Landlord) : null;
}

/**
 * Updates an existing landlord document in Firestore by user ID.
 * @param userId - The unique identifier of the landlord to update.
 * @param landlord - The partial landlord data to update.
 */
export async function updateLandlord(
  userId: string,
  landlord: Partial<Landlord>
) {
  const docRef = doc(db, "landlords", userId);
  await updateDoc(docRef, landlord);
}

/**
 * Deletes a landlord document from Firestore by user ID.
 * @param userId - The unique identifier of the landlord to delete.
 */
export async function deleteLandlord(userId: string) {
  const docRef = doc(db, "landlords", userId);
  await deleteDoc(docRef);
}

/**
 * Creates a new tenant document in Firestore.
 * @param tenant - The tenant object to be added to the 'tenants' collection.
 */
export async function createTenant(tenant: Tenant) {
  const docRef = doc(db, "tenants", tenant.userId);
  await setDoc(docRef, tenant);
}

/**
 * Retrieves a tenant document from Firestore by user ID.
 * @param userId - The unique identifier of the tenant.
 * @returns The tenant data or null if no tenant is found.
 */
export async function getTenant(userId: string): Promise<Tenant | null> {
  const docRef = doc(db, "tenants", userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Tenant) : null;
}

/**
 * Updates an existing tenant document in Firestore by user ID.
 * @param userId - The unique identifier of the tenant to update.
 * @param tenant - The partial tenant data to update.
 */
export async function updateTenant(userId: string, tenant: Partial<Tenant>) {
  const docRef = doc(db, "tenants", userId);
  await updateDoc(docRef, tenant);
}

/**
 * Deletes a tenant document from Firestore by user ID.
 * @param userId - The unique identifier of the tenant to delete.
 */
export async function deleteTenant(userId: string) {
  const docRef = doc(db, "tenants", userId);
  await deleteDoc(docRef);
}

/**
 * Creates a new residence document in Firestore.
 * @param residence - The residence object to be added to the 'residences' collection.
 */
export async function createResidence(residence: Residence) {
  const docRef = doc(db, "residences", residence.residenceId);
  await setDoc(docRef, residence);
}

/**
 * Retrieves a residence document from Firestore by residence ID.
 * @param residenceId - The unique identifier of the residence.
 * @returns The residence data or null if no residence is found.
 */
export async function getResidence(
  residenceId: string
): Promise<Residence | null> {
  const docRef = doc(db, "residences", residenceId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Residence) : null;
}

/**
 * Updates an existing residence document in Firestore by residence ID.
 * @param residenceId - The unique identifier of the residence to update.
 * @param residence - The partial residence data to update.
 */
export async function updateResidence(
  residenceId: string,
  residence: Partial<Residence>
) {
  const docRef = doc(db, "residences", residenceId);
  await updateDoc(docRef, residence);
}

/**
 * Deletes a residence document from Firestore by residence ID.
 * @param residenceId - The unique identifier of the residence to delete.
 */
export async function deleteResidence(residenceId: string) {
  const docRef = doc(db, "residences", residenceId);
  await deleteDoc(docRef);
}

/**
 * Creates a new apartment document in Firestore.
 * @param apartment - The apartment object to be added to the 'apartments' collection.
 */
export async function createApartment(apartment: Apartment) {
  const docRef = doc(db, "apartments", apartment.apartmentId);
  await setDoc(docRef, apartment);
}

/**
 * Retrieves an apartment document from Firestore by apartment ID.
 * @param apartmentId - The unique identifier of the apartment.
 * @returns The apartment data or null if no apartment is found.
 */
export async function getApartment(
  apartmentId: string
): Promise<Apartment | null> {
  const docRef = doc(db, "apartments", apartmentId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Apartment) : null;
}

/**
 * Updates an existing apartment document in Firestore by apartment ID.
 * @param apartmentId - The unique identifier of the apartment to update.
 * @param apartment - The partial apartment data to update.
 */
export async function updateApartment(
  apartmentId: string,
  apartment: Partial<Apartment>
) {
  const docRef = doc(db, "apartments", apartmentId);
  await updateDoc(docRef, apartment);
}

/**
 * Deletes an apartment document from Firestore by apartment ID.
 * @param apartmentId - The unique identifier of the apartment to delete.
 */
export async function deleteApartment(apartmentId: string) {
  const docRef = doc(db, "apartments", apartmentId);
  await deleteDoc(docRef);
}

/**
 * Creates a new maintenance request document in Firestore.
 * @param request - The maintenance request object to be added to the 'maintenanceRequests' collection.
 */
export async function createMaintenanceRequest(request: MaintenanceRequest) {
  const docRef = doc(db, "maintenanceRequests", request.requestID);
  await setDoc(docRef, request);
}

/**
 * Retrieves a maintenance request document from Firestore by request ID.
 * @param requestID - The unique identifier of the maintenance request.
 * @returns The maintenance request data or null if no request is found.
 */
export async function getMaintenanceRequest(
  requestID: string
): Promise<MaintenanceRequest | null> {
  const docRef = doc(db, "maintenanceRequests", requestID);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as MaintenanceRequest) : null;
}

/**
 * Returns a Firestore query for maintenance requests by tenantId.
 * This query can be used with onSnapshot to listen for real-time updates.
 * @param tenantId - The unique identifier of the tenant.
 * @returns A Firestore query for the maintenance requests collection.
 */
export function getMaintenanceRequestsQuery(tenantId: string) {
  // Construct a query based on the tenantId
  return query(
    collection(db, "maintenanceRequests"),
    where("tenantId", "==", tenantId)
  );
}

/**
 * Updates an existing maintenance request document in Firestore by request ID.
 * @param requestID - The unique identifier of the maintenance request to update.
 * @param request - The partial maintenance request data to update.
 */
export async function updateMaintenanceRequest(
  requestID: string,
  request: Partial<MaintenanceRequest>
) {
  const docRef = doc(db, "maintenanceRequests", requestID);
  await updateDoc(docRef, request);
}

/**
 * Deletes a maintenance request document from Firestore by request ID.
 * @param requestID - The unique identifier of the maintenance request to delete.
 */
export async function deleteMaintenanceRequest(requestID: string) {
  const docRef = doc(db, "maintenanceRequests", requestID);
  await deleteDoc(docRef);
}

/**
 * Creates a new laundry machine document within a specific residence in Firestore.
 * @param residenceId - The unique identifier of the residence where the machine is located.
 * @param machine - The laundry machine object to be added.
 */
export async function createLaundryMachine(
  residenceId: string,
  machine: LaundryMachine
) {
  const docRef = doc(
    db,
    `residences/${residenceId}/laundryMachines`,
    machine.laundryMachineId
  );
  await setDoc(docRef, machine);
}

/**
 * Retrieves a laundry machine document from Firestore by residence ID and machine ID.
 * @param residenceId - The unique identifier of the residence.
 * @param machineId - The unique identifier of the laundry machine.
 * @returns The laundry machine data or null if no machine is found.
 */
export async function getLaundryMachine(
  residenceId: string,
  machineId: string
): Promise<LaundryMachine | null> {
  const docRef = doc(
    db,
    `residences/${residenceId}/laundryMachines`,
    machineId
  );
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as LaundryMachine) : null;
}

/**
 * Updates an existing laundry machine document in Firestore by residence ID and machine ID.
 * @param residenceId - The unique identifier of the residence.
 * @param machineId - The unique identifier of the laundry machine to update.
 * @param machine - The partial laundry machine data to update.
 */
export async function updateLaundryMachine(
  residenceId: string,
  machineId: string,
  machine: Partial<LaundryMachine>
) {
  const docRef = doc(
    db,
    `residences/${residenceId}/laundryMachines`,
    machineId
  );
  await updateDoc(docRef, machine);
}

/**
 * Deletes a laundry machine document from Firestore by residence ID and machine ID.
 * @param residenceId - The unique identifier of the residence.
 * @param machineId - The unique identifier of the laundry machine to delete.
 */
export async function deleteLaundryMachine(
  residenceId: string,
  machineId: string
) {
  const docRef = doc(
    db,
    `residences/${residenceId}/laundryMachines`,
    machineId
  );
  await deleteDoc(docRef);
}

/**
 * Fetches all laundry machines for a specific residence from Firestore.
 * @param residenceId - The unique identifier of the residence.
 * @returns An array of laundry machine objects.
 */
export async function getAllLaundryMachines(residenceId: string) {
  const querySnapshot = await getDocs(
    collection(db, `residences/${residenceId}/laundryMachines`)
  );
  const machines: LaundryMachine[] = [];
  querySnapshot.forEach((doc) => {
    machines.push(doc.data() as LaundryMachine);
  });
  return machines;
}
