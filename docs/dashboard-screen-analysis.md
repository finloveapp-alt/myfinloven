# Documentação da Tela Dashboard - MyFinlove

## Visão Geral

A tela **Dashboard** é a tela principal do aplicativo MyFinlove, servindo como centro de controle financeiro para usuários individuais ou casais. Ela oferece uma visão consolidada das finanças pessoais com funcionalidades interativas e navegação intuitiva.

## Localização
- **Arquivo**: `app/(app)/dashboard.tsx`
- **Rota**: `/dashboard`
- **Tipo**: Tela principal protegida (requer autenticação)

## Arquitetura e Dependências

### Imports Principais
```typescript
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import themes from '@/constants/themes';
import { fontFallbacks } from '@/utils/styles';
import { getBudgetValueById, FeasibilityResults } from '@/utils/budgetCalculator';
```

### Interfaces TypeScript
```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender: string;
  avatar_url?: string;
  profile_picture_url?: string;
  account_type?: string;
  is_avatar?: boolean;
}
```

## Sistema de Temas

### Temas Disponíveis
- **Feminino**: Cores rosa/roxo (`themes.feminine`)
- **Masculino**: Cores azul (`themes.masculine`)

### Lógica de Aplicação de Tema
1. **Verificação do gênero no perfil do usuário**
2. **Fallback para metadados da sessão**
3. **Persistência no AsyncStorage**
4. **Variável global para sincronização entre telas**

```typescript
const updateTheme = (newTheme: 'feminine' | 'masculine') => {
  if (newTheme === 'masculine') {
    setTheme(themes.masculine);
    global.dashboardTheme = 'masculine';
    saveThemeToStorage('masculine');
  } else {
    setTheme(themes.feminine);
    global.dashboardTheme = 'feminine';
    saveThemeToStorage('feminine');
  }
};
```

## Componentes da Interface

### 1. Header com Gradiente
- **Componente**: `LinearGradient`
- **Funcionalidades**:
  - Saudação personalizada baseada no horário
  - Navegação de mês (anterior/próximo)
  - Indicadores de saldo (Gastos, Saldo, Previsto)
  - Timeline de datas do mês atual
  - Avatares dos usuários (principal + parceiros/avatars)

### 2. Cards Financeiros (Scroll Horizontal)
- **Receitas**: Navegação para `/historico-receitas`
- **Despesas**: Navegação para `/historico-despesas`
- **Débitos**: Navegação para `/historico-debitos`
- **Créditos**: Navegação para `/historico-creditos`

### 3. Seção de Transações
- **Carrossel de transações** com navegação por setas
- **Paginação visual** com dots indicadores
- **Dados mockados** com ícones e categorias

### 4. Resumo do Mês
- **Saldo total atual**
- **Receitas totais** (clicável → `/historico-receitas`)
- **Despesas totais** (clicável → `/historico-despesas`)

### 5. Contas a Pagar & Cartões
- **Lista de faturas** com vencimentos
- **Ícones categorizados** por tipo de conta
- **Navegação** para `/expenses`

### 6. Contas a Receber
- **Receitas previstas** e confirmadas
- **Status visual** por tipo de recebimento
- **Navegação** para `/income`

### 7. Metas Financeiras
- **Barras de progresso** visuais
- **Percentuais de conclusão**
- **Valores atuais vs. objetivos**

### 8. Calendário Financeiro (Preview)
- **Visualização semanal** simplificada
- **Eventos categorizados** por cores
- **Legenda explicativa**

## Sistema de Usuários e Parceiros

### Tipos de Conta
- **Individual**: Usuário único
- **Casal**: Usuário principal + parceiro real
- **Avatar**: Usuário principal + avatar fictício

### Funcionalidades de Convite
```typescript
const handleSendInvitation = async () => {
  // Lógica para enviar convites por email
  // Suporte para parceiros reais ou avatars
};
```

### Gerenciamento de Fotos de Perfil
- **Upload via câmera** (mobile)
- **Upload via galeria** (mobile)
- **Upload via input file** (web)
- **Armazenamento no Supabase Storage**

## Modais Implementados

### 1. Modal de Menu Principal
- **Grid 3x3** de opções de navegação
- **Ícones temáticos** baseados no tema atual
- **Navegação** para todas as telas do app

### 2. Modal de Foto de Perfil
- **Preview da foto atual**
- **Opções de upload** (câmera/galeria)
- **Indicador de loading** durante upload
- **Suporte multiplataforma** (web/mobile)

