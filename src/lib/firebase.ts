
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "ali-respeaker",
  appId: "1:659166974032:web:e8019120defeb0c2708155",
  storageBucket: "ali-respeaker.firebasestorage.app",
  apiKey: "AIzaSyAS5gW2UjUsMF-F1qPfzKn1bQQ1VHziwNA",
  authDomain: "ali-respeaker.firebaseapp.com",
  messagingSenderId: "659166974032",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
