// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCq5-4zfEBeswLACwvZAQa2pC-X9Dez3Yg",
  authDomain: "hortoconnect.firebaseapp.com",
  projectId: "hortoconnect",
  storageBucket: "hortoconnect.firebasestorage.app",
  messagingSenderId: "446813848858",
  appId: "1:446813848858:web:376845258f8cbe3cf098a3",
  measurementId: "G-21L71YY7JN"
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
export { auth, db }

