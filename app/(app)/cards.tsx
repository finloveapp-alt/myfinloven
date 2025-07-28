import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Plus, CreditCard, X, BarChart, Menu, PlusCircle, Receipt, Home, Bell, Info, ExternalLink, Wallet, User, Diamond, Tag } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { fontFallbacks } from '@/utils/styles';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cardsService, Card, CardTransaction } from '@/lib/services/cardsService';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

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

export default function Cards() {
  const [theme, setTheme] = useState(getInitialTheme());
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Debug: Log quando o estado do modal muda
  useEffect(() => {
    console.log('Estado do modal mudou para:', isModalVisible);
  }, [isModalVisible]);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [cardName, setCardName] = useState('');
  const [bankName, setBankName] = useState('');
  const [cardLimit, setCardLimit] = useState('');
  const [cardExpiryDate, setCardExpiryDate] = useState('');
  const [cardType, setCardType] = useState('credit'); // 'credit' ou 'debit'
  const [selectedType, setSelectedType] = useState('');
  const [cardBrand, setCardBrand] = useState(''); // Nova state para bandeira selecionada manualmente
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
      
      // Carregar transações de todos os cartões do usuário
      if (userCards.length > 0) {
        const transactions = await cardsService.getAllUserTransactions();
        setCardTransactions(transactions);
      } else {
        setCardTransactions([]);
      }
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      setCardTransactions([]);
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
    if (!cardName || !bankName || !cardLimit || !cardExpiryDate || !cardType) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos');
      return;
    }
    
    if (!cardBrand) {
      Alert.alert('Atenção', 'Por favor, selecione a bandeira do cartão');
      return;
    }
    
    try {
      setAddingCard(true);
      
      const newCard = await cardsService.createCard({
        name: `Cartão ${cardBrand.toUpperCase()}`,
        card_holder_name: cardName,
        bank_name: bankName,
        card_type: cardBrand,
        is_credit: cardType === 'credit',
        credit_limit: parseFloat(cardLimit.replace(/[^\d,]/g, '').replace(',', '.')) || 0,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        expiry_date: cardExpiryDate,
      });
      
      Alert.alert('Sucesso', 'Cartão adicionado com sucesso!');
      setIsModalVisible(false);
      resetForm();
      loadUserCards(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      
      // Verificar se é erro de limite do plano gratuito
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('Limite de cartões atingido')) {
        Alert.alert(
          'Limite Atingido', 
          errorMessage,
          [
            { text: 'Entendi', style: 'default' },
            { 
              text: 'Ver Planos', 
              style: 'default',
              onPress: () => {
                setIsModalVisible(false);
                router.push('/(app)/subscription');
              }
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível adicionar o cartão');
      }
    } finally {
      setAddingCard(false);
    }
  };

  const resetForm = () => {
    setCardName('');
    setBankName('');
    setCardLimit('');
    setCardExpiryDate('');
    setCardType('credit');
    setSelectedType('');
    setCardBrand('');
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
            onPress={() => {
              console.log('Botão adicionar cartão pressionado');
              setIsModalVisible(true);
            }}
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
                  onPress={() => router.push(`/(app)/card-detail?cardId=${card.id}`)}
                >
                  <View style={styles.cardHeader}>
                    <CreditCard size={24} color="#ffffff" />
                    <Text style={styles.cardType}>{card.card_type.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.cardBalance}>
                    R$ {card.available_limit?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                  </Text>
                  <Text style={styles.cardNumber}>**** **** **** ****</Text>
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


        </ScrollView>

        <View style={styles.transactionSection}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionTitle}>Histórico de Transações</Text>
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
                    router.push('/(app)/categories');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <Tag size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Categorias</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Gerenciar categorias</Text>
                </TouchableOpacity>
              </View>

              {/* Terceira linha */}
              <View style={styles.menuRow}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/profile');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <User size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Perfil</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Configurações</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/subscription');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <Diamond size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Assinatura</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Planos e preços</Text>
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
        presentationStyle="overFullScreen"
        onShow={() => console.log('Modal do cartão aberto')}
        onDismiss={() => console.log('Modal do cartão fechado')}
      >
        <View style={styles.modalContainer}>
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
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <TextInput
                style={styles.input}
                placeholder="Nome do Banco"
                value={bankName}
                onChangeText={setBankName}
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
                      cardBrand === 'visa' && [styles.selectedCardBrand, { backgroundColor: theme.primary }]
                    ]}
                    onPress={() => setCardBrand('visa')}
                  >
                    <VisaIcon />
                    <Text style={[
                      styles.cardBrandText,
                      cardBrand === 'visa' && styles.selectedCardBrandText
                    ]}>Visa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cardBrandOption,
                      cardBrand === 'mastercard' && [styles.selectedCardBrand, { backgroundColor: theme.primary }]
                    ]}
                    onPress={() => setCardBrand('mastercard')}
                  >
                    <MastercardIcon />
                    <Text style={[
                      styles.cardBrandText,
                      cardBrand === 'mastercard' && styles.selectedCardBrandText
                    ]}>Mastercard</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cardBrandOption,
                      cardBrand === 'elo' && [styles.selectedCardBrand, { backgroundColor: theme.primary }]
                    ]}
                    onPress={() => setCardBrand('elo')}
                  >
                    <EloIcon />
                    <Text style={[
                      styles.cardBrandText,
                      cardBrand === 'elo' && styles.selectedCardBrandText
                    ]}>Elo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.cardBrandOption,
                      cardBrand === 'american_express' && [styles.selectedCardBrand, { backgroundColor: theme.primary }]
                    ]}
                    onPress={() => setCardBrand('american_express')}
                  >
                    <AmexIcon />
                    <Text style={[
                      styles.cardBrandText,
                      cardBrand === 'american_express' && styles.selectedCardBrandText
                    ]}>American Express</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Nome no Cartão"
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="characters"
                placeholderTextColor="#666"
              />

              <TextInput
                style={styles.input}
                placeholder="Data de Vencimento (MM/AA)"
                value={cardExpiryDate}
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
                  setCardExpiryDate(formattedValue);
                }}
                keyboardType="numeric"
                maxLength={5}
                placeholderTextColor="#666"
              />

              <TextInput
                style={styles.input}
                placeholder="Limite do Cartão (R$)"
                value={cardLimit}
                onChangeText={(text) => {
                  // Remove tudo que não é número
                  const numericValue = text.replace(/[^0-9]/g, '');
                  // Formata como moeda brasileira
                  if (numericValue) {
                    const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    });
                    setCardLimit(formattedValue);
                  } else {
                    setCardLimit('');
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
                    cardType === 'credit' && [styles.selectedCardType, { backgroundColor: theme.primary }]
                  ]}
                  onPress={() => setCardType('credit')}
                >
                  <Text style={[
                    styles.cardTypeText,
                    cardType === 'credit' && styles.selectedCardTypeText
                  ]}>Crédito</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.cardTypeOption, 
                    { flex: 1, marginLeft: 8, width: 0 },
                    cardType === 'debit' && [styles.selectedCardType, { backgroundColor: theme.primary }]
                  ]}
                  onPress={() => setCardType('debit')}
                >
                  <Text style={[
                    styles.cardTypeText,
                    cardType === 'debit' && styles.selectedCardTypeText
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
                          {cardBrand ? cardBrand.toUpperCase().replace('_', ' ') : 'CARTÃO'}
                        </Text>
                      </View>
                      <Text style={styles.previewCardBalance}>
                        {cardLimit || 'R$ 0,00'}
                      </Text>
                      <Text style={styles.previewCardNumber}>
                        **** **** **** ****
                      </Text>
                      <Text style={styles.previewCardName}>
                        {bankName || 'NOME DO BANCO'}
                      </Text>
                      <Text style={styles.previewCardExpiry}>
                        {cardExpiryDate || 'MM/AA'}
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
        </View>
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
    maxHeight: Platform.OS === 'ios' ? '70%' : '80%',
    minHeight: Platform.OS === 'android' ? 400 : undefined,
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 0,
      },
    }),
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
    paddingHorizontal: 10,
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
    elevation: 0,
  },
  navItem: {
    alignItems: 'center',
    width: 70,
  },
  navText: {
    fontSize: 10,
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
    elevation: 0,
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
    elevation: 0,
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
    elevation: 0,
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
    elevation: 0,
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
    elevation: 0,
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
  modalScrollView: {
    flex: 1,
    marginBottom: 24,
    maxHeight: Platform.OS === 'android' ? 350 : undefined,
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
});