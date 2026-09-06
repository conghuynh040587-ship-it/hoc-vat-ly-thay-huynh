import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Thay cấu hình của thầy vào đây (lấy từ Firebase Console)
const firebaseConfig = {
apiKey: "AIzaSyBqd_NK7P7nUSe77E0K08OMKe62wc9bvIU",
  authDomain: "vatlythayhuynh.firebaseapp.com",
  projectId: "vatlythayhuynh",
  storageBucket: "vatlythayhuynh.firebasestorage.app",
  messagingSenderId: "758843252383",
  appId: "1:758843252383:web:d00b554666720089fb4caa",
  measurementId: "G-3JPRECB4GQ"
};

const app = initializeApp(firebaseConfig);
export const firestoreDb = getFirestore(app);
