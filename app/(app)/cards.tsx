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
  
  // Estados para dados reais
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
      } else {
        // Se não há cartões, usar transações mock para demonstração
        setCardTransactions(mockTransactions);
      }
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      // Em caso de erro, usar dados mock para não quebrar a interface
      setCardTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  // Dados mock para transações (mantido para quando não há cartões)
  const mockTransactions = [
    {
      id: '1',
      description: 'Apartamento',
      transaction_date: '2021-04-21',
      amount: 120,
      transaction_type: 'expense' as const,
      icon: '🏢'
    },
    {
      id: '2',
      description: 'Pagamento',
      transaction_date: '2021-04-18',
      amount: 150,
      transaction_type: 'income' as const,
      icon: '💳'
    },
    {
      id: '3',
      description: 'Compra Online',
      transaction_date: '2021-04-19',
      amount: 75,
      transaction_type: 'expense' as const,
      icon: '🛍️'
    },
    {
      id: '4',
      description: 'Pagamento',
      transaction_date: '2021-04-18',
      amount: 150,
      transaction_type: 'income' as const,
      icon: '💳'
    }
  ];

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
    
    try {
      setAddingCard(true);
      
      const newCard = await cardsService.createCard({
        name: `Cartão ${selectedType.toUpperCase()}`,
        card_number: cardNumber,
        card_holder_name: cardName,
        expiry_date: expiryDate,
        cvv: cvv,
        card_type: selectedType,
        is_credit: true,
        credit_limit: 1000,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
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

  // Função para formatar data de transação
  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

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

          {loading ? (
            <View style={[styles.card, { backgroundColor: '#f5f7fa', justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={{ marginTop: 8, color: '#666' }}>Carregando...</Text>
            </View>
          ) : (
            cards.map((card, index) => (
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
                    R$ {card.current_balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
            ))
          )}

          {/* Cartões mock para demonstração quando não há cartões reais */}
          {!loading && cards.length === 0 && (
            <>
              <LinearGradient
                colors={[theme.primary, theme.secondary]}
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
                    <Text style={styles.cardType}>mastercard</Text>
                  </View>
                  <Text style={styles.cardBalance}>R$ 875,46</Text>
                  <Text style={styles.cardNumber}>124 987 324 ***</Text>
                  <View style={styles.viewDetailsContainer}>
                    <Text style={styles.viewDetailsText}>Toque para ver detalhes</Text>
                    <View style={styles.viewDetailsIcon}>
                      <Text style={styles.viewDetailsIconText}>👆</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </LinearGradient>

              <LinearGradient
                colors={theme === themes.masculine ? [theme.shared, '#0056b3'] : ['#0073ea', '#0056b3']}
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
                    <Text style={styles.cardType}>VISA</Text>
                  </View>
                  <Text style={styles.cardBalance}>R$ 560,00</Text>
                  <Text style={styles.cardNumber}>753 926 768 ***</Text>
                  <View style={styles.viewDetailsContainer}>
                    <Text style={styles.viewDetailsText}>Toque para ver detalhes</Text>
                    <View style={styles.viewDetailsIcon}>
                      <Text style={styles.viewDetailsIconText}>👆</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            </>
          )}
        </ScrollView>

        <View style={styles.transactionSection}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionTitle}>Histórico de Transações</Text>
            <TouchableOpacity style={styles.filterButton}>
              <View style={styles.filterDots}>
                <View style={styles.filterDot} />
                <View style={styles.filterDot} />
              </View>
            </TouchableOpacity>
          </View>

          {cardTransactions.map((transaction) => (
            <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
              <View style={[styles.transactionIcon, { backgroundColor: transaction.transaction_type === 'expense' ? '#FFE2E6' : '#E3F5FF' }]}>
                <Text style={styles.transactionIconText}>{transaction.icon || (transaction.transaction_type === 'expense' ? '💸' : '💰')}</Text>
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionName}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>
                  {formatTransactionDate(transaction.transaction_date)}
                </Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.transaction_type === 'expense' ? theme.expense : theme.income }
              ]}>
                {transaction.transaction_type === 'expense' ? '-' : '+'}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(app)/dashboard')}
        >
          <BarChart size={24} color="#999" />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setMenuModalVisible(true)}
        >
          <Menu size={24} color="#999" />
          <Text style={styles.navText}>Menu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(app)/registers')}
        >
          <View style={[styles.addButtonInner, { backgroundColor: theme.primary }]}>
            <PlusCircle size={32} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push('/(app)/notifications')}
        >
          <Receipt size={24} color="#999" />
          <Text style={styles.navText}>Notificações</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
        >
          <CreditCard size={24} color={theme.primary} />
          <Text style={[styles.navText, { color: theme.primary }]}>Cartões</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuModalVisible}
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <View style={styles.menuModalContainer}>
          <View style={[styles.menuModalContent, { backgroundColor: theme.card }]}>
            <View style={styles.menuHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setMenuModalVisible(false)}
              >
                <Text style={[styles.closeButtonText, { color: theme.primary }]}>Fechar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.menuGrid}>
              {/* Primeira linha */}
              <View style={styles.menuRow}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/dashboard');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <Home size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Dashboard</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Visão geral</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/registers');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <PlusCircle size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Novo Registro</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Adicionar transação</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/notifications');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <Bell size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Notificações</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Alertas e avisos</Text>
                </TouchableOpacity>
              </View>

              {/* Segunda linha */}
              <View style={styles.menuRow}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/planning' as any);
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <BarChart size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Planejamento</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Orçamentos e metas</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/cards');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <CreditCard size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Cartões</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Cartões de crédito</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/accounts');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <Wallet size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Contas</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Gerenciar contas</Text>
                </TouchableOpacity>
              </View>

              {/* Terceira linha */}
              <View style={styles.menuRow}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    // Navegação para sobre
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <Info size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Sobre</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Informações</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.replace('/(auth)/login');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <ExternalLink size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Logout</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Sair do aplicativo</Text>
                </TouchableOpacity>

                <View style={styles.menuItem}>
                  {/* Item vazio para manter o alinhamento */}
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.closeFullButton, { backgroundColor: theme.primary }]}
              onPress={() => setMenuModalVisible(false)}
            >
              <Text style={styles.closeFullButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              <View style={styles.cardTypeSelector}>
                <TouchableOpacity 
                  style={[
                    styles.cardTypeOption,
                    selectedType === 'mastercard' && [styles.selectedCardType, { backgroundColor: theme.primary }]
                  ]}
                  onPress={() => setSelectedType('mastercard')}
                >
                  <CreditCard size={24} color={selectedType === 'mastercard' ? '#fff' : '#666'} />
                  <Text style={[
                    styles.cardTypeText,
                    selectedType === 'mastercard' && styles.selectedCardTypeText
                  ]}>Mastercard</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.cardTypeOption,
                    selectedType === 'visa' && [styles.selectedCardType, { backgroundColor: theme.primary }]
                  ]}
                  onPress={() => setSelectedType('visa')}
                >
                  <CreditCard size={24} color={selectedType === 'visa' ? '#fff' : '#666'} />
                  <Text style={[
                    styles.cardTypeText,
                    selectedType === 'visa' && styles.selectedCardTypeText
                  ]}>Visa</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Número do Cartão"
                value={cardNumber}
                onChangeText={setCardNumber}
                keyboardType="numeric"
                maxLength={19}
                placeholderTextColor="#666"
              />

              <TextInput
                style={styles.input}
                placeholder="Nome no Cartão"
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="characters"
                placeholderTextColor="#666"
              />

              <View style={styles.rowInputs}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  placeholder="Validade (MM/AA)"
                  value={expiryDate}
                  onChangeText={setExpiryDate}
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
                            primaryColor === color && styles.selectedColorOption
                          ]}
                          onPress={() => setPrimaryColor(color)}
                        >
                          {primaryColor === color && (
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
                            secondaryColor === color && styles.selectedColorOption
                          ]}
                          onPress={() => setSecondaryColor(color)}
                        >
                          {secondaryColor === color && (
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
                    colors={[primaryColor, secondaryColor]}
                    style={styles.gradientPreview}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.previewCardContent}>
                      <View style={styles.previewCardHeader}>
                        <CreditCard size={20} color="#ffffff" />
                        <Text style={styles.previewCardType}>
                          {selectedType || 'CARTÃO'}
                        </Text>
                      </View>
                      <Text style={styles.previewCardBalance}>R$ 0,00</Text>
                      <Text style={styles.previewCardNumber}>
                        {cardNumber || '**** **** **** ****'}
                      </Text>
                      <Text style={styles.previewCardName}>
                        {cardName || 'NOME DO TITULAR'}
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
                  backgroundColor: addingCard ? '#ccc' : theme.primary,
                  opacity: addingCard ? 0.7 : 1
                }
              ]}
              onPress={handleAddCard}
              disabled={addingCard}
            >
              {addingCard ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.addButtonText}>Adicionando...</Text>
                </View>
              ) : (
                <Text style={styles.addButtonText}>Adicionar Cartão</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
}); 