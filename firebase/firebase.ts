// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7aViCzGhq5Q6Qxsl0EtVyTPl-eShdZdA",
  authDomain: "leazy-659ef.firebaseapp.com",
  projectId: "leazy-659ef",
  storageBucket: "leazy-659ef.appspot.com",
  messagingSenderId: "667437973264",
  appId: "1:667437973264:web:690dc9e02be951206a6f95",
  measurementId: "G-96LJJ14YGQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);