# Implementação Funcional da Tela /cards - MyFinlove

## Análise do Banco de Dados Atual

### Estrutura Existente

Após análise completa do banco de dados Supabase, identificamos as seguintes tabelas principais:

1. **profiles** - Perfis dos usuários
2. **accounts** - Contas financeiras (Conta Corrente, Poupança, Investimento, Dinheiro Físico)
3. **transactions** - Transações financeiras com referência a `card_id`
4. **couples** - Relacionamentos entre casais

### Lacunas Identificadas

❌ **Tabela `cards` não existe** - Necessária para armazenar informações dos cartões de crédito/débito
❌ **Relacionamento cards-transactions incompleto** - Campo `card_id` existe mas sem tabela de referência
❌ **Dados mock na interface** - Tela atual usa dados estáticos

## Passos para Implementação Funcional

### 1. Criação da Tabela `cards`

**Prioridade: ALTA**

Criar tabela para armazenar informações dos cartões de crédito/débito dos usuários.

```sql
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL COMMENT 'Nome do cartão (ex: Cartão Principal)',
  card_number TEXT NOT NULL COMMENT 'Número do cartão (criptografado)',
  card_holder_name TEXT NOT NULL COMMENT 'Nome do portador do cartão',
  expiry_date TEXT NOT NULL COMMENT 'Data de validade (MM/AA)',
  cvv TEXT COMMENT 'CVV (criptografado, opcional para exibição)',
  card_type TEXT NOT NULL CHECK (card_type IN ('mastercard', 'visa', 'elo', 'american_express')) COMMENT 'Tipo do cartão',
  card_brand TEXT COMMENT 'Bandeira específica do cartão',
  is_credit BOOLEAN DEFAULT true COMMENT 'true para crédito, false para débito',
  credit_limit NUMERIC DEFAULT 0 COMMENT 'Limite do cartão de crédito',
  current_balance NUMERIC DEFAULT 0 COMMENT 'Saldo atual (para débito) ou fatura atual (para crédito)',
  available_limit NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN is_credit THEN credit_limit - current_balance 
      ELSE current_balance 
    END
  ) STORED COMMENT 'Limite disponível calculado automaticamente',
  primary_color TEXT DEFAULT '#b687fe' COMMENT 'Cor primária do cartão (hex)',
  secondary_color TEXT DEFAULT '#8B5CF6' COMMENT 'Cor secundária do cartão (hex)',
  is_active BOOLEAN DEFAULT true COMMENT 'Se o cartão está ativo',
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE COMMENT 'Proprietário do cartão',
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL COMMENT 'Parceiro com acesso ao cartão (opcional)',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_transaction_date TIMESTAMPTZ COMMENT 'Data da última transação'
);

-- Índices para performance
CREATE INDEX idx_cards_owner_id ON cards(owner_id);
CREATE INDEX idx_cards_partner_id ON cards(partner_id);
CREATE INDEX idx_cards_active ON cards(is_active) WHERE is_active = true;

-- RLS (Row Level Security)
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus cartões ou cartões compartilhados
CREATE POLICY "Users can view own cards or shared cards" ON cards
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    partner_id = auth.uid()
  );

-- Política para usuários criarem cartões
CREATE POLICY "Users can create own cards" ON cards
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Política para usuários atualizarem seus cartões
CREATE POLICY "Users can update own cards" ON cards
  FOR UPDATE USING (owner_id = auth.uid());

-- Política para usuários deletarem seus cartões
CREATE POLICY "Users can delete own cards" ON cards
  FOR DELETE USING (owner_id = auth.uid());
```

### 2. Atualização da Tabela `transactions`

**Prioridade: ALTA**

Adicionar constraint de foreign key para o campo `card_id` existente.

```sql
-- Adicionar constraint de foreign key para card_id
ALTER TABLE transactions 
ADD CONSTRAINT transactions_card_id_fkey 
FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE SET NULL;

-- Adicionar índice para performance
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
```

### 3. Funções de Banco para Operações com Cartões

**Prioridade: MÉDIA**

```sql
-- Função para calcular saldo total de cartões de um usuário
CREATE OR REPLACE FUNCTION get_user_cards_summary(user_id UUID)
RETURNS TABLE (
  total_credit_limit NUMERIC,
  total_available_limit NUMERIC,
  total_current_balance NUMERIC,
  active_cards_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN is_credit THEN credit_limit ELSE 0 END), 0) as total_credit_limit,
    COALESCE(SUM(available_limit), 0) as total_available_limit,
    COALESCE(SUM(current_balance), 0) as total_current_balance,
    COUNT(*)::INTEGER as active_cards_count
  FROM cards 
  WHERE (owner_id = user_id OR partner_id = user_id) 
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar saldo do cartão após transação
CREATE OR REPLACE FUNCTION update_card_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar saldo do cartão se a transação tem card_id
  IF NEW.card_id IS NOT NULL THEN
    UPDATE cards 
    SET 
      current_balance = current_balance + NEW.amount,
      last_transaction_date = NEW.transaction_date,
      updated_at = now()
    WHERE id = NEW.card_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar saldo automaticamente
CREATE TRIGGER trigger_update_card_balance
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_card_balance();
```

