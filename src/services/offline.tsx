import AsyncStorage from "@react-native-async-storage/async-storage";


const KEY = "offline_evidencias";

// guardar pendiente
export const guardarOffline = async (data: any) => {
  const actuales = await obtenerOffline();
  const nuevos = [...actuales, data];
  await AsyncStorage.setItem(KEY, JSON.stringify(nuevos));
};

// obtener pendientes
export const obtenerOffline = async () => {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

// limpiar después de sincronizar
export const limpiarOffline = async () => {
  await AsyncStorage.removeItem(KEY);
};

import * as Network from "expo-network";

export const hayInternet = async () => {
  const state = await Network.getNetworkStateAsync();
  return state.isConnected;
};