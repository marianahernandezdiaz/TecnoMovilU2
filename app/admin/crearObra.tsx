import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { addDoc, collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { db } from "../../src/config/firebase";

export default function CrearObra() {
  const [nombre, setNombre] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radio, setRadio] = useState("");
  const [supervisores, setSupervisores] = useState<any[]>([]);
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState("");

  const [operadores, setOperadores] = useState<any[]>([]);
  const [operadoresSeleccionados, setOperadoresSeleccionados] = useState<string[]>([]);

  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [mostrarPicker, setMostrarPicker] = useState(false);

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
    if (!nombre || !lat || !lng || !radio || !fechaFin || !supervisorSeleccionado) {
      alert("Completa todos los campos y selecciona un supervisor");
      return;
    }

    try {
      await addDoc(collection(db, "obras"), {
        nombre,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radio: parseFloat(radio),
        estatus: "En proceso",
        supervisorId: supervisorSeleccionado,
        operadores: operadoresSeleccionados, // 🔥 NUEVO
        fechaInicio: Timestamp.now(),
        fechaFin: Timestamp.fromDate(fechaFin),
      });
      alert("Obra creada correctamente");
      router.back();
    } catch (error) {
      console.error(error);
      alert("Error al crear obra");
    }
  };

  useEffect(() => {
    const cargarSupervisores = async () => {
      try {
        const q = query(collection(db, "usuarios"), where("rol", "==", "supervisor"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSupervisores(data);
      } catch (error) {
        console.log("Error cargando supervisores:", error);
      }
    };

    const cargarOperadores = async () => {
      try {
        const q = query(collection(db, "usuarios"), where("rol", "==", "operador"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOperadores(data);
      } catch (error) {
        console.log("Error cargando operadores:", error);
      }
    };

    cargarSupervisores();
    cargarOperadores();
  }, []);

  const toggleOperador = (id: string) => {
    if (operadoresSeleccionados.includes(id)) {
      setOperadoresSeleccionados(operadoresSeleccionados.filter(op => op !== id));
    } else {
      setOperadoresSeleccionados([...operadoresSeleccionados, id]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Crear nueva obra</Text>

        <TextInput
          label="Nombre de la obra"
          mode="outlined"
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
        />

        <Button mode="outlined" onPress={obtenerUbicacion} style={styles.input} icon="map-marker">
          Obtener ubicación actual
        </Button>

        <TextInput
          label="Latitud"
          mode="outlined"
          value={lat}
          onChangeText={setLat}
          style={styles.input}
        />

        <TextInput
          label="Longitud"
          mode="outlined"
          value={lng}
          onChangeText={setLng}
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

        <Button mode="outlined" onPress={() => setMostrarPicker(true)} style={styles.input} icon="calendar">
          {fechaFin ? `Fin: ${fechaFin.toLocaleDateString()}` : "Fecha de finalización"}
        </Button>

        <Text style={styles.label}>Seleccionar supervisor</Text>
        {supervisores.map((sup) => (
          <Button
            key={sup.id}
            mode={supervisorSeleccionado === sup.id ? "contained" : "outlined"}
            onPress={() => setSupervisorSeleccionado(sup.id)}
            style={styles.supervisorBtn}
            contentStyle={{ justifyContent: "flex-start" }}
          >
            {sup.nombre || sup.email}
          </Button>
        ))}

        <Text style={styles.label}>Seleccionar operadores</Text>
        {operadores.map((op) => (
          <Button
            key={op.id}
            mode={operadoresSeleccionados.includes(op.id) ? "contained" : "outlined"}
            onPress={() => toggleOperador(op.id)}
            style={styles.supervisorBtn}
            contentStyle={{ justifyContent: "flex-start" }}
          >
            {op.nombre || op.email}
          </Button>
        ))}

        {mostrarPicker && (
          <DateTimePicker
            value={fechaFin || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minimumDate={new Date()}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#F4F6F8",
  },
  card: {
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    backgroundColor: "#fff",
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
  label: {
    marginBottom: 8,
    fontWeight: "bold",
    color: "#666",
  },
  supervisorBtn: {
    marginBottom: 8,
    borderRadius: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#34C759",
    borderRadius: 10,
    paddingVertical: 5,
  },
});