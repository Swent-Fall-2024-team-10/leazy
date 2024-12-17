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
  getDocFromServer,
  getDocFromCache,
  getDocsFromServer,
  getDocsFromCache,
  onSnapshot,
  serverTimestamp,
  orderBy,
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
import AsyncStorage from "@react-native-async-storage/async-storage";

import { auth } from "../../firebase/firebase";
import { IMessage } from "react-native-gifted-chat";

// Set the log level to 'silent' to disable logging
// setLogLevel("silent");

// Generic function to get a document with offline support
async function getDocumentWithOfflineSupport<T>(
  path: string,
  id: string
): Promise<T | null> {
  try {
    try {
      const docRef = doc(db, path, id);
      const docSnapshot = await getDocFromServer(docRef);
      return docSnapshot.exists() ? { ...docSnapshot.data() } as T : null;
    } catch (serverError) {
      const docRef = doc(db, path, id);
      const docSnapshot = await getDocFromCache(docRef);
      return docSnapshot.exists() ? { ...docSnapshot.data() } as T : null;
    }
  } catch (e) {
    console.error(`Error fetching document from ${path}:`, e);
    throw e;
  }
}

// Generic function to get documents from a query with offline support
async function getDocsWithOfflineSupport<T>(queryToExecute: any): Promise<T[]> {
  try {
    try {
      const querySnapshot = await getDocsFromServer(queryToExecute);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Record<string, any> }) as T);
    } catch (serverError) {
      const querySnapshot = await getDocsFromCache(queryToExecute);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Record<string, any> }) as T);
    }
  } catch (e) {
    console.error("Error fetching documents:", e);
    throw e;
  }
}


// Generic function to handle offline storage
async function saveToOfflineStorage(collectionName: string, id: string, data: any) {
  try {
    const key = `offline_${collectionName}_${id}`;
    await AsyncStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now(),
      pendingOperation: 'create'
    }));
  } catch (error) {
    console.error(`Error saving to offline storage (${collectionName}):`, error);
    throw error;
  }
}

// Generic function to get offline data
async function getFromOfflineStorage(collectionName: string, id: string) {
  try {
    const key = `offline_${collectionName}_${id}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting from offline storage (${collectionName}):`, error);
    return null;
  }
}

