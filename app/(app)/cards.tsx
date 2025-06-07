import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, cardsService } from '@/lib/services/cardsService';
import CardBrandIcon from '@/components/ui/CardBrandIcons';

// Tema fixo para evitar dependências externas
const theme = {
  colors: {
    primary: '#b687fe',
    secondary: '#8B5CF6',
    success: '#4CD964',
    background: '#f5f7fa',
    surface: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e1e4e8',
  }
};

// Função para detectar a bandeira do cartão
const detectCardBrand = (number: string): string => {
  const cleanNumber = number.replace(/\s/g, '');
  
  // Visa
  if (/^4[0-9]{0,}/.test(cleanNumber)) {
    return 'visa';
  }
  
  // Mastercard
  if (/^(5[1-5][0-9]{0,}|2[2-7][0-9]{0,})/.test(cleanNumber)) {
    return 'mastercard';
  }
  
  // American Express
  if (/^3[47][0-9]{0,}/.test(cleanNumber)) {
    return 'amex';
  }
  
  // Diners Club
  if (/^3(?:0[0-5]|[68][0-9])[0-9]{0,}/.test(cleanNumber)) {
    return 'dinersclub';
  }
  
  // Discover
  if (/^6(?:011|5[0-9]{2})[0-9]{0,}/.test(cleanNumber)) {
    return 'discover';
  }
  
  // Elo
  if (/^(4011(78|79)|43(1274|8935)|45(1416|7393|763(1|2))|50(4175|6699|67[0-6][0-9]|677[0-8]|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9])|627780|63(6297|6368|6369)|65(0(0(3([1-3]|[5-9])|4([0-9])|5[0-1])|4(0[5-9]|[1-3][0-9]|8[5-9]|9[0-9])|5([0-2][0-9]|3[0-8]|4[1-9]|[5-8][0-9]|9[0-8])|7(0[0-9]|1[0-8]|2[0-7])|9(0[1-9]|[1-6][0-9]|7[0-8]))|16(5[2-9]|[6-7][0-9])|50(0[0-9]|1[0-9]|2[0-9]|3[0-8]))/.test(cleanNumber)) {
    return 'elo';
  }
  
  // Hipercard
  if (/^(38[0-9]{2}|60[0-9]{2})/.test(cleanNumber)) {
    return 'hipercard';
  }
  
  return 'unknown';
};

// Função para formatar número do cartão
const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = matches && matches[0] || '';
  const parts = [];
  
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  
  if (parts.length) {
    return parts.join(' ');
  } else {
    return v;
  }
};

// Função para formatar valor em moeda
const formatCurrency = (value: string) => {
  const numericValue = value.replace(/[^0-9]/g, '');
  const number = parseFloat(numericValue) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(number);
};

