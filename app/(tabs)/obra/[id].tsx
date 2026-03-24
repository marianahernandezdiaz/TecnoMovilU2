import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { db } from "../../../src/config/firebase";

export default function DetalleObra() {
  const { id } = useLocalSearchParams();

  const [obra, setObra] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    const cargarObra = async () => {
      const docRef = doc(db, "obras", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setObra({ id: docSnap.id, ...docSnap.data() });
      }
    };

    cargarObra();
  }, [id]);

  const cambiarEstatus = async (nuevoEstado: string) => {
    await updateDoc(doc(db, "obras", id as string), {
      estatus: nuevoEstado,
    });

    setObra({ ...obra, estatus: nuevoEstado });
  };

  if (!obra) {
    return <Text style={{ margin: 20 }}>Cargando...</Text>;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>

          <Text style={styles.title}>{obra.nombre}</Text>

          <Text>📍 Lat: {obra.lat}</Text>
          <Text>📍 Lng: {obra.lng}</Text>

          <Text style={styles.estado}>
            Estatus: {obra.estatus}
          </Text>

          {/* 🔥 CAMBIAR ESTATUS */}
          <Button onPress={() => cambiarEstatus("En proceso")}>
            Iniciar obra
          </Button>

          <Button onPress={() => cambiarEstatus("Finalizando")}>
            Finalizar obra
          </Button>

          {/* 🔥 ACCIONES */}
          <Button
            mode="contained"
            style={styles.btn}
            onPress={() =>
              router.push(`/reportar?obraId=${id}`)
            }
          >
            Crear evidencia
          </Button>

          <Button
            mode="outlined"
            style={{ marginTop: 10 }}
            onPress={() => router.push(`../historial/${id}`)}
          >
            Ver historial
          </Button>

        </Card.Content>
      </Card>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    padding: 20,
  },

  card: {
    borderRadius: 20,
    padding: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0A84FF",
    marginBottom: 10,
  },

  estado: {
    marginVertical: 10,
    color: "#34C759",
    fontWeight: "bold",
  },

  btn: {
    marginTop: 10,
    backgroundColor: "#0A84FF",
  },
});