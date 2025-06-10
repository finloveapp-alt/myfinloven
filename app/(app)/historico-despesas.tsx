import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
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
  CheckCircle,
  CreditCard,
  Wallet,
  Tag,
  Search,
  Filter
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontFallbacks } from '@/utils/styles';
import themes from '@/constants/themes';

// Tipo para as despesas
interface Expense {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  isPaid: boolean;
  category?: string;
  account?: string;
  person?: string; // Adicionando campo para identificar a pessoa (Ana ou João)
  createdAt: Date;
}

export default function HistoricoDespesasScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState(themes.masculine);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [monthFilter, setMonthFilter] = useState(0); // 0 significa todos os meses
  const [dayFilter, setDayFilter] = useState(0); // 0 significa todos os dias
  const [personFilter, setPersonFilter] = useState('Todos');
  const [searchText, setSearchText] = useState('');
  // Estado de showFilters e categoryFilter removidos
  const [showDateFilter, setShowDateFilter] = useState(false);
  
  // Lista de anos para o filtro (últimos 5 anos)
  const yearOptions = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
  
  // Lista de meses para o filtro
  const monthOptions = [
    { value: 0, label: 'Todos' },
    { value: 1, label: 'Jan' },
    { value: 2, label: 'Fev' },
    { value: 3, label: 'Mar' },
    { value: 4, label: 'Abr' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' },
    { value: 8, label: 'Ago' },
    { value: 9, label: 'Set' },
    { value: 10, label: 'Out' },
    { value: 11, label: 'Nov' },
    { value: 12, label: 'Dez' },
  ];

  // Gerar dias do mês (1-31)
  const getDaysInMonth = (year: number, month: number) => {
    // Se month for 0 (Todos), retornamos apenas a opção 'Todos'
    if (month === 0) return [{ value: 0, label: 'Todos' }];
    
    // Caso contrário, calculamos o número de dias no mês
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [{ value: 0, label: 'Todos' }];
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ value: i, label: i.toString() });
    }
    
    return days;
  };
  
  const dayOptions = getDaysInMonth(yearFilter, monthFilter);
  
  // Lista de pessoas para o filtro
  const personOptions = ['Todos', 'Ana', 'João'];

  // Lista de categorias removida
  
  // Criando os estilos com base no tema atual
  const styles = createStyles();
  
  // Carregar tema
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@MyFinlove:theme');
        if (storedTheme) {
          setTheme(storedTheme === 'feminine' ? themes.feminine : themes.masculine);
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      }
    };
    
    loadTheme();
  }, []);

  // Carregar despesas
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoading(true);
        const storedExpenses = await AsyncStorage.getItem('@MyFinlove:expenses');
        if (storedExpenses) {
          const parsedExpenses = JSON.parse(storedExpenses).map((expense: any) => ({
            ...expense,
            dueDate: new Date(expense.dueDate),
            createdAt: new Date(expense.createdAt || Date.now()),
            // Se não tiver pessoa definida, atribuir com base na categoria ou título
            person: expense.person || (
              expense.title.toLowerCase().includes('ana') || 
              expense.category?.toLowerCase().includes('ana') ? 
              'Ana' : expense.title.toLowerCase().includes('joão') || 
              expense.category?.toLowerCase().includes('joão') ? 
              'João' : 'Compartilhado'
            )
          }));
          setExpenses(parsedExpenses);
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar despesas:', error);
        setLoading(false);
      }
    };
    
    loadExpenses();
  }, []);

  // Formatação de data
  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };
  
  // Formatação de valor em reais
  const formatCurrency = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Filtrar despesas
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.dueDate);
    const matchesYear = expenseDate.getFullYear() === yearFilter;
    
    // Verificar mês apenas se um mês específico foi selecionado
    const matchesMonth = monthFilter === 0 ? true : expenseDate.getMonth() + 1 === monthFilter;
    
    // Verificar dia apenas se um dia específico foi selecionado
    const matchesDay = dayFilter === 0 ? true : expenseDate.getDate() === dayFilter;
    
    const matchesPerson = personFilter === 'Todos' ? true : expense.person === personFilter;
    const matchesSearch = searchText === '' ? true : 
      expense.title.toLowerCase().includes(searchText.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchText.toLowerCase());
    
    return matchesYear && matchesMonth && matchesDay && matchesPerson && matchesSearch;
  });

  // Calcular totais
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const paidAmount = filteredExpenses.filter(expense => expense.isPaid).reduce((sum, expense) => sum + expense.amount, 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Despesas</Text>
        <View style={{width: 40}}>
          {/* Botão de filtro removido */}
        </View>
      </View>
      
      {/* Filtros */}
      <View style={styles.filterContainer}>
        <View style={styles.dateFilterGroup}>
          <TouchableOpacity 
            style={styles.dateFilterHeader}
            onPress={() => setShowDateFilter(!showDateFilter)}
          >
            <Text style={styles.filterLabel}>Data</Text>
            <View style={styles.dateFilterSummary}>
              <Calendar size={14} color="#9c27b0" style={{marginRight: 4}} />
              <Text style={styles.dateFilterSummaryText}>
                {monthFilter === 0 && dayFilter === 0 ? 
                  `${yearFilter} (Ano todo)` : 
                  monthFilter > 0 && dayFilter === 0 ? 
                  `${monthOptions[monthFilter].label}/${yearFilter}` :
                  `${dayFilter}/${monthOptions[monthFilter].label}/${yearFilter}`
                }
              </Text>
              {showDateFilter ? 
                <ChevronLeft size={16} color="#9c27b0" style={{transform: [{rotate: '90deg'}]}} /> : 
                <ChevronLeft size={16} color="#9c27b0" style={{transform: [{rotate: '-90deg'}]}} />
              }
            </View>
          </TouchableOpacity>
          
          {showDateFilter && (
            <View style={styles.dateFilterExpandedContent}>
              {/* Seletor de Ano */}
              <View style={styles.dateFilterRow}>
                <Text style={styles.dateFilterLabel}>Ano:</Text>
                <View style={styles.dateFilterSelector}>
                  <TouchableOpacity 
                    style={styles.dateFilterButton}
                    onPress={() => setYearFilter(yearFilter > yearOptions[yearOptions.length - 1] ? yearFilter - 1 : yearOptions[0])}
                  >
                    <ChevronLeft size={18} color="#9c27b0" />
                  </TouchableOpacity>
                  <Text style={styles.dateFilterValue}>{yearFilter}</Text>
                  <TouchableOpacity 
                    style={styles.dateFilterButton}
                    onPress={() => setYearFilter(yearFilter < yearOptions[0] ? yearFilter + 1 : yearOptions[yearOptions.length - 1])}
                  >
                    <ChevronRight size={18} color="#9c27b0" />
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Seletor de Mês */}
              <View style={styles.dateFilterRow}>
                <Text style={styles.dateFilterLabel}>Mês:</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.dateFilterScroll}
                >
                  {monthOptions.map(month => (
                    <TouchableOpacity 
                      key={month.value}
                      style={[styles.dateFilterChip, monthFilter === month.value && styles.dateFilterChipActive]}
                      onPress={() => {
                        setMonthFilter(month.value);
                        // Resetar o dia se mudar o mês
                        if (month.value === 0 || dayFilter > getDaysInMonth(yearFilter, month.value).length - 1) {
                          setDayFilter(0);
                        }
                      }}
                    >
                      <Text style={[styles.dateFilterChipText, monthFilter === month.value && styles.dateFilterChipTextActive]}>
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Seletor de Dia (apenas se um mês específico for selecionado) */}
              {monthFilter > 0 && (
                <View style={styles.dateFilterRow}>
                  <Text style={styles.dateFilterLabel}>Dia:</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.dateFilterScroll}
                  >
                    {dayOptions.map(day => (
                      <TouchableOpacity 
                        key={day.value}
                        style={[styles.dateFilterChip, dayFilter === day.value && styles.dateFilterChipActive]}
                        onPress={() => setDayFilter(day.value)}
                      >
                        <Text style={[styles.dateFilterChipText, dayFilter === day.value && styles.dateFilterChipTextActive]}>
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </View>
        
        {/* Barra de pesquisa */}
        <View style={styles.searchGroup}>
          <Text style={styles.filterLabel}>Pesquisar</Text>
          <View style={styles.searchInputContainer}>
            <Search size={18} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar despesas..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        <View style={styles.personFilterGroup}>
          <Text style={styles.personFilterLabel}>Pessoa</Text>
          <View style={styles.personFilterContainer}>
            {personOptions.map(person => (
              <TouchableOpacity 
                key={person}
                style={[styles.personFilterButton, personFilter === person && styles.personFilterButtonActive]}
                onPress={() => setPersonFilter(person)}
              >
                <Text style={[styles.personFilterText, personFilter === person && styles.personFilterTextActive]}>
                  {person}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Filtro de categoria removido */}
      </View>

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>R$ {formatCurrency(totalAmount)}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pago</Text>
          <Text style={[styles.statValue, styles.paidValue]}>R$ {formatCurrency(paidAmount)}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pendente</Text>
          <Text style={[styles.statValue, styles.pendingValue]}>R$ {formatCurrency(pendingAmount)}</Text>
        </View>
      </View>

      {/* Conteúdo */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#b388ff" />
        </View>
      ) : (
        <ScrollView style={styles.expensesList}>
          {filteredExpenses.length > 0 ? (
            filteredExpenses
              .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
              .map(expense => {
                const date = new Date(expense.dueDate);
                const formattedDate = formatDate(date);
                
                return (
                  <View key={expense.id} style={styles.expenseItem}>
                    <View style={styles.expenseItemLeft}>
                      <Text style={styles.expenseItemTitle}>{expense.title}</Text>
                      <View style={styles.expenseItemMeta}>
                        <Calendar size={12} color="#666" style={{marginRight: 4}} />
                        <Text style={styles.expenseItemDate}>{formattedDate}</Text>
                        
                        {expense.category && (
                          <View style={styles.expenseItemCategory}>
                            <Text style={styles.expenseItemCategoryText}>{expense.category}</Text>
                          </View>
                        )}
                        
                        {expense.person && (
                          <View style={[styles.expenseItemPerson, 
                            { backgroundColor: expense.person === 'Ana' ? 'rgba(156, 39, 176, 0.1)' : 
                              expense.person === 'João' ? 'rgba(3, 169, 244, 0.1)' : 'rgba(255, 152, 0, 0.1)' }]}>
                            <Text style={[styles.expenseItemPersonText, 
                              { color: expense.person === 'Ana' ? '#9c27b0' : 
                                expense.person === 'João' ? '#03a9f4' : '#ff9800' }]}>
                              {expense.person}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.expenseItemRight}>
                      <Text style={[styles.expenseItemAmount, expense.isPaid ? styles.expenseItemPaid : styles.expenseItemPending]}>
                        R$ {formatCurrency(expense.amount)}
                      </Text>
                      <View style={[styles.expenseItemStatus, expense.isPaid ? styles.expenseItemStatusPaid : styles.expenseItemStatusPending]}>
                        <Text style={styles.expenseItemStatusText}>
                          {expense.isPaid ? 'Pago' : 'Pendente'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma despesa encontrada para os filtros selecionados.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // Estilos para o filtro de data
  dateFilterGroup: {
    marginBottom: 16,
  },
  dateFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateFilterSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  dateFilterSummaryText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  dateFilterExpandedContent: {
    marginTop: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateFilterLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    width: 40,
  },
  dateFilterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
    width: 120,
  },
  dateFilterButton: {
    padding: 4,
  },
  dateFilterValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dateFilterScroll: {
    flex: 1,
    marginLeft: 8,
  },
  dateFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateFilterChipActive: {
    backgroundColor: '#9c27b0',
    borderWidth: 0,
  },
  dateFilterChipText: {
    fontSize: 14,
    color: '#333',
  },
  dateFilterChipTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#b388ff', // Cor roxa/lilás do projeto
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  filterButton: {
    padding: 8,
  },
  searchGroup: {
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 8,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  personFilterGroup: {
    marginBottom: 16,
  },
  personFilterLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  personFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  personFilterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  personFilterButtonActive: {
    backgroundColor: '#9c27b0', // Roxo mais escuro do projeto
    borderWidth: 0,
  },
  personFilterText: {
    fontSize: 14,
    color: '#333',
  },
  personFilterTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 0,
    marginTop: 0,
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  paidValue: {
    color: '#4CAF50', // Verde para despesas pagas
  },
  pendingValue: {
    color: '#9c27b0', // Roxo mais escuro do projeto para despesas pendentes
  },
  expensesList: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  expenseItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  expenseItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  expenseItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  expenseItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  expenseItemDate: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  expenseItemCategory: {
    backgroundColor: 'rgba(179, 136, 255, 0.2)', // Fundo roxo claro
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  expenseItemCategoryText: {
    fontSize: 10,
    color: '#9c27b0', // Roxo mais escuro do projeto
  },
  expenseItemPerson: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  expenseItemPersonText: {
    fontSize: 14,
    color: '#333',
  },
  expenseItemRight: {
    alignItems: 'flex-end',
  },
  expenseItemAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  expenseItemPaid: {
    color: '#4CAF50', // Verde para despesas pagas
    fontWeight: '500',
  },
  expenseItemPending: {
    color: '#9c27b0', // Roxo mais escuro do projeto para despesas pendentes
    fontWeight: '500',
  },
  expenseItemStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expenseItemStatusPaid: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)', // Verde mais consistente com o estilo de receitas
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.1)',
  },
  expenseItemStatusPending: {
    backgroundColor: 'rgba(156, 39, 176, 0.2)', // Roxo mais escuro do projeto
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.1)',
  },
  expenseItemStatusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
