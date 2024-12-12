// Import Firestore database instance and necessary Firestore functions.
import { db } from "../../firebase/firebase";
import {
  setDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  getFirestore,
} from "firebase/firestore";

// Import type definitions used throughout the functions.
import {
  TUser,
  Landlord,
  Tenant,
  Residence,
  Apartment,
  LaundryMachine,
  MaintenanceRequest,
  TenantCode,
  SituationReport,
} from "../../types/types";
import { get } from "http";

// Set the log level to 'silent' to disable logging
// setLogLevel("silent");

/**
 * Creates a new user document in Firestore.
 * @param user - The user object to be added to the 'users' collection.
 */
export async function createUser(user: TUser) {
  const docRef = doc(db, "users", user.uid);
  try {
    await setDoc(docRef, user);
  } catch (e) {
    console.error("Error creating tenant profile:", e);
    throw e;
  }
}

/**
 * Retrieves a user document from Firestore by the `uid` field.
 * @param uid - The unique identifier stored in the `uid` field of the user document.
 * @returns An object containing the user data and the document ID, or null if no user is found.
 */
export async function getUser(userUID: string): Promise<TUser | null> {
  const usersRef = doc(db, "users", userUID);
  const docSnap = await getDoc(usersRef);
  return docSnap.exists() ? (docSnap.data() as TUser) : null;
}

/**
 * Updates an existing user document in Firestore by UID.
 * @param uid - The unique identifier of the user to update.
 * @param user - The partial user data to update.
 */
export async function updateUser(uid: string, user: Partial<TUser>) {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, user);
}

/**
 * Deletes a user document from Firestore by UID.
 * @param uid - The unique identifier of the user to delete.
 */
export async function deleteUser(uid: string) {
  if (!uid || typeof uid !== "string") {
    throw new Error("Invalid UID");
  }
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
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid userId");
  }
  const landlordsRef = doc(db, "landlords", userId);
  const docSnap = await getDoc(landlordsRef);
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
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid userId");
  }

  if (!landlord.userId || !landlord.residenceIds) {
    throw new Error("Invalid landlord data");
  }
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
  try {
    await setDoc(docRef, tenant);
  } catch (e) {
    console.error("Error creating tenant profile:", e);
  }
}

/**
 * Retrieves a tenant document from Firestore by the `userId` field.
 * @param userId - The UID of the user to match in the `userId` field.
 * @returns An object containing the tenant data and its Firestore document ID, or null if no tenant is found.
 */
export async function getTenant(userId: string): Promise<Tenant | null> {
  const tenantsRef = doc(db, "tenants", userId);
  const docSnap = await getDoc(tenantsRef);
  return docSnap.exists() ? (docSnap.data() as Tenant) : null;
}

/**
 * Updates an existing tenant document in Firestore by user ID.
 * @param userId - The unique identifier of the tenant to update.
 * @param tenant - The partial tenant data to update.
 */
