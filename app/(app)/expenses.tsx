import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, TextInput, Platform, KeyboardAvoidingView, Switch, AppState } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Search, List, MoreVertical, AlertCircle, Plus, Calendar, Check, CheckCircle, ChevronDown, CreditCard, Filter, Clock, X, Edit, DollarSign, CreditCard as CardIcon, Percent, ChevronLeft, ChevronRight, Home, PlusCircle, Bell, BarChart, Wallet, ExternalLink, ArrowUpCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import themes from '@/constants/themes';
import { fontFallbacks } from '@/utils/styles';
import DateTimePicker from '@react-native-community/datetimepicker';
import Svg, { Line, Circle, Path, Rect } from 'react-native-svg';

// Interface para as despesas
interface Expense {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  category: string;
  account: string;
  isPaid: boolean;
  createdAt: Date;
}

// Função para obter o tema inicial
const getInitialTheme = () => {
  // Verificar primeiro se há um tema global definido
  if (global.dashboardTheme === 'masculine') {
    return themes.masculine;
  }
  return themes.feminine; // Tema padrão
};

export default function Expenses() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [userBalance, setUserBalance] = useState(5000); // Saldo inicial do usuário (como exemplo)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [fees, setFees] = useState('0,00');
  const [theme, setTheme] = useState(getInitialTheme());
  
  // Estado para o modal de adicionar despesa
  const [addExpenseModalVisible, setAddExpenseModalVisible] = useState(false);
  const [newExpense, setNewExpense] = useState<{
    title: string;
    amount: string;
    category: string;
    account: string;
    dueDate: Date;
  }>({
    title: '',
    amount: '',
    category: 'Outros',
    account: 'Nubank',
    dueDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Estado para o menu de opções de cada despesa
  const [optionsMenuVisible, setOptionsMenuVisible] = useState(false);
  const [activeExpense, setActiveExpense] = useState<Expense | null>(null);
  
  // Menu secundário de exclusão
  const [deleteOptionsVisible, setDeleteOptionsVisible] = useState(false);
  
  // Estados para modais adicionais
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [changeValueModalVisible, setChangeValueModalVisible] = useState(false);
  const [cardExpenseModalVisible, setCardExpenseModalVisible] = useState(false);
  const [partialPaymentModalVisible, setPartialPaymentModalVisible] = useState(false);
  
  // Estado para edição de despesas
  const [editingExpense, setEditingExpense] = useState<{
    title: string;
    category: string;
    account: string;
    dueDate: Date;
  }>({
    title: '',
    category: 'Outros',
    account: 'Nubank',
    dueDate: new Date(),
  });
  
  // Estados para os seletores de categoria e conta
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [accountPickerVisible, setAccountPickerVisible] = useState(false);
  
  // Estado separado para o seletor de data no modal de edição
  const [editDatePickerVisible, setEditDatePickerVisible] = useState(false);
  
  // Opções disponíveis
  const categoryOptions = ['Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Vestuário', 'Outros'];
  const accountOptions = ['Nubank', 'Itaú', 'Bradesco', 'Santander', 'Caixa', 'Banco do Brasil', 'Inter', 'Outro'];
  
  // Estado para alteração de valor
  const [newAmount, setNewAmount] = useState('');
  
  // Estado para despesa de cartão
  const [cardDetails, setCardDetails] = useState({
    isCardExpense: false,
    cardName: 'Nubank',
    installments: '1',
  });
  
  // Estado para pagamento parcial
  const [partialAmount, setPartialAmount] = useState('');
  const [remainingAmount, setRemainingAmount] = useState(0);
  
  // Estados para o seletor de mês
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  
  // Estado para o modal de menu
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  
  // Salvar o tema no AsyncStorage quando ele for alterado
  const saveThemeToStorage = async (themeValue: string) => {
    try {
      await AsyncStorage.setItem('@MyFinlove:theme', themeValue);
      console.log('Tema salvo no AsyncStorage:', themeValue);
    } catch (error) {
      console.error('Erro ao salvar tema no AsyncStorage:', error);
    }
  };

  // Atualizar o tema e garantir que seja persistido
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

  // Verificar mudanças na variável global do tema
  useEffect(() => {
    // Criar uma função para verificar o tema atual
    const checkGlobalTheme = () => {
      const currentGlobalTheme = global.dashboardTheme;
      if (currentGlobalTheme === 'masculine' && theme !== themes.masculine) {
        setTheme(themes.masculine);
      } else if (currentGlobalTheme !== 'masculine' && theme !== themes.feminine) {
        setTheme(themes.feminine);
      }
    };

    // Verificar o tema quando o componente monta
    checkGlobalTheme();

    // Configurar o listener do AppState para verificar quando o app volta ao primeiro plano
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkGlobalTheme();
      }
    });

    // Limpar o listener quando o componente for desmontado
    return () => {
      subscription.remove();
    };
  }, [theme]);
  
  // Carregar tema e despesas
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Carregar tema - usando a variável global definida no dashboard, similar ao dashboard
        if (global.dashboardTheme === 'masculine') {
          updateTheme('masculine');
        } else {
          // Verificar o AsyncStorage como fallback
          const storedTheme = await AsyncStorage.getItem('@MyFinlove:theme');
          if (storedTheme === 'masculine') {
            updateTheme('masculine');
          } else {
            updateTheme('feminine');
          }
        }
        
        // Carregar saldo do usuário
        const storedBalance = await AsyncStorage.getItem('@MyFinlove:balance');
        if (storedBalance) {
          setUserBalance(parseFloat(storedBalance));
        } else {
          // Saldo inicial se não existir
          await AsyncStorage.setItem('@MyFinlove:balance', userBalance.toString());
        }
        
        // Carregar despesas
        const storedExpenses = await AsyncStorage.getItem('@MyFinlove:expenses');
        if (storedExpenses) {
          const parsedExpenses = JSON.parse(storedExpenses).map((expense: any) => ({
            ...expense,
            dueDate: new Date(expense.dueDate),
            createdAt: new Date(expense.createdAt)
          }));
          setExpenses(parsedExpenses);
        } else {
          // Criar exemplos para demonstração
          const exampleExpenses: Expense[] = [
            {
              id: '1',
              title: 'Academia',
              amount: 70,
              dueDate: new Date(2023, 3, 25), // 25 de Abril (mês é 0-indexed)
              category: 'Lazer',
              account: 'Nubank',
              isPaid: false,
              createdAt: new Date()
            },
            {
              id: '2',
              title: 'Aluguel',
              amount: 1200,
              dueDate: new Date(2023, 4, 7), // 7 de Maio
              category: 'Moradia',
              account: 'Itaú',
              isPaid: false,
              createdAt: new Date()
            },
            {
              id: '3',
              title: 'Internet',
              amount: 120,
              dueDate: new Date(2023, 3, 15), // 15 de Abril
              category: 'Serviços',
              account: 'Nubank',
              isPaid: false,
              createdAt: new Date()
            },
            {
              id: '4',
              title: 'Streaming',
              amount: 39.90,
              dueDate: new Date(2023, 3, 10), // 10 de Abril
              category: 'Entretenimento',
              account: 'Bradesco',
              isPaid: true,
              createdAt: new Date()
            }
          ];
          
          await AsyncStorage.setItem('@MyFinlove:expenses', JSON.stringify(exampleExpenses));
          setExpenses(exampleExpenses);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Salvar despesas
  const saveExpenses = async (updatedExpenses: Expense[]) => {
    try {
      await AsyncStorage.setItem('@MyFinlove:expenses', JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Erro ao salvar despesas:', error);
    }
  };

  // Salvar saldo
  const saveBalance = async (amount: number) => {
    try {
      await AsyncStorage.setItem('@MyFinlove:balance', amount.toString());
    } catch (error) {
      console.error('Erro ao salvar saldo:', error);
    }
  };

  // Abrir modal de confirmação de pagamento
  const openConfirmPaymentModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setFees('0,00'); // Reset fees
    setConfirmModalVisible(true);
  };

  // Efetivar o pagamento
  const effectivePayment = async () => {
    if (!selectedExpense) return;
    
    // Converter vírgula para ponto e transformar em número
    const feesValue = parseFloat(fees.replace(',', '.')) || 0;
    const totalAmount = selectedExpense.amount + feesValue;
    
    // 1. Atualizar status da despesa
    const updatedExpenses = expenses.map(expense => 
      expense.id === selectedExpense.id ? { ...expense, isPaid: true } : expense
    );
    setExpenses(updatedExpenses);
    await saveExpenses(updatedExpenses);
    
    // 2. Atualizar saldo
    const newBalance = userBalance - totalAmount;
    setUserBalance(newBalance);
    await saveBalance(newBalance);
    
    // 3. Fechar modal e mostrar mensagem
    setConfirmModalVisible(false);
    setSelectedExpense(null);
    
    Alert.alert(
      "Pagamento Efetivado",
      `O pagamento de ${selectedExpense.title} no valor de R$ ${totalAmount.toFixed(2)} foi confirmado e seu saldo foi atualizado para R$ ${newBalance.toFixed(2)}.`
    );
  };

  // Verificar se a data está atrasada
  const isOverdue = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Formatar data como dia e nome do dia da semana
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weekDay = weekDays[date.getDay()];
    return `${day}/${month} · ${weekDay}`;
  };

  // Calcular total de despesas não pagas
  const calculateTotal = () => {
    return expenses
      .filter(expense => !expense.isPaid)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  // Agrupar por mês
  const getMonthName = (date: Date) => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months[date.getMonth()];
  };

  // Filtrar e organizar as despesas
  const sortedExpenses = [...expenses].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  // Cor para despesas atrasadas (vermelho)
  const OVERDUE_COLOR = '#FF3B30';

  // Abrir modal de adicionar despesa
  const openAddExpenseModal = () => {
    setNewExpense({
      title: '',
      amount: '',
      category: 'Outros',
      account: 'Nubank',
      dueDate: new Date(),
    });
    setAddExpenseModalVisible(true);
  };
  
  // Adicionar nova despesa
  const addNewExpense = () => {
    if (!newExpense.title || !newExpense.amount) {
      Alert.alert('Erro', 'Preencha o título e o valor da despesa');
      return;
    }
    
    const amount = parseFloat(newExpense.amount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erro', 'Valor inválido');
      return;
    }
    
    const newId = Date.now().toString();
    const expenseToAdd: Expense = {
      id: newId,
      title: newExpense.title,
      amount: amount,
      dueDate: newExpense.dueDate,
      category: newExpense.category,
      account: newExpense.account,
      isPaid: false,
      createdAt: new Date(),
    };
    
    const updatedExpenses = [...expenses, expenseToAdd];
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    
    setAddExpenseModalVisible(false);
    Alert.alert('Sucesso', 'Despesa adicionada com sucesso!');
  };
  
  // Alterar data da nova despesa
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewExpense({ ...newExpense, dueDate: selectedDate });
    }
  };

  // Abrir menu de opções para uma despesa
  const openOptionsMenu = (expense: Expense) => {
    setActiveExpense(expense);
    setOptionsMenuVisible(true);
  };
  
  // Fechar menu de opções
  const closeOptionsMenu = () => {
    setOptionsMenuVisible(false);
    setActiveExpense(null);
  };
  
  // Abrir modal de edição
  const openEditModal = () => {
    if (!activeExpense) return;
    
    setEditingExpense({
      title: activeExpense.title,
      category: activeExpense.category,
      account: activeExpense.account,
      dueDate: new Date(activeExpense.dueDate),
    });
    
    setOptionsMenuVisible(false);
    setEditModalVisible(true);
    // Resetar os estados dos pickers quando abrir o modal
    setShowDatePicker(false);
    setEditDatePickerVisible(false);
    setCategoryPickerVisible(false);
    setAccountPickerVisible(false);
  };
  
  // Salvar edições
  const saveEdit = () => {
    if (!activeExpense) return;
    if (!editingExpense.title) {
      Alert.alert('Erro', 'O título não pode estar vazio.');
      return;
    }
    
    const updatedExpenses = expenses.map(expense => {
      if (expense.id === activeExpense.id) {
        return {
          ...expense,
          title: editingExpense.title,
          category: editingExpense.category,
          account: editingExpense.account,
          dueDate: editingExpense.dueDate,
        };
      }
      return expense;
    });
    
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    setEditModalVisible(false);
    setActiveExpense(null);
    
    Alert.alert('Sucesso', 'Despesa atualizada com sucesso!');
  };
  
  // Abrir modal de alteração de valor
  const openChangeValueModal = () => {
    if (!activeExpense) return;
    
    setNewAmount(activeExpense.amount.toString());
    setOptionsMenuVisible(false);
    setChangeValueModalVisible(true);
  };
  
  // Salvar novo valor
  const saveNewValue = () => {
    if (!activeExpense) return;
    
    const amount = parseFloat(newAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Erro', 'Valor inválido');
      return;
    }
    
    const updatedExpenses = expenses.map(expense => {
      if (expense.id === activeExpense.id) {
        return {
          ...expense,
          amount: amount,
        };
      }
      return expense;
    });
    
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    setChangeValueModalVisible(false);
    setActiveExpense(null);
    
    Alert.alert('Sucesso', 'Valor da despesa atualizado com sucesso!');
  };
  
  // Abrir modal de despesa de cartão
  const openCardExpenseModal = () => {
    if (!activeExpense) return;
    
    setCardDetails({
      isCardExpense: activeExpense.hasOwnProperty('isCardExpense') 
        ? (activeExpense as any).isCardExpense
        : false,
      cardName: (activeExpense as any).cardName || 'Nubank',
      installments: (activeExpense as any).installments || '1',
    });
    
    setOptionsMenuVisible(false);
    setCardExpenseModalVisible(true);
  };
  
  // Salvar detalhes do cartão
  const saveCardDetails = () => {
    if (!activeExpense) return;
    
    const installments = parseInt(cardDetails.installments);
    if (isNaN(installments) || installments <= 0) {
      Alert.alert('Erro', 'Número de parcelas inválido');
      return;
    }
    
    const updatedExpenses = expenses.map(expense => {
      if (expense.id === activeExpense.id) {
        return {
          ...expense,
          isCardExpense: cardDetails.isCardExpense,
          cardName: cardDetails.cardName,
          installments: cardDetails.installments,
        };
      }
      return expense;
    });
    
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    setCardExpenseModalVisible(false);
    setActiveExpense(null);
    
    Alert.alert('Sucesso', 'Despesa de cartão configurada com sucesso!');
  };
  
  // Abrir modal de pagamento parcial
  const openPartialPaymentModal = () => {
    if (!activeExpense) return;
    
    setPartialAmount('');
    setRemainingAmount(activeExpense.amount);
    setOptionsMenuVisible(false);
    setPartialPaymentModalVisible(true);
  };
  
  // Calcular valor restante
  const calculateRemaining = (value: string) => {
    if (!activeExpense) return;
    
    const partial = parseFloat(value.replace(',', '.'));
    if (isNaN(partial) || partial <= 0) {
      setRemainingAmount(activeExpense.amount);
      return;
    }
    
    const remaining = Math.max(0, activeExpense.amount - partial);
    setRemainingAmount(remaining);
  };
  
  // Efetivar pagamento parcial
  const effectivePartialPayment = () => {
    if (!activeExpense) return;
    
    const partial = parseFloat(partialAmount.replace(',', '.'));
    if (isNaN(partial) || partial <= 0 || partial > activeExpense.amount) {
      Alert.alert('Erro', 'Valor parcial inválido');
      return;
    }
    
    // Atualizar saldo
    const newBalance = userBalance - partial;
    setUserBalance(newBalance);
    saveBalance(newBalance);
    
    // Se pagou tudo, marcar como pago
    if (partial >= activeExpense.amount) {
      const updatedExpenses = expenses.map(expense => {
        if (expense.id === activeExpense.id) {
          return {
            ...expense,
            isPaid: true,
          };
        }
        return expense;
      });
      
      setExpenses(updatedExpenses);
      saveExpenses(updatedExpenses);
      setPartialPaymentModalVisible(false);
      setActiveExpense(null);
      
      Alert.alert('Sucesso', `Pagamento integral de R$ ${partial.toFixed(2)} efetuado com sucesso!`);
      return;
    }
    
    // Criar uma nova despesa com o valor restante
    const remaining = activeExpense.amount - partial;
    const newId = Date.now().toString();
    const remainingExpense: Expense = {
      ...activeExpense,
      id: newId,
      amount: remaining,
      isPaid: false,
    };
    
    // Marcar a despesa original como paga
    const updatedExpenses = expenses.map(expense => {
      if (expense.id === activeExpense.id) {
        return {
          ...expense,
          isPaid: true,
        };
      }
      return expense;
    });
    
    // Adicionar a nova despesa com o valor restante
    const finalExpenses = [...updatedExpenses, remainingExpense];
    setExpenses(finalExpenses);
    saveExpenses(finalExpenses);
    
    setPartialPaymentModalVisible(false);
    setActiveExpense(null);
    
    Alert.alert('Sucesso', `Pagamento parcial de R$ ${partial.toFixed(2)} efetuado com sucesso! Uma nova despesa foi criada com o valor restante de R$ ${remaining.toFixed(2)}.`);
  };
  
  // Atualizar funções existentes
  const editExpense = () => {
    openEditModal();
  };
  
  const changeValue = () => {
    openChangeValueModal();
  };
  
  const markAsCardExpense = () => {
    openCardExpenseModal();
  };
  
  const partialPayment = () => {
    openPartialPaymentModal();
  };

  // Abrir opções de exclusão
  const openDeleteOptions = () => {
    setOptionsMenuVisible(false);
    setDeleteOptionsVisible(true);
  };
  
  // Fechar opções de exclusão
  const closeDeleteOptions = () => {
    setDeleteOptionsVisible(false);
    setActiveExpense(null);
  };
  
  // Excluir apenas este mês
  const deleteThisMonth = () => {
    if (!activeExpense) return;
    
    const updatedExpenses = expenses.filter(expense => expense.id !== activeExpense.id);
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    
    closeDeleteOptions();
    Alert.alert('Sucesso', 'Despesa excluída apenas para este mês.');
  };
  
  // Excluir a partir deste mês
  const deleteFromThisMonth = () => {
    if (!activeExpense) return;
    
    const updatedExpenses = expenses.filter(expense => expense.id !== activeExpense.id);
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    
    closeDeleteOptions();
    Alert.alert('Sucesso', 'Despesa excluída a partir deste mês.');
  };
  
  // Excluir definitivamente
  const deleteDefinitively = () => {
    if (!activeExpense) return;
    
    const updatedExpenses = expenses.filter(expense => expense.id !== activeExpense.id);
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    
    closeDeleteOptions();
    Alert.alert('Sucesso', 'Despesa excluída definitivamente!');
  };
  
  // Excluir despesa - agora abre o menu secundário
  const deleteExpense = () => {
    if (!activeExpense) return;
    openDeleteOptions();
  };
  
  // Duplicar despesa
  const duplicateExpense = () => {
    if (!activeExpense) return;
    
    const newId = Date.now().toString();
    const duplicatedExpense: Expense = {
      ...activeExpense,
      id: newId,
      title: `${activeExpense.title} (cópia)`,
      createdAt: new Date(),
      isPaid: false,
    };
    
    const updatedExpenses = [...expenses, duplicatedExpense];
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    
    closeOptionsMenu();
    Alert.alert('Sucesso', 'Despesa duplicada com sucesso!');
  };
  
  // Efetivar pagamento (direto do menu)
  const markAsPaid = () => {
    if (!activeExpense || activeExpense.isPaid) {
      closeOptionsMenu();
      return;
    }
    
    // Atualizar status da despesa
    const updatedExpenses = expenses.map(expense => 
      expense.id === activeExpense.id ? { ...expense, isPaid: true } : expense
    );
    setExpenses(updatedExpenses);
    saveExpenses(updatedExpenses);
    
    // Atualizar saldo
    const newBalance = userBalance - activeExpense.amount;
    setUserBalance(newBalance);
    saveBalance(newBalance);
    
    closeOptionsMenu();
    Alert.alert(
      "Pagamento Efetivado",
      `O pagamento de ${activeExpense.title} no valor de R$ ${activeExpense.amount.toFixed(2)} foi confirmado.`
    );
  };

  // Função para navegar de volta
  const goBack = () => {
    router.push('/dashboard');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={[theme.primaryGradient[0], theme.primaryGradient[1]]}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={goBack} 
            style={styles.iconButton}
            accessibilityLabel="Voltar"
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Despesas</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Filter size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Search size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Financial Summary - Separated from header */}
        <View style={styles.financialSummary}>
          <View style={styles.balanceCard}>
            <Text style={styles.summaryLabel}>Saldo disponível</Text>
            <Text style={styles.balanceValue}>R$ {userBalance.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.payableCard}>
            <Text style={styles.summaryLabel}>Total a pagar</Text>
            <Text style={styles.payableValue}>R$ {calculateTotal().toFixed(2)}</Text>
          </View>
        </View>
        
        {/* Month Selector - Now outside of financialSummary */}
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
            <ChevronLeft size={20} color="#fff" />
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
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <>
          {/* Lista de despesas */}
          <ScrollView 
            style={styles.listContainer}
            contentContainerStyle={styles.listContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {sortedExpenses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma despesa encontrada</Text>
              </View>
            ) : (
              <>
                {/* Indicador de status */}
                <View style={styles.statusIndicators}>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: OVERDUE_COLOR }]} />
                    <Text style={styles.statusText}>Atrasada</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: theme.positive }]} />
                    <Text style={styles.statusText}>Paga</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <View style={[styles.statusDot, { backgroundColor: theme.primary }]} />
                    <Text style={styles.statusText}>A vencer</Text>
                  </View>
                </View>

                {sortedExpenses.map((expense) => {
                  const isExpenseOverdue = !expense.isPaid && isOverdue(new Date(expense.dueDate));
                  const statusColor = expense.isPaid 
                    ? theme.positive 
                    : isExpenseOverdue 
                      ? OVERDUE_COLOR 
                      : theme.primary;
                  
                  // Status text and styling
                  const statusText = expense.isPaid 
                    ? "Pago" 
                    : isExpenseOverdue 
                      ? "Atrasado" 
                      : "A vencer";
                    
                  return (
                    <View key={expense.id} style={[
                      styles.expenseItem,
                      { backgroundColor: theme.card }
                    ]}>
                      <View style={styles.expenseContent}>
                        <View style={styles.expenseMain}>
                          <View style={styles.expenseTitleRow}>
                            <Text style={styles.expenseTitle}>
                              {expense.title}
                            </Text>
                            
                            <View style={styles.expenseTitleRightContent}>
                              <Text style={[
                                styles.expenseAmount,
                                { fontWeight: '600' }
                              ]}>
                                R$ {expense.amount.toFixed(2)}
                              </Text>
                              
                              <TouchableOpacity 
                                style={styles.optionsButton}
                                onPress={() => openOptionsMenu(expense)}
                              >
                                <MoreVertical size={18} color="#666" />
                              </TouchableOpacity>
                            </View>
                          </View>
                          
                          <View style={styles.expenseMetaRow}>
                            <View style={[styles.expenseTag, { backgroundColor: `${theme.primary}10` }]}>
                              <Text style={[styles.expenseTagText, { color: theme.primary }]}>
                                {expense.category}
                              </Text>
                            </View>
                            <Text style={styles.expenseAccount}>{expense.account}</Text>
                          </View>
                          
                          <View style={styles.expenseDetailsRow}>
                            <View style={styles.expenseDateContainer}>
                              <Calendar size={14} color="#666" style={styles.expenseDateIcon} />
                              <Text style={styles.expenseDate}>
                                {formatDate(new Date(expense.dueDate))}
                              </Text>
                            </View>
                            
                            <View style={[
                              styles.statusIndicator,
                              {
                                backgroundColor: expense.isPaid 
                                  ? 'rgba(76, 217, 100, 0.1)' 
                                  : isExpenseOverdue 
                                    ? 'rgba(255, 59, 48, 0.1)' 
                                    : 'rgba(139, 92, 246, 0.1)',
                                borderColor: expense.isPaid 
                                  ? 'rgba(76, 217, 100, 0.3)' 
                                  : isExpenseOverdue 
                                    ? 'rgba(255, 59, 48, 0.3)' 
                                    : 'rgba(139, 92, 246, 0.3)'
                              }
                            ]}>
                              <Text style={[
                                styles.statusText,
                                {
                                  color: expense.isPaid 
                                    ? theme.positive 
                                    : isExpenseOverdue 
                                      ? OVERDUE_COLOR 
                                      : theme.primary
                                }
                              ]}>
                                {statusText}
                              </Text>
                            </View>
                          </View>
                          
                          {/* Botão para confirmar pagamento (apenas para despesas não pagas) */}
                          {!expense.isPaid && (
                            <TouchableOpacity 
                              style={[
                                styles.confirmButton,
                                { 
                                  backgroundColor: isExpenseOverdue 
                                    ? `${OVERDUE_COLOR}15` 
                                    : `${theme.primary}15`,
                                  borderColor: isExpenseOverdue 
                                    ? OVERDUE_COLOR 
                                    : theme.primary,
                                }
                              ]}
                              onPress={() => openConfirmPaymentModal(expense)}
                            >
                              <Text style={[
                                styles.confirmButtonText,
                                { 
                                  color: isExpenseOverdue 
                                    ? OVERDUE_COLOR 
                                    : theme.primary 
                                }
                              ]}>
                                Confirmar Pagamento
                              </Text>
                              <Check size={14} color={isExpenseOverdue ? OVERDUE_COLOR : theme.primary} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
            <View style={styles.bottomPadding} />
          </ScrollView>
          
          {/* Botão de adicionar */}
          {/* Removido o botão flutuante pois agora temos o botão no menu inferior */}
        </>
      )}

      {/* Modal de Confirmação de Pagamento */}
      <Modal
        visible={confirmModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: '#333' }]}>Efetivar Despesa</Text>
            
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Despesa</Text>
              <Text style={[styles.modalValue, { color: '#333' }]}>{selectedExpense?.title}</Text>
            </View>
            
            <View style={styles.modalRow}>
              <View style={styles.modalFieldHalf}>
                <Text style={styles.modalLabel}>Valor</Text>
                <Text style={[styles.modalValueLarge, { color: selectedExpense && isOverdue(new Date(selectedExpense.dueDate)) 
                  ? OVERDUE_COLOR : '#333' }]}>{selectedExpense ? selectedExpense.amount.toFixed(2) : "0,00"}</Text>
              </View>
              
              <View style={styles.modalFieldHalf}>
                <Text style={styles.modalLabel}>Encargos</Text>
                <View style={styles.feesContainer}>
                  <TextInput
                    style={[styles.feesInput, { color: '#333' }]}
                    value={fees}
                    onChangeText={setFees}
                    keyboardType="numeric"
                    placeholder="0,00"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Data pagamento</Text>
              <Text style={[styles.modalValue, { color: '#333' }]}>Hoje</Text>
            </View>
            
            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Conta</Text>
              <View style={styles.accountSelector}>
                <View style={[styles.accountCircle, { backgroundColor: theme.primary }]}>
                  <Text style={styles.accountInitial}>{selectedExpense?.account.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={[styles.accountName, { color: '#333' }]}>{selectedExpense?.account}</Text>
                <ChevronDown size={18} color="#666" />
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.primary }]}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.effectiveButton, { backgroundColor: theme.primary }]}
                onPress={effectivePayment}
              >
                <Text style={styles.effectiveButtonText}>Efetivar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Modal para Adicionar Nova Despesa */}
      <Modal
        visible={addExpenseModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddExpenseModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={[styles.addModalContent, { backgroundColor: theme.card }]}>
            <View style={styles.addModalHeader}>
              <Text style={styles.addModalTitle}>Nova Despesa</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setAddExpenseModalVisible(false)}
              >
                <X size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Título</Text>
                <TextInput 
                  style={styles.textInput}
                  value={newExpense.title}
                  onChangeText={(text) => setNewExpense({...newExpense, title: text})}
                  placeholder="Ex: Aluguel, Internet, Academia..."
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Valor (R$)</Text>
                <TextInput 
                  style={styles.textInput}
                  value={newExpense.amount}
                  onChangeText={(text) => setNewExpense({...newExpense, amount: text})}
                  placeholder="0,00"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Categoria</Text>
                <View style={styles.pickerButton}>
                  <Text style={styles.pickerButtonText}>{newExpense.category}</Text>
                  <ChevronDown size={16} color="#666" />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Conta</Text>
                <View style={styles.pickerButton}>
                  <Text style={styles.pickerButtonText}>{newExpense.account}</Text>
                  <ChevronDown size={16} color="#666" />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Data de vencimento</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={16} color="#666" style={styles.dateIcon} />
                  <Text style={styles.dateText}>
                    {newExpense.dueDate.toLocaleDateString('pt-BR')}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {showDatePicker && (
                <DateTimePicker
                  value={newExpense.dueDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
              
              <TouchableOpacity 
                style={[styles.addButton, {backgroundColor: theme.primary}]}
                onPress={addNewExpense}
              >
                <Text style={styles.addButtonText}>Adicionar Despesa</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Modal para Menu de Opções */}
      <Modal
        visible={optionsMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeOptionsMenu}
      >
        <TouchableOpacity 
          style={styles.optionsModalOverlay}
          activeOpacity={1}
          onPress={closeOptionsMenu}
        >
          <View style={[styles.optionsMenuContainer, { backgroundColor: theme.card }]}>
            <Text style={styles.optionsMenuTitle}>
              {activeExpense?.title}
            </Text>
            
            <TouchableOpacity style={styles.optionItem} onPress={editExpense}>
              <Text style={styles.optionText}>Editar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={deleteExpense}>
              <Text style={[styles.optionText, { color: OVERDUE_COLOR }]}>Excluir</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={changeValue}>
              <Text style={styles.optionText}>Alterar valor</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={duplicateExpense}>
              <Text style={styles.optionText}>Duplicar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={markAsCardExpense}>
              <Text style={styles.optionText}>Despesa cartão</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={partialPayment}>
              <Text style={styles.optionText}>Pagamento parcial</Text>
            </TouchableOpacity>
            
            {!activeExpense?.isPaid && (
              <TouchableOpacity 
                style={[styles.optionItem, styles.confirmOptionItem, {backgroundColor: `${theme.positive}15`}]} 
                onPress={markAsPaid}
              >
                <Text style={[styles.optionText, {color: theme.positive}]}>Efetivar pagamento</Text>
                <Check size={16} color={theme.positive} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.optionItem, styles.closeOptionItem]} 
              onPress={closeOptionsMenu}
            >
              <Text style={[styles.optionText, {fontWeight: '600'}]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Modal para Menu de Opções de Exclusão */}
      <Modal
        visible={deleteOptionsVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDeleteOptions}
      >
        <TouchableOpacity 
          style={styles.optionsModalOverlay}
          activeOpacity={1}
          onPress={closeDeleteOptions}
        >
          <View style={[styles.optionsMenuContainer, { backgroundColor: theme.card }]}>
            <Text style={styles.optionsMenuTitle}>
              Excluir: {activeExpense?.title}
            </Text>
            
            <TouchableOpacity style={styles.optionItem} onPress={deleteThisMonth}>
              <Text style={styles.optionText}>Excluir apenas este mês</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={deleteFromThisMonth}>
              <Text style={styles.optionText}>Excluir a partir deste mês</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionItem} onPress={deleteDefinitively}>
              <Text style={[styles.optionText, { color: OVERDUE_COLOR }]}>Excluir definitivamente</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionItem, styles.closeOptionItem]} 
              onPress={closeDeleteOptions}
            >
              <Text style={[styles.optionText, {fontWeight: '600'}]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Modal para editar despesa */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={[styles.addModalContent, { backgroundColor: theme.card }]}>
            <View style={styles.addModalHeader}>
              <Text style={styles.addModalTitle}>Editar Despesa</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setEditModalVisible(false)}
              >
                <X size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Título</Text>
                <TextInput 
                  style={styles.textInput}
                  value={editingExpense.title}
                  onChangeText={(text) => setEditingExpense({...editingExpense, title: text})}
                  placeholder="Ex: Aluguel, Internet, Academia..."
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Categoria</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setCategoryPickerVisible(true)}
                >
                  <Text style={styles.pickerButtonText}>{editingExpense.category}</Text>
                  <ChevronDown size={16} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Conta</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setAccountPickerVisible(true)}
                >
                  <Text style={styles.pickerButtonText}>{editingExpense.account}</Text>
                  <ChevronDown size={16} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Data de vencimento</Text>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setEditDatePickerVisible(true)}
                >
                  <Calendar size={16} color="#666" style={styles.dateIcon} />
                  <Text style={styles.dateText}>
                    {editingExpense.dueDate.toLocaleDateString('pt-BR')}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {editDatePickerVisible && Platform.OS === 'android' && (
                <DateTimePicker
                  value={editingExpense.dueDate}
                  mode="date"
                  display="default"
                  onChange={(e, date) => {
                    setEditDatePickerVisible(false);
                    if (date) {
                      setEditingExpense({...editingExpense, dueDate: date});
                    }
                  }}
                />
              )}
              
              {editDatePickerVisible && Platform.OS === 'ios' && (
                <Modal
                  transparent={true}
                  visible={editDatePickerVisible}
                  animationType="slide"
                >
                  <View style={styles.datePickerModalContainer}>
                    <View style={styles.datePickerModalContent}>
                      <View style={styles.datePickerHeader}>
                        <TouchableOpacity onPress={() => setEditDatePickerVisible(false)}>
                          <Text style={styles.datePickerCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => {
                            setEditDatePickerVisible(false);
                          }}
                        >
                          <Text style={styles.datePickerDoneText}>OK</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={editingExpense.dueDate}
                        mode="date"
                        display="spinner"
                        onChange={(e, date) => {
                          if (date) {
                            setEditingExpense({...editingExpense, dueDate: date});
                          }
                        }}
                        style={styles.datePickerIOS}
                      />
                    </View>
                  </View>
                </Modal>
              )}
              
              {/* Modal para seleção de categoria */}
              <Modal
                visible={categoryPickerVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setCategoryPickerVisible(false)}
              >
                <View style={styles.pickerModalContainer}>
                  <View style={styles.pickerModalContent}>
                    <View style={styles.pickerModalHeader}>
                      <Text style={styles.pickerModalTitle}>Selecione a Categoria</Text>
                      <TouchableOpacity onPress={() => setCategoryPickerVisible(false)}>
                        <X size={20} color="#666" />
                      </TouchableOpacity>
                    </View>
                    <ScrollView>
                      {categoryOptions.map((category) => (
                        <TouchableOpacity 
                          key={category}
                          style={[styles.pickerOption, editingExpense.category === category && styles.pickerOptionSelected]}
                          onPress={() => {
                            setEditingExpense({...editingExpense, category});
                            setCategoryPickerVisible(false);
                          }}
                        >
                          <Text 
                            style={[styles.pickerOptionText, editingExpense.category === category && styles.pickerOptionTextSelected]}
                          >
                            {category}
                          </Text>
                          {editingExpense.category === category && (
                            <Check size={20} color={theme.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
              
              {/* Modal para seleção de conta */}
              <Modal
                visible={accountPickerVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setAccountPickerVisible(false)}
              >
                <View style={styles.pickerModalContainer}>
                  <View style={styles.pickerModalContent}>
                    <View style={styles.pickerModalHeader}>
                      <Text style={styles.pickerModalTitle}>Selecione a Conta</Text>
                      <TouchableOpacity onPress={() => setAccountPickerVisible(false)}>
                        <X size={20} color="#666" />
                      </TouchableOpacity>
                    </View>
                    <ScrollView>
                      {accountOptions.map((account) => (
                        <TouchableOpacity 
                          key={account}
                          style={[styles.pickerOption, editingExpense.account === account && styles.pickerOptionSelected]}
                          onPress={() => {
                            setEditingExpense({...editingExpense, account});
                            setAccountPickerVisible(false);
                          }}
                        >
                          <Text 
                            style={[styles.pickerOptionText, editingExpense.account === account && styles.pickerOptionTextSelected]}
                          >
                            {account}
                          </Text>
                          {editingExpense.account === account && (
                            <Check size={20} color={theme.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
              
              <TouchableOpacity 
                style={[styles.addButton, {backgroundColor: theme.primary}]}
                onPress={saveEdit}
              >
                <Text style={styles.addButtonText}>Salvar Alterações</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Modal para alterar valor */}
      <Modal
        visible={changeValueModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setChangeValueModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={[styles.addModalContent, { backgroundColor: theme.card }]}>
            <View style={styles.addModalHeader}>
              <Text style={styles.addModalTitle}>Alterar Valor</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setChangeValueModalVisible(false)}
              >
                <X size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.valueChangeContainer}>
              <Text style={styles.valueChangeTitle}>{activeExpense?.title}</Text>
              
              <View style={styles.valueInputGroup}>
                <Text style={styles.valueInputLabel}>Novo valor (R$)</Text>
                <TextInput 
                  style={styles.valueInput}
                  value={newAmount}
                  onChangeText={setNewAmount}
                  keyboardType="numeric"
                  placeholder="0,00"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.valueButtonsContainer}>
                <TouchableOpacity 
                  style={styles.cancelValueButton}
                  onPress={() => setChangeValueModalVisible(false)}
                >
                  <Text style={[styles.cancelValueText, {color: theme.primary}]}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.saveValueButton, {backgroundColor: theme.primary}]}
                  onPress={saveNewValue}
                >
                  <Text style={styles.saveValueText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Modal para configurar despesa de cartão */}
      <Modal
        visible={cardExpenseModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCardExpenseModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={[styles.addModalContent, { backgroundColor: theme.card }]}>
            <View style={styles.addModalHeader}>
              <Text style={styles.addModalTitle}>Despesa de Cartão</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setCardExpenseModalVisible(false)}
              >
                <X size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cardExpenseContainer}>
              <Text style={styles.cardExpenseTitle}>{activeExpense?.title}</Text>
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>É despesa de cartão?</Text>
                <Switch
                  value={cardDetails.isCardExpense}
                  onValueChange={(value) => setCardDetails({...cardDetails, isCardExpense: value})}
                  trackColor={{ false: "#ccc", true: `${theme.primary}80` }}
                  thumbColor={cardDetails.isCardExpense ? theme.primary : "#f4f3f4"}
                />
              </View>
              
              {cardDetails.isCardExpense && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Cartão</Text>
                    <View style={styles.pickerButton}>
                      <Text style={styles.pickerButtonText}>{cardDetails.cardName}</Text>
                      <ChevronDown size={16} color="#666" />
                    </View>
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Número de parcelas</Text>
                    <TextInput 
                      style={styles.textInput}
                      value={cardDetails.installments}
                      onChangeText={(text) => setCardDetails({...cardDetails, installments: text})}
                      keyboardType="numeric"
                      placeholder="1"
                      placeholderTextColor="#999"
                    />
                  </View>
                </>
              )}
              
              <TouchableOpacity 
                style={[styles.addButton, {backgroundColor: theme.primary}]}
                onPress={saveCardDetails}
              >
                <Text style={styles.addButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Modal para pagamento parcial */}
      <Modal
        visible={partialPaymentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPartialPaymentModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={[styles.addModalContent, { backgroundColor: theme.card }]}>
            <View style={styles.addModalHeader}>
              <Text style={styles.addModalTitle}>Pagamento Parcial</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setPartialPaymentModalVisible(false)}
              >
                <X size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.partialPaymentContainer}>
              <Text style={styles.partialPaymentTitle}>{activeExpense?.title}</Text>
              
              <View style={styles.partialPaymentInfo}>
                <Text style={styles.partialPaymentLabel}>Valor total</Text>
                <Text style={styles.partialPaymentTotal}>
                  R$ {activeExpense ? activeExpense.amount.toFixed(2) : "0,00"}
                </Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Valor a pagar agora (R$)</Text>
                <TextInput 
                  style={styles.textInput}
                  value={partialAmount}
                  onChangeText={(text) => {
                    setPartialAmount(text);
                    calculateRemaining(text);
                  }}
                  keyboardType="numeric"
                  placeholder="0,00"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.partialPaymentInfo}>
                <Text style={styles.partialPaymentLabel}>Valor restante</Text>
                <Text style={styles.partialPaymentRemaining}>
                  R$ {remainingAmount.toFixed(2)}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.addButton, {backgroundColor: theme.primary}]}
                onPress={effectivePartialPayment}
              >
                <Text style={styles.addButtonText}>Efetivar Pagamento Parcial</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuModalVisible}
        onRequestClose={() => setMenuModalVisible(false)}
      >
        <View style={styles.menuModalContainer}>
          <View style={[styles.menuModalContent, { backgroundColor: theme.card }]}>
            <View style={styles.menuHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setMenuModalVisible(false)}
              >
                <Text style={[styles.closeButtonText, { color: theme.primary }]}>Fechar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.menuGrid}>
              {/* Primeira linha */}
              <View style={styles.menuRow}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/dashboard');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <Home size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Dashboard</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Visão geral</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/registers');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <PlusCircle size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Novo Registro</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Adicionar transação</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/notifications');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <Bell size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Notificações</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Alertas e avisos</Text>
                </TouchableOpacity>
              </View>

              {/* Segunda linha */}
              <View style={styles.menuRow}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/planning' as any);
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <BarChart size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Planejamento</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Orçamentos e metas</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/cards');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <CreditCard size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Cartões</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Cartões de crédito</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/expenses');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <Wallet size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Contas a Pagar</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Gerenciar pagamentos</Text>
                </TouchableOpacity>
              </View>

              {/* Terceira linha */}
              <View style={styles.menuRow}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/accounts');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <Wallet size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Contas</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Gerenciar contas</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/receitas');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <ArrowUpCircle size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Receitas</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Gerenciar receitas</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.replace('/(auth)/login');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.15)` }]}>
                    <ExternalLink size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Logout</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Sair do aplicativo</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.closeFullButton, { backgroundColor: theme.primary }]}
              onPress={() => setMenuModalVisible(false)}
            >
              <Text style={styles.closeFullButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Menu Inferior */}
      <View style={[styles.bottomNav, { backgroundColor: 'white' }]}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/dashboard')}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Line x1="12" y1="20" x2="12" y2="10" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="18" y1="20" x2="18" y2="4" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="6" y1="20" x2="6" y2="16" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setMenuModalVisible(true)}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Line x1="4" y1="12" x2="20" y2="12" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="4" y1="6" x2="20" y2="6" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="4" y1="18" x2="20" y2="18" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.navText}>Menu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={openAddExpenseModal}
        >
          <View style={[styles.addButtonInner, { backgroundColor: theme.primary }]}>
            <Svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M12 17V7" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.navText}>Notificações</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <Rect width="20" height="14" x="2" y="5" rx="2" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Line x1="2" y1="10" x2="22" y2="10" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.navText}>Cartões</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? 25 : 40,
    paddingBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    flex: 1,
    marginLeft: 10,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // New financial summary styles
  financialSummary: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginTop: 5,
  },
  balanceCard: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  payableCard: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    marginBottom: 4,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  payableValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  listContainer: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 48,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  // Status indicators
  statusIndicators: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 8,
    borderRadius: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  expenseItem: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  expenseContent: {
    padding: 16,
  },
  expenseMain: {
    flex: 1,
  },
  expenseTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    flex: 1,
    marginRight: 12,
  },
  expenseTitleRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseAmount: {
    fontSize: 16,
    color: '#333',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  optionsButton: {
    padding: 4,
    marginLeft: 8,
  },
  expenseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  expenseTag: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  expenseTagText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  expenseAccount: {
    color: '#666',
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  expenseDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  expenseDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseDateIcon: {
    marginRight: 4,
  },
  expenseDate: {
    color: '#666',
    fontSize: 13,
    fontFamily: fontFallbacks.Poppins_400Regular,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  confirmButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 6,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  // Estilo do fab removido pois o botão foi removido
  bottomPadding: {
    height: 80,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  modalField: {
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalFieldHalf: {
    width: '48%',
  },
  modalLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  modalValueLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  feesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feesInput: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 0,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  accountSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  accountCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  accountInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    fontFamily: fontFallbacks.Poppins_500Medium,
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
    fontWeight: 'bold',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  effectiveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  effectiveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },

  // Estilos para o modal de adicionar despesa
  addModalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  addModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  closeButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  pickerButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  datePickerButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  addButton: {
    marginTop: -30,
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },

  // Estilos para o modal de opções
  optionsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsMenuContainer: {
    borderRadius: 12,
    width: '80%',
    maxWidth: 320,
    paddingVertical: 8,
    paddingHorizontal: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  optionsMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  confirmOptionItem: {
    paddingVertical: 14,
    marginTop: 4,
  },
  closeOptionItem: {
    paddingVertical: 14,
    justifyContent: 'center',
    marginTop: 8,
    borderBottomWidth: 0,
  },

  // Estilos para o modal de alterar valor
  valueChangeContainer: {
    padding: 16,
  },
  datePickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  datePickerCancelText: {
    color: '#999',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  datePickerDoneText: {
    color: '#9c27b0',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  datePickerIOS: {
    height: 200,
  },
  pickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(156, 39, 176, 0.05)',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  pickerOptionTextSelected: {
    color: '#9c27b0',
    fontWeight: '500',
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  valueChangeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  valueInputGroup: {
    marginBottom: 24,
  },
  valueInputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  valueInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  valueButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelValueButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
  },
  cancelValueText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  saveValueButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 8,
  },
  saveValueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  
  // Estilos para o modal de despesa de cartão
  cardExpenseContainer: {
    padding: 16,
  },
  cardExpenseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  
  // Estilos para o modal de pagamento parcial
  partialPaymentContainer: {
    padding: 16,
  },
  partialPaymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  partialPaymentInfo: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  partialPaymentLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  partialPaymentTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  partialPaymentRemaining: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    paddingBottom: 1,
  },
  monthArrow: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    textDecorationLine: 'underline',
    marginHorizontal: 10,
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
  addButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 1 }],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }
    }),
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
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
  menuModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuModalContent: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  menuGrid: {
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  menuItem: {
    width: '30%',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuItemTitle: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    textAlign: 'center',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    textAlign: 'center',
    opacity: 0.8,
  },
  closeFullButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    marginTop: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  closeFullButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
}); 