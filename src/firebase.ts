import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAr4EXIcWoxJ6A6ew0e5CWtmmz3yBP1CkE",
  authDomain: "client-e2c68.firebaseapp.com",
  projectId: "client-e2c68",
  storageBucket: "client-e2c68.appspot.com",
  messagingSenderId: "545951648502",
  appId: "1:545951648502:web:0d4f92b1336ac0830dfad7",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
