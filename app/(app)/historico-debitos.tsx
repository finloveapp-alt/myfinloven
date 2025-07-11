import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { 
  ArrowLeft, 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  Clock,
  CheckCircle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontFallbacks } from '@/utils/styles';
import themes from '@/constants/themes';
import { supabase } from '@/lib/supabase';

// Tipo para as despesas da tabela expenses
interface Expense {
  id: string;
  title: string;
  amount: number;
  due_date: string;
  is_paid: boolean;
  category: string | null;
  account: string | null;
  owner_id: string;
  partner_id: string | null;
  created_at: string;
  updated_at: string;
}

// Tipo para as transações de despesa da tabela transactions
interface ExpenseTransaction {
  id: string;
  description: string;
  amount: number;
  transaction_date: string;
  transaction_type: string;
  account_id: string;
  payment_method: string | null;
  category: string | null;
  recurrence_type: string;
  owner_id: string;
  partner_id: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
  // Dados da conta (join)
  accounts?: {
    name: string;
    type: string;
    bank: string | null;
  };
}

// Tipo unificado para exibição
interface UnifiedExpenseItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  isPaid: boolean;
  isRecurring: boolean;
  category: string | null;
  account?: {
    name: string;
    type: string;
    bank: string | null;
  };
  accountName?: string;
  icon?: string | null;
  source: 'expenses' | 'transactions'; // Para identificar a origem
}

