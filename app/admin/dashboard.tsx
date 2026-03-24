import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { db } from "../../src/config/firebase";

export default function Dashboard() {
  const [stats, setStats] = useState({
    obras: 0,
    evidencias: 0,
    aprobadas: 0,
    rechazadas: 0,
  });

  useEffect(() => {
    const cargarDatos = async () => {
      const obrasSnap = await getDocs(collection(db, "obras"));
      const evidenciasSnap = await getDocs(collection(db, "evidencias"));

      const evidencias = evidenciasSnap.docs.map((doc) => doc.data());

      setStats({
        obras: obrasSnap.size,
        evidencias: evidenciasSnap.size,
        aprobadas: evidencias.filter((e) => e.estado === "aprobada").length,
        rechazadas: evidencias.filter((e) => e.estado === "rechazada").length,
      });
    };

    cargarDatos();
  }, []);


  return (
    <ScrollView style={styles.container}>
      {/* ENCABEZADO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#0A84FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panel Administrativo</Text>
      </View>

      <View style={styles.grid}>
        <Card style={[styles.card, { backgroundColor: "#E3F2FD" }]}>
          <Card.Content style={styles.cardContent}>
            <MaterialCommunityIcons name="office-building" size={28} color="#0A84FF" />
            <Text style={styles.cardLabel}>Obras</Text>
            <Text style={styles.cardValue}>{stats.obras}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: "#FFF3E0" }]}>
          <Card.Content style={styles.cardContent}>
            <MaterialCommunityIcons name="file-document" size={28} color="#FB8C00" />
            <Text style={styles.cardLabel}>Evidencias</Text>
            <Text style={styles.cardValue}>{stats.evidencias}</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.grid}>
        <Card style={[styles.card, { backgroundColor: "#E8F5E9" }]}>
          <Card.Content style={styles.cardContent}>
            <MaterialCommunityIcons name="check-circle" size={28} color="#34C759" />
            <Text style={styles.cardLabel}>Aprobadas</Text>
            <Text style={styles.cardValue}>{stats.aprobadas}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: "#FFEBEE" }]}>
          <Card.Content style={styles.cardContent}>
            <MaterialCommunityIcons name="close-circle" size={28} color="#FF3B30" />
            <Text style={styles.cardLabel}>Rechazadas</Text>
            <Text style={styles.cardValue}>{stats.rechazadas}</Text>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F4F6F8",
    flex: 1,
  },
  header: {
    backgroundColor: "#E3F2FD", // azul claro
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
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
    marginTop: 25,
    marginBottom: 10,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  card: {
    width: "48%",
    marginBottom: 15,
    borderRadius: 16,
    elevation: 3,
  },
  cardContent: {
    alignItems: "center",
    paddingVertical: 15,
  },
  cardLabel: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginTop: 4,
  },
});