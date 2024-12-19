import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  User,
  signOut,
  deleteUser,
  createUserWithEmailAndPassword,
  updateEmail,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
  verifyBeforeUpdateEmail,
} from 'firebase/auth';

export enum UserType {
  TENANT = 'Tenant',
  LANDLORD = 'Landlord',
  UNAUTHENTICATED = 'Unauthenticated',
}

// TODO add user data to firestore
export async function emailAndPasswordSignIn(
  email: string,
  password: string,
): Promise<User | null> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    return user;
  } catch (error) {
    return null;
  }
}

export async function emailAndPasswordLogIn(
  email: string,
  password: string,
): Promise<User | null> {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  return userCredential.user;
}

export async function deleteAccount() {
  if (auth.currentUser !== null) {
    try {
      await deleteUser(auth.currentUser);
    } catch (error) {}
  } 
}

export async function signOutUser(
  successCallback: Function,
  errorCallback: Function,
) {
  if (auth.currentUser !== null) {
    try {
      await signOut(auth);
      successCallback();
    } catch (error) {
      errorCallback(error);
    }
  }
}

export async function changeUserPassword(
  currentPassword: string,
  newPassword: string,
) {
  if (auth.currentUser !== null) {
    try {
      const email = auth.currentUser.email;
      if (!email) throw new Error('User email not found.');

      if (!currentPassword) throw new Error('Reauthentication cancelled.');

      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);
    } catch (error) {
      throw error;
    }
  } else {
    throw new Error('No authenticated user found.');
  }
}

export async function updateUserEmail(newEmail: string) {
  if (auth.currentUser !== null) {
    await updateEmail(auth.currentUser, newEmail);
  }
}

export async function updateUserEmailAuth(password: string, newEmail: string) {
  if (auth.currentUser !== null) {
    try {
      const email = auth.currentUser.email;
      if (!email) throw new Error('User email not found.');

      if (!password) throw new Error('Reauthentication cancelled.');

      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Use verifyBeforeUpdateEmail instead of updateEmail
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
    } catch (error) {
      throw error;
    }
  } else {
    throw new Error('No authenticated user found.');
  }
}
