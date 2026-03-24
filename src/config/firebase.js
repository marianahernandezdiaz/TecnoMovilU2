import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrPM7rY33mL6Du5-bteF57KQ-piXKCwd8",
  authDomain: "tecnomovil-1f287.firebaseapp.com",
  projectId: "tecnomovil-1f287",
  storageBucket: "tecnomovil-1f287.firebasestorage.app",
  messagingSenderId: "395136483267",
  appId: "1:395136483267:web:8a3878c964f0752efe4776"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);