export async function updateTenant(uid: string, tenant: Partial<Tenant>) {
  const docRef = doc(db, "tenants", uid);
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
 * @returns The generated document ID of the newly created residence.
 */
export async function createResidence(residence: Residence): Promise<string> {
  if (!residence.residenceName) {
    throw new Error("Invalid residence ID.");
  }
  const residencesRef = collection(db, "residences");
  const docRef = await addDoc(residencesRef, residence);

  // Return the auto-generated document ID
  return docRef.id;
}

/**
 * Retrieves a residence document from Firestore by residence ID.
 * @param residenceId - The unique identifier of the residence.
 * @returns The residence data or null if no residence is found.
 */
export async function getResidence(
  residenceId: string
): Promise<Residence | null> {

  if (!residenceId || typeof residenceId !== "string") {
    throw new Error("Invalid residence ID");
  }

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
  if (!apartment.apartmentName || !apartment.residenceId) {
    throw new Error("Invalid apartment data");
  }
  const appartmentsRef = collection(db, "apartments");
  const docRef = await addDoc(appartmentsRef, apartment);
  return docRef.id;
}

/**
 * Retrieves an apartment document from Firestore by apartment ID.
 * @param apartmentId - The unique identifier of the apartment.
 * @returns The apartment data or null if no apartment is found.
 */
export async function getApartment(
  apartmentId: string
): Promise<Apartment | null> {
  if (!apartmentId || typeof apartmentId !== "string") {
    throw new Error("Invalid apartmentId");
  }
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
export async function getMaintenanceRequestsQuery(userID: string) {
  // Construct a query based on the tenantId
  const user = await getUser(userID);

  return query(
    collection(db, "maintenanceRequests"),
    where("tenantId", "==", user?.uid)
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
  if (!residenceId || !machineId) {
    throw new Error("Invalid laundry machine data");
  }

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
  if (!residenceId || !machineId) {
    throw new Error("Invalid laundry machine data");
  }

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

export async function generate_unique_code(
  residenceUID: string,
  apartmentUID: string
): Promise<string> {
  // Generate a unique 6-digit tenant code
  const tenantCode = Math.floor(100000 + Math.random() * 900000).toString();

  const newTenantCode: TenantCode = {
    tenantCode: tenantCode,
    apartmentId: apartmentUID,
    residenceId: residenceUID,
    used: false,
  };

  // Add the tenant code to the 'tenantCodes' collection
  const tenantCodesRef = collection(db, "tenantCodes");
  const docRef = await addDoc(tenantCodesRef, newTenantCode);

  const residenceRef = doc(db, "residences", residenceUID);
  const residenceSnap = await getDoc(residenceRef);

  if (!residenceSnap.exists()) {
    throw new Error(
      `Residence with UID: ${residenceUID} not found in the residences collection`
    );
  }

  // Add the new tenant code UID to the residence's tenantCodesID list
  const residenceData = residenceSnap.data() as Residence;
  residenceData.tenantCodesID.push(docRef.id);
  await updateResidence(residenceUID, residenceData);
  return tenantCode;
}

/**
 * Validates a tenant code, marking it as used if valid.
 * @param inputCode - The tenant code to validate.
 * @returns An object containing residenceId, apartmentId, and the document ID of the tenant code if valid and unused; null otherwise.
 */
export async function validateTenantCode(inputCode: string): Promise<{
  residenceId: string;
  apartmentId: string;
  tenantCodeUID: string;
}> {
  // fetch the UID of TenantCode who has this unique code: inputCode
  const tenantCodesRef = collection(db, "tenantCodes");
  const q = query(tenantCodesRef, where("tenantCode", "==", inputCode));

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("Code not found");
  }
  const tenantCodeDoc = querySnapshot.docs[0];
  const data = tenantCodeDoc.data() as TenantCode;

  // Check if the code has already been used
  if (data.used) {
    throw new Error("Code already used");
  }

  if (!data.residenceId) {
    throw new Error(
      "This code doesn't reference a residence. Please contact your landlord."
    );
  }

  if (!data.apartmentId) {
    throw new Error(
      "This code doesn't reference an apartment. Please contact your landlord."
    );
  }

  const tenantCodeRef = doc(db, "tenantCodes", tenantCodeDoc.id);
  await updateDoc(tenantCodeRef, { used: true });

  return {
    residenceId: data.residenceId,
    apartmentId: data.apartmentId,
    tenantCodeUID: tenantCodeDoc.id,
  };
}

/**
 * Deletes all tenant codes marked as used in the tenantCodes collection.
 * @returns The number of deleted documents.
 */
export async function deleteUsedTenantCodes(): Promise<number> {
  try {
    const tenantCodesRef = collection(db, "tenantCodes");
    const q = query(tenantCodesRef, where("used", "==", true));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map((docSnapshot) =>
      deleteDoc(doc(db, "tenantCodes", docSnapshot.id))
    );

    await Promise.all(deletePromises);
    return querySnapshot.size;
  } catch (error) {
    throw error;
  }
}
/*
 * Returns a Firestore query for washing machines by residenceId.
 * This query can be used with onSnapshot to listen for real-time updates.
 * @param residenceId - The unique identifier of the residence.
 * @returns A Firestore query for the washing machines collection.
 */
export function getWashingMachinesQuery(residenceId: string) {
  return query(collection(db, `residences/${residenceId}/laundryMachines`));
}
/*
 * Returns a Firestore query for washing machines by residenceId.
 * This query can be used with onSnapshot to listen for real-time updates.
 * @param residenceId - The unique identifier of the residence.
 * @returns A Firestore query for the washing machines collection.
 */
export function getLaundryMachinesQuery(residenceId: string) {
  return query(collection(db, `residences/${residenceId}/laundryMachines`));
}

/**
 * Fetches all laundry machines for a specific residence from Firestore.
 * @param residenceId - The unique identifier of the residence.
 * @returns An array of laundry machine objects.
 */
export async function getAllLaundryMachines(residenceId: string) {
  if (!residenceId || typeof residenceId !== "string") {
    throw new Error("Invalid residence ID");
  }

  const querySnapshot = await getDocs(
    collection(db, `residences/${residenceId}/laundryMachines`)
  );
  const machines: LaundryMachine[] = [];
  querySnapshot.forEach((doc) => {
    machines.push(doc.data() as LaundryMachine);
  });
  return machines;
}

/**
 * Creates a notification document for a specific laundry machine.
 * @param machineId - The unique identifier of the laundry machine.
 * @param userId - The unique identifier of the user to be notified.
 * @returns A promise that resolves when the notification document is created.
 */
export async function createMachineNotification(userId: string) {
  const docRef = doc(db, "notifications", userId); // Creates a reference to the document in 'notifications' collection
  await setDoc(docRef, {
    userId: userId,
    scheduledTime: Timestamp.now(), // The scheduled notification time
  });
}


export async function addSituationReport(situationReport: SituationReport, apartmentId: string) {
  
  const collectionRef = collection(db, "filledReports");
  try {
    const docRef = await addDoc(collectionRef, {
      situationReport : situationReport
    });
    const apartment = await getApartment(apartmentId);
    const previousReports = apartment?.situationReportId?? [];
    const nextReports = [docRef.id].concat(previousReports);
    updateApartment(apartmentId, { situationReportId: nextReports });
  } catch {
    throw new Error("Error creating situation report.");
  }

}

/**
 * Add the situation report layout to a residence
 * 
 * @param situationReportLayout 
 * @param residenceId 
 */
export async function addSituationReportLayout(situationReportLayout: string[], residenceId: string) {
  updateResidence(residenceId, { situationReportLayout: situationReportLayout});
}

export async function getSituationReport(apartmentId: string) {
  const apartment = await getApartment(apartmentId);
  const situationReportId = apartment?.situationReportId;

  if (!situationReportId) {
    return null;
  }
  const situationReportRef = doc(db, "situationReports", situationReportId.join('/'));
  const situationReportSnap = await getDoc(situationReportRef);

  return situationReportSnap.data() as SituationReport;
}

/**
 * Get the situation report layout of a residence or an empty array if it doesn't exist
 * 
 * @param residenceId 
 * @returns 
 */
export async function getSituationReportLayout(residenceId: string) {
  const residence = await getResidence(residenceId);
  const situationReportLayout = residence?.situationReportLayout;
  return situationReportLayout ? situationReportLayout : [];
}
