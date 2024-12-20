import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAFILbquXJa7Ul8-CrvMj2hi4YR9QKdHa4",
    authDomain: "voting-2ee88.firebaseapp.com",
    projectId: "voting-2ee88",
    databaseURL: "https://voting-2ee88-default-rtdb.europe-west1.firebasedatabase.app/",
    storageBucket: "voting-2ee88.firebasestorage.app",
    messagingSenderId: "182017302346",
    appId: "1:182017302346:web:384fa31511942669366bb3",
    measurementId: "G-HYGSWQLVV5"
  };

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
