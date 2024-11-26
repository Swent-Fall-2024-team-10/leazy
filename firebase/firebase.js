/* istanbul ignore file */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.auth = exports.db = void 0;
// Import the functions you need from the SDKs you need
var app_1 = require("firebase/app");
var analytics_1 = require("firebase/analytics");
var firestore_1 = require("firebase/firestore");
var auth_1 = require("firebase/auth");
var storage_1 = require("firebase/storage");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
var firebaseConfig = {
    apiKey: "AIzaSyA7aViCzGhq5Q6Qxsl0EtVyTPl-eShdZdA",
    authDomain: "leazy-659ef.firebaseapp.com",
    projectId: "leazy-659ef",
    storageBucket: "leazy-659ef.appspot.com",
    messagingSenderId: "667437973264",
    appId: "1:667437973264:web:690dc9e02be951206a6f95",
    measurementId: "G-96LJJ14YGQ"
};
// Initialize Firebase
var app = (0, app_1.initializeApp)(firebaseConfig);
var analytics = (0, analytics_1.getAnalytics)(app);
exports.db = (0, firestore_1.getFirestore)(app);
exports.auth = (0, auth_1.getAuth)(app);
exports.storage = (0, storage_1.getStorage)(app);