export default function CardsScreen() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  
  // Estados do formulário
  const [bankName, setBankName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardType, setCardType] = useState<'debit' | 'credit'>('credit');

  // Carregar cartões
  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await cardsService.getCards();
      setCards(data);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      // Fallback para dados mock em caso de erro
      setCards([
        {
          id: '1',
          bank_name: 'Nubank',
          card_number: '**** **** **** 1234',
          cardholder_name: 'João Silva',
          card_limit: 5000,
          card_type: 'credit',
          brand: 'mastercard',
          user_id: 'mock-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          bank_name: 'Itaú',
          card_number: '**** **** **** 5678',
          cardholder_name: 'João Silva',
          card_limit: 3000,
          card_type: 'debit',
          brand: 'visa',
          user_id: 'mock-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  // Função para adicionar cartão
  const handleAddCard = async () => {
    if (!bankName.trim() || !cardNumber.trim() || !cardholderName.trim() || !cardLimit.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setAddingCard(true);
      
      const detectedBrand = detectCardBrand(cardNumber);
      const numericLimit = parseFloat(cardLimit.replace(/[^0-9]/g, '')) / 100;
      
      const newCard: Omit<Card, 'id' | 'created_at' | 'updated_at'> = {
        bank_name: bankName.trim(),
        card_number: cardNumber.trim(),
        cardholder_name: cardholderName.trim(),
        card_limit: numericLimit,
        card_type: cardType,
        brand: detectedBrand,
        user_id: 'current-user' // Substituir pela ID do usuário logado
      };

      await cardsService.createCard(newCard);
      
      // Limpar formulário
      setBankName('');
      setCardNumber('');
      setCardholderName('');
      setCardLimit('');
      setCardType('credit');
      
      setModalVisible(false);
      loadCards(); // Recarregar lista
      
      Alert.alert('Sucesso', 'Cartão adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o cartão. Tente novamente.');
    } finally {
      setAddingCard(false);
    }
  };

  const renderCard = (card: Card) => (
    <View 
      key={card.id} 
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        height: 160.4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
            {card.bank_name}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 4 }}>
            {card.card_number}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{
            backgroundColor: card.card_type === 'credit' ? theme.colors.primary : theme.colors.success,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>
              {card.card_type === 'credit' ? 'Crédito' : 'Débito'}
            </Text>
          </View>
          <CardBrandIcon brand={card.brand} size={32} />
        </View>
      </View>
      
      <View style={{ marginTop: 'auto' }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
          Titular
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '500' }}>
          {card.cardholder_name}
        </Text>
        
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 8 }}>
          Limite
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(card.card_limit)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.colors.text }}>
            Cartões
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              backgroundColor: theme.colors.primary,
              width: 44,
              height: 44,
              borderRadius: 22,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Lista de cartões */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ color: theme.colors.textSecondary, marginTop: 16 }}>
              Carregando cartões...
            </Text>
          </View>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 12 }}
          >
            {cards.map(renderCard)}
          </ScrollView>
        )}

        {/* Modal para adicionar cartão */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
            <View style={{
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              height: '70%',
            }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header do modal */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.text }}>
                    Adicionar Cartão
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                {/* Formulário */}
                <View style={{ gap: 16 }}>
                  {/* Nome do Banco */}
                  <View>
                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>
                      Nome do Banco
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: theme.colors.background,
                        borderRadius: 12,
                        padding: 16,
                        fontSize: 16,
                        color: theme.colors.text,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                      placeholder="Ex: Nubank, Itaú, Bradesco..."
                      placeholderTextColor={theme.colors.textSecondary}
                      value={bankName}
                      onChangeText={setBankName}
                    />
                  </View>

                  {/* Número do cartão */}
                  <View>
                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>
                      Número do Cartão
                    </Text>
                    <View style={{ position: 'relative' }}>
                      <TextInput
                        style={{
                          backgroundColor: theme.colors.background,
                          borderRadius: 12,
                          padding: 16,
                          paddingRight: 50,
                          fontSize: 16,
                          color: theme.colors.text,
                          borderWidth: 1,
                          borderColor: theme.colors.border,
                        }}
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={cardNumber}
                        onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                        keyboardType="numeric"
                        maxLength={19}
                      />
                      {cardNumber && (
                        <View style={{ position: 'absolute', right: 16, top: 16 }}>
                          <CardBrandIcon brand={detectCardBrand(cardNumber)} size={24} />
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Nome do titular */}
                  <View>
                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>
                      Nome do Titular
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: theme.colors.background,
                        borderRadius: 12,
                        padding: 16,
                        fontSize: 16,
                        color: theme.colors.text,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                      placeholder="Nome como está no cartão"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={cardholderName}
                      onChangeText={setCardholderName}
                    />
                  </View>

                  {/* Limite do cartão */}
                  <View>
                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>
                      Limite do Cartão
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: theme.colors.background,
                        borderRadius: 12,
                        padding: 16,
                        fontSize: 16,
                        color: theme.colors.text,
                        borderWidth: 1,
                        borderColor: theme.colors.border,
                      }}
                      placeholder="R$ 0,00"
                      placeholderTextColor={theme.colors.textSecondary}
                      value={cardLimit}
                      onChangeText={(text) => setCardLimit(formatCurrency(text))}
                      keyboardType="numeric"
                    />
                  </View>

                  {/* Tipo do cartão */}
                  <View>
                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '500', marginBottom: 8 }}>
                      Tipo do Cartão
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity
                        onPress={() => setCardType('credit')}
                        style={{
                          flex: 1,
                          backgroundColor: cardType === 'credit' ? theme.colors.primary : theme.colors.background,
                          borderRadius: 12,
                          padding: 16,
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: cardType === 'credit' ? theme.colors.primary : theme.colors.border,
                        }}
                      >
                        <Text style={{
                          color: cardType === 'credit' ? '#fff' : theme.colors.text,
                          fontSize: 16,
                          fontWeight: '500',
                        }}>
                          Crédito
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setCardType('debit')}
                        style={{
                          flex: 1,
                          backgroundColor: cardType === 'debit' ? theme.colors.success : theme.colors.background,
                          borderRadius: 12,
                          padding: 16,
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: cardType === 'debit' ? theme.colors.success : theme.colors.border,
                        }}
                      >
                        <Text style={{
                          color: cardType === 'debit' ? '#fff' : theme.colors.text,
                          fontSize: 16,
                          fontWeight: '500',
                        }}>
                          Débito
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Botão de adicionar */}
                <TouchableOpacity
                  onPress={handleAddCard}
                  disabled={addingCard}
                  style={{
                    backgroundColor: theme.colors.primary,
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    marginTop: 24,
                    opacity: addingCard ? 0.7 : 1,
                  }}
                >
                  {addingCard ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                      Adicionar Cartão
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
} 