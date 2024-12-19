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
import { Alert } from "react-native";
import { useNetworkStore } from "../../app/stores/NetworkStore";

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

export async function createUser(user: TUser) {
  const isOnline = useNetworkStore.getState().isOnline;
  const docRef = doc(db, "users", user.uid);

  if (!isOnline) {
    await saveToOfflineStorage("users", user.uid, user);
    return;
  }

  try {
    await setDoc(docRef, user);
  } catch (e) {
    console.error("Error creating user:", e);
    throw e;
  }
}

export async function getUser(uid: string): Promise<TUser | null> {
  return getDocumentWithOfflineSupport<TUser>("users", uid);
}

export async function updateUser(uid: string, user: Partial<TUser>) {
  const isOnline = useNetworkStore.getState().isOnline;
  
  if (!isOnline) {
    await saveToOfflineStorage("users", uid, user);
    return;
  }

  const docRef = doc(db, "users", uid);
  try {
    await updateDoc(docRef, user);
  } catch (e) {
    console.error("Error updating user:", e);
    throw e;
  }
}

export async function deleteUser(uid: string) {
  const isOnline = useNetworkStore.getState().isOnline;
  
  if (!uid || typeof uid !== "string") {
    throw new Error("Invalid UID");
  }

  if (!isOnline) {
    await saveToOfflineStorage("users", uid, { deleted: true });
    return;
  }
  
  const docRef = doc(db, "users", uid);
  try {
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error deleting user:", e);
    throw e;
  }
}

export async function createLandlord(landlord: Landlord) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    await saveToOfflineStorage("landlords", landlord.userId, landlord);
    return;
  }

  const docRef = doc(db, "landlords", landlord.userId);
  try {
    await setDoc(docRef, landlord);
  } catch (e) {
    console.error("Error creating landlord:", e);
    throw e;
  }
}

export async function getLandlord(userId: string): Promise<Landlord | null> {
  return getDocumentWithOfflineSupport<Landlord>("landlords", userId);
}

export async function updateLandlord(userId: string, landlord: Partial<Landlord>) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    await saveToOfflineStorage("landlords", userId, landlord);
    return;
  }

  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid userId");
  }

  if (!landlord.userId || !landlord.residenceIds) {
    throw new Error("Invalid landlord data");
  }

  const docRef = doc(db, "landlords", userId);
  try {
    await updateDoc(docRef, landlord);
  } catch (e) {
    console.error("Error updating landlord:", e);
    throw e;
  }
}

export async function deleteLandlord(userId: string) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    await saveToOfflineStorage("landlords", userId, { deleted: true });
    return;
  }

  const docRef = doc(db, "landlords", userId);
  try {
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error deleting landlord:", e);
    throw e;
  }
}

export async function createTenant(tenant: Tenant) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    await saveToOfflineStorage("tenants", tenant.userId, tenant);
    return;
  }

  const docRef = doc(db, "tenants", tenant.userId);
  try {
    await setDoc(docRef, tenant);
  } catch (e) {
    console.error("Error creating tenant:", e);
    throw e;
  }
}

export async function getTenant(userId: string): Promise<Tenant | null> {
  return getDocumentWithOfflineSupport<Tenant>("tenants", userId);
}

export async function updateTenant(uid: string, tenant: Partial<Tenant>) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    await saveToOfflineStorage("tenants", uid, tenant);
    return;
  }

  const docRef = doc(db, "tenants", uid);
  try {
    await updateDoc(docRef, tenant);
  } catch (e) {
    console.error("Error updating tenant:", e);
    throw e;
  }
}

export async function deleteTenant(userId: string) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    await saveToOfflineStorage("tenants", userId, { deleted: true });
    return;
  }

  const docRef = doc(db, "tenants", userId);
  try {
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error deleting tenant:", e);
    throw e;
  }
}

