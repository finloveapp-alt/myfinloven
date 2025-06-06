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