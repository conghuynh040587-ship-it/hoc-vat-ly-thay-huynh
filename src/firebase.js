import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Thay cấu hình của thầy vào đây (lấy từ Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const firestoreDb = getFirestore(app);