export default function HistoricoDebitosScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState(themes.masculine);
  const [loading, setLoading] = useState(true);
  const [unifiedExpenses, setUnifiedExpenses] = useState<UnifiedExpenseItem[]>([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [refreshing, setRefreshing] = useState(false);
  
  // Lista de anos para o filtro (últimos 5 anos)
  const yearOptions = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
  
  // Criando os estilos com base no tema atual
  const styles = createStyles(theme);
  
  // Carregar tema
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Usar tema global primeiro
        if (global.dashboardTheme === 'masculine') {
          setTheme(themes.masculine);
        } else if (global.dashboardTheme === 'feminine') {
          setTheme(themes.feminine);
        } else {
          // Fallback para AsyncStorage
          const storedTheme = await AsyncStorage.getItem('@MyFinlove:theme');
          if (storedTheme === 'masculine') {
            setTheme(themes.masculine);
          } else {
            setTheme(themes.feminine);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      }
    };
    
    loadTheme();
  }, []);

  // Função para buscar despesas e transações do banco de dados
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao obter sessão:', sessionError);
        Alert.alert('Erro', 'Erro ao verificar autenticação');
        return;
      }
      
      if (!session?.user) {
        console.log('Nenhuma sessão de usuário encontrada');
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }
      
      const userId = session.user.id;
      
      // Buscar despesas da tabela expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .or(`owner_id.eq.${userId},partner_id.eq.${userId}`)
        .order('due_date', { ascending: false });
        
      if (expensesError) {
        console.error('Erro ao buscar débitos:', expensesError);
        Alert.alert('Erro', 'Erro ao carregar débitos');
        return;
      }
      
      // Buscar transações de despesa da tabela transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          accounts!transactions_account_id_fkey (
            name,
            type,
            bank
          )
        `)
        .eq('transaction_type', 'expense')
        .or(`owner_id.eq.${userId},partner_id.eq.${userId}`)
        .order('transaction_date', { ascending: false });
        
      if (transactionsError) {
        console.error('Erro ao buscar transações de débito:', transactionsError);
        Alert.alert('Erro', 'Erro ao carregar transações de débito');
        return;
      }
      
      // Converter dados da tabela expenses para o formato unificado
      const unifiedExpensesData: UnifiedExpenseItem[] = (expensesData || []).map((expense: Expense) => ({
        id: expense.id,
        description: expense.title,
        amount: parseFloat(expense.amount.toString()),
        date: expense.due_date,
        isPaid: expense.is_paid,
        isRecurring: false, // Expenses não têm campo de recorrência
        category: expense.category,
        accountName: expense.account,
        source: 'expenses' as const
      }));
      
      // Converter dados da tabela transactions para o formato unificado
      const unifiedTransactionsData: UnifiedExpenseItem[] = (transactionsData || []).map((transaction: ExpenseTransaction) => ({
        id: transaction.id,
        description: transaction.description,
        amount: parseFloat(transaction.amount.toString()),
        date: transaction.transaction_date,
        isPaid: true, // Transações são consideradas sempre pagas
        isRecurring: transaction.recurrence_type !== 'Não recorrente',
        category: transaction.category,
        account: transaction.accounts,
        icon: transaction.icon,
        source: 'transactions' as const
      }));
      
      // Combinar e ordenar por data (mais recente primeiro)
      const allExpenses = [...unifiedExpensesData, ...unifiedTransactionsData]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      console.log('Débitos carregados:', {
        expenses: expensesData?.length || 0,
        transactions: transactionsData?.length || 0,
        total: allExpenses.length
      });
      
      setUnifiedExpenses(allExpenses);
      
    } catch (error) {
      console.error('Erro ao carregar débitos:', error);
      Alert.alert('Erro', 'Erro inesperado ao carregar débitos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carregar despesas ao montar o componente
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Função para atualizar lista
  const handleRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  // Filtrar despesas baseado nos filtros selecionados
  const filteredExpenses = unifiedExpenses.filter(expense => {
    const expenseYear = new Date(expense.date).getFullYear();
    const yearMatch = expenseYear === yearFilter;
    
    return yearMatch;
  });

  // Agrupar despesas por mês
  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    if (!groups[monthKey]) {
      groups[monthKey] = {
        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        expenses: [],
        total: 0
      };
    }
    
    groups[monthKey].expenses.push(expense);
    groups[monthKey].total += expense.amount;
    
    return groups;
  }, {} as Record<string, { monthName: string; expenses: UnifiedExpenseItem[]; total: number }>);

  // Formatação de valor em reais
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Formatação de data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Renderizar item de despesa
  const renderExpenseItem = ({ item }: { item: UnifiedExpenseItem }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseHeader}>
        <View style={styles.expenseInfo}>
          <View style={styles.expenseDescriptionContainer}>
            {item.icon && (
              <Text style={styles.expenseIcon}>{item.icon}</Text>
            )}
            <Text style={styles.expenseDescription}>{item.description}</Text>
          </View>
          <View style={styles.expenseDetails}>
            <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
            {(item.account?.name || item.accountName) && (
              <Text style={styles.expenseAccount}>
                {item.account?.name || item.accountName} {item.account?.type && `(${item.account.type})`}
              </Text>
            )}
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceText}>
                {item.source === 'expenses' ? 'Débito' : 'Transação'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.expenseAmountContainer}>
          <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
        </View>
      </View>
      {item.isRecurring && (
        <View style={styles.recurringBadge}>
          <Text style={styles.recurringText}>Recorrente</Text>
        </View>
      )}
    </View>
  );

  // Renderizar grupo de mês
  const renderMonthGroup = ({ item }: { item: [string, { monthName: string; expenses: UnifiedExpenseItem[]; total: number }] }) => {
    const [, groupData] = item;
    
    return (
      <View style={styles.monthGroup}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthTitle}>{groupData.monthName}</Text>
          <Text style={styles.monthTotal}>{formatCurrency(groupData.total)}</Text>
        </View>
        {groupData.expenses.map((expense) => (
          <View key={expense.id}>
            {renderExpenseItem({ item: expense })}
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.push('/dashboard');
              }
            }}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Débitos</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Carregando débitos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/dashboard');
            }
          }}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Débitos</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Text style={styles.refreshText}>
            {refreshing ? '...' : 'Atualizar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        {/* Filtro de Ano */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Ano</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {yearOptions.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.filterButton,
                  yearFilter === year && styles.filterButtonActive
                ]}
                onPress={() => setYearFilter(year)}
              >
                <Text style={[
                  styles.filterButtonText,
                  yearFilter === year && styles.filterButtonTextActive
                ]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </View>

      {/* Lista de Débitos */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedExpenses).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={64} color={theme.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhum débito encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Não há débitos para os filtros selecionados.
            </Text>
          </View>
        ) : (
          Object.entries(groupedExpenses)
            .sort(([a], [b]) => b.localeCompare(a)) // Ordenar por mês (mais recente primeiro)
            .map((item) => (
              <View key={item[0]}>
                {renderMonthGroup({ item })}
              </View>
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Função para criar estilos com base no tema
const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: fontFallbacks.medium,
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fontFallbacks.medium,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: theme.textSecondary,
    fontFamily: fontFallbacks.regular,
  },
  filtersContainer: {
    backgroundColor: theme.card,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
    fontFamily: fontFallbacks.medium,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterButtonActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: theme.text,
    fontFamily: fontFallbacks.regular,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    fontFamily: fontFallbacks.medium,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    fontFamily: fontFallbacks.regular,
  },
  monthGroup: {
    marginBottom: 24,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: theme.primary,
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    fontFamily: fontFallbacks.medium,
  },
  monthTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.danger,
    fontFamily: fontFallbacks.bold,
  },
  expenseItem: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseInfo: {
    flex: 1,
    marginRight: 16,
  },
  expenseDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
    fontFamily: fontFallbacks.medium,
  },
  expenseDetails: {
    gap: 2,
  },
  expenseDate: {
    fontSize: 14,
    color: theme.textSecondary,
    fontFamily: fontFallbacks.regular,
  },
  expenseAccount: {
    fontSize: 12,
    color: theme.textSecondary,
    fontFamily: fontFallbacks.regular,
  },
  expenseAmountContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.danger,
    fontFamily: fontFallbacks.bold,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  paidBadge: {
    backgroundColor: '#DCFCE7',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fontFallbacks.medium,
  },
  paidText: {
    color: '#10B981',
  },
  pendingText: {
    color: '#F59E0B',
  },
  recurringBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: theme.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recurringText: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '600',
    fontFamily: fontFallbacks.medium,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontFamily: fontFallbacks.regular,
  },
});