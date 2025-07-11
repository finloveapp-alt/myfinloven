import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar como as notificações devem ser tratadas quando recebidas
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>('local-testing-mode');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Configurar permissões básicas para notificações locais
    setupLocalNotifications();

    // Listener para notificações recebidas enquanto o app está em foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listener para quando o usuário toca na notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificação tocada:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Função para enviar notificação local de teste
  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💕 Teste MyFinlove!",
        body: "Bom dia, casal! Bora começar no amor (e no controle)? ☀💑",
        data: { testData: 'Dados de teste' },
      },
      trigger: { seconds: 2 }, // Enviar em 2 segundos
    });
  };

  // Função para enviar notificação imediata
  const sendImmediateNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🍟❤ Lanchinho pago?",
        body: "Bora anotar no FinLove! Gastos de hoje = meta de amanhã.",
        data: { type: 'expense_reminder' },
      },
      trigger: null, // Imediata
    });
  };

  return {
    expoPushToken,
    notification,
    sendTestNotification,
    sendImmediateNotification,
  };
}

// Função para configurar notificações locais básicas
async function setupLocalNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'MyFinlove Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#b687fe',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Permissão para notificações não concedida');
    return false;
  }
  
  console.log('Notificações locais configuradas com sucesso');
  return true;
}