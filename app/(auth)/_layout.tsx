import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import themes from '@/constants/themes';

// Declarar a variável global para TypeScript
declare global {
  var dashboardTheme: 'feminine' | 'masculine' | undefined;
}

// Função para obter o tema inicial
const getInitialTheme = () => {
  // Verificar primeiro se há um tema global definido
  if (global.dashboardTheme === 'masculine') {
    return themes.masculine;
  }
  
  // Se não houver tema global, usar o tema padrão
  return themes.feminine; // Tema padrão
};

export default function AuthLayout() {
  const [theme, setTheme] = useState(getInitialTheme());

  // Carregar tema do AsyncStorage no início
  useEffect(() => {
    const loadThemeFromStorage = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@MyFinlove:theme');
        if (storedTheme === 'masculine' && theme !== themes.masculine) {
          setTheme(themes.masculine);
          global.dashboardTheme = 'masculine';
        } else if (storedTheme === 'feminine' && theme !== themes.feminine) {
          setTheme(themes.feminine);
          global.dashboardTheme = 'feminine';
        }
      } catch (error) {
        console.error('Erro ao carregar tema do AsyncStorage:', error);
      }
    };
    
    loadThemeFromStorage();
  }, [theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