export async function createResidence(residence: Residence): Promise<string> {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    const tempId = `temp_${Date.now()}`;
    await saveToOfflineStorage("residences", tempId, residence);
    return tempId;
  }

  const residencesRef = collection(db, "residences");
  try {
    const docRef = await addDoc(residencesRef, residence);
    return docRef.id;
  } catch (e) {
    console.error("Error creating residence:", e);
    throw e;
  }
}

export async function getResidence(residenceId: string): Promise<Residence | null> {
  return getDocumentWithOfflineSupport<Residence>("residences", residenceId);
}

export async function updateResidence(residenceId: string, residence: Partial<Residence>) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    await saveToOfflineStorage("residences", residenceId, residence);
    return;
  }

  const docRef = doc(db, "residences", residenceId);
  try {
    await updateDoc(docRef, residence);
  } catch (e) {
    console.error("Error updating residence:", e);
    throw e;
  }
}

export async function deleteResidence(residenceId: string) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    await saveToOfflineStorage("residences", residenceId, { deleted: true });
    return;
  }

  const docRef = doc(db, "residences", residenceId);
  try {
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error deleting residence:", e);
    throw e;
  }
}

export async function createApartment(apartment: Apartment): Promise<string> {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    const tempId = `temp_${Date.now()}`;
    await saveToOfflineStorage("apartments", tempId, apartment);
    return tempId;
  }

  const apartmentsRef = collection(db, "apartments");
  try {
    const docRef = await addDoc(apartmentsRef, apartment);
    return docRef.id;
    } catch (e) {
    console.error("Error creating apartment:", e);
    throw e;
  }
}

export async function getApartment(apartmentId: string): Promise<Apartment | null> {
  return getDocumentWithOfflineSupport<Apartment>("apartments", apartmentId);
}

export async function updateApartment(apartmentId: string, apartment: Partial<Apartment>) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    await saveToOfflineStorage("apartments", apartmentId, apartment);
    return;
  }

  const docRef = doc(db, "apartments", apartmentId);
  try {
    await updateDoc(docRef, apartment);
  } catch (e) {
    console.error("Error updating apartment:", e);
    throw e;
  }
}

export async function deleteApartment(apartmentId: string) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    await saveToOfflineStorage("apartments", apartmentId, { deleted: true });
    return;
  }

  const docRef = doc(db, "apartments", apartmentId);
  try {
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error deleting apartment:", e);
    throw e;
  }
}

export async function getPendingRequests(): Promise<MaintenanceRequest[]> {
  try {
    const pending = await AsyncStorage.getItem('pendingMaintenanceRequests');
    return pending ? JSON.parse(pending) : [];
  } catch (error) {
    console.error('Error getting pending requests:', error);
    return [];
  }
}

export async function createMaintenanceRequest(request: MaintenanceRequest) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    const pendingRequest = {
      ...request,
      _isPending: true,
      _localId: `pending_${Date.now()}`,
      requestID: `pending_${Date.now()}`
    };
    await savePendingRequest(pendingRequest);
    return pendingRequest.requestID;
  }

  try {
    const requestRef = await addDoc(collection(db, "maintenanceRequests"), request);
    await updateMaintenanceRequest(requestRef.id, { requestID: requestRef.id });
    return requestRef.id;
    } catch (e) {
    console.error("Error creating maintenance request:", e);
    throw e;
  }
}

async function savePendingRequest(request: MaintenanceRequest) {
  try {
    const pendingRequests = await getPendingRequests();
    await AsyncStorage.setItem(
      'pendingMaintenanceRequests',
      JSON.stringify([...pendingRequests, request])
    );
  } catch (error) {
    console.error('Error saving pending request:', error);
  }
}

export async function getMaintenanceRequest(requestId: string): Promise<MaintenanceRequest | null> {
  return getDocumentWithOfflineSupport<MaintenanceRequest>("maintenanceRequests", requestId);
}

export async function getMaintenanceRequestsQuery(userID: string) {
  const q = query(
    collection(db, "maintenanceRequests"),
    where("tenantId", "==", userID)
  );
  return q;
}

