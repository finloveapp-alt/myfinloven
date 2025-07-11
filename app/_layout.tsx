import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Platform, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
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

export default function RootLayout() {
  useFrameworkReady();
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
  
  // Carregar fontes apenas em dispositivos móveis
  const [fontsLoaded] = useFonts(
    Platform.OS === 'web' 
      ? {} // Não carregar fontes na web
      : {
          'Poppins_400Regular': require('@expo-google-fonts/poppins/Poppins_400Regular.ttf'),
          'Poppins_500Medium': require('@expo-google-fonts/poppins/Poppins_500Medium.ttf'),
          'Poppins_600SemiBold': require('@expo-google-fonts/poppins/Poppins_600SemiBold.ttf'),
        }
  );

  // Na web, considerar as fontes sempre carregadas
  const areFontsReady = Platform.OS === 'web' ? true : fontsLoaded;
  
  // Só mostrar a tela de carregamento em dispositivos móveis
  if (!areFontsReady && Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Slot />
      <StatusBar style="light" backgroundColor={theme.background} />
    </View>
  );
}