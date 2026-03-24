import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Card, Text } from "react-native-paper";
import { db } from "../../src/config/firebase";

export default function Dashboard() {
  const [stats, setStats] = useState({
    obras: 0,
    evidencias: 0,
    aprobadas: 0,
    rechazadas: 0
  });

  useEffect(() => {
    const cargarDatos = async () => {
      const obrasSnap = await getDocs(collection(db, "obras"));
      const evidenciasSnap = await getDocs(collection(db, "evidencias"));

      const evidencias = evidenciasSnap.docs.map(doc => doc.data());

      setStats({
        obras: obrasSnap.size,
        evidencias: evidenciasSnap.size,
        aprobadas: evidencias.filter(e => e.estado === "aprobada").length,
        rechazadas: evidencias.filter(e => e.estado === "rechazada").length
      });
    };

    cargarDatos();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text variant="titleLarge">Panel Administrativo</Text>

      <Card style={{ marginTop: 10 }}>
        <Card.Content>
          <Text>🏗 Obras: {stats.obras}</Text>
          <Text>📸 Evidencias: {stats.evidencias}</Text>
          <Text>✅ Aprobadas: {stats.aprobadas}</Text>
          <Text>❌ Rechazadas: {stats.rechazadas}</Text>
        </Card.Content>
      </Card>
    </View>
  );
}