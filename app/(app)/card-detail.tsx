import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Animated, AppState, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ArrowLeft, Edit, X, CreditCard } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/lib/supabase';
import { cardsService, Card, CardTransaction } from '@/lib/services/cardsService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

// Componentes SVG para ícones das bandeiras
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
const cardWidth = width - 40;

// Declaração global para o tema
declare global {
  var dashboardTheme: 'feminine' | 'masculine' | undefined;
}

// Definição dos temas baseados no gênero
const themes = {
  feminine: {
    primary: '#b687fe',
    primaryGradient: ['#b687fe', '#9157ec'],
    secondary: '#0073ea',
    secondaryGradient: ['#0073ea', '#0056b3'],
    card: '#ffffff',
    text: '#333333',
    background: '#f8f9fa',
    income: '#22c55e',
    expense: '#ef4444'
  },
  masculine: {
    primary: '#0073ea',
    primaryGradient: ['#0073ea', '#0056b3'],
    secondary: '#b687fe',
    secondaryGradient: ['#b687fe', '#9157ec'],
    card: '#ffffff',
    text: '#333333',
    background: '#f8f9fa',
    income: '#22c55e',
    expense: '#ef4444'
  }
};

// Função para obter o tema inicial
const getInitialTheme = () => {
  // Verificar primeiro se há um tema global definido
  if (global.dashboardTheme === 'masculine') {
    return themes.masculine;
  } else if (global.dashboardTheme === 'feminine') {
    return themes.feminine;
  }
  
  // Se não houver tema global, usar um tema neutro temporário
  return themes.feminine; // Será atualizado rapidamente pelo AsyncStorage
};

