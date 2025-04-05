import { Redirect } from 'expo-router';

export default function Index() {
  // Redireciona para a tela de login quando o aplicativo é iniciado
  return <Redirect href="/(auth)/login" />;
}
