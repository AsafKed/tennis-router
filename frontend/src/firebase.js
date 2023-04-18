// This file is used for authenticating users
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// import { getDatabase } from "firebase/database";

// Web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCEKbSV25AeW3dJ1M-k1tAwZ-1UfwqhWtM",
  authDomain: "tennis-router.firebaseapp.com",
  projectId: "tennis-router",
  storageBucket: "tennis-router.appspot.com",
  messagingSenderId: "169096810321",
  appId: "1:169096810321:web:f252b5e836255d32884d70",
  measurementId: "G-9EMXPC3D42",
//   databaseURL: "https://tennis-router-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// const database = getDatabase(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export default app;