import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, AppState, ActivityIndicator } from 'react-native';
import { ArrowLeft, Trash2, DollarSign, ArrowRight, Repeat } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cardsService, CardTransaction } from '@/lib/services/cardsService';

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

export default function CardHistory() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  
  // Estados para tema dinâmico
  const [theme, setTheme] = useState(getInitialTheme());
  const [themeLoaded, setThemeLoaded] = useState(false);
  
  // Estados para dados
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardId, setCardId] = useState<string | null>(null);

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
  }, [themeLoaded]);

  // useEffect para carregar dados das transações
  useEffect(() => {
    loadTransactions();
  }, []);

  // Função para carregar transações do cartão
  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      // Obter cardId dos parâmetros da URL ou buscar o primeiro cartão do usuário
      let currentCardId = params.cardId as string;
      
      if (!currentCardId) {
        // Se não há cardId específico, buscar o primeiro cartão do usuário
        const userCards = await cardsService.getUserCards();
        if (userCards.length > 0) {
          currentCardId = userCards[0].id;
        }
      }
      
      if (currentCardId) {
        setCardId(currentCardId);
        const cardTransactions = await cardsService.getCardTransactions(currentCardId, 50);
        setTransactions(cardTransactions);
      }
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
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

  const filters = [
    { id: 'all', label: 'Todos', icon: '⊞' },
    { id: 'income', label: 'Receita', icon: '💰' },
    { id: 'expense', label: 'Despesa', icon: '💳' },
    { id: 'transfer', label: 'Transferência', icon: '↔️' },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedFilter === 'Todos') return true;
    if (selectedFilter === 'Receita') return transaction.transaction_type === 'income';
    if (selectedFilter === 'Despesa') return transaction.transaction_type === 'expense';
    if (selectedFilter === 'Transferência') return transaction.transaction_type === 'transfer';
    return true;
  });

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderIcon = (type: string) => {
    switch(type) {
      case 'income':
        return <DollarSign size={20} color="#4CD964" />;
      case 'expense':
        return <ArrowRight size={20} color="#FF3B30" />;
      case 'transfer':
        return <Repeat size={20} color="#5856D6" />;
      default:
        return <DollarSign size={20} color="#4CD964" />;
    }
  };

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
          onPress={() => router.push('/(app)/card-detail')}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico do cartão</Text>
      </View>

      {/* Filters */}
      <View style={[styles.filtersContainer, { backgroundColor: theme.primary }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.label && [styles.filterButtonActive, { backgroundColor: theme.card }]
              ]}
              onPress={() => setSelectedFilter(filter.label)}
            >
              <Text style={[
                styles.filterIcon,
                selectedFilter === filter.label && styles.filterIconActive
              ]}>{filter.icon}</Text>
              <Text style={[
                styles.filterText,
                selectedFilter === filter.label && [styles.filterTextActive, { color: theme.primary }]
              ]}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
      <ScrollView 
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.text }]}>Carregando transações...</Text>
          </View>
        ) : filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              {selectedFilter === 'Todos' 
                ? 'Nenhuma transação encontrada' 
                : `Nenhuma ${selectedFilter.toLowerCase()} encontrada`}
            </Text>
          </View>
        ) : (
          filteredTransactions.map((transaction) => (
            <View key={transaction.id} style={[styles.transactionItem, { backgroundColor: theme.card }]}>
              <View style={styles.transactionLeft}>
                              <View style={[
                styles.transactionIcon,
                transaction.transaction_type === 'income' ? styles.incomeIcon : 
                transaction.transaction_type === 'expense' ? styles.expenseIcon : styles.transferIcon
              ]}>
                  {renderIcon(transaction.transaction_type)}
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.transactionTitle, { color: theme.text }]}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>{formatDate(transaction.transaction_date)}</Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  transaction.transaction_type === 'income' ? styles.incomeText : 
                  transaction.transaction_type === 'expense' ? styles.expenseText : styles.transferText
                ]}>
                  {transaction.transaction_type === 'income' ? '+' : 
                   transaction.transaction_type === 'expense' ? '-' : ''}
                  R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
                <TouchableOpacity style={styles.deleteButton}>
                  <Trash2 size={16} color="#ff4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <BottomNavigation theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
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
  filtersContainer: {
    paddingBottom: 20,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    // backgroundColor será aplicado dinamicamente
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 6,
    opacity: 0.9,
  },
  filterIconActive: {
    opacity: 1,
  },
  filterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.9,
  },
  filterTextActive: {
    // color será aplicado dinamicamente
    opacity: 1,
  },
  transactionsList: {
    flex: 1,
  },
  transactionsContent: {
    padding: 20,
    paddingBottom: 100,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incomeIcon: {
    backgroundColor: 'rgba(76, 217, 100, 0.15)',
  },
  expenseIcon: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  transferIcon: {
    backgroundColor: 'rgba(88, 86, 214, 0.15)',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#888',
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 12,
  },
  incomeText: {
    color: '#4CD964',
  },
  expenseText: {
    color: '#FF3B30',
  },
  transferText: {
    color: '#5856D6',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});