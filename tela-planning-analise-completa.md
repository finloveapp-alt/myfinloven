# Análise Completa - Tela /planning

## Visão Geral
A tela `/planning` é uma das principais funcionalidades do aplicativo MyFinlove, focada em **planejamento financeiro colaborativo** para casais. Oferece duas funcionalidades principais: **Orçamentos** e **Metas Financeiras**, com interface rica em dados visuais e interações.

---

## Arquitetura e Estrutura

### Imports e Dependências
```typescript
// React e React Native Core
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Platform, TextInput, Modal, Alert, SafeAreaView, KeyboardAvoidingView, AppState } from 'react-native';

// Ícones e UI
import { ArrowLeft, MoreVertical, Plus, BarChart2, Target, Repeat, DollarSign, User, Clock, X, Edit2, AlertCircle, BarChart, Menu, Receipt, CreditCard, PlusCircle, Home, Bell, Wallet, Info, ExternalLink } from 'lucide-react-native';

// Expo e Navegação
import { StatusBar } from 'expo-status-bar';
import { router, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

// Utilitários e Componentes
import { fontFallbacks } from '@/utils/styles';
import Svg, { Line, Circle, Path, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import themes from '@/constants/themes';
import MenuModal from '@/components/MenuModal';
```

### Responsividade
- **Dimensões dinâmicas**: `const { width, height } = Dimensions.get('window')`
- **Breakpoints**: Adaptação para telas < 360px
- **Fontes responsivas**: Tamanhos ajustados por largura da tela
- **Padding adaptativo**: Espaçamentos menores em telas pequenas

---

## Sistema de Temas

### Implementação Dinâmica
```typescript
// Tema global persistente
declare global {
  var dashboardTheme: 'feminine' | 'masculine' | undefined;
}

// Função de inicialização
const getInitialTheme = () => {
  if (global.dashboardTheme === 'masculine') {
    return themes.masculine;
  }
  return themes.feminine; // Tema padrão
};
```

### Características
- **Persistência**: AsyncStorage + variável global
- **Sincronização**: AppState listener para mudanças
- **Cores adaptáveis**: Primária, secundária, positiva, compartilhada
- **Aplicação**: Botões, ícones, barras de progresso, fundos

---

## Estrutura de Dados

### Orçamentos (Budgets)
```typescript
interface Budget {
  id: string;
  category: string;        // Nome da categoria
  allocated: number;       // Valor alocado
  spent: number;          // Valor gasto
  percentage: number;     // Percentual gasto
  icon: string;           // Emoji da categoria
  color: string;          // Cor da categoria
  warning: boolean;       // Alerta de orçamento quase esgotado
  users: Array<{          // Gastos por usuário
    name: string;
    spent: number;
    percentage: number;
  }>;
  transactions: Array<{   // Histórico de transações
    description: string;
    date: string;
    amount: number;
    user: string;
  }>;
}
```

### Metas Financeiras (Goals)
```typescript
interface Goal {
  id: string;
  title: string;          // Título da meta
  target: number;         // Valor alvo
  current: number;        // Valor atual
  percentage: number;     // Percentual de progresso
  deadline: string;       // Prazo
  color: string;          // Cor da meta
  icon: string;           // Emoji da meta
  deposits: Array<{       // Histórico de depósitos
    date: string;
    amount: number;
    user: string;
  }>;
  teamContributions: Array<{  // Contribuições por usuário
    name: string;
    amount: number;
    percentage: number;
  }>;
}
```

---

## Interface e Layout

### Header
- **Navegação**: Botão voltar para dashboard
- **Título**: "Renda e Despesas"
- **Ações**: Botão de mais opções
- **Sombra**: Elevação sutil para separação

### Sistema de Abas
- **Duas abas**: "Orçamentos" e "Metas Financeiras"
- **Indicador visual**: Borda inferior colorida na aba ativa
- **Transição**: Mudança de conteúdo baseada em `activeTab`

### Container de Saldo
- **Centralizado**: Data, valor e label
- **Destaque**: Valor em fonte grande e bold
- **Contexto**: "12 de Agosto, 2022" e "R$ 5.543,43"

---

## Aba Orçamentos

### Gráfico Donut
- **Visual**: Círculo com bordas coloridas simulando gráfico
- **Responsivo**: Tamanho adaptado à largura da tela
- **Cores**: Diferentes para cada categoria
- **Centro**: Espaço para valor total ou informações

### Legenda
- **Três categorias**: Receita (verde), Despesa (vermelho), Transferência (roxo)
- **Percentuais**: Valores mockados (45%, 35%, 20%)
- **Layout**: Lado direito do gráfico

### Histórico de Transações
- **Três tipos**: Receita, Despesa, Transferência
- **Informações**: Título, horário, usuário, valor
- **Ícones**: Específicos por tipo com cores temáticas
- **Valores**: Formatação com + ou - e cores

