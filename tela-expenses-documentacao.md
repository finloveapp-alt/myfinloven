# Documentação da Tela `/expenses` - MyFinlove

## Visão Geral
A tela `/expenses` é responsável pelo gerenciamento completo de despesas no aplicativo MyFinlove. Localizada em `app/(app)/expenses.tsx`, oferece funcionalidades para visualizar, adicionar, editar e gerenciar pagamentos de despesas.

## Estrutura Principal

### Interface TypeScript
```typescript
interface Expense {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  category: string;
  account: string;
  isPaid: boolean;
  createdAt: Date;
}
```

### Estados Principais
- **expenses**: Array de despesas carregadas
- **loading**: Estado de carregamento
- **userBalance**: Saldo disponível do usuário
- **currentMonth/currentYear**: Controle do mês/ano visualizado
- **theme**: Tema dinâmico (masculino/feminino)

## Header e Navegação

### Cabeçalho
- **Botão Voltar**: Navega para o dashboard
- **Título**: "Despesas"
- **Ações**: Filtro e busca (ícones visuais)

### Resumo Financeiro
- **Saldo Disponível**: Exibe o saldo atual do usuário
- **Total a Pagar**: Soma de todas as despesas não pagas
- **Seletor de Mês**: Navegação entre meses com setas

## Lista de Despesas

### Ordenação
As despesas são ordenadas por data de vencimento (mais próximas primeiro):
```typescript
const sortedExpenses = [...expenses].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
```

### Indicadores de Status
- **🔴 Atrasada**: Despesas vencidas não pagas (`OVERDUE_COLOR: '#FF3B30'`)
- **🟢 Paga**: Despesas já efetivadas
- **🟣 A vencer**: Despesas pendentes dentro do prazo

### Card de Despesa
Cada despesa exibe:
- **Título** e **Valor** (R$)
- **Categoria** (tag colorida)
- **Conta** associada
- **Data de vencimento** com ícone de calendário
- **Status visual** (pago/atrasado/a vencer)
- **Botão "Confirmar Pagamento"** (apenas para não pagas)
- **Menu de opções** (três pontos)

## Modais e Funcionalidades

### 1. Modal "Efetivar Despesa"
**Trigger**: Botão "Confirmar Pagamento"

**Campos**:
- **Despesa**: Nome da despesa (readonly)
- **Valor**: Valor original (readonly, vermelho se atrasada)
- **Encargos**: Campo editável para taxas adicionais
- **Data pagamento**: "Hoje" (readonly)
- **Conta**: Seletor de conta com círculo colorido

**Ações**:
- **Cancelar**: Fecha o modal
- **Efetivar**: Confirma o pagamento e atualiza saldo

### 2. Modal "Nova Despesa"
**Trigger**: Botão de adicionar (via navegação)

**Campos**:
- **Título**: Texto livre (ex: "Aluguel, Internet, Academia...")
- **Valor (R$)**: Input numérico
- **Categoria**: Seletor com opções predefinidas
- **Conta**: Seletor de contas disponíveis
- **Data de vencimento**: DatePicker

**Categorias Disponíveis**:
`['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Vestuário', 'Outros']`

**Contas Disponíveis**:
`['Nubank', 'Itaú', 'Bradesco', 'Santander', 'Caixa', 'Banco do Brasil', 'Inter', 'Outro']`

### 3. Menu de Opções da Despesa
**Trigger**: Ícone de três pontos em cada despesa

**Opções**:
- **Editar**: Abre modal de edição
- **Excluir**: Abre submenu de exclusão
- **Alterar valor**: Modal para mudança de valor
- **Duplicar**: Cria cópia da despesa
- **Despesa cartão**: Configura como despesa de cartão
- **Pagamento parcial**: Permite pagamento parcial
- **Efetivar pagamento**: Marca como paga (apenas não pagas)

### 4. Modal "Editar Despesa"
**Campos Editáveis**:
- **Título**: Texto da despesa
- **Categoria**: Seletor com modal de opções
- **Conta**: Seletor com modal de opções
- **Data de vencimento**: DatePicker (iOS/Android)

**Funcionalidades**:
- Modais separados para seleção de categoria e conta
- DatePicker adaptativo por plataforma
- Validação de campos obrigatórios

