import { Stack } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
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
        const docRef = doc(db, "usuarios", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            rol: docSnap.data().rol,
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 🔥 Pantalla de carga
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="(auth)/login" />
      ) : user.rol === "administrador" ? (
        <Stack.Screen name="admin/dashboard" />
      ) : user.rol === "supervisor" ? (
        <Stack.Screen name="supervisor/home" />
      ) : (
        <Stack.Screen name="(tabs)" />
      )}
    </Stack>
  );
}