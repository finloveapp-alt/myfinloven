# Documentação dos Modais - Tela /planning

## Visão Geral
A tela `/planning` do aplicativo MyFinlove possui **6 modais diferentes** organizados em duas categorias principais: **Orçamentos** e **Metas Financeiras**. Todos os modais seguem um padrão visual consistente e oferecem funcionalidades específicas para gerenciamento financeiro colaborativo.

## Estrutura Geral dos Modais

### Padrão Visual Comum
- **Container**: `modalContainer` com fundo semi-transparente
- **Conteúdo**: `modalContent` com fundo branco e bordas arredondadas
- **Header**: `modalHeader` com título e botão X para fechar
- **Campos**: `inputGroup` com labels e inputs padronizados
- **Botão**: `submitButton` com cor do tema ativo
- **Animação**: `slide` para entrada/saída

---

## 1. Modal "Nova Categoria de Orçamento"

### Funcionalidade
Permite criar novas categorias de orçamento com valor alocado.

### Campos
1. **Nome da Categoria** (TextInput)
   - Placeholder: "Ex: Alimentação, Transporte..."
   - Validação: Campo obrigatório

2. **Valor do Orçamento** (TextInput)
   - Placeholder: "500,00"
   - Tipo: `decimal-pad`
   - Formato: Valor em reais

### Estados Relacionados
- `showNewBudgetModal`: Controla visibilidade
- `newCategory`: Armazena nome da categoria
- `newAllocated`: Armazena valor alocado

### Ação Principal
- **Botão**: "Adicionar Orçamento"
- **Função**: `handleAddBudget()`
- **Comportamento**: Cria novo orçamento e fecha modal

---

## 2. Modal "Editar Orçamento"

### Funcionalidade
Permite editar categorias de orçamento existentes.

### Campos
1. **Nome da Categoria** (TextInput)
   - Valor pré-preenchido do orçamento selecionado
   - Editável

2. **Valor do Orçamento** (TextInput)
   - Valor pré-preenchido
   - Tipo: `decimal-pad`
   - **Cálculo automático**: Atualiza percentual gasto automaticamente

### Estados Relacionados
- `showEditBudgetModal`: Controla visibilidade
- `currentBudget`: Objeto com dados do orçamento sendo editado

### Lógica Especial
```javascript
// Recalcula percentual automaticamente
percentage: currentBudget.spent / (parseFloat(text) || 1) * 100
```

### Ação Principal
- **Botão**: "Salvar Alterações"
- **Função**: `handleEditBudget()`
- **Comportamento**: Atualiza orçamento e fecha modal

---

## 3. Modal "Nova Meta Financeira"

### Funcionalidade
Permite criar novas metas financeiras com prazo definido.

### Campos
1. **Título da Meta** (TextInput)
   - Placeholder: "Ex: Viagem, Carro novo..."
   - Validação: Campo obrigatório

2. **Valor da Meta** (TextInput)
   - Placeholder: "10000,00"
   - Tipo: `decimal-pad`
   - Formato: Valor em reais

3. **Prazo** (TextInput)
   - Placeholder: "Ex: Dez 2023"
   - Formato: Texto livre

### Estados Relacionados
- `showNewGoalModal`: Controla visibilidade
- `newGoalTitle`: Armazena título da meta
- `newGoalAmount`: Armazena valor da meta
- `newGoalDeadline`: Armazena prazo

### Ação Principal
- **Botão**: "Criar Meta"
- **Função**: `handleAddGoal()`
- **Comportamento**: Cria nova meta e fecha modal

---

## 4. Modal "Editar Meta"

### Funcionalidade
Permite editar metas financeiras existentes.

### Campos
1. **Título da Meta** (TextInput)
   - Valor pré-preenchido da meta selecionada
   - Editável

2. **Valor da Meta** (TextInput)
   - Valor pré-preenchido
   - Tipo: `decimal-pad`
   - **Cálculo automático**: Atualiza percentual de progresso

3. **Prazo** (TextInput)
   - Valor pré-preenchido
   - Editável

### Estados Relacionados
- `showEditGoalModal`: Controla visibilidade
- `currentGoal`: Objeto com dados da meta sendo editada

### Lógica Especial
```javascript
// Recalcula percentual automaticamente
percentage: (currentGoal.current / (parseFloat(text) || 1)) * 100
```

### Ação Principal
- **Botão**: "Salvar Alterações"
- **Função**: Inline (atualiza estado diretamente)
- **Comportamento**: Atualiza meta e fecha modal

---

## 5. Modal "Adicionar Depósito" ⭐

### Funcionalidade
Modal mais complexo que permite adicionar depósitos às metas financeiras com seleção de usuário.

