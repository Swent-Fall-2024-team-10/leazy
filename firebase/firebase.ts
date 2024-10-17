// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from "firebase/storage";
import { setLogLevel } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Enable logs
setLogLevel("debug");

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7aViCzGhq5Q6Qxsl0EtVyTPl-eShdZdA",
  authDomain: "leazy-659ef.firebaseapp.com",
  projectId: "leazy-659ef",
  storageBucket: "leazy-659ef.appspot.com",
  messagingSenderId: "667437973264",
  appId: "1:667437973264:web:690dc9e02be951206a6f95",
  measurementId: "G-96LJJ14YGQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const storage = getStorage(app);
