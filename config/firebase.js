// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbEC83kMIjPv1Nup_iAsonCliSNAB5sTc",
  authDomain: "andrepreneurs-dc9cf.firebaseapp.com",
  projectId: "andrepreneurs-dc9cf",
  storageBucket: "andrepreneurs-dc9cf.firebasestorage.app",
  messagingSenderId: "453226988509",
  appId: "1:453226988509:web:a1c031c215a4f61149ec34"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;