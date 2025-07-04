# Supabase + Push Notifications no Android

## Guia Completo para Implementação

Este documento explica como implementar notificações push no Android usando Supabase em conjunto com o Expo Push Service.

## 📋 Resposta Direta

**SIM, você pode usar notificações push com Supabase no Android, MAS você ainda precisa do Firebase para o Android.**

### Por que ainda precisa do Firebase?

- **Supabase** → Gerencia dados, autenticação e triggers
- **Expo Push Service** → Simplifica o envio (funciona com FCM por trás)
- **Firebase Cloud Messaging (FCM)** → Entrega as notificações no Android

## 🏗️ Arquitetura da Solução

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Native  │    │    Supabase     │    │  Expo Push      │
│   (Expo App)    │───▶│   Database      │───▶│   Service       │
│                 │    │   + Webhooks    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         │                       │              ┌─────────────────┐
         │                       │              │ Firebase Cloud  │
         │                       │              │  Messaging      │
         │                       │              │     (FCM)       │
         │                       │              └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │ Supabase Edge   │              │
         └──────────────│   Functions     │◀─────────────┘
                        │                 │
                        └─────────────────┘
```

## 🎯 Duas Abordagens Principais

### Opção A: Supabase + Expo Push Service (Recomendada)

**Vantagens:**
- ✅ Mais simples de implementar
- ✅ Multiplataforma (iOS + Android)
- ✅ Menos configuração
- ✅ Integração nativa com Expo

**Desvantagens:**
- ❌ Dependente do serviço Expo
- ❌ Limitações de personalização

### Opção B: Supabase + Firebase Cloud Messaging Direto

**Vantagens:**
- ✅ Controle total sobre notificações
- ✅ Mais opções de personalização
- ✅ Independente do Expo

**Desvantagens:**
- ❌ Mais complexo de configurar
- ❌ Precisa configurar Firebase manualmente
- ❌ Código diferente para iOS/Android

## 🚀 Implementação Recomendada (Opção A)

### 1. Configuração no Frontend

```typescript
// app/lib/notifications.ts
import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

export async function registerForPushNotifications() {
  // Solicitar permissões
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status !== 'granted') {
    throw new Error('Permissão negada para notificações');
  }

  // Obter token
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  
  // Salvar token no Supabase
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await supabase
      .from('profiles')
      .update({ expo_push_token: token })
      .eq('id', user.id);
  }
  
  return token;
}
```

### 2. Estrutura do Banco de Dados

```sql
-- Adicionar coluna para token push
ALTER TABLE profiles 
ADD COLUMN expo_push_token TEXT;

-- Criar tabela de notificações
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política de segurança
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
```

### 3. Supabase Edge Function

```typescript
// supabase/functions/push-notification/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  data?: any;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: Notification;
  schema: 'public';
  old_record: null | Notification;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    
    // Buscar token do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('expo_push_token')
      .eq('id', payload.record.user_id)
      .single();

    if (!profile?.expo_push_token) {
      return new Response('Token não encontrado', { status: 404 });
    }

    // Enviar notificação via Expo Push Service
    const pushResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`,
      },
      body: JSON.stringify({
        to: profile.expo_push_token,
        title: payload.record.title,
        body: payload.record.body,
        data: payload.record.data || {},
        sound: 'default',
        priority: 'high',
      }),
    });

    const result = await pushResponse.json();
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return new Response('Erro interno', { status: 500 });
  }
});
```

### 4. Configuração do Webhook

No Dashboard do Supabase:

1. **Database** → **Webhooks**
2. **Create a new hook**
3. **Configurações:**
   - **Name**: `push-notification-webhook`
   - **Table**: `notifications`
   - **Events**: `Insert`
   - **Type**: `Supabase Edge Functions`
   - **Edge Function**: `push-notification`
   - **HTTP Headers**: Adicionar `Authorization` com service key

### 5. Configuração do Expo Access Token

```bash
# No terminal do Supabase
supabase secrets set EXPO_ACCESS_TOKEN=your_expo_access_token
```

## 🔧 Implementação Alternativa (Opção B)

### Supabase Edge Function com FCM Direto

```typescript
// supabase/functions/push-notification-fcm/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    
    // Buscar token FCM do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('fcm_token')
      .eq('id', payload.record.user_id)
      .single();

    if (!profile?.fcm_token) {
      return new Response('Token FCM não encontrado', { status: 404 });
    }

    // Enviar via Firebase Cloud Messaging
    const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY')}`,
      },
      body: JSON.stringify({
        to: profile.fcm_token,
        notification: {
          title: payload.record.title,
          body: payload.record.body,
          icon: 'default',
          sound: 'default',
        },
        data: payload.record.data || {},
        priority: 'high',
      }),
    });

    const result = await fcmResponse.json();
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Erro ao enviar notificação FCM:', error);
    return new Response('Erro interno', { status: 500 });
  }
});
```

## 📱 Uso no App

### Enviar Notificação

```typescript
// Em qualquer parte do app
const sendNotification = async (userId: string, title: string, body: string) => {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      body,
      data: { type: 'custom', timestamp: new Date().toISOString() }
    });

  if (error) {
    console.error('Erro ao enviar notificação:', error);
  }
};

