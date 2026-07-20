// ======================================
// FIREBASE CONFIGURATION
// ======================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import { getStorage } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyC6XXYBFGmtgwnlw3SXc-wlpQq87Wm7sK8",
    authDomain: "khatha-management.firebaseapp.com",
    projectId: "khatha-management",
    storageBucket: "khatha-management.firebasestorage.app",
    messagingSenderId: "428993546830",
    appId: "1:428993546830:web:7ab8886e4963d8be9b511f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Export
export { app, db, auth, storage };