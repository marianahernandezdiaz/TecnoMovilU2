import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs initialRouteName="index">
      <Tabs.Screen name="index" options={{ title: "Obras" }} />
      <Tabs.Screen name="reportar" options={{ title: "Reportar" }} />
    </Tabs>
  );
}