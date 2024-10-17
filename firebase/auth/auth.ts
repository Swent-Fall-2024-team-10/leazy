import { 
    auth 
} from "../firebase";
import { 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    User, 
    signOut, 
    deleteUser, 
    createUserWithEmailAndPassword,
    updateEmail,
    updatePassword,
    connectAuthEmulator
} from "firebase/auth";
import { TLandlordData, TTenantData } from "../../types/types";
const provider = new GoogleAuthProvider();

connectAuthEmulator(auth, "http://localhost:9099");

export enum UserType {
    TENANT,
    LANDLORD,
    UNAUTHENTICATED
}

export async function emailAndPasswordSignIn(email: string, password: string, userType: UserType, userData: TLandlordData | TTenantData): Promise<User|null>{
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if(userType === UserType.TENANT){
            console.log("Creating tenant user in firestore");
        } else if(userType === UserType.LANDLORD){
            console.log("Creating landlord user in firestore");
        }
        return user;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function emailAndPasswordLogIn(email: string, password:string): Promise<User|null>{
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

export async function deleteAccount(){
    if(auth.currentUser !== null){
        try {
            console.log("Deleting user data");
            await deleteUser(auth.currentUser);
        }
        catch (error) {
            
        }
    } else {
        console.log("User is not signed in");
        // maybe create error objects
    }
}

export async function signOutUser(successCallback: Function, errorCallback: Function){
    if(auth.currentUser !== null){
        try {
            await signOut(auth);
            successCallback();
        }
        catch (error) {
            errorCallback(error);
        }
    } else {
        console.log("User is not signed in");
        // maybe create error objects
    }
}


export async function resetUserPassword(newPassoword: string){
    if(auth.currentUser !== null){
        await updatePassword(auth.currentUser, newPassoword);
    }
}

export async function updateUserEmail(newEmail: string){
    if(auth.currentUser !== null) {
        await updateEmail(auth.currentUser, newEmail);
    }
}
