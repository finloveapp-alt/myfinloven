import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { Platform, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';

export default function RootLayout() {
  useFrameworkReady();
  
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
    <>
      <Slot />
      <StatusBar style="dark" />
    </>
  );
}