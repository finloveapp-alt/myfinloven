# Implementação de Notificações Push - MyFinlove

## Visão Geral

Este documento detalha a implementação de notificações push para o aplicativo MyFinlove, utilizando Expo Notifications. As notificações serão baseadas em gatilhos específicos e terão uma estrutura padronizada com headline e descrição.

## Estrutura das Notificações

### Formato Padrão
```typescript
interface NotificationData {
  headline: string;     // Título principal da notificação
  description: string;  // Descrição detalhada
  trigger: TriggerType; // Tipo de gatilho que acionou a notificação
  data?: any;          // Dados adicionais específicos do contexto
}
```

## Tipos de Gatilhos

### 📆 ROTINA DIÁRIA

#### Planejamento Matinal (Terça a Sexta)
- **Trigger**: Terça a sexta-feira às 06h
- **Headline**: "Bom dia, casal! Bora começar no amor (e no controle)? ☀💑"
- **Descrição**: "Planejem rapidinho os gastos do dia e deixem o resto fluir."
- **Horário**: 06:00

#### Lembrete do Almoço (Todos os dias)
- **Trigger**: Todos os dias às 13h
- **Headline**: "Lanchinho pago? Bora anotar no FinLove 🍟❤"
- **Descrição**: "Gastos de hoje = meta de amanhã. Só 1 min a dois já ajuda!"
- **Horário**: 13:00

#### Revisão Noturna (Segunda a Sexta)
- **Trigger**: Segunda a sexta-feira às 21h
- **Headline**: "Momento casal: antes da série, confere aí 📱+🛋"
- **Descrição**: "Revisem o dia e mantenham o time FinLove no controle!"
- **Horário**: 21:00

### 📆 CHECK-INS SEMANAIS

#### Segunda-feira - Planejamento Semanal
- **Trigger**: Segunda-feira às 06h
- **Headline**: "Nova semana, novos planos! 🎯💘"
- **Descrição**: "Tomem café, combinem as metas e deixem o financeiro no modo romance."
- **Horário**: 06:00

#### Quarta-feira - Meio da Semana
- **Trigger**: Quarta-feira às 18h
- **Headline**: "Já virou a semana? E o limite, virou também? 💸"
- **Descrição**: "Confiram os gastos e evitem surpresas até sexta."
- **Horário**: 18:00

#### Sexta-feira - Preparação para o Final de Semana
- **Trigger**: Sexta-feira às 19h
- **Headline**: "Sextou! E aí, tem rolê ou vai economizar? 😎"
- **Descrição**: "Ajustem o orçamento e curtam o fds sem medo da fatura!"
- **Horário**: 19:00

#### Sábado - Organização Matinal
- **Trigger**: Sábado às 10h
- **Headline**: "Casal que organiza de manhã, aproveita o sábado sem peso 💖❤"
- **Descrição**: "Um toque de organização deixa o dia mais leve. Bora?"
- **Horário**: 10:00

#### Domingo - Fechamento da Semana
- **Trigger**: Domingo às 20h
- **Headline**: "Domingo à noite: papo leve, check rápido e sofá em paz 💑"
- **Descrição**: "Revise, anote e entre na semana com o pé (e o bolso) direito."
- **Horário**: 20:00

### 📆 QUINZENAIS E MENSAIS

#### Início do Mês
- **Trigger**: Dia 1 às 09h
- **Headline**: "Mês novo, casal novo? Bora alinhar tudo! 🗓💞"
- **Descrição**: "Hora de sonhar juntos: criem as metas e combinem o plano de jogo."
- **Horário**: 09:00

#### Contas Fixas
- **Trigger**: Dia 5 às 17h
- **Headline**: "Contas fixas pagas ou só prometeram? 😬"
- **Descrição**: "Confiram os pagamentos da semana e evitem o fantasma do juros!"
- **Horário**: 17:00

