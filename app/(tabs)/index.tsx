import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { ActivityIndicator, Card, IconButton, Text } from "react-native-paper";
import { auth, db } from "../../src/config/firebase";
import { useUser } from "../../src/hooks/useUser";

export default function Home() {
  const [obras, setObras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser();

  useEffect(() => {
    if (!user) return;
    const obrasRef = collection(db, "obras");
let q;

if (user.rol === "administrador") {
  q = query(obrasRef);
} else if (user.rol === "supervisor") {
  q = query(
    obrasRef,
    where("supervisorId", "==", user.uid)
  );
} else {
  // 🔥 OPERADOR
  q = query(
    obrasRef,
    where("operadores", "array-contains", user.uid)
  );
}

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setObras(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return unsubscribe;
  }, [user]);

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      router.replace("/(auth)/login");
    } catch (error) {
      alert("Error al cerrar sesión");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {/* ENCABEZADO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.nombreUser}>{user?.nombre || "Usuario"}</Text>
          <Text style={styles.rolText}>{user?.rol}</Text>
        </View>
        <IconButton
          icon="logout"
          iconColor="#0A84FF"
          size={26}
          onPress={cerrarSesion}
        />
      </View>

      <View style={styles.content}>
        {/* MENÚ PRINCIPAL */}
        {user?.rol === "administrador" && (
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => router.push("/admin/crearObra")}
            >
              <IconButton icon="plus" iconColor="#0A84FF" />
              <Text style={styles.menuText}>Nueva Obra</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => router.push("/admin/dashboard")}
            >
              <IconButton icon="view-dashboard" iconColor="#0A84FF" />
              <Text style={styles.menuText}>Panel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => router.push("/admin/reportes")}
            >
              <IconButton icon="file-document" iconColor="#0A84FF" />
              <Text style={styles.menuText}>Reportes</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Obras Activas</Text>

        <FlatList
          data={obras}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay obras asignadas.</Text>
          }
          renderItem={({ item }) => (
            <Card
              style={styles.bigCard}
              onPress={() => router.push(`/obra/${item.id}`)}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardInfo}>
                  <Text style={styles.obraNombre}>{item.nombre}</Text>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor:
                            item.estatus === "Finalizado"
                              ? "#34C759"
                              : "#0A84FF",
                        },
                      ]}
                    />
                    <Text style={styles.obraEstatus}>
                      {item.estatus || "Pendiente"}
                    </Text>
                  </View>
                </View>
                <IconButton icon="chevron-right" iconColor="#0A84FF" />
              </Card.Content>
            </Card>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#E3F2FD", // azul claro
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  nombreUser: { color: "#0A84FF", fontSize: 24, fontWeight: "bold" },
  rolText: { color: "#0A84FF", fontSize: 14, fontWeight: "600" },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  menuContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
    backgroundColor: "#F8F9FA",
    padding: 15,
    borderRadius: 20,
  },
  menuButton: { alignItems: "center" },
  menuText: { fontSize: 12, color: "#0A84FF", fontWeight: "500" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 15,
  },
  bigCard: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    elevation: 3,
    paddingVertical: 10,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  cardInfo: { flex: 1 },
  obraNombre: { fontSize: 18, fontWeight: "700", color: "#1C1C1E" },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  obraEstatus: { fontSize: 14, color: "#636366" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { textAlign: "center", color: "#AEAEB2", marginTop: 40 },
});