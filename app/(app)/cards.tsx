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
import { validateCardNumber, validateExpiryDate, validateCVV, formatCardNumber, formatExpiryDate, getCardType } from '@/lib/utils/cardValidation';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.6;
const cardHeight = cardWidth * 0.6;

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

export default function Cards() {
  const [theme, setTheme] = useState(getInitialTheme());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#b687fe');
  const [secondaryColor, setSecondaryColor] = useState('#8B5CF6');
  
  // Novos estados para dados reais
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardTransactions, setCardTransactions] = useState<CardTransaction[]>([]);
  const [addingCard, setAddingCard] = useState(false);

  // useEffect para carregar o tema com base no gênero do usuário
  useEffect(() => {
    fetchUserTheme();
    loadUserCards();
  }, []);

  // useEffect para atualizar as cores padrão quando o tema mudar
  useEffect(() => {
    setPrimaryColor(theme.primary);
    setSecondaryColor(theme.secondary);
  }, [theme]);

  // Carregar cartões do usuário
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

  // Implementar função de adicionar cartão real
  const handleAddCard = async () => {
    if (!cardNumber || !cardName || !expiryDate || !cvv || !selectedType) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos');
      return;
    }

    // Validações
    if (!validateCardNumber(cardNumber)) {
      Alert.alert('Erro', 'Número do cartão inválido');
      return;
    }

    if (!validateExpiryDate(expiryDate)) {
      Alert.alert('Erro', 'Data de validade inválida');
      return;
    }

    if (!validateCVV(cvv)) {
      Alert.alert('Erro', 'CVV inválido');
      return;
    }
    
    try {
      setAddingCard(true);
      const newCard = await cardsService.createCard({
        name: `Cartão ${selectedType}`,
        card_number: cardNumber,
        card_holder_name: cardName,
        expiry_date: expiryDate,
        cvv: cvv,
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
    } finally {
      setAddingCard(false);
    }
  };

  const resetForm = () => {
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
    setSelectedType('');
    setPrimaryColor(theme.primary);
    setSecondaryColor(theme.secondary);
  };

  // Função para formatar entrada do número do cartão
  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
    
    // Auto-detectar tipo do cartão
    const detectedType = getCardType(formatted);
    if (detectedType && !selectedType) {
      setSelectedType(detectedType);
    }
  };

  // Função para formatar entrada da data de validade
  const handleExpiryDateChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    setExpiryDate(formatted);
  };

  // Renderizar cartão individual
  const renderCard = (card: Card, index: number) => (
    <LinearGradient
      key={card.id}
      colors={[card.primary_color, card.secondary_color]}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={() => router.push('/(app)/card-detail')}
      >
        <View style={styles.cardHeader}>
          <CreditCard size={24} color="#ffffff" />
          <Text style={styles.cardType}>{card.card_type.toUpperCase()}</Text>
        </View>
        <Text style={styles.cardBalance}>
          {card.is_credit ? `Disponível: R$ ${card.available_limit.toFixed(2)}` : `R$ ${card.current_balance.toFixed(2)}`}
        </Text>
        <Text style={styles.cardNumber}>{cardsService.formatCardNumber(card.card_number)}</Text>
        <View style={styles.viewDetailsContainer}>
          <Text style={styles.viewDetailsText}>Toque para ver detalhes</Text>
          <View style={styles.viewDetailsIcon}>
            <Text style={styles.viewDetailsIconText}>👆</Text>
          </View>
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Carregando cartões...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Cartões</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
          decelerationRate="fast"
          snapToInterval={cardWidth + 16}
          style={styles.cardsScroll}
        >
          <TouchableOpacity 
            style={styles.addCardButton}
            onPress={() => setIsModalVisible(true)}
          >
            <View style={styles.addCardContent}>
              <Plus size={20} color={theme.primary} />
              <Text style={[styles.addCardText, { color: theme.primary }]}>Adicionar novo cartão</Text>
            </View>
          </TouchableOpacity>

          {cards.map((card) => renderCard(card, 0))}
        </ScrollView>

        <View style={styles.transactionsSection}>
          <View style={styles.transactionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Histórico de Transações</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/card-history')}>
              <BarChart size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {cardTransactions.length > 0 ? (
            cardTransactions.map((transaction) => (
              <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
                <View style={[styles.transactionIcon, { backgroundColor: transaction.transaction_type === 'income' ? '#E3F5FF' : '#FFE2E6' }]}>
                  <Text style={styles.transactionIconText}>{transaction.icon || (transaction.transaction_type === 'income' ? '💳' : '🛍️')}</Text>
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={[styles.transactionTitle, { color: theme.text }]}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>{new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}</Text>
                </View>
                <Text style={[
                  styles.transactionAmount, 
                  { color: transaction.transaction_type === 'income' ? theme.income : theme.expense }
                ]}>
                  {transaction.transaction_type === 'income' ? '+' : '-'}R$ {Math.abs(transaction.amount).toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyTransactions}>
              <Text style={[styles.emptyTransactionsText, { color: theme.text }]}>
                Nenhuma transação encontrada
              </Text>
              <Text style={styles.emptyTransactionsSubtext}>
                As transações dos seus cartões aparecerão aqui
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card }]}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(app)/dashboard')}
        >
          <Home size={24} color="#666" />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setMenuModalVisible(true)}
        >
          <Menu size={24} color="#666" />
          <Text style={styles.navText}>Menu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, styles.centerNavItem]}
          onPress={() => router.push('/(app)/registers')}
        >
          <View style={[styles.centerNavButton, { backgroundColor: theme.primary }]}>
            <PlusCircle size={28} color="#ffffff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(app)/notifications')}
        >
          <Bell size={24} color="#666" />
          <Text style={styles.navText}>Notificações</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <CreditCard size={24} color={theme.primary} />
          <Text style={[styles.navText, { color: theme.primary }]}>Cartões</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Adicionar Cartão */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Novo Cartão</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
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
              {/* Preview do Cartão */}
              <View style={styles.previewSection}>
                <Text style={styles.previewTitle}>Preview do Cartão</Text>
                <LinearGradient
                  colors={[primaryColor, secondaryColor]}
                  style={styles.gradientPreview}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.previewCardHeader}>
                    <CreditCard size={20} color="#ffffff" />
                    <Text style={styles.previewCardType}>
                      {selectedType ? selectedType.toUpperCase() : 'CARTÃO'}
                    </Text>
                  </View>
                  <Text style={styles.previewCardBalance}>R$ 1.000,00</Text>
                  <Text style={styles.previewCardNumber}>
                    {cardNumber || '**** **** **** ****'}
                  </Text>
                </LinearGradient>
              </View>

              {/* Seletor de Tipo */}
              <View style={styles.typeSection}>
                <Text style={styles.sectionLabel}>Tipo do Cartão</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      selectedType === 'mastercard' && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => setSelectedType('mastercard')}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      selectedType === 'mastercard' && { color: '#ffffff' }
                    ]}>Mastercard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeOption,
                      selectedType === 'visa' && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => setSelectedType('visa')}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      selectedType === 'visa' && { color: '#ffffff' }
                    ]}>Visa</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Campos do Formulário */}
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Informações do Cartão</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Número do Cartão"
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  keyboardType="numeric"
                  maxLength={19}
                  placeholderTextColor="#666"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Nome no Cartão"
                  value={cardName}
                  onChangeText={(text) => setCardName(text.toUpperCase())}
                  autoCapitalize="characters"
                  placeholderTextColor="#666"
                />
                
                <View style={styles.rowInputs}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    placeholder="Validade (MM/AA)"
                    value={expiryDate}
                    onChangeText={handleExpiryDateChange}
                    keyboardType="numeric"
                    maxLength={5}
                    placeholderTextColor="#666"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1, marginLeft: 8, width: 0 }]}
                    placeholder="CVV"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={3}
                    placeholderTextColor="#666"
                  />
                </View>
              </View>

              {/* Seletor de Cores */}
              <View style={styles.colorSection}>
                <Text style={styles.sectionLabel}>Cores do Cartão</Text>
                <View style={styles.colorPickers}>
                  <View style={styles.colorPickerGroup}>
                    <Text style={styles.colorLabel}>Cor Principal</Text>
                    <View style={styles.colorOptions}>
                      {['#b687fe', '#0073ea', '#FF3B30', '#4CD964', '#FF9500', '#8E8E93'].map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            primaryColor === color && styles.selectedColor
                          ]}
                          onPress={() => setPrimaryColor(color)}
                        />
                      ))}
                    </View>
                  </View>
                  
                  <View style={styles.colorPickerGroup}>
                    <Text style={styles.colorLabel}>Cor Secundária</Text>
                    <View style={styles.colorOptions}>
                      {['#8B5CF6', '#3c79e6', '#D70015', '#30B550', '#E6940A', '#6D6D70'].map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            secondaryColor === color && styles.selectedColor
                          ]}
                          onPress={() => setSecondaryColor(color)}
                        />
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Botões de Ação */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                onPress={handleAddCard}
                disabled={addingCard}
              >
                {addingCard ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.addButtonText}>Adicionar Cartão</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de Menu */}
      <Modal
        visible={menuModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <View style={styles.menuModalContainer}>
          <View style={styles.menuModalContent}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity 
                onPress={() => setMenuModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.menuGrid}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  router.push('/(app)/dashboard');
                }}
              >
                <Home size={24} color={theme.primary} />
                <Text style={[styles.menuItemText, { color: theme.text }]}>Dashboard</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  router.push('/(app)/registers');
                }}
              >
                <PlusCircle size={24} color={theme.primary} />
                <Text style={[styles.menuItemText, { color: theme.text }]}>Novo Registro</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setMenuModalVisible(false);
                  router.push('/(app)/notifications');
                }}
              >
                <Bell size={24} color={theme.primary} />
                <Text style={[styles.menuItemText, { color: theme.text }]}>Notificações</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <Receipt size={24} color={theme.primary} />
                <Text style={[styles.menuItemText, { color: theme.text }]}>Planejamento</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <CreditCard size={24} color={theme.primary} />
                <Text style={[styles.menuItemText, { color: theme.text }]}>Cartões</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <Wallet size={24} color={theme.primary} />
                <Text style={[styles.menuItemText, { color: theme.text }]}>Contas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <Info size={24} color={theme.primary} />
                <Text style={[styles.menuItemText, { color: theme.text }]}>Sobre</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <ExternalLink size={24} color={theme.primary} />
                <Text style={[styles.menuItemText, { color: theme.text }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: fontFallbacks.regular,
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTransactionsText: {
    fontSize: 16,
    fontFamily: fontFallbacks.medium,
    marginBottom: 8,
  },
  emptyTransactionsSubtext: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontFallbacks.regular,
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
  transactionsSection: {
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
  sectionTitle: {
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
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
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
    borderRadius: 20,
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
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#131313',
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    textAlign: 'center',
    marginBottom: 4,
  },
  previewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewCardType: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  previewCardBalance: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewCardNumber: {
    color: '#ffffff',
    fontSize: 16,
    letterSpacing: 2,
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
  modalScrollView: {
    flex: 1,
    marginBottom: 24,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#131313',
    marginBottom: 8,
  },
  typeSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#131313',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f7fa',
    marginHorizontal: 8,
  },
  typeOptionText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 24,
  },
  colorPickers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  colorPickerGroup: {
    width: '48%',
    marginBottom: 16,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f7fa',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  centerNavItem: {
    alignItems: 'center',
    width: 60,
  },
  centerNavButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  colorSection: {
    marginBottom: 24,
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
    gap: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginBottom: 8,
    marginRight: 8,
  },
}); 