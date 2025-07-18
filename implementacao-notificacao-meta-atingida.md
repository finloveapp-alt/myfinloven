# Implementação de Notificação de Meta Atingida - MyFinlove

## Análise da Estrutura Atual

### Sistema de Metas
O sistema de metas está localizado no arquivo `app/(app)/planning.tsx` e possui:

- **Estrutura de dados**: Metas armazenadas na tabela `financial_goals` do Supabase
- **Campos principais**: `id`, `title`, `target_amount`, `current_amount`, `percentage`, `deadline`, `icon`, `color`
- **Função principal**: `saveGoalDeposit()` - responsável por adicionar depósitos e atualizar o progresso da meta

### Sistema de Notificações
O sistema de notificações está no arquivo `hooks/useNotifications.ts` e possui:

- **14 tipos de notificações** já implementadas (diárias, semanais, mensais)
- **Função base**: `Notifications.scheduleNotificationAsync()` para agendar notificações
- **Padrão estabelecido**: Notificações com título, corpo e dados personalizados

## Passo a Passo para Implementação

### Passo 1: Criar a Função de Notificação de Meta Atingida

Adicionar no arquivo `hooks/useNotifications.ts`:

```typescript
// Função para enviar notificação imediata quando meta for atingida
const notifyGoalReached = async (goalTitle: string, goalAmount: number) => {
  console.log('Enviando notificação de meta atingida:', goalTitle);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Vocês são o casal meta! 🏆💕",
      body: `Meta ${goalTitle} concluída! Agora é planejar a próxima conquista a dois ✈️💕`,
      data: { 
        type: 'goal_reached',
        goalTitle: goalTitle,
        goalAmount: goalAmount
      },
    },
    trigger: {
      type: 'timeInterval',
      seconds: 1, // Notificação imediata
      repeats: false,
    },
  });
  
  console.log('Notificação de meta atingida enviada com sucesso!');
};
```

### Passo 2: Exportar a Função no Hook

No retorno do hook `useNotifications`, adicionar:

```typescript
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
  notifyGoalReached, // ← NOVA FUNÇÃO
};
```

### Passo 3: Importar o Hook no Planning.tsx

No arquivo `app/(app)/planning.tsx`, adicionar a importação:

```typescript
import { useNotifications } from '../../hooks/useNotifications';

// Dentro do componente Planning
const { notifyGoalReached } = useNotifications();
```

### Passo 4: Implementar a Lógica de Verificação na Função saveGoalDeposit

Modificar a função `saveGoalDeposit` no arquivo `app/(app)/planning.tsx`:

```typescript
const saveGoalDeposit = async (goalId: string, amount: number, userName: string) => {
  try {
    // ... código existente até o cálculo do newPercentage ...
    
    const newPercentage = parseFloat(((newCurrentAmount / goalData.target_amount) * 100).toFixed(1));
    
    // ✨ NOVA LÓGICA: Verificar se a meta foi atingida
    const wasGoalReached = newPercentage >= 100;
    const previousAmount = goalData.current_amount || 0;
    const wasAlreadyReached = (previousAmount / goalData.target_amount) * 100 >= 100;
    
    // Atualizar a meta com os novos valores
    const { error: updateError } = await supabase
      .from('financial_goals')
      .update({
        current_amount: newCurrentAmount,
        percentage: newPercentage
      })
      .eq('id', goalId);

    if (updateError) {
      console.error('Erro ao atualizar meta:', updateError);
      return false;
    }
    
    // ✨ NOVA LÓGICA: Enviar notificação se a meta foi atingida pela primeira vez
    if (wasGoalReached && !wasAlreadyReached) {
      // Buscar o título da meta para a notificação
      const { data: goalDetails, error: goalDetailsError } = await supabase
        .from('financial_goals')
        .select('title')
        .eq('id', goalId)
        .single();
        
      if (!goalDetailsError && goalDetails) {
        await notifyGoalReached(goalDetails.title, goalData.target_amount);
      }
    }
    
    // ... resto do código existente ...
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar depósito:', error);
    return false;
  }
};
```

### Passo 5: Implementar Verificação Adicional (Opcional)

Para garantir que a notificação seja enviada em outros cenários (como edição manual da meta), também adicionar a verificação na função `updateFinancialGoal`:

```typescript
const updateFinancialGoal = async (goalId: string, title: string, targetAmount: number, deadline: string, icon: string) => {
  try {
    // ... código existente ...
    
    // Buscar dados atuais da meta antes da atualização
    const { data: currentGoalData, error: currentGoalError } = await supabase
      .from('financial_goals')
      .select('current_amount, target_amount')
      .eq('id', goalId)
      .single();
    
    if (!currentGoalError && currentGoalData) {
      const currentPercentage = (currentGoalData.current_amount / currentGoalData.target_amount) * 100;
      const newPercentage = (currentGoalData.current_amount / targetAmount) * 100;
      
      // Se a meta não estava atingida antes mas agora está (devido à mudança no valor alvo)
      if (currentPercentage < 100 && newPercentage >= 100) {
        await notifyGoalReached(title, targetAmount);
      }
    }
    
    // ... resto do código existente ...
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    Alert.alert('Erro', 'Ocorreu um erro inesperado');
  }
};
```

## Resumo das Modificações

### Arquivos Alterados:
1. **`hooks/useNotifications.ts`**:
   - Adicionar função `notifyGoalReached`
   - Exportar a nova função no retorno do hook

2. **`app/(app)/planning.tsx`**:
   - Importar `notifyGoalReached` do hook
   - Modificar `saveGoalDeposit` para verificar meta atingida
   - (Opcional) Modificar `updateFinancialGoal` para verificação adicional

### Funcionalidades Implementadas:
- ✅ Notificação imediata quando meta é atingida (≥100%)
- ✅ Verificação para evitar notificações duplicadas
- ✅ Título: "Vocês são o casal meta! 🏆💕"
- ✅ Corpo: "Meta {nome da meta} concluída! Agora é planejar a próxima conquista a dois ✈️💕"
- ✅ Integração com sistema de notificações existente
- ✅ Dados estruturados para futuras funcionalidades

### Comportamento Esperado:
Quando um usuário adicionar um depósito que faça a meta atingir ou ultrapassar 100% do valor alvo, uma notificação será enviada imediatamente com a mensagem de parabéns personalizada.

## Testes Recomendados:
1. Criar uma meta com valor baixo (ex: R$ 10,00)
2. Adicionar depósitos até atingir exatamente 100%
3. Verificar se a notificação é enviada
4. Adicionar mais depósitos e verificar que não há notificações duplicadas
5. Testar com diferentes valores e títulos de meta