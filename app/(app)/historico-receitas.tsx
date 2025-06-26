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

// Tipo para as receitas da tabela incomes
interface Income {
  id: string;
  description: string;
  amount: number;
  receipt_date: string;
  is_received: boolean;
  is_shared: boolean;
  is_recurring: boolean;
  category: string | null;
  account_id: string | null;
  account_name: string | null;
  owner_id: string;
  partner_id: string | null;
  created_at: string;
  updated_at: string;
  // Dados da conta (join)
  accounts?: {
    name: string;
    type: string;
    bank: string | null;
  };
}

// Tipo para as transações de receita da tabela transactions
interface IncomeTransaction {
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
interface UnifiedIncomeItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  isReceived: boolean;
  isRecurring: boolean;
  category: string | null;
  account?: {
    name: string;
    type: string;
    bank: string | null;
  };
  icon?: string | null;
  source: 'incomes' | 'transactions'; // Para identificar a origem
}

export default function HistoricoReceitasScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState(themes.masculine);
  const [loading, setLoading] = useState(true);
  const [unifiedIncomes, setUnifiedIncomes] = useState<UnifiedIncomeItem[]>([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [refreshing, setRefreshing] = useState(false);
  
  // Lista de anos para o filtro (últimos 5 anos)
  const yearOptions = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
  
  // Lista de status para o filtro
  const statusOptions = ['Todos', 'Recebidas', 'Pendentes'];
  
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

  // Função para buscar receitas e transações do banco de dados
  const fetchIncomes = async () => {
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
      
      // Buscar receitas da tabela incomes
      const { data: incomesData, error: incomesError } = await supabase
        .from('incomes')
        .select(`
          *,
          accounts!fk_incomes_account_id (
            name,
            type,
            bank
          )
        `)
        .or(`owner_id.eq.${userId},partner_id.eq.${userId}`)
        .order('receipt_date', { ascending: false });
        
      if (incomesError) {
        console.error('Erro ao buscar receitas:', incomesError);
        Alert.alert('Erro', 'Erro ao carregar receitas');
        return;
      }
      
      // Buscar transações de receita da tabela transactions
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
        .eq('transaction_type', 'income')
        .or(`owner_id.eq.${userId},partner_id.eq.${userId}`)
        .order('transaction_date', { ascending: false });
        
      if (transactionsError) {
        console.error('Erro ao buscar transações de receita:', transactionsError);
        Alert.alert('Erro', 'Erro ao carregar transações de receita');
        return;
      }
      
      // Converter dados da tabela incomes para o formato unificado
      const unifiedIncomesData: UnifiedIncomeItem[] = (incomesData || []).map((income: Income) => ({
        id: income.id,
        description: income.description,
        amount: parseFloat(income.amount.toString()),
        date: income.receipt_date,
        isReceived: income.is_received,
        isRecurring: income.is_recurring,
        category: income.category,
        account: income.accounts,
        source: 'incomes' as const
      }));
      
      // Converter dados da tabela transactions para o formato unificado
      const unifiedTransactionsData: UnifiedIncomeItem[] = (transactionsData || []).map((transaction: IncomeTransaction) => ({
        id: transaction.id,
        description: transaction.description,
        amount: parseFloat(transaction.amount.toString()),
        date: transaction.transaction_date,
        isReceived: true, // Transações são consideradas sempre recebidas
        isRecurring: transaction.recurrence_type !== 'Não recorrente',
        category: transaction.category,
        account: transaction.accounts,
        icon: transaction.icon,
        source: 'transactions' as const
      }));
      
      // Combinar e ordenar por data (mais recente primeiro)
      const allIncomes = [...unifiedIncomesData, ...unifiedTransactionsData]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      console.log('Receitas carregadas:', {
        incomes: incomesData?.length || 0,
        transactions: transactionsData?.length || 0,
        total: allIncomes.length
      });
      
      setUnifiedIncomes(allIncomes);
      
    } catch (error) {
      console.error('Erro ao carregar receitas:', error);
      Alert.alert('Erro', 'Erro inesperado ao carregar receitas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carregar receitas ao montar o componente
  useEffect(() => {
    fetchIncomes();
  }, []);

  // Função para atualizar lista
  const handleRefresh = () => {
    setRefreshing(true);
    fetchIncomes();
  };

  // Filtrar receitas baseado nos filtros selecionados
  const filteredIncomes = unifiedIncomes.filter(income => {
    const incomeYear = new Date(income.date).getFullYear();
    const yearMatch = incomeYear === yearFilter;
    
    let statusMatch = true;
    if (statusFilter === 'Recebidas') {
      statusMatch = income.isReceived;
    } else if (statusFilter === 'Pendentes') {
      statusMatch = !income.isReceived;
    }
    
    return yearMatch && statusMatch;
  });

  // Agrupar receitas por mês
  const groupedIncomes = filteredIncomes.reduce((groups, income) => {
    const date = new Date(income.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    if (!groups[monthKey]) {
      groups[monthKey] = {
        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        incomes: [],
        total: 0
      };
    }
    
    groups[monthKey].incomes.push(income);
    groups[monthKey].total += income.amount;
    
    return groups;
  }, {} as Record<string, { monthName: string; incomes: UnifiedIncomeItem[]; total: number }>);

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

  // Renderizar item de receita
  const renderIncomeItem = ({ item }: { item: UnifiedIncomeItem }) => (
    <View style={styles.incomeItem}>
      <View style={styles.incomeHeader}>
        <View style={styles.incomeInfo}>
          <View style={styles.incomeDescriptionContainer}>
            {item.icon && (
              <Text style={styles.incomeIcon}>{item.icon}</Text>
            )}
            <Text style={styles.incomeDescription}>{item.description}</Text>
          </View>
          <View style={styles.incomeDetails}>
            <Text style={styles.incomeDate}>{formatDate(item.date)}</Text>
            {item.account && (
              <Text style={styles.incomeAccount}>
                {item.account.name} ({item.account.type})
              </Text>
            )}
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceText}>
                {item.source === 'incomes' ? 'Receita' : 'Transação'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.incomeAmountContainer}>
          <Text style={styles.incomeAmount}>{formatCurrency(item.amount)}</Text>
          <View style={[styles.statusBadge, item.isReceived ? styles.receivedBadge : styles.pendingBadge]}>
            {item.isReceived ? (
              <CheckCircle size={12} color="#10B981" />
            ) : (
              <Clock size={12} color="#F59E0B" />
            )}
            <Text style={[styles.statusText, item.isReceived ? styles.receivedText : styles.pendingText]}>
              {item.isReceived ? 'Recebida' : 'Pendente'}
            </Text>
          </View>
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
  const renderMonthGroup = ({ item }: { item: [string, { monthName: string; incomes: UnifiedIncomeItem[]; total: number }] }) => {
    const [, groupData] = item;
    
    return (
      <View style={styles.monthGroup}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthTitle}>{groupData.monthName}</Text>
          <Text style={styles.monthTotal}>{formatCurrency(groupData.total)}</Text>
        </View>
        {groupData.incomes.map((income) => (
          <View key={income.id}>
            {renderIncomeItem({ item: income })}
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
          <Text style={styles.headerTitle}>Histórico de Receitas</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Carregando receitas...</Text>
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
        <Text style={styles.headerTitle}>Histórico de Receitas</Text>
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

        {/* Filtro de Status */}
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  statusFilter === status && styles.filterButtonActive
                ]}
                onPress={() => setStatusFilter(status)}
              >
                <Text style={[
                  styles.filterButtonText,
                  statusFilter === status && styles.filterButtonTextActive
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Lista de Receitas */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedIncomes).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={64} color={theme.textSecondary} />
            <Text style={styles.emptyTitle}>Nenhuma receita encontrada</Text>
            <Text style={styles.emptySubtitle}>
              Não há receitas para os filtros selecionados.
            </Text>
          </View>
        ) : (
          Object.entries(groupedIncomes)
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
    color: theme.primary,
    fontFamily: fontFallbacks.bold,
  },
  incomeItem: {
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
  incomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  incomeInfo: {
    flex: 1,
    marginRight: 16,
  },
  incomeDescriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  incomeDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
    fontFamily: fontFallbacks.medium,
  },
  incomeDetails: {
    gap: 2,
  },
  incomeDate: {
    fontSize: 14,
    color: theme.textSecondary,
    fontFamily: fontFallbacks.regular,
  },
  incomeAccount: {
    fontSize: 12,
    color: theme.textSecondary,
    fontFamily: fontFallbacks.regular,
  },
  incomeAmountContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.success,
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
  receivedBadge: {
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
  receivedText: {
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