// Function to sync offline data when connection is restored
export async function syncOfflineData() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const offlineKeys = keys.filter(key => key.startsWith('offline_'));

    for (const key of offlineKeys) {
      const [_, collectionName, id] = key.split('_');
      const offlineData = await getFromOfflineStorage(collectionName, id);

      if (!offlineData) continue;

      try {
        if (id.startsWith('temp_')) {
          // Handle temporary IDs for collections that use addDoc
          const collectionRef = collection(db, collectionName);
          await addDoc(collectionRef, offlineData.data);
        } else {
          // Handle direct document creation
          const docRef = doc(db, collectionName, id);
          await setDoc(docRef, offlineData.data);
        }

        // Remove from offline storage after successful sync
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error(`Error syncing offline data for ${collectionName}/${id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error during offline sync:", error);
    throw error;
  }
}

// Add to the syncOfflineData function to handle pending messages
async function syncPendingMessages() {
  const keys = await AsyncStorage.getAllKeys();
  const messageKeys = keys.filter(key => key.startsWith('offline_pending_messages_'));

  for (const key of messageKeys) {
    const offlineMessage = await getFromOfflineStorage('pending_messages', key.split('_')[3]);
    if (!offlineMessage) continue;

    try {
      const chatRef = doc(db, 'chats', offlineMessage.data.chatId);
      await addDoc(collection(chatRef, 'messages'), offlineMessage.data.messageData);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error syncing offline message:', error);
    }
  }
}
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

export async function getUser(uid: string): Promise<TUser | null> {
  return getDocumentWithOfflineSupport<TUser>("users", uid);
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
// Enhanced createLandlord with offline support
export async function createLandlord(landlord: Landlord) {
  try {
    const docRef = doc(db, "landlords", landlord.userId);
    await setDoc(docRef, landlord);
  } catch (error) {
    // If offline, save to AsyncStorage
    await saveToOfflineStorage("landlords", landlord.userId, landlord);
    throw new Error("Saved offline. Will sync when connection is restored.");
  }
}

/**
 * Retrieves a landlord document from Firestore by user ID.
 * @param userId - The unique identifier of the landlord.
 * @returns The landlord data or null if no landlord is found.
 */
export async function getLandlord(userId: string): Promise<Landlord | null> {
  return getDocumentWithOfflineSupport<Landlord>("landlords", userId);
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
// Enhanced createTenant with offline support
export async function createTenant(tenant: Tenant) {
  try {
    const docRef = doc(db, "tenants", tenant.userId);
    await setDoc(docRef, tenant);
  } catch (error) {
    await saveToOfflineStorage("tenants", tenant.userId, tenant);
    throw new Error("Saved offline. Will sync when connection is restored.");
  }
}

/**
 * Retrieves a tenant document from Firestore by the `userId` field.
 * @param userId - The UID of the user to match in the `userId` field.
 * @returns An object containing the tenant data and its Firestore document ID, or null if no tenant is found.
 */
export async function getTenant(userId: string): Promise<Tenant | null> {
  return getDocumentWithOfflineSupport<Tenant>("tenants", userId);
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

// Enhanced createResidence with offline support
export async function createResidence(residence: Residence): Promise<string> {
  try {
    const residencesRef = collection(db, "residences");
    const docRef = await addDoc(residencesRef, residence);
    return docRef.id;
  } catch (error) {
    const tempId = `temp_${Date.now()}`;
    await saveToOfflineStorage("residences", tempId, residence);
    return tempId;
  }
}

/**
 * Retrieves a residence document from Firestore by residence ID.
 * @param residenceId - The unique identifier of the residence.
 * @returns The residence data or null if no residence is found.
 */

export async function getResidence(residenceId: string): Promise<Residence | null> {
  return getDocumentWithOfflineSupport<Residence>("residences", residenceId);
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

// Enhanced createApartment with offline support
export async function createApartment(apartment: Apartment): Promise<string> {
  try {
    const apartmentsRef = collection(db, "apartments");
    const docRef = await addDoc(apartmentsRef, apartment);
    return docRef.id;
  } catch (error) {
    const tempId = `temp_${Date.now()}`;
    await saveToOfflineStorage("apartments", tempId, apartment);
    return tempId;
  }
}

/**
 * Retrieves an apartment document from Firestore by apartment ID.
 * @param apartmentId - The unique identifier of the apartment.
 * @returns The apartment data or null if no apartment is found.
 */
export async function getApartment(apartmentId: string): Promise<Apartment | null> {
  return getDocumentWithOfflineSupport<Apartment>("apartments", apartmentId);
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

// Helper function to get pending requests
export async function getPendingRequests(): Promise<MaintenanceRequest[]> {
  try {
    const pending = await AsyncStorage.getItem('pendingMaintenanceRequests');
    return pending ? JSON.parse(pending) : [];
  } catch (error) {
    console.error('Error getting pending requests:', error);
    return [];
  }
}

/**
 * Creates a new maintenance request document in Firestore.
 * @param request - The maintenance request object to be added to the 'maintenanceRequests' collection.
 */
// Modified to handle both online and offline states
export async function createMaintenanceRequest(request: MaintenanceRequest) {
  console.log("coucou");
  try {
    console.log("in try");
    // Try to add to Firestore first
    const requestID = await addDoc(collection(db, "maintenanceRequests"), request);
    await updateMaintenanceRequest(requestID.id, { requestID: requestID.id });
    return requestID.id;
  } catch (error) {
    // If offline or error, save locally
    const pendingRequest = {
      ...request,
      _isPending: true, // Add flag to identify pending requests
      _localId: `pending_${Date.now()}`, // Add local ID for tracking
      requestID: `pending_${Date.now()}` // Temporary ID
    };
    await savePendingRequest(pendingRequest);
    return pendingRequest.requestID;
  }
}

// Helper function to save pending request
async function savePendingRequest(request: MaintenanceRequest) {
  try {
    const pendingRequests = await getPendingRequests();
    await AsyncStorage.setItem(
      'pendingMaintenanceRequests',
      JSON.stringify([...pendingRequests, request])
    );
  } catch (error) {
    console.error('Error saving pending request:', error);
    throw error;
  }
}

/**
 * Retrieves a maintenance request document from Firestore by request ID.
 * @param requestID - The unique identifier of the maintenance request.
 * @returns The maintenance request data or null if no request is found.
 */
export async function getMaintenanceRequest(requestId: string): Promise<MaintenanceRequest | null> {
  return getDocumentWithOfflineSupport<MaintenanceRequest>("maintenanceRequests", requestId);
}


/**
 * Returns a Firestore query for maintenance requests by tenantId.
 * This query can be used with onSnapshot to listen for real-time updates.
 * @param tenantId - The unique identifier of the tenant.
 * @returns A Firestore query for the maintenance requests collection.
 */
export async function getMaintenanceRequestsQuery(userID: string) {
  const q = query(
    collection(db, "maintenanceRequests"),
    where("tenantId", "==", userID)
  );
  
  return q; // Return query for onSnapshot usage
}

// New function to sync pending requests when online
export async function syncPendingRequests() {
  try {
    const pendingRequests = await getPendingRequests();
    if (pendingRequests.length === 0) return;

    for (const request of pendingRequests) {
      const { _isPending, _localId, ...cleanRequest } = request;
      const docRef = await addDoc(collection(db, "maintenanceRequests"), cleanRequest);
      await updateMaintenanceRequest(docRef.id, { requestID: docRef.id });
      // Update the tenant's maintenanceRequests array
      const tenant = await getTenant(request.tenantId);
      if (tenant) {
        await updateTenant(tenant.userId, {
          maintenanceRequests: [...tenant.maintenanceRequests, docRef.id]
        });
      }
    }

    // Clear pending requests after successful sync
    await AsyncStorage.setItem('pendingMaintenanceRequests', JSON.stringify([]));
  } catch (error) {
    console.error('Error syncing pending requests:', error);
    throw error;
  }
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
  return getDocumentWithOfflineSupport<LaundryMachine>(
    `residences/${residenceId}/laundryMachines`,
    machineId
  );
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
// Enhanced validate tenant code with offline support
export async function validateTenantCode(inputCode: string) {
  try {
    const tenantCodesRef = collection(db, "tenantCodes");
    const q = query(tenantCodesRef, where("tenantCode", "==", inputCode));
    const codes = await getDocsWithOfflineSupport<TenantCode>(q);
    
    if (codes.length === 0) {
      // Check offline storage for pending codes
      const keys = await AsyncStorage.getAllKeys();
      const codeKeys = keys.filter(key => key.startsWith('offline_tenantCodes_'));
      
      for (const key of codeKeys) {
        const offlineCode = await getFromOfflineStorage('tenantCodes', key.split('_')[2]);
        if (offlineCode?.data.tenantCode === inputCode && !offlineCode?.data.used) {
          return {
            residenceId: offlineCode.data.residenceId,
            apartmentId: offlineCode.data.apartmentId,
            tenantCodeUID: offlineCode.data.tenantCode
          };
        }
      }
      throw new Error("Code not found");
    }

    const data = codes[0];
    if (data.used) {
      throw new Error("Code already used");
    }

    if (!data.residenceId || !data.apartmentId) {
      throw new Error("Invalid code configuration");
    }

    return {
      residenceId: data.residenceId,
      apartmentId: data.apartmentId,
      tenantCodeUID: data.tenantCode
    };
  } catch (error) {
    console.error("Error validating tenant code:", error);
    throw error;
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
    throw error;
  }
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
  try {
    const q = query(collection(db, `residences/${residenceId}/laundryMachines`));
    return getDocsWithOfflineSupport<LaundryMachine>(q);
  } catch (e) {
    console.error("Error fetching laundry machines:", e);
    throw e;
  }
}

// Enhanced addSituationReport with offline support
export async function addSituationReport(situationReport: SituationReport, apartmentId: string) {
  try {
    const collectionRef = collection(db, "filledReports");
    const docRef = await addDoc(collectionRef, {
      situationReport: situationReport
    });
    
    const apartment = await getApartment(apartmentId);
    const previousReports = apartment?.situationReportId ?? [];
    const nextReports = [docRef.id].concat(previousReports);
    await updateApartment(apartmentId, { situationReportId: nextReports });
  } catch (error) {
    // Store report offline
    const tempId = `temp_${Date.now()}`;
    await saveToOfflineStorage("filledReports", tempId, {
      situationReport,
      apartmentId,
      pendingOperation: 'create'
    });
    throw new Error("Saved offline. Will sync when connection is restored.");
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
  try {
    const apartment = await getApartment(apartmentId);
    const situationReportId = apartment?.situationReportId;

    if (!situationReportId) {
      return null;
    }
    const situationReportRef = doc(db, "situationReports", situationReportId.join('/'));
    const situationReportSnap = await getDoc(situationReportRef);

    return situationReportSnap.data() as SituationReport;
  } catch (e) {
    console.error("Error fetching situation report:", e);
    throw e;
  }
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

// Enhanced sendMessage with offline support
export async function sendMessage(chatId: string, content: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('User must be logged in');
  }

  const user = await getUser(auth.currentUser.uid);

  try {
    const chatRef = doc(db, 'chats', chatId);
    const messageData = {
      content: content,
      sentBy: user?.uid,
      sentOn: Date.now()
    };

    await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
  } catch (error) {
    // Store message offline
    const tempId = `temp_${Date.now()}`;
    await saveToOfflineStorage("pending_messages", tempId, {
      chatId,
      messageData: {
        content,
        sentBy: user?.uid,
        sentOn: Date.now()
      }
    });
    throw new Error("Message saved offline. Will sync when connection is restored.");
  }
}

// Subscribe to messages in a chat
export function subscribeToMessages(
requestId: string,
onMessagesUpdate: (messages: IMessage[]) => void
): () => void {
const chatRef = doc(db, 'chats', requestId);
const messagesRef = collection(chatRef, 'messages');
const q = query(messagesRef, orderBy('sentOn', 'desc'));

// Subscribe to the query
const unsub = onSnapshot(q, (querySnapshot) => {
  const messages = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      _id: doc.id,
      text: data["content"],
      createdAt: data["sentOn"],
      user: {
        _id: data["sentBy"],
      },
    } as IMessage;
  });

  // Update the messages state in the View
  onMessagesUpdate(messages);
});

// Return the unsubscribe function
return unsub;
}

export async function createChatIfNotPresent(requestId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('User must be logged in');
  }

  const chatRef = collection(db, 'chats');
  const chatDocRef = doc(chatRef, requestId); // Create a reference with requestId as the document ID

  // Check if a chat with the given requestId already exists
  const existingChat = await getDoc(chatDocRef);
  if (existingChat.exists()) {
    console.log('Chat already exists');
    return;
  }

  // If no matching chat exists, create a new one with requestId as the document ID
  console.log('Creating new chat');
  await setDoc(chatDocRef, {
    createdAt: serverTimestamp(),
  });
}

