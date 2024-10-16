import { db } from "../firebase";
import { 
    setDoc, 
    doc,
    getDoc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";

import { User, Person, Landlord, Tenant, Residence, Apartment, Address, LaundryMachine, MaintenanceRequest } from "../../types/types";

export async function createUser(user: User){
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, user);
}

export async function getUser(uid: string): Promise<User | null>{
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if(docSnap.exists()){
        return docSnap.data() as User;
    } else {
        return null;
    }
}

export async function updateUser(uid: string, user: Partial<User>){
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, user);
}

export async function deleteUser(uid: string){
    const docRef = doc(db, "users", uid);
    await deleteDoc(docRef);
}