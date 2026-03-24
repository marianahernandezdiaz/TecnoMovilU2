import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";

export const useUser = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const cargar = async () => {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) return;

      const docSnap = await getDoc(doc(db, "usuarios", firebaseUser.uid));

      if (docSnap.exists()) {
        setUser({
          uid: firebaseUser.uid,
          ...docSnap.data()
        });
      }
    };

    cargar();
  }, []);

  return user;
};