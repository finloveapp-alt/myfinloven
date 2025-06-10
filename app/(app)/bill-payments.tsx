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
  ActivityIndicator
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
  Trash2
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

// Tipo para as contas a pagar
interface Bill {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  isPaid: boolean;
  isShared: boolean;
  isRecurring: boolean;
  createdAt: Date;
}

export default function BillPayments() {
  const router = useRouter();
  const [theme, setTheme] = useState(themes.masculine);
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  
  // Estado para nova conta
  const [newBill, setNewBill] = useState<Omit<Bill, 'id' | 'createdAt'>>({
    description: '',
    amount: 0,
    dueDate: new Date(),
    isPaid: false,
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

  // Carregar contas
  useEffect(() => {
    const loadBills = async () => {
      try {
        setLoading(true);
        const storedBills = await AsyncStorage.getItem('@MyFinlove:bills');
        if (storedBills) {
          const parsedBills = JSON.parse(storedBills).map((bill: any) => ({
            ...bill,
            dueDate: new Date(bill.dueDate),
            createdAt: new Date(bill.createdAt)
          }));
          setBills(parsedBills);
        }
      } catch (error) {
        console.error('Erro ao carregar contas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadBills();
  }, []);

  // Salvar contas
  const saveBills = async (updatedBills: Bill[]) => {
    try {
      await AsyncStorage.setItem('@MyFinlove:bills', JSON.stringify(updatedBills));
    } catch (error) {
      console.error('Erro ao salvar contas:', error);
    }
  };

  // Adicionar nova conta
  const addBill = () => {
    if (!newBill.description || newBill.amount <= 0) {
      return;
    }
    
    const newBillItem: Bill = {
      ...newBill,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    const updatedBills = [...bills, newBillItem];
    setBills(updatedBills);
    saveBills(updatedBills);
    setModalVisible(false);
    
    // Resetar form
    setNewBill({
      description: '',
      amount: 0,
      dueDate: new Date(),
      isPaid: false,
      isShared: false,
      isRecurring: false,
    });
  };

  // Marcar como pago/não pago
  const togglePaid = (id: string) => {
    const updatedBills = bills.map(bill => 
      bill.id === id ? { ...bill, isPaid: !bill.isPaid } : bill
    );
    setBills(updatedBills);
    saveBills(updatedBills);
  };

  // Excluir conta
  const deleteBill = (id: string) => {
    const updatedBills = bills.filter(bill => bill.id !== id);
    setBills(updatedBills);
    saveBills(updatedBills);
  };

  // Formatação de data
  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  // Formatação de valor em reais
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contas a Pagar</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <>
          {bills.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma conta cadastrada</Text>
              <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.emptyButton, { backgroundColor: theme.primary }]}>
                <Text style={styles.emptyButtonText}>Adicionar Conta</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.content}>
              {/* Resumo */}
              <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(bills.reduce((sum, bill) => sum + bill.amount, 0))}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>A pagar</Text>
                  <Text style={[styles.summaryValue, { color: '#e74c3c' }]}>
                    {formatCurrency(bills.filter(bill => !bill.isPaid).reduce((sum, bill) => sum + bill.amount, 0))}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Pagas</Text>
                  <Text style={[styles.summaryValue, { color: '#2ecc71' }]}>
                    {formatCurrency(bills.filter(bill => bill.isPaid).reduce((sum, bill) => sum + bill.amount, 0))}
                  </Text>
                </View>
              </View>

              {/* Lista de contas */}
              {bills.map(bill => (
                <View key={bill.id} style={[
                  styles.billItem, 
                  bill.isPaid ? styles.billItemPaid : null,
                  new Date(bill.dueDate) < new Date() && !bill.isPaid ? styles.billItemOverdue : null
                ]}>
                  <TouchableOpacity 
                    style={styles.billCheckbox}
                    onPress={() => togglePaid(bill.id)}
                  >
                    <CheckCircle 
                      size={24} 
                      color={bill.isPaid ? '#2ecc71' : '#ccc'} 
                      fill={bill.isPaid ? '#2ecc71' : 'transparent'} 
                    />
                  </TouchableOpacity>
                  
                  <View style={styles.billInfo}>
                    <Text style={styles.billDescription}>{bill.description}</Text>
                    <Text style={styles.billAmount}>{formatCurrency(bill.amount)}</Text>
                    
                    <View style={styles.billMetaContainer}>
                      <View style={styles.billMetaItem}>
                        <Calendar size={14} color="#666" />
                        <Text style={styles.billMeta}>{formatDate(bill.dueDate)}</Text>
                      </View>
                      
                      {bill.isShared && (
                        <View style={styles.billMetaItem}>
                          <Users size={14} color="#666" />
                          <Text style={styles.billMeta}>Compartilhada</Text>
                        </View>
                      )}
                      
                      {bill.isRecurring && (
                        <View style={styles.billMetaItem}>
                          <Text style={styles.billMeta}>Recorrente</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.billDelete}
                    onPress={() => deleteBill(bill.id)}
                  >
                    <Trash2 size={20} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}

      {/* Modal para adicionar nova conta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Conta</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Internet, Aluguel, etc."
                value={newBill.description}
                onChangeText={(text) => setNewBill({...newBill, description: text})}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Valor</Text>
              <View style={styles.currencyInputContainer}>
                <Text style={styles.currencySymbol}>R$</Text>
                <TextInput
                  style={styles.currencyInput}
                  placeholder="0,00"
                  keyboardType="decimal-pad"
                  value={newBill.amount > 0 ? newBill.amount.toString() : ''}
                  onChangeText={(text) => {
                    const numericValue = parseFloat(text.replace(',', '.')) || 0;
                    setNewBill({...newBill, amount: numericValue});
                  }}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Data de Vencimento</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setDatePickerVisible(true)}
              >
                <Text style={styles.datePickerButtonText}>
                  {formatDate(newBill.dueDate)}
                </Text>
                <Calendar size={20} color="#666" />
              </TouchableOpacity>
              
              {datePickerVisible && (
                <DateTimePicker
                  value={newBill.dueDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setDatePickerVisible(Platform.OS === 'ios');
                    if (selectedDate) {
                      setNewBill({...newBill, dueDate: selectedDate});
                    }
                  }}
                />
              )}
            </View>

            <View style={styles.switchGroup}>
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Conta Compartilhada</Text>
                <Switch
                  trackColor={{ false: '#ccc', true: theme.primary }}
                  thumbColor="#fff"
                  value={newBill.isShared}
                  onValueChange={(value) => setNewBill({...newBill, isShared: value})}
                />
              </View>
              
              <View style={styles.switchItem}>
                <Text style={styles.switchLabel}>Recorrente Mensal</Text>
                <Switch
                  trackColor={{ false: '#ccc', true: theme.primary }}
                  thumbColor="#fff"
                  value={newBill.isRecurring}
                  onValueChange={(value) => setNewBill({...newBill, isRecurring: value})}
                />
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.modalSaveButton,
                  { backgroundColor: theme.primary }
                ]}
                onPress={addBill}
              >
                <Text style={styles.modalSaveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  billItemPaid: {
    opacity: 0.7,
    backgroundColor: '#f8fff8',
  },
  billItemOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  billCheckbox: {
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
  },
  billDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  billMetaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  billMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  billMeta: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  billDelete: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#333',
    marginRight: 4,
  },
  currencyInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  switchGroup: {
    marginBottom: 20,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  modalSaveButton: {
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
}); 