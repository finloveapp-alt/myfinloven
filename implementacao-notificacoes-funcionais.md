# Implementação de Notificações Funcionais - MyFinlove

## Visão Geral
Este documento detalha a implementação completa do sistema de notificações locais funcionais no aplicativo MyFinlove, incluindo notificações de teste, imediatas e diárias programadas.

## Estrutura da Implementação

### 1. Hook de Notificações (`hooks/useNotifications.ts`)

#### Configuração Inicial
```typescript
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
```

#### Estados e Listeners
```typescript
export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>('local-testing-mode');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    setupLocalNotifications();

    // Listener para notificações recebidas em foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listener para quando usuário toca na notificação
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
}
```

### 2. Funções de Notificação

#### Notificação de Teste (30 segundos)
```typescript
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
```

#### Notificação Imediata
```typescript
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
```

#### Notificação Diária (09:00)
```typescript
const scheduleDailyNotification = async () => {
  console.log('Agendando notificação diária para 09:00...');
  
  // Cancelar notificações diárias existentes
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
```

#### Cancelar Notificações Diárias
```typescript
const cancelDailyNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('Todas as notificações diárias foram canceladas');
};
```

### 3. Configuração de Permissões

```typescript
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
```

### 4. Interface de Teste (`app/(app)/test-notifications.tsx`)

#### Importação do Hook
```typescript
import { useNotifications } from '../../hooks/useNotifications';

export default function TestNotifications() {
  const {
    expoPushToken,
    notification,
    sendTestNotification,
    sendImmediateNotification,
    scheduleDailyNotification,
    cancelDailyNotifications,
  } = useNotifications();
}
```

#### Handlers das Notificações
```typescript
const handleTestNotification = async () => {
  try {
    await sendTestNotification();
    Alert.alert('Sucesso!', 'Notificação de teste agendada para 30 segundos!');
  } catch (error) {
    Alert.alert('Erro', 'Falha ao enviar notificação de teste');
    console.error(error);
  }
};

const handleImmediateNotification = async () => {
  try {
    await sendImmediateNotification();
    Alert.alert('Sucesso!', 'Notificação imediata enviada!');
  } catch (error) {
    Alert.alert('Erro', 'Falha ao enviar notificação imediata');
    console.error(error);
  }
};

const handleDailyNotification = async () => {
  try {
    await scheduleDailyNotification();
    Alert.alert('Sucesso!', 'Notificação diária agendada para 09:00!');
  } catch (error) {
    Alert.alert('Erro', 'Falha ao agendar notificação diária');
    console.error(error);
  }
};

const handleCancelDailyNotifications = async () => {
  try {
    await cancelDailyNotifications();
    Alert.alert('Sucesso!', 'Todas as notificações diárias foram canceladas!');
  } catch (error) {
    Alert.alert('Erro', 'Falha ao cancelar notificações diárias');
    console.error(error);
  }
};
```

#### Interface dos Botões
```typescript
<TouchableOpacity
  style={[styles.button, styles.primaryButton]}
  onPress={handleTestNotification}
>
  <Text style={styles.buttonText}>💕 Notificação de Teste (30s)</Text>
</TouchableOpacity>

<TouchableOpacity
  style={[styles.button, styles.secondaryButton]}
  onPress={handleImmediateNotification}
>
  <Text style={styles.buttonText}>🍟 Notificação Imediata</Text>
</TouchableOpacity>

<TouchableOpacity
  style={[styles.button, styles.dailyButton]}
  onPress={handleDailyNotification}
>
  <Text style={styles.buttonText}>⏰ Notificação Diária (09:00)</Text>
</TouchableOpacity>

<TouchableOpacity
  style={[styles.button, styles.cancelButton]}
  onPress={handleCancelDailyNotifications}
>
  <Text style={styles.buttonText}>❌ Cancelar Notificações Diárias</Text>
</TouchableOpacity>
```

## Problemas Resolvidos

### 1. Notificações Aparecendo Imediatamente
**Problema**: Notificações configuradas para horários específicos apareciam imediatamente.

**Solução**: 
- Usar `type: 'timeInterval'` com cálculo correto de segundos
- Verificar se o horário já passou hoje e agendar para o próximo dia
- Usar `Math.floor((futureDate.getTime() - now.getTime()) / 1000)` para calcular segundos

### 2. Repetição de Notificações Diárias
**Problema**: Expo Notifications não suporta repetição verdadeira para horários específicos.

**Solução**: 
- Agendar múltiplas notificações (30 dias)
- Cada notificação é individual com `repeats: false`
- Cancelar notificações anteriores antes de criar novas

### 3. Compatibilidade Android
**Problema**: Configurações específicas necessárias para Android.

**Solução**:
- Criar canal de notificação para Android
- Configurar importância, vibração e cor
- Solicitar permissões adequadamente

## Configuração de Estilos

```typescript
const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#00b894',
  },
  secondaryButton: {
    backgroundColor: '#e17055',
  },
  dailyButton: {
    backgroundColor: '#6c5ce7',
  },
  cancelButton: {
    backgroundColor: '#d63031',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## Funcionalidades Implementadas

1. **Notificação de Teste**: Enviada após 30 segundos
2. **Notificação Imediata**: Enviada instantaneamente
3. **Notificação Diária**: Enviada todos os dias às 09:00
4. **Cancelamento**: Remove todas as notificações agendadas
5. **Logs de Debug**: Para acompanhar o processo
6. **Tratamento de Erros**: Com alertas informativos
7. **Interface Intuitiva**: Botões coloridos e descritivos

## Logs e Debug

O sistema inclui logs detalhados para facilitar o debug:
- `console.log('Agendando notificação para 30 segundos...')`
- `console.log('Notificação agendada com ID:', notificationId)`
- `console.log('Próxima notificação será em:', scheduledDate.toLocaleString())`

## Considerações Importantes

1. **Permissões**: O usuário deve conceder permissão para notificações
2. **Background**: Notificações funcionam mesmo com app em background
3. **Limitações**: Máximo de 64 notificações agendadas por app no iOS
4. **Teste**: Sempre testar em dispositivo físico para melhor experiência
5. **Horários**: Sistema considera fuso horário local do dispositivo

## Resultado Final

Sistema completo de notificações funcionais que permite:
- Testes rápidos (30s)
- Notificações imediatas
- Lembretes diários automáticos
- Controle total (cancelamento)
- Interface amigável para gerenciamento 