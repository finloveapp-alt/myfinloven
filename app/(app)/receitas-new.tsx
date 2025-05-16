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
  Clock
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
  const router = useRouter();
  const [theme, setTheme] = useState(themes.masculine);
  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
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
  };

  // Excluir receita
  const deleteIncome = (id: string) => {
    const updatedIncomes = incomes.filter(income => income.id !== id);
    setIncomes(updatedIncomes);
    saveIncomes(updatedIncomes);
  };

  // Formatação de data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  // Formatação de valor em reais
  const formatCurrency = (value: number) => {
    return value.toFixed(2).replace('.', ',');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Receitas</Text>
          <Text style={styles.headerTotal}>R$ {formatCurrency(incomes.reduce((sum, income) => sum + income.amount, 0))}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton}>
            <Search size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <List size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionButton}>
            <MoreVertical size={22} color="white" />
          </TouchableOpacity>
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
          <ChevronLeft size={24} color="white" />
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
          <ChevronRight size={24} color="white" />
        </TouchableOpacity>
      </View>

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
            <FlatList
              data={[
                {
                  id: '1',
                  description: 'Salário Mirassol',
                  amount: 659.00,
                  receiptDate: new Date(2025, 4, 10),
                  isReceived: true,
                  isShared: false,
                  isRecurring: true,
                  createdAt: new Date(),
                  category: 'Salário'
                },
                ...incomes
              ]}
              style={styles.content}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => {
                // Extrair dia e dia da semana
                const date = new Date(item.receiptDate);
                const day = date.getDate();
                const dayOfWeek = ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'][date.getDay()];
                
                return (
                  <View style={styles.incomeContainer}>
                    {index === 0 && (
                      <Text style={styles.sectionTitle}>Minha Carteira</Text>
                    )}
                    <View style={styles.incomeItem}>
                      <View style={styles.incomeIconContainer}>
                        <Clock size={24} color="white" />
                      </View>
                      
                      <View style={styles.incomeDetails}>
                        <View style={styles.incomeRow}>
                          <Text style={styles.incomeDescription}>{item.description}</Text>
                          <Text style={styles.incomeAmount}>R$ {item.amount.toFixed(2).replace('.', ',')}</Text>
                        </View>
                        
                        <View style={styles.incomeRow}>
                          <View style={styles.incomeTagContainer}>
                            <Text style={styles.incomeTagText}>{item.category || 'Outros'}</Text>
                          </View>
                          
                          <View style={styles.incomeDateContainer}>
                            <Text style={styles.incomeDate}>{day} · {dayOfWeek}</Text>
                            {item.isReceived && (
                              <View style={styles.incomeStatusDot} />
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </>
      )}

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
                  value={newIncome.amount > 0 ? newIncome.amount.toFixed(2).replace('.', ',') : ''}
                  onChangeText={(text) => {
                    const numericValue = parseFloat(text.replace(',', '.')) || 0;
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
const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#121212',
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  headerTotal: {
    fontSize: 16,
    color: 'white',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 4,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#121212',
  },
  monthArrow: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    paddingHorizontal: 16,
    textDecorationLine: 'underline',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#121212',
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
    color: 'white',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  incomeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
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
  incomeDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  incomeAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  incomeTagContainer: {
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  incomeTagText: {
    fontSize: 12,
    color: '#2196F3',
  },
  incomeDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeDate: {
    fontSize: 12,
    color: '#aaa',
    marginRight: 6,
  },
  incomeStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 20,
    textAlign: 'left',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingHorizontal: 0,
    paddingVertical: 8,
    fontSize: 18,
    color: 'white',
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
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
    color: 'white',
    textAlign: 'right',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 8,
  },
  datePickerButtonText: {
    fontSize: 18,
    color: 'white',
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
    borderBottomColor: '#333',
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
    color: 'white',
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
    color: '#4a90e2',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4a90e2',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});
