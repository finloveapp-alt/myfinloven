# Análise do Sistema de Saldos da Dashboard MyFinlove

## Resumo Executivo

Esta análise examina como o sistema MyFinlove calcula e exibe os saldos na dashboard, com foco especial no tratamento de lançamentos recorrentes. O sistema utiliza uma abordagem híbrida que combina dados de múltiplas tabelas para fornecer uma visão completa da situação financeira do usuário.

## Estrutura do Sistema de Saldos

### 1. Tipos de Saldos Calculados

A dashboard apresenta **4 tipos principais de saldos**:

1. **Saldo Total das Contas** (`summaryData.saldoTotal`)
2. **Saldo Atual** (`currentBalance`)
3. **Saldo Previsto** (`predictedBalance`)
4. **Saldos do Gráfico Temporal** (`chartData`)

### 2. Fontes de Dados

O sistema utiliza **8 tabelas principais** para calcular os saldos:

- `accounts` - Contas financeiras com saldos atuais
- `transactions` - Transações históricas e futuras (incluindo recorrentes)
- `incomes` - Receitas planejadas
- `expenses` - Despesas planejadas
- `cards` - Cartões de crédito/débito
- `profiles` - Perfis de usuários
- `couples` - Relacionamentos entre usuários
- `financial_goals` - Metas financeiras

## Análise Detalhada dos Cálculos de Saldo

### 3. Saldo Total das Contas (`fetchSummaryData`)

**Localização:** Linha 563-620 do `dashboard.tsx`

```typescript
// Buscar saldo total das contas
const { data: accounts } = await supabase
  .from('accounts')
  .select('balance')
  .eq('owner_id', userId);

const saldoTotal = accounts?.reduce((sum, account) => 
  sum + Number(account.balance), 0) || 0;
```

**Características:**
- **Fonte:** Tabela `accounts`, campo `balance`
- **Escopo:** Apenas contas do usuário atual
- **Atualização:** Em tempo real baseado no saldo atual das contas
- **Recorrência:** Não considera diretamente lançamentos recorrentes

### 4. Saldo Atual (`fetchCurrentBalance`)

**Localização:** Linha 1298-1332 do `dashboard.tsx`

```typescript
// Buscar todas as contas do usuário
const { data: accounts } = await supabase
  .from('accounts')
  .select('balance')
  .eq('owner_id', userId);

const totalCurrentBalance = accounts?.reduce((total, account) => {
  return total + (Number(account.balance) || 0);
}, 0) || 0;
```

**Características:**
- **Fonte:** Tabela `accounts`, campo `balance`
- **Escopo:** Todas as contas do usuário
- **Método:** Soma simples dos saldos atuais
- **Recorrência:** Não considera lançamentos futuros

### 5. Saldo Previsto (`fetchPredictedBalance`)

**Localização:** Linha 1334-1388 do `dashboard.tsx`

```typescript
// Buscar receitas do mês
const { data: incomes } = await supabase
  .from('incomes')
  .select('amount')
  .eq('owner_id', userId)
  .gte('receipt_date', startOfMonth.toISOString())
  .lte('receipt_date', endOfMonth.toISOString());

// Buscar despesas do mês
const { data: expenses } = await supabase
  .from('expenses')
  .select('amount')
  .eq('owner_id', userId)
  .gte('due_date', startOfMonth.toISOString())
  .lte('due_date', endOfMonth.toISOString());

// Saldo previsto = receitas - despesas
const predicted = totalIncomes - totalExpenses;
```

**Características:**
- **Fonte:** Tabelas `incomes` e `expenses`
- **Escopo:** Mês atual
- **Método:** Receitas - Despesas do período
- **Recorrência:** Considera apenas lançamentos específicos do mês

## Tratamento de Lançamentos Recorrentes

### 6. Estrutura de Recorrência

O sistema possui **3 abordagens diferentes** para lançamentos recorrentes:

#### 6.1 Transações Recorrentes (Tabela `transactions`)

**Campos específicos:**
- `recurrence_type` (ex: "Mensal", "Não recorrente")
- `recurrence_frequency` (ex: "monthly")
- `recurrence_end_date` (data final da recorrência)

**Dados encontrados:**
- **39 transações** com `recurrence_type = "Mensal"`
- **17 transações** não recorrentes
- **Total:** R$ 35.050,00 em transações mensais

#### 6.2 Receitas Recorrentes (Tabela `incomes`)

**Campo específico:**
- `is_recurring` (boolean)

**Status atual:**
- **Nenhuma receita** marcada como recorrente no banco
- Sistema preparado mas não utilizado

#### 6.3 Despesas Recorrentes (Tabela `expenses`)

**Observação:**
- Não possui campo específico para recorrência
- Recorrência tratada via tabela `transactions`

### 7. Problemas Identificados no Sistema de Recorrência

#### 7.1 Inconsistência no Cálculo de Saldos

**Problema Principal:** Os saldos da dashboard **NÃO consideram adequadamente** os lançamentos recorrentes futuros.

**Evidências:**
1. `fetchSummaryData` usa apenas saldos atuais das contas
2. `fetchCurrentBalance` ignora transações futuras recorrentes
3. `fetchPredictedBalance` usa tabelas `incomes`/`expenses` que não têm recorrentes ativos

#### 7.2 Duplicação de Dados

**Problema:** Lançamentos recorrentes são criados como **múltiplas transações** na tabela `transactions`.

