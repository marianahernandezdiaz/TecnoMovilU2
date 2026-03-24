import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { db } from "../../src/config/firebase";

export default function Historial() {
  const { id } = useLocalSearchParams();
  const [evidencias, setEvidencias] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const q = query(collection(db, "evidencias"), where("obraId", "==", id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvidencias(data);
    });

    return unsubscribe;
  }, [id]);

  const actualizarEstado = async (evidenciaId: string, nuevoEstado: string) => {
    try {
      const ref = doc(db, "evidencias", evidenciaId);
      await updateDoc(ref, { estado: nuevoEstado });
      alert(`Evidencia marcada como ${nuevoEstado}`);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar estado");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ENCABEZADO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#0A84FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historial de Evidencias</Text>
      </View>

      {evidencias.length === 0 ? (
        <Text style={styles.empty}>No hay evidencias</Text>
      ) : (
        evidencias.map((item) => (
          <Card key={item.id} style={styles.card}>
            <Card.Content>
              <Image source={{ uri: item.imagen }} style={styles.image} />

              <Text style={styles.descripcion}>
                {item.descripcion || "Sin descripción"}
              </Text>

              <Text style={styles.fecha}>
                {new Date(item.fecha).toLocaleString()}
              </Text>

              <Text
                style={[
                  styles.estado,
                  item.estado === "aprobada"
                    ? { color: "#34C759" }
                    : item.estado === "rechazada"
                    ? { color: "#FF3B30" }
                    : { color: "#FB8C00" },
                ]}
              >
                Estado: {item.estado}
              </Text>

              <Text style={styles.coords}>
                📍 {item.lat}, {item.lng}
              </Text>

              {/* BOTONES DE ACCIÓN */}
              <View style={styles.actions}>
                <Button
                  mode="contained"
                  style={styles.btnAprobar}
                  onPress={() => actualizarEstado(item.id, "aprobada")}
                >
                  Aprobar
                </Button>
                <Button
                  mode="contained"
                  style={styles.btnRechazar}
                  onPress={() => actualizarEstado(item.id, "rechazada")}
                >
                  Rechazar
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F4F6F8",
    padding: 15,
  },
  header: {
    backgroundColor: "#E3F2FD",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0A84FF",
  },
  card: {
    marginBottom: 15,
    borderRadius: 15,
    elevation: 3,
    backgroundColor: "#fff",
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
    color: "#1C1C1E",
    fontWeight: "500",
  },
  fecha: {
    fontSize: 12,
    color: "#999",
  },
  estado: {
    marginTop: 5,
    fontWeight: "bold",
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
    fontSize: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  btnAprobar: {
    backgroundColor: "#34C759",
    flex: 1,
    marginRight: 5,
  },
  btnRechazar: {
    backgroundColor: "#FF3B30",
    flex: 1,
    marginLeft: 5,
  },
});