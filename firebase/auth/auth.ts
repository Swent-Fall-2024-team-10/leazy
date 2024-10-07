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
    UserCredential, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword,
    updateEmail,
    updatePassword
} from "firebase/auth";
import { 
    createTenantUser, 
    createLandlordUser,
    deleteLandlordData,
    deleteTenantData,
} from "../firestore/firestore";

const provider = new GoogleAuthProvider();

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
            await createTenantUser(email, userData as TTenantData, user.uid);
        } else if(userType === UserType.LANDLORD){
            await createLandlordUser(email, userData as TLandlordData, user.uid);
        }
        return user;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function googleSignIn(userType:UserType, userData: TLandlordData | TTenantData): Promise<User | null>{
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;

        if(user.email !== null){
            if(userType === UserType.TENANT){
                createTenantUser(user.email, userData as TTenantData, user.uid);
            } else if(userType === UserType.LANDLORD){
                createLandlordUser(user.email, userData as TLandlordData, user.uid);
            }
            return user;
        } else {
            return null;
        }
}



export async function GoogleLogIn(): Promise<User|null>{
    const userCredential = await signInWithPopup(auth, provider);
    userCredential.user
    return userCredential.user;
}

export async function emailAndPasswordLogIn(email: string, password:string): Promise<User|null>{
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

export async function deleteAccount(){
    if(auth.currentUser !== null){
        try {
            // figure out what data to delete after talking with adrien
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
