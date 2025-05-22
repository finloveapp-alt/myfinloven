import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Platform, Modal, TextInput } from 'react-native';
import { ChevronLeft, ChevronRight, Search, ArrowLeft, Filter, Plus, PlusCircle, X, Calendar, ArrowRight, ArrowDown, DollarSign, CreditCard, RefreshCw, BarChart, Menu, Home, Bell, Receipt, Wallet, Info, ExternalLink } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import BottomNavigation from '@/components/BottomNavigation';
import { router, useRouter } from 'expo-router';
import { fontFallbacks } from '@/utils/styles';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');

// Definição de temas
const themes = {
  feminine: {
    primary: '#b687fe',
    secondary: '#8B5CF6',
    accent: '#FF3B30',
    background: '#f5f7fa',
    card: '#ffffff',
    expense: '#FF3B30',
    income: '#4CD964',
    shared: '#0073ea',
    text: '#333333'
  },
  masculine: {
    primary: '#0073ea',
    secondary: '#3c79e6',
    accent: '#FF3B30',
    background: '#f5f7fa',
    card: '#ffffff',
    expense: '#FF3B30',
    income: '#4CD964',
    shared: '#8B5CF6',
    text: '#333333'
  }
};

// Definindo um themeDefault para ser usado no StyleSheet estático
const themeDefault = {
  primary: '#b687fe',
  secondary: '#8B5CF6',
  accent: '#FF3B30',
  background: '#f5f7fa',
  card: '#ffffff',
  expense: '#FF3B30',
  income: '#4CD964',
  shared: '#0073ea',
  text: '#333333'
};

// Mock data para registros de transações (expandido com mais exemplos)
const records = [
  {
    id: '1',
    name: 'Apple',
    amount: 32.65,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Assinatura',
    person: 'Maria',
    recurrent: true,
    icon: '🍎'
  },
  {
    id: '2',
    name: 'Google',
    amount: 32.21,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Assinatura',
    person: 'João',
    recurrent: true,
    icon: '🌐'
  },
  {
    id: '3',
    name: 'Netflix',
    amount: 13.93,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Entretenimento',
    person: 'Maria',
    recurrent: true,
    icon: '📺'
  },
  {
    id: '4',
    name: 'Spotify',
    amount: 10.54,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Entretenimento',
    person: 'Conjunto',
    recurrent: true,
    icon: '🎵'
  },
  {
    id: '5',
    name: 'Mercado',
    amount: 124.87,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Alimentação',
    person: 'João',
    recurrent: false,
    icon: '🛒'
  },
  {
    id: '6',
    name: 'Combustível',
    amount: 89.45,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Transporte',
    person: 'Maria',
    recurrent: false,
    icon: '⛽'
  },
  {
    id: '7',
    name: 'Restaurante',
    amount: 57.80,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Alimentação',
    person: 'Conjunto',
    recurrent: false,
    icon: '🍽️'
  },
  {
    id: '8',
    name: 'Salário',
    amount: 3500.00,
    date: 'April 22',
    day: 'Wednesday',
    type: 'income',
    category: 'Trabalho',
    person: 'João',
    recurrent: true,
    icon: '💰'
  },
  {
    id: '9',
    name: 'Freelance',
    amount: 1200.00,
    date: 'April 22',
    day: 'Wednesday',
    type: 'income',
    category: 'Trabalho',
    person: 'Maria',
    recurrent: false,
    icon: '💻'
  },
  {
    id: '10',
    name: 'Farmácia',
    amount: 43.50,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Saúde',
    person: 'Maria',
    recurrent: false,
    icon: '💊'
  }
];

// Nomes dos dias da semana e meses
const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Lista de contas demo
const demoAccounts = [
  { id: '1', name: 'Nubank', type: 'Conta Corrente', icon: '💜' },
  { id: '2', name: 'Santander', type: 'Conta Poupança', icon: '🔴' },
  { id: '3', name: 'Caixa', type: 'Conta Corrente', icon: '🏦' },
  { id: '4', name: 'Inter', type: 'Conta Digital', icon: '🟠' }
];

