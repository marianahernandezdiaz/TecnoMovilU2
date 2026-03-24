import { router } from "expo-router";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { db } from "../../src/config/firebase";

export default function Home() {
  const [obras, setObras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "obras"), (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setObras(data);
    setLoading(false);
  });

  return unsubscribe;
}, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0A84FF" />
        <Text>Cargando obras...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* 🔥 HEADER */}
      <Text style={styles.title}>Obras registradas</Text>

      {/* 🔥 BOTÓN */}
      <Button
        mode="contained"
        onPress={() => router.push("/admin/crearObra")}
        style={styles.btnCrear}
      >
        + Crear obra
      </Button>

      {/* 🔥 SI NO HAY OBRAS */}
      {obras.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            No hay obras registradas
          </Text>
        </View>
      ) : (
        <FlatList
          data={obras}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.nombre}>
                  {item.nombre}
                </Text>

                <Text style={styles.estatus}>
                  {item.estatus}
                </Text>
              </Card.Content>

              {/* 🔥 BOTÓN REPORTAR */}
              <Button
                mode="text"
                onPress={() =>
                  router.push(`/reportar?obraId=${item.id}`)
                }
              >
                Reportar evidencia
              </Button>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    padding: 15,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0A84FF",
    marginBottom: 10,
  },

  btnCrear: {
    backgroundColor: "#0A84FF",
    borderRadius: 12,
    marginBottom: 15,
    paddingVertical: 5,
  },

  card: {
    marginBottom: 10,
    borderRadius: 15,
    elevation: 3,
  },

  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0A84FF",
  },

  estatus: {
    fontSize: 14,
    color: "#34C759",
    marginTop: 5,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    color: "#999",
    fontSize: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
