import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="accounts" />
      <Stack.Screen name="registers" />
      <Stack.Screen name="income" />
      <Stack.Screen name="income2" />
      <Stack.Screen name="receitas" />
      <Stack.Screen name="receitas-novo" />
      <Stack.Screen name="receitas-new" />
      <Stack.Screen name="historico-debitos" />
      <Stack.Screen name="historico-creditos" />
    </Stack>
  );
}