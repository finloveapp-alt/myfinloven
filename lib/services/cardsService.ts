import { supabase } from '@/lib/supabase';

export interface Card {
  id: string;
  name: string;
  card_holder_name: string;
  bank_name: string;
  card_type: 'visa' | 'mastercard' | 'amex' | 'diners' | 'discover' | 'elo' | 'hipercard';
  card_brand?: string;
  is_credit: boolean;
  credit_limit: number;
  current_balance: number;
  available_limit?: number;
  primary_color: string;
  secondary_color: string;
  expiry_date?: string;
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
  async getUserCards(userId?: string): Promise<Card[]> {
    let query = supabase
      .from('cards')
      .select('*')
      .eq('is_active', true);

    // Se userId for fornecido, filtrar por owner_id
    if (userId) {
      query = query.eq('owner_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Buscar um cartão específico por ID
  async getCardById(cardId: string): Promise<Card | null> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Erro ao buscar cartão por ID:', error);
      return null;
    }
    return data;
  }

  // Criar novo cartão
  async createCard(cardData: {
    name: string;
    card_holder_name: string;
    bank_name: string;
    card_type: string;
    is_credit?: boolean;
    credit_limit?: number;
    primary_color?: string;
    secondary_color?: string;
    expiry_date?: string;
  }): Promise<Card> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('cards')
      .insert({
        name: cardData.name,
        card_holder_name: cardData.card_holder_name,
        bank_name: cardData.bank_name,
        card_type: cardData.card_type,
        is_credit: cardData.is_credit ?? true,
        credit_limit: cardData.credit_limit ?? 1000,
        current_balance: 0,
        primary_color: cardData.primary_color ?? '#b687fe',
        secondary_color: cardData.secondary_color ?? '#8B5CF6',
        expiry_date: cardData.expiry_date,
        owner_id: user.id,
        is_active: true
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

  // Buscar transações de todos os cartões do usuário
  async getAllUserTransactions(limit: number = 20): Promise<CardTransaction[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    // Primeiro, buscar todos os cartões do usuário
    const userCards = await this.getUserCards(user.id);
    
    if (userCards.length === 0) {
      return [];
    }

    // Extrair os IDs dos cartões
    const cardIds = userCards.map(card => card.id);

    // Data atual no formato ISO (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // Buscar transações de todos os cartões do usuário até a data atual
    const { data, error } = await supabase
      .from('transactions')
      .select('id, description, amount, transaction_date, transaction_type, category, icon')
      .in('card_id', cardIds)
      .lte('transaction_date', today)
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

  // Atualizar saldo do cartão (deduzir do limite disponível)
  async updateCardBalance(cardId: string, expenseAmount: number, userId?: string): Promise<void> {
    console.log(`[updateCardBalance] Iniciando atualização - CardID: ${cardId}, Valor: ${expenseAmount}, UserID: ${userId}`);
    
    // Primeiro, buscar o cartão atual para validações (forçar busca sem cache)
    const { data: card, error: fetchError } = await supabase
      .from('cards')
      .select('current_balance, credit_limit, is_active, owner_id, partner_id')
      .eq('id', cardId)
      .maybeSingle();

    if (fetchError) {
      console.error('[updateCardBalance] Erro ao buscar cartão:', fetchError);
      throw fetchError;
    }
    if (!card) {
      console.error('[updateCardBalance] Cartão não encontrado');
      throw new Error('Cartão não encontrado');
    }

    console.log('[updateCardBalance] Cartão encontrado:', card);

    // Validar se o cartão está ativo
    if (!card.is_active) {
      console.error('[updateCardBalance] Cartão inativo');
      throw new Error('Cartão está inativo');
    }

    // Validar se o cartão pertence ao usuário (se userId fornecido)
    if (userId && card.owner_id !== userId && card.partner_id !== userId) {
      console.error('[updateCardBalance] Usuário sem permissão');
      throw new Error('Usuário não tem permissão para usar este cartão');
    }

    // Calcular o novo saldo (aumentar current_balance para diminuir available_limit)
    const currentBalance = parseFloat(card.current_balance.toString());
    const newBalance = currentBalance + expenseAmount; // Soma para aumentar o valor usado
    
    console.log(`[updateCardBalance] Saldo atual: ${currentBalance}, Valor da despesa: ${expenseAmount}, Novo saldo: ${newBalance}`);

    // Atualizar o saldo do cartão (current_balance aumenta, available_limit diminui automaticamente)
    const { data: updateData, error: updateError } = await supabase
      .from('cards')
      .update({
        current_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .select();

    if (updateError) {
      console.error('[updateCardBalance] Erro ao atualizar:', updateError);
      throw updateError;
    }

    console.log('[updateCardBalance] Cartão atualizado com sucesso:', updateData);
    
    // Verificar se a atualização foi realmente aplicada
    const { data: verifyCard } = await supabase
      .from('cards')
      .select('current_balance, available_limit')
      .eq('id', cardId)
      .single();
    
    console.log('[updateCardBalance] Verificação pós-atualização:', verifyCard);
  }


}

export const cardsService = new CardsService(); 