export default function CardDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Estados
  const [theme, setTheme] = useState(getInitialTheme());
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCard, setEditingCard] = useState(false);
  
  // Estados para edição do cartão
  const [editCardName, setEditCardName] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editCardLimit, setEditCardLimit] = useState('');
  const [editCardExpiryDate, setEditCardExpiryDate] = useState('');
  const [editCardType, setEditCardType] = useState('credit');
  const [editCardBrand, setEditCardBrand] = useState('');
  const [editPrimaryColor, setEditPrimaryColor] = useState('#b687fe');
  const [editSecondaryColor, setEditSecondaryColor] = useState('#8B5CF6');
  
  const [weekData, setWeekData] = useState([
    { day: 'Seg', value: 0 },
    { day: 'Ter', value: 0 },
    { day: 'Qua', value: 0 },
    { day: 'Qui', value: 0 },
    { day: 'Sex', value: 0 },
    { day: 'Sáb', value: 0 },
    { day: 'Dom', value: 0 },
  ]);

  // Carregar tema do AsyncStorage no início
  useEffect(() => {
    const loadThemeFromStorage = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@MyFinlove:theme');
        if (storedTheme === 'masculine') {
          setTheme(themes.masculine);
          global.dashboardTheme = 'masculine';
        } else if (storedTheme === 'feminine') {
          setTheme(themes.feminine);
          global.dashboardTheme = 'feminine';
        } else {
          // Se não há tema salvo, usar o tema global ou padrão
          if (global.dashboardTheme === 'masculine') {
            setTheme(themes.masculine);
          } else {
            setTheme(themes.feminine);
          }
        }
        setThemeLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar tema do AsyncStorage:', error);
        setThemeLoaded(true);
      }
    };
    
    loadThemeFromStorage();
    
    // Configurar listener para detectar quando o app volta ao primeiro plano
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        loadThemeFromStorage();
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, []);

  // useEffect para carregar o tema com base no gênero do usuário
  useEffect(() => {
    if (themeLoaded) {
      fetchUserTheme();
    }
    loadCardData();
  }, [themeLoaded]);

  // useEffect para atualizar as cores padrão quando o tema mudar
  useEffect(() => {
    // Atualizar cores quando o tema mudar
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

  // Carregar dados do cartão
  const loadCardData = async () => {
    try {
      setLoading(true);
      
      // Se temos um ID específico do cartão, buscar esse cartão
      const cardId = params.cardId as string;
      
      if (cardId) {
        // Buscar cartão específico
        const selectedCard = await cardsService.getCardById(cardId);
        
        if (selectedCard) {
          setCard(selectedCard);
          
          // Buscar transações do cartão
          const cardTransactions = await cardsService.getCardTransactions(cardId, 20);
          setTransactions(cardTransactions);
          
          // Processar dados da semana baseado nas transações
          processWeeklyData(cardTransactions);
        }
      } else {
        // Se não tem ID específico, pegar o primeiro cartão do usuário
        const userCards = await cardsService.getUserCards();
        
        if (userCards.length > 0) {
          const firstCard = userCards[0];
          setCard(firstCard);
          
          // Buscar transações do primeiro cartão
          const cardTransactions = await cardsService.getCardTransactions(firstCard.id, 20);
          setTransactions(cardTransactions);
          
          // Processar dados da semana baseado nas transações
          processWeeklyData(cardTransactions);
        } else {
          // Se não há cartões, usar dados mock
          setCard(null);
          setTransactions([]);
          setWeekData([
            { day: 'Seg', value: 31 },
            { day: 'Ter', value: 27 },
            { day: 'Qua', value: 39 },
            { day: 'Qui', value: 14 },
            { day: 'Sex', value: 28 },
            { day: 'Sáb', value: 24 },
            { day: 'Dom', value: 33 },
          ]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do cartão:', error);
      // Em caso de erro, usar dados mock
      setCard(null);
      setTransactions([]);
      setWeekData([
        { day: 'Seg', value: 31 },
        { day: 'Ter', value: 27 },
        { day: 'Qua', value: 39 },
        { day: 'Qui', value: 14 },
        { day: 'Sex', value: 28 },
        { day: 'Sáb', value: 24 },
        { day: 'Dom', value: 33 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Processar dados semanais baseado nas transações
  const processWeeklyData = (transactions: CardTransaction[]) => {
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weeklyExpenses = [0, 0, 0, 0, 0, 0, 0]; // Dom a Sáb
    
    // Filtrar transações da última semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      
      if (transactionDate >= oneWeekAgo && transaction.transaction_type === 'expense') {
        const dayOfWeek = transactionDate.getDay(); // 0 = Dom, 1 = Seg, etc.
        weeklyExpenses[dayOfWeek] += transaction.amount;
      }
    });
    
    // Converter para o formato esperado (Seg a Dom)
    const formattedWeekData = [
      { day: 'Seg', value: Math.round(weeklyExpenses[1]) },
      { day: 'Ter', value: Math.round(weeklyExpenses[2]) },
      { day: 'Qua', value: Math.round(weeklyExpenses[3]) },
      { day: 'Qui', value: Math.round(weeklyExpenses[4]) },
      { day: 'Sex', value: Math.round(weeklyExpenses[5]) },
      { day: 'Sáb', value: Math.round(weeklyExpenses[6]) },
      { day: 'Dom', value: Math.round(weeklyExpenses[0]) },
    ];
    
    setWeekData(formattedWeekData);
  };

  // Funções para edição do cartão
  const openEditModal = () => {
    if (card) {
      setEditCardName(card.card_holder_name);
      setEditBankName(card.bank_name);
      setEditCardLimit(card.credit_limit.toString());
      setEditCardExpiryDate(card.expiry_date || '');
      setEditCardType(card.is_credit ? 'credit' : 'debit');
      setEditCardBrand(card.card_type);
      setEditPrimaryColor(card.primary_color);
      setEditSecondaryColor(card.secondary_color);
      setShowEditModal(true);
    }
  };

  const handleEditCard = async () => {
    if (!card || !editBankName || !editCardName || !editCardLimit || !editCardExpiryDate || !editCardBrand) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos');
      return;
    }

    try {
      setEditingCard(true);
      
      const updatedCard = await cardsService.updateCard(card.id, {
        card_holder_name: editCardName,
        bank_name: editBankName,
        card_type: editCardBrand,
        is_credit: editCardType === 'credit',
        credit_limit: parseFloat(editCardLimit.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        primary_color: editPrimaryColor,
        secondary_color: editSecondaryColor,
        expiry_date: editCardExpiryDate,
      });

      setCard(updatedCard);
      setShowEditModal(false);
      Alert.alert('Sucesso', 'Cartão atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o cartão');
    } finally {
      setEditingCard(false);
    }
  };

  const handleBack = () => {
    router.push('/(app)/cards');
  };

  // Calcular estatísticas
  const calculateStats = () => {
    const currentWeekExpenses = transactions
      .filter(t => {
        const transactionDate = new Date(t.transaction_date);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return transactionDate >= oneWeekAgo && t.transaction_type === 'expense';
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const currentWeekIncome = transactions
      .filter(t => {
        const transactionDate = new Date(t.transaction_date);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return transactionDate >= oneWeekAgo && t.transaction_type === 'income';
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      expenses: currentWeekExpenses,
      income: currentWeekIncome
    };
  };

  const stats = calculateStats();
  const maxValue = Math.max(...weekData.map(item => item.value));
  const maxIndex = weekData.findIndex(item => item.value === maxValue);

  // Referências para animação
  const barAnimations = useRef(weekData.map(() => new Animated.Value(0))).current;
  
  // Animar as barras quando o componente montar
  useEffect(() => {
    Animated.stagger(100, 
      barAnimations.map(anim => 
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      )
    ).start();
  }, [weekData]);

  // Calcular média e gasto total
  const mediaGasto = Math.round(weekData.reduce((acc, item) => acc + item.value, 0) / weekData.length);
  const gastoTotal = weekData.reduce((acc, item) => acc + item.value, 0);

  // Não renderizar nada até que o tema seja carregado
  if (!themeLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: '#f8f9fa' }]}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={global.dashboardTheme === 'masculine' ? '#0073ea' : '#b687fe'} />
          <Text style={[styles.loadingText, { color: '#333333' }]}>Carregando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Cartão</Text>
      </View>

      {loading ? (
        // Tela de loading
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Carregando dados do cartão...</Text>
        </View>
      ) : (
        // Conteúdo principal
        <CardContent 
          card={card}
          transactions={transactions}
          weekData={weekData}
          stats={stats}
          theme={theme}
          maxValue={maxValue}
          barAnimations={barAnimations}
          openEditModal={openEditModal}
        />
      )}

      {/* Modal de Edição do Cartão */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Cartão</Text>
              <TouchableOpacity 
                onPress={() => setShowEditModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <TextInput
                style={styles.input}
                placeholder="Nome do Banco"
                value={editBankName}
                onChangeText={setEditBankName}
                autoCapitalize="characters"
                placeholderTextColor="#666"
              />



              {/* Seletor de Bandeira do Cartão */}
              <View style={styles.cardBrandSection}>
                <Text style={styles.cardBrandLabel}>Bandeira do Cartão</Text>
                <View style={styles.cardBrandOptions}>
                  <TouchableOpacity
                    style={[
                      styles.cardBrandOption,
                      editCardBrand === 'visa' && [styles.selectedCardBrand, { backgroundColor: theme.primary }]
                    ]}
                    onPress={() => setEditCardBrand('visa')}
                  >
                    <VisaIcon />
                    <Text style={[
                      styles.cardBrandText,
                      editCardBrand === 'visa' && styles.selectedCardBrandText
                    ]}>Visa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cardBrandOption,
                      editCardBrand === 'mastercard' && [styles.selectedCardBrand, { backgroundColor: theme.primary }]
                    ]}
                    onPress={() => setEditCardBrand('mastercard')}
                  >
                    <MastercardIcon />
                    <Text style={[
                      styles.cardBrandText,
                      editCardBrand === 'mastercard' && styles.selectedCardBrandText
                    ]}>Mastercard</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cardBrandOption,
                      editCardBrand === 'elo' && [styles.selectedCardBrand, { backgroundColor: theme.primary }]
                    ]}
                    onPress={() => setEditCardBrand('elo')}
                  >
                    <EloIcon />
                    <Text style={[
                      styles.cardBrandText,
                      editCardBrand === 'elo' && styles.selectedCardBrandText
                    ]}>Elo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cardBrandOption,
                      editCardBrand === 'american_express' && [styles.selectedCardBrand, { backgroundColor: theme.primary }]
                    ]}
                    onPress={() => setEditCardBrand('american_express')}
                  >
                    <AmexIcon />
                    <Text style={[
                      styles.cardBrandText,
                      editCardBrand === 'american_express' && styles.selectedCardBrandText
                    ]}>American Express</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Nome no Cartão"
                value={editCardName}
                onChangeText={setEditCardName}
                autoCapitalize="characters"
                placeholderTextColor="#666"
              />

              <TextInput
                style={styles.input}
                placeholder="Data de Vencimento (MM/AA)"
                value={editCardExpiryDate}
                onChangeText={(text) => {
                  // Remove tudo que não é número
                  const numericValue = text.replace(/[^0-9]/g, '');
                  // Aplica máscara MM/AA
                  let formattedValue = '';
                  if (numericValue.length >= 1) {
                    formattedValue = numericValue.substring(0, 2);
                    if (numericValue.length >= 3) {
                      formattedValue += '/' + numericValue.substring(2, 4);
                    }
                  }
                  setEditCardExpiryDate(formattedValue);
                }}
                keyboardType="numeric"
                maxLength={5}
                placeholderTextColor="#666"
              />

              <TextInput
                style={styles.input}
                placeholder="Limite do Cartão (R$)"
                value={editCardLimit}
                onChangeText={(text) => {
                  // Remove tudo que não é número
                  const numericValue = text.replace(/[^0-9]/g, '');
                  // Formata como moeda brasileira
                  if (numericValue) {
                    const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    });
                    setEditCardLimit(formattedValue);
                  } else {
                    setEditCardLimit('');
                  }
                }}
                keyboardType="numeric"
                placeholderTextColor="#666"
              />

              <View style={styles.rowInputs}>
                <TouchableOpacity
                  style={[
                    styles.cardTypeOption, 
                    { flex: 1, marginRight: 8 },
                    editCardType === 'credit' && [styles.selectedCardType, { backgroundColor: theme.primary }]
                  ]}
                  onPress={() => setEditCardType('credit')}
                >
                  <Text style={[
                    styles.cardTypeText,
                    editCardType === 'credit' && styles.selectedCardTypeText
                  ]}>Crédito</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.cardTypeOption, 
                    { flex: 1, marginLeft: 8, width: 0 },
                    editCardType === 'debit' && [styles.selectedCardType, { backgroundColor: theme.primary }]
                  ]}
                  onPress={() => setEditCardType('debit')}
                >
                  <Text style={[
                    styles.cardTypeText,
                    editCardType === 'debit' && styles.selectedCardTypeText
                  ]}>Débito</Text>
                </TouchableOpacity>
              </View>

              {/* Seletor de Cores */}
              <View style={styles.colorSection}>
                <Text style={styles.colorSectionTitle}>Cores do Cartão</Text>
                
                <View style={styles.colorSelectors}>
                  <View style={styles.colorSelectorContainer}>
                    <Text style={styles.colorLabel}>Cor Principal</Text>
                    <View style={styles.colorOptions}>
                      {[
                        '#b687fe', '#8B5CF6', '#0073ea', '#3c79e6',
                        '#FF3B30', '#FF9500', '#34C759', '#00C7BE',
                        '#5856D6', '#AF52DE', '#FF2D92', '#A2845E'
                      ].map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            editPrimaryColor === color && styles.selectedColorOption
                          ]}
                          onPress={() => setEditPrimaryColor(color)}
                        >
                          {editPrimaryColor === color && (
                            <View style={styles.colorCheckmark}>
                              <Text style={styles.colorCheckmarkText}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.colorSelectorContainer}>
                    <Text style={styles.colorLabel}>Cor Secundária</Text>
                    <View style={styles.colorOptions}>
                      {[
                        '#8B5CF6', '#b687fe', '#3c79e6', '#0073ea',
                        '#FF6B35', '#FFB800', '#30D158', '#40E0D0',
                        '#7C3AED', '#C77DFF', '#FF69B4', '#D2691E'
                      ].map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            editSecondaryColor === color && styles.selectedColorOption
                          ]}
                          onPress={() => setEditSecondaryColor(color)}
                        >
                          {editSecondaryColor === color && (
                            <View style={styles.colorCheckmark}>
                              <Text style={styles.colorCheckmarkText}>✓</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Preview do Gradiente */}
                <View style={styles.gradientPreviewContainer}>
                  <Text style={styles.colorLabel}>Preview do Cartão</Text>
                  <LinearGradient
                    colors={[editPrimaryColor, editSecondaryColor]}
                    style={styles.gradientPreview}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.previewCardContent}>
                      <View style={styles.previewCardHeader}>
                        <CreditCard size={20} color="#ffffff" />
                        <Text style={styles.previewCardType}>
                          {editCardBrand ? editCardBrand.toUpperCase().replace('_', ' ') : 'CARTÃO'}
                        </Text>
                      </View>
                      <Text style={styles.previewCardBalance}>
                        {editCardLimit || 'R$ 0,00'}
                      </Text>
                      <Text style={styles.previewCardNumber}>
                        **** **** **** ****
                      </Text>
                      <Text style={styles.previewCardName}>
                        {editBankName || 'NOME DO BANCO'}
                      </Text>
                      <Text style={styles.previewCardExpiry}>
                        {editCardExpiryDate || 'MM/AA'}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={[
                styles.addCardModalButton, 
                { 
                  backgroundColor: editingCard ? '#ccc' : theme.primary,
                  opacity: editingCard ? 0.7 : 1
                }
              ]}
              onPress={handleEditCard}
              disabled={editingCard}
            >
              {editingCard ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.addButtonText}>Atualizando...</Text>
                </View>
              ) : (
                <Text style={styles.addButtonText}>Atualizar Cartão</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <BottomNavigation theme={theme} />
    </View>
  );
}

