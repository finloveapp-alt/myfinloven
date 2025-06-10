import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Animated, AppState, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/lib/supabase';
import { cardsService, Card, CardTransaction } from '@/lib/services/cardsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        />
      )}

      <BottomNavigation theme={theme} />
    </View>
  );
}

// Componente separado para o conteúdo do cartão
const CardContent = ({ card, transactions, weekData, stats, theme, maxValue, barAnimations }) => {
  // Dados do cartão (real ou mock apenas se não há cartões)
  const cardData = card || {
    id: 'mock',
    name: 'Cartão Mock',
    card_number: '4231 5432 3218 4563',
    card_holder_name: 'Usuário',
    bank_name: 'Banco Mock',
    card_type: 'visa' as const,
    is_credit: true,
    credit_limit: 2500,
    current_balance: 875.46,
    primary_color: theme.primary,
    secondary_color: theme.secondary,
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
        <Text style={styles.cardLabel}>Limite</Text>
        <Text style={styles.cardBalance}>
          R$ {cardData.available_limit?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
        </Text>
        <Text style={styles.cardNumber}>
          {cardsService.formatCardNumber(cardData.card_number)}
        </Text>
        <Text style={styles.cardExpiry}>{cardData.bank_name}</Text>
      </LinearGradient>

      {/* Balance */}
      <View style={styles.balanceSection}>
        <Text style={styles.balanceLabel}>Limite do Cartão</Text>
        <Text style={[styles.balanceAmount, { color: theme.text }]}>
          R$ {cardData.available_limit?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
        </Text>
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
}); 