# Implementação de Notificações com Expo Notifications

## Guia Completo para MyFinlove

Este documento fornece um passo a passo completo para implementar notificações push no projeto MyFinlove usando `expo-notifications`.

## 📋 Pré-requisitos

- Expo SDK 52 ✅
- React Native 0.76.9 ✅
- Bare Workflow ✅
- EAS Build configurado ✅

## 🚀 Passo 1: Instalação

```bash
npx expo install expo-notifications expo-device expo-constants
```

## 🔧 Passo 2: Configuração no app.json

Adicione o plugin de notificações no seu `app.json`:

```json
{
  "expo": {
    "name": "MyFinlove",
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "sounds": ["./assets/notification-sound.wav"]
        }
      ]
    ]
  }
}
```

## 📱 Passo 3: Configuração para iOS

### 3.1 Certificados Push (Apple Developer)

1. Acesse [Apple Developer Console](https://developer.apple.com)
2. Vá em **Certificates, Identifiers & Profiles**
3. Crie um **Apple Push Notification service SSL Certificate**
4. Baixe o certificado `.p12`

### 3.2 Configuração no EAS

```bash
eas credentials
```

Selecione:
- **iOS** → **Push Notifications** → **Upload Push Certificate**
- Faça upload do arquivo `.p12`

## 🤖 Passo 4: Configuração para Android

### 4.1 Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie um novo projeto ou use existente
3. Adicione um app Android
4. Baixe o `google-services.json`
5. Vá em **Project Settings** → **Cloud Messaging**
6. Copie a **Server Key**

### 4.2 Configuração no EAS

```bash
eas credentials
```

Selecione:
- **Android** → **Google Service Account Key**
- Faça upload do `google-services.json`

## 💻 Passo 5: Implementação do Código

### 5.1 Criar o serviço de notificações

Crie o arquivo `lib/services/notificationService.ts`:

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configurar como as notificações devem ser tratadas quando recebidas
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  // Registrar para notificações push
  static async registerForPushNotificationsAsync(): Promise<string | null> {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert('Falha ao obter permissão para notificações push!');
        return null;
      }
      
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID não encontrado');
        }
        
        token = (await Notifications.getExpoPushTokenAsync({
          projectId,
        })).data;
        
        console.log('Push token:', token);
      } catch (e) {
        console.error('Erro ao obter push token:', e);
        return null;
      }
    } else {
      alert('Deve usar um dispositivo físico para notificações push');
    }

    return token;
  }

  // Agendar notificação local
  static async scheduleNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: trigger || { seconds: 2 },
    });
  }

  // Cancelar todas as notificações
  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Obter notificações pendentes
  static async getPendingNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
}
```

### 5.2 Hook personalizado para notificações

Crie o arquivo `hooks/useNotifications.ts`:

```typescript
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '../lib/services/notificationService';

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Registrar para notificações
    NotificationService.registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
    });

    // Listener para notificações recebidas
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listener para quando o usuário toca na notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notificação tocada:', response);
      // Aqui você pode navegar para uma tela específica
      // Por exemplo: navigation.navigate('TransactionDetails', { id: response.notification.request.content.data.transactionId });
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

  return {
    expoPushToken,
    notification,
    scheduleNotification: NotificationService.scheduleNotification,
    cancelAllNotifications: NotificationService.cancelAllNotifications,
  };
}
```

### 5.3 Integração no App Principal

Modifique o arquivo `app/_layout.tsx`:

```typescript
import { useNotifications } from '../hooks/useNotifications';
import { useEffect } from 'react';

export default function RootLayout() {
  const { expoPushToken, notification } = useNotifications();

  useEffect(() => {
    if (expoPushToken) {
      console.log('Push token registrado:', expoPushToken);
      // Aqui você pode enviar o token para seu backend
      // savePushTokenToBackend(expoPushToken);
    }
  }, [expoPushToken]);

  useEffect(() => {
    if (notification) {
      console.log('Nova notificação recebida:', notification);
      // Lógica para lidar com notificações recebidas
    }
  }, [notification]);

  // ... resto do seu layout
}
```

## 🔔 Passo 6: Exemplos de Uso

### 6.1 Notificação de Nova Transação

```typescript
// No arquivo onde você cria transações
import { NotificationService } from '../lib/services/notificationService';

