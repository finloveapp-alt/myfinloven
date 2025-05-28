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
  Switch,
  Alert,
  Image,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Calendar, 
  DollarSign, 
  Receipt, 
  Plus, 
  Users, 
  ChevronRight, 
  AlertCircle,
  Wallet,
  CheckCircle,
  Trash2,
  Search,
  List,
  MoreVertical,
  ChevronLeft,
  Clock,
  Calculator,
  Square,
  ChevronDown,
  Edit,
  Copy,
  CreditCard
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import BottomNavigation from '@/components/BottomNavigation';
import { fontFallbacks } from '@/utils/styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import themes from '@/constants/themes';

// Tema padrão para garantir a consistência das cores
const defaultTheme = {
  primary: '#b687fe',
  primaryGradient: ['#b687fe', '#7d41e0'],
  secondary: '#0073ea',
  card: '#ffffff',
};

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

export default function ReceitasScreen() {
  // Verificar se deve abrir o histórico automaticamente
  useEffect(() => {
    // Verificar se há parâmetros na rota
    if (router.canGoBack() && router?.state?.routes) {
      const currentRoute = router.state.routes[router.state.routes.length - 1];
      if (currentRoute?.params?.showHistory === true) {
        setHistoryModalVisible(true);
      }
    }
  }, []);
  const router = useRouter();
  const [theme, setTheme] = useState(themes.masculine);
  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedIncomeId, setSelectedIncomeId] = useState<string | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [deleteOptionsVisible, setDeleteOptionsVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [personFilter, setPersonFilter] = useState('Todos');
  
  // Lista de anos para o filtro (últimos 5 anos)
  const yearOptions = Array.from({length: 5}, (_, i) => new Date().getFullYear() - i);
  
  // Lista de pessoas para o filtro
  const personOptions = ['Todos', 'Ana', 'João'];
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  // Criando os estilos com base no tema atual
  const styles = createStyles(theme);
  
  // Estado para nova receita
  const [newIncome, setNewIncome] = useState<Omit<Income, 'id' | 'createdAt'>>({
    description: '',
    amount: 0,
    receiptDate: new Date(),
    isReceived: false,
    isShared: false,
    isRecurring: false,
  });

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
      } catch (error) {
        console.error('Erro ao carregar receitas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadIncomes();
  }, []);

  // Salvar receitas
  const saveIncomes = async (updatedIncomes: Income[]) => {
    try {
      await AsyncStorage.setItem('@MyFinlove:incomes', JSON.stringify(updatedIncomes));
    } catch (error) {
      console.error('Erro ao salvar receitas:', error);
    }
  };

  // Adicionar nova receita
  const addIncome = () => {
    if (!newIncome.description || newIncome.amount <= 0) {
      return;
    }
    
    const newIncomeItem: Income = {
      ...newIncome,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    const updatedIncomes = [...incomes, newIncomeItem];
    setIncomes(updatedIncomes);
    saveIncomes(updatedIncomes);
    setModalVisible(false);
    
    // Resetar form
    setNewIncome({
      description: '',
      amount: 0,
      receiptDate: new Date(),
      isReceived: false,
      isShared: false,
      isRecurring: false,
    });
  };

  // Marcar como recebida/não recebida
  const toggleReceived = (id: string) => {
    const updatedIncomes = incomes.map(income => 
      income.id === id ? { ...income, isReceived: !income.isReceived } : income
    );
    setIncomes(updatedIncomes);
    saveIncomes(updatedIncomes);
    
    // Feedback visual para o usuário
    const income = incomes.find(inc => inc.id === id);
    if (income) {
      const status = !income.isReceived ? 'recebida' : 'pendente';
      Alert.alert(
        `Receita ${status}`,
        `A receita "${income.description}" foi marcada como ${status}.`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    }
  };

  // Abrir opções de exclusão
  const openDeleteOptions = () => {
    setOptionsModalVisible(false);
    setDeleteOptionsVisible(true);
  };

  // Fechar opções de exclusão
  const closeDeleteOptions = () => {
    setDeleteOptionsVisible(false);
  };

  // Excluir apenas este mês
  const deleteThisMonth = () => {
    if (!selectedIncomeId) return;
    
    const updatedIncomes = incomes.filter(income => income.id !== selectedIncomeId);
    setIncomes(updatedIncomes);
    saveIncomes(updatedIncomes);
    setDeleteOptionsVisible(false);
    
    Alert.alert('Sucesso', 'Receita excluída deste mês com sucesso!');
  };

  // Excluir a partir deste mês
  const deleteFromThisMonth = () => {
    if (!selectedIncomeId) return;
    
    const currentDate = new Date();
    const updatedIncomes = incomes.filter(income => {
      // Manter receitas com data anterior ao mês atual
      return income.id !== selectedIncomeId || 
             (income.receiptDate.getMonth() < currentDate.getMonth() && 
              income.receiptDate.getFullYear() <= currentDate.getFullYear());
    });
    
    setIncomes(updatedIncomes);
    saveIncomes(updatedIncomes);
    setDeleteOptionsVisible(false);
    
    Alert.alert('Sucesso', 'Receita excluída a partir deste mês com sucesso!');
  };

  // Excluir definitivamente
  const deleteDefinitively = () => {
    if (!selectedIncomeId) return;
    
    const updatedIncomes = incomes.filter(income => income.id !== selectedIncomeId);
    setIncomes(updatedIncomes);
    saveIncomes(updatedIncomes);
    setDeleteOptionsVisible(false);
    
    Alert.alert('Sucesso', 'Receita excluída definitivamente com sucesso!');
  };

  // Formatação de data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  // Formatação de valor em reais
  const formatCurrency = (value: number) => {
    // Usando toString() em vez de toFixed(2) para evitar arredondamentos indesejados
    // conforme mencionado na memória do usuário
    const valueStr = value.toString();
    const parts = valueStr.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1].padEnd(2, '0').substring(0, 2) : '00';
    
    // Formatação com separadores de milhares
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedInteger},${decimalPart}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.iconButton}
              accessibilityLabel="Voltar"
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.title}>Receitas</Text>
              <Text style={styles.headerAmount}>R$ {formatCurrency(incomes.filter(income => !income.isReceived).reduce((sum, income) => sum + income.amount, 0))}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => setHistoryModalVisible(true)}
            >
              <Clock size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Search size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <MoreVertical size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity 
          onPress={() => {
            if (currentMonth === 0) {
              setCurrentMonth(11);
              setCurrentYear(currentYear - 1);
            } else {
              setCurrentMonth(currentMonth - 1);
            }
          }}
          style={styles.monthArrow}
        >
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.monthText}>{months[currentMonth]}</Text>
        
        <TouchableOpacity 
          onPress={() => {
            if (currentMonth === 11) {
              setCurrentMonth(0);
              setCurrentYear(currentYear + 1);
            } else {
              setCurrentMonth(currentMonth + 1);
            }
          }}
          style={styles.monthArrow}
        >
          <ChevronRight size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Financial Summary - Hidden based on image */}

      {/* Botão de adicionar receita flutuante */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
      
      {/* Conteúdo */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <>
          {incomes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma receita cadastrada</Text>
              <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Adicionar Receita</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView 
              style={styles.listContainer}
              contentContainerStyle={styles.listContentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Indicador de status */}
              <View style={styles.statusIndicators}>
                <View style={styles.statusItem}>
                  <View style={[styles.statusDot, { backgroundColor: theme.positive }]} />
                  <Text style={styles.statusText}>Recebido</Text>
                </View>
                <View style={styles.statusItem}>
                  <View style={[styles.statusDot, { backgroundColor: theme.primary }]} />
                  <Text style={styles.statusText}>Pendente</Text>
                </View>
              </View>

              {incomes.map((income) => {
                const statusColor = income.isReceived 
                  ? theme.positive
                  : theme.primary;
                
                // Status text and styling
                const statusText = income.isReceived 
                  ? "Recebido" 
                  : "Pendente";

                // Extrair dia e dia da semana
                const date = new Date(income.receiptDate);
                const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                
                return (
                  <View key={income.id} style={[
                    styles.incomeCard,
                    { backgroundColor: theme.card }
                  ]}>
                    <View style={styles.incomeContent}>
                      <View style={styles.incomeMain}>
                        <View style={styles.incomeTitleRow}>
                          <Text style={styles.incomeTitle}>
                            {income.description}
                          </Text>
                          
                          <View style={styles.incomeTitleRightContent}>
                            <Text style={[
                              styles.incomeAmountText,
                              { fontWeight: '600' }
                            ]}>
                              R$ {income.amount.toFixed(2)}
                            </Text>
                            
                            <TouchableOpacity 
                              style={styles.optionsButton}
                              onPress={() => {
                                setSelectedIncomeId(income.id);
                                setOptionsModalVisible(true);
                              }}
                            >
                              <MoreVertical size={18} color="#666" />
                            </TouchableOpacity>
                          </View>
                        </View>
                        
                        <View style={styles.incomeMetaRow}>
                          <View style={[styles.incomeTag, { backgroundColor: `${theme.primary}10` }]}>
                            <Text style={[styles.incomeTagText, { color: theme.primary }]}>
                              {income.category || 'Outros'}
                            </Text>
                          </View>
                          <Text style={styles.incomeAccount}>Minha Carteira</Text>
                        </View>
                        
                        <View style={styles.incomeDetailsRow}>
                          <View style={styles.incomeDateContainer}>
                            <Calendar size={14} color="#666" style={styles.incomeDateIcon} />
                            <Text style={styles.incomeDateText}>
                              {formattedDate}
                            </Text>
                          </View>
                          
                          <View style={[
                            styles.statusIndicator,
                            {
                              backgroundColor: income.isReceived 
                                ? 'rgba(76, 217, 100, 0.1)' 
                                : 'rgba(139, 92, 246, 0.1)',
                              borderColor: income.isReceived 
                                ? 'rgba(76, 217, 100, 0.3)' 
                                : 'rgba(139, 92, 246, 0.3)'
                            }
                          ]}>
                            <Text style={[
                              styles.statusText,
                              {
                                color: income.isReceived 
                                  ? theme.positive 
                                  : theme.primary
                              }
                            ]}>
                              {statusText}
                            </Text>
                          </View>
                        </View>
                        
                        {/* Botão para confirmar recebimento (apenas para receitas não recebidas) */}
                        {!income.isReceived && (
                          <TouchableOpacity 
                            style={[
                              styles.confirmButton,
                              { 
                                backgroundColor: `${theme.primary}15`,
                                borderColor: theme.primary,
                              }
                            ]}
                            onPress={() => toggleReceived(income.id)}
                          >
                            <Text style={[
                              styles.confirmButtonText,
                              { 
                                color: theme.primary 
                              }
                            ]}>
                              Confirmar Recebimento
                            </Text>
                            <Check size={14} color={theme.primary} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
              <View style={styles.bottomPadding} />
            </ScrollView>
          )}
        </>
      )}

      {/* Modal de opções para cada receita */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOptionsModalVisible(false)}
        >
          <View style={styles.optionsModalContent}>
            <TouchableOpacity style={styles.optionItem} onPress={() => {
              setOptionsModalVisible(false);
              // Lógica para editar
              Alert.alert('Editar', 'Função de editar receita');
            }}>
              <Edit size={20} color="#333" />
              <Text style={styles.optionText}>Editar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={openDeleteOptions}>
              <Trash2 size={20} color="#333" />
              <Text style={styles.optionText}>Excluir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={() => {
              setOptionsModalVisible(false);
              // Lógica para alterar valor
              Alert.alert('Alterar valor', 'Função de alterar valor da receita');
            }}>
              <DollarSign size={20} color="#333" />
              <Text style={styles.optionText}>Alterar valor</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={() => {
              setOptionsModalVisible(false);
              // Lógica para duplicar
              Alert.alert('Duplicar', 'Função de duplicar receita');
            }}>
              <Copy size={20} color="#333" />
              <Text style={styles.optionText}>Duplicar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={() => {
              setOptionsModalVisible(false);
              // Lógica para receita cartão
              Alert.alert('Receita cartão', 'Função de receita cartão');
            }}>
              <CreditCard size={20} color="#333" />
              <Text style={styles.optionText}>Receita cartão</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={() => {
              setOptionsModalVisible(false);
              // Lógica para receber parcial
              Alert.alert('Receber parcial', 'Função de receber parcial');
            }}>
              <DollarSign size={20} color="#4caf50" />
              <Text style={[styles.optionText, {color: '#4caf50'}]}>Receber parcial</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={() => {
              const income = incomes.find(inc => inc.id === selectedIncomeId);
              if (income) {
                toggleReceived(income.id);
              }
              setOptionsModalVisible(false);
            }}>
              {incomes.find(inc => inc.id === selectedIncomeId)?.isReceived ? (
                <>
                  <Square size={20} color="#9c27b0" />
                  <Text style={[styles.optionText, {color: '#9c27b0'}]}>Marcar como não recebida</Text>
                </>
              ) : (
                <>
                  <CheckCircle size={20} color="#2ecc71" />
                  <Text style={[styles.optionText, {color: '#2ecc71'}]}>Marcar como recebida</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={() => {
              setOptionsModalVisible(false);
            }}>
              <X size={20} color="#666" />
              <Text style={[styles.optionText, {color: '#666'}]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de opções de exclusão */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteOptionsVisible}
        onRequestClose={closeDeleteOptions}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeDeleteOptions}
        >
          <View style={styles.optionsModalContent}>
            <Text style={styles.deleteOptionsTitle}>Opções de exclusão</Text>
            
            <TouchableOpacity style={styles.optionItem} onPress={deleteThisMonth}>
              <Calendar size={20} color="#333" />
              <Text style={styles.optionText}>Excluir apenas este mês</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={deleteFromThisMonth}>
              <Calendar size={20} color="#333" />
              <Text style={styles.optionText}>Excluir a partir deste mês</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={deleteDefinitively}>
              <Trash2 size={20} color="#333" />
              <Text style={styles.optionText}>Excluir definitivamente</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={closeDeleteOptions}>
              <X size={20} color="#666" />
              <Text style={[styles.optionText, {color: '#666'}]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de histórico de receitas */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={historyModalVisible}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <SafeAreaView style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <TouchableOpacity 
              style={styles.historyBackButton}
              onPress={() => setHistoryModalVisible(false)}
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.historyTitle}>Histórico de Receitas</Text>
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

          {/* Lista de receitas filtradas */}
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
                const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                
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
        </SafeAreaView>
      </Modal>
      
      {/* Modal para adicionar nova receita */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Efetivar Receita</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Receita</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Salário, Freelance, etc."
                placeholderTextColor="#666"
                value={newIncome.description}
                onChangeText={(text) => setNewIncome({...newIncome, description: text})}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Valor</Text>
              <View style={styles.currencyInputContainer}>
                <TextInput
                  style={styles.currencyInput}
                  placeholder="0,00"
                  placeholderTextColor="#666"
                  keyboardType="decimal-pad"
                  value={newIncome.amount > 0 ? newIncome.amount.toString().replace('.', ',') : ''}
                  onChangeText={(text) => {
                    // Remove caracteres não numéricos, exceto vírgula
                    const cleanedText = text.replace(/[^0-9,]/g, '');
                    // Substitui vírgula por ponto para conversão
                    const numericText = cleanedText.replace(',', '.');
                    // Converte para número ou usa 0 se inválido
                    const numericValue = numericText ? parseFloat(numericText) : 0;
                    setNewIncome({...newIncome, amount: numericValue});
                  }}
                />
                <TouchableOpacity style={styles.calculatorButton}>
                  <Text style={styles.calculatorIcon}>⌨️</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Data recebimento</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setDatePickerVisible(true)}
              >
                <Text style={styles.datePickerButtonText}>Hoje</Text>
                <View style={styles.linkIcon}>
                  <Text style={styles.linkIconText}>⤵</Text>
                </View>
              </TouchableOpacity>
              
              {datePickerVisible && (
                <DateTimePicker
                  value={newIncome.receiptDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setDatePickerVisible(Platform.OS === 'ios');
                    if (selectedDate) {
                      setNewIncome({...newIncome, receiptDate: selectedDate});
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Conta</Text>
              <TouchableOpacity style={styles.accountSelector}>
                <View style={styles.accountIconContainer}>
                  <View style={styles.accountIcon}></View>
                </View>
                <Text style={styles.accountText}>Minha Carteira</Text>
                <View style={styles.accountDropdownIcon}>
                  <Text style={{color: '#999'}}>▼</Text>
                </View>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={addIncome}
              >
                <Text style={styles.confirmButtonText}>Efetivar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Definindo estilos base que não dependem do tema
// Importar o componente Circle para o checkbox
import { Circle } from 'lucide-react-native';

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    backgroundColor: '#aa80ff', // Cor roxa sólida similar à da imagem
    paddingTop: Platform.OS === 'android' ? 25 : 40,
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleContainer: {
    marginLeft: 5,
  },
  iconButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginBottom: 0,
  },
  headerAmount: {
    fontSize: 16,
    fontWeight: '400',
    color: 'white',
    marginTop: -2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  financialSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  divider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  payableCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  payableValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#aa80ff', // Mesma cor do cabeçalho
    paddingBottom: 16,
  },
  monthArrow: {
    padding: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    textDecorationLine: 'underline',
    marginHorizontal: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9c27b0', // Roxo mais escuro para o botão
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 999,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Fundo claro para o conteúdo
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2196F3',
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  incomeContainer: {
    marginBottom: 4,
  },
  incomeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#9c27b0',
  },
  receivedIncomeItem: {
    borderLeftColor: '#2ecc71',
    opacity: 0.9,
    backgroundColor: '#fafffe',
  },
  incomeCheckbox: {
    marginRight: 16,
    justifyContent: 'center',
  },
  receivedCheckbox: {
    opacity: 1,
  },
  calendarIcon: {
    marginRight: 4,
  },
  incomeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incomeDetails: {
    flex: 1,
  },
  incomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsButton: {
    padding: 6,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteOptionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#b388ff',
  },
  historyBackButton: {
    padding: 8,
  },
  historyTitle: {
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
    backgroundColor: '#9c27b0',
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
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
  },
  historyStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  historyStatLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  historyStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9c27b0',
  },
  historyList: {
    flex: 1,
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyItemLeft: {
    flex: 1,
    marginRight: 8,
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
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
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
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
  },
  historyItemStatusPending: {
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
  },
  historyItemStatusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  historyEmpty: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyEmptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#333',
  },
  incomeDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  receivedAmount: {
    color: '#4caf50',
  },
  pendingAmount: {
    color: '#9c27b0',
  },
  incomeTagContainer: {
    backgroundColor: 'rgba(179, 136, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  receivedTagContainer: {
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
  },
  incomeTagText: {
    fontSize: 12,
    color: '#9c27b0',
    fontWeight: '500',
  },
  receivedTagText: {
    color: '#2ecc71',
  },
  incomeDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeDate: {
    fontSize: 12,
    color: '#666',
  },
  receivedDate: {
    color: '#2ecc71',
  },
  receivedText: {
    color: '#444',
  },
  incomeStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ecc71', // Verde para status recebido
    marginLeft: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'left',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 0,
    paddingVertical: 8,
    fontSize: 18,
    color: '#333',
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
  },
  calculatorButton: {
    padding: 4,
  },
  calculatorIcon: {
    fontSize: 20,
  },
  currencyInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 24,
    color: '#333',
    textAlign: 'right',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
  },
  datePickerButtonText: {
    fontSize: 18,
    color: '#333',
  },
  linkIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkIconText: {
    fontSize: 20,
    color: '#999',
  },
  accountSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 8,
  },
  accountIconContainer: {
    marginRight: 12,
  },
  accountIcon: {
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  accountText: {
    flex: 1,
    fontSize: 18,
    color: '#333',
  },
  accountDropdownIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9c27b0', // Roxo mais escuro para o texto
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#9c27b0', // Roxo mais escuro para o botão
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
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
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  statusIndicators: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  incomeCard: {
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: 'white',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  incomeContent: {
    flex: 1,
  },
  incomeMain: {
    flex: 1,
  },
  incomeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  incomeTitle: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  incomeTitleRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeAmountText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
    marginRight: 8,
  },
  incomeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  incomeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  incomeTagText: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: theme.primary,
  },
  incomeAccount: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  incomeDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  incomeDateIcon: {
    marginRight: 4,
  },
  incomeDateText: {
    fontSize: 13,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 4,
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    marginRight: 6,
  },
  bottomPadding: {
    height: 80,
  },
});