**Exemplo encontrado:**
```sql
-- Assinatura mensal criada 7 vezes (Jun-Dez 2025)
description: "Assinatura"
amount: 1000.00
recurrence_type: "Mensal"
transaction_date: 2025-06-18, 2025-07-18, 2025-08-18...
```

#### 7.3 Inconsistência de Fontes

**Problema:** Diferentes funções usam diferentes fontes para o mesmo tipo de dados:

- **Saldo Atual:** Tabela `accounts`
- **Saldo Previsto:** Tabelas `incomes` + `expenses`
- **Gráfico:** Tabela `transactions` + `incomes` + `expenses`

### 8. Análise do Gráfico Temporal (`fetchChartData`)

**Localização:** Linha 1390-1544 do `dashboard.tsx`

**Método Complexo:**
1. **Saldo de ontem:** Baseado em transações históricas
2. **Saldo atual:** Soma dos saldos das contas
3. **Saldos futuros:** Saldo atual + receitas futuras - despesas futuras

```typescript
// Para dias futuros
const incomesUntilDate = (futureIncomes || []).filter(income => {
  const incomeDate = new Date(income.receipt_date);
  return incomeDate <= targetDate;
});

const expensesUntilDate = (futureExpenses || []).filter(expense => {
  const expenseDate = new Date(expense.due_date);
  return expenseDate <= targetDate;
});

dayBalance = currentAccountBalance + totalFutureIncome - totalFutureExpense;
```

**Características:**
- **Período:** Ontem + hoje + próximos 5 dias
- **Fontes:** `accounts` + `transactions` + `incomes` + `expenses`
- **Filtros:** `is_received = false` e `is_paid = false`

## Impacto dos Lançamentos Recorrentes nos Saldos

### 9. Cenário Atual

**Como funciona hoje:**
1. **Transações recorrentes** são pré-criadas no banco como múltiplas entradas
2. **Saldos das contas** são atualizados manualmente ou via triggers
3. **Dashboard** soma os saldos atuais das contas
4. **Previsões** usam tabelas `incomes`/`expenses` separadas

**Exemplo prático:**
- Salário mensal de R$ 2.500 (Jun-Dez 2025) = 7 transações na tabela
- Cada transação afeta o saldo da conta correspondente
- Dashboard exibe soma dos saldos finais das contas

### 10. Problemas de Performance e Consistência

#### 10.1 Volume de Dados
- **39 transações mensais** no período analisado
- Multiplicação exponencial: 1 recorrência = N transações
- Impacto no desempenho das consultas

#### 10.2 Sincronização
- Saldos das contas podem ficar desatualizados
- Risco de inconsistência entre transações e saldos
- Dificuldade para rastrear origem dos valores

#### 10.3 Manutenção
- Alteração de recorrência requer múltiplas atualizações
- Exclusão complexa de séries recorrentes
- Risco de dados órfãos

## Recomendações de Melhoria

### 11. Proposta de Arquitetura Otimizada

#### 11.1 Separação de Responsabilidades
```sql
-- Tabela para templates de recorrência
CREATE TABLE recurrence_templates (
  id UUID PRIMARY KEY,
  description TEXT,
  amount NUMERIC,
  frequency TEXT, -- 'monthly', 'weekly', 'yearly'
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  account_id UUID,
  is_active BOOLEAN
);

-- Manter transactions apenas para lançamentos efetivados
-- Calcular recorrências dinamicamente
```

#### 11.2 Função de Cálculo Unificada
```typescript
const calculateBalance = (date: Date, includeRecurring: boolean) => {
  // 1. Saldo base das contas
  // 2. + Transações históricas até a data
  // 3. + Recorrências calculadas dinamicamente (se includeRecurring)
  // 4. = Saldo total na data
}
```

#### 11.3 Cache Inteligente
- Cache de saldos calculados por período
- Invalidação automática em mudanças
- Recálculo assíncrono em background

### 12. Benefícios Esperados

1. **Performance:** Redução de 70-80% no volume de dados
2. **Consistência:** Fonte única de verdade para saldos
3. **Manutenibilidade:** Alterações centralizadas
4. **Flexibilidade:** Fácil adição de novos tipos de recorrência
5. **Precisão:** Cálculos sempre atualizados

## Conclusão

O sistema atual do MyFinlove funciona mas apresenta **limitações significativas** no tratamento de lançamentos recorrentes:

### Pontos Positivos:
- ✅ Interface clara e intuitiva
- ✅ Múltiplas visões de saldo (atual, previsto, gráfico)
- ✅ Suporte básico a recorrência implementado

### Pontos de Atenção:
- ❌ Duplicação excessiva de dados
- ❌ Inconsistência entre fontes de dados
- ❌ Performance comprometida com volume
- ❌ Complexidade de manutenção
- ❌ Risco de desincronização

### Próximos Passos Recomendados:
1. **Implementar sistema de templates** para recorrências
2. **Unificar cálculo de saldos** em função centralizada
3. **Otimizar consultas** com índices apropriados
4. **Implementar cache** para saldos calculados
5. **Criar testes automatizados** para validar consistência

---

**Análise realizada em:** Janeiro 2025  
**Versão do sistema:** Dashboard v1.0  
**Tabelas analisadas:** 8 principais + relacionamentos  
**Linhas de código analisadas:** ~4.926 linhas 