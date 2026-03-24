import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Snackbar, Text, TextInput } from "react-native-paper";
import { auth, db } from "../../src/config/firebase";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("operador");
  const [obras, setObras] = useState("");

  const [visible, setVisible] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // ✅ FUNCIÓN CORRECTA (fuera del register)
  const mostrarMensaje = (msg: string) => {
    setMensaje(msg);
    setVisible(true);
  };

  const register = async () => {
    try {
      if (!nombre || !email || !password) {
        mostrarMensaje("Completa todos los campos");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const obrasArray = obras
        ? obras.split(",").map(o => o.trim())
        : [];

      await setDoc(doc(db, "usuarios", user.uid), {
        nombre,
        email: user.email,
        rol,
        fechaRegistro: Date.now()
      });

      mostrarMensaje("Usuario creado correctamente");

      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1500);

    } catch (error: any) {
      mostrarMensaje(getErrorMessage(error));
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Crear cuenta</Text>

        <TextInput
          label="Nombre completo"
          mode="outlined"
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
        />

        <TextInput
          label="Correo"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          label="Contraseña"
          mode="outlined"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />


        {/* 🔥 SELECTOR DE ROL */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{ marginBottom: 5 }}>Rol seleccionado: {rol}</Text>

          <Button
            mode={rol === "operador" ? "contained" : "outlined"}
            onPress={() => setRol("operador")}
            style={{ marginBottom: 5 }}
          >
            Operador
          </Button>

          <Button
            mode={rol === "supervisor" ? "contained" : "outlined"}
            onPress={() => setRol("supervisor")}
            style={{ marginBottom: 5 }}
          >
            Supervisor
          </Button>

          <Button
            mode={rol === "administrador" ? "contained" : "outlined"}
            onPress={() => setRol("administrador")}
          >
            Administrador
          </Button>
        </View>

        <Button
          mode="contained"
          onPress={register}
          style={styles.registerBtn}
        >
          Registrarse
        </Button>

        <Button
          mode="text"
          onPress={() => router.back()}
        >
          Volver al login
        </Button>
      </Card>

      {/* 🔥 SNACKBAR FUERA DEL CARD */}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={{ backgroundColor: "#333" }}
      >
        {mensaje}
      </Snackbar>
    </View>
  );
}

// ✅ MENSAJES AMIGABLES
const getErrorMessage = (error: any) => {
  const code = error?.code || "";

  switch (code) {
    case "auth/email-already-in-use":
      return "Este correo ya está registrado";
    case "auth/invalid-email":
      return "El correo no es válido";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres";
    case "auth/network-request-failed":
      return "Error de conexión a internet";
    default:
      return "Ocurrió un error, intenta de nuevo";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: 15,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    color: "#34C759",
    fontWeight: "bold",
  },
  input: {
    marginBottom: 15,
  },
  registerBtn: {
    marginTop: 10,
    backgroundColor: "#34C759",
  },
});

