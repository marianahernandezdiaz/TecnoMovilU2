import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { db } from "../../../src/config/firebase";
import { useUser } from "../../../src/hooks/useUser";

export default function DetalleObra() {
  const { id } = useLocalSearchParams();
  const user = useUser();
  const [obra, setObra] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [supervisorNombre, setSupervisorNombre] = useState("");

  useEffect(() => {
    if (!id) return;

    const cargarObra = async () => {
      try {
        const docRef = doc(db, "obras", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data: any = { id: docSnap.id, ...docSnap.data() };
          setObra(data);

          if (data.supervisorId) {
            const supRef = doc(db, "usuarios", data.supervisorId);
            const supSnap = await getDoc(supRef);

            if (supSnap.exists()) {
              setSupervisorNombre(
                supSnap.data().nombre || supSnap.data().email
              );
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar obra:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarObra();
  }, [id]);

  const cambiarEstatus = async (nuevoEstado: string) => {
    try {
      await updateDoc(doc(db, "obras", id as string), { estatus: nuevoEstado });
      setObra({ ...obra, estatus: nuevoEstado });
    } catch (error) {
      console.error("Error al actualizar estatus:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  if (!obra) {
    return (
      <View style={styles.center}>
        <Text>No se encontró la obra.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* ENCABEZADO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#0A84FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle de Obra</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{obra.nombre}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Latitud:</Text>
            <Text> {obra.lat}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Longitud:</Text>
            <Text> {obra.lng}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Supervisor:</Text>
            <Text> {supervisorNombre || "No asignado"}</Text>
          </View>

          <Text style={styles.estado}>Estatus actual: {obra.estatus}</Text>

          {/* ACCIONES ADMINISTRADOR */}
          {user?.rol === "administrador" && (
            <View style={styles.section}>
              <Button
                mode="contained"
                onPress={() => cambiarEstatus("Finalizando")}
                style={[styles.btn, { backgroundColor: "#0A84FF" }]}
              >
                Finalizar obra
              </Button>
            </View>
          )}

          {/* ACCIONES OPERADOR */}
          {user?.rol === "operador" && (
            <Button
              mode="contained"
              style={[styles.btn, { backgroundColor: "#0A84FF" }]}
              onPress={() => router.push(`/reportar?obraId=${id}`)}
            >
              Crear evidencia
            </Button>
          )}

          {/* ACCIONES SUPERVISOR */}
          {user?.rol === "supervisor" && (
            <View style={styles.section}>
              <Button
                mode="contained"
                style={[styles.btn, { backgroundColor: "#34C759" }]}
                onPress={() => router.push(`/supervisor/aprobaciones?id=${id}`)}
              >
                Ir a aprobaciones
              </Button>
            </View>
          )}

          <Button
            mode="outlined"
            style={styles.btnHistorial}
            onPress={() => router.push(`/historial/${id}`)}
          >
            Ver historial
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    borderRadius: 20,
    padding: 10,
    elevation: 4,
    backgroundColor: "#fff",
    marginHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0A84FF",
    marginBottom: 15,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
    color: "#555",
  },
  estado: {
    marginVertical: 15,
    color: "#34C759",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "#E8F5E9",
    padding: 8,
    borderRadius: 10,
  },
  section: {
    marginVertical: 10,
  },
  btn: {
    marginTop: 10,
    borderRadius: 8,
  },
  btnHistorial: {
    marginTop: 20,
    borderColor: "#0A84FF",
  },
});