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
    console.log('Agendando notificação para 30 segundos...');
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "💕 Teste MyFinlove!",
        body: "Bom dia, casal! Bora começar no amor (e no controle)? ☀💑",
        data: { testData: 'Dados de teste' },
      },
      trigger: {
        type: 'timeInterval',
        seconds: 30,
        repeats: false,
      },
    });
    
    console.log('Notificação agendada com ID:', notificationId);
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

  // Função para agendar notificação diária às 09:00
  const scheduleDailyNotification = async () => {
    console.log('Agendando notificação diária para 09:00...');
    
    // Primeiro, cancelar notificações diárias existentes
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    // Criar a data para hoje às 09:00
    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setHours(9, 0, 0, 0);
    
    // Se já passou das 09:00 hoje, agendar para amanhã
    if (now > scheduledDate) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "💕 Hora do FinLove!",
        body: "Que tal revisar os gastos de hoje com seu amor? 💑💰",
        data: { type: 'daily_reminder' },
      },
      trigger: {
        type: 'timeInterval',
        seconds: Math.floor((scheduledDate.getTime() - now.getTime()) / 1000),
        repeats: false,
      },
    });
    
    // Agendar as próximas notificações (para os próximos 30 dias)
    for (let i = 1; i <= 30; i++) {
      const futureDate = new Date(scheduledDate);
      futureDate.setDate(futureDate.getDate() + i);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "💕 Hora do FinLove!",
          body: "Que tal revisar os gastos de hoje com seu amor? 💑💰",
          data: { type: 'daily_reminder' },
        },
        trigger: {
          type: 'timeInterval',
          seconds: Math.floor((futureDate.getTime() - now.getTime()) / 1000),
          repeats: false,
        },
      });
    }
    
    console.log('Notificação diária agendada com ID:', notificationId);
    console.log('Próxima notificação será em:', scheduledDate.toLocaleString());
    return notificationId;
  };

  // Função para cancelar todas as notificações diárias
  const cancelDailyNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Todas as notificações diárias foram canceladas');
  };

  return {
    expoPushToken,
    notification,
    sendTestNotification,
    sendImmediateNotification,
    scheduleDailyNotification,
    cancelDailyNotifications,
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