#### Meio do Mês
- **Trigger**: Dia 15 às 12h
- **Headline**: "Metade do mês = hora de dar aquela olhadinha 👀"
- **Descrição**: "Já é dia 15! Vale revisar e ajustar antes que o mês corra."
- **Horário**: 12:00

#### Reta Final do Mês
- **Trigger**: Dia 25 às 14h
- **Headline**: "Esse mês voou! Tão no azul ou no 'a gente se ama mesmo assim'? 💔💸"
- **Descrição**: "Ajustem categorias e fechem bonito."
- **Horário**: 14:00

#### Fechamento do Mês
- **Trigger**: Último dia do mês às 18h
- **Headline**: "Casal que vence junto, economiza junto 👏💰"
- **Descrição**: "Fechamento do mês ativado! Revisem juntos e celebrem até as pequenas vitórias."
- **Horário**: 18:00

### 💬 COMPORTAMENTAIS (EXTRAS CONDICIONAIS)

#### Meta Atingida
- **Trigger**: Quando uma meta é concluída
- **Headline**: "Vocês são o casal meta! 🏆💕"
- **Descrição**: "Meta 'Viagem' concluída! Agora é planejar a próxima conquista a dois ✈💕"
- **Horário**: Condicional

#### Gastos Desequilibrados
- **Trigger**: Quando um parceiro gasta significativamente mais
- **Headline**: "Opa, um de vocês se empolgou 💳😅"
- **Descrição**: "Um gastou BEM mais esse mês. Que tal revisar juntos e ajustar com carinho?"
- **Horário**: Condicional

#### Categoria Estourando
- **Trigger**: Quando uma categoria ultrapassa o limite
- **Headline**: "Entreguem os cartões! 🫣"
- **Descrição**: "Uma categoria passou do limite. Respira, revisa e vê como fechar no azul."
- **Horário**: Condicional

#### Streak de Uso
- **Trigger**: 7 dias consecutivos usando o app
- **Headline**: "Que orgulho! Casal FinLove nível hard 🐷🔥"
- **Descrição**: "7 dias organizando juntos! É isso, casal referência em finanças e carinho."
- **Horário**: Condicional

### 2. Gatilhos Baseados em Eventos (Adicionais)

#### Nova Receita Adicionada
- **Trigger**: Quando uma receita é registrada
- **Headline**: "✅ Receita registrada!"
- **Descrição**: "Receita de R$ [Valor] foi adicionada com sucesso."

#### Gasto Alto Detectado
- **Trigger**: Transação acima de um valor limite
- **Headline**: "💸 Gasto alto detectado"
- **Descrição**: "Você registrou um gasto de R$ [Valor]. Isso representa [%] da sua meta mensal."

#### Saldo Baixo
- **Trigger**: Quando saldo fica abaixo de um limite
- **Headline**: "⚠️ Saldo baixo na conta"
- **Descrição**: "Sua conta [Nome] está com saldo de apenas R$ [Valor]."

#### Convite de Casal
- **Trigger**: Quando recebe convite para conectar contas
- **Headline**: "💕 Convite recebido!"
- **Descrição**: "[Nome do Parceiro] te convidou para conectar suas finanças no MyFinlove."

## Implementação Técnica

### 1. Configuração Inicial

```typescript
// hooks/useNotifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
```

### 2. Serviço de Notificações

```typescript
// services/notificationService.ts
class NotificationService {
  // Agendar notificação baseada em data
  async scheduleTimeBasedNotification(
    headline: string,
    description: string,
    triggerDate: Date,
    data?: any
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: headline,
        body: description,
        data,
      },
      trigger: {
        date: triggerDate,
      },
    });
  }

  // Enviar notificação imediata (baseada em evento)
  async sendEventBasedNotification(
    headline: string,
    description: string,
    data?: any
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: headline,
        body: description,
        data,
      },
      trigger: null, // Imediata
    });
  }

  // Cancelar notificações específicas
  async cancelNotification(identifier: string) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }
}
```

### 3. Integração com Supabase

