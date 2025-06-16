# Modal Nova Transação - Tela /registers

## Visão Geral
O modal "Nova Transação" é um componente complexo e abrangente da tela `/registers` do aplicativo MyFinlove, responsável por permitir aos usuários criar diferentes tipos de transações financeiras (despesas, receitas e transferências) com múltiplas opções de configuração.

## Estrutura do Modal

### Apresentação
- **Tipo**: Modal slide-up (desliza de baixo para cima)
- **Fundo**: Overlay semi-transparente
- **Header**: Título "Nova Transação" com botão X para fechar
- **Conteúdo**: ScrollView com padding inferior de 20px

### Campos e Funcionalidades

#### 1. Seletor de Tipo de Transação
**Localização**: Topo do modal
**Opções**:
- **Despesa** (ArrowDown icon) - Cor vermelha (#FF3B30)
- **Receita** (ArrowUp icon) - Cor verde (#4CD964)  
- **Transferência** (RefreshCw icon) - Cor amarela (rgb(255, 204, 0))

**Comportamento**:
- Botões com estado ativo/inativo
- Fundo colorido com transparência (15%) quando selecionado
- Ícones circulares com cores correspondentes

#### 2. Campo Descrição
**Tipo**: TextInput simples
**Placeholder**: "Ex: Mercado, Salário, Aluguel"
**Validação**: Campo obrigatório
**Estado**: `description` (string)

#### 3. Seletor de Ícone
**Tipo**: Dropdown expansível com grid de emojis
**Funcionalidade**: 
- 24 ícones categorizados (Alimentação, Compras, Moradia, etc.)
- Grid scrollável vertical
- Seleção opcional
- Feedback visual quando selecionado

**Ícones Disponíveis**:
```javascript
🍎🍕🍔 (Alimentação), 🛒 (Compras), 🏠💡 (Moradia/Utilidades), 
💻📱 (Trabalho/Tecnologia), 🚗⛽ (Transporte), 🎓📚 (Educação), 
🏥💊 (Saúde), 🎬🎮📺🎵 (Entretenimento), 💰💸💳🏦 (Financeiro), 
✈️🏨 (Viagem)
```

#### 4. Tipo de Transação (Pessoal/Compartilhada)
**Opções**:
- **Pessoal**: Transação individual
- **Compartilhada**: Transação com parceiros

**Comportamento**:
- Quando "Compartilhada" é selecionada, aparece o seletor de parceiros
- Cores dinâmicas baseadas no tema (primary/shared)

#### 5. Seletor de Parceiro (Condicional)
**Visibilidade**: Apenas quando transação é compartilhada
**Funcionalidade**:
- Lista de parceiros cadastrados
- Dropdown com nomes e indicação "(Avatar)" se aplicável
- Mensagem "Nenhum parceiro disponível" se lista vazia

#### 6. Campo Data
**Tipo**: Calendário personalizado expansível
**Funcionalidades**:
- Campo clicável com ícone de calendário
- Exibição em formato brasileiro (dd/mm/aaaa)
- Calendário com navegação mês/ano
- Header colorido com tema dinâmico
- Grid de dias da semana
- Seleção visual com círculo branco

#### 7. Campo Valor
**Tipo**: Input numérico com formatação
**Características**:
- Símbolo R$ fixo à esquerda
- Placeholder "0,00"
- Teclado numérico
- Container com borda e padding

#### 8. Forma de Pagamento
**Opções**:
- **Débito** (CreditCard icon)
- **Crédito** (CreditCard icon)
- **PIX** (RefreshCw icon)
- **Dinheiro** (DollarSign icon)

**Comportamento**:
- Dropdown com ícones e textos
- Feedback visual na seleção
- zIndex: 25 para sobreposição

#### 9. Seleção de Cartão
**Funcionalidade**:
- Lista de cartões cadastrados do usuário
- Exibição: Nome do banco + últimos 4 dígitos
- Mensagem "Nenhum cartão cadastrado" se vazio
- Integração com `cardsService`

#### 10. Configuração de Repetição
**Opções**:
- **Não recorrente** (X icon)
- **Mensal** (RefreshCw icon)

**Comportamento**:
- Quando "Mensal" é selecionado, aparece campo de data fim
- Ícone e cor dinâmica na seleção
- Estado `isRecurrent` controla visibilidade de campos adicionais

#### 11. Data de Fim da Recorrência (Condicional)
**Visibilidade**: Apenas quando transação é recorrente
**Funcionalidade**:
- Calendário separado para data de fim
- Estados independentes (`recurrenceEndPickerMonth`, etc.)
- Placeholder "Selecione a data de fim"

#### 12. Categoria
**Funcionalidades**:
- Seletor de categoria existente
- Botão "Adicionar Nova Categoria" com ícone +
- **Formulário inline** para nova categoria:
  - Seletor de emoji (14 opções)
  - Campo de texto para nome
  - Botão "Adicionar" colorido por tipo de transação
  - Botão fechar (X)
  - Cores dinâmicas: vermelho (despesa), verde (receita), azul (transferência)

#### 13. Conta
**Funcionalidades**:
- Lista de contas do usuário
- Exibição: Emoji por tipo + Nome + Tipo da conta
- Tipos: Conta Corrente (🏦), Poupança (💰), Investimento (📈), Dinheiro Físico (💵)
- Botão "Adicionar Nova Conta"
- **Formulário completo** para nova conta:
  - Nome do banco
  - Valor inicial (com formatação R$)
  - Tipo de conta (dropdown)
  - Proprietário (usuário ou parceiros)
  - Botões Cancelar/Criar Conta

### Validações e Estados

#### Estados Principais
```typescript
- modalVisible: boolean
- transactionType: 'expense' | 'income' | 'transfer'
- amount: string
- description: string
- selectedDate: string
- selectedIcon: string
- isSharedTransaction: boolean
- selectedPartnerId: string | null
- paymentMethod: string
- selectedCard/selectedCardId: string | null
- recurrenceType: string
- isRecurrent: boolean
- recurrenceEndDate: string
- selectedCategory: string
- selectedAccount/selectedAccountId: string | null
- isSaving: boolean
- errorMessage: string
```

#### Validações
- Descrição obrigatória
- Valor obrigatório
- Data obrigatória
- Conta obrigatória
- Forma de pagamento obrigatória

### Funcionalidades Avançadas

#### 1. Sistema de Recorrência
- Criação automática de transações futuras
- Função `createRecurringTransactions()` para gerar série
- Cálculo de datas baseado no tipo de recorrência
- Integração com Supabase para persistência

#### 2. Integração com Supabase
- Salvamento em tabela `transactions`
- Relacionamento com contas, cartões e parceiros
- Tratamento de erros com mensagens ao usuário
- Estados de loading durante operações

#### 3. Tema Dinâmico
- Cores adaptáveis ao gênero do usuário
- Temas feminino (rosa/roxo) e masculino (azul)
- Aplicação consistente em todos os elementos

#### 4. Gestão de Z-Index
- Sistema hierárquico para dropdowns
- Valores de 9 a 30 para evitar sobreposições
- Ordem: Forma de Pagamento (25) > Cartão (20) > Parceiro (11) > Ícone (12)

### Botão de Ação
**Características**:
- Texto: "Salvar Transação" / "Salvando..."
- Cor de fundo dinâmica (tema primary)
- Estado desabilitado durante salvamento
- Feedback visual de loading

### Tratamento de Erros
- Container de erro condicional
- Mensagens específicas por tipo de erro
- Limpeza automática após correção

## Fluxo de Uso

1. **Abertura**: Usuário toca no botão + flutuante
2. **Seleção de Tipo**: Escolhe entre Despesa/Receita/Transferência
3. **Preenchimento**: Insere descrição, valor, data
4. **Configurações**: Define ícone, categoria, conta, forma de pagamento
5. **Opcionais**: Configura compartilhamento, recorrência
6. **Salvamento**: Valida campos e persiste no banco
7. **Feedback**: Mostra sucesso ou erro, fecha modal

## Integração com Sistema

### Dependências
- **Supabase**: Persistência de dados
- **AsyncStorage**: Cache local
- **cardsService**: Gestão de cartões
- **Lucide Icons**: Iconografia
- **Expo Router**: Navegação

### Relacionamentos
- **Contas**: Tabela `accounts`
- **Cartões**: Tabela `cards` 
- **Parceiros**: Tabela `profiles` (relacionamento)
- **Transações**: Tabela `transactions`

## Considerações Técnicas

### Performance
- Lazy loading de dropdowns
- Estados independentes para cada seletor
- Otimização de re-renders com useCallback

### Acessibilidade
- Placeholders descritivos
- Feedback visual claro
- Navegação por teclado suportada

### Responsividade
- Layout adaptável a diferentes tamanhos
- ScrollView para conteúdo extenso
- Margens e paddings consistentes

## Análise de Escalabilidade e Manutenibilidade

### Pontos Fortes
1. **Modularidade**: Cada funcionalidade é bem encapsulada em funções específicas
2. **Reutilização**: Componentes de dropdown e calendário são consistentes
3. **Tipagem**: Uso adequado de TypeScript para type safety
4. **Separação de Responsabilidades**: Lógica de negócio separada da apresentação

### Oportunidades de Melhoria
1. **Componentização**: O modal poderia ser dividido em sub-componentes menores (FormField, Dropdown, Calendar)
2. **Custom Hooks**: Lógica de estado poderia ser extraída para hooks personalizados
3. **Validação**: Sistema de validação mais robusto com biblioteca como Yup ou Zod
4. **Testes**: Implementação de testes unitários para funções críticas

### Próximos Passos Sugeridos
1. Extrair componentes reutilizáveis (DropdownField, DatePicker, AmountInput)
2. Implementar sistema de validação mais robusto
3. Adicionar testes automatizados
4. Considerar uso de React Hook Form para melhor gestão de formulários
5. Implementar cache inteligente para listas de contas/cartões/parceiros 