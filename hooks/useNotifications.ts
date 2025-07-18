import React, { useState, useEffect, useRef } from 'react';
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

    // Agendar notificações automaticamente na primeira abertura do app
    scheduleDailyNotification();
    scheduleMorningNotification();
    scheduleLunchNotification();
    scheduleEveningNotification();
    scheduleMondayNotification();
    scheduleWednesdayNotification();
    scheduleFridayNotification();
    scheduleSaturdayNotification();
    scheduleSundayNotification();
    scheduleMonthlyNotification();
    scheduleBillsReminderNotification();
    scheduleMidMonthNotification();
    scheduleEndMonthNotification();
    scheduleLastDayMonthNotification();

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

  // Função para agendar notificação de contas fixas (dia 5 de cada mês às 17:00)
  const scheduleBillsReminderNotification = async () => {
    console.log('Agendando notificação de contas fixas para o dia 5 às 17:00...');
    
    const now = new Date();
    
    // Agendar para os próximos 12 meses
    for (let i = 0; i < 12; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 5, 17, 0, 0, 0);
      
      // Se a data já passou este mês, começar do próximo mês
      if (futureDate <= now) {
        continue;
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Contas fixas pagas ou só prometeram? 💸",
          body: "Confiram os pagamentos da semana e evitem o fantasma do juros!",
          data: { type: 'bills_reminder' },
        },
        trigger: {
          type: 'timeInterval',
          seconds: Math.floor((futureDate.getTime() - now.getTime()) / 1000),
          repeats: false,
        },
      });
    }
    
    console.log('Notificações de contas fixas agendadas para o dia 5 às 17:00');
  };

  // Função para agendar notificação no meio do mês (dia 15 de cada mês às 12:00)
  const scheduleMidMonthNotification = async () => {
    console.log('Agendando notificação de meio do mês para o dia 15 às 12:00...');
    
    const now = new Date();
    
    // Agendar para os próximos 12 meses
    for (let i = 0; i < 12; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 15, 12, 0, 0, 0);
      
      // Se a data já passou este mês, começar do próximo mês
      if (futureDate <= now) {
        continue;
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Metade do mês = hora de dar aquela olhadinha 👀",
          body: "Já é dia 15! Vale revisar e ajustar antes que o mês corra.",
          data: { type: 'mid_month_reminder' },
        },
        trigger: {
          type: 'timeInterval',
          seconds: Math.floor((futureDate.getTime() - now.getTime()) / 1000),
          repeats: false,
        },
      });
    }
    
    console.log('Notificações de meio do mês agendadas para o dia 15 às 12:00');
  };

  // Função para agendar notificação no final do mês (dia 25 de cada mês às 14:00)
  const scheduleEndMonthNotification = async () => {
    console.log('Agendando notificação de final do mês para o dia 25 às 14:00...');
    
    const now = new Date();
    
    // Agendar para os próximos 12 meses
    for (let i = 0; i < 12; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 25, 14, 0, 0, 0);
      
      // Se a data já passou este mês, começar do próximo mês
      if (futureDate <= now) {
        continue;
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Esse mês voou! Tão no azul ou no \"a gente se ama mesmo assim\"? 💔💸",
          body: "Ajustem categorias e fechem bonito.",
          data: { type: 'end_month_reminder' },
        },
        trigger: {
          type: 'timeInterval',
          seconds: Math.floor((futureDate.getTime() - now.getTime()) / 1000),
          repeats: false,
        },
      });
    }
    
    console.log('Notificações de final do mês agendadas para o dia 25 às 14:00');
  };

  // Função para agendar notificação no último dia do mês às 18:00
  const scheduleLastDayMonthNotification = async () => {
    console.log('Agendando notificação do último dia do mês às 18:00...');
    
    const now = new Date();
    
    // Agendar para os próximos 12 meses
    for (let i = 0; i < 12; i++) {
      // Calcular o último dia do mês
      const lastDay = new Date(now.getFullYear(), now.getMonth() + i + 1, 0);
      const futureDate = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate(), 18, 0, 0, 0);
      
      // Se a data já passou este mês, começar do próximo mês
      if (futureDate <= now) {
        continue;
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Casal que vence junto, economiza junto 👏💰",
          body: "Fechamento do mês ativado! Revisem juntos e celebrem até as pequenas vitórias.",
          data: { type: 'last_day_month_reminder' },
        },
        trigger: {
          type: 'timeInterval',
          seconds: Math.floor((futureDate.getTime() - now.getTime()) / 1000),
          repeats: false,
        },
      });
    }
    
    console.log('Notificações do último dia do mês agendadas às 18:00');
  };

  // Função para agendar notificação mensal (dia 1 de cada mês às 09:00)
  const scheduleMonthlyNotification = async () => {
    console.log('Agendando notificação mensal para o dia 1 às 09:00...');
    
    const now = new Date();
    
    // Agendar para os próximos 12 meses
    for (let i = 0; i < 12; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1, 9, 0, 0, 0);
      
      // Se a data já passou este mês, começar do próximo mês
      if (futureDate <= now) {
        continue;
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Mês novo, casal novo? Bora alinhar tudo! 🗓💞",
          body: "Hora de sonhar juntos: criem as metas e combinem o plano de jogo.",
          data: { type: 'monthly_reminder' },
        },
        trigger: {
          type: 'timeInterval',
          seconds: Math.floor((futureDate.getTime() - now.getTime()) / 1000),
          repeats: false,
        },
      });
    }
    
    console.log('Notificações mensais agendadas para o dia 1 às 09:00');
  };

  // Função para agendar notificação de domingo (domingo às 20:00)
  const scheduleSundayNotification = async () => {
    console.log('Agendando notificação de domingo às 20:00...');
    
    const now = new Date();
    
    // Agendar para os próximos 30 dias
    for (let i = 0; i <= 30; i++) {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + i);
      futureDate.setHours(20, 0, 0, 0);
      
      // Verificar se é domingo (0)
      const dayOfWeek = futureDate.getDay();
      if (dayOfWeek === 0) {
        // Se o horário já passou hoje, pular para o próximo domingo
        if (i === 0 && now > futureDate) {
          continue;
        }
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Domingo à noite: papo leve, check rápido e sofá em paz 🛋️",
            body: "Revise, anote e entre na semana com o pé (e o bolso) direito.",
            data: { type: 'sunday_reminder' },
          },
          trigger: {
            type: 'timeInterval',
            seconds: Math.floor((futureDate.getTime() - now.getTime()) / 1000),
            repeats: false,
          },
        });
      }
    }
    
    console.log('Notificações de domingo agendadas às 20:00');
  };

  // Função para agendar notificação de sábado (sábado às 10:00)
  const scheduleSaturdayNotification = async () => {
    console.log('Agendando notificação de sábado às 10:00...');
    
    const now = new Date();
    
    // Agendar para os próximos 30 dias
    for (let i = 0; i <= 30; i++) {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + i);
      futureDate.setHours(10, 0, 0, 0);
      
      // Verificar se é sábado (6)
      const dayOfWeek = futureDate.getDay();
      if (dayOfWeek === 6) {
        // Se o horário já passou hoje, pular para o próximo sábado
        if (i === 0 && now > futureDate) {
          continue;
        }
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Casal que organiza de manhã, aproveita o sábado sem peso 💖❤️",
            body: "Um toque de organização deixa o dia mais leve. Bora?",
            data: { type: 'saturday_reminder' },
          },
          trigger: {
            type: 'timeInterval',
            seconds: Math.floor((futureDate.getTime() - now.getTime()) / 1000),
            repeats: false,
          },
        });
      }
    }
    
    console.log('Notificações de sábado agendadas às 10:00');
  };

  // Função para agendar notificação de sexta-feira (sexta às 19:00)
  const scheduleFridayNotification = async () => {
    console.log('Agendando notificação de sexta-feira às 19:00...');
    
    const now = new Date();
    
    // Agendar para os próximos 30 dias
    for (let i = 0; i <= 30; i++) {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + i);
      futureDate.setHours(19, 0, 0, 0);
      
      // Verificar se é sexta-feira (5)
      const dayOfWeek = futureDate.getDay();
      if (dayOfWeek === 5) {
        // Se o horário já passou hoje, pular para a próxima sexta
        if (i === 0 && now > futureDate) {
          continue;
        }
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Sextou! E aí, tem rolê ou vai economizar? 🎉",
            body: "Ajustem o orçamento e curtam o fds sem medo da fatura!",
            data: { type: 'friday_reminder' },
          },
          trigger: {
            type: 'timeInterval',
            seconds: Math.floor((futureDate.getTime() - now.getTime()) / 1000),
            repeats: false,
          },
        });
      }
    }
    
    console.log('Notificações de sexta-feira agendadas às 19:00');
  };

  // Função para agendar notificação de quarta-feira (quarta às 18:00)
  const scheduleWednesdayNotification = async () => {
    console.log('Agendando notificação de quarta-feira às 18:00...');
    
    const now = new Date();
    
    // Agendar para os próximos 30 dias
    for (let i = 0; i <= 30; i++) {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + i);
      futureDate.setHours(18, 0, 0, 0);
      
      // Verificar se é quarta-feira (3)
      const dayOfWeek = futureDate.getDay();
      if (dayOfWeek === 3) {
        // Se o horário já passou hoje, pular para a próxima quarta
        if (i === 0 && now > futureDate) {
          continue;
        }
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Já virou a semana? E o limite, virou também? 💸",
            body: "Confiram os gastos e evitem surpresas até sexta.",
            data: { type: 'wednesday_reminder' },
          },
          trigger: {
            type: 'timeInterval',
            seconds: Math.floor((futureDate.getTime() - now.getTime()) / 1000),
            repeats: false,
          },
        });
      }
    }
    
    console.log('Notificações de quarta-feira agendadas às 18:00');
  };

  // Função para agendar notificação de segunda-feira (segunda às 06:00)
  const scheduleMondayNotification = async () => {
    console.log('Agendando notificação de segunda-feira às 06:00...');
    
    const now = new Date();
    
    // Agendar para os próximos 30 dias
    for (let i = 0; i <= 30; i++) {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + i);
      futureDate.setHours(6, 0, 0, 0);
      
      // Verificar se é segunda-feira (1)
      const dayOfWeek = futureDate.getDay();
      if (dayOfWeek === 1) {
        // Se o horário já passou hoje, pular para a próxima segunda
        if (i === 0 && now > futureDate) {
          continue;
        }
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Nova semana, novos planos! 🎯💘",
            body: "Tomem café, combinem as metas e deixem o financeiro no modo romance.",
            data: { type: 'monday_reminder' },
          },
          trigger: {
            type: 'timeInterval',
            seconds: Math.floor((futureDate.getTime() - now.getTime()) / 1000),
            repeats: false,
          },
        });
      }
    }
    
    console.log('Notificações de segunda-feira agendadas às 06:00');
  };

  // Função para agendar notificação noturna (segunda a sexta às 21:00)
  const scheduleEveningNotification = async () => {
    console.log('Agendando notificação noturna para segunda a sexta às 21:00...');
    
    const now = new Date();
    
    // Agendar para os próximos 30 dias
    for (let i = 0; i <= 30; i++) {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + i);
      futureDate.setHours(21, 0, 0, 0);
      
      // Verificar se é segunda (1), terça (2), quarta (3), quinta (4) ou sexta (5)
      const dayOfWeek = futureDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Se o horário já passou hoje, pular para o próximo dia válido
        if (i === 0 && now > futureDate) {
          continue;
        }
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Momento casal: antes da série, confere aí 📱",
            body: "Revisem o dia e mantenham o time FinLove no controle!",
            data: { type: 'evening_reminder' },
          },
          trigger: {
            type: 'timeInterval',
            seconds: Math.floor((futureDate.getTime() - now.getTime()) / 1000),
            repeats: false,
          },
        });
      }
    }
    
    console.log('Notificações noturnas agendadas para segunda a sexta às 21:00');
  };

  // Função para agendar notificação do lanche (todo dia às 13:00)
  const scheduleLunchNotification = async () => {
    console.log('Agendando notificação do lanche para todo dia às 13:00...');
    
    const now = new Date();
    
    // Agendar para os próximos 31 dias
    for (let i = 0; i <= 30; i++) {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + i);
      futureDate.setHours(13, 0, 0, 0);
      
      // Se o horário já passou hoje, pular para o próximo dia
      if (i === 0 && now > futureDate) {
        continue;
      }
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Lanchinho pago? Bora anotar no FinLove 🍟❤️",
          body: "Gastos de hoje = meta de amanhã. Só 1 min a dois já ajuda!",
          data: { type: 'lunch_reminder' },
        },
        trigger: {
          type: 'timeInterval',
          seconds: Math.floor((futureDate.getTime() - now.getTime()) / 1000),
          repeats: false,
        },
      });
    }
    
    console.log('Notificações do lanche agendadas para todo dia às 13:00');
  };

  // Função para agendar notificação matinal (terça a sexta às 06:00)
  const scheduleMorningNotification = async () => {
    console.log('Agendando notificação matinal para terça a sexta às 06:00...');
    
    const now = new Date();
    
    // Agendar para os próximos 30 dias
    for (let i = 0; i <= 30; i++) {
      const futureDate = new Date(now);
      futureDate.setDate(futureDate.getDate() + i);
      futureDate.setHours(6, 0, 0, 0);
      
      // Verificar se é terça (2), quarta (3), quinta (4) ou sexta (5)
      const dayOfWeek = futureDate.getDay();
      if (dayOfWeek >= 2 && dayOfWeek <= 5) {
        // Se o horário já passou hoje, pular para o próximo dia válido
        if (i === 0 && now > futureDate) {
          continue;
        }
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Bom dia, casal! Bora começar no amor (e no controle)? ☀️",
            body: "Planejem rapidinho os gastos do dia e deixem o resto fluir.",
            data: { type: 'morning_reminder' },
          },
          trigger: {
            type: 'timeInterval',
            seconds: Math.floor((futureDate.getTime() - now.getTime()) / 1000),
            repeats: false,
          },
        });
      }
    }
    
    console.log('Notificações matinais agendadas para terça a sexta às 06:00');
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

  // Estado para controlar o modal de meta atingida
  const [goalReachedModal, setGoalReachedModal] = React.useState({
    visible: false,
    goalTitle: '',
    goalAmount: 0
  });

  // Função para mostrar modal interno quando meta for atingida
  const notifyGoalReached = async (goalTitle: string, goalAmount: number) => {
    console.log('🎯 === INÍCIO notifyGoalReached (Modal Interno) ===');
    console.log('🎯 Meta atingida:', goalTitle);
    console.log('🎯 Valor da meta:', goalAmount);
    
    // Mostrar modal interno ao invés de notificação externa
    setGoalReachedModal({
      visible: true,
      goalTitle,
      goalAmount
    });
    
    console.log('🎯 ✅ Modal de meta atingida exibido');
    console.log('🎯 === FIM notifyGoalReached ===');
  };

  // Função para fechar o modal de meta atingida
  const closeGoalReachedModal = () => {
    setGoalReachedModal({
      visible: false,
      goalTitle: '',
      goalAmount: 0
    });
  };

  // Função para agendar todas as notificações de uma vez
  const scheduleAllNotifications = async () => {
    console.log('Agendando todas as notificações...');
    
    try {
      await scheduleDailyNotification();
      await scheduleMorningNotification();
      await scheduleLunchNotification();
      await scheduleEveningNotification();
      await scheduleMondayNotification();
      await scheduleWednesdayNotification();
      await scheduleFridayNotification();
      await scheduleSaturdayNotification();
      await scheduleSundayNotification();
      await scheduleMonthlyNotification();
      await scheduleBillsReminderNotification();
      await scheduleMidMonthNotification();
      await scheduleEndMonthNotification();
      await scheduleLastDayMonthNotification();
      
      console.log('Todas as notificações foram agendadas com sucesso!');
    } catch (error) {
      console.error('Erro ao agendar notificações:', error);
    }
  };

  // Função para resetar o status de notificações agendadas (útil para reagendar)
   const resetNotificationsStatus = async () => {
     try {
       const AsyncStorage = await import('@react-native-async-storage/async-storage');
       await AsyncStorage.default.removeItem('@MyFinlove:notificationsScheduled');
       console.log('Status de notificações resetado. Próxima entrada no app irá reagendar.');
     } catch (error) {
       console.error('Erro ao resetar status de notificações:', error);
     }
   };

  return {
    expoPushToken,
    notification,
    sendTestNotification,
    sendImmediateNotification,
    scheduleDailyNotification,
    scheduleMorningNotification,
    scheduleLunchNotification,
    scheduleEveningNotification,
    scheduleMondayNotification,
    scheduleWednesdayNotification,
    scheduleFridayNotification,
    scheduleSaturdayNotification,
    scheduleSundayNotification,
    scheduleMonthlyNotification,
    scheduleBillsReminderNotification,
    scheduleMidMonthNotification,
    scheduleEndMonthNotification,
    scheduleLastDayMonthNotification,
    cancelDailyNotifications,
    notifyGoalReached,
    scheduleAllNotifications,
    resetNotificationsStatus,
    goalReachedModal,
    closeGoalReachedModal,
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