import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyClSrJzzqN5VbmAToSHmiTMnjXpcC3cCi4",
  authDomain: "ai-interviewer-aac28.firebaseapp.com",
  projectId: "ai-interviewer-aac28",
  storageBucket: "ai-interviewer-aac28.firebasestorage.app",
  messagingSenderId: "233200773398",
  appId: "1:233200773398:web:c92057db9335582286c837"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();