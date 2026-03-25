import DateTimePicker from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { router } from "expo-router";
import {
  addDoc,
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
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
  const [operadoresSeleccionados, setOperadoresSeleccionados] = useState<
    string[]
  >([]);

  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [mostrarPicker, setMostrarPicker] = useState(false);

  const mapRef = useRef<any>(null);

  // 📍 Obtener ubicación
  const obtenerUbicacion = async () => {
    const permiso = await Location.requestForegroundPermissionsAsync();

    if (permiso.status !== "granted") {
      alert("Permiso de ubicación denegado");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});

    const nuevaLat = location.coords.latitude.toString();
    const nuevaLng = location.coords.longitude.toString();

    setLat(nuevaLat);
    setLng(nuevaLng);

    // 🔥 centrar mapa
    mapRef.current?.animateToRegion({
      latitude: parseFloat(nuevaLat),
      longitude: parseFloat(nuevaLng),
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  // 💾 Guardar obra
  const guardarObra = async () => {
    if (!nombre || !lat || !lng || !radio || !fechaFin || !supervisorSeleccionado) {
      alert("Completa todos los campos");
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
        operadores: operadoresSeleccionados,
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

  // 🔄 Cargar usuarios
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const supQ = query(collection(db, "usuarios"), where("rol", "==", "supervisor"));
        const opQ = query(collection(db, "usuarios"), where("rol", "==", "operador"));

        const supSnap = await getDocs(supQ);
        const opSnap = await getDocs(opQ);

        setSupervisores(supSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setOperadores(opSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.log(error);
      }
    };

    cargarDatos();
  }, []);

  const toggleOperador = (id: string) => {
    if (operadoresSeleccionados.includes(id)) {
      setOperadoresSeleccionados(prev => prev.filter(op => op !== id));
    } else {
      setOperadoresSeleccionados(prev => [...prev, id]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Crear nueva obra</Text>

        <TextInput
          label="Nombre"
          mode="outlined"
          value={nombre}
          onChangeText={setNombre}
          style={styles.input}
        />

        <Button
          mode="outlined"
          onPress={obtenerUbicacion}
          icon="map-marker"
          style={styles.input}
        >
          Obtener ubicación
        </Button>

        {/* 🗺️ MAPA OSM */}
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: lat ? parseFloat(lat) : 19.289,
            longitude: lng ? parseFloat(lng) : -99.738,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            setLat(latitude.toString());
            setLng(longitude.toString());
          }}
        >
          <UrlTile
            urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />

          {lat && lng && (
            <Marker
              coordinate={{
                latitude: parseFloat(lat),
                longitude: parseFloat(lng),
              }}
            />
          )}
        </MapView>

        <TextInput label="Latitud" value={lat} onChangeText={setLat} style={styles.input} />
        <TextInput label="Longitud" value={lng} onChangeText={setLng} style={styles.input} />

        <TextInput
          label="Radio (m)"
          value={radio}
          onChangeText={setRadio}
          keyboardType="numeric"
          style={styles.input}
        />

        <Button onPress={() => setMostrarPicker(true)} icon="calendar">
          {fechaFin ? fechaFin.toLocaleDateString() : "Fecha final"}
        </Button>

        {mostrarPicker && (
          <DateTimePicker
            value={fechaFin || new Date()}
            mode="date"
            minimumDate={new Date()}
            onChange={(e, d) => {
              setMostrarPicker(false);
              if (d) setFechaFin(d);
            }}
          />
        )}

        <Text style={styles.label}>Supervisor</Text>
        {supervisores.map((s) => (
          <Button
            key={s.id}
            mode={supervisorSeleccionado === s.id ? "contained" : "outlined"}
            onPress={() => setSupervisorSeleccionado(s.id)}
          >
            {s.nombre || s.email}
          </Button>
        ))}

        <Text style={styles.label}>Operadores</Text>
        {operadores.map((op) => (
          <Button
            key={op.id}
            mode={operadoresSeleccionados.includes(op.id) ? "contained" : "outlined"}
            onPress={() => toggleOperador(op.id)}
          >
            {op.nombre || op.email}
          </Button>
        ))}

        <Button mode="contained" onPress={guardarObra} style={styles.button}>
          Guardar obra
        </Button>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F4F6F8",
  },
  card: {
    padding: 20,
    borderRadius: 20,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 15,
    color: "#0A84FF",
    fontWeight: "bold",
  },
  input: {
    marginBottom: 10,
  },
  map: {
    height: 220,
    borderRadius: 15,
    marginBottom: 10,
  },
  label: {
    marginTop: 10,
    fontWeight: "bold",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#34C759",
  },
});