### Cards de Orçamento
```typescript
// Estrutura expandível
- Header (sempre visível):
  - Ícone da categoria
  - Nome da categoria
  - Badge de alerta (se warning: true)
  - Barra de progresso
  - Valor gasto / Valor total
  - Percentual

- Conteúdo expandido (ao tocar):
  - Seção "Quem gastou":
    - Lista de usuários com ícones
    - Valores e percentuais individuais
  - Seção "Últimas transações":
    - Histórico das 3 últimas
    - Descrição, data, usuário, valor
  - Ações:
    - Botão "Editar Orçamento"
```

### Sistema de Alertas
- **Warning badge**: Ícone vermelho quando orçamento > 90%
- **Cor da barra**: Muda para vermelho quando crítico
- **Texto de alerta**: Cor vermelha para percentuais altos

---

## Aba Metas Financeiras

### Gráfico de Progresso
- **Container**: Similar ao gráfico de orçamentos
- **Centro**: Valor total poupado
- **Métricas**: Total de metas, valor restante, próximo prazo

### Cards de Metas
```typescript
// Estrutura expandível
- Header (sempre visível):
  - Ícone da meta
  - Título e prazo
  - Barra de progresso
  - Valor atual / Valor alvo
  - Percentual

- Conteúdo expandido (ao tocar):
  - Seção "Histórico de Depósitos":
    - Lista cronológica
    - Usuário, data, valor
  - Seção "Progresso da Equipe":
    - Contribuições por usuário
    - Barras de progresso individuais
    - Percentuais de participação
  - Ações:
    - Botão "Adicionar Depósito"
    - Botão "Editar Meta"
```

### Métricas Resumo
- **Total Metas**: Quantidade de metas ativas
- **Valor Restante**: Soma do que falta para todas as metas
- **Próximo Prazo**: Meta com deadline mais próximo

---

## Sistema de Modais

### 6 Modais Diferentes
1. **Nova Categoria de Orçamento**: Nome + valor
2. **Editar Orçamento**: Edição de categoria existente
3. **Nova Meta Financeira**: Título + valor + prazo
4. **Editar Meta**: Edição de meta existente
5. **Adicionar Depósito**: Seletor de usuário + valor
6. **MenuModal**: Componente externo reutilizável

### Padrão Visual
- **Container**: Fundo semi-transparente
- **Conteúdo**: Card branco centralizado
- **Header**: Título + botão X
- **Campos**: Labels + inputs padronizados
- **Botão**: Cor do tema ativo

---

## Navegação Inferior

### 5 Itens de Navegação
1. **Dashboard**: Ícone de gráfico
2. **Menu**: Ícone de hambúrguer (abre MenuModal)
3. **Botão Central**: Ação contextual (+ orçamento ou + meta)
4. **Notificações**: Ícone de sino
5. **Cartões**: Ícone de cartão

### Botão Flutuante Inteligente
```typescript
// Comportamento dinâmico
onPress={() => {
  if (activeTab === 'budget') {
    openNewBudgetModal();
  } else {
    openNewGoalModal();
  }
}}
```

### Características
- **Posição**: Absoluta na parte inferior
- **Sombra**: Elevação para destaque
- **Bordas**: Arredondadas no topo
- **Responsivo**: Adaptado para diferentes plataformas

---

## Funcionalidades Interativas

### Expansão de Cards
- **Estado**: `expandedBudget` e `expandedGoal`
- **Animação**: Suave revelação de conteúdo
- **Conteúdo**: Detalhes, histórico, ações

### Gerenciamento de Estado
```typescript
// Estados principais
const [activeTab, setActiveTab] = useState('budget');
const [expandedBudget, setExpandedBudget] = useState<string | null>(null);
const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
const [budgetData, setBudgetData] = useState(budgets);
const [goalsData, setGoalsData] = useState(goals);

// Estados de modais (6 diferentes)
const [showNewBudgetModal, setShowNewBudgetModal] = useState(false);
const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
const [showNewGoalModal, setShowNewGoalModal] = useState(false);
const [showEditGoalModal, setShowEditGoalModal] = useState(false);
const [showAddDepositModal, setShowAddDepositModal] = useState(false);
const [menuModalVisible, setMenuModalVisible] = useState(false);
```

### Operações CRUD
- **Criar**: Novos orçamentos e metas
- **Ler**: Exibição de dados e detalhes
- **Atualizar**: Edição de valores e informações
- **Deletar**: Não implementado (oportunidade de melhoria)

---

## Características Técnicas

### Performance
- **ScrollView**: Otimizado com `keyboardShouldPersistTaps`
- **Ref**: `scrollViewRef` para controle programático
- **Lazy loading**: Conteúdo expandido renderizado condicionalmente

### Acessibilidade
- **TouchableOpacity**: Áreas de toque adequadas
- **Contraste**: Cores com boa legibilidade
- **Feedback**: Visual claro para interações

