import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Snackbar, Text, TextInput } from "react-native-paper";
import { auth } from "../../src/config/firebase";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const mostrarMensaje = (msg: string) => {
    setMensaje(msg);
    setVisible(true);
  };

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)/reportar"); 
    } catch (error: any) {
      mostrarMensaje(getErrorMessage(error));
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Bienvenido</Text>

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

        <Button
          mode="contained"
          onPress={login}
          style={styles.loginBtn}
        >
          Iniciar sesión
        </Button>

        <Button
          mode="text"
          onPress={() => router.push("/(auth)/register")}
        >
          Crear cuenta
        </Button>
      </Card>

      {/* 🔥 SNACKBAR */}
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
    color: "#0A84FF",
    fontWeight: "bold",
  },
  input: {
    marginBottom: 15,
  },
  loginBtn: {
    marginTop: 10,
    backgroundColor: "#0A84FF",
  },
});


const getErrorMessage = (error: any) => {
  const code = error?.code || "";

  switch (code) {
    case "auth/email-already-in-use":
      return "Este correo ya está registrado";
    case "auth/invalid-email":
      return "El correo no es válido";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres";
    case "auth/user-not-found":
      return "El usuario no existe";
    case "auth/wrong-password":
      return "Contraseña incorrecta";
    case "auth/network-request-failed":
      return "Error de conexión a internet";
    default:
      return error?.message || "Ocurrió un error, intenta de nuevo";
  }
};