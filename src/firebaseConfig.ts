// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBBz7b0jPAGkF9SCpvonz3kOEfr5l1pN9o",
  authDomain: "sem2-deb79.firebaseapp.com",
  projectId: "sem2-deb79",
  storageBucket: "sem2-deb79.appspot.com", // ✅ corrigé ici
  messagingSenderId: "703940177721",
  appId: "1:703940177721:web:43e3e6de2ff291a93e02e8",
  measurementId: "G-CYPYC0ZXNJ"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Exports corrects
export { app, auth, db, storage, analytics };
