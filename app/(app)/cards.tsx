import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Plus, CreditCard, X, BarChart, Menu, PlusCircle, Receipt, Home, Bell, Info, ExternalLink, Wallet } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { fontFallbacks } from '@/utils/styles';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cardsService, Card, CardTransaction } from '@/lib/services/cardsService';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import CardBrandIcon from '@/components/ui/CardBrandIcons';

// Importar credit-card-type usando require para compatibilidade
const creditCardType = require('credit-card-type');

// Componentes SVG para ícones das bandeiras
const DinersIcon = () => (
  <Svg width="24" height="16" viewBox="0 0 24 16">
    <Rect width="24" height="16" rx="2" fill="#0079BE"/>
    <Circle cx="8" cy="8" r="4" fill="white"/>
    <Circle cx="16" cy="8" r="4" fill="white"/>
  </Svg>
);

const DiscoverIcon = () => (
  <Svg width="24" height="16" viewBox="0 0 24 16">
    <Rect width="24" height="16" rx="2" fill="#FF6000"/>
    <Path d="M12 4h8c2 0 4 2 4 4s-2 4-4 4h-8V4z" fill="white"/>
  </Svg>
);

const HipercardIcon = () => (
  <Svg width="24" height="16" viewBox="0 0 24 16">
    <Rect width="24" height="16" rx="2" fill="#FF0000"/>
    <Rect x="4" y="4" width="16" height="8" rx="1" fill="white"/>
    <Path d="M8 6h8v4H8V6z" fill="#FF0000"/>
  </Svg>
);

const VisaIcon = () => (
  <Svg width="24" height="16" viewBox="0 0 24 16">
    <Rect width="24" height="16" rx="2" fill="#1A1F71"/>
    <Path d="M4 5h2l1 6h1l1-6h2l-1.5 6h1l1.5-6h2l-2 6h1l2-6h2v6H4V5z" fill="white"/>
  </Svg>
);

const MastercardIcon = () => (
  <Svg width="24" height="16" viewBox="0 0 24 16">
    <Rect width="24" height="16" rx="2" fill="#000"/>
    <Circle cx="9" cy="8" r="4" fill="#EB001B"/>
    <Circle cx="15" cy="8" r="4" fill="#F79E1B"/>
  </Svg>
);

const EloIcon = () => (
  <Svg width="24" height="16" viewBox="0 0 24 16">
    <Rect width="24" height="16" rx="2" fill="#000"/>
    <Circle cx="8" cy="8" r="3" fill="#FFD700"/>
    <Circle cx="16" cy="8" r="3" fill="#FFD700"/>
    <Rect x="10" y="6" width="4" height="4" fill="#FFD700"/>
  </Svg>
);

const AmexIcon = () => (
  <Svg width="24" height="16" viewBox="0 0 24 16">
    <Rect width="24" height="16" rx="2" fill="#006FCF"/>
    <Rect x="2" y="6" width="20" height="4" fill="white"/>
    <Path d="M4 4h4l2 4-2 4H4V4zm12 0h4v8h-4l-2-4 2-4z" fill="white"/>
  </Svg>
);

const { width } = Dimensions.get('window');
const cardWidth = width * 0.6;
const cardHeight = 160.4;

// Definição de temas
const themes = {
  feminine: {
    primary: '#b687fe',
    secondary: '#8B5CF6',
    accent: '#FF3B30',
    background: '#f5f7fa',
    card: '#ffffff',
    expense: '#FF3B30',
    income: '#4CD964',
    shared: '#0073ea',
    text: '#333333'
  },
  masculine: {
    primary: '#0073ea',
    secondary: '#3c79e6',
    accent: '#FF3B30',
    background: '#f5f7fa',
    card: '#ffffff',
    expense: '#FF3B30',
    income: '#4CD964',
    shared: '#8B5CF6',
    text: '#333333'
  }
};

// Função para obter o tema inicial
const getInitialTheme = () => {
  // Verificar primeiro se há um tema global definido
  if (global.dashboardTheme === 'masculine') {
    return themes.masculine;
  }
  
  // Se não houver tema global, usar o tema padrão feminino
  return themes.feminine;
};