### 5. Submenu de Exclusão
**Opções**:
- **Excluir apenas este mês**: Remove instância atual
- **Excluir a partir deste mês**: Remove desta data em diante
- **Excluir definitivamente**: Remove completamente

### 6. Modal "Alterar Valor"
**Funcionalidade**:
- Campo para novo valor em R$
- Atualiza o valor da despesa selecionada
- Validação numérica

### 7. Modal "Despesa de Cartão"
**Campos**:
- **Switch**: "É despesa de cartão?"
- **Cartão**: Seletor de cartão (se ativado)
- **Número de parcelas**: Input numérico (se ativado)

### 8. Modal "Pagamento Parcial"
**Funcionalidades**:
- **Valor total**: Exibe valor original (readonly)
- **Valor a pagar agora**: Input editável
- **Valor restante**: Calculado automaticamente
- Cria nova despesa com valor restante

## Gerenciamento de Estado

### Persistência de Dados
- **AsyncStorage**: Armazena despesas e saldo do usuário
- **Chaves utilizadas**:
  - `@MyFinlove:expenses`: Array de despesas
  - `@MyFinlove:balance`: Saldo do usuário
  - `@MyFinlove:theme`: Tema selecionado

### Tema Dinâmico
- **Fonte**: Variável global `global.dashboardTheme`
- **Fallback**: AsyncStorage
- **Cores**: Adapta-se entre tema feminino (rosa) e masculino (azul)
- **Listener**: AppState para sincronização

### Funções Principais

#### Gerenciamento de Despesas
- `addNewExpense()`: Adiciona nova despesa
- `saveEdit()`: Salva edições
- `deleteThisMonth()`: Exclusão pontual
- `deleteFromThisMonth()`: Exclusão em série
- `deleteDefinitively()`: Exclusão completa
- `duplicateExpense()`: Duplicação

#### Pagamentos
- `effectivePayment()`: Efetiva pagamento completo
- `effectivePartialPayment()`: Efetiva pagamento parcial
- `markAsPaid()`: Marca como paga via menu

#### Utilitários
- `isOverdue()`: Verifica se está atrasada
- `formatDate()`: Formatação de data brasileira
- `calculateTotal()`: Soma total de despesas não pagas

## Navegação e UX

### Responsividade
- **KeyboardAvoidingView**: Ajuste automático para teclado
- **ScrollView**: Rolagem suave da lista
- **Platform.select**: Adaptação iOS/Android

### Feedback Visual
- **Cores de status**: Verde (pago), vermelho (atrasado), roxo (a vencer)
- **Loading**: ActivityIndicator durante carregamento
- **Empty state**: Mensagem quando não há despesas

### Acessibilidade
- **accessibilityLabel**: Botões com labels descritivos
- **Contraste**: Cores adequadas para legibilidade
- **Touch targets**: Áreas de toque adequadas

## Integração com Sistema

### Navegação
- **Entrada**: Dashboard ou navegação direta
- **Saída**: Volta para dashboard
- **Menu**: Modal com acesso a outras telas

### Dados Compartilhados
- **Saldo**: Sincronizado com outras telas
- **Tema**: Compartilhado globalmente
- **Contas**: Lista consistente no app

## Considerações Técnicas

### Performance
- **Ordenação eficiente**: Sort por timestamp
- **Lazy loading**: Carregamento sob demanda
- **Memoização**: Estados otimizados

### Validações
- **Campos obrigatórios**: Título e valor
- **Formato numérico**: Valores monetários
- **Datas válidas**: DatePicker nativo

### Tratamento de Erros
- **Try/catch**: Operações AsyncStorage
- **Fallbacks**: Valores padrão
- **User feedback**: Alerts informativos

## Melhorias Futuras Sugeridas

1. **Filtros avançados**: Por categoria, conta, período
2. **Busca textual**: Pesquisa por título/categoria
3. **Gráficos**: Visualização de gastos por categoria
4. **Notificações**: Lembretes de vencimento
5. **Exportação**: PDF/Excel dos dados
6. **Backup**: Sincronização em nuvem
7. **Categorias customizadas**: Criação pelo usuário
8. **Recorrência**: Despesas automáticas mensais 