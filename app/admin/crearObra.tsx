import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { db } from "../../src/config/firebase";

export default function CrearObra() {
  const [nombre, setNombre] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radio, setRadio] = useState("");
  const [estatus, setEstatus] = useState("iniciando");

  const crearObra = async () => {
    try {
      await addDoc(collection(db, "obras"), {
        nombre,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radio: parseInt(radio),
        estatus,
        fechaInicio: Date.now(),
        fechaFin: null
      });

      alert("Obra creada");

      setNombre("");
      setLat("");
      setLng("");
      setRadio("");

    } catch (error) {
      console.log(error);
      alert("Error al crear obra");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text variant="titleMedium">Crear obra</Text>

      <TextInput label="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput label="Latitud" value={lat} onChangeText={setLat} />
      <TextInput label="Longitud" value={lng} onChangeText={setLng} />
      <TextInput label="Radio (m)" value={radio} onChangeText={setRadio} />

      <Button mode="contained" onPress={crearObra}>
        Guardar obra
      </Button>
    </View>
  );
}