// Função para detectar a bandeira do cartão usando credit-card-type
const detectCardBrand = (number: string): string => {
  const cleanNumber = number.replace(/\s/g, '');
  
  if (!cleanNumber) {
    return 'unknown';
  }
  
  try {
    const cardTypes = creditCardType(cleanNumber);
    
    if (cardTypes.length === 0) {
      return 'unknown';
    }
    
    // Pegar o primeiro tipo detectado
    const cardType = cardTypes[0];
    
    // Mapear os tipos da biblioteca para nossos tipos
    switch (cardType.type) {
      case 'visa':
        return 'visa';
      case 'mastercard':
        return 'mastercard';
      case 'american-express':
        return 'amex';
      case 'diners-club':
        return 'dinersclub';
      case 'discover':
        return 'discover';
      case 'elo':
        return 'elo';
      case 'hipercard':
        return 'hipercard';
      default:
        return 'unknown';
    }
  } catch (error) {
    console.error('Erro ao detectar bandeira do cartão:', error);
    return 'unknown';
  }
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

export default function Cards() {
  const { theme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [bankName, setBankName] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardType, setCardType] = useState('credit'); // 'credit' ou 'debit'
  const [selectedType, setSelectedType] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#b687fe');
  const [secondaryColor, setSecondaryColor] = useState('#8B5CF6');
  
  // Estados para dados reais
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardTransactions, setCardTransactions] = useState<CardTransaction[]>([]);
  const [addingCard, setAddingCard] = useState(false);

  // Função para carregar cartões
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

  // useEffect para carregar o tema com base no gênero do usuário
  useEffect(() => {
    fetchUserTheme();
    loadCards();
  }, []);

  // useEffect para atualizar as cores padrão quando o tema mudar
  useEffect(() => {
    setPrimaryColor(theme.colors.primary);
    setSecondaryColor(theme.colors.secondary);
  }, [theme]);

  // Função para buscar o tema baseado no perfil do usuário
  const fetchUserTheme = async () => {
    try {
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao obter sessão:', sessionError);
        return;
      }
      
      if (!session?.user) {
        console.log('Nenhuma sessão de usuário encontrada');
        return;
      }
      
      const userId = session.user.id;
      
      // Buscar o perfil do usuário atual
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('gender')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Erro ao buscar perfil do usuário:', userError);
        return;
      }
      
      console.log('Perfil do usuário obtido do banco:', userProfile);
      
      // Definir o tema com base no gênero do usuário
      if (userProfile && userProfile.gender) {
        const gender = userProfile.gender.toLowerCase();
        
        if (gender === 'masculino' || gender === 'homem' || gender === 'male' || gender === 'm') {
          console.log('Aplicando tema masculino (azul) com base no perfil');
          updateTheme('masculine');
        } else if (gender === 'feminino' || gender === 'mulher' || gender === 'female' || gender === 'f') {
          console.log('Aplicando tema feminino (rosa) com base no perfil');
          updateTheme('feminine');
        } else {
          // Se o gênero no perfil não for reconhecido, tentar obter dos metadados da sessão
          const userMetadata = session.user.user_metadata;
          const metadataGender = userMetadata?.gender || '';
          
          console.log('Verificando gênero dos metadados:', metadataGender);
          
          if (metadataGender && typeof metadataGender === 'string') {
            const metaGenderLower = metadataGender.toLowerCase();
            
            if (metaGenderLower === 'masculino' || metaGenderLower === 'homem' || 
                metaGenderLower === 'male' || metaGenderLower === 'm') {
              console.log('Aplicando tema masculino (azul) com base nos metadados');
              updateTheme('masculine');
            } else if (metaGenderLower === 'feminino' || metaGenderLower === 'mulher' || 
                       metaGenderLower === 'female' || metaGenderLower === 'f') {
              console.log('Aplicando tema feminino (rosa) com base nos metadados');
              updateTheme('feminine');
            } else {
              // Usar o tema global ou padrão se o gênero nos metadados também não for reconhecido
              if (global.dashboardTheme === 'masculine') {
                updateTheme('masculine');
                console.log('Aplicando tema masculino (azul) da variável global');
              } else {
                updateTheme('feminine');
                console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
              }
            }
          } else {
            // Usar o tema global ou padrão se não houver gênero nos metadados
            if (global.dashboardTheme === 'masculine') {
              updateTheme('masculine');
              console.log('Aplicando tema masculino (azul) da variável global');
            } else {
              updateTheme('feminine');
              console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
            }
          }
        }
      } else {
        // Se não encontrou perfil ou gênero no perfil, tentar obter dos metadados da sessão
        const userMetadata = session.user.user_metadata;
        const metadataGender = userMetadata?.gender || '';
        
        console.log('Perfil não encontrado. Verificando gênero dos metadados:', metadataGender);
        
        if (metadataGender && typeof metadataGender === 'string') {
          const metaGenderLower = metadataGender.toLowerCase();
          
          if (metaGenderLower === 'masculino' || metaGenderLower === 'homem' || 
              metaGenderLower === 'male' || metaGenderLower === 'm') {
            console.log('Aplicando tema masculino (azul) com base nos metadados');
            updateTheme('masculine');
          } else if (metaGenderLower === 'feminino' || metaGenderLower === 'mulher' || 
                     metaGenderLower === 'female' || metaGenderLower === 'f') {
            console.log('Aplicando tema feminino (rosa) com base nos metadados');
            updateTheme('feminine');
          } else {
            // Usar o tema global ou padrão se o gênero nos metadados não for reconhecido
            if (global.dashboardTheme === 'masculine') {
              updateTheme('masculine');
              console.log('Aplicando tema masculino (azul) da variável global');
            } else {
              updateTheme('feminine');
              console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
            }
          }
        } else {
          // Usar o tema global ou padrão se não houver gênero nos metadados
          if (global.dashboardTheme === 'masculine') {
            updateTheme('masculine');
            console.log('Aplicando tema masculino (azul) da variável global');
          } else {
            updateTheme('feminine');
            console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao definir tema:', error);
    }
  };

  // Função para salvar o tema no AsyncStorage
  const saveThemeToStorage = async (themeValue: string) => {
    try {
      await AsyncStorage.setItem('@MyFinlove:theme', themeValue);
      console.log('Tema salvo no AsyncStorage:', themeValue);
    } catch (error) {
      console.error('Erro ao salvar tema no AsyncStorage:', error);
    }
  };

  // Função para atualizar o tema e garantir que seja persistido
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

  // useEffect para carregar o tema do AsyncStorage no início, caso não esteja definido globalmente
  useEffect(() => {
    const loadThemeFromStorage = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@MyFinlove:theme');
        if (storedTheme === 'masculine' && theme !== themes.masculine) {
          updateTheme('masculine');
        } else if (storedTheme === 'feminine' && theme !== themes.feminine) {
          updateTheme('feminine');
        }
      } catch (error) {
        console.error('Erro ao carregar tema do AsyncStorage:', error);
      }
    };
    
    loadThemeFromStorage();
  }, []);

  // Função para adicionar cartão
  const handleAddCard = async () => {
    if (!bankName.trim() || !cardNumber.trim() || !cardName.trim() || !cardLimit.trim()) {
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
        cardholder_name: cardName.trim(),
        card_limit: numericLimit,
        card_type: cardType,
        brand: detectedBrand,
        user_id: 'current-user' // Substituir pela ID do usuário logado
      };

      await cardsService.createCard(newCard);
      
      // Limpar formulário
      setBankName('');
      setCardNumber('');
      setCardName('');
      setCardLimit('');
      setCardType('credit');
      
      setIsModalVisible(false);
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
            onPress={() => setIsModalVisible(true)}
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
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
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
                  <TouchableOpacity onPress={() => setIsModalVisible(false)}>
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
                      value={cardName}
                      onChangeText={setCardName}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    marginBottom: 80,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#131313',
  },
  cardsScroll: {
    paddingLeft: 16,
  },
  cardsContainer: {
    paddingRight: 16,
    paddingVertical: 16,
  },
  addCardButton: {
    width: cardWidth * 0.8,
    height: cardHeight,
    backgroundColor: '#f5f7fa',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderStyle: 'dashed',
    padding: 12,
  },
  card: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardType: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBalance: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 8,
    letterSpacing: 0.5,
  },
  cardNumber: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
    letterSpacing: 2,
  },
  transactionSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  transactionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#131313',
  },
  filterButton: {
    padding: 8,
  },
  filterDots: {
    flexDirection: 'row',
    gap: 4,
  },
  filterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f7fa',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionIconText: {
    fontSize: 24,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    color: '#131313',
    marginBottom: 4,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#131313',
  },
  closeButton: {
    padding: 8,
  },
  cardTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f7fa',
    marginHorizontal: 8,
  },
  selectedCardType: {
    backgroundColor: '#b687fe',
  },
  cardTypeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectedCardTypeText: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#131313',
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  addButton: {
    marginTop: -30,
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#b687fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginTop: 8,
  },
  viewDetailsText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  viewDetailsIcon: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDetailsIconText: {
    fontSize: 16,
  },
  addCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardText: {
    color: '#b687fe',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  addCardModalButton: {
    backgroundColor: '#b687fe',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    width: 60,
  },
  navText: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#999',
    marginTop: 4,
  },
  menuModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuModalContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  menuGrid: {
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  menuItem: {
    width: '30%',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItemTitle: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    textAlign: 'center',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    textAlign: 'center',
    opacity: 0.8,
  },
  closeFullButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeFullButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  colorSection: {
    marginBottom: 24,
  },
  colorSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#131313',
    marginBottom: 8,
  },
  colorSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  colorSelectorContainer: {
    width: '48%',
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#131313',
    marginBottom: 12,
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 4,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    marginRight: 4,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  colorCheckmark: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCheckmarkText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#333',
  },
  gradientPreviewContainer: {
    marginBottom: 24,
  },
  gradientPreview: {
    height: 190,
    borderRadius: 16,
    padding: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  previewCardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  previewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewCardType: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewCardBalance: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 8,
    letterSpacing: 0.5,
  },
  previewCardNumber: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
    letterSpacing: 2,
  },
  previewCardName: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
    letterSpacing: 2,
  },
  modalScrollView: {
    flex: 1,
    marginBottom: 24,
  },
  detectedBrandContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f7fa',
    borderRadius: 8,
  },
  detectedBrandText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  cardNumberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    marginBottom: 16,
  },
  cardBrandIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNumberInput: {
    flex: 1,
    backgroundColor: 'transparent',
    marginBottom: 0,
  },
  cardNumberInputWithIcon: {
    paddingLeft: 48,
  },
}); 