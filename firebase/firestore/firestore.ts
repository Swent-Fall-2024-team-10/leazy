// Import Firestore database instance and necessary Firestore functions.
import { db, auth } from "../../firebase/firebase";
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
  arrayUnion,
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
} from "../../types/types";

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
  }
  catch(e) {
    console.error("Error creating tenant profile:", e);
  }
}

/**
 * Retrieves a user document from Firestore by the `uid` field.
 * @param uid - The unique identifier stored in the `uid` field of the user document.
 * @returns An object containing the user data and the document ID, or null if no user is found.
 */
export async function getUser(
  uid: string
): Promise<{ user: TUser; userUID: string } | null> {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("uid", "==", uid));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0]; // Assume `uid` is unique, so take the first result
    return { user: doc.data() as TUser, userUID: doc.id };
  } else {
    return null;
  }
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
export async function createLandlord(landlord: Landlord){
  const docRef = doc(db, "landlords", landlord.userId);
  try {
    await setDoc(docRef, landlord);
    console.log("Landlord profile created successfully.");
  }
  catch(e) {
    console.error("Error creating landlord profile:", e);
  }
}

/**
 * Retrieves a landlord document from Firestore by user ID.
 * @param userId - The unique identifier of the landlord.
 * @returns The landlord data or null if no landlord is found.
 */
export async function getLandlord(
  userId: string
): Promise<{ landlord: Landlord; landlordUID: string } | null> {
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid userId");
  }

  const docRef = collection(db, "landlords");
  const q = query(docRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0]; // Assume `uid` is unique, so take the first result
    return { landlord: doc.data() as Landlord, landlordUID: doc.id };
  } else {
    return null;
  }
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

  //test that a landlord has a userId and residenceIds
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
  }
  catch(e) {
    console.error("Error creating tenant profile:", e);
  }
  
}

/**
 * Retrieves a tenant document from Firestore by the `userId` field.
 * @param userId - The UID of the user to match in the `userId` field.
 * @returns An object containing the tenant data and its Firestore document ID, or null if no tenant is found.
 */
