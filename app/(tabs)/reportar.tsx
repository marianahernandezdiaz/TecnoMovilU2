import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { auth, db } from "../../src/config/firebase";

export default function Reportar() {
  const [image, setImage] = useState<any>(null);
  const [descripcion, setDescripcion] = useState("");

  const { obraId } = useLocalSearchParams();

  const tomarFoto = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      alert("Se necesita permiso para usar la cámara");
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
    });

    if (!resultado.canceled) {
      setImage(resultado.assets[0]);
    }
  };

  const subirImagen = async () => {
    if (!image) {
      alert("Toma una foto primero");
      return;
    }
    if (!descripcion) {
      alert("Agrega una descripción");
      return;
    }

    try {
      const ubicacion = await obtenerUbicacion();
      if (!ubicacion) return;

      const distancia = calcularDistancia(
        ubicacion.lat,
        ubicacion.lng,
        obra.lat,
        obra.lng
      );

      if (distancia > obra.radio) {
        alert("No estás dentro de la zona de la obra");
        return;
      }

      const data = new FormData();
      data.append("file", {
        uri: image.uri,
        type: "image/jpg",
        name: "foto.jpg",
      } as any);
      data.append("upload_preset", "ReportesApp");

      const res = await fetch("https://api.cloudinary.com/v1_1/dfucjpdqr/image/upload", {
        method: "POST",
        body: data,
      });

      const file = await res.json();
      if (!file.secure_url) {
        alert("Error al subir imagen");
        return;
      }

      await addDoc(collection(db, "evidencias"), {
        obraId: obraId,
        usuarioId: auth.currentUser?.uid,
        tipo: "imagen",
        imagen: file.secure_url,
        descripcion: descripcion,
        lat: ubicacion.lat,
        lng: ubicacion.lng,
        fecha: Date.now(),
        estado: "pendiente",
        supervisorId: null,
      });

      alert("Evidencia subida correctamente");
      setImage(null);
      setDescripcion("");
    } catch (error) {
      console.log("ERROR GENERAL:", error);
      alert("Error al subir imagen");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ENCABEZADO */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#0A84FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reportar Evidencia</Text>
      </View>

      {/* BOTÓN FOTO */}
      <Button mode="contained" onPress={tomarFoto} style={styles.btnFoto}>
        Tomar foto
      </Button>

      {/* DESCRIPCIÓN */}
      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Descripción"
            mode="outlined"
            value={descripcion}
            onChangeText={setDescripcion}
          />
        </Card.Content>
      </Card>

      {/* PREVIEW */}
      {image && (
        <Card style={styles.card}>
          <Image source={{ uri: image.uri }} style={styles.image} />
        </Card>
      )}

      {/* SUBIR */}
      {image && (
        <Button mode="contained" onPress={subirImagen} style={styles.btnSubir}>
          Subir evidencia
        </Button>
      )}
    </ScrollView>
  );
}

const obtenerUbicacion = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permiso de ubicación denegado");
      return null;
    }
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      alert("Activa el GPS de tu dispositivo");
      return null;
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return { lat: location.coords.latitude, lng: location.coords.longitude };
  } catch (error) {
    console.log(error);
    alert("No se pudo obtener la ubicación");
    return null;
  }
};

const obra = {
  lat: 19.2450104,
  lng: -99.7496457,
  radio: 100,
};

const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F4F6F8",
  },
  header: {
    backgroundColor: "#E3F2FD",
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0A84FF",
    marginBottom: 15,
  },
  btnFoto: {
    backgroundColor: "#0A84FF",
    borderRadius: 12,
    marginBottom: 15,
  },
  card: {
    borderRadius: 15,
    marginBottom: 15,
    padding: 5,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 15,
  },
  btnSubir: {
    backgroundColor: "#34C759",
    borderRadius: 12,
    paddingVertical: 5,
  },
});