export default function Registers() {
  const router = useRouter();
  const currentDate = new Date();
  const [theme, setTheme] = useState(themes.feminine); // Iniciar com tema feminino como padrão
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth()); // Mês atual (0-indexed)
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear()); // Ano atual
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate()); // Dia atual
  const [modalVisible, setModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState('expense'); // 'expense', 'income', 'transfer'
  const [amount, setAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`
  );
  const [selectedCard, setSelectedCard] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [recurrenceType, setRecurrenceType] = useState('Não recorrente');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [accountsVisible, setAccountsVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(currentDate.getMonth());
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());
  const [pickerDay, setPickerDay] = useState(currentDate.getDate());
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentMethodsVisible, setPaymentMethodsVisible] = useState(false);

  // useEffect para carregar o tema com base no gênero do usuário
  useEffect(() => {
    // Buscar informações do usuário atual
    fetchUserTheme();
  }, []);
  
  // Função para buscar o tema baseado no perfil do usuário
  const fetchUserTheme = async () => {
    try {
      // Obter a sessão atual
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
      
      // Buscar o perfil do usuário atual
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('gender')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('Erro ao buscar perfil do usuário:', userError);
        return;
      }
      
      console.log('Perfil do usuário obtido do banco:', userProfile);
      
      // Definir o tema com base no gênero do usuário
      if (userProfile && userProfile.gender) {
        const gender = userProfile.gender.toLowerCase();
        
        if (gender === 'masculino' || gender === 'homem' || gender === 'male' || gender === 'm') {
          console.log('Aplicando tema masculino (azul) com base no perfil');
          setTheme(themes.masculine);
          global.dashboardTheme = 'masculine';
        } else if (gender === 'feminino' || gender === 'mulher' || gender === 'female' || gender === 'f') {
          console.log('Aplicando tema feminino (rosa) com base no perfil');
          setTheme(themes.feminine);
          global.dashboardTheme = 'feminine';
        } else {
          // Se o gênero não for reconhecido, tentar obter dos metadados da sessão
          const userMetadata = session.user.user_metadata;
          const metadataGender = userMetadata?.gender || '';
          
          console.log('Verificando gênero dos metadados:', metadataGender);
          
          if (metadataGender && typeof metadataGender === 'string') {
            const metaGenderLower = metadataGender.toLowerCase();
            
            if (metaGenderLower === 'masculino' || metaGenderLower === 'homem' || 
                metaGenderLower === 'male' || metaGenderLower === 'm') {
              console.log('Aplicando tema masculino (azul) com base nos metadados');
              setTheme(themes.masculine);
              global.dashboardTheme = 'masculine';
            } else if (metaGenderLower === 'feminino' || metaGenderLower === 'mulher' || 
                       metaGenderLower === 'female' || metaGenderLower === 'f') {
              console.log('Aplicando tema feminino (rosa) com base nos metadados');
              setTheme(themes.feminine);
              global.dashboardTheme = 'feminine';
            } else {
              // Usar o tema global ou padrão se o gênero nos metadados também não for reconhecido
              if (global.dashboardTheme === 'masculine') {
                setTheme(themes.masculine);
                console.log('Aplicando tema masculino (azul) da variável global');
              } else {
                setTheme(themes.feminine);
                console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
              }
            }
          } else {
            // Usar o tema global ou padrão se não houver gênero nos metadados
            if (global.dashboardTheme === 'masculine') {
              setTheme(themes.masculine);
              console.log('Aplicando tema masculino (azul) da variável global');
            } else {
              setTheme(themes.feminine);
              console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
            }
          }
        }
      } else {
        // Se não encontrou perfil ou gênero no perfil, tentar obter dos metadados da sessão
        const userMetadata = session.user.user_metadata;
        const metadataGender = userMetadata?.gender || '';
        
        console.log('Perfil não encontrado. Verificando gênero dos metadados:', metadataGender);
        
        if (metadataGender && typeof metadataGender === 'string') {
          const metaGenderLower = metadataGender.toLowerCase();
          
          if (metaGenderLower === 'masculino' || metaGenderLower === 'homem' || 
              metaGenderLower === 'male' || metaGenderLower === 'm') {
            console.log('Aplicando tema masculino (azul) com base nos metadados');
            setTheme(themes.masculine);
            global.dashboardTheme = 'masculine';
          } else if (metaGenderLower === 'feminino' || metaGenderLower === 'mulher' || 
                     metaGenderLower === 'female' || metaGenderLower === 'f') {
            console.log('Aplicando tema feminino (rosa) com base nos metadados');
            setTheme(themes.feminine);
            global.dashboardTheme = 'feminine';
          } else {
            // Usar o tema global ou padrão se o gênero nos metadados não for reconhecido
            if (global.dashboardTheme === 'masculine') {
              setTheme(themes.masculine);
              console.log('Aplicando tema masculino (azul) da variável global');
            } else {
              setTheme(themes.feminine);
              console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
            }
          }
        } else {
          // Usar o tema global ou padrão se não houver gênero nos metadados
          if (global.dashboardTheme === 'masculine') {
            setTheme(themes.masculine);
            console.log('Aplicando tema masculino (azul) da variável global');
          } else {
            setTheme(themes.feminine);
            console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao definir tema:', error);
    }
  };

  // Função para abrir o modal
  const openAddTransactionModal = () => {
    setModalVisible(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setModalVisible(false);
    setCalendarVisible(false);
    setPaymentMethodsVisible(false);
    setAccountsVisible(false);
  };

  // Função para salvar a nova transação
  const saveTransaction = () => {
    // Aqui você implementaria a lógica para salvar a transação
    // Por enquanto apenas fechamos o modal
    closeModal();
  };

  // Funções para o calendário do modal de transação
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
      cells.push(
        <TouchableOpacity
          key={`picker-day-${index}`}
          style={[
            styles.pickerCalendarCell,
            day.currentMonth ? styles.pickerCurrentMonthCell : styles.pickerOtherMonthCell,
            pickerDay === day.day && day.currentMonth ? styles.pickerSelectedCell : null
          ]}
          onPress={() => day.currentMonth && selectDateFromPicker(day.day)}
        >
          <View
            style={[
              styles.pickerDayCircle,
              pickerDay === day.day && day.currentMonth ? styles.pickerSelectedDayCircle : null
            ]}
          >
            <Text
              style={[
                styles.pickerCalendarDay,
                day.currentMonth ? styles.pickerCurrentMonthDay : styles.pickerOtherMonthDay,
                pickerDay === day.day && day.currentMonth ? [styles.pickerSelectedDayText, { color: theme.primary }] : null
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

  // Função para gerar os dias do mês
  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    // Dias do mês anterior para completar a primeira semana
    const daysFromPreviousMonth = adjustedFirstDay;
    const previousMonthDays = [];
    if (daysFromPreviousMonth > 0) {
      const daysInPreviousMonth = new Date(currentYear, currentMonth, 0).getDate();
      for (let i = daysInPreviousMonth - daysFromPreviousMonth + 1; i <= daysInPreviousMonth; i++) {
        previousMonthDays.push({
          day: i,
          currentMonth: false,
          date: new Date(currentYear, currentMonth - 1, i)
        });
      }
    }
    
    // Dias do mês atual
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        day: i,
        currentMonth: true,
        date: new Date(currentYear, currentMonth, i)
      });
    }
    
    // Dias do próximo mês para completar a última semana
    const remainingDays = (7 - ((adjustedFirstDay + daysInMonth) % 7)) % 7;
    const nextMonthDays = [];
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        day: i,
        currentMonth: false,
        date: new Date(currentYear, currentMonth + 1, i)
      });
    }
    
    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Navegar para o mês anterior
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navegar para o próximo mês
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Funções para formatar datas
  const formatWeekDay = (date: Date) => {
    const weekDaysFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return weekDaysFull[date.getDay()];
  };

  const formatDateHeader = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    const monthName = months[month];
    const weekDay = formatWeekDay(date);
    return `${day} de ${monthName}, ${weekDay}`;
  };

  // Selecionar um dia
  const selectDay = (day: number) => {
    setSelectedDay(day);
    // Também atualiza a data selecionada para o modal
    const newSelectedDate = `${String(day).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`;
    setSelectedDate(newSelectedDate);
  };

  // Renderizar os dias do calendário em formato de grade
  const renderCalendarGrid = () => {
    const days = generateCalendarDays();
    const rows: JSX.Element[] = [];
    let cells: JSX.Element[] = [];

    // Adicionar cabeçalho dos dias da semana
    const headerCells = weekDays.map((day, index) => (
      <View key={`header-${index}`} style={styles.calendarHeaderCell}>
        <Text style={styles.calendarHeaderText}>{day}</Text>
      </View>
    ));
    rows.push(
      <View key="header" style={styles.calendarRow}>
        {headerCells}
      </View>
    );

    // Agrupar os dias em semanas
    days.forEach((day, index) => {
      cells.push(
        <TouchableOpacity
          key={`day-${index}`}
          style={[
            styles.calendarCell,
            day.currentMonth ? styles.currentMonthCell : styles.otherMonthCell,
            selectedDay === day.day && day.currentMonth ? styles.selectedCell : null
          ]}
          onPress={() => day.currentMonth && selectDay(day.day)}
        >
          <View
            style={[
              styles.dayCircle,
              selectedDay === day.day && day.currentMonth ? styles.selectedDayCircle : null
            ]}
          >
                          <Text
              style={[
                styles.calendarDay,
                day.currentMonth ? styles.currentMonthDay : styles.otherMonthDay,
                selectedDay === day.day && day.currentMonth ? [styles.selectedDayText, { color: theme.primary }] : null
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
          <View key={`row-${Math.floor(index / 7)}`} style={styles.calendarRow}>
            {cells}
          </View>
        );
        cells = [];
      }
    });

    return rows;
  };

  // Filtrar registros pelo dia selecionado
  const filteredRecords = React.useMemo(() => {
    // Em uma implementação real, você compararia as datas reais
    // Para simular, vamos fingir que os registros são do dia selecionado
    return records.filter(record => true);
  }, [selectedDay, currentMonth, currentYear]);

  // Calcular totais de receitas e despesas
  const { incomeTotal, expenseTotal } = React.useMemo(() => {
    let income = 0;
    let expense = 0;
    
    filteredRecords.forEach(record => {
      if (record.type === 'income') {
        income += record.amount;
      } else if (record.type === 'expense') {
        expense += record.amount;
      }
    });
    
    return { incomeTotal: income, expenseTotal: expense };
  }, [filteredRecords]);

  // Funções para o seletor de método de pagamento
  const togglePaymentMethods = () => {
    setPaymentMethodsVisible(!paymentMethodsVisible);
    // Fecha o calendário se estiver aberto
    if (calendarVisible) {
      setCalendarVisible(false);
    }
  };

  const selectPaymentMethod = (method: string) => {
    setPaymentMethod(method);
    setPaymentMethodsVisible(false);
  };

  // Funções para o seletor de contas
  const toggleAccounts = () => {
    setAccountsVisible(!accountsVisible);
    
    // Fecha outros dropdowns se estiverem abertos
    if (paymentMethodsVisible) {
      setPaymentMethodsVisible(false);
    }
    if (calendarVisible) {
      setCalendarVisible(false);
    }
  };

  const selectAccount = (account: { id: string, name: string, type: string, icon: string }) => {
    setSelectedAccount(account.name);
    setAccountsVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />

      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => router.push('/(app)/dashboard')}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Registros</Text>
            <TouchableOpacity style={styles.searchButton}>
              <Search size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthArrow}>
              <ChevronLeft size={24} color="#FFF" />
            </TouchableOpacity>
            
            <Text style={styles.monthYearText}>
              {months[currentMonth]} {currentYear}
            </Text>
            
            <TouchableOpacity onPress={goToNextMonth} style={styles.monthArrow}>
              <ChevronRight size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarContainer}>
            {renderCalendarGrid()}
          </View>
        </View>

        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>
            {formatDateHeader(selectedDay, currentMonth, currentYear)}
          </Text>
          <TouchableOpacity style={styles.optionsButton}>
            <Filter size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Receitas</Text>
            <Text style={[styles.summaryValue, styles.incomeValue]}>
              + R$ {incomeTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Despesas</Text>
            <Text style={[styles.summaryValue, styles.expenseValue]}>
              - R$ {expenseTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        <View style={styles.recordsHeaderContainer}>
          <Text style={styles.recordsTitle}>Todos os Registros</Text>
          <TouchableOpacity 
            style={[styles.addTransactionButton, { backgroundColor: theme.primary }]}
            onPress={openAddTransactionModal}
          >
            <Plus size={24} color="#FFF" />
            <Text style={styles.addTransactionButtonText}>Nova Transação</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recordsContainer}>
          <View style={styles.recordsList}>
            {filteredRecords.map(record => (
              <TouchableOpacity key={record.id} style={styles.recordItem}>
                <View style={styles.recordIcon}>
                  <Text style={styles.recordIconText}>{record.icon}</Text>
                </View>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordName}>{record.name}</Text>
                  <Text style={styles.recordDetail}>{record.category} • {record.person}</Text>
                </View>
                <View style={styles.recordAmount}>
                  <Text style={[
                    styles.recordAmountText,
                    record.type === 'income' ? styles.incomeText : styles.expenseText
                  ]}>
                    R$ {record.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  {record.recurrent && <Text style={styles.recordFrequency}>/mês</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Botão flutuante fixo para adicionar transação */}
      <TouchableOpacity style={styles.floatingAddButton} onPress={openAddTransactionModal}>
        <PlusCircle size={30} color="#FFF" />
      </TouchableOpacity>

      {/* Modal de Nova Transação */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Transação</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <X size={20} color={themeDefault.text} />
              </TouchableOpacity>
            </View>

            {/* Buttons for transaction type */}
            <View style={styles.transactionTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.transactionTypeButton,
                  transactionType === 'expense' && [styles.activeTypeButton, { borderColor: theme.expense }]
                ]}
                onPress={() => setTransactionType('expense')}
              >
                <Text style={[
                  styles.transactionTypeText,
                  transactionType === 'expense' && [styles.activeTypeText, { color: theme.expense }]
                ]}>Despesa</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.transactionTypeButton,
                  transactionType === 'income' && [styles.activeTypeButton, { borderColor: theme.income }]
                ]}
                onPress={() => setTransactionType('income')}
              >
                <Text style={[
                  styles.transactionTypeText,
                  transactionType === 'income' && [styles.activeTypeText, { color: theme.income }]
                ]}>Receita</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.transactionTypeButton,
                  transactionType === 'transfer' && [styles.activeTypeButton, { borderColor: theme.shared }]
                ]}
                onPress={() => setTransactionType('transfer')}
              >
                <Text style={[
                  styles.transactionTypeText,
                  transactionType === 'transfer' && [styles.activeTypeText, { color: theme.shared }]
                ]}>Transferência</Text>
              </TouchableOpacity>
            </View>

            {/* Seletor de Data */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Data</Text>
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

            {/* Campo de Valor */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Valor</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>R$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0,00"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { zIndex: 10 }]}>
              <Text style={styles.inputLabel}>Forma de Pagamento</Text>
              <TouchableOpacity 
                style={[
                  styles.paymentMethodFullButton,
                  paymentMethod ? styles.paymentMethodSelected : null
                ]} 
                onPress={togglePaymentMethods}
              >
                {paymentMethod ? (
                  <>
                    {paymentMethod === 'Débito' && <CreditCard size={20} color={theme.primary} style={{marginRight: 10}} />}
                    {paymentMethod === 'Crédito' && <CreditCard size={20} color={theme.primary} style={{marginRight: 10}} />}
                    {paymentMethod === 'PIX' && <RefreshCw size={20} color={theme.primary} style={{marginRight: 10}} />}
                    {paymentMethod === 'Dinheiro' && <DollarSign size={20} color={theme.primary} style={{marginRight: 10}} />}
                    <Text style={styles.paymentMethodSelectedText}>{paymentMethod}</Text>
                  </>
                ) : (
                  <Text style={styles.paymentMethodText}>Selecione forma de pagamento</Text>
                )}
                <ChevronRight size={18} color="#666" style={{ transform: [{ rotate: '90deg' }] as any }} />
              </TouchableOpacity>
              
              {paymentMethodsVisible && (
                <View style={styles.paymentMethodsDropdown}>
                  <TouchableOpacity 
                    style={[
                      styles.paymentMethodOption,
                      paymentMethod === 'Débito' && styles.paymentMethodOptionSelected
                    ]} 
                    onPress={() => selectPaymentMethod('Débito')}
                  >
                    <CreditCard size={20} color={paymentMethod === 'Débito' ? theme.primary : theme.text} />
                    <Text style={[
                      styles.paymentMethodOptionText,
                      paymentMethod === 'Débito' && styles.paymentMethodOptionTextSelected
                    ]}>Débito</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.paymentMethodOption,
                      paymentMethod === 'Crédito' && styles.paymentMethodOptionSelected
                    ]} 
                    onPress={() => selectPaymentMethod('Crédito')}
                  >
                    <CreditCard size={20} color={paymentMethod === 'Crédito' ? theme.primary : theme.text} />
                    <Text style={[
                      styles.paymentMethodOptionText,
                      paymentMethod === 'Crédito' && styles.paymentMethodOptionTextSelected
                    ]}>Crédito</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.paymentMethodOption,
                      paymentMethod === 'PIX' && styles.paymentMethodOptionSelected
                    ]} 
                    onPress={() => selectPaymentMethod('PIX')}
                  >
                    <RefreshCw size={20} color={paymentMethod === 'PIX' ? theme.primary : theme.text} />
                    <Text style={[
                      styles.paymentMethodOptionText,
                      paymentMethod === 'PIX' && styles.paymentMethodOptionTextSelected
                    ]}>PIX</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.paymentMethodOption,
                      paymentMethod === 'Dinheiro' && styles.paymentMethodOptionSelected,
                      {borderBottomWidth: 0}
                    ]} 
                    onPress={() => selectPaymentMethod('Dinheiro')}
                  >
                    <DollarSign size={20} color={paymentMethod === 'Dinheiro' ? theme.primary : theme.text} />
                    <Text style={[
                      styles.paymentMethodOptionText,
                      paymentMethod === 'Dinheiro' && styles.paymentMethodOptionTextSelected
                    ]}>Dinheiro</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Seleção de Cartão */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Selecione o Cartão</Text>
              <TouchableOpacity style={styles.selectInput}>
                <Text style={styles.selectPlaceholder}>
                  {selectedCard || 'Selecione um cartão'}
                </Text>
                <ChevronRight size={20} color="#666" style={{ transform: [{ rotate: '90deg' }] as any }} />
              </TouchableOpacity>
            </View>

            {/* Configuração de Repetição */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Configurar Repetição</Text>
              <TouchableOpacity style={styles.selectInput}>
                <Text style={styles.selectPlaceholder}>{recurrenceType}</Text>
                <ChevronRight size={20} color="#666" style={{ transform: [{ rotate: '90deg' }] as any }} />
              </TouchableOpacity>
            </View>

            {/* Categoria */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoria</Text>
              <TouchableOpacity style={styles.selectInput}>
                <Text style={styles.selectPlaceholder}>
                  {selectedCategory || 'Selecione'}
                </Text>
                <ChevronRight size={20} color="#666" style={{ transform: [{ rotate: '90deg' }] as any }} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addCategoryButton}>
                <PlusCircle size={16} color={theme.primary} />
                <Text style={styles.addCategoryText}>Adicionar Nova Categoria</Text>
              </TouchableOpacity>
            </View>

            {/* Conta */}
            <View style={[styles.inputGroup, { zIndex: 9 }]}>
              <Text style={styles.inputLabel}>Conta</Text>
              <TouchableOpacity 
                style={[
                  styles.selectInput,
                  selectedAccount ? { borderColor: theme.primary, borderWidth: 1.5 } : null
                ]} 
                onPress={toggleAccounts}
              >
                {selectedAccount ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.selectPlaceholder, { color: theme.primary, fontFamily: fontFallbacks.Poppins_500Medium }]}>
                      {selectedAccount}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.selectPlaceholder}>Selecione</Text>
                )}
                <ChevronRight size={20} color="#666" style={{ transform: [{ rotate: '90deg' }] as any }} />
              </TouchableOpacity>
              
              {accountsVisible && (
                <View style={styles.paymentMethodsDropdown}>
                  {demoAccounts.map((account) => (
                    <TouchableOpacity 
                      key={account.id}
                      style={[
                        styles.paymentMethodOption,
                        selectedAccount === account.name && styles.paymentMethodOptionSelected,
                        account.id === demoAccounts[demoAccounts.length - 1].id && {borderBottomWidth: 0}
                      ]} 
                      onPress={() => selectAccount(account)}
                    >
                      <Text style={{ fontSize: 20, marginRight: 10 }}>{account.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[
                          styles.paymentMethodOptionText,
                          selectedAccount === account.name && styles.paymentMethodOptionTextSelected
                        ]}>{account.name}</Text>
                        <Text style={{ fontSize: 12, color: '#777', fontFamily: fontFallbacks.Poppins_400Regular }}>
                          {account.type}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              <TouchableOpacity style={styles.addCategoryButton}>
                <PlusCircle size={16} color={theme.primary} />
                <Text style={styles.addCategoryText}>Adicionar Nova Conta</Text>
              </TouchableOpacity>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={saveTransaction}
            >
              <Text style={styles.saveButtonText}>Salvar Transação</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal
        animationType="fade"
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
                <X size={22} color={theme.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.menuGrid}>
              <View style={styles.menuRow}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.replace('/(app)/dashboard');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(182, 135, 254, 0.15)' }]}>
                    <Home size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Dashboard</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Página inicial</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    openAddTransactionModal();
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(182, 135, 254, 0.15)' }]}>
                    <PlusCircle size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Novo Registro</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Adicionar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuItem}>
                  <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(182, 135, 254, 0.15)' }]}>
                    <Bell size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Notificações</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Alertas</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.menuRow}>
                <TouchableOpacity style={styles.menuItem}>
                  <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(182, 135, 254, 0.15)' }]}>
                    <BarChart size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Planejamento</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Orçamento</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.replace('/(app)/cards');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(182, 135, 254, 0.15)' }]}>
                    <Wallet size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Cartões</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Gerenciar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuItem}>
                  <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(182, 135, 254, 0.15)' }]}>
                    <Receipt size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Contas</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Pagamentos</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.menuRow}>
                <TouchableOpacity style={styles.menuItem}>
                  <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(182, 135, 254, 0.15)' }]}>
                    <Info size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Sobre</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Informações</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.replace('/(auth)/login');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(182, 135, 254, 0.15)' }]}>
                    <ExternalLink size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Logout</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Sair</Text>
                </TouchableOpacity>
                
                <View style={styles.menuItem}>
                  {/* Item vazio para manter o grid */}
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.closeFullButton, { backgroundColor: theme.primary }]}
              onPress={() => setMenuModalVisible(false)}
            >
              <Text style={styles.closeFullButtonText}>Fechar Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.replace('/(app)/dashboard')}
        >
          <BarChart size={24} color="#999" />
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setMenuModalVisible(true)}
        >
          <Menu size={24} color="#999" />
          <Text style={styles.navText}>Menu</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={openAddTransactionModal}
        >
          <View style={[styles.addButtonInner, { backgroundColor: theme.primary }]}>
            <PlusCircle size={32} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Receipt size={24} color="#999" />
          <Text style={styles.navText}>Notificações</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.replace('/(app)/cards')}
        >
          <CreditCard size={24} color="#999" />
          <Text style={styles.navText}>Cartões</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Definir o StyleSheet totalmente estático sem nenhuma referência ao tema dinâmico
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor será aplicado inline
  },
  mainScrollView: {
    flex: 1,
    marginBottom: 80, // Para não sobrepor à barra de navegação
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // backgroundColor será aplicado inline
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    color: '#FFF',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  searchButton: {
    padding: 8,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  monthArrow: {
    padding: 5,
  },
  monthYearText: {
    fontSize: 18,
    color: '#FFF',
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  calendarContainer: {
    marginHorizontal: 10,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarHeaderCell: {
    width: width / 7 - 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarHeaderText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    opacity: 0.9,
  },
  calendarCell: {
    width: width / 7 - 10,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayCircle: {
    backgroundColor: '#FFF',
  },
  calendarDay: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  currentMonthDay: {
    color: '#FFF',
  },
  otherMonthDay: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  selectedDayText: {
    // color será aplicada inline baseada no tema
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  currentMonthCell: {},
  otherMonthCell: {
    opacity: 0.6,
  },
  selectedCell: {},
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dateText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
  },
  optionsButton: {
    padding: 8,
  },
  optionsButtonText: {
    fontSize: 20,
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontFallbacks.Poppins_400Regular,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  incomeValue: {
    color: '#4CD964',
  },
  expenseValue: {
    color: '#FF3B30',
  },
  divider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  recordsContainer: {
    marginHorizontal: 16,
  },
  recordsTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  recordsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  addTransactionButton: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
    // backgroundColor será aplicado inline
  },
  addTransactionButtonText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#FFF',
    marginLeft: 6,
  },
  recordsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  recordIconText: {
    fontSize: 24,
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
    marginBottom: 2,
  },
  recordDetail: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#888',
  },
  recordAmount: {
    alignItems: 'flex-end',
  },
  recordAmountText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  incomeText: {
    color: '#00B16A',
  },
  expenseText: {
    color: '#333',
  },
  recordFrequency: {
    fontSize: 12,
    color: '#888',
    fontFamily: fontFallbacks.Poppins_400Regular,
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
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333333',
  },
  closeButton: {
    padding: 8,
  },
  transactionTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  transactionTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeTypeButton: {
    borderWidth: 1,
    // borderColor será aplicado inline
  },
  transactionTypeText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333333',
    marginLeft: 6,
  },
  activeTypeText: {
    // color será aplicado inline
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333333',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  calendarButton: {
    padding: 5,
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
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333333',
    marginRight: 5,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333333',
  },
  paymentMethodFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  paymentMethodSelected: {
    // borderColor será aplicado inline
    borderWidth: 1.5,
    backgroundColor: 'rgba(182, 135, 254, 0.05)',
  },
  paymentMethodSelectedText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#b687fe', // Usando uma cor fixa que será atualizada inline quando necessário
    flex: 1,
  },
  paymentMethodText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    flex: 1,
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
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  addCategoryText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#b687fe', // Usando uma cor fixa que será atualizada inline quando necessário
    marginLeft: 5,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    // backgroundColor será aplicado inline
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#fff',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0073ea',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 999,
  },
  pickerCalendarHeaderCell: {
    width: (width - 80) / 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
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
    width: (width - 80) / 7,
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
    // color será aplicada inline baseada no tema
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
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
    // backgroundColor será aplicado inline com base no tema
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
  paymentMethodsDropdown: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paymentMethodOptionSelected: {
    backgroundColor: 'rgba(182, 135, 254, 0.15)',
  },
  paymentMethodOptionText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333333',
    marginLeft: 12,
  },
  paymentMethodOptionTextSelected: {
    color: '#b687fe', // Usando uma cor fixa que será atualizada inline quando necessário
    fontFamily: fontFallbacks.Poppins_600SemiBold,
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
    // backgroundColor será aplicado inline
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
    // backgroundColor será aplicado inline
  },
  closeFullButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
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
  addButton: {
    marginTop: -30,
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
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
    }),
    // backgroundColor será aplicado inline
  },
}); 