export async function getTenant(
  userId: string
): Promise<{ tenant: Tenant; tenantUID: string } | null> {
  const tenantsRef = collection(db, "tenants");
  const q = query(tenantsRef, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const tenantDoc = querySnapshot.docs[0]; // Assume `userId` is unique among tenants
    return { tenant: tenantDoc.data() as Tenant, tenantUID: tenantDoc.id };
  }
  
  return null;
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
  if (!apartment.apartmentId || !apartment.residenceId) {
    throw new Error("Invalid apartment data");
  }
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
  const userRef = collection(db, "users");
  const userSnapshot = await getDocs(userRef);
  const matchingUserDoc = userSnapshot.docs.find(
    (doc) => doc.data().uid === userID
  );

  if (!matchingUserDoc) {
    throw new Error(`User with ID ${userID} not found.`);
  }

  const userDocId = matchingUserDoc.id;

  return query(
    collection(db, "maintenanceRequests"),
    where("tenantId", "==", userDocId)
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

  if (machine.laundryMachineId !== machineId) {
    throw new Error("Machine ID mismatch");
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

/**
 * Adds a new landlord to Firestore, creating a user profile and a landlord profile.
 * @param name - Full name of the landlord.
 * @param email - Email address of the landlord.
 * @param phone - Phone number of the landlord.
 * @param street - Street address of the landlord.
 * @param number - Building or unit number.
 * @param city - City of residence.
 * @param canton - Province/State.
 * @param zip - Postal/ZIP code.
 * @param country - Country.
 */
export async function add_new_landlord(
  name: string,
  email: string,
  phone: string,
  street: string,
  number: string,
  city: string,
  canton: string,
  zip: string,
  country: string
) {
  try {
    // Validate the current user email matches
    if (email !== auth.currentUser?.email) {
      throw new Error("Use the same email as the one you used to sign up.");
    }

    const userObj = await getUser(auth.currentUser.uid);
    if (!userObj) {

      throw new Error("User doesn't exist.");
    }

    const { user, userUID } = userObj;

    user.email = email;
    user.name = name;
    user.phone = phone;
    user.street = street;
    user.number = number;
    user.city = city;
    user.canton = canton;
    user.zip = zip;
    user.country = country;

    updateUser(userUID, user);

    // Step 2: Create a landlord document with the same userId
    const landlordDocRef = doc(db, "landlords", userUID);
    const newLandlord: Landlord = {
      userId: userUID,
      residenceIds: [], // Initialize with no residence IDs
    };

    await setDoc(landlordDocRef, newLandlord); // Correct Firestore document creation

    console.log("Landlord profile created successfully.");
  } catch (error) {
    console.error("Error in add_new_landlord:", error);
    throw new Error("Failed to add new landlord.");
  }
}

export async function add_new_tenant(
  tenantCodeId: string,
  userUID: string
) {
  try {

    const tenantCodesRef = doc(db, "tenantCodes", tenantCodeId);
    const tenantCodeDoc = await getDoc(tenantCodesRef);
    const tenantCodeData = tenantCodeDoc.data();

    if (
      !tenantCodeData ||
      !tenantCodeData.apartmentId ||
      !tenantCodeData.residenceId
    ) {
      throw new Error("Invalid tenant code data.");
    }

    const apartmentId = tenantCodeData.apartmentId;
    const residenceId = tenantCodeData.residenceId;

    const residencesRef = collection(db, "residences");
    const residencesSnapshot = await getDocs(residencesRef);
    const matchingResidenceDoc = residencesSnapshot.docs.find(
      (doc) => doc.data().residenceId === residenceId
    );
    if (!matchingResidenceDoc) {
      throw new Error(`Residence with ID ${residenceId} not found.`);
    }
    const residenceRef = doc(db, "residences", matchingResidenceDoc.id);
    await updateDoc(residenceRef, { tenantIds: arrayUnion(userUID) });

    const apartmentsRef = collection(db, "apartments");
    const apartmentsSnapshot = await getDocs(apartmentsRef);
    const matchingApartmentDoc = apartmentsSnapshot.docs.find(
      (doc) => doc.data().apartmentId === apartmentId
    );

    if (!matchingApartmentDoc) {
      throw new Error(`Apartment with ID ${apartmentId} not found.`);
    }
    const apartmentRef = doc(db, "apartments", matchingApartmentDoc.id);
    await updateDoc(apartmentRef, { tenants: arrayUnion(userUID) });

    const tenantDocRef = doc(db, "tenants", userUID);
    console.log(apartmentId)
    await updateDoc(tenantDocRef, {
      apartmentId: apartmentId,
      residenceId: residenceId,
    });

  } catch (error) {
    throw error;
  }
}

export async function generate_unique_code(
  residenceId: string,
  apartmentId: string
): Promise<string> {
  // Generate a unique 6-digit tenant code
  const tenantCode = Math.floor(100000 + Math.random() * 900000).toString();

  const newTenantCode: TenantCode = {
    tenantCode,
    apartmentId,
    residenceId,
    used: false,
  };

  // Check if the residence exists and get its data
  const residencesRef = collection(db, "residences");
  const residenceQuery = query(
    residencesRef,
    where("residenceId", "==", residenceId)
  );
  const residenceSnapshot = await getDocs(residenceQuery);

  if (residenceSnapshot.empty) {
    throw new Error("No matching residence found for the given residence ID.");
  }

  const residenceDoc = residenceSnapshot.docs[0];
  // Check if the apartment exists in the apartments collection and belongs to the residence
  const apartmentsRef = collection(db, "apartments");
  const apartmentQuery = query(
    apartmentsRef,
    where("apartmentId", "==", apartmentId),
    where("residenceId", "==", residenceId)
  );
  const apartmentSnapshot = await getDocs(apartmentQuery);

  if (apartmentSnapshot.empty) {
    throw new Error(
      `Apartment with ID ${apartmentId} does not exist in residence with ID ${residenceId}.`
    );
  }

  // Add the tenant code to the 'tenantCodes' collection
  const tenantCodesRef = collection(db, "tenantCodes");
  const docRef = await addDoc(tenantCodesRef, newTenantCode);

  // Update the 'tenantCodesID' array in the residence document
  const residenceRef = doc(db, "residences", residenceDoc.id);
  await updateDoc(residenceRef, {
    tenantCodesID: arrayUnion(docRef.id),
  });

  return tenantCode;
}

/**
 * Validates a tenant code, marking it as used if valid.
 * @param inputCode - The tenant code to validate.
 * @returns The document ID of the tenant code if valid and unused, null otherwise.
 */
export async function validateTenantCode(
  inputCode: string
): Promise<string | null> {
  try {
    console.log("inputCode:    ", inputCode);
    // fetch the UID of TenantCode who has this unique code: inputCode
    const tenantCodesRef = collection(db, "tenantCodes");

    const q = query(
      tenantCodesRef,
      where("tenantCode", "==", inputCode),
      where("used", "==", false)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const tenantCodeDoc = querySnapshot.docs[0];
    const tenantCodeRef = doc(db, "tenantCodes", tenantCodeDoc.id);

    await updateDoc(tenantCodeRef, { used: true });
    
    return tenantCodeDoc.id;
  } catch (error) {
    console.error("Error validating tenant code:", error);
    return null;
  }
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
    console.error("Error deleting used tenant codes:", error);
    throw error;
  }
 * Returns a Firestore query for washing machines by residenceId.
 * This query can be used with onSnapshot to listen for real-time updates.
 * @param residenceId - The unique identifier of the residence.
 * @returns A Firestore query for the washing machines collection.
 */
export function getLaundryMachinesQuery(residenceId: string) {
  return query(
    collection(db, `residences/${residenceId}/laundryMachines`)
  );
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