```typescript
// Trigger para notificações baseadas em eventos
const handleTransactionAdded = async (transaction: Transaction) => {
  const notificationService = new NotificationService();
  
  // Verificar se é um gasto alto
  if (transaction.type === 'expense' && transaction.amount > 500) {
    await notificationService.sendEventBasedNotification(
      '💸 Gasto alto detectado',
      `Você registrou um gasto de R$ ${transaction.amount.toFixed(2)}.`,
      { transactionId: transaction.id }
    );
  }
  
  // Verificar meta mensal
  const monthlyExpenses = await getMonthlyExpenses();
  const monthlyGoal = await getMonthlyGoal();
  
  if (monthlyExpenses >= monthlyGoal * 0.8) {
    await notificationService.sendEventBasedNotification(
      '⚠️ Meta de gastos quase atingida!',
      'Você já gastou 80% da sua meta mensal. Fique atento!'
    );
  }
};
```

### 4. Agendamento de Notificações Recorrentes

```typescript
// Agendar lembretes de contas a pagar
const scheduleAccountReminders = async () => {
  const accounts = await getAccountsWithDueDates();
  
  for (const account of accounts) {
    const reminderDate = new Date(account.dueDate);
    reminderDate.setHours(9, 0, 0, 0); // 09:00 do dia
    
    await notificationService.scheduleTimeBasedNotification(
      '💳 Conta vencendo hoje!',
      `Sua conta ${account.name} de R$ ${account.amount.toFixed(2)} vence hoje.`,
      reminderDate,
      { accountId: account.id }
    );
  }
};

// Agendar relatório mensal
const scheduleMonthlyReport = async () => {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(8, 0, 0, 0);
  
  await notificationService.scheduleTimeBasedNotification(
    '📊 Relatório mensal disponível',
    'Seu relatório financeiro está pronto. Veja como foi seu desempenho!',
    nextMonth
  );
};
```

## Configurações do Usuário

### Preferências de Notificação

```typescript
interface NotificationPreferences {
  accountReminders: boolean;        // Lembretes de contas
  incomeReminders: boolean;         // Lembretes de receitas
  goalAlerts: boolean;             // Alertas de meta
  monthlyReports: boolean;         // Relatórios mensais
  highExpenseAlerts: boolean;      // Alertas de gastos altos
  lowBalanceAlerts: boolean;       // Alertas de saldo baixo
  coupleInvites: boolean;          // Convites de casal
  weeklyPlanning: boolean;         // Lembretes de planejamento
}
```

### Tela de Configurações

O usuário poderá ativar/desativar cada tipo de notificação individualmente na tela de configurações do aplicativo.

## Casos de Uso Específicos

### 1. Fluxo de Casais
- Notificação quando parceiro adiciona transação
- Alerta quando meta compartilhada é atingida
- Lembrete para revisar gastos em conjunto

### 2. Gestão de Cartões
- Lembrete de fatura próxima ao vencimento
- Alerta de limite próximo ao máximo
- Notificação de nova transação no cartão

### 3. Planejamento Financeiro
- Lembrete semanal para revisar orçamento
- Alerta quando categoria específica atinge limite
- Sugestão de economia baseada em padrões

## Considerações de UX

1. **Frequência**: Evitar spam de notificações
2. **Relevância**: Notificações devem ser contextuais e úteis
3. **Personalização**: Permitir customização completa pelo usuário
4. **Timing**: Horários apropriados para cada tipo de notificação
5. **Ações**: Permitir ações diretas a partir da notificação

## Próximos Passos

1. Implementar o serviço base de notificações
2. Criar sistema de preferências do usuário
3. Integrar com eventos do Supabase
4. Implementar agendamento de notificações recorrentes
5. Adicionar analytics para otimizar efetividade
6. Testes em diferentes cenários e dispositivos

## Observações Técnicas

- Utilizar Expo Notifications para compatibilidade cross-platform
- Implementar fallbacks para quando notificações estão desabilitadas
- Considerar rate limiting para evitar spam
- Implementar sistema de retry para notificações críticas
- Adicionar logs para debugging e analytics