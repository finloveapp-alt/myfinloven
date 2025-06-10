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

// Tipo para as receitas
interface Income {
  id: string;
  description: string;
  amount: number;
  receiptDate: Date;
  isReceived: boolean;
  isShared: boolean;
  isRecurring: boolean;
  createdAt: Date;
  category?: string;
}

export default function HistoricoReceitasScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState(themes.masculine);
  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [personFilter, setPersonFilter] = useState('Todos');
  
  // Lista de anos para o filtro (últimos 5 anos)
  const yearOptions = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
  
  // Lista de pessoas para o filtro
  const personOptions = ['Todos', 'Ana', 'João'];
  
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

  // Carregar receitas
  useEffect(() => {
    const loadIncomes = async () => {
      try {
        setLoading(true);
        const storedIncomes = await AsyncStorage.getItem('@MyFinlove:incomes');
        if (storedIncomes) {
          const parsedIncomes = JSON.parse(storedIncomes).map((income: any) => ({
            ...income,
            receiptDate: new Date(income.receiptDate),
            createdAt: new Date(income.createdAt)
          }));
          setIncomes(parsedIncomes);
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar receitas:', error);
        setLoading(false);
      }
    };
    
    loadIncomes();
  }, []);

  // Formatação de data
  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };
  
  // Formatação de valor em reais
  const formatCurrency = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Histórico de Receitas</Text>
        </View>
        <View style={{width: 40}} />
      </View>
      
      {/* Filtros */}
      <View style={styles.filterContainer}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Ano</Text>
          <View style={styles.filterSelector}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setYearFilter(yearFilter > yearOptions[yearOptions.length - 1] ? yearFilter - 1 : yearOptions[0])}
            >
              <ChevronLeft size={20} color="#9c27b0" />
            </TouchableOpacity>
            <Text style={styles.filterValue}>{yearFilter}</Text>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setYearFilter(yearFilter < yearOptions[0] ? yearFilter + 1 : yearOptions[yearOptions.length - 1])}
            >
              <ChevronRight size={20} color="#9c27b0" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Pessoa</Text>
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
      </View>

      {/* Estatísticas */}
      <View style={styles.historyStats}>
        <View style={styles.historyStatItem}>
          <Text style={styles.historyStatLabel}>Total Recebido</Text>
          <Text style={styles.historyStatValue}>
            R$ {formatCurrency(incomes
              .filter(income => {
                const matchesYear = new Date(income.receiptDate).getFullYear() === yearFilter;
                const matchesPerson = personFilter === 'Todos' ? true : 
                  (income.category === personFilter || 
                  (income.description && income.description.includes(personFilter)));
                return matchesYear && matchesPerson && income.isReceived;
              })
              .reduce((sum, income) => sum + income.amount, 0))}
          </Text>
        </View>
        <View style={styles.historyStatItem}>
          <Text style={styles.historyStatLabel}>Média Mensal</Text>
          <Text style={styles.historyStatValue}>
            R$ {formatCurrency(incomes
              .filter(income => {
                const matchesYear = new Date(income.receiptDate).getFullYear() === yearFilter;
                const matchesPerson = personFilter === 'Todos' ? true : 
                  (income.category === personFilter || 
                  (income.description && income.description.includes(personFilter)));
                return matchesYear && matchesPerson && income.isReceived;
              })
              .reduce((sum, income) => sum + income.amount, 0) / 12)}
          </Text>
        </View>
      </View>

      {/* Conteúdo */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#b388ff" />
        </View>
      ) : (
        <ScrollView style={styles.historyList}>
          {incomes
            .filter(income => {
              const matchesYear = new Date(income.receiptDate).getFullYear() === yearFilter;
              const matchesPerson = personFilter === 'Todos' ? true : 
                (income.category === personFilter || 
                (income.description && income.description.includes(personFilter)));
              return matchesYear && matchesPerson;
            })
            .sort((a, b) => new Date(b.receiptDate).getTime() - new Date(a.receiptDate).getTime())
            .map(income => {
              const date = new Date(income.receiptDate);
              const formattedDate = formatDate(date);
              
              return (
                <View key={income.id} style={styles.historyItem}>
                  <View style={styles.historyItemLeft}>
                    <Text style={styles.historyItemTitle}>{income.description}</Text>
                    <View style={styles.historyItemMeta}>
                      <Calendar size={12} color="#666" style={{marginRight: 4}} />
                      <Text style={styles.historyItemDate}>{formattedDate}</Text>
                      {income.category && (
                        <View style={styles.historyItemCategory}>
                          <Text style={styles.historyItemCategoryText}>{income.category}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.historyItemRight}>
                    <Text style={[styles.historyItemAmount, income.isReceived ? styles.historyItemReceived : styles.historyItemPending]}>
                      R$ {formatCurrency(income.amount)}
                    </Text>
                    <View style={[styles.historyItemStatus, income.isReceived ? styles.historyItemStatusReceived : styles.historyItemStatusPending]}>
                      <Text style={styles.historyItemStatusText}>
                        {income.isReceived ? 'Recebido' : 'Pendente'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
            
          {incomes.filter(income => {
            const matchesYear = new Date(income.receiptDate).getFullYear() === yearFilter;
            const matchesPerson = personFilter === 'Todos' ? true : 
              (income.category === personFilter || 
              (income.description && income.description.includes(personFilter)));
            return matchesYear && matchesPerson;
          }).length === 0 && (
            <View style={styles.historyEmpty}>
              <Text style={styles.historyEmptyText}>Nenhuma receita encontrada para os filtros selecionados.</Text>
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#b388ff',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  filterSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButton: {
    padding: 4,
  },
  filterValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  },
  personFilterButtonActive: {
    backgroundColor: '#b388ff',
  },
  personFilterText: {
    fontSize: 14,
    color: '#333',
  },
  personFilterTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  historyStats: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  historyStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  historyStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  historyStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyList: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  historyItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  historyItemDate: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  historyItemCategory: {
    backgroundColor: 'rgba(179, 136, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historyItemCategoryText: {
    fontSize: 10,
    color: '#9c27b0',
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyItemAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyItemReceived: {
    color: '#2ecc71',
  },
  historyItemPending: {
    color: '#9c27b0',
  },
  historyItemStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historyItemStatusReceived: {
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
  },
  historyItemStatusPending: {
    backgroundColor: 'rgba(156, 39, 176, 0.2)',
  },
  historyItemStatusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  historyEmpty: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyEmptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  }
});