### 3. Modal de Seleção de Tipo
- **Escolha entre parceiro real ou avatar**
- **Interface visual** com ícones explicativos

### 4. Modal de Convite
- **Formulário de convite** com email e nome
- **Upload de foto** para avatars
- **Validação de dados** antes do envio

### 5. Modal de Sucesso do Convite
- **Confirmação visual** do convite enviado
- **Informações do convidado**

## Navegação Bottom Tab

### Itens da Navegação
1. **Dashboard** (ativo) - `BarChart` icon
2. **Menu** - `Menu` icon → Abre modal de menu
3. **Adicionar** (botão central) - `PlusCircle` → `/registers`
4. **Notificações** - `Receipt` → `/notifications`
5. **Cartões** - `CreditCard` → `/planning`

## Estados Gerenciados

### Estados Principais
```typescript
const [theme, setTheme] = useState(getInitialTheme());
const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0);
const [menuModalVisible, setMenuModalVisible] = useState(false);
const [currentMonth, setCurrentMonth] = useState(new Date());
const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
const [partnerUsers, setPartnerUsers] = useState<UserProfile[]>([]);
```

### Estados de Modais
```typescript
const [profilePictureModalVisible, setProfilePictureModalVisible] = useState(false);
const [inviteModalVisible, setInviteModalVisible] = useState(false);
const [typeSelectionModalVisible, setTypeSelectionModalVisible] = useState(false);
const [inviteSuccessModalVisible, setInviteSuccessModalVisible] = useState(false);
```

## Integração com Supabase

### Tabelas Utilizadas
- **`profiles`**: Dados dos usuários
- **`user_uploads`**: Storage de imagens
- **Autenticação**: Sessões e metadados

### Operações Principais
- **Busca de perfil do usuário**
- **Busca de parceiros/avatars**
- **Upload de imagens**
- **Envio de convites**
- **Atualização de perfil**

## Funcionalidades Especiais

### 1. Sistema de Timeline
```typescript
const generateTimelineDates = (date: Date) => {
  // Gera 7 datas a partir do primeiro dia do mês
  // Para visualização na linha do tempo
};
```

### 2. Navegação de Transações
```typescript
const goToPreviousTransaction = () => {
  setCurrentTransactionIndex(prev => 
    prev === 0 ? transactions.length - 1 : prev - 1
  );
};
```

### 3. Detecção de Plataforma
- **Funcionalidades específicas** para web vs. mobile
- **Componentes condicionais** baseados na plataforma
- **Upload de imagens adaptativo**

## Dados Mockados

### Transações de Exemplo
```typescript
const transactions = [
  {
    icon: '🥕',
    backgroundColor: '#FFEEE2',
    title: 'Mercado',
    subtitle: `Mercado por ${secondaryPerson}`,
    amount: 'R$ 50',
    paymentMethod: 'Dinheiro'
  },
  // ... mais transações
];
```

## Responsividade e UX

### Características de Design
- **Cards com efeito de pressão** (`Pressable` components)
- **Scroll horizontal** para cards financeiros
- **Animações suaves** para transições
- **Feedback visual** em todas as interações
- **Cores temáticas** consistentes

### Acessibilidade
- **Labels descritivos** para avatars
- **Feedback tátil** em botões
- **Contraste adequado** nas cores
- **Navegação por teclado** (web)

## Pontos de Melhoria Identificados

### 1. Dados Estáticos
- Valores financeiros são mockados
- Transações não vêm do banco de dados
- Metas financeiras são estáticas

### 2. Integração Incompleta
- Falta conexão com dados reais do Supabase
- Cálculos financeiros não são dinâmicos
- Calendário financeiro é apenas visual

### 3. Funcionalidades Pendentes
- Sistema de notificações real
- Sincronização entre parceiros
- Backup e restauração de dados

## Conclusão

A tela Dashboard representa o coração do aplicativo MyFinlove, oferecendo uma interface rica e interativa para gerenciamento financeiro. Embora contenha dados mockados, a estrutura está preparada para integração completa com dados reais, proporcionando uma base sólida para expansão futura das funcionalidades.

A implementação demonstra boas práticas de React Native, gerenciamento de estado eficiente, e uma arquitetura escalável que suporta tanto usuários individuais quanto casais, com sistema de temas dinâmico e experiência de usuário personalizada. 