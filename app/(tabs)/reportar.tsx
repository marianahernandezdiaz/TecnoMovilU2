import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, View } from "react-native";
import { Button, Text } from "react-native-paper";

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

  return (
    <View style={{ padding: 20 }}>
      <Text variant="titleMedium">Captura de evidencia</Text>

      <Button mode="contained" onPress={tomarFoto}>
        Tomar foto
      </Button>

      {image && (
        <Image
          source={{ uri: image.uri }}
          style={{
            width: "100%",
            height: 300,
            marginTop: 20,
            borderRadius: 10,
          }}
        />
      )}
    </View>
  );
}