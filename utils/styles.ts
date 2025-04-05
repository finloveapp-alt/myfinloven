import { StyleSheet, Platform } from 'react-native';

// Adicionar declaração global
declare global {
  var dashboardTheme: 'feminine' | 'masculine';
}

// Estilos globais para o aplicativo
export const globalStyles = StyleSheet.create({
  // Estilo para substituir o uso de props.pointerEvents
  pointerEventsNone: {
    pointerEvents: 'none',
  },
  pointerEventsAuto: {
    pointerEvents: 'auto',
  },
  pointerEventsBoxNone: {
    pointerEvents: 'box-none',
  },
  pointerEventsBoxOnly: {
    pointerEvents: 'box-only',
  },
});

// Fontes de fallback para a web
export const fontFallbacks = Platform.select({
  web: {
    Poppins_400Regular: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    Poppins_500Medium: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    Poppins_600SemiBold: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  default: {
    Poppins_400Regular: 'Poppins_400Regular',
    Poppins_500Medium: 'Poppins_500Medium',
    Poppins_600SemiBold: 'Poppins_600SemiBold',
  },
});

// Função auxiliar para obter a fonte correta com fallback
export const getFont = (type: 'Poppins_400Regular' | 'Poppins_500Medium' | 'Poppins_600SemiBold') => {
  return fontFallbacks[type];
};