// Exemplo de uso
await sendNotification(
  'user-uuid-here',
  'Nova transação',
  'Você recebeu R$ 150,00'
);
```

### Lidar com Notificações Recebidas

```typescript
// app/_layout.tsx
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    // Configurar como as notificações devem ser tratadas
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Listener para quando o app está em foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notificação recebida:', notification);
      }
    );

    // Listener para quando o usuário toca na notificação
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notificação tocada:', response);
        // Navegar para tela específica baseado na notificação
      }
    );

    return () => {
      foregroundSubscription.remove();
      backgroundSubscription.remove();
    };
  }, []);

  return (
    // Seu layout aqui
  );
}
```

## 🔐 Configuração de Segurança

### Variáveis de Ambiente

```bash
# .env.local (para desenvolvimento)
EXPO_ACCESS_TOKEN=your_expo_access_token
FCM_SERVER_KEY=your_fcm_server_key (se usar FCM direto)
```

### Supabase Secrets

```bash
# Deploy das secrets
supabase secrets set EXPO_ACCESS_TOKEN=your_expo_access_token
supabase secrets set FCM_SERVER_KEY=your_fcm_server_key
```

## 🎯 Casos de Uso Específicos para MyFinlove

### 1. Notificação de Nova Transação

```typescript
// Quando uma transação é criada
const notifyNewTransaction = async (userId: string, amount: number, type: 'income' | 'expense') => {
  const title = type === 'income' ? 'Nova Receita' : 'Nova Despesa';
  const body = `${type === 'income' ? 'Você recebeu' : 'Você gastou'} R$ ${amount.toFixed(2)}`;
  
  await sendNotification(userId, title, body);
};
```

### 2. Notificação de Convite de Casal

```typescript
// Quando um convite é enviado
const notifyPartnerInvite = async (userId: string, partnerName: string) => {
  await sendNotification(
    userId,
    'Convite de Casal',
    `${partnerName} te convidou para compartilhar finanças`
  );
};
```

### 3. Notificação de Meta Atingida

```typescript
// Quando uma meta é atingida
const notifyGoalReached = async (userId: string, goalName: string) => {
  await sendNotification(
    userId,
    'Meta Atingida! 🎉',
    `Parabéns! Você atingiu a meta "${goalName}"`
  );
};
```

## 🚀 Deploy e Produção

### 1. Deploy da Edge Function

```bash
# Deploy da função
supabase functions deploy push-notification

# Configurar secrets
supabase secrets set EXPO_ACCESS_TOKEN=your_production_token
```

### 2. Configurar Webhook

1. Acesse o Dashboard do Supabase
2. Vá para **Database** → **Webhooks**
3. Configure o webhook para apontar para a função em produção

### 3. Testar em Produção

```typescript
// Função de teste
const testNotification = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await sendNotification(
      user.id,
      'Teste de Notificação',
      'Esta é uma notificação de teste'
    );
  }
};
```

## 🔍 Troubleshooting

### Problemas Comuns

1. **Token não encontrado**
   - Verificar se o token foi salvo corretamente
   - Confirmar se o usuário deu permissão

2. **Notificação não chega**
   - Verificar logs da Edge Function
   - Confirmar configuração do webhook
   - Testar token manualmente

3. **Erro de permissão**
   - Verificar RLS policies
   - Confirmar service role key

### Logs e Debug

```typescript
// Adicionar logs na Edge Function
console.log('Payload recebido:', payload);
console.log('Token encontrado:', profile?.expo_push_token);
console.log('Resposta do Expo:', result);
```

## 📚 Recursos Adicionais

- [Documentação Expo Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

## 🏁 Conclusão

**Supabase não substitui completamente o Firebase para push notifications no Android**, mas oferece uma camada de abstração muito mais simples através do **Expo Push Service**, que é a melhor opção para projetos Expo/React Native.

A integração Supabase + Expo Push Service oferece:
- ✅ Simplicidade de implementação
- ✅ Multiplataforma
- ✅ Integração nativa com seu stack
- ✅ Webhooks automáticos
- ✅ Segurança com RLS

**Recomendação**: Use a **Opção A (Supabase + Expo Push Service)** para seu projeto MyFinlove. 