### Responsividade
```typescript
// Adaptações por tamanho de tela
fontSize: width < 360 ? 24 : 28,
padding: width < 360 ? 15 : 20,
width: width < 360 ? 140 : 160,
flexWrap: width < 360 ? 'wrap' : 'nowrap'
```

### Plataforma
- **iOS**: Sombras nativas, KeyboardAvoidingView
- **Android**: Elevation, comportamentos específicos
- **Web**: Fallbacks para sombras

---

## Dados Mockados

### Orçamentos de Exemplo
1. **Compras de Supermercado**: R$ 500 (83.9% gasto) - ⚠️ Warning
2. **Despesas do Carro**: R$ 350 (77.9% gasto)
3. **Compras Online**: R$ 300 (64.3% gasto)
4. **Despesas de Saúde**: R$ 200 (70.0% gasto)

### Metas de Exemplo
1. **Viagem para Europa**: R$ 10.000 (55.4% completo)
2. **Entrada Apartamento**: R$ 25.000 (35.0% completo)
3. **Fundo de Emergência**: R$ 15.000 (80.0% completo)

### Usuários
- **Maria** e **João**: Dados distribuídos entre os dois
- **Cores diferenciadas**: Baseadas no tema ativo
- **Contribuições**: Percentuais calculados automaticamente

---

## Integração com Backend

### Supabase
- **Import**: `import { supabase } from '@/lib/supabase'`
- **Preparação**: Estrutura pronta para integração
- **AsyncStorage**: Persistência local de configurações

### Oportunidades
1. **Tabelas**: `budgets`, `goals`, `transactions`, `deposits`
2. **Sincronização**: Dados em tempo real entre usuários
3. **Autenticação**: Dados por usuário/casal
4. **Backup**: Persistência segura na nuvem

---

## Pontos Fortes

### Design
- **Visual atrativo**: Cores, ícones, gráficos
- **Consistência**: Padrões visuais uniformes
- **Responsividade**: Adaptação a diferentes telas
- **Tema dinâmico**: Personalização por gênero

### Funcionalidade
- **Abrangente**: Orçamentos e metas em uma tela
- **Colaborativo**: Dados compartilhados entre usuários
- **Detalhado**: Informações granulares e histórico
- **Interativo**: Expansão, edição, criação

### Arquitetura
- **Modular**: Componentes bem organizados
- **Escalável**: Estrutura preparada para crescimento
- **Performática**: Otimizações de renderização
- **Manutenível**: Código limpo e documentado

---

## Oportunidades de Melhoria

### Funcionalidades Ausentes
1. **Exclusão**: Não há opção para deletar orçamentos/metas
2. **Filtros**: Sem filtros por período ou categoria
3. **Busca**: Não há sistema de busca
4. **Notificações**: Alertas de prazo ou orçamento esgotado
5. **Relatórios**: Análises mais profundas
6. **Exportação**: PDF ou Excel dos dados

### UX/UI
1. **Loading states**: Durante operações assíncronas
2. **Animações**: Transições mais suaves
3. **Gestos**: Swipe para ações rápidas
4. **Confirmações**: Para ações destrutivas
5. **Tooltips**: Ajuda contextual
6. **Modo escuro**: Tema adicional

### Técnicas
1. **Validações**: Campos obrigatórios e formatos
2. **Formatação**: Máscaras para valores monetários
3. **Offline**: Funcionamento sem internet
4. **Sincronização**: Conflitos de dados
5. **Performance**: Virtualização para listas grandes
6. **Testes**: Cobertura de testes unitários

### Dados
1. **Gráficos reais**: Biblioteca de charts
2. **Cálculos dinâmicos**: Percentuais automáticos
3. **Histórico completo**: Paginação de transações
4. **Categorias customizáveis**: Criação pelo usuário
5. **Metas recorrentes**: Objetivos mensais/anuais

---

## Conclusão

A tela `/planning` representa uma **implementação robusta e bem estruturada** de um sistema de planejamento financeiro colaborativo. Com **2.412 linhas de código**, oferece funcionalidades abrangentes organizadas em uma interface intuitiva e visualmente atrativa.

### Destaques Principais:
- **Arquitetura sólida**: Estados bem gerenciados, componentes modulares
- **Design responsivo**: Adaptação a diferentes dispositivos
- **Funcionalidades completas**: Orçamentos e metas com detalhamento
- **Preparação para escala**: Estrutura pronta para backend real
- **Experiência colaborativa**: Dados compartilhados entre usuários

### Próximos Passos:
1. **Integração Supabase**: Persistência real dos dados
2. **Melhorias UX**: Loading states, animações, confirmações
3. **Funcionalidades avançadas**: Relatórios, notificações, filtros
4. **Otimizações**: Performance e acessibilidade

A tela está **pronta para produção** com dados mockados e **preparada para evolução** com backend real, representando uma base sólida para um aplicativo financeiro colaborativo completo. 