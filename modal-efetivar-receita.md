# Modal Efetivar Receita

## Visão Geral

O modal "Efetivar Receita" é um componente de interface que permite ao usuário registrar uma nova receita no sistema. Ele está localizado na página `/receitas` e é ativado através de um botão flutuante de adição.

## Estrutura do Modal

### Título
- **Texto**: "Efetivar Receita"
- **Estilo**: Fonte de 24px, peso 600, cor #333

### Campos de Entrada

#### 1. Campo Receita
- **Tipo**: TextInput
- **Label**: "Receita"
- **Placeholder**: "Ex: Salário, Freelance, etc."
- **Validação**: Campo obrigatório
- **Estilo**: Input transparente com borda inferior

#### 2. Campo Valor
- **Tipo**: TextInput numérico
- **Label**: "Valor"
- **Placeholder**: "0,00"
- **Formato**: Decimal com vírgula como separador
- **Validação**: Deve ser maior que 0
- **Recursos**: 
  - Teclado numérico
  - Botão calculadora (emoji ⌨️)
  - Alinhamento à direita
  - Fonte de 24px

#### 3. Campo Data de Recebimento
- **Tipo**: DatePicker
- **Label**: "Data recebimento"
- **Valor padrão**: Data atual ("Hoje")
- **Recursos**:
  - Ícone de link (⤵)
  - DateTimePicker nativo do React Native
  - Formato de exibição brasileiro

#### 4. Campo Conta
- **Tipo**: Seletor (não implementado completamente)
- **Label**: "Conta"
- **Valor padrão**: "Minha Carteira"
- **Recursos**:
  - Ícone de conta (quadrado branco)
  - Dropdown indicator (▼)

### Ações do Modal

#### Botão Cancelar
- **Texto**: "Cancelar"
- **Função**: Fecha o modal sem salvar
- **Estilo**: Texto roxo (#9c27b0), sem fundo

#### Botão Efetivar
- **Texto**: "Efetivar"
- **Função**: Salva a receita e fecha o modal
- **Validação**: Só funciona se descrição e valor > 0 estiverem preenchidos
- **Estilo**: Botão com borda, fonte bold

## Funcionalidade

### Processo de Efetivação

1. **Validação**: Verifica se descrição não está vazia e valor é maior que 0
2. **Criação do objeto**: Cria nova receita com:
   - ID único (timestamp)
   - Dados do formulário
   - Data de criação atual
   - Status padrão: não recebida, não compartilhada, não recorrente
3. **Persistência**: Salva no AsyncStorage
4. **Atualização da UI**: Adiciona à lista de receitas
5. **Reset**: Limpa o formulário
6. **Fechamento**: Fecha o modal

### Interface Income

```typescript
interface Income {
  id: string;
  description: string;
  amount: number;
  receiptDate: Date;
  isReceived: boolean;
  isShared: boolean;
  isRecurring: boolean;
  createdAt: Date;
  category?: string;
}
```

## Estilos Principais

### Container do Modal
- **Background**: Overlay escuro (rgba(0, 0, 0, 0.5))
- **Posicionamento**: Flex-end (aparece na parte inferior)
- **Animação**: Slide

### Conteúdo do Modal
- **Background**: #f5f5f5
- **Border radius**: 20px (superior)
- **Padding**: 20px
- **Max height**: 80% da tela

### Campos de Input
- **Background**: Transparente
- **Border**: Apenas borda inferior (#ddd)
- **Padding**: 8px vertical
- **Fonte**: 18px para textos normais, 24px para valor

### Botões de Ação
- **Layout**: Flexbox row, space-between
- **Margin top**: 24px
- **Cancelar**: Padding 12px vertical, 16px horizontal
- **Efetivar**: Border radius 8px, padding 8px vertical, 12px horizontal

## Estados do Componente

### Estados Principais
- `modalVisible`: Controla visibilidade do modal
- `newIncome`: Objeto com dados da nova receita
- `datePickerVisible`: Controla visibilidade do seletor de data

### Estado Inicial da Receita
```typescript
{
  description: '',
  amount: 0,
  receiptDate: new Date(),
  isReceived: false,
  isShared: false,
  isRecurring: false,
}
```

## Integração com o Sistema

### Armazenamento
- **Método**: AsyncStorage
- **Chave**: '@MyFinlove:incomes'
- **Formato**: JSON array

### Atualização da Interface
- Atualiza lista de receitas em tempo real
- Recalcula totais (a receber/recebido)
- Mantém filtros de mês/ano ativos

## Considerações de UX

### Validações
- Campos obrigatórios claramente identificados
- Feedback visual para erros
- Prevenção de submissão com dados inválidos

### Acessibilidade
- Labels descritivos
- Placeholders informativos
- Teclado apropriado para cada tipo de campo

### Responsividade
- Layout adaptável
- Modal ocupa máximo 80% da altura da tela
- Scroll interno quando necessário

## Melhorias Futuras Identificadas

1. **Campo Conta**: Implementar seletor funcional
2. **Categorias**: Adicionar seleção de categoria
3. **Validação de Formulário**: Feedback visual mais robusto
4. **Formatação de Moeda**: Melhorar entrada de valores
5. **Recorrência**: Implementar funcionalidade de receitas recorrentes 