export async function syncPendingRequests() {
  const isOnline = useNetworkStore.getState().isOnline;
  if (!isOnline) return;

  try {
    const pendingRequests = await getPendingRequests();
    if (pendingRequests.length === 0) return;

    for (const request of pendingRequests) {
      const { _isPending, _localId, ...cleanRequest } = request;
      const docRef = await addDoc(collection(db, "maintenanceRequests"), cleanRequest);
      await updateMaintenanceRequest(docRef.id, { requestID: docRef.id });
      
      const tenant = await getTenant(request.tenantId);
      if (tenant) {
        await updateTenant(tenant.userId, {
          maintenanceRequests: [...tenant.maintenanceRequests, docRef.id]
        });
      }
    }

    await AsyncStorage.setItem('pendingMaintenanceRequests', JSON.stringify([]));
  } catch (error) {
    console.error('Error syncing pending requests:', error);
  }
}

export async function updateMaintenanceRequest(
  requestID: string,
  request: Partial<MaintenanceRequest>
) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    await saveToOfflineStorage("maintenanceRequests", requestID, request);
    return;
  }

  const docRef = doc(db, "maintenanceRequests", requestID);
  try {
    await updateDoc(docRef, request);
  } catch (e) {
    console.error("Error updating maintenance request:", e);
    throw e;
  }
}

export async function deleteMaintenanceRequest(requestID: string) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    await saveToOfflineStorage("maintenanceRequests", requestID, { deleted: true });
    return;
  }

  const docRef = doc(db, "maintenanceRequests", requestID);
  try {
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error deleting maintenance request:", e);
    throw e;
  }
}

export async function createLaundryMachine(residenceId: string, machine: LaundryMachine) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    await saveToOfflineStorage(`residences/${residenceId}/laundryMachines`, machine.laundryMachineId, machine);
    return;
  }

  const docRef = doc(db, `residences/${residenceId}/laundryMachines`, machine.laundryMachineId);
  try {
    await setDoc(docRef, machine);
  } catch (e) {
    console.error("Error creating washing machine:", e);
    throw e;
  }
}

export async function getLaundryMachine(
  residenceId: string,
  machineId: string
): Promise<LaundryMachine | null> {
  return getDocumentWithOfflineSupport<LaundryMachine>(
    `residences/${residenceId}/laundryMachines`,
    machineId
  );
}

export async function updateLaundryMachine(
  residenceId: string,
  machineId: string,
  machine: Partial<LaundryMachine>
) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    await saveToOfflineStorage(`residences/${residenceId}/laundryMachines`, machineId, machine);
    return;
  }

  if (!residenceId || !machineId) {
    throw new Error("Invalid laundry machine data");
  }

  const docRef = doc(db, `residences/${residenceId}/laundryMachines`, machineId);
  try {
    await updateDoc(docRef, machine);
  } catch (e) {
    console.error("Error updating washing machine:", e);
    throw e;
  }
}

export async function deleteLaundryMachine(residenceId: string, machineId: string) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    await saveToOfflineStorage(`residences/${residenceId}/laundryMachines`, machineId, { deleted: true });
    return;
  }

  const docRef = doc(db, `residences/${residenceId}/laundryMachines`, machineId);
  try {
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error deleting washing machine:", e);
    throw e;
  }
}

