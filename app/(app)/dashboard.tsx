import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { fontFallbacks } from '@/utils/styles';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  ChevronRight, 
  BarChart, 
  Receipt, 
  PlusCircle, 
  CreditCard, 
  Home,
  Calendar,
  Target,
  DollarSign,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  LogOut
} from 'lucide-react-native';

// Definição de temas
const themes = {
  feminine: {
    primary: '#b687fe',
    primaryGradient: ['#b687fe', '#9157ec'],
    secondary: '#8B5CF6',
    accent: '#FF3B30',
    positive: '#4CD964',
    background: '#f5f7fa',
    card: '#ffffff',
    expense: '#FF3B30',
    income: '#4CD964',
    shared: '#0073ea',
    progressTrack: '#f0f0f0'
  },
  masculine: {
    primary: '#0073ea',
    primaryGradient: ['#0073ea', '#0056b3'],
    secondary: '#3c79e6',
    accent: '#FF3B30',
    positive: '#4CD964',
    background: '#f5f7fa',
    card: '#ffffff',
    expense: '#FF3B30',
    income: '#4CD964',
    shared: '#8B5CF6',
    progressTrack: '#f0f0f0'
  }
};

export default function Dashboard() {
  const [theme, setTheme] = useState(themes.feminine);
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0);
  
  useEffect(() => {
    // Verifica se existe um tema definido globalmente
    if (global.dashboardTheme === 'masculine') {
      setTheme(themes.masculine);
    } else {
      setTheme(themes.feminine);
    }
  }, []);

  // Nomes baseados no tema
  const primaryPerson = theme === themes.masculine ? 'João' : 'Maria';
  const secondaryPerson = theme === themes.masculine ? 'Maria' : 'João';
  
  // Dados das transações
  const transactions = [
    {
      icon: '🥕',
      backgroundColor: '#FFEEE2',
      title: 'Mercado',
      subtitle: `Mercado por ${secondaryPerson}`,
      amount: 'R$ 50',
      paymentMethod: 'Dinheiro'
    },
    {
      icon: '⛽',
      backgroundColor: '#E3F5FF',
      title: 'Combustível',
      subtitle: `Posto Shell - ${primaryPerson}`,
      amount: 'R$ 120',
      paymentMethod: 'Cartão de crédito'
    },
    {
      icon: '🍽️',
      backgroundColor: '#FFE2E6',
      title: 'Restaurante',
      subtitle: 'Almoço - Compartilhado',
      amount: 'R$ 85',
      paymentMethod: 'Pix'
    }
  ];
  
  // Funções para navegar entre transações
  const goToPreviousTransaction = () => {
    setCurrentTransactionIndex(prev => 
      prev === 0 ? transactions.length - 1 : prev - 1
    );
  };
  
  const goToNextTransaction = () => {
    setCurrentTransactionIndex(prev => 
      prev === transactions.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      <ScrollView>
        {/* Header Section */}
        <LinearGradient
          colors={[theme.primaryGradient[0], theme.primaryGradient[1]]}
          style={styles.headerContainer}
        >
          <SafeAreaView style={styles.headerContent}>
            <View style={styles.profileSection}>
              <View style={styles.profileInfo}>
                <Image
                  source={{ uri: theme === themes.masculine 
                    ? 'https://randomuser.me/api/portraits/men/36.jpg'
                    : 'https://randomuser.me/api/portraits/women/44.jpg' }}
                  style={styles.profileImage}
                />
                <View>
                  <Text style={styles.budgetTitle}>Meu Orçamento</Text>
                  <Text style={styles.budgetSubtitle}>Orçamento atual</Text>
                </View>
                <TouchableOpacity 
                  style={styles.logoutButton}
                  onPress={() => {
                    // Navega diretamente para a tela de login sem tentar fazer logout no Supabase
                    // Isso evita erros quando as credenciais do Supabase não estão configuradas
                    router.replace('/(auth)/login');
                  }}
                  accessibilityLabel="Botão de logout"
                  accessibilityHint="Pressione para sair do aplicativo"
                >
                  <LogOut size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.monthSelector}>
                <TouchableOpacity>
                  <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.monthText}>Abr 2025</Text>
                <TouchableOpacity>
                  <ArrowRight size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.balanceSection}>
              <Text style={styles.balanceAmount}>R$ 3.120</Text>
              <Text style={styles.balanceLabel}>Saldo atual</Text>
            </View>

            <View style={styles.usersRow}>
              <Image
                source={{ uri: theme === themes.masculine 
                  ? 'https://randomuser.me/api/portraits/women/33.jpg'
                  : 'https://randomuser.me/api/portraits/men/42.jpg' }}
                style={styles.userAvatar}
              />
              <View style={styles.addUserAvatar}>
                <Text style={styles.addUserText}>+</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Financial Cards - Receitas, Despesas, Débitos e Créditos */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsScrollContainer}
        >
          <View style={[styles.financialCard, { backgroundColor: theme.card }]}>
            <Text style={styles.cardLabel}>Receitas</Text>
            <Text style={styles.cardAmount}>R$ 5.000</Text>
            <Text style={styles.cardChangePositive}>+10% desde Mar</Text>
          </View>

          <View style={[styles.financialCard, { backgroundColor: theme.card }]}>
            <Text style={styles.cardLabel}>Despesas</Text>
            <Text style={styles.cardAmount}>R$ 1.880</Text>
            <Text style={styles.cardChangeNegative}>-3,2% desde Mar</Text>
          </View>
          
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={styles.cardLabel}>Débitos</Text>
            <Text style={styles.cardAmount}>R$ 2.350</Text>
            <Text style={styles.cardChangeNegative}>+5,7% desde Mar</Text>
          </View>
          
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={styles.cardLabel}>Créditos</Text>
            <Text style={styles.cardAmount}>R$ 3.200</Text>
            <Text style={styles.cardChangePositive}>+8,3% desde Mar</Text>
          </View>
        </ScrollView>

        {/* Transaction List */}
        <View style={[styles.transactionContainer, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimas Transações</Text>
            <TouchableOpacity onPress={goToNextTransaction}>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.transactionWrapper}>
            <TouchableOpacity onPress={goToPreviousTransaction} style={styles.transactionNavButton}>
              <ChevronRight size={20} color="#999" style={{transform: [{rotate: '180deg'}] as any}} />
            </TouchableOpacity>
            
            <View style={styles.transaction}>
              <View style={[styles.transactionIconContainer, {backgroundColor: transactions[currentTransactionIndex].backgroundColor}]}>
                <Text style={styles.transactionIcon}>{transactions[currentTransactionIndex].icon}</Text>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{transactions[currentTransactionIndex].title}</Text>
                <Text style={styles.transactionSubtitle}>{transactions[currentTransactionIndex].subtitle}</Text>
              </View>
              <View style={styles.transactionAmountContainer}>
                <Text style={styles.transactionAmount}>{transactions[currentTransactionIndex].amount}</Text>
                <Text style={styles.transactionType}>{transactions[currentTransactionIndex].paymentMethod}</Text>
              </View>
            </View>
            
            <TouchableOpacity onPress={goToNextTransaction} style={styles.transactionNavButton}>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.paginationDots}>
            {transactions.map((_, index) => (
              <View 
                key={index}
                style={[styles.paginationDot, 
                  index === currentTransactionIndex ? 
                  { backgroundColor: theme.secondary, width: 20 } : 
                  { backgroundColor: '#e0e0e0' }
                ]} 
              />
            ))}
          </View>
        </View>

        {/* Resumo do Mês */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Resumo do Mês</Text>
          </View>

          <View style={styles.summaryItem}>
            <DollarSign size={18} color={theme.primary} />
            <Text style={styles.summaryLabel}>Saldo total atual:</Text>
            <Text style={styles.summaryValue}>R$ 3.120,00</Text>
          </View>

          <View style={styles.summaryItem}>
            <ArrowDownCircle size={18} color={theme.income} />
            <Text style={styles.summaryLabel}>Receitas totais do mês:</Text>
            <Text style={[styles.summaryValue, {color: theme.income}]}>R$ 5.000,00</Text>
          </View>

          <View style={styles.summaryItem}>
            <ArrowUpCircle size={18} color={theme.expense} />
            <Text style={styles.summaryLabel}>Despesas totais do mês:</Text>
            <Text style={[styles.summaryValue, {color: theme.expense}]}>R$ 1.880,00</Text>
          </View>
        </View>

        {/* Gastos por Pessoa */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gastos por Pessoa (até hoje)</Text>
          </View>

          <View style={styles.personExpense}>
            <View style={styles.personExpenseHeader}>
              <Text style={styles.personName}>{primaryPerson}:</Text>
              <Text style={styles.personAmount}>R$ 860,00</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { backgroundColor: theme.primary, width: '45%' }]} />
            </View>
          </View>

          <View style={styles.personExpense}>
            <View style={styles.personExpenseHeader}>
              <Text style={styles.personName}>{secondaryPerson}:</Text>
              <Text style={styles.personAmount}>R$ 1.020,00</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { backgroundColor: theme === themes.masculine ? theme.shared : theme.primary, width: '54%' }]} />
            </View>
          </View>

          <View style={styles.personExpense}>
            <View style={styles.personExpenseHeader}>
              <Text style={styles.personName}>Compartilhado:</Text>
              <Text style={styles.personAmount}>R$ 1.200,00</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { backgroundColor: theme.shared, width: '63%' }]} />
            </View>
          </View>
        </View>



        {/* Contas a Pagar & Cartões */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Contas a Pagar & Cartões</Text>
            <TouchableOpacity>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.billItem}>
            <View style={[styles.billIconContainer, {backgroundColor: '#FFE2E6'}]}>
              <CreditCard size={20} color="#FF5A6E" />
            </View>
            <View style={styles.billDetails}>
              <Text style={styles.billTitle}>Cartão Nubank</Text>
              <Text style={styles.billDate}>Vence em 10 Abr</Text>
            </View>
            <Text style={styles.billAmount}>R$ 783,50</Text>
          </View>

          <View style={styles.billItem}>
            <View style={[styles.billIconContainer, {backgroundColor: '#E3F5FF'}]}>
              <Receipt size={20} color="#0095FF" />
            </View>
            <View style={styles.billDetails}>
              <Text style={styles.billTitle}>Aluguel</Text>
              <Text style={styles.billDate}>Débito automático · 05 Abr</Text>
            </View>
            <Text style={styles.billAmount}>R$ 1.200,00</Text>
          </View>

          <View style={styles.billItem}>
            <View style={[styles.billIconContainer, {backgroundColor: '#FFF6E3'}]}>
              <Receipt size={20} color="#FFB627" />
            </View>
            <View style={styles.billDetails}>
              <Text style={styles.billTitle}>Internet</Text>
              <Text style={styles.billDate}>Boleto · 15 Abr</Text>
            </View>
            <Text style={styles.billAmount}>R$ 120,00</Text>
          </View>
        </View>





        {/* Metas Financeiras */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Metas Financeiras</Text>
            <TouchableOpacity>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleContainer}>
                <Target size={18} color={theme.primary} />
                <Text style={styles.goalTitle}>Economizar R$ 1.000/mês</Text>
              </View>
              <Text style={styles.goalPercentage}>65%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { backgroundColor: theme.primary, width: '65%' }]} />
            </View>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <View style={styles.goalTitleContainer}>
                <Target size={18} color={theme.secondary} />
                <Text style={styles.goalTitle}>Fundo para carro novo</Text>
              </View>
              <Text style={styles.goalAmount}>R$ 12.000 <Text style={styles.goalTarget}>/ R$ 25.000</Text></Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { backgroundColor: theme.secondary, width: '48%' }]} />
            </View>
          </View>
        </View>

        {/* Calendário Financeiro - Preview */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card, marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Calendário Financeiro</Text>
            <TouchableOpacity>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarPreview}>
            <View style={styles.calendarRow}>
              <View style={styles.calendarDay}>
                <Text style={styles.calendarDayText}>5</Text>
                <View style={[styles.calendarEvent, {backgroundColor: '#E3F5FF'}]}></View>
              </View>
              <View style={styles.calendarDay}>
                <Text style={styles.calendarDayText}>6</Text>
              </View>
              <View style={styles.calendarDay}>
                <Text style={styles.calendarDayText}>7</Text>
              </View>
              <View style={styles.calendarDay}>
                <Text style={styles.calendarDayText}>8</Text>
              </View>
              <View style={[styles.calendarDay, styles.calendarDayToday]}>
                <Text style={styles.calendarDayTextToday}>9</Text>
                <View style={[styles.calendarEvent, {backgroundColor: '#FFE2E6'}]}></View>
              </View>
              <View style={styles.calendarDay}>
                <Text style={styles.calendarDayText}>10</Text>
                <View style={[styles.calendarEvent, {backgroundColor: '#FFE2E6'}]}></View>
              </View>
              <View style={styles.calendarDay}>
                <Text style={styles.calendarDayText}>11</Text>
              </View>
            </View>

            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#FFE2E6'}]} />
                <Text style={styles.legendText}>Faturas de cartão</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#E3F5FF'}]} />
                <Text style={styles.legendText}>Débito automático</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: '#FFF6E3'}]} />
                <Text style={styles.legendText}>Boletos</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.navItem}>
          <Home size={24} color="#999" />
          <Text style={styles.navText}>Início</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <BarChart size={24} color={theme.primary} />
          <Text style={[styles.navText, { color: theme.primary }]}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.addButton}>
          <PlusCircle size={60} color="#2D3748" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Receipt size={24} color="#999" />
          <Text style={styles.navText}>Transações</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <CreditCard size={24} color="#999" />
          <Text style={styles.navText}>Contas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  financialCard: {
    width: 160,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? 40 : 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContent: {
    paddingBottom: 10,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoutButton: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  budgetTitle: {
    fontSize: 20,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: 'white',
  },
  budgetSubtitle: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: 'rgba(255,255,255,0.8)',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
  },
  monthText: {
    color: 'white',
    marginHorizontal: 10,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  balanceSection: {
    marginBottom: 20,
  },
  balanceAmount: {
    fontSize: 42,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: 'white',
    marginBottom: 5,
  },
  balanceLabel: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: 'rgba(255,255,255,0.8)',
  },
  usersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    marginLeft: -10,
  },
  addUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addUserText: {
    color: 'white',
    fontSize: 20,
  },
  // Section Container
  sectionContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  // Summary Items
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  // Person Expense
  personExpense: {
    marginBottom: 15,
  },
  personExpenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  personName: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
  },
  personAmount: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  // Financial Cards
  summaryCardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardLabel: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
    marginBottom: 10,
  },
  cardAmount: {
    fontSize: 28,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
    marginBottom: 5,
  },
  cardChangePositive: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#4CD964',
  },
  cardChangeNegative: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#FF3B30',
  },
  // Bills
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  billIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  billDetails: {
    flex: 1,
  },
  billTitle: {
    fontSize: 15,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
  },
  billDate: {
    fontSize: 13,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  billAmount: {
    fontSize: 15,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  // Transaction
  transactionContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  transactionWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  transaction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    justifyContent: 'space-between',
  },
  transactionNavButton: {
    padding: 10,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEEE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionIcon: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 2,
    marginRight: 10,
  },
  transactionTitle: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
  },
  transactionSubtitle: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  transactionAmountContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  transactionType: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },

  rejectButton: {
    // Removido a cor de fundo fixa, será aplicada dinamicamente
  },
  approveButton: {
    // Removido a cor de fundo fixa, será aplicada dinamicamente
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    // Removido a cor de fundo fixa, será aplicada dinamicamente
  },
  // Budget Overview
  overviewContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginBottom: 5,
  },
  statAmount: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  spentAmount: {
    // Removido referência direta de cor
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 217, 100, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  trackingText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#4CD964',
  },
  // Goals
  goalItem: {
    marginBottom: 15,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
    marginLeft: 8,
  },
  goalPercentage: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  goalAmount: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  goalTarget: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  // Calendar
  calendarPreview: {
    marginTop: 10,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calendarDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calendarDayToday: {
    backgroundColor: '#f0f0f0',
  },
  calendarDayText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333',
  },
  calendarDayTextToday: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  calendarEvent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 0,
  },
  calendarLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
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
  activeNavText: {
    // Removido referência direta de cor
  },
  addButton: {
    marginTop: -30,
  },
  cardsScrollContainer: {
    paddingLeft: 16,
    paddingRight: 32,
    marginTop: 16,
    marginBottom: 16,
  },
  // Já definido acima como summaryCardsContainer
  
  // Estilo financialCard já definido acima
  
  cardTitle: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333333',
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 22,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333333',
    marginBottom: 4,
  },
  cardPercentage: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
}); 