// Componente separado para o conteúdo do cartão
const CardContent = ({ card, transactions, weekData, stats, theme, maxValue, barAnimations, openEditModal }) => {
  // Dados do cartão (real ou mock apenas se não há cartões)
  const cardData = card || {
    id: 'mock',
    name: 'Cartão Mock',
    card_holder_name: 'Usuário',
    bank_name: 'Banco Mock',
    card_type: 'visa' as const,
    is_credit: true,
    credit_limit: 2500,
    current_balance: 875.46,
    primary_color: theme.primary,
    secondary_color: theme.secondary,
    expiry_date: '12/25',
    is_active: true,
    owner_id: '',
    created_at: '',
    updated_at: ''
  };

  return (
    <ScrollView 
      style={styles.content} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Card */}
      <LinearGradient
        colors={[cardData.primary_color, cardData.secondary_color]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>Limite</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => openEditModal()}
          >
            <Edit size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardBalance}>
          R$ {cardData.available_limit?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
        </Text>
        <Text style={styles.cardNumber}>
          **** **** **** ****
        </Text>
        <Text style={styles.cardExpiry}>{cardData.bank_name}</Text>
      </LinearGradient>

      {/* Balance */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Limite do Cartão</Text>
        <View style={styles.limitContainer}>
          <View style={styles.limitItem}>
            <Text style={styles.limitSubLabel}>Disponível</Text>
            <Text style={[styles.balanceAmount, { color: theme.text }]}>
              R$ {cardData.available_limit?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </Text>
          </View>
          <View style={styles.limitItem}>
            <Text style={styles.limitSubLabel}>Utilizado</Text>
            <Text style={[styles.balanceAmount, { color: theme.expense }]}>
              R$ {cardData.current_balance?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </Text>
          </View>
        </View>
      </View>

      {/* Income/Expenditure */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.incomeCard]}>
          <View style={styles.statIcon}>
            <Text style={styles.plusIcon}>+</Text>
          </View>
          <View>
            <Text style={styles.statAmount}>R$ {stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</Text>
            <Text style={styles.statLabel}>Receitas</Text>
          </View>
        </View>

        <View style={[styles.statCard, styles.expenditureCard]}>
          <View style={[styles.statIcon, styles.expenditureIcon]}>
            <Text style={styles.minusIcon}>-</Text>
          </View>
          <View>
            <Text style={styles.statAmount}>R$ {stats.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</Text>
            <Text style={styles.statLabel}>Despesas</Text>
          </View>
        </View>
      </View>

      {/* Weekly Chart */}
      <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: theme.text }]}>Gastos Semanais</Text>
        </View>
        
        <View style={styles.chartWrapper}>
          <View style={styles.chart}>
            {/* Linhas de grade horizontais */}
            <View style={styles.gridLines}>
              {[0, 1, 2].map((_, index) => (
                <View key={index} style={styles.gridLine} />
              ))}
            </View>
            
            {weekData.map((item, index) => {
              // Destacar apenas o valor máximo
              const isMax = item.value === maxValue;
              
              return (
                <View key={index} style={styles.chartColumn}>
                  <View style={styles.barContainer}>
                    <Animated.View 
                      style={[
                        styles.bar, 
                        { 
                          backgroundColor: theme.primary,
                          height: maxValue > 0 ? (item.value / maxValue) * 120 : 0,
                          transform: [
                            { scaleY: barAnimations[index] }
                          ],
                          opacity: barAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.4, 1]
                          })
                        },
                        isMax && { backgroundColor: theme.secondary }
                      ]}
                    />
                  </View>
                  <Text style={styles.chartLabel}>{item.day}</Text>
                  <Text style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: '#333333'
                  }}>R$ {item.value}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Card History Button */}
      <TouchableOpacity 
        style={[styles.historyButton, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/(app)/card-history')}
      >
        <Text style={styles.historyButtonText}>Histórico do Cartão</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  card: {
    width: cardWidth,
    height: cardWidth * 0.6,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  cardLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 6,
  },
  cardBalance: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  cardNumber: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    letterSpacing: 2,
    marginBottom: 6,
  },
  cardExpiry: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  balanceSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '600',
  },
  limitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  limitItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  limitSubLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    width: '48%',
  },
  incomeCard: {
    backgroundColor: '#f0fdf4',
  },
  expenditureCard: {
    backgroundColor: '#fef2f2',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  expenditureIcon: {
    backgroundColor: '#ef4444',
  },
  plusIcon: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  minusIcon: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  statAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  chartContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  chartWrapper: {
    paddingHorizontal: 8,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 10,
    paddingBottom: 10,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 50,
    justifyContent: 'space-between',
    zIndex: 0,
  },
  gridLine: {
    height: 1,
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
  chartColumn: {
    alignItems: 'center',
    width: '13%',
    zIndex: 1,
  },
  barContainer: {
    height: 130,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: 18,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  chartLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 10,
    marginBottom: 3,
    fontWeight: '500',
  },
  chartValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  historyButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 32,
  },
  historyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  // Estilos para o botão de edição
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Estilos para o modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
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
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    flex: 1,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#131313',
    marginBottom: 16,
  },
  // Estilos para seleção de bandeira do cartão
  cardBrandSection: {
    marginBottom: 24,
  },
  cardBrandLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#131313',
    marginBottom: 12,
  },
  cardBrandOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardBrandOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f5f7fa',
    marginBottom: 8,
  },
  selectedCardBrand: {
    backgroundColor: '#b687fe',
  },
  cardBrandText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCardBrandText: {
    color: '#ffffff',
  },
  // Estilos para tipo de cartão
  rowInputs: {
    flexDirection: 'row',
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
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectedCardTypeText: {
    color: '#ffffff',
  },
  // Estilos para seleção de cores
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
  // Estilos para preview do cartão
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
  previewCardExpiry: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.8,
    letterSpacing: 1,
    marginTop: 4,
  },
  addCardModalButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
}); 