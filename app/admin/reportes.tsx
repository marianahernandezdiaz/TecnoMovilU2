import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { db } from "../../src/config/firebase";

export default function Reportes() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    aprobadas: 0,
    rechazadas: 0,
    pendientes: 0,
  });

  useEffect(() => {
    const cargar = async () => {
      const snapshot = await getDocs(collection(db, "evidencias"));
      const evidencias = snapshot.docs.map((doc) => doc.data());

      setData(evidencias);
      setStats({
        total: evidencias.length,
        aprobadas: evidencias.filter((e) => e.estado === "aprobada").length,
        rechazadas: evidencias.filter((e) => e.estado === "rechazada").length,
        pendientes: evidencias.filter((e) => e.estado === "pendiente").length,
      });
    };

    cargar();
  }, []);

  const generarPDF = async () => {
    setLoading(true);
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 30px; background: #f9f9f9; }
              h1 { color: #0A84FF; text-align: center; margin-bottom: 30px; }
              .summary { display: flex; justify-content: space-around; margin-bottom: 30px; }
              .card { background: #fff; padding: 15px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); text-align: center; width: 22%; }
              .card h2 { margin: 0; font-size: 18px; color: #333; }
              .card p { font-size: 20px; font-weight: bold; margin-top: 5px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #0A84FF; color: #fff; }
              .aprobada { color: #34C759; font-weight: bold; }
              .rechazada { color: #FF3B30; font-weight: bold; }
              .pendiente { color: #FB8C00; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Reporte de Evidencias</h1>
            <div class="summary">
              <div class="card"><h2>Total</h2><p>${stats.total}</p></div>
              <div class="card"><h2>Aprobadas</h2><p>${stats.aprobadas}</p></div>
              <div class="card"><h2>Rechazadas</h2><p>${stats.rechazadas}</p></div>
              <div class="card"><h2>Pendientes</h2><p>${stats.pendientes}</p></div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(e => `
                  <tr>
                    <td>${e.descripcion || "Sin descripción"}</td>
                    <td class="${e.estado}">${e.estado}</td>
                    <td>${e.fecha ? new Date(e.fecha).toLocaleString() : "N/A"}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error(error);
      alert("Error al generar el PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ENCABEZADO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#0A84FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panel de Reportes</Text>
      </View>

      <View style={styles.statsRow}>
        <Card style={[styles.card, { backgroundColor: "#E3F2FD" }]}>
          <Card.Content>
            <MaterialCommunityIcons name="file-document" size={28} color="#0A84FF" />
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{stats.total}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: "#E8F5E9" }]}>
          <Card.Content>
            <MaterialCommunityIcons name="check-circle" size={28} color="#34C759" />
            <Text style={styles.statLabel}>Aprobadas</Text>
            <Text style={styles.statValue}>{stats.aprobadas}</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.statsRow}>
        <Card style={[styles.card, { backgroundColor: "#FFEBEE" }]}>
          <Card.Content>
            <MaterialCommunityIcons name="close-circle" size={28} color="#FF3B30" />
            <Text style={styles.statLabel}>Rechazadas</Text>
            <Text style={styles.statValue}>{stats.rechazadas}</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.card, { backgroundColor: "#FFF3E0" }]}>
          <Card.Content>
            <MaterialCommunityIcons name="clock-outline" size={28} color="#FB8C00" />
            <Text style={styles.statLabel}>Pendientes</Text>
            <Text style={styles.statValue}>{stats.pendientes}</Text>
          </Card.Content>
        </Card>
      </View>

      <Button
        mode="contained"
        icon="file-pdf-box"
        onPress={generarPDF}
        loading={loading}
        disabled={loading || data.length === 0}
        style={styles.btnPdf}
      >
        Descargar Reporte PDF
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
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
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  card: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    elevation: 3,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
    textAlign: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginTop: 4,
    textAlign: "center",
  },
  btnPdf: {
    marginTop: 30,
    backgroundColor: "#D32F2F",
    paddingVertical: 6,
    borderRadius: 10,
  },
});