import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Divider, Text } from "react-native-paper";
import { db } from "../../src/config/firebase";

export default function Reportes() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // Estado para feedback visual

  const [stats, setStats] = useState({
    total: 0,
    aprobadas: 0,
    rechazadas: 0,
    pendientes: 0
  });

  useEffect(() => {
    const cargar = async () => {
      const snapshot = await getDocs(collection(db, "evidencias"));
      const evidencias = snapshot.docs.map(doc => doc.data());

      setData(evidencias);
      setStats({
        total: evidencias.length,
        aprobadas: evidencias.filter(e => e.estado === "aprobada").length,
        rechazadas: evidencias.filter(e => e.estado === "rechazada").length,
        pendientes: evidencias.filter(e => e.estado === "pendiente").length
      });
    };

    cargar();
  }, []);

  // ✅ Función integrada dentro del componente para acceder a 'stats' y 'data'
  const generarPDF = async () => {
    setLoading(true);
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 20px; }
              h1 { color: #0A84FF; text-align: center; }
              .summary { margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 8px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .aprobada { color: green; font-weight: bold; }
              .rechazada { color: red; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Reporte de Evidencias</h1>
            <div class="summary">
              <p><b>Total de registros:</b> ${stats.total}</p>
              <p><b>Aprobadas:</b> ${stats.aprobadas}</p>
              <p><b>Rechazadas:</b> ${stats.rechazadas}</p>
              <p><b>Pendientes:</b> ${stats.pendientes}</p>
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
      <Text variant="headlineMedium" style={styles.title}>Panel de Reportes</Text>

      <Card style={styles.card}>
        <Card.Title title="Estadísticas Generales" />
        <Card.Content>
          <Text style={styles.statText}>Total: {stats.total}</Text>
          <Divider style={styles.divider} />
          <Text style={styles.statText}>Aprobadas: {stats.aprobadas}</Text>
          <Text style={styles.statText}>Rechazadas: {stats.rechazadas}</Text>
          <Text style={styles.statText}>Pendientes: {stats.pendientes}</Text>
        </Card.Content>
      </Card>

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
    flexGrow: 1
  },
  title: {
    marginBottom: 20,
    fontWeight: "bold",
    color: "#333"
  },
  card: {
    borderRadius: 12,
    elevation: 3
  },
  statText: {
    fontSize: 16,
    marginVertical: 4
  },
  divider: {
    marginVertical: 10
  },
  btnPdf: {
    marginTop: 30,
    backgroundColor: "#D32F2F", // Color rojo para PDF
    paddingVertical: 6
  }
});