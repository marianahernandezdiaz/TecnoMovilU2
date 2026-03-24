import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { auth, db } from "../../src/config/firebase";

export default function Aprobaciones() {
  const [evidencias, setEvidencias] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "evidencias"),
      where("estado", "==", "pendiente")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvidencias(data);
    });

    return unsubscribe;
  }, []);

  const actualizarEstado = async (id: string, estado: string) => {
    await updateDoc(doc(db, "evidencias", id), {
      estado,
      supervisorId: auth.currentUser?.uid
    });
  };

  return (
    <View style={{ padding: 15 }}>
      <Text variant="titleLarge">Aprobación de evidencias</Text>

      {evidencias.map(item => (
        <Card key={item.id} style={{ marginTop: 10 }}>
          <Card.Content>

            <Image source={{ uri: item.imagen }} style={{ height: 200 }} />

            <Text>{item.descripcion}</Text>

            <Button onPress={() => actualizarEstado(item.id, "aprobada")}>
              ✅ Aprobar
            </Button>

            <Button onPress={() => actualizarEstado(item.id, "rechazada")}>
              ❌ Rechazar
            </Button>

          </Card.Content>
        </Card>
      ))}
    </View>
  );
}