### 4. Implementação no Frontend - Serviços

**Prioridade: ALTA**

Criar arquivo `lib/services/cardsService.ts`:

```typescript
import { supabase } from '@/lib/supabase';

export interface Card {
  id: string;
  name: string;
  card_number: string;
  card_holder_name: string;
  expiry_date: string;
  card_type: 'mastercard' | 'visa' | 'elo' | 'american_express';
  is_credit: boolean;
  credit_limit: number;
  current_balance: number;
  available_limit: number;
  primary_color: string;
  secondary_color: string;
  is_active: boolean;
  owner_id: string;
  partner_id?: string;
  created_at: string;
  updated_at: string;
  last_transaction_date?: string;
}

export interface CardTransaction {
  id: string;
  description: string;
  amount: number;
  transaction_date: string;
  transaction_type: 'expense' | 'income';
  category?: string;
  icon?: string;
}

class CardsService {
  // Buscar todos os cartões do usuário
  async getUserCards(): Promise<Card[]> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Criar novo cartão
  async createCard(cardData: Omit<Card, 'id' | 'created_at' | 'updated_at' | 'available_limit'>): Promise<Card> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('cards')
      .insert({
        ...cardData,
        owner_id: user.id,
        // Mascarar número do cartão para segurança
        card_number: this.maskCardNumber(cardData.card_number)
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Buscar transações de um cartão específico
  async getCardTransactions(cardId: string, limit: number = 10): Promise<CardTransaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('id, description, amount, transaction_date, transaction_type, category, icon')
      .eq('card_id', cardId)
      .order('transaction_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Atualizar cartão
  async updateCard(cardId: string, updates: Partial<Card>): Promise<Card> {
    const { data, error } = await supabase
      .from('cards')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Deletar cartão (soft delete)
  async deleteCard(cardId: string): Promise<void> {
    const { error } = await supabase
      .from('cards')
      .update({ is_active: false })
      .eq('id', cardId);

    if (error) throw error;
  }

  // Buscar resumo dos cartões do usuário
  async getUserCardsSummary() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .rpc('get_user_cards_summary', { user_id: user.id });

    if (error) throw error;
    return data[0] || {
      total_credit_limit: 0,
      total_available_limit: 0,
      total_current_balance: 0,
      active_cards_count: 0
    };
  }

  // Utilitário para mascarar número do cartão
  private maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length < 4) return cleaned;
    
    const lastFour = cleaned.slice(-4);
    const masked = cleaned.slice(0, -4).replace(/\d/g, '*');
    return `${masked}${lastFour}`;
  }

  // Formatar número do cartão para exibição
  formatCardNumber(cardNumber: string): string {
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  }
}

export const cardsService = new CardsService();
```

### 5. Atualização da Tela /cards

**Prioridade: ALTA**

Principais alterações necessárias no arquivo `app/(app)/cards.tsx`:

```typescript
// Substituir dados mock por dados reais
const [cards, setCards] = useState<Card[]>([]);
const [loading, setLoading] = useState(true);
const [cardTransactions, setCardTransactions] = useState<CardTransaction[]>([]);

// Carregar cartões do usuário
useEffect(() => {
  loadUserCards();
}, []);

const loadUserCards = async () => {
  try {
    setLoading(true);
    const userCards = await cardsService.getUserCards();
    setCards(userCards);
    
    // Carregar transações do primeiro cartão se existir
    if (userCards.length > 0) {
      const transactions = await cardsService.getCardTransactions(userCards[0].id);
      setCardTransactions(transactions);
    }
  } catch (error) {
    console.error('Erro ao carregar cartões:', error);
    Alert.alert('Erro', 'Não foi possível carregar os cartões');
  } finally {
    setLoading(false);
  }
};

// Implementar função de adicionar cartão real
const handleAddCard = async () => {
  if (!cardNumber || !cardName || !expiryDate || !cvv || !selectedType) {
    Alert.alert('Atenção', 'Por favor, preencha todos os campos');
    return;
  }
  
  try {
    const newCard = await cardsService.createCard({
      name: `Cartão ${selectedType}`,
      card_number: cardNumber,
      card_holder_name: cardName,
      expiry_date: expiryDate,
      card_type: selectedType as 'mastercard' | 'visa',
      is_credit: true, // Assumir crédito por padrão
      credit_limit: 1000, // Limite padrão
      current_balance: 0,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      is_active: true,
      owner_id: '', // Será preenchido pelo serviço
    });
    
    Alert.alert('Sucesso', 'Cartão adicionado com sucesso!');
    setIsModalVisible(false);
    resetForm();
    loadUserCards(); // Recarregar lista
  } catch (error) {
    console.error('Erro ao adicionar cartão:', error);
    Alert.alert('Erro', 'Não foi possível adicionar o cartão');
  }
};
```

