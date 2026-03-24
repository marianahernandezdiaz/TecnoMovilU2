import { Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../src/config/firebase";

// ✅ Tipo
type AppUser = {
  uid: string;
  email: string | null;
  rol: string;
};

export default function RootLayout() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {

    if (firebaseUser) {
      try {
        const docRef = doc(db, "usuarios", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            rol: docSnap.data().rol,
          });
        } else {
          // 🔥 fallback
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            rol: "operador"
          });
        }

      } catch (error) {
        console.log("Error obteniendo usuario:", error);

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          rol: "operador"
        });
      }

    } else {
      // 🔥 usuario no logueado
      setUser(null);
    }

    // 🔥 SIEMPRE se ejecuta
    setLoading(false);
  });

  return unsubscribe;
}, []);

return (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="(tabs)" />
  </Stack>
);
}