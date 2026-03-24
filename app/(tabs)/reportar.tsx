import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { Image, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { auth, db } from "../../src/config/firebase";

export default function Reportar() {
  const [image, setImage] = useState<any>(null);

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
  console.log("1. Iniciando subida");

  if (!image) {
    alert("Toma una foto primero");
    return;
  }

  try {
    console.log("2. Obteniendo ubicación");

    const ubicacion = await obtenerUbicacion();

    console.log("3. Ubicación:", ubicacion);

    if (!ubicacion) return;

    const distancia = calcularDistancia(
    ubicacion.lat,
    ubicacion.lng,
    obra.lat,
    obra.lng
    );

    console.log("Distancia:", distancia);

    // 🚨 VALIDACIÓN
    if (distancia > obra.radio) {
    alert("No estás dentro de la zona de la obra");
    return;
    }

    console.log("4. Subiendo a Cloudinary");

    const data = new FormData();

    data.append("file", {
      uri: image.uri,
      type: "image/jpg",
      name: "foto.jpg",
    } as any);

    data.append("upload_preset", "ReportesApp");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dfucjpdqr/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const file = await res.json();

    console.log("5. Respuesta Cloudinary:", file);

    if (!file.secure_url) {
      alert("Error al subir imagen");
      return;
    }

    console.log("6. Guardando en Firestore");

    await addDoc(collection(db, "evidencias"), {
      usuarioId: auth.currentUser?.uid,
      imagen: file.secure_url,
      lat: ubicacion.lat,
      lng: ubicacion.lng,
      fecha: Date.now(),
      estado: "pendiente"
    });

    console.log("7. TODO OK");

    alert("Evidencia subida correctamente");

    setImage(null);

  } catch (error) {
    console.log("ERROR GENERAL:", error);
    alert("Error al subir imagen");
  }
};


  return (
    <View style={{ padding: 20 }}>
      <Text variant="titleMedium">Captura de evidencia</Text>

      <Button mode="contained" onPress={tomarFoto}>
        Tomar foto
      </Button>

      {image && (
        <>
          <Image
            source={{ uri: image.uri }}
            style={{ height: 300, marginTop: 20 }}
          />

          <Button
            mode="contained"
            onPress={subirImagen}
            style={{ marginTop: 10 }}
          >
            Subir evidencia
          </Button>
        </>
      )}
    </View>
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
      accuracy: Location.Accuracy.High
    });

    return {
      lat: location.coords.latitude,
      lng: location.coords.longitude
    };

  } catch (error) {
    console.log(error);
    alert("No se pudo obtener la ubicación");
    return null;
  }
};

const obra = {
  lat: 19.2450104,
  lng: -99.7496457,
  radio: 100 // metros
};

const calcularDistancia = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // radio de la tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distancia en metros
};