### 6. Implementação de Segurança

**Prioridade: ALTA**

#### 6.1 Criptografia de Dados Sensíveis

```typescript
// lib/utils/encryption.ts
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.EXPO_PUBLIC_ENCRYPTION_KEY || 'default-key';

export const encryptSensitiveData = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

export const decryptSensitiveData = (encryptedData: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

#### 6.2 Validação de Cartão

```typescript
// lib/utils/cardValidation.ts
export const validateCardNumber = (cardNumber: string): boolean => {
  // Algoritmo de Luhn para validação de cartão
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d+$/.test(cleaned)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

export const validateExpiryDate = (expiryDate: string): boolean => {
  const [month, year] = expiryDate.split('/');
  if (!month || !year) return false;
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expMonth = parseInt(month);
  const expYear = parseInt(year);
  
  if (expMonth < 1 || expMonth > 12) return false;
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  
  return true;
};
```

### 7. Tela de Detalhes do Cartão

**Prioridade: MÉDIA**

Criar `app/(app)/card-detail.tsx` para exibir informações detalhadas:

```typescript
// Funcionalidades principais:
// - Exibir informações completas do cartão
// - Histórico de transações paginado
// - Gráficos de gastos por categoria
// - Opções de editar/desativar cartão
// - Configurações de limite e alertas
```

### 8. Integração com Transações

**Prioridade: ALTA**

#### 8.1 Atualizar Tela de Registros

Modificar `app/(app)/registers.tsx` para incluir seleção de cartão:

```typescript
// Adicionar campo de seleção de cartão no formulário
// Vincular transações aos cartões selecionados
// Atualizar saldo do cartão automaticamente
```

#### 8.2 Sincronização de Saldos

```sql
-- Trigger para manter saldos sincronizados
CREATE OR REPLACE FUNCTION sync_card_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar saldo quando transação é modificada
  IF TG_OP = 'UPDATE' THEN
    -- Reverter transação antiga
    IF OLD.card_id IS NOT NULL THEN
      UPDATE cards 
      SET current_balance = current_balance - OLD.amount
      WHERE id = OLD.card_id;
    END IF;
  END IF;
  
  -- Aplicar nova transação
  IF NEW.card_id IS NOT NULL THEN
    UPDATE cards 
    SET 
      current_balance = current_balance + NEW.amount,
      last_transaction_date = NEW.transaction_date
    WHERE id = NEW.card_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 9. Funcionalidades Avançadas

**Prioridade: BAIXA**

#### 9.1 Notificações de Limite
- Alertas quando atingir % do limite
- Notificações de vencimento de fatura

#### 9.2 Análises e Relatórios
- Gastos por categoria no cartão
- Comparativo mensal de uso
- Sugestões de otimização

#### 9.3 Compartilhamento de Cartões
- Permitir acesso do parceiro a cartões específicos
- Controle de permissões (visualizar/usar)

### 10. Testes e Validação

**Prioridade: MÉDIA**

#### 10.1 Testes de Unidade
```typescript
// Testar funções de validação
// Testar serviços de cartão
// Testar criptografia/descriptografia
```

#### 10.2 Testes de Integração
```typescript
// Testar fluxo completo de criação de cartão
// Testar sincronização com transações
// Testar políticas de segurança RLS
```

## Cronograma de Implementação

### Fase 1 (Semana 1) - Fundação
- [ ] Criar tabela `cards`
- [ ] Implementar serviços básicos
- [ ] Atualizar tela /cards com dados reais

### Fase 2 (Semana 2) - Integração
- [ ] Conectar cartões com transações
- [ ] Implementar validações de segurança
- [ ] Criar tela de detalhes do cartão

### Fase 3 (Semana 3) - Refinamento
- [ ] Implementar funcionalidades avançadas
- [ ] Testes e correções
- [ ] Otimizações de performance

## Considerações de Segurança

1. **Dados Sensíveis**: Nunca armazenar CVV completo ou números de cartão não criptografados
2. **PCI Compliance**: Considerar padrões de segurança para dados de cartão
3. **Auditoria**: Implementar logs de acesso a dados sensíveis
4. **Backup**: Estratégia de backup seguro para dados criptografados

## Métricas de Sucesso

- [ ] Usuários conseguem adicionar cartões sem erros
- [ ] Transações são corretamente vinculadas aos cartões
- [ ] Saldos são atualizados em tempo real
- [ ] Interface responsiva e intuitiva
- [ ] Dados seguros e criptografados
- [ ] Performance adequada (< 2s para carregar cartões)

---

**Documento gerado em:** $(date)
**Versão:** 1.0
**Status:** Pronto para implementação 