### Seções

#### A. Resumo da Meta
- **Container**: `goalSummary`
- **Título**: Nome da meta selecionada
- **Progresso**: "R$ atual / R$ total" formatado

#### B. Seletor de Usuário
- **Container**: `userSelectorContainer`
- **Opções**: Botões para "Maria" e "João"
- **Visual**: Botões com ícone de usuário
- **Estado ativo**: Fundo colorido e texto branco
- **Estado inativo**: Fundo transparente e texto cinza

#### C. Campo de Valor
- **Label**: "Valor do Depósito (R$)"
- **Input**: Tipo `decimal-pad`
- **Placeholder**: "500,00"

### Estados Relacionados
- `showAddDepositModal`: Controla visibilidade
- `currentGoal`: Meta selecionada para depósito
- `selectedUser`: Usuário que está fazendo o depósito ('Maria' ou 'João')
- `newDepositAmount`: Valor do depósito

### Lógica Complexa
1. **Validação**: Verifica se meta e valor existem
2. **Cálculo**: Atualiza valor atual da meta
3. **Histórico**: Adiciona transação ao histórico
4. **Contribuições**: Atualiza contribuições por usuário
5. **Percentuais**: Recalcula percentuais de progresso

### Ação Principal
- **Botão**: "Adicionar Depósito"
- **Função**: `handleAddDeposit()`
- **Comportamento**: Complexo com múltiplas atualizações

---

## 6. MenuModal (Componente Externo)

### Funcionalidade
Modal de menu principal importado de `@/components/MenuModal`.

### Características
- **Componente**: Reutilizável entre telas
- **Props**: `visible`, `onClose`, `theme`
- **Integração**: Acionado pelo botão de menu na navegação

### Estados Relacionados
- `menuModalVisible`: Controla visibilidade

---

## Sistema de Navegação e Integração

### Botão Flutuante Inteligente
O botão "+" na navegação inferior tem comportamento dinâmico:
```javascript
onPress={() => {
  if (activeTab === 'budget') {
    openNewBudgetModal();
  } else {
    openNewGoalModal();
  }
}}
```

### Abas Ativas
- **budget**: Foco em orçamentos
- **goals**: Foco em metas financeiras

---

## Características Técnicas

### Gerenciamento de Estado
- **6 estados boolean** para controle de visibilidade
- **Estados de dados** para formulários
- **Estados de contexto** para edição

### Validações
- Campos obrigatórios verificados antes de submissão
- Conversões numéricas com fallback para 0
- Alertas de erro para campos vazios

### Formatação de Dados
- **Valores monetários**: Formato brasileiro (R$ X.XXX,XX)
- **Percentuais**: Calculados automaticamente
- **Datas**: Formato livre para prazos

### Tema Dinâmico
- **Cores adaptáveis**: Baseado no tema feminino/masculino
- **Botões**: Cor primária do tema ativo
- **Consistência**: Visual uniforme entre modais

---

## Fluxo de Dados

### Orçamentos
1. **Criação**: Modal → Estado local → Lista atualizada
2. **Edição**: Seleção → Modal pré-preenchido → Atualização
3. **Cálculos**: Percentual gasto recalculado automaticamente

### Metas Financeiras
1. **Criação**: Modal → Estado local → Lista atualizada
2. **Edição**: Seleção → Modal pré-preenchido → Atualização
3. **Depósitos**: Modal complexo → Múltiplas atualizações → Histórico

### Persistência
- **Dados mockados**: Atualmente usando arrays locais
- **Preparado para**: Integração com Supabase
- **Estados**: Mantidos durante sessão da tela

---

## Pontos de Melhoria Identificados

### Funcionalidades Ausentes
1. **Validação de datas**: Prazos em formato livre
2. **Categorias de ícones**: Ícones fixos nos dados mockados
3. **Exclusão**: Não há modais para deletar itens
4. **Notificações**: Sem alertas de prazo próximo

### Oportunidades de UX
1. **Calendário**: Para seleção de prazos
2. **Formatação automática**: Para campos monetários
3. **Confirmação**: Para ações destrutivas
4. **Loading states**: Durante operações

### Integração com Backend
1. **Supabase**: Preparar tabelas para orçamentos e metas
2. **Sincronização**: Entre usuários do casal
3. **Histórico**: Persistir transações e depósitos
4. **Backup**: Dados importantes protegidos

---

## Conclusão

A tela `/planning` apresenta um sistema robusto de modais com **6 interfaces distintas** que cobrem todas as operações necessárias para gerenciamento de orçamentos e metas financeiras colaborativas. O design é consistente, a funcionalidade é abrangente, e a arquitetura está preparada para evolução com backend real. 