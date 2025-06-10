import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Platform, StyleSheet } from 'react-native';

// Não vamos mais tentar carregar as fontes na web, apenas em dispositivos móveis
const useCustomFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  useEffect(() => {
    // Na web, consideramos as fontes como carregadas para evitar problemas
    if (Platform.OS === 'web') {
      setFontsLoaded(true);
      return;
    }
    
    // Em dispositivos móveis, tentamos carregar as fontes
    const loadFonts = async () => {
      try {
        const { useFonts } = require('expo-font');
        const [loaded] = useFonts({
          'Poppins_400Regular': require('@expo-google-fonts/poppins/Poppins_400Regular.ttf'),
          'Poppins_500Medium': require('@expo-google-fonts/poppins/Poppins_500Medium.ttf'),
          'Poppins_600SemiBold': require('@expo-google-fonts/poppins/Poppins_600SemiBold.ttf'),
        });
        
        if (loaded) {
          setFontsLoaded(true);
        }
      } catch (error) {
        console.error('Error loading fonts:', error);
        // Mesmo com erro, consideramos as fontes como carregadas para não bloquear o app
        setFontsLoaded(true);
      }
    };
    
    loadFonts();
  }, []);
  
  return fontsLoaded;
};

export default function RootLayout() {
  useFrameworkReady();
  const fontsLoaded = useCustomFonts();
  
  // Só mostramos a tela de carregamento em dispositivos móveis
  if (!fontsLoaded && Platform.OS !== 'web') {
    return null;
  }

  return (
    <>
      <Slot />
      <StatusBar style="dark" />
    </>
  );
}