import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB2ssJo7a11pHAe25Ph1uA0t69LKK4ssBM",
  authDomain: "chat-app-dfcfb.firebaseapp.com",
  projectId: "chat-app-dfcfb",
  storageBucket: "chat-app-dfcfb.appspot.com",
  messagingSenderId: "102203903295",
  appId: "1:102203903295:web:72f96cf4fc63192702178a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exporting Firebase services
export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
