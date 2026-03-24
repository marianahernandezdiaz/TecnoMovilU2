import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { db } from "../../src/config/firebase";

export default function CrearObra() {
  const [nombre, setNombre] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radio, setRadio] = useState("");

  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [mostrarPicker, setMostrarPicker] = useState(false);

  // 📍 Obtener ubicación automática
  const obtenerUbicacion = async () => {
    const permiso = await Location.requestForegroundPermissionsAsync();

    if (permiso.status !== "granted") {
      alert("Permiso de ubicación denegado");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});

    setLat(location.coords.latitude.toString());
    setLng(location.coords.longitude.toString());
  };

  const guardarObra = async () => {
    if (!nombre || !lat || !lng || !radio || !fechaFin) {
      alert("Completa todos los campos");
      return;
    }

    const fechaInicio = new Date();

    // 🚨 VALIDACIÓN
    if (fechaFin < fechaInicio) {
      alert("La fecha no puede ser anterior a hoy");
      return;
    }

    try {
      await addDoc(collection(db, "obras"), {
        nombre,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radio: parseFloat(radio),
        estatus: "Iniciando",
        fechaInicio: fechaInicio.getTime(),
        fechaFin: fechaFin.getTime(),
      });

      alert("Obra creada correctamente");
      router.back();

    } catch (error) {
      console.log(error);
      alert("Error al crear obra");
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Crear nueva obra</Text>

        <TextInput
          label="Nombre de la obra"
          mode="outlined"
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
        />

        {/* 📍 BOTÓN UBICACIÓN */}
        <Button mode="outlined" onPress={obtenerUbicacion} style={styles.input}>
          Obtener ubicación actual
        </Button>

        <TextInput
          label="Latitud"
          value={lat}
          editable={false}
          style={styles.input}
        />

        <TextInput
          label="Longitud"
          value={lng}
          editable={false}
          style={styles.input}
        />

        <TextInput
          label="Radio (metros)"
          mode="outlined"
          value={radio}
          onChangeText={setRadio}
          keyboardType="numeric"
          style={styles.input}
        />

        {/* 📅 FECHA */}
        <Button
          mode="outlined"
          onPress={() => setMostrarPicker(true)}
          style={styles.input}
        >
          {fechaFin
            ? `Fin: ${fechaFin.toLocaleDateString()}`
            : "Seleccionar fecha de finalización"}
        </Button>

        {mostrarPicker && (
          <DateTimePicker
            value={fechaFin || new Date()}
            mode="date"
            display="default"
            minimumDate={new Date()} // 🚨 no fechas pasadas
            onChange={(event, date) => {
              setMostrarPicker(Platform.OS === "ios");
              if (date) setFechaFin(date);
            }}
          />
        )}

        <Button mode="contained" onPress={guardarObra} style={styles.button}>
          Guardar obra
        </Button>
      </Card>
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
    borderRadius: 20,
    elevation: 4,
  },

  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
    color: "#0A84FF",
    fontWeight: "bold",
  },

  input: {
    marginBottom: 15,
  },

  button: {
    marginTop: 10,
    backgroundColor: "#34C759",
    borderRadius: 10,
    paddingVertical: 5,
  },
});