const criarTransacao = async (transacao: any) => {
  // ... lógica para criar transação
  
  // Agendar notificação
  await NotificationService.scheduleNotification(
    'Nova Transação Criada',
    `Transação de R$ ${transacao.valor} foi adicionada`,
    { transactionId: transacao.id, type: 'transaction' }
  );
};
```

### 6.2 Lembrete de Pagamento

```typescript
// Agendar lembrete para amanhã às 9h
const agendarLembretePagamento = async (conta: any) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  await NotificationService.scheduleNotification(
    'Lembrete de Pagamento',
    `Não esqueça de pagar a conta: ${conta.nome}`,
    { accountId: conta.id, type: 'payment_reminder' },
    { date: tomorrow }
  );
};
```

### 6.3 Notificação Semanal de Gastos

```typescript
// Agendar notificação semanal
const agendarResumoSemanal = async () => {
  await NotificationService.scheduleNotification(
    'Resumo Semanal',
    'Veja como foram seus gastos esta semana!',
    { type: 'weekly_summary' },
    {
      weekday: 1, // Segunda-feira
      hour: 10,
      minute: 0,
      repeats: true
    }
  );
};
```

## 🧪 Passo 7: Teste das Notificações

### 7.1 Teste Local

```typescript
// Adicione um botão de teste na sua tela
const testarNotificacao = async () => {
  await NotificationService.scheduleNotification(
    'Teste de Notificação',
    'Esta é uma notificação de teste!',
    { test: true },
    { seconds: 5 }
  );
};
```

### 7.2 Teste com Expo Push Tool

1. Acesse: [https://expo.dev/notifications](https://expo.dev/notifications)
2. Cole seu push token
3. Envie uma notificação de teste

## 🔄 Passo 8: Build e Deploy

### 8.1 Gerar Development Build

```bash
eas build --platform all --profile development
```

### 8.2 Gerar Production Build

```bash
eas build --platform all --profile production
```

## 📊 Passo 9: Monitoramento

### 9.1 Logs de Notificações

```typescript
// Adicionar logs para debug
const logNotificationStatus = async () => {
  const permissions = await Notifications.getPermissionsAsync();
  console.log('Permissões:', permissions);
  
  const pendingNotifications = await NotificationService.getPendingNotifications();
  console.log('Notificações pendentes:', pendingNotifications.length);
};
```

### 9.2 Analytics (Opcional)

```typescript
// Tracking de notificações abertas
responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
  // Enviar evento para analytics
  analytics.track('notification_opened', {
    type: response.notification.request.content.data?.type,
    title: response.notification.request.content.title
  });
});
```

## 🚨 Troubleshooting

### Problemas Comuns:

1. **Token não é gerado**: Verificar se está usando dispositivo físico
2. **Notificações não aparecem**: Verificar permissões e configuração do canal
3. **Build falha**: Verificar se todos os certificados estão configurados
4. **Notificações não chegam**: Verificar configuração do Firebase/Apple

### Comandos Úteis:

```bash
# Verificar configuração
npx expo-doctor

# Limpar cache
npx expo start --clear

# Verificar credenciais
eas credentials
```

## 📝 Próximos Passos

1. ✅ Implementar notificações básicas
2. ✅ Configurar notificações de transações
3. ✅ Adicionar lembretes de pagamento
4. ✅ Implementar resumos semanais
5. 🔄 Integrar com backend para notificações push remotas
6. 🔄 Adicionar preferências de notificação no perfil do usuário
7. 🔄 Implementar notificações para casais (compartilhamento)

## 🔗 Recursos Adicionais

- [Documentação Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Guia de Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notifications](https://developer.apple.com/documentation/usernotifications)

---

**Implementado por:** Assistente IA  
**Data:** Janeiro 2025  
**Versão:** 1.0 