// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mediplus-cac16.firebaseapp.com",
  projectId: "mediplus-cac16",
  storageBucket: "mediplus-cac16.appspot.com",
  messagingSenderId: "430947985842",
  appId: "1:430947985842:web:c9c5dd7175dbe554999cab"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);