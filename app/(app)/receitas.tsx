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
import { supabase } from '@/lib/supabase';

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
  account?: string;
}

export default function ReceitasScreen() {
  // Verificar se deve abrir o histórico automaticamente
  useEffect(() => {
    // TODO: Implementar verificação de parâmetros da rota se necessário
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

  // Estado separado para o texto da data
  const [dateText, setDateText] = useState(new Date().toLocaleDateString('pt-BR'));
  
  // Estados para contas
  const [userAccounts, setUserAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [accountsVisible, setAccountsVisible] = useState(false);

  // Estados para o calendário
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [pickerDay, setPickerDay] = useState(new Date().getDate());
  const [selectedDate, setSelectedDate] = useState(
    `${String(new Date().getDate()).padStart(2, '0')}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`
  );

  // Constantes para o calendário
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

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

  // Carregar receitas do Supabase
  useEffect(() => {
    const loadIncomes = async () => {
      try {
        setLoading(true);
        
        // Obter a sessão atual para o ID do usuário
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          return;
        }
        
        if (!session?.user) {
          console.log('Nenhuma sessão de usuário encontrada');
          return;
        }
        
        // Buscar receitas do usuário
        const { data: incomesData, error: incomesError } = await supabase
          .from('incomes')
          .select('*')
          .order('receipt_date', { ascending: false });
          
        if (incomesError) {
          console.error('Erro ao buscar receitas:', incomesError);
          return;
        }
        
        if (incomesData) {
          // Converter dados do banco para o formato esperado
          const formattedIncomes = incomesData.map((income: any) => ({
            id: income.id,
            description: income.description,
            amount: parseFloat(income.amount),
            receiptDate: new Date(income.receipt_date),
            isReceived: income.is_received,
            isShared: income.is_shared,
            isRecurring: income.is_recurring,
            createdAt: new Date(income.created_at),
            category: income.category,
            account: income.account_name || 'Minha Carteira'
          }));
          
          setIncomes(formattedIncomes);
        }
      } catch (error) {
        console.error('Erro ao carregar receitas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadIncomes();
    loadUserAccounts();
  }, []);

  // Carregar contas do usuário
  const loadUserAccounts = async () => {
    try {
      // Obter a sessão atual para o ID do usuário
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
      
      // Buscar as contas do usuário (próprias ou compartilhadas)
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .or(`owner_id.eq.${userId},partner_id.eq.${userId}`);
        
      if (accountsError) {
        console.error('Erro ao buscar contas do usuário:', accountsError);
        return;
      }
      
      if (accounts && accounts.length > 0) {
        // Formatar as contas para o formato esperado
        const formattedAccounts = accounts.map(account => ({
          id: account.id,
          name: account.name,
          type: account.type,
          bank: account.bank || '',
          balance: parseFloat(account.balance) || 0
        }));
        
        setUserAccounts(formattedAccounts);
        
        // Define a primeira conta como padrão se não houver selecionada
        if (formattedAccounts.length > 0 && !selectedAccount) {
          setSelectedAccount(formattedAccounts[0]);
        }
      } else {
        console.log('Nenhuma conta encontrada para o usuário');
        // Se não houver contas, cria uma conta padrão
        const defaultAccount = {
          id: 'default',
          name: 'Minha Carteira',
          type: 'Dinheiro Físico',
          bank: '',
          balance: 0
        };
        setUserAccounts([defaultAccount]);
        setSelectedAccount(defaultAccount);
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      // Em caso de erro, define conta padrão
      const defaultAccount = {
        id: 'default',
        name: 'Minha Carteira',
        type: 'Dinheiro Físico',
        bank: '',
        balance: 0
      };
      setUserAccounts([defaultAccount]);
      setSelectedAccount(defaultAccount);
    }
  };

  // Funções para o calendário do modal de receita
  const toggleCalendar = () => {
    setCalendarVisible(!calendarVisible);
  };

  const goToPreviousPickerMonth = () => {
    if (pickerMonth === 0) {
      setPickerMonth(11);
      setPickerYear(pickerYear - 1);
    } else {
      setPickerMonth(pickerMonth - 1);
    }
  };

  const goToNextPickerMonth = () => {
    if (pickerMonth === 11) {
      setPickerMonth(0);
      setPickerYear(pickerYear + 1);
    } else {
      setPickerMonth(pickerMonth + 1);
    }
  };

  const selectDateFromPicker = (day: number) => {
    setPickerDay(day);
    const newDate = `${String(day).padStart(2, '0')}/${String(pickerMonth + 1).padStart(2, '0')}/${pickerYear}`;
    setSelectedDate(newDate);
    setDateText(newDate);
    
    // Atualizar a data da receita
    const receiptDate = new Date(pickerYear, pickerMonth, day);
    setNewIncome(prev => ({ ...prev, receiptDate }));
    
    setCalendarVisible(false);
  };

  // Função para gerar os dias do mês para o calendário do modal
  const generatePickerCalendarDays = () => {
    const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(pickerYear, pickerMonth, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    // Dias do mês anterior para completar a primeira semana
    const daysFromPreviousMonth = adjustedFirstDay;
    const previousMonthDays = [];
    if (daysFromPreviousMonth > 0) {
      const daysInPreviousMonth = new Date(pickerYear, pickerMonth, 0).getDate();
      for (let i = daysInPreviousMonth - daysFromPreviousMonth + 1; i <= daysInPreviousMonth; i++) {
        previousMonthDays.push({
          day: i,
          currentMonth: false,
          date: new Date(pickerYear, pickerMonth - 1, i)
        });
      }
    }
    
    // Dias do mês atual
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        day: i,
        currentMonth: true,
        date: new Date(pickerYear, pickerMonth, i)
      });
    }
    
    // Dias do próximo mês para completar a última semana
    const remainingDays = (7 - ((adjustedFirstDay + daysInMonth) % 7)) % 7;
    const nextMonthDays = [];
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        day: i,
        currentMonth: false,
        date: new Date(pickerYear, pickerMonth + 1, i)
      });
    }
    
    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Renderizar os dias do calendário em formato de grade para o modal
  const renderPickerCalendarGrid = () => {
    const days = generatePickerCalendarDays();
    const rows: JSX.Element[] = [];
    let cells: JSX.Element[] = [];

    // Adicionar cabeçalho dos dias da semana
    const headerCells = weekDays.map((day, index) => (
      <View key={`picker-header-${index}`} style={styles.pickerCalendarHeaderCell}>
        <Text style={styles.pickerCalendarHeaderText}>{day}</Text>
      </View>
    ));
    rows.push(
      <View key="picker-header" style={styles.pickerCalendarRow}>
        {headerCells}
      </View>
    );

    // Agrupar os dias em semanas
    days.forEach((day, index) => {
      const isSelected = pickerDay === day.day && day.currentMonth;
      
      cells.push(
        <TouchableOpacity
          key={`picker-day-${index}`}
          style={[
            styles.pickerCalendarCell,
            day.currentMonth ? styles.pickerCurrentMonthCell : styles.pickerOtherMonthCell,
            isSelected ? styles.pickerSelectedCell : null
          ]}
          onPress={() => day.currentMonth && selectDateFromPicker(day.day)}
        >
          <View
            style={[
              styles.pickerDayCircle,
              isSelected ? styles.pickerSelectedDayCircle : null
            ]}
          >
            <Text
              style={[
                styles.pickerCalendarDay,
                day.currentMonth ? styles.pickerCurrentMonthDay : styles.pickerOtherMonthDay,
                isSelected ? [styles.pickerSelectedDayText, { color: theme.primary }] : null
              ]}
            >
              {day.day}
            </Text>
          </View>
        </TouchableOpacity>
      );

      // Completar uma semana
      if ((index + 1) % 7 === 0 || index === days.length - 1) {
        rows.push(
          <View key={`picker-row-${Math.floor(index / 7)}`} style={styles.pickerCalendarRow}>
            {cells}
          </View>
        );
        cells = [];
      }
    });

    return rows;
  };

  // Adicionar nova receita
  const addIncome = async () => {
    if (!newIncome.description || newIncome.amount <= 0) {
      Alert.alert('Erro', 'Por favor, preencha a descrição e um valor válido.');
      return;
    }
    
    try {
      // Obter a sessão atual para o ID do usuário
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }
      
      // Converter a data do texto para Date
      const dateParts = dateText.split('/');
      let receiptDate = newIncome.receiptDate;
      
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Mês é 0-indexado
        const year = parseInt(dateParts[2]);
        
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          receiptDate = new Date(year, month, day);
        }
      }
      
      // Preparar dados para inserção no Supabase
      const incomeData = {
        description: newIncome.description,
        amount: newIncome.amount,
        receipt_date: receiptDate.toISOString(),
        is_received: newIncome.isReceived,
        is_shared: newIncome.isShared,
        is_recurring: newIncome.isRecurring,
        category: newIncome.category || null,
        account_id: selectedAccount?.id || null,
        account_name: selectedAccount?.name || 'Minha Carteira',
        owner_id: session.user.id,
        partner_id: newIncome.isShared ? null : null // TODO: Implementar lógica de parceiro
      };
      
      // Inserir no Supabase
      const { data, error } = await supabase
        .from('incomes')
        .insert([incomeData])
        .select()
        .single();
        
      if (error) {
        console.error('Erro ao salvar receita:', error);
        Alert.alert('Erro', 'Não foi possível salvar a receita. Tente novamente.');
        return;
      }
      
      if (data) {
        // Converter dados do banco para o formato esperado e adicionar à lista local
        const newIncomeItem: Income = {
          id: data.id,
          description: data.description,
          amount: parseFloat(data.amount),
          receiptDate: new Date(data.receipt_date),
          isReceived: data.is_received,
          isShared: data.is_shared,
          isRecurring: data.is_recurring,
          createdAt: new Date(data.created_at),
          category: data.category,
          account: data.account_name || 'Minha Carteira'
        };
        
        // Atualizar lista local
        const updatedIncomes = [newIncomeItem, ...incomes];
        setIncomes(updatedIncomes);
        
        setModalVisible(false);
        Alert.alert('Sucesso', 'Receita cadastrada com sucesso!');
        
        // Resetar form
        setNewIncome({
          description: '',
          amount: 0,
          receiptDate: new Date(),
          isReceived: false,
          isShared: false,
          isRecurring: false,
        });
        setDateText(new Date().toLocaleDateString('pt-BR'));
        setAccountsVisible(false);
        setCalendarVisible(false);
        
        // Resetar estados do calendário
        const today = new Date();
        setPickerMonth(today.getMonth());
        setPickerYear(today.getFullYear());
        setPickerDay(today.getDate());
        setSelectedDate(`${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`);
        
        // Manter a conta selecionada para facilitar próximos lançamentos
      }
    } catch (error) {
      console.error('Erro inesperado ao salvar receita:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    }
  };

  // Marcar como recebida/não recebida
  const toggleReceived = async (id: string) => {
    const income = incomes.find(inc => inc.id === id);
    if (!income) return;
    
    try {
      const newStatus = !income.isReceived;
      
      // Atualizar no Supabase
      const { error } = await supabase
        .from('incomes')
        .update({ is_received: newStatus })
        .eq('id', id);
        
      if (error) {
        console.error('Erro ao atualizar receita:', error);
        Alert.alert('Erro', 'Não foi possível atualizar a receita. Tente novamente.');
        return;
      }
      
      // Atualizar lista local
      const updatedIncomes = incomes.map(income => 
        income.id === id ? { ...income, isReceived: newStatus } : income
      );
      setIncomes(updatedIncomes);
      
      // Feedback visual para o usuário
      const status = newStatus ? 'recebida' : 'pendente';
      Alert.alert(
        `Receita ${status}`,
        `A receita "${income.description}" foi marcada como ${status}.`,
        [{ text: 'OK' }],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Erro inesperado ao atualizar receita:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
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
  const deleteThisMonth = async () => {
    if (!selectedIncomeId) return;
    
    try {
      // Excluir do Supabase
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', selectedIncomeId);
        
      if (error) {
        console.error('Erro ao excluir receita:', error);
        Alert.alert('Erro', 'Não foi possível excluir a receita. Tente novamente.');
        return;
      }
      
      // Atualizar lista local
      const updatedIncomes = incomes.filter(income => income.id !== selectedIncomeId);
      setIncomes(updatedIncomes);
      setDeleteOptionsVisible(false);
      
      Alert.alert('Sucesso', 'Receita excluída com sucesso!');
    } catch (error) {
      console.error('Erro inesperado ao excluir receita:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    }
  };

  // Excluir a partir deste mês
  const deleteFromThisMonth = async () => {
    if (!selectedIncomeId) return;
    
    try {
      // Excluir do Supabase
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', selectedIncomeId);
        
      if (error) {
        console.error('Erro ao excluir receita:', error);
        Alert.alert('Erro', 'Não foi possível excluir a receita. Tente novamente.');
        return;
      }
      
      // Atualizar lista local
      const updatedIncomes = incomes.filter(income => income.id !== selectedIncomeId);
      setIncomes(updatedIncomes);
      setDeleteOptionsVisible(false);
      
      Alert.alert('Sucesso', 'Receita excluída a partir deste mês com sucesso!');
    } catch (error) {
      console.error('Erro inesperado ao excluir receita:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    }
  };

  // Excluir definitivamente
  const deleteDefinitively = async () => {
    if (!selectedIncomeId) return;
    
    try {
      // Excluir do Supabase
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', selectedIncomeId);
        
      if (error) {
        console.error('Erro ao excluir receita:', error);
        Alert.alert('Erro', 'Não foi possível excluir a receita. Tente novamente.');
        return;
      }
      
      // Atualizar lista local
      const updatedIncomes = incomes.filter(income => income.id !== selectedIncomeId);
      setIncomes(updatedIncomes);
      setDeleteOptionsVisible(false);
      
      Alert.alert('Sucesso', 'Receita excluída definitivamente com sucesso!');
    } catch (error) {
      console.error('Erro inesperado ao excluir receita:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    }
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

  // Formatação de valor para input (sem separadores de milhares)
  const formatCurrencyInput = (value: number) => {
    const valueStr = value.toString();
    const parts = valueStr.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1].padEnd(2, '0').substring(0, 2) : '00';
    
    return `${integerPart},${decimalPart}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={[theme.primaryGradient[0], theme.primaryGradient[1]]}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.push('/(app)/dashboard')} 
            style={styles.iconButton}
            accessibilityLabel="Voltar"
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Receitas</Text>
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
          </View>
        </View>

        {/* Financial Summary - Separated from header */}
        <View style={styles.financialSummary}>
          <View style={styles.balanceCard}>
            <Text style={styles.summaryLabel}>Total a receber</Text>
            <Text style={styles.balanceValue}>R$ {formatCurrency(incomes.filter(income => !income.isReceived).reduce((sum, income) => sum + income.amount, 0))}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.payableCard}>
            <Text style={styles.summaryLabel}>Total recebido</Text>
            <Text style={styles.payableValue}>R$ {formatCurrency(incomes.filter(income => income.isReceived).reduce((sum, income) => sum + income.amount, 0))}</Text>
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

      {/* Botão de adicionar receita flutuante */}
      <TouchableOpacity 
        style={[styles.addButton, {backgroundColor: theme.primary}]}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Efetivar Receita</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <X size={20} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
            
              {/* Campo de Descrição */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Receita</Text>
                <TextInput
                  style={styles.textInput}
                  value={newIncome.description}
                  onChangeText={(text) => setNewIncome({...newIncome, description: text})}
                  placeholder="Ex: Salário, Freelance, Venda"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Campo de Valor */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Valor</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>R$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={newIncome.amount > 0 ? newIncome.amount.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).replace('R$', '').trim() : ''}
                    onChangeText={(text) => {
                      // Remove tudo que não é número
                      const numericValue = text.replace(/[^0-9]/g, '');
                      // Formata como moeda brasileira
                      if (numericValue) {
                        const formattedValue = (parseInt(numericValue) / 100);
                        setNewIncome({...newIncome, amount: formattedValue});
                      } else {
                        setNewIncome({...newIncome, amount: 0});
                      }
                    }}
                    placeholder="0,00"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* Campo de Data */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Data recebimento</Text>
                <TouchableOpacity style={styles.dateInput} onPress={toggleCalendar}>
                  <Calendar size={20} color="#666" style={styles.inputIcon} />
                  <Text style={styles.dateText}>{selectedDate}</Text>
                  <TouchableOpacity style={styles.calendarButton} onPress={toggleCalendar}>
                    <Calendar size={20} color="#666" />
                  </TouchableOpacity>
                </TouchableOpacity>
                
                {calendarVisible && (
                  <View style={styles.calendarPickerContainer}>
                    <View
                      style={[styles.calendarPickerHeader, { backgroundColor: theme.primary }]}
                    >
                      <View style={styles.calendarPickerMonthSelector}>
                        <TouchableOpacity onPress={goToPreviousPickerMonth} style={styles.calendarPickerArrow}>
                          <ChevronLeft size={24} color="#FFF" />
                        </TouchableOpacity>
                        
                        <Text style={styles.calendarPickerMonthText}>
                          {months[pickerMonth]} {pickerYear}
                        </Text>
                        
                        <TouchableOpacity onPress={goToNextPickerMonth} style={styles.calendarPickerArrow}>
                          <ChevronRight size={24} color="#FFF" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.pickerCalendarContainer}>
                        {renderPickerCalendarGrid()}
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Campo de Conta */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Conta</Text>
                <TouchableOpacity 
                  style={[
                    styles.selectInput,
                    selectedAccount ? { borderColor: theme.primary, borderWidth: 1.5 } : null
                  ]}
                  onPress={() => setAccountsVisible(!accountsVisible)}
                >
                  {selectedAccount ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 20, marginRight: 10 }}>
                        {selectedAccount?.type === 'Conta Corrente' ? '🏦' : 
                         selectedAccount?.type === 'Poupança' ? '💰' : 
                         selectedAccount?.type === 'Investimento' ? '📈' : 
                         selectedAccount?.type === 'Dinheiro Físico' ? '💵' : '💳'}
                      </Text>
                      <Text style={[styles.selectPlaceholder, { color: theme.primary, fontWeight: '500' }]}>
                        {selectedAccount.name}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.selectPlaceholder}>Selecionar conta</Text>
                  )}
                  <ChevronRight size={18} color="#666" style={{ transform: [{ rotate: '90deg' }] as any }} />
                </TouchableOpacity>
                
                {accountsVisible && (
                  <View style={styles.accountsDropdown}>
                    {userAccounts.map((account, index) => (
                      <TouchableOpacity 
                        key={account.id}
                        style={[
                          styles.accountOption,
                          selectedAccount?.id === account.id && styles.accountOptionSelected,
                          index === userAccounts.length - 1 && { borderBottomWidth: 0 }
                        ]}
                        onPress={() => {
                          setSelectedAccount(account);
                          setAccountsVisible(false);
                        }}
                      >
                        <Text style={{ fontSize: 18, marginRight: 10 }}>
                          {account.type === 'Conta Corrente' ? '🏦' : 
                           account.type === 'Poupança' ? '💰' : 
                           account.type === 'Investimento' ? '📈' : 
                           account.type === 'Dinheiro Físico' ? '💵' : '💳'}
                        </Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[
                            styles.accountOptionText,
                            selectedAccount?.id === account.id && styles.accountOptionTextSelected
                          ]}>
                            {account.name}
                          </Text>
                          <Text style={styles.accountOptionType}>
                            {account.type}{account.bank ? ` • ${account.bank}` : ''}
                          </Text>
                        </View>
                        {selectedAccount?.id === account.id && (
                          <Text style={{ color: theme.primary, fontSize: 16 }}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Botão de Salvar */}
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={addIncome}
              >
                <Text style={styles.saveButtonText}>Efetivar Receita</Text>
              </TouchableOpacity>
            </ScrollView>
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
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 999,
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
  incomeCard: {
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
  incomeContent: {
    padding: 16,
  },
  incomeMain: {
    flex: 1,
  },
  incomeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incomeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    flex: 1,
    marginRight: 12,
  },
  incomeTitleRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeAmountText: {
    fontSize: 16,
    color: '#333',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  optionsButton: {
    padding: 4,
    marginLeft: 8,
  },
  incomeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  incomeTag: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  incomeTagText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  incomeAccount: {
    color: '#666',
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  incomeDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  incomeDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeDateIcon: {
    marginRight: 4,
  },
  incomeDateText: {
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
  bottomPadding: {
    height: 80,
  },
  // Modals styles - keeping the existing modal styles

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
  valueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  currencyPrefix: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: '600',
    marginRight: 8,
  },
  valueInput: {
    flex: 1,
    fontSize: 18,
    color: '#212529',
    fontWeight: '500',
    textAlign: 'left',
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
    color: '#9c27b0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: '90%',
    zIndex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginRight: 5,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  selectPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
  accountsDropdown: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accountOptionSelected: {
    backgroundColor: '#f8f9ff',
  },
  accountOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  accountOptionTextSelected: {
    color: '#4CD964',
    fontWeight: '600',
  },
  accountOptionType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  // Estilos do calendário
  calendarPickerContainer: {
    marginTop: 10,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  calendarPickerHeader: {
    padding: 16,
    width: '100%',
    backgroundColor: theme.primary,
  },
  calendarPickerMonthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarPickerArrow: {
    padding: 5,
  },
  calendarPickerMonthText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#FFF',
  },
  pickerCalendarContainer: {
    marginHorizontal: 4,
  },
  pickerCalendarHeaderCell: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerCalendarHeaderText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    opacity: 0.9,
  },
  pickerCalendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  pickerCalendarCell: {
    width: 40,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerDayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerSelectedDayCircle: {
    backgroundColor: '#FFF',
  },
  pickerCalendarDay: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  pickerCurrentMonthCell: {},
  pickerOtherMonthCell: {
    opacity: 0.6,
  },
  pickerSelectedCell: {},
  pickerCurrentMonthDay: {
    color: '#FFF',
  },
  pickerOtherMonthDay: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  pickerSelectedDayText: {
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  calendarButton: {
    padding: 4,
  },
});
