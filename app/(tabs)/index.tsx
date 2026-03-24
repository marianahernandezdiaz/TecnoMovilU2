import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { Card, Text } from "react-native-paper";
import { db } from "../../src/config/firebase";


export default function Home() {
  const [obras, setObras] = useState<any[]>([]);

  useEffect(() => {
    const cargarObras = async () => {
      const snapshot = await getDocs(collection(db, "obras"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setObras(data);
    };

    cargarObras();
  }, []);

  return (
    <FlatList
      data={obras}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card style={{ margin: 10 }}>
          <Card.Content>
            <Text>{item.nombre}</Text>
            <Text>Estatus: {item.estatus}</Text>
          </Card.Content>
        </Card>
      )}
    />
  );
}