export async function generate_unique_code(
  residenceUID: string,
  apartmentUID: string
 ): Promise<string> {
  if (!residenceUID || typeof residenceUID !== "string") {
    throw new Error("Invalid residence UID");
  }
  if (!apartmentUID || typeof apartmentUID !== "string") {
    throw new Error("Invalid apartment UID");
  }
 
  const isOnline = useNetworkStore.getState().isOnline;
  const tenantCode = Math.floor(100000 + Math.random() * 900000).toString();
 
  const newTenantCode: TenantCode = {
    tenantCode: tenantCode,
    apartmentId: apartmentUID,
    residenceId: residenceUID,
    used: false,
  };
 
  if (!isOnline) {
    const tempId = `temp_${Date.now()}`;
    await saveToOfflineStorage("tenantCodes", tempId, newTenantCode);
    return tenantCode;
  }
 
  try {
    const tenantCodesRef = collection(db, "tenantCodes");
    const docRef = await addDoc(tenantCodesRef, newTenantCode);
 
    const residenceRef = doc(db, "residences", residenceUID);
    const residenceSnap = await getDoc(residenceRef);
 
    if (!residenceSnap.exists()) {
      throw new Error(`Residence with UID: ${residenceUID} not found in the residences collection`);
    }
 
    const residenceData = residenceSnap.data() as Residence;
    residenceData.tenantCodesID.push(docRef.id);
    await updateResidence(residenceUID, residenceData);
    return tenantCode;
  } catch (e) {
    console.error("Error generating tenant code:", e);
    throw e;
  }
 }
 
export async function validateTenantCode(inputCode: string) {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
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
    return null;
  }

  try {
    const tenantCodesRef = collection(db, "tenantCodes");
    const q = query(tenantCodesRef, where("tenantCode", "==", inputCode));
    const codes = await getDocsWithOfflineSupport<TenantCode>(q);
    
    if (codes.length === 0) return null;

    const data = codes[0];
    if (data.used) return null;

    if (!data.residenceId || !data.apartmentId) return null;

    return {
      residenceId: data.residenceId,
      apartmentId: data.apartmentId,
      tenantCodeUID: data.tenantCode
    };
  } catch (error) {
    console.error("Error validating tenant code:", error);
    return null;
  }
}

export async function deleteUsedTenantCodes(): Promise<number> {
  const isOnline = useNetworkStore.getState().isOnline;

  if (!isOnline) {
    return 0; // Cannot delete used codes when offline
  }

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
    return 0;
  }
}

export function getLaundryMachinesQuery(residenceId: string) {
  return query(collection(db, `residences/${residenceId}/laundryMachines`));
}

export async function getAllLaundryMachines(residenceId: string): Promise<LaundryMachine[]> {
  try {
    const q = query(collection(db, `residences/${residenceId}/laundryMachines`));
    return getDocsWithOfflineSupport<LaundryMachine>(q);
  } catch (e) {
    console.error("Error fetching laundry machines:", e);
    return [];
  }
}

export async function addSituationReport(situationReport: SituationReport, apartmentId: string) {
  if (!situationReport) {
    throw new Error("Invalid situation report");
  }
  if (!apartmentId || typeof apartmentId !== "string") {
    throw new Error("Invalid apartment ID");
  }
 
  const isOnline = useNetworkStore.getState().isOnline;
 
  if (!isOnline) {
    const tempId = `temp_${Date.now()}`;
    await saveToOfflineStorage("filledReports", tempId, {
      situationReport,
      apartmentId,
      pendingOperation: 'create'
    });
    return;
  }
 
  try {
    const collectionRef = collection(db, "filledReports");
    const docRef = await addDoc(collectionRef, {
      situationReport: situationReport
    });
    
    const apartment = await getApartment(apartmentId);
    if (!apartment) {
      throw new Error(`Apartment with ID: ${apartmentId} not found`);
    }
    
    const previousReports = apartment.situationReportId ?? [];
    const nextReports = [docRef.id].concat(previousReports);
    await updateApartment(apartmentId, { situationReportId: nextReports });
  } catch (e) {
    console.error("Error adding situation report:", e);
    throw e;
  }
 }
 
 export async function addSituationReportLayout(situationReportLayout: string[], residenceId: string) {
  if (!Array.isArray(situationReportLayout)) {
    throw new Error("Invalid situation report layout");
  }
  if (!residenceId || typeof residenceId !== "string") {
    throw new Error("Invalid residence ID");
  }
 
  const isOnline = useNetworkStore.getState().isOnline;
 
  if (!isOnline) {
    await saveToOfflineStorage("residences", residenceId, { situationReportLayout });
    return;
  }
 
  try {
    await updateResidence(residenceId, { situationReportLayout: situationReportLayout });
  } catch (e) {
    console.error("Error adding situation report layout:", e);
    throw e;
  }
 }
 
 export async function getSituationReport(apartmentId: string): Promise<SituationReport | null> {
  if (!apartmentId || typeof apartmentId !== "string") {
    throw new Error("Invalid apartment ID");
  }
 
  try {
    const apartment = await getApartment(apartmentId);
    const situationReportId = apartment?.situationReportId;
 
    if (!situationReportId) return null;
 
    return getDocumentWithOfflineSupport<SituationReport>("situationReports", situationReportId.join('/'));
  } catch (e) {
    console.error("Error fetching situation report:", e);
    return null;
  }
 }
 
 export async function getSituationReportLayout(residenceId: string): Promise<string[]> {
  if (!residenceId || typeof residenceId !== "string") {
    throw new Error("Invalid residence ID");
  }
 
  try {
    const residence = await getResidence(residenceId);
    return residence?.situationReportLayout ?? [];
  } catch (e) {
    console.error("Error getting situation report layout:", e);
    return [];
  }
 }
 
 export async function sendMessage(chatId: string, content: string): Promise<void> {
  if (!chatId || typeof chatId !== "string") {
    throw new Error("Invalid chat ID");
  }
  if (!content || typeof content !== "string") {
    throw new Error("Invalid message content");
  }
  if (!auth.currentUser) {
    throw new Error('User must be logged in');
  }
 
  const isOnline = useNetworkStore.getState().isOnline;
 
  try {
    const user = await getUser(auth.currentUser.uid);
    if (!user) {
      throw new Error("User not found");
    }
 
    if (!isOnline) {
      const tempId = `temp_${Date.now()}`;
      await saveToOfflineStorage("pending_messages", tempId, {
        chatId,
        messageData: {
          content,
          sentBy: user.uid,
          sentOn: Date.now()
        }
      });
      return;
    }
 
    const chatRef = doc(db, 'chats', chatId);
    const messageData = {
      content: content,
      sentBy: user.uid,
      sentOn: Date.now()
    };
 
    await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
  } catch (e) {
    console.error("Error sending message:", e);
    throw e;
  }
 }
 
 export function subscribeToMessages(
  requestId: string,
  onMessagesUpdate: (messages: IMessage[]) => void
 ): () => void {
  if (!requestId || typeof requestId !== "string") {
    throw new Error("Invalid request ID");
  }
  if (typeof onMessagesUpdate !== "function") {
    throw new Error("Invalid callback function");
  }
 
  try {
    const chatRef = doc(db, 'chats', requestId);
    const messagesRef = collection(chatRef, 'messages');
    const q = query(messagesRef, orderBy('sentOn', 'desc'));
 
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
 
      onMessagesUpdate(messages);
    }, (error) => {
      console.error("Error in messages subscription:", error);
      onMessagesUpdate([]);
    });
 
    return unsub;
  } catch (e) {
    console.error("Error setting up messages subscription:", e);
    return () => {}; // Return no-op cleanup function in case of setup error
  }
 }
 
 export async function createChatIfNotPresent(requestId: string): Promise<void> {
  if (!requestId || typeof requestId !== "string") {
    throw new Error("Invalid request ID");
  }
  if (!auth.currentUser) {
    throw new Error('User must be logged in');
  }
 
  const isOnline = useNetworkStore.getState().isOnline;
 
  if (!isOnline) {
    await saveToOfflineStorage("chats", requestId, {
      createdAt: Date.now()
    });
    return;
  }
 
  try {
    const chatRef = collection(db, 'chats');
    const chatDocRef = doc(chatRef, requestId);
 
    const existingChat = await getDoc(chatDocRef);
    if (existingChat.exists()) {
      return;
    }
 
    await setDoc(chatDocRef, {
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Error creating chat:", e);
    throw e;
  }
 }