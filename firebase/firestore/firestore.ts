import { db } from "../firebase";
import { 
    setDoc, 
    doc,
    getDoc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";

/*temporary solutions before knwoing the DB schema*/
export async function createTenantUser(email: string, tenantData: TTenantData, uid: string){
    const docRef = doc(db, "tenants", uid);
    await setDoc(docRef, tenantData);
}

export async function createLandlordUser(email: string, landlordData: TLandlordData, uid: string){
    const docRef = doc(db, "landlords", uid);
    await setDoc(docRef, landlordData);
}

export async function getTenantData(uid: string): Promise<TTenantData | null>{
    const docRef = doc(db, "tenants", uid);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        return docSnap.data() as TTenantData;
    } else {
        return null;
    }
}

export async function getLandlordData(uid: string): Promise<TLandlordData | null>{
    const docRef = doc(db, "landlords", uid);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        return docSnap.data() as TLandlordData;
    } else {
        return null;
    }
}

export async function updateTenantData(uid: string, tenantData: Partial<TTenantData>){
    const docRef = doc(db, "tenants", uid);
    await updateDoc(docRef, tenantData);
}

export async function updateLandlordData(uid: string, landlordData: Partial<TLandlordData>){
    const docRef = doc(db, "landlords", uid);
    await updateDoc(docRef, landlordData);
}

export async function deleteTenantData(uid: string){
    const docRef = doc(db, "tenants", uid);
    await deleteDoc(docRef);
}

export async function deleteLandlordData(uid: string){
    const docRef = doc(db, "landlords", uid);
    await deleteDoc(docRef);
}
