import { useLocalSearchParams } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import { db } from "../../../src/config/firebase";

export default function Historial() {
  const { id } = useLocalSearchParams();

  const [evidencias, setEvidencias] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const q = query(
      collection(db, "evidencias"),
      where("obraId", "==", id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setEvidencias(data);
    });

    return unsubscribe;
  }, [id]);

return (
  <ScrollView contentContainerStyle={styles.container}>
    
    <Text style={styles.title}>Historial de evidencias</Text>

    {evidencias.length === 0 ? (
      <Text style={styles.empty}>No hay evidencias</Text>
    ) : (
      evidencias.map((item) => (
        <Card key={item.id} style={styles.card}>
          <Card.Content>

            <Image
              source={{ uri: item.imagen }}
              style={styles.image}
            />

            <Text style={styles.descripcion}>
              {item.descripcion || "Sin descripción"}
            </Text>

            <Text style={styles.fecha}>
              {new Date(item.fecha).toLocaleString()}
            </Text>

            <Text style={styles.estado}>
              Estado: {item.estado}
            </Text>

            <Text style={styles.coords}>
              📍 {item.lat}, {item.lng}
            </Text>

          </Card.Content>
        </Card>
      ))
    )}

  </ScrollView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    padding: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0A84FF",
    marginBottom: 10,
  },

  card: {
    marginBottom: 15,
    borderRadius: 15,
    elevation: 3,
  },

  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },

  descripcion: {
    fontSize: 16,
    marginBottom: 5,
  },

  fecha: {
    fontSize: 12,
    color: "#999",
  },

  estado: {
    marginTop: 5,
    fontWeight: "bold",
    color: "#34C759",
  },

  coords: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#999",
  },
});