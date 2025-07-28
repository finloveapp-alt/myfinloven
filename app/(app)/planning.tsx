import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Platform, TextInput, Modal, Alert, KeyboardAvoidingView, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MoreVertical, Plus, BarChart2, Target, Repeat, DollarSign, User, Clock, X, Edit2, AlertCircle, BarChart, Menu, Receipt, CreditCard, PlusCircle, Home, Bell, Wallet, Info, ExternalLink, Calendar, ChevronDown, Check } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { fontFallbacks } from '@/utils/styles';
import Svg, { Line, Circle, Path, Rect } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import themes from '@/constants/themes';
import MenuModal from '@/components/MenuModal';
import { useNotifications } from '../../hooks/useNotifications';
import GoalReachedModal from '@/components/GoalReachedModal';

const { width, height } = Dimensions.get('window');

// Declarar a variável global para TypeScript
declare global {
  var dashboardTheme: 'feminine' | 'masculine' | undefined;
}

// Função para obter o tema inicial
const getInitialTheme = () => {
  // Verificar primeiro se há um tema global definido
  if (global.dashboardTheme === 'masculine') {
    return themes.masculine;
  }
  
  // Se não houver tema global, verificar o AsyncStorage
  // Como não podemos fazer chamada assíncrona aqui, usamos o tema padrão
  // e depois atualizamos no useEffect
  return themes.feminine; // Tema padrão
};

// Dados de exemplo para orçamentos
const budgets = [
  {
    id: '1',
    category: 'Compras de Supermercado',
    allocated: 500,
    spent: 419.5,
    percentage: 83.9,
    icon: '🛒',
    color: '#6C5CE7',
    warning: true, // Orçamento quase acabando
    users: [
      { name: 'Maria', spent: 250.5, percentage: 59.7 },
      { name: 'João', spent: 169.0, percentage: 40.3 }
    ],
    transactions: [
      { description: 'Mercado Extra', date: '10 Ago 2022', amount: 150.5, user: 'Maria' },
      { description: 'Mercado Dia', date: '05 Ago 2022', amount: 100.0, user: 'João' },
      { description: 'Açougue Central', date: '01 Ago 2022', amount: 69.0, user: 'João' },
    ]
  },
  {
    id: '2',
    category: 'Despesas do Carro',
    allocated: 350,
    spent: 272.5,
    percentage: 77.9,
    icon: '🚗',
    color: '#74B9FF',
    warning: false,
    users: [
      { name: 'Maria', spent: 50.5, percentage: 18.5 },
      { name: 'João', spent: 222.0, percentage: 81.5 }
    ],
    transactions: [
      { description: 'Combustível', date: '08 Ago 2022', amount: 150.0, user: 'João' },
      { description: 'Lava Rápido', date: '03 Ago 2022', amount: 50.5, user: 'Maria' },
      { description: 'Estacionamento', date: '01 Ago 2022', amount: 72.0, user: 'João' },
    ]
  },
  {
    id: '3',
    category: 'Compras Online',
    allocated: 300,
    spent: 193.0,
    percentage: 64.3,
    icon: '🛍️',
    color: '#55EFC4',
    warning: false,
    users: [
      { name: 'Maria', spent: 120.5, percentage: 62.4 },
      { name: 'João', spent: 72.5, percentage: 37.6 }
    ],
    transactions: [
      { description: 'Amazon', date: '12 Ago 2022', amount: 120.5, user: 'Maria' },
      { description: 'Mercado Livre', date: '05 Ago 2022', amount: 72.5, user: 'João' },
    ]
  },
  {
    id: '4',
    category: 'Despesas de Saúde',
    allocated: 200,
    spent: 140.0,
    percentage: 70.0,
    icon: '💊',
    color: '#FF7675',
    warning: false,
    users: [
      { name: 'Maria', spent: 100.0, percentage: 71.4 },
      { name: 'João', spent: 40.0, percentage: 28.6 }
    ],
    transactions: [
      { description: 'Farmácia', date: '14 Ago 2022', amount: 60.0, user: 'Maria' },
      { description: 'Consulta', date: '10 Ago 2022', amount: 40.0, user: 'João' },
      { description: 'Vitaminas', date: '05 Ago 2022', amount: 40.0, user: 'Maria' },
    ]
  }
];

// Dados de exemplo para metas financeiras
const goals = [
  {
    id: '1',
    title: 'Viagem para Europa',
    target: 10000,
    current: 5543.43,
    percentage: 55.4,
    deadline: 'Dez 2022',
    color: '#6C5CE7',
    icon: '✈️',
    deposits: [
      { date: '12 Ago 2022', amount: 982.21, user: 'Maria' },
      { date: '28 Jul 2022', amount: 500.00, user: 'João' },
      { date: '15 Jul 2022', amount: 1200.00, user: 'Maria' },
    ],
    teamContributions: [
      { name: 'Maria', amount: 3200.0, percentage: 57.7 },
      { name: 'João', amount: 2343.43, percentage: 42.3 }
    ]
  },
  {
    id: '2',
    title: 'Entrada Apartamento',
    target: 25000,
    current: 8750.00,
    percentage: 35.0,
    deadline: 'Jun 2023',
    color: '#74B9FF',
    icon: '🏠',
    deposits: [
      { date: '01 Ago 2022', amount: 1500.00, user: 'João' },
      { date: '15 Jul 2022', amount: 2000.00, user: 'Maria' },
      { date: '01 Jul 2022', amount: 1000.00, user: 'João' },
    ],
    teamContributions: [
      { name: 'Maria', amount: 3750.0, percentage: 42.9 },
      { name: 'João', amount: 5000.0, percentage: 57.1 }
    ]
  },
  {
    id: '3',
    title: 'Fundo de Emergência',
    target: 15000,
    current: 12000.00,
    percentage: 80.0,
    deadline: 'Mar 2023',
    color: '#55EFC4',
    icon: '🛡️',
    deposits: [
      { date: '05 Ago 2022', amount: 2000.00, user: 'João' },
      { date: '20 Jul 2022', amount: 1500.00, user: 'Maria' },
      { date: '05 Jul 2022', amount: 1000.00, user: 'João' },
    ],
    teamContributions: [
      { name: 'Maria', amount: 5500.0, percentage: 45.8 },
      { name: 'João', amount: 6500.0, percentage: 54.2 }
    ]
  }
];

export default function Planning() {
  const router = useRouter();
  const { notifyGoalReached, goalReachedModal, closeGoalReachedModal } = useNotifications();
  const [theme, setTheme] = useState(getInitialTheme());
  const [activeTab, setActiveTab] = useState('budget'); // 'budget' ou 'goals'
  const [expandedBudget, setExpandedBudget] = useState<string | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [goalsData, setGoalsData] = useState(goals);
  const [loading, setLoading] = useState(true);
  const [historyTransactions, setHistoryTransactions] = useState<any[]>([]);
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [chartData, setChartData] = useState({
    income: { amount: 0, percentage: 0 },
    expense: { amount: 0, percentage: 0 },
    transfer: { amount: 0, percentage: 0 }
  });
  
  // Estados para modais
  const [showNewBudgetModal, setShowNewBudgetModal] = useState(false);
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);

  const [menuModalVisible, setMenuModalVisible] = useState(false); // Para o modal de menu
  const [allTransactionsModalVisible, setAllTransactionsModalVisible] = useState(false); // Para o modal de todas as transações
  const [allTransactions, setAllTransactions] = useState<any[]>([]); // Todas as transações com orçamento
  
  // Estados para edição
  const [currentBudget, setCurrentBudget] = useState<any>(null);
  const [currentGoal, setCurrentGoal] = useState<any>(null);
  
  // Valores para novos orçamentos/metas
  const [newCategory, setNewCategory] = useState('');
  const [newAllocated, setNewAllocated] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📊');
  const [newCategoryIconsVisible, setNewCategoryIconsVisible] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [newGoalIcon, setNewGoalIcon] = useState('🎯');
  const [newGoalIconsVisible, setNewGoalIconsVisible] = useState(false);
  const [deadlineType, setDeadlineType] = useState('semestral');
  const [deadlineDropdownVisible, setDeadlineDropdownVisible] = useState(false);
  const [customDeadlineVisible, setCustomDeadlineVisible] = useState(false);


  // Estados para o calendário do modal de meta
  const [goalCalendarVisible, setGoalCalendarVisible] = useState(false);
  const [goalPickerMonth, setGoalPickerMonth] = useState(new Date().getMonth());
  const [goalPickerYear, setGoalPickerYear] = useState(new Date().getFullYear());
  const [goalPickerDay, setGoalPickerDay] = useState(new Date().getDate());
  const [goalSelectedDate, setGoalSelectedDate] = useState(
    `${String(new Date().getDate()).padStart(2, '0')}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`
  );

  // Constantes para o calendário
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const scrollViewRef = useRef<ScrollView>(null);

  // Função para buscar transações com orçamento definido
  const fetchHistoryTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          accounts!transactions_account_id_fkey(name),
          profiles!transactions_owner_id_fkey(name),
          budget_categories!transactions_budget_category_id_fkey(category, icon)
        `)
        .not('budget_category_id', 'is', null)
        .or(`owner_id.eq.${user.id},partner_id.eq.${user.id}`)
        .order('transaction_date', { ascending: false })
        .limit(5); // Últimas 5 transações

      if (error) {
        console.error('Erro ao buscar transações do histórico:', error);
        return;
      }

      const formattedTransactions = (transactions || []).map(transaction => ({
        id: transaction.id,
        description: transaction.description || 'Transação',
        amount: Math.abs(parseFloat(transaction.amount)),
        type: transaction.transaction_type,
        date: new Date(transaction.transaction_date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        time: new Date(transaction.transaction_date).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        user: transaction.profiles?.name || 'Usuário',
        budgetCategory: transaction.budget_categories?.category || 'Orçamento',
        budgetIcon: transaction.budget_categories?.icon || '📊'
      }));

      setHistoryTransactions(formattedTransactions);
    } catch (error) {
      console.error('Erro ao buscar transações do histórico:', error);
    }
  };

  // Função para buscar todas as transações com orçamento
  const fetchAllTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          accounts!transactions_account_id_fkey(name),
          profiles!transactions_owner_id_fkey(name),
          budget_categories!transactions_budget_category_id_fkey(category, icon)
        `)
        .not('budget_category_id', 'is', null)
        .or(`owner_id.eq.${user.id},partner_id.eq.${user.id}`)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('Erro ao buscar todas as transações:', error);
        return;
      }

      const formattedTransactions = (transactions || []).map(transaction => ({
        id: transaction.id,
        description: transaction.description || 'Transação',
        amount: Math.abs(parseFloat(transaction.amount)),
        type: transaction.transaction_type,
        date: new Date(transaction.transaction_date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        time: new Date(transaction.transaction_date).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        user: transaction.profiles?.name || 'Usuário',
        budgetCategory: transaction.budget_categories?.category || 'Orçamento',
        budgetIcon: transaction.budget_categories?.icon || '📊'
      }));

      setAllTransactions(formattedTransactions);
    } catch (error) {
      console.error('Erro ao buscar todas as transações:', error);
    }
  };

  // Handler para abrir o modal de todas as transações
  const handleShowAllTransactions = async () => {
    await fetchAllTransactions();
    setAllTransactionsModalVisible(true);
  };

  // Função para buscar categorias de orçamento do usuário
  const fetchBudgetCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar categorias de orçamento:', error);
        return;
      }

      // Para cada categoria de orçamento, buscar as transações relacionadas
      const formattedData = await Promise.all(data.map(async (item) => {
        // Buscar transações da categoria no mês atual
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonth, 0);
        
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select(`
            *,
            accounts!transactions_account_id_fkey(name),
            profiles!transactions_owner_id_fkey(name)
          `)
          .eq('budget_category_id', item.id)
          .gte('transaction_date', startOfMonth.toISOString())
          .lte('transaction_date', endOfMonth.toISOString())
          .or(`owner_id.eq.${user.id},partner_id.eq.${user.id}`)
          .order('transaction_date', { ascending: false })
          .limit(10); // Limitar a 10 transações mais recentes

        if (transactionsError) {
          console.error('Erro ao buscar transações da categoria:', transactionsError);
        }

        // Não precisamos mais calcular gastos por usuário

        // Formatar transações para exibição
        const formattedTransactions = (transactions || []).map(transaction => ({
          description: transaction.description || 'Transação',
          date: new Date(transaction.transaction_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          amount: Math.abs(parseFloat(transaction.amount)),
          user: transaction.profiles?.name || 'Usuário'
        }));

        return {
          id: item.id,
          category: item.category,
          allocated: Number(item.allocated),
          spent: Number(item.spent), // Usar valor do banco de dados
          percentage: Number(item.percentage), // Usar porcentagem do banco de dados
          icon: item.icon,
          color: item.color,
          warning: Number(item.percentage) > 80, // Usar porcentagem do banco para warning
          transactions: formattedTransactions
        };
      }));

      setBudgetData(formattedData);
    } catch (error) {
      console.error('Erro ao buscar categorias de orçamento:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar metas financeiras do usuário
  const fetchFinancialGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: goals, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar metas financeiras:', error);
        return;
      }

      // Para cada meta, buscar as transações vinculadas
      const formattedGoals = await Promise.all(goals.map(async (goal) => {
        // Buscar transações vinculadas à meta
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('goal_id', goal.id)
          .order('created_at', { ascending: false });

        if (transactionsError) {
          console.error('Erro ao buscar transações da meta:', transactionsError);
        }

        return {
          id: goal.id || '',
          title: goal.title || 'Meta sem título',
          target: goal.target_amount || 0,
          current: goal.current_amount || 0,
          percentage: goal.percentage || 0,
          deadline: goal.deadline || 'Sem prazo',
          color: goal.color || '#6C5CE7',
          icon: goal.icon || '🎯',
          transactions: (transactions || []).map((transaction: any) => ({
            id: transaction.id,
            description: transaction.description || 'Transação',
            date: transaction.created_at 
              ? new Date(transaction.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })
              : 'Data inválida',
            amount: transaction.amount || 0,
            type: transaction.type || 'expense'
          }))
        };
      }));

      setGoalsData(formattedGoals);
    } catch (error) {
      console.error('Erro ao buscar metas financeiras:', error);
    }
  };

  // Função para buscar saldo atual (mesma lógica da dashboard)
  const fetchSaldoAtual = async () => {
    try {
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Erro ao obter sessão:', sessionError);
        return;
      }
      
      const userId = session.user.id;
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Buscar receitas do mês atual da tabela incomes
      const { data: monthlyIncomes, error: monthlyIncomesError } = await supabase
        .from('incomes')
        .select('amount')
        .eq('owner_id', userId)
        .gte('receipt_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('receipt_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      // Buscar transações de receita do mês atual
      const { data: monthlyTransactionIncomes, error: monthlyTransactionIncomesError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('owner_id', userId)
        .eq('transaction_type', 'income')
        .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      // Buscar despesas do mês atual da tabela expenses
      const { data: monthlyExpenses, error: monthlyExpensesError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('owner_id', userId)
        .gte('due_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('due_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      // Buscar transações de despesa do mês atual
      const { data: monthlyExpenseTransactions, error: monthlyExpenseTransactionsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('owner_id', userId)
        .eq('transaction_type', 'expense')
        .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      // Calcular totais
      const receitasMesIncomes = monthlyIncomes?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
      const receitasMesTransactions = monthlyTransactionIncomes?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
      const receitasMes = receitasMesIncomes + receitasMesTransactions;
      
      const despesasMesExpenses = monthlyExpenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
      const despesasMesTransactions = monthlyExpenseTransactions?.reduce((sum, expense) => sum + Math.abs(Number(expense.amount)), 0) || 0;
      const despesasMes = despesasMesExpenses + despesasMesTransactions;
      
      // Calcular saldo como receitas - despesas (mesma lógica da dashboard)
      const saldoTotal = receitasMes - despesasMes;
      
      setSaldoAtual(saldoTotal);
      
    } catch (error) {
      console.error('Erro ao buscar saldo atual:', error);
    }
  };

  // Função para buscar dados do gráfico
  const fetchChartData = async () => {
    try {
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Erro ao obter sessão:', sessionError);
        return;
      }
      
      const userId = session.user.id;
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Buscar receitas do mês atual
      const { data: monthlyIncomes } = await supabase
        .from('incomes')
        .select('amount')
        .eq('owner_id', userId)
        .gte('receipt_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('receipt_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      const { data: monthlyTransactionIncomes } = await supabase
        .from('transactions')
        .select('amount')
        .eq('owner_id', userId)
        .eq('transaction_type', 'income')
        .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      // Buscar despesas do mês atual
      const { data: monthlyExpenses } = await supabase
        .from('expenses')
        .select('amount')
        .eq('owner_id', userId)
        .gte('due_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('due_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      const { data: monthlyExpenseTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('owner_id', userId)
        .eq('transaction_type', 'expense')
        .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      // Buscar transferências do mês atual
      const { data: monthlyTransfers } = await supabase
        .from('transactions')
        .select('amount')
        .eq('owner_id', userId)
        .eq('transaction_type', 'transfer')
        .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      // Calcular totais
      const incomeTotal = (monthlyIncomes?.reduce((sum, income) => sum + Number(income.amount), 0) || 0) +
                         (monthlyTransactionIncomes?.reduce((sum, income) => sum + Number(income.amount), 0) || 0);
      
      const expenseTotal = (monthlyExpenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0) +
                          (monthlyExpenseTransactions?.reduce((sum, expense) => sum + Math.abs(Number(expense.amount)), 0) || 0);
      
      const transferTotal = monthlyTransfers?.reduce((sum, transfer) => sum + Math.abs(Number(transfer.amount)), 0) || 0;
      
      const total = incomeTotal + expenseTotal + transferTotal;
      
      // Calcular percentuais
      const incomePercentage = total > 0 ? Math.round((incomeTotal / total) * 100) : 0;
      const expensePercentage = total > 0 ? Math.round((expenseTotal / total) * 100) : 0;
      const transferPercentage = total > 0 ? Math.round((transferTotal / total) * 100) : 0;
      
      setChartData({
        income: { amount: incomeTotal, percentage: incomePercentage },
        expense: { amount: expenseTotal, percentage: expensePercentage },
        transfer: { amount: transferTotal, percentage: transferPercentage }
      });
      
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
    }
  };

  // Função para renderizar o gráfico donut
  const renderDonutChart = () => {
    const size = width < 360 ? 140 : 160;
    const strokeWidth = 15;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    const { income, expense, transfer } = chartData;
    const total = income.amount + expense.amount + transfer.amount;
    
    if (total === 0) {
      return (
        <View style={[styles.donutChart, { width: size, height: size }]}>
          <View style={styles.donutChartInner}>
            <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
              Sem dados
            </Text>
          </View>
        </View>
      );
    }
    
    // Calcular os offsets para cada segmento
    const incomeOffset = circumference * (1 - income.percentage / 100);
    const expenseOffset = circumference * (1 - (income.percentage + expense.percentage) / 100);
    const transferOffset = circumference * (1 - (income.percentage + expense.percentage + transfer.percentage) / 100);
    
    return (
      <View style={[styles.donutChart, { width: size, height: size, borderWidth: 0 }]}>
        <Svg width={size} height={size}>
          {/* Círculo de fundo */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Segmento de receita */}
          {income.percentage > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#4CD964"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${circumference * income.percentage / 100} ${circumference}`}
              strokeDashoffset={incomeOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          )}
          
          {/* Segmento de despesa */}
          {expense.percentage > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#FF3B30"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${circumference * expense.percentage / 100} ${circumference}`}
              strokeDashoffset={expenseOffset}
              strokeLinecap="round"
              transform={`rotate(${-90 + (income.percentage * 3.6)} ${size / 2} ${size / 2})`}
            />
          )}
          
          {/* Segmento de transferência */}
          {transfer.percentage > 0 && (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#5856D6"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={`${circumference * transfer.percentage / 100} ${circumference}`}
              strokeDashoffset={transferOffset}
              strokeLinecap="round"
              transform={`rotate(${-90 + ((income.percentage + expense.percentage) * 3.6)} ${size / 2} ${size / 2})`}
            />
          )}
        </Svg>
        
        <View style={[styles.donutChartInner, { 
          position: 'absolute',
          top: strokeWidth / 2,
          left: strokeWidth / 2,
          width: size - strokeWidth,
          height: size - strokeWidth,
          borderRadius: (size - strokeWidth) / 2
        }]}>
          <Text style={{ fontSize: 12, color: '#666', textAlign: 'center' }}>
            Total
          </Text>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
            R$ {total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
          </Text>
        </View>
      </View>
    );
  };

  // Função para salvar nova meta financeira
  // Função para verificar limitação de metas para usuários do plano gratuito
  const checkGoalLimitForFreeUsers = async (userId: string): Promise<boolean> => {
    try {
      // Verificar o plano do usuário
      const { data: userPlan, error: planError } = await supabase
        .from('user_plans')
        .select('plan_template_id')
        .eq('user_id', userId)
        .single();

      if (planError) {
        console.error('Erro ao verificar plano do usuário:', planError);
        return true; // Em caso de erro, permitir criação
      }

      // Se não é plano gratuito, permitir criação
      if (userPlan?.plan_template_id !== 'f87bcbd5-7ab6-4657-bafd-f611d4b5a101') {
        return true;
      }

      // Contar metas existentes do usuário
      const { data: existingGoals, error: goalsError } = await supabase
        .from('financial_goals')
        .select('id')
        .eq('user_id', userId);

      if (goalsError) {
        console.error('Erro ao contar metas existentes:', goalsError);
        return true; // Em caso de erro, permitir criação
      }

      const currentGoalsCount = existingGoals?.length || 0;
      
      if (currentGoalsCount >= 2) {
        Alert.alert(
          'Limite atingido',
          'Usuários do plano gratuito podem criar no máximo 2 metas financeiras. Faça upgrade do seu plano para criar mais metas.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar limitação de metas:', error);
      return true; // Em caso de erro, permitir criação
    }
  };

  const saveFinancialGoal = async (title: string, targetAmount: number, deadline: string, icon: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Erro ao obter sessão:', sessionError);
        return false;
      }

      if (!session?.user) {
        console.error('Nenhuma sessão ativa encontrada');
        return false;
      }

      const user = session.user;
      
      // Verificar limitação do plano gratuito
      const canCreateGoal = await checkGoalLimitForFreeUsers(user.id);
      if (!canCreateGoal) {
        return false;
      }
      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

      const insertData = {
        user_id: user.id,
        title: title,
        target_amount: targetAmount,
        current_amount: 0,
        percentage: 0,
        deadline: deadline,
        icon: icon,
        color: randomColor
      };

      const { data, error } = await supabase
        .from('financial_goals')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase:', error);
        return false;
      }

      // Criar contribuições iniciais da equipe
      const teamContributions = [
        { goal_id: data.id, user_name: 'Maria', total_amount: 0, percentage: 0 },
        { goal_id: data.id, user_name: 'João', total_amount: 0, percentage: 0 }
      ];

      const { error: teamError } = await supabase
        .from('goal_team_contributions')
        .insert(teamContributions);

      if (teamError) {
        console.error('Erro ao criar contribuições da equipe:', teamError);
        // Não retorna false aqui pois a meta foi criada com sucesso
      }

      return true;
    } catch (error) {
      console.error('Erro ao salvar meta financeira:', error);
      return false;
    }
  };

  // Função para salvar depósito em meta financeira
  const saveGoalDeposit = async (goalId: string, amount: number, userName: string, notifyGoalReachedFn: (title: string, targetAmount: number) => Promise<void>) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        console.error('Erro de autenticação:', sessionError);
        return false;
      }

      const user = session.user;

      // O depósito já foi inserido na tabela transactions pelo sistema principal
      console.log('🎯 Processando depósito para meta:', goalId, 'Valor:', amount, 'Usuário:', userName);

      // Buscar todas as transações da meta para recalcular o total
      const { data: allDeposits, error: depositsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('goal_id', goalId)
        .eq('transaction_type', 'income');

      if (depositsError) {
        console.error('Erro ao buscar transações da meta:', depositsError);
        return false;
      }

      // Calcular novo total
      const newCurrentAmount = allDeposits.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

      // Buscar a meta para obter o valor alvo e dados atuais
      const { data: goalData, error: goalError } = await supabase
        .from('financial_goals')
        .select('target_amount, current_amount, title')
        .eq('id', goalId)
        .single();

      if (goalError) {
        console.error('Erro ao buscar meta:', goalError);
        return false;
      }

      // Calcular nova porcentagem (limitada a 100%)
      const calculatedPercentage = (newCurrentAmount / goalData.target_amount) * 100;
      const newPercentage = parseFloat(Math.min(calculatedPercentage, 100).toFixed(1));
      
      // ✨ NOVA LÓGICA: Verificar se a meta foi atingida
      const wasGoalReached = newPercentage >= 100;
      const previousAmount = goalData.current_amount || 0;
      const wasAlreadyReached = (previousAmount / goalData.target_amount) * 100 >= 100;
      
      console.log('🎯 === VERIFICAÇÃO DE META ATINGIDA ===');
      console.log('🎯 Meta:', goalData.title);
      console.log('🎯 Valor anterior:', previousAmount);
      console.log('🎯 Novo valor:', newCurrentAmount);
      console.log('🎯 Valor alvo:', goalData.target_amount);
      console.log('🎯 Nova porcentagem:', newPercentage);
      console.log('🎯 Meta foi atingida agora?', wasGoalReached);
      console.log('🎯 Meta já estava atingida?', wasAlreadyReached);
      console.log('🎯 Deve enviar notificação?', wasGoalReached && !wasAlreadyReached);

      // Atualizar a meta com os novos valores
      const { error: updateError } = await supabase
        .from('financial_goals')
        .update({
          current_amount: newCurrentAmount,
          percentage: newPercentage
        })
        .eq('id', goalId);

      if (updateError) {
        console.error('Erro ao atualizar meta:', updateError);
        return false;
      }
      
      // ✨ NOVA LÓGICA: Mostrar modal sempre que a meta estiver em 100%
      if (wasGoalReached) {
        console.log('🎯 ✅ Chamando notifyGoalReached (meta em 100%)...');
        await notifyGoalReachedFn(goalData.title, goalData.target_amount);
      } else {
        console.log('🎯 ❌ Meta não está em 100%');
      }

      // Buscar transações com informações do usuário para recalcular contribuições da equipe
      const { data: allTransactionsWithUser, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount, description')
        .eq('goal_id', goalId)
        .eq('transaction_type', 'income');

      if (!transactionsError && allTransactionsWithUser) {
        // Recalcular contribuições da equipe baseado nas transações
        const teamContributions = allTransactionsWithUser.reduce((acc: any, transaction) => {
          // Usar a descrição ou um nome padrão para identificar o usuário
          const userName = transaction.description?.includes('Maria') ? 'Maria' : 'João';
          if (!acc[userName]) {
            acc[userName] = 0;
          }
          acc[userName] += parseFloat(transaction.amount);
          return acc;
        }, {});

        // Atualizar contribuições da equipe
        for (const [name, totalAmount] of Object.entries(teamContributions)) {
          const percentage = parseFloat(((totalAmount as number / newCurrentAmount) * 100).toFixed(1));
          
          await supabase
            .from('goal_team_contributions')
            .upsert({
              goal_id: goalId,
              user_name: name,
              total_amount: totalAmount,
              percentage: percentage
            }, {
              onConflict: 'goal_id,user_name'
            });
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao salvar depósito:', error);
      return false;
    }
  };

  // Função para verificar limitação de orçamentos para usuários do plano gratuito
  const checkBudgetLimitForFreeUsers = async (userId: string): Promise<boolean> => {
    try {
      // Verificar o plano do usuário
      const { data: userPlan, error: planError } = await supabase
        .from('user_plans')
        .select('plan_template_id')
        .eq('user_id', userId)
        .single();

      if (planError) {
        console.error('Erro ao verificar plano do usuário:', planError);
        return true; // Em caso de erro, permitir criação
      }

      // Se não é plano gratuito, permitir criação
      if (userPlan?.plan_template_id !== 'f87bcbd5-7ab6-4657-bafd-f611d4b5a101') {
        return true;
      }

      // Contar orçamentos existentes do usuário
      const { data: existingBudgets, error: budgetsError } = await supabase
        .from('budget_categories')
        .select('id')
        .eq('user_id', userId);

      if (budgetsError) {
        console.error('Erro ao contar orçamentos existentes:', budgetsError);
        return true; // Em caso de erro, permitir criação
      }

      const currentBudgetsCount = existingBudgets?.length || 0;
      
      if (currentBudgetsCount >= 2) {
        Alert.alert(
          'Limite atingido',
          'Usuários do plano gratuito podem criar no máximo 2 orçamentos. Faça upgrade do seu plano para criar mais orçamentos.',
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar limitação de orçamentos:', error);
      return true; // Em caso de erro, permitir criação
    }
  };

  // Função para salvar nova categoria de orçamento
  const saveBudgetCategory = async (category: string, allocated: number) => {
    try {
      console.log('Iniciando saveBudgetCategory...');
      
      // Primeiro, verificar a sessão
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Erro ao obter sessão:', sessionError);
        Alert.alert('Erro', 'Erro de autenticação. Faça login novamente.');
        return false;
      }

      if (!session?.user) {
        console.error('Nenhuma sessão ativa encontrada');
        Alert.alert('Erro', 'Você precisa estar logado para criar categorias.');
        return false;
      }

      const user = session.user;
      console.log('Usuário autenticado:', user.id);
      
      // Verificar limitação do plano gratuito
      const canCreateBudget = await checkBudgetLimitForFreeUsers(user.id);
      if (!canCreateBudget) {
        return false;
      }

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Gerar cor aleatória
      const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

      const insertData = {
        user_id: user.id,
        category: category,
        allocated: allocated,
        spent: 0,
        percentage: 0,
        icon: newCategoryIcon,
        color: randomColor,
        warning: false,
        month: currentMonth,
        year: currentYear
      };

      console.log('Dados para inserir:', insertData);
      
      const { data, error } = await supabase
        .from('budget_categories')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase:', error);
        Alert.alert('Erro', `Falha ao salvar: ${error.message}`);
        return false;
      }

      console.log('Categoria criada com sucesso:', data);

      // Adicionar nova categoria à lista local
      const newBudgetItem = {
        id: data.id,
        category: data.category,
        allocated: parseFloat(data.allocated),
        spent: parseFloat(data.spent),
        percentage: parseFloat(data.percentage),
        icon: data.icon,
        color: data.color,
        warning: data.warning,
        users: [
          { name: 'Maria', spent: 0, percentage: 0 },
          { name: 'João', spent: 0, percentage: 0 }
        ],
        transactions: []
      };

      setBudgetData(prev => [newBudgetItem, ...prev]);
      return true;
    } catch (error) {
      console.error('Erro catch:', error);
      Alert.alert('Erro', `Erro inesperado: ${error.message || error}`);
      return false;
    }
  };

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
  
  // Carregar tema do AsyncStorage no início
  useEffect(() => {
    const loadThemeFromStorage = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@MyFinlove:theme');
        if (storedTheme === 'masculine' && theme !== themes.masculine) {
          updateTheme('masculine');
        } else if (storedTheme === 'feminine' && theme !== themes.feminine) {
          updateTheme('feminine');
        }
      } catch (error) {
        console.error('Erro ao carregar tema do AsyncStorage:', error);
      }
    };
    
    loadThemeFromStorage();
    
    // Configurar listener para detectar quando o app volta ao primeiro plano
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        loadThemeFromStorage();
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [theme]);

  // Função para buscar o usuário atual e definir o tema baseado no gênero
  useEffect(() => {
    const fetchUserAndSetTheme = async () => {
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
          .select('*')
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
            updateTheme('masculine');
          } else if (gender === 'feminino' || gender === 'mulher' || gender === 'female' || gender === 'f') {
            console.log('Aplicando tema feminino (rosa) com base no perfil');
            updateTheme('feminine');
          } else {
            // Se o gênero no perfil não for reconhecido, tentar obter dos metadados da sessão
            const userMetadata = session.user.user_metadata;
            const metadataGender = userMetadata?.gender || '';
            
            console.log('Verificando gênero dos metadados:', metadataGender);
            
            if (metadataGender && typeof metadataGender === 'string') {
              const metaGenderLower = metadataGender.toLowerCase();
              
              if (metaGenderLower === 'masculino' || metaGenderLower === 'homem' || 
                  metaGenderLower === 'male' || metaGenderLower === 'm') {
                console.log('Aplicando tema masculino (azul) com base nos metadados');
                updateTheme('masculine');
              } else if (metaGenderLower === 'feminino' || metaGenderLower === 'mulher' || 
                         metaGenderLower === 'female' || metaGenderLower === 'f') {
                console.log('Aplicando tema feminino (rosa) com base nos metadados');
                updateTheme('feminine');
              } else {
                // Usar o tema global ou padrão se o gênero nos metadados também não for reconhecido
                if (global.dashboardTheme === 'masculine') {
                  updateTheme('masculine');
                  console.log('Aplicando tema masculino (azul) da variável global');
                } else {
                  updateTheme('feminine');
                  console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
                }
              }
            } else {
              // Usar o tema global ou padrão se não houver gênero nos metadados
              if (global.dashboardTheme === 'masculine') {
                updateTheme('masculine');
                console.log('Aplicando tema masculino (azul) da variável global');
              } else {
                updateTheme('feminine');
                console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar usuário e definir tema:', error);
      }
    };
    
    fetchUserAndSetTheme();
  }, []);

  // Carregar categorias de orçamento e metas financeiras quando o componente for montado
  useEffect(() => {
    fetchBudgetCategories();
    fetchFinancialGoals();
    fetchHistoryTransactions();
    fetchSaldoAtual();
    fetchChartData();
  }, []);

  const toggleBudgetExpanded = (id: string) => {
    if (expandedBudget === id) {
      setExpandedBudget(null);
    } else {
      setExpandedBudget(id);
    }
  };

  const toggleGoalExpanded = (id: string) => {
    if (expandedGoal === id) {
      setExpandedGoal(null);
    } else {
      setExpandedGoal(id);
    }
  };
  
  const handleAddBudget = async () => {
    console.log('=== INÍCIO handleAddBudget ===');
    console.log('newCategory:', newCategory);
    console.log('newAllocated:', newAllocated);
    
    if (!newCategory || !newAllocated || parseFloat(newAllocated) <= 0) {
      console.log('Campos incompletos - parando execução');
      Alert.alert("Informações Incompletas", "Por favor, preencha todos os campos.");
      return;
    }
    
    const allocatedValue = parseFloat(newAllocated);
    console.log('allocatedValue calculado:', allocatedValue);
    
    if (isNaN(allocatedValue) || allocatedValue <= 0) {
      console.log('Valor inválido - parando execução');
      Alert.alert("Valor Inválido", "Por favor, insira um valor válido para o orçamento.");
      return;
    }

    console.log('Chamando saveBudgetCategory...');
    const success = await saveBudgetCategory(newCategory, allocatedValue);
    console.log('Resultado de saveBudgetCategory:', success);
    
    if (success) {
      console.log('Sucesso! Limpando campos e fechando modal...');
      setNewCategory('');
      setNewAllocated('');
      setNewCategoryIcon('📊');
      setNewCategoryIconsVisible(false);
      setShowNewBudgetModal(false);
      Alert.alert("Sucesso", "Categoria de orçamento criada com sucesso!");
    } else {
      console.log('Falha ao salvar categoria');
      Alert.alert("Erro", "Falha ao criar categoria. Tente novamente.");
    }
    console.log('=== FIM handleAddBudget ===');
  };
  
  const handleEditBudget = () => {
    if (!currentBudget) return;
    
    const updatedBudgets = budgetData.map(budget => 
      budget.id === currentBudget.id ? currentBudget : budget
    );
    
    setBudgetData(updatedBudgets);
    setShowEditBudgetModal(false);
    setCurrentBudget(null);
  };
  
  const handleAddGoal = async () => {
    if (!newGoalTitle || !newGoalAmount || !newGoalDeadline) {
      Alert.alert("Informações Incompletas", "Por favor, preencha todos os campos.");
      return;
    }
    
    try {
      const success = await saveFinancialGoal(newGoalTitle, parseFloat(newGoalAmount), newGoalDeadline, newGoalIcon);
      
      if (success) {
        setNewGoalTitle('');
        setNewGoalAmount('');
        setNewGoalDeadline('');
        setNewGoalIcon('🎯');
        setNewGoalIconsVisible(false);
        setGoalCalendarVisible(false);
        setDeadlineType('semestral');
        setDeadlineDropdownVisible(false);
        setCustomDeadlineVisible(false);
        
        // Resetar estados do calendário
        const today = new Date();
        setGoalPickerMonth(today.getMonth());
        setGoalPickerYear(today.getFullYear());
        setGoalPickerDay(today.getDate());
        setGoalSelectedDate(`${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`);
        
        setShowNewGoalModal(false);
        Alert.alert("Sucesso", "Meta financeira criada com sucesso!");
        
        // Recarregar as metas
        await fetchFinancialGoals();
      } else {
        Alert.alert("Erro", "Falha ao criar meta financeira. Tente novamente.");
      }
    } catch (error) {
      console.error('Erro ao criar meta financeira:', error);
      Alert.alert("Erro", "Falha ao criar meta financeira. Tente novamente.");
    }
  };
  


  // Função para rolar até o topo quando abrir modais
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Modificar as funções de abertura de modal para incluir scrollToTop
  const openNewBudgetModal = () => {
    scrollToTop();
    setNewCategoryIconsVisible(false);
    setShowNewBudgetModal(true);
  };
  
  const openEditBudgetModal = (budget: any) => {
    scrollToTop();
    setCurrentBudget(budget);
    setShowEditBudgetModal(true);
  };
  
  const openNewGoalModal = () => {
    scrollToTop();
    setNewGoalTitle('');
    setNewGoalAmount('');
    setNewGoalDeadline('');
    setNewGoalIcon('🎯');
    setNewGoalIconsVisible(false);
    setGoalCalendarVisible(false);
    setDeadlineType('semestral');
    setDeadlineDropdownVisible(false);
    setCustomDeadlineVisible(false);
    
    // Resetar estados do calendário e calcular data semestral por padrão
    const today = new Date();
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(today.getMonth() + 6);
    
    setGoalPickerMonth(today.getMonth());
    setGoalPickerYear(today.getFullYear());
    setGoalPickerDay(today.getDate());
    
    const defaultDate = `${String(sixMonthsLater.getDate()).padStart(2, '0')}/${String(sixMonthsLater.getMonth() + 1).padStart(2, '0')}/${sixMonthsLater.getFullYear()}`;
    setGoalSelectedDate(defaultDate);
    setNewGoalDeadline(defaultDate);
    
    setShowNewGoalModal(true);
  };
  
  const openEditGoalModal = (goal: any) => {
    scrollToTop();
    setCurrentGoal(goal);
    setShowEditGoalModal(true);
  };

  // Função para deletar meta financeira
  const handleDeleteGoal = (goalId: string) => {
    console.log('handleDeleteGoal chamado com ID:', goalId);
    
    // Teste direto sem Alert primeiro
    console.log('Chamando deleteFinancialGoal diretamente para teste');
    deleteFinancialGoal(goalId);
    
    // Comentado temporariamente para debug
    /*
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta meta financeira? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => console.log('Exclusão cancelada')
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            console.log('Confirmado exclusão, chamando deleteFinancialGoal');
            deleteFinancialGoal(goalId);
          }
        }
      ]
    );
    */
  };

  // Função para deletar meta do banco de dados
  const deleteFinancialGoal = async (goalId: string) => {
    console.log('deleteFinancialGoal iniciado para ID:', goalId);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Sessão obtida:', !!session?.user, 'Erro de sessão:', sessionError);
      
      if (sessionError || !session?.user) {
        console.log('Usuário não autenticado');
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      console.log('Tentando deletar meta do banco de dados...');
      // Deletar a meta do banco de dados
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Erro ao deletar meta:', error);
        Alert.alert('Erro', 'Não foi possível excluir a meta financeira');
        return;
      }

      console.log('Meta deletada com sucesso do banco, atualizando estado local...');
      // Atualizar estado local
      setGoalsData(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
      Alert.alert('Sucesso', 'Meta financeira excluída com sucesso!');
      
    } catch (error) {
      console.error('Erro ao deletar meta:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    }
  };

  // Função para atualizar meta financeira
  const updateFinancialGoal = async (goalId: string, title: string, targetAmount: number, deadline: string, icon: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      // Buscar dados atuais da meta antes da atualização
      const { data: currentGoalData, error: currentGoalError } = await supabase
        .from('financial_goals')
        .select('current_amount, target_amount')
        .eq('id', goalId)
        .single();
      
      if (!currentGoalError && currentGoalData) {
        const currentPercentage = (currentGoalData.current_amount / currentGoalData.target_amount) * 100;
        const newPercentage = (currentGoalData.current_amount / targetAmount) * 100;
        
        // Se a meta não estava atingida antes mas agora está (devido à mudança no valor alvo)
        if (currentPercentage < 100 && newPercentage >= 100) {
          await notifyGoalReached(title, targetAmount);
        }
      }

      // Atualizar a meta no banco de dados
      const { error } = await supabase
        .from('financial_goals')
        .update({
          title,
          target_amount: targetAmount,
          deadline,
          icon,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Erro ao atualizar meta:', error);
        Alert.alert('Erro', 'Não foi possível atualizar a meta financeira');
        return;
      }

      // Recarregar metas para obter dados atualizados
      await fetchFinancialGoals();
      Alert.alert('Sucesso', 'Meta financeira atualizada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    }
  };

  // Função para deletar orçamento
  const handleDeleteBudget = (budgetId: string) => {
    console.log('handleDeleteBudget chamado com ID:', budgetId);
    
    // Verificar se estamos no ambiente web
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Tem certeza que deseja excluir esta categoria de orçamento? Se houver transações vinculadas, elas serão desvinculadas. Esta ação não pode ser desfeita.'
      );
      
      if (confirmed) {
        console.log('Confirmado exclusão via web confirm, chamando deleteBudgetCategory');
        deleteBudgetCategory(budgetId);
      } else {
        console.log('Exclusão cancelada via web confirm');
      }
    } else {
      // Para mobile, usar Alert nativo
      Alert.alert(
        'Confirmar exclusão',
        'Tem certeza que deseja excluir esta categoria de orçamento? Se houver transações vinculadas, elas serão desvinculadas. Esta ação não pode ser desfeita.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => console.log('Exclusão cancelada')
          },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: () => {
              console.log('Confirmado exclusão, chamando deleteBudgetCategory');
              deleteBudgetCategory(budgetId);
            }
          }
        ]
      );
    }
  };

  // Função para deletar categoria de orçamento do banco de dados
  const deleteBudgetCategory = async (budgetId: string) => {
    try {
      console.log('deleteBudgetCategory iniciado para ID:', budgetId);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.log('Erro de autenticação:', sessionError);
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      console.log('Usuário autenticado, verificando transações vinculadas...');

      // Primeiro, verificar se existem transações vinculadas a esta categoria
      const { data: linkedTransactions, error: checkError } = await supabase
        .from('transactions')
        .select('id')
        .eq('budget_category_id', budgetId)
        .eq('owner_id', session.user.id);

      if (checkError) {
        console.error('Erro ao verificar transações vinculadas:', checkError);
        Alert.alert('Erro', 'Não foi possível verificar transações vinculadas');
        return;
      }

      if (linkedTransactions && linkedTransactions.length > 0) {
        console.log(`Encontradas ${linkedTransactions.length} transações vinculadas. Removendo vínculos...`);
        
        // Remover a referência da categoria das transações (definir como null)
        const { error: updateError } = await supabase
          .from('transactions')
          .update({ budget_category_id: null })
          .eq('budget_category_id', budgetId)
          .eq('owner_id', session.user.id);

        if (updateError) {
          console.error('Erro ao remover vínculos das transações:', updateError);
          Alert.alert('Erro', 'Não foi possível remover os vínculos das transações');
          return;
        }

        console.log('Vínculos removidos com sucesso.');
      } else {
        console.log('Nenhuma transação vinculada encontrada.');
      }

      console.log('Deletando categoria de orçamento...');

      // Agora deletar a categoria de orçamento
      const { error } = await supabase
        .from('budget_categories')
        .delete()
        .eq('id', budgetId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Erro ao deletar categoria de orçamento:', error);
        Alert.alert('Erro', 'Não foi possível excluir a categoria de orçamento');
        return;
      }

      console.log('Categoria deletada com sucesso, atualizando estado local...');

      // Atualizar estado local
      setBudgetData(prevBudgets => prevBudgets.filter(budget => budget.id !== budgetId));
      
      const message = linkedTransactions && linkedTransactions.length > 0 
        ? `Categoria de orçamento excluída com sucesso! ${linkedTransactions.length} transação(ões) foram desvinculadas.`
        : 'Categoria de orçamento excluída com sucesso!';
      
      Alert.alert('Sucesso', message);
      
    } catch (error) {
      console.error('Erro geral ao deletar categoria:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    }
  };

  // Função para atualizar categoria de orçamento
  const updateBudgetCategory = async (budgetId: string, category: string, allocated: number, icon: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      // Atualizar a categoria no banco de dados
      const { error } = await supabase
        .from('budget_categories')
        .update({
          category,
          allocated,
          icon,
          updated_at: new Date().toISOString()
        })
        .eq('id', budgetId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Erro ao atualizar categoria de orçamento:', error);
        Alert.alert('Erro', 'Não foi possível atualizar a categoria de orçamento');
        return;
      }

      // Recarregar orçamentos para obter dados atualizados
      await fetchBudgetCategories();
      Alert.alert('Sucesso', 'Categoria de orçamento atualizada com sucesso!');
      
    } catch (error) {
      console.error('Erro geral ao atualizar categoria:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado');
    }
  };
  


  // Função para alternar a visibilidade do seletor de ícones da categoria
  const toggleNewCategoryIcons = () => {
    setNewCategoryIconsVisible(!newCategoryIconsVisible);
  };

  // Função para selecionar um ícone da categoria
  const selectNewCategoryIcon = (icon: string) => {
    setNewCategoryIcon(icon);
    setNewCategoryIconsVisible(false);
  };

  // Função para alternar a visibilidade do seletor de ícones da meta
  const toggleNewGoalIcons = () => {
    setNewGoalIconsVisible(!newGoalIconsVisible);
  };

  // Função para selecionar um ícone da meta
  const selectNewGoalIcon = (icon: string) => {
    setNewGoalIcon(icon);
    setNewGoalIconsVisible(false);
  };

  const toggleDeadlineDropdown = () => {
    setDeadlineDropdownVisible(!deadlineDropdownVisible);
  };

  const selectDeadlineType = (type: string) => {
    setDeadlineType(type);
    setDeadlineDropdownVisible(false);
    
    if (type === 'personalizado') {
      setCustomDeadlineVisible(true);
    } else {
      setCustomDeadlineVisible(false);
      // Calcular data baseada no tipo selecionado
      const currentDate = new Date();
      let targetDate = new Date();
      
      switch (type) {
        case 'semestral':
          targetDate.setMonth(currentDate.getMonth() + 6);
          break;
        case 'anual':
          targetDate.setFullYear(currentDate.getFullYear() + 1);
          break;
        case 'cinco_anos':
          targetDate.setFullYear(currentDate.getFullYear() + 5);
          break;
      }
      
      const formattedDate = `${String(targetDate.getDate()).padStart(2, '0')}/${String(targetDate.getMonth() + 1).padStart(2, '0')}/${targetDate.getFullYear()}`;
      setGoalSelectedDate(formattedDate);
      setNewGoalDeadline(formattedDate);
    }
  };

  const getDeadlineTypeLabel = (type: string) => {
    switch (type) {
      case 'semestral': return 'Semestral (6 meses)';
      case 'anual': return 'Anual (1 ano)';
      case 'cinco_anos': return 'Cinco Anos';
      case 'personalizado': return 'Personalizado';
      default: return 'Semestral (6 meses)';
    }
  };

  // Funções para o calendário do modal de meta
  const toggleGoalCalendar = () => {
    setGoalCalendarVisible(!goalCalendarVisible);
  };

  const goToPreviousGoalMonth = () => {
    if (goalPickerMonth === 0) {
      setGoalPickerMonth(11);
      setGoalPickerYear(goalPickerYear - 1);
    } else {
      setGoalPickerMonth(goalPickerMonth - 1);
    }
  };

  const goToNextGoalMonth = () => {
    if (goalPickerMonth === 11) {
      setGoalPickerMonth(0);
      setGoalPickerYear(goalPickerYear + 1);
    } else {
      setGoalPickerMonth(goalPickerMonth + 1);
    }
  };

  const selectGoalDateFromPicker = (day: number) => {
    setGoalPickerDay(day);
    const newDate = `${String(day).padStart(2, '0')}/${String(goalPickerMonth + 1).padStart(2, '0')}/${goalPickerYear}`;
    setGoalSelectedDate(newDate);
    
    // Atualizar o prazo da meta
    setNewGoalDeadline(newDate);
    
    setGoalCalendarVisible(false);
  };

  // Função para gerar os dias do mês para o calendário do modal de meta
  const generateGoalCalendarDays = () => {
    const daysInMonth = new Date(goalPickerYear, goalPickerMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(goalPickerYear, goalPickerMonth, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    // Dias do mês anterior para completar a primeira semana
    const daysFromPreviousMonth = adjustedFirstDay;
    const previousMonthDays = [];
    if (daysFromPreviousMonth > 0) {
      const daysInPreviousMonth = new Date(goalPickerYear, goalPickerMonth, 0).getDate();
      for (let i = daysInPreviousMonth - daysFromPreviousMonth + 1; i <= daysInPreviousMonth; i++) {
        previousMonthDays.push({
          day: i,
          currentMonth: false,
          date: new Date(goalPickerYear, goalPickerMonth - 1, i)
        });
      }
    }
    
    // Dias do mês atual
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        day: i,
        currentMonth: true,
        date: new Date(goalPickerYear, goalPickerMonth, i)
      });
    }
    
    // Dias do próximo mês para completar a última semana
    const remainingDays = (7 - ((adjustedFirstDay + daysInMonth) % 7)) % 7;
    const nextMonthDays = [];
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        day: i,
        currentMonth: false,
        date: new Date(goalPickerYear, goalPickerMonth + 1, i)
      });
    }
    
    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Renderizar os dias do calendário em formato de grade para o modal de meta
  const renderGoalCalendarGrid = () => {
    const days = generateGoalCalendarDays();
    const rows: JSX.Element[] = [];
    let cells: JSX.Element[] = [];

    // Adicionar cabeçalho dos dias da semana
    const headerCells = weekDays.map((day, index) => (
      <View key={`goal-header-${index}`} style={styles.goalCalendarHeaderCell}>
        <Text style={styles.goalCalendarHeaderText}>{day}</Text>
      </View>
    ));
    rows.push(
      <View key="goal-header" style={styles.goalCalendarRow}>
        {headerCells}
      </View>
    );

    // Agrupar os dias em semanas
    days.forEach((day, index) => {
      const isSelected = goalPickerDay === day.day && day.currentMonth;
      
      cells.push(
        <TouchableOpacity
          key={`goal-day-${index}`}
          style={[
            styles.goalCalendarCell,
            day.currentMonth ? styles.goalCurrentMonthCell : styles.goalOtherMonthCell,
            isSelected ? styles.goalSelectedCell : null
          ]}
          onPress={() => day.currentMonth && selectGoalDateFromPicker(day.day)}
        >
          <View
            style={[
              styles.goalDayCircle,
              isSelected ? styles.goalSelectedDayCircle : null
            ]}
          >
            <Text
              style={[
                styles.goalCalendarDay,
                day.currentMonth ? styles.goalCurrentMonthDay : styles.goalOtherMonthDay,
                isSelected ? [styles.goalSelectedDayText, { color: theme.primary }] : null
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
          <View key={`goal-row-${Math.floor(index / 7)}`} style={styles.goalCalendarRow}>
            {cells}
          </View>
        );
        cells = [];
      }
    });

    return rows;
  };

  // Definir estilos dentro do componente para ter acesso ao tema
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#f5f7fa',
    },
    container: {
      flex: 1,
      backgroundColor: '#f9fafc',
    },
    header: {
      paddingTop: 50,
      paddingBottom: 10,
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 3,
      zIndex: 10,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    backButton: {
      padding: 8,
      backgroundColor: 'rgba(0,0,0,0.03)',
      borderRadius: 12,
    },
    headerTitle: {
      fontSize: 18,
      color: '#333',
      fontFamily: fontFallbacks.Poppins_600SemiBold,
    },
    moreButton: {
      padding: 8,
      backgroundColor: 'rgba(0,0,0,0.03)',
      borderRadius: 12,
    },
    tabs: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      backgroundColor: '#fff',
      paddingBottom: 15,
      borderBottomColor: '#f0f0f0',
      borderBottomWidth: 1,
    },
    tab: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginRight: 16,
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
      flexDirection: 'row',
      alignItems: 'center',
    },
    activeTab: {
      borderBottomColor: theme.primary,
    },
    tabText: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_500Medium,
      color: '#777',
    },
    activeTabText: {
      color: '#333',
      fontFamily: fontFallbacks.Poppins_600SemiBold,
    },
    content: {
      flex: 1,
      marginBottom: 80, // Para não sobrepor a barra de navegação
      backgroundColor: '#f9fafc',
    },
    scrollContainer: {
      paddingBottom: 100, // Increased for better spacing at bottom
      paddingHorizontal: 12, // Reduced for better fit on small screens
      paddingTop: 16,
    },
    dateContainer: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      backgroundColor: '#fff',
      marginBottom: 16,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 0.5,
      borderColor: '#f0f0f0',
      alignItems: 'center',  // Centraliza o conteúdo horizontalmente
    },
    dateText: {
      fontSize: 14,
      color: '#777',
      fontFamily: fontFallbacks.Poppins_400Regular,
      marginBottom: 4,
      textAlign: 'center',  // Centraliza o texto
    },
    amountText: {
      fontSize: width < 360 ? 24 : 28, // Responsive font size
      color: '#000',
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      marginBottom: 4,
      textAlign: 'center',  // Centraliza o texto
    },
    amountLabel: {
      fontSize: 14,
      color: '#666',
      fontFamily: fontFallbacks.Poppins_400Regular,
      textAlign: 'center',  // Centraliza o texto
    },
    budgetContent: {
      paddingHorizontal: width < 360 ? 8 : 16, // Responsive padding
    },
    goalsContent: {
      paddingHorizontal: width < 360 ? 8 : 16, // Responsive padding
    },
    donutChartContainer: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: width < 360 ? 15 : 20, // Responsive padding
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 0.5,
      borderColor: '#f0f0f0',
    },
    chartRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: width < 360 ? 'wrap' : 'nowrap', // Allow wrapping on small screens
    },
    chartColumn: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    donutChart: {
      width: width < 360 ? 140 : 160, // Responsive size
      height: width < 360 ? 140 : 160, // Responsive size
      borderRadius: width < 360 ? 70 : 80, // Responsive radius
      borderWidth: 15,
      borderColor: '#6C5CE7',
      marginBottom: width < 360 ? 10 : 0, // Add margin on small screens
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      borderLeftColor: '#74B9FF',
      borderBottomColor: '#55EFC4',
      borderRightColor: '#FF7675',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
      alignSelf: 'center', // Center on all screen sizes
    },
    donutChartInner: {
      width: width < 360 ? 110 : 130, // Responsive size
      height: width < 360 ? 110 : 130, // Responsive size
      borderRadius: width < 360 ? 55 : 65, // Responsive radius
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    legendContainer: {
      width: '100%',
      paddingTop: 20,
      paddingHorizontal: 20,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      justifyContent: 'space-between',
    },
    legendDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 12,  // Aumentado de 0 para 12 para criar espaço entre a bolinha e o texto
    },
    legendText: {
      fontSize: 14,
      color: '#333',
      fontFamily: fontFallbacks.Poppins_500Medium,
      flex: 1,
      ...Platform.select({
        android: {
          flexWrap: 'nowrap',
          numberOfLines: 1,
          ellipsizeMode: 'tail',
        },
      }),
    },
    legendPercentValue: {
      fontSize: 14,
      color: '#555',
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      marginLeft: 8,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: width < 360 ? 16 : 18, // Responsive font size
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      color: '#333',
    },
    seeAllLink: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_500Medium,
      color: theme.primary,
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
    addCategoryButton: {
      backgroundColor: theme.primary,
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    addButtonText: {
      color: '#FFF',
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_500Medium,
      marginLeft: 6,
    },
    
    // Estilos para transações
    transactionsList: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 0.5,
      borderColor: '#f0f0f0',
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    transactionIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    transactionInfo: {
      flex: 1,
    },
    transactionTitle: {
      fontSize: 16,
      fontFamily: fontFallbacks.Poppins_500Medium,
      color: '#333',
      marginBottom: 4,
    },
    transactionTime: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_400Regular,
      color: '#888',
    },
    transactionAmount: {
      fontSize: 16,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      color: '#333',
      marginLeft: 8,
    },
    incomeAmount: {
      color: '#4CD964',
    },
    transferAmount: {
      color: '#5856D6',
    },
    
    // Estilos para orçamentos
    budgetCard: {
      backgroundColor: '#FFF',
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      overflow: 'hidden',
      borderWidth: 0.5,
      borderColor: '#f0f0f0',
    },
    budgetHeader: {
      flexDirection: 'row',
      padding: 16,
    },
    categoryIcon: {
      width: width < 360 ? 40 : 50,
      height: width < 360 ? 40 : 50,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    categoryIconText: {
      fontSize: width < 360 ? 20 : 24,
    },
    budgetInfo: {
      flex: 1,
    },
    budgetTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    categoryName: {
      fontSize: width < 360 ? 14 : 16,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      color: '#333',
    },
    warningBadge: {
      backgroundColor: '#FF3B30',
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 4,
    },
    budgetBarContainer: {
      height: 8,
      backgroundColor: '#f0f0f0',
      borderRadius: 4,
      marginBottom: 12,
    },
    budgetBar: {
      height: 8,
      borderRadius: 4,
    },
    budgetDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    spentText: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_500Medium,
      color: '#333',
    },
    allocatedText: {
      color: '#888',
      fontFamily: fontFallbacks.Poppins_400Regular,
    },
    percentageText: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      color: '#333',
      backgroundColor: '#f0f0f0',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    warningText: {
      color: '#FF3B30',
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
    },
    budgetExpanded: {
      padding: 16,
      backgroundColor: '#f9f9f9',
      borderTopWidth: 1,
      borderTopColor: '#eee',
    },
    expandedSectionTitle: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      color: '#666',
      marginBottom: 12,
    },
    spendingByPersonSection: {
      marginBottom: 20,
    },
    userRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    userIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    userName: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_500Medium,
      color: '#333',
    },
    userSpentInfo: {
      alignItems: 'flex-end',
    },
    userSpentText: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_500Medium,
      color: '#333',
    },
    userPercentageText: {
      fontSize: 12,
      fontFamily: fontFallbacks.Poppins_400Regular,
      color: '#888',
    },
    transactionsSection: {
      marginBottom: 20,
    },
    transactionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    transactionDesc: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_500Medium,
      color: '#333',
    },
    transactionDate: {
      fontSize: 12,
      fontFamily: fontFallbacks.Poppins_400Regular,
      color: '#888',
    },
    budgetActions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
    },
    budgetActionButton: {
      padding: 10,
      marginLeft: 6,
      borderRadius: 8,
      backgroundColor: 'rgba(0,0,0,0.03)',
      minWidth: 36,
      minHeight: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    budgetActionButtonText: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_500Medium,
      color: '#FFF',
      marginLeft: 8,
    },
    
    // Estilos para metas financeiras
    goalCard: {
      backgroundColor: '#FFF',
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      overflow: 'hidden',
      borderWidth: 0.5,
      borderColor: '#f0f0f0',
    },
    goalHeader: {
      flexDirection: 'row',
      padding: 16,
    },
    goalIcon: {
      width: width < 360 ? 40 : 50,
      height: width < 360 ? 40 : 50,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    goalIconText: {
      fontSize: width < 360 ? 20 : 24,
    },
    goalInfo: {
      flex: 1,
    },
    goalActions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
    },
    goalActionButton: {
      padding: 10,
      marginLeft: 6,
      borderRadius: 8,
      backgroundColor: 'rgba(0,0,0,0.03)',
      minWidth: 36,
      minHeight: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteButton: {
      backgroundColor: 'rgba(255, 71, 87, 0.1)',
    },
    goalTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    goalTitle: {
      fontSize: width < 360 ? 14 : 16,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      color: '#333',
    },
    goalDeadline: {
      fontSize: 11,
      fontFamily: fontFallbacks.Poppins_500Medium,
      color: theme.primary,
      backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.1)`,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    goalBarContainer: {
      height: 8,
      backgroundColor: '#f0f0f0',
      borderRadius: 4,
      marginBottom: 12,
    },
    goalBar: {
      height: 8,
      borderRadius: 4,
    },
    goalDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    goalAmountText: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_500Medium,
      color: '#333',
    },
    goalTargetText: {
      color: '#888',
      fontFamily: fontFallbacks.Poppins_400Regular,
    },
    goalPercentageText: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      color: theme.primary,
      backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.1)`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    goalExpanded: {
      padding: 16,
      backgroundColor: '#f9f9f9',
      borderTopWidth: 1,
      borderTopColor: '#eee',
    },
    goalTransactionsSection: {
      marginBottom: 20,
    },
    emptyTransactions: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyTransactionsText: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_400Regular,
      color: '#888',
      textAlign: 'center',
    },

    
    // Estilos para modais
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: 'white',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      maxHeight: height * 0.8, // Use percentage of screen height
      ...Platform.select({
        android: {
          height: height * 0.75, // Altura específica para Android
        },
      }),
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      color: '#333',
    },
    closeButton: {
      padding: 8,
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: 12,
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_500Medium,
      color: '#666',
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: '#f5f7fa',
      padding: width < 360 ? 12 : 14,
      borderRadius: 12,
      fontSize: width < 360 ? 14 : 16,
      fontFamily: fontFallbacks.Poppins_400Regular,
      borderWidth: 1,
      borderColor: '#efefef',
    },
    amountInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 12,
      padding: 12,
      backgroundColor: '#f5f7fa',
    },
    currencySymbol: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333333',
      marginRight: 5,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
    },
    amountInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: '#333333',
      fontFamily: fontFallbacks.Poppins_500Medium,
    },
    iconSelectorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 12,
      backgroundColor: '#f5f7fa',
      overflow: 'hidden',
    },
    emojiSelectorButton: {
      width: 50,
      height: 48,
      backgroundColor: '#ffffff',
      borderRightWidth: 1,
      borderRightColor: '#e0e0e0',
      alignItems: 'center',
      justifyContent: 'center',
    },
    emojiSelectorText: {
      fontSize: 24,
      lineHeight: 24,
    },
    iconSelectorText: {
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 14,
      fontSize: 16,
      fontFamily: fontFallbacks.Poppins_400Regular,
      color: '#666',
    },
    emojiDropdown: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 12,
      padding: 12,
      marginTop: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 10,
      zIndex: 1000,
    },
    emojiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    emojiGridItem: {
      width: '14.28%', // 7 colunas: 100% / 7
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      borderRadius: 6,
      backgroundColor: 'transparent',
    },
    emojiGridItemSelected: {
      backgroundColor: '#f3f4f6',
      borderWidth: 1,
      borderColor: '#d1d5db',
    },
    emojiGridText: {
      fontSize: 20,
      lineHeight: 24,
    },
    submitButton: {
      backgroundColor: theme.primary,
      padding: width < 360 ? 14 : 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 24,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    submitButtonText: {
      color: 'white',
      fontSize: 16,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
    },
    goalSummary: {
      backgroundColor: '#f5f7fa',
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
    },
    goalSummaryTitle: {
      fontSize: 16,
      fontFamily: fontFallbacks.Poppins_500Medium,
      color: '#333',
      marginBottom: 4,
    },
    goalSummaryAmount: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_400Regular,
      color: '#666',
    },
    userSelectorContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    userSelectorButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#ddd',
      flex: 0.48,
    },
    userSelectorButtonActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    userSelectorButtonText: {
      marginLeft: 8,
      color: '#666',
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_500Medium,
    },
    userSelectorButtonTextActive: {
      color: 'white',
    },
    goalCompletionText: {
      fontSize: width < 360 ? 22 : 26, // Responsive font size
      color: '#000',
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      textAlign: 'center',
    },
    goalCompletionLabel: {
      fontSize: 12,
      color: '#888',
      fontFamily: fontFallbacks.Poppins_400Regular,
      textAlign: 'center',
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    chartTitle: {
      fontSize: 16,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      color: '#333',
    },
    chartTotalValue: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chartTotalLabel: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_500Medium,
      color: '#666',
      marginRight: 8,
    },
    chartTotalAmount: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_500Medium,
      color: '#333',
    },
    chartMainContent: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 10,
    },
    goalLegendContainer: {
      flex: 1,
      paddingLeft: 20,
      marginTop: 5,
    },
    goalLegendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingRight: 8,
    },
    goalLegendLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    goalLegendText: {
      fontSize: 14,
      color: '#333',
      fontFamily: fontFallbacks.Poppins_500Medium,
      marginLeft: 8,
      flex: 1,
      paddingRight: 5,
    },
    goalLegendPercent: {
      fontSize: 14,
      color: theme.primary,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      backgroundColor: `rgba(${theme === themes.feminine ? '182, 135, 254' : '0, 115, 234'}, 0.1)`,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      minWidth: 50,
      textAlign: 'center',
    },
    legendTitle: {
      fontSize: 16,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      color: '#333',
      marginBottom: 16,
    },
    metricsContainer: {
      marginTop: 20,
      marginBottom: 20,
    },
    metricsSeparator: {
      height: 1,
      backgroundColor: '#f0f0f0',
      marginBottom: 20,
    },
    goalsMetricsSummary: {
      flexDirection: 'column',
      alignItems: 'center',
    },
    goalMetricItem: {
      alignItems: 'center',
      marginBottom: 15,
    },
    goalDivider: {
      width: 1,
      height: 40,
      backgroundColor: '#f0f0f0',
    },
    goalMetricValue: {
      fontSize: 16,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      color: '#333',
      marginBottom: 4,
    },
    goalMetricLabel: {
      fontSize: 12,
      fontFamily: fontFallbacks.Poppins_400Regular,
      color: '#888',
      textAlign: 'center',
    },
    
    // Menu modal styles
    menuModalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    menuModalContent: {
      backgroundColor: 'white',
      borderRadius: 20,
      width: '100%',
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
    menuHeader: {
      alignItems: 'flex-end',
      marginBottom: 20,
    },
    menuGrid: {
      marginBottom: 30,
    },
    menuRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 25,
    },
    menuItem: {
      flex: 1,
      alignItems: 'center',
    },
    menuIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    menuItemTitle: {
      fontSize: 14,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      marginBottom: 4,
    },
    menuItemSubtitle: {
      fontSize: 12,
      fontFamily: fontFallbacks.Poppins_400Regular,
    },
    closeFullButton: {
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
    },
    closeFullButtonText: {
      color: 'white',
      fontSize: 16,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
    },
    
    // Bottom navigation
    bottomNav: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: 'white',
      paddingVertical: 10,
      paddingHorizontal: 10,
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
    navItem: {
      alignItems: 'center',
      width: 70,
    },
    navText: {
      fontSize: 10,
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
    
    // Estilos para loading e empty state
    loadingContainer: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 40,
      marginBottom: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 0.5,
      borderColor: '#f0f0f0',
    },
    loadingText: {
      fontSize: 16,
      color: '#666',
      fontFamily: fontFallbacks.Poppins_400Regular,
    },
    emptyContainer: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 40,
      marginBottom: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 0.5,
      borderColor: '#f0f0f0',
    },
    emptyText: {
      fontSize: 16,
      color: '#333',
      fontFamily: fontFallbacks.Poppins_500Medium,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: '#666',
      fontFamily: fontFallbacks.Poppins_400Regular,
      textAlign: 'center',
    },
    // Estilos do calendário para o modal de meta
    goalDateInput: {
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
    goalDateText: {
      flex: 1,
      fontSize: 16,
      color: '#333',
      fontFamily: fontFallbacks.Poppins_400Regular,
    },
    goalDateTextInput: {
      flex: 1,
      fontSize: 16,
      color: '#333',
      fontFamily: fontFallbacks.Poppins_400Regular,
      padding: 0,
    },
    calendarButton: {
      padding: 4,
    },
    goalCalendarPickerContainer: {
      marginHorizontal: 4,
    },
    goalCalendarPickerHeader: {
      borderRadius: 12,
      padding: 16,
      marginTop: 8,
    },
    goalCalendarPickerMonthSelector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    goalCalendarPickerArrow: {
      padding: 8,
    },
    goalCalendarPickerMonthText: {
      color: '#FFF',
      fontSize: 18,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
    },
    goalCalendarContainer: {
      marginHorizontal: 4,
    },
    goalCalendarHeaderCell: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    goalCalendarHeaderText: {
      color: '#FFF',
      fontSize: 12,
      fontFamily: fontFallbacks.Poppins_400Regular,
      opacity: 0.9,
    },
    goalCalendarRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 8,
    },
    goalCalendarCell: {
      width: 40,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
    },
    goalDayCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    goalSelectedDayCircle: {
      backgroundColor: '#FFF',
    },
    goalCalendarDay: {
      fontSize: 16,
      fontFamily: fontFallbacks.Poppins_400Regular,
    },
    goalCurrentMonthCell: {},
    goalOtherMonthCell: {
      opacity: 0.6,
    },
    goalSelectedCell: {},
    goalCurrentMonthDay: {
      color: '#FFF',
    },
    goalOtherMonthDay: {
      color: 'rgba(255, 255, 255, 0.4)',
    },
    goalSelectedDayText: {
      fontFamily: fontFallbacks.Poppins_600SemiBold,
    },
    // Estilos do dropdown de prazo
    deadlineDropdown: {
      marginTop: 4,
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    deadlineOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    deadlineOptionSelected: {
      backgroundColor: `${theme.primary}10`,
    },
    deadlineOptionText: {
      fontSize: 16,
      color: '#333',
      fontFamily: fontFallbacks.Poppins_400Regular,
      flex: 1,
    },
    deadlineOptionTextSelected: {
      color: theme.primary,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
    },
    customDeadlineContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
    },
    customDeadlineLabel: {
      fontSize: 14,
      color: '#666',
      fontFamily: fontFallbacks.Poppins_500Medium,
      marginBottom: 8,
    },
    // Estilos do ScrollView do modal
    modalScrollView: {
      flex: 1,
      maxHeight: height * 0.6, // Limita a altura máxima do scroll
    },
    modalScrollContent: {
      paddingBottom: 20,
    },
    
    // Estilos para o modal de todas as transações
    transactionsModalList: {
      maxHeight: height * 0.6,
    },
    emptyTransactions: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyTransactionsText: {
      fontSize: 16,
      color: '#666',
      fontFamily: fontFallbacks.Poppins_400Regular,
      textAlign: 'center',
    },
    transactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: '#fff',
      borderRadius: 12,
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      borderWidth: 0.5,
      borderColor: '#f0f0f0',
    },
    transactionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    transactionInfo: {
      flex: 1,
    },
    transactionTitle: {
      fontSize: 16,
      fontFamily: fontFallbacks.Poppins_500Medium,
      color: '#333',
      marginBottom: 2,
    },
    transactionTime: {
      fontSize: 12,
      fontFamily: fontFallbacks.Poppins_400Regular,
      color: '#888',
      marginBottom: 2,
    },
    transactionCategory: {
      fontSize: 12,
      fontFamily: fontFallbacks.Poppins_400Regular,
      color: '#666',
    },
    transactionAmount: {
      fontSize: 16,
      fontFamily: fontFallbacks.Poppins_600SemiBold,
      color: '#FF3B30',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <StatusBar style="dark" />

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => router.push('/(app)/dashboard')}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Renda e Despesas</Text>
            <TouchableOpacity style={styles.moreButton}>
              <MoreVertical size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'budget' && styles.activeTab]}
            onPress={() => setActiveTab('budget')}
          >
            <Text style={[styles.tabText, activeTab === 'budget' && styles.activeTabText]}>
              Orçamentos
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'goals' && styles.activeTab]}
            onPress={() => setActiveTab('goals')}
          >
            <Text style={[styles.tabText, activeTab === 'goals' && styles.activeTabText]}>
              Metas Financeiras
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('pt-BR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}</Text>
            <Text style={styles.amountText}>R$ {saldoAtual.toFixed(2).replace('.', ',')}</Text>
            <Text style={styles.amountLabel}>Saldo</Text>
          </View>

          {activeTab === 'budget' ? (
            // Conteúdo da aba Orçamentos
            <View style={styles.budgetContent}>
              <View style={styles.donutChartContainer}>
                <View style={styles.chartColumn}>
                  {renderDonutChart()}
                  
                  <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#4CD964' }]} />
                      <Text style={styles.legendText}>Receita</Text>
                      <Text style={styles.legendPercentValue}>{chartData.income.percentage}%</Text>
                    </View>
                    
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
                      <Text style={styles.legendText}>Despesa</Text>
                      <Text style={styles.legendPercentValue}>{chartData.expense.percentage}%</Text>
                    </View>
                    
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#5856D6' }]} />
                      <Text style={styles.legendText}>Transferência</Text>
                      <Text style={styles.legendPercentValue}>{chartData.transfer.percentage}%</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Histórico</Text>
                <TouchableOpacity onPress={handleShowAllTransactions}>
                  <Text style={styles.seeAllLink}>Ver Todos</Text>
                </TouchableOpacity>
              </View>


              <View style={styles.transactionsList}>
                {historyTransactions.length === 0 ? (
                  <View style={styles.emptyTransactions}>
                    <Text style={styles.emptyTransactionsText}>Nenhuma transação com orçamento encontrada ainda.</Text>
                  </View>
                ) : (
                  historyTransactions.map((transaction, index) => (
                    <View key={transaction.id} style={styles.transactionItem}>
                      <View style={[styles.transactionIcon, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
                        <Text style={{ fontSize: 20 }}>{transaction.budgetIcon}</Text>
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionTitle}>{transaction.description}</Text>
                        <Text style={styles.transactionTime}>{transaction.time} • {transaction.user}</Text>
                      </View>
                      <Text style={styles.transactionAmount}>
                        -R$ {transaction.amount.toFixed(2).replace('.', ',')}
                      </Text>
                    </View>
                  ))
                )}
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categorias de Orçamento</Text>
                <TouchableOpacity 
                  style={styles.addCategoryButton}
                  onPress={openNewBudgetModal}
                >
                  <Plus size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Carregando categorias...</Text>
                </View>
              ) : budgetData.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Nenhuma categoria de orçamento criada ainda.</Text>
                  <Text style={styles.emptySubtext}>Toque no botão + para criar sua primeira categoria!</Text>
                </View>
              ) : (
                budgetData.map(budget => (
                <View key={budget.id} style={styles.budgetCard}>
                  <TouchableOpacity 
                    style={styles.budgetHeader}
                    onPress={() => toggleBudgetExpanded(budget.id)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: budget.color }]}>
                      <Text style={styles.categoryIconText}>{budget.icon}</Text>
                    </View>

                    <View style={styles.budgetInfo}>
                      <View style={styles.budgetTitleRow}>
                        <Text style={styles.categoryName}>{budget.category}</Text>
                        {budget.warning && (
                          <View style={styles.warningBadge}>
                            <AlertCircle size={14} color="#FFF" />
                          </View>
                        )}
                      </View>
                      <View style={styles.budgetBarContainer}>
                        <View 
                          style={[
                            styles.budgetBar, 
                            { 
                              width: `${budget.percentage}%`,
                              backgroundColor: budget.percentage > 90 ? '#FF3B30' : budget.color
                            }
                          ]} 
                        />
                      </View>
                      <View style={styles.budgetDetails}>
                        <Text style={styles.spentText}>
                          R$ {budget.spent.toFixed(2).replace('.', ',')} <Text style={styles.allocatedText}>/ R$ {budget.allocated.toFixed(2).replace('.', ',')}</Text>
                        </Text>
                        <Text style={[
                          styles.percentageText,
                          budget.percentage > 90 && styles.warningText
                        ]}>
                          {budget.percentage}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.budgetActions}>
                      <TouchableOpacity 
                        style={styles.budgetActionButton}
                        onPress={() => {
                          console.log('Botão edit orçamento pressionado para:', budget.id);
                          openEditBudgetModal(budget);
                        }}
                        activeOpacity={0.7}
                      >
                        <Edit2 size={18} color="#666" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.budgetActionButton, styles.deleteButton]}
                        onPress={() => {
                          console.log('Botão delete orçamento pressionado para:', budget.id);
                          handleDeleteBudget(budget.id);
                        }}
                        activeOpacity={0.7}
                      >
                        <X size={18} color="#FF4757" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                  
                  {expandedBudget === budget.id && (
                    <View style={styles.budgetExpanded}>
                      <View style={styles.transactionsSection}>
                        <Text style={styles.expandedSectionTitle}>Histórico de Transações</Text>
                        
                        {budget.transactions.length === 0 ? (
                          <View style={styles.emptyTransactions}>
                            <Text style={styles.emptyTransactionsText}>Nenhuma transação vinculada a este orçamento ainda.</Text>
                          </View>
                        ) : (
                          budget.transactions.map((transaction, index) => (
                            <View key={index} style={styles.transactionRow}>
                              <View style={styles.transactionInfo}>
                                <Text style={styles.transactionDesc}>{transaction.description}</Text>
                                <Text style={styles.transactionDate}>{transaction.date} • {transaction.user}</Text>
                              </View>
                              <Text style={styles.transactionAmount}>R$ {transaction.amount.toFixed(2).replace('.', ',')}</Text>
                            </View>
                          ))
                        )}
                      </View>
                      
                      <View style={styles.budgetActions}>
                        <TouchableOpacity 
                          style={styles.budgetActionButton}
                          onPress={() => openEditBudgetModal(budget)}
                        >
                          <Edit2 size={16} color="#FFF" />
                          <Text style={styles.budgetActionButtonText}>Editar Orçamento</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
                ))
              )}
              
              {/* Modal para adicionar nova categoria de orçamento */}
              <Modal
                visible={showNewBudgetModal}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Nova Categoria de Orçamento</Text>
                      <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => {
                          setShowNewBudgetModal(false);
                          setNewCategoryIconsVisible(false);
                        }}
                      >
                        <X size={24} color="#333" />
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Nome da Categoria</Text>
                      <TextInput
                        style={styles.textInput}
                        value={newCategory}
                        onChangeText={setNewCategory}
                        placeholder="Ex: Alimentação, Transporte..."
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Valor do Orçamento</Text>
                      <View style={styles.amountInputContainer}>
                        <Text style={styles.currencySymbol}>R$</Text>
                        <TextInput
                          style={styles.amountInput}
                          value={parseFloat(newAllocated) > 0 ? parseFloat(newAllocated).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).replace('R$', '').trim() : ''}
                          onChangeText={(text) => {
                            console.log('Valor digitado:', text);
                            // Remove tudo que não é número
                            const numericValue = text.replace(/[^0-9]/g, '');
                            // Formata como moeda brasileira
                            if (numericValue) {
                              const formattedValue = (parseInt(numericValue) / 100);
                              setNewAllocated(formattedValue.toString());
                            } else {
                              setNewAllocated('');
                            }
                          }}
                          placeholder="0,00"
                          keyboardType="numeric"
                          placeholderTextColor="#999"
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Ícone da Categoria</Text>
                      <TouchableOpacity 
                        style={styles.iconSelectorContainer}
                        onPress={toggleNewCategoryIcons}
                      >
                        <View style={styles.emojiSelectorButton}>
                          <Text style={styles.emojiSelectorText}>
                            {newCategoryIcon}
                          </Text>
                        </View>
                        <Text style={styles.iconSelectorText}>
                          Toque para escolher um ícone
                        </Text>
                      </TouchableOpacity>
                      
                      {newCategoryIconsVisible && (
                        <View style={styles.emojiDropdown}>
                          <View style={styles.emojiGrid}>
                            {['📊', '🍽️', '🏠', '🚗', '🏥', '🎭', '💰', '🛒', '✈️', '📱', '📚', '🎁', '👕', '⚡'].map((emoji, index) => (
                              <TouchableOpacity 
                                key={index}
                                style={[
                                  styles.emojiGridItem,
                                  newCategoryIcon === emoji && styles.emojiGridItemSelected
                                ]}
                                onPress={() => selectNewCategoryIcon(emoji)}
                              >
                                <Text style={styles.emojiGridText}>{emoji}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity 
                      style={styles.submitButton}
                      onPress={handleAddBudget}
                    >
                      <Text style={styles.submitButtonText}>Adicionar Orçamento</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
              
              {/* Modal para editar orçamento */}
              <Modal
                visible={showEditBudgetModal}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Editar Orçamento</Text>
                      <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => setShowEditBudgetModal(false)}
                      >
                        <X size={24} color="#333" />
                      </TouchableOpacity>
                    </View>
                    
                    {currentBudget && (
                      <>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Nome da Categoria</Text>
                          <TextInput
                            style={styles.textInput}
                            value={currentBudget.category}
                            onChangeText={(text) => setCurrentBudget({...currentBudget, category: text})}
                          />
                        </View>
                        
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Valor do Orçamento (R$)</Text>
                          <TextInput
                            style={styles.textInput}
                            value={currentBudget.allocated.toString()}
                            onChangeText={(text) => setCurrentBudget({
                              ...currentBudget, 
                              allocated: parseFloat(text) || 0,
                              percentage: currentBudget.spent / (parseFloat(text) || 1) * 100
                            })}
                            keyboardType="decimal-pad"
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Ícone da Categoria</Text>
                          <TouchableOpacity 
                            style={styles.iconSelectorContainer}
                            onPress={toggleNewCategoryIcons}
                          >
                            <View style={styles.emojiSelectorButton}>
                              <Text style={styles.emojiSelectorText}>
                                {currentBudget.icon}
                              </Text>
                            </View>
                            <Text style={styles.iconSelectorText}>
                              Toque para escolher um ícone
                            </Text>
                          </TouchableOpacity>
                          
                          {newCategoryIconsVisible && (
                            <View style={styles.emojiDropdown}>
                              <View style={styles.emojiGrid}>
                                {['📊', '🍽️', '🏠', '🚗', '🏥', '🎭', '💰', '🛒', '✈️', '📱', '📚', '🎁', '👕', '⚡'].map((emoji, index) => (
                                  <TouchableOpacity 
                                    key={index}
                                    style={[
                                      styles.emojiGridItem,
                                      currentBudget.icon === emoji && styles.emojiGridItemSelected
                                    ]}
                                    onPress={() => {
                                      setCurrentBudget({...currentBudget, icon: emoji});
                                      setNewCategoryIconsVisible(false);
                                    }}
                                  >
                                    <Text style={styles.emojiGridText}>{emoji}</Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </View>
                          )}
                        </View>

                        <TouchableOpacity 
                          style={styles.submitButton}
                          onPress={() => {
                            updateBudgetCategory(
                              currentBudget.id,
                              currentBudget.category,
                              currentBudget.allocated,
                              currentBudget.icon
                            );
                            setShowEditBudgetModal(false);
                            setCurrentBudget(null);
                          }}
                        >
                          <Text style={styles.submitButtonText}>Salvar Alterações</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </Modal>
            </View>
          ) : (
            // Conteúdo da aba Metas Financeiras
            <View style={styles.goalsContent}>
              <View style={styles.donutChartContainer}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>
                    {Platform.OS === 'android' ? 'Progresso\ndas Metas' : 'Progresso das Metas'}
                  </Text>
                  <View style={styles.chartTotalValue}>
                    <Text style={styles.chartTotalLabel}>Total acumulado</Text>
                    <Text style={styles.chartTotalAmount}>
                      R$ {goalsData.reduce((sum, goal) => sum + goal.current, 0).toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.chartMainContent}>
                  {/* Aqui iria o componente de gráfico circular */}
                  <View style={styles.donutChart}>
                    {/* Simulação visual do gráfico */}
                    <View style={styles.donutChartInner}>
                      <Text style={styles.goalCompletionText}>
                        {goalsData.length > 0 
                          ? goalsData
                              .filter(goal => goal && typeof goal.current === 'number')
                              .reduce((sum, goal) => sum + goal.current, 0)
                              .toFixed(0)
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                          : '0'
                        }
                      </Text>
                      <Text style={styles.goalCompletionLabel}>Total Poupado</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.metricsContainer}>
                  <View style={styles.metricsSeparator} />
                  
                  <View style={styles.goalsMetricsSummary}>
                    <View style={styles.goalMetricItem}>
                      <Text style={styles.goalMetricValue}>{goalsData.length}</Text>
                      <Text style={styles.goalMetricLabel}>Total Metas</Text>
                    </View>
                    <View style={styles.goalMetricItem}>
                      <Text style={styles.goalMetricValue}>
                        R$ {goalsData.length > 0 
                          ? goalsData
                              .filter(goal => goal && typeof goal.target === 'number' && typeof goal.current === 'number')
                              .reduce((sum, goal) => sum + (goal.target - goal.current), 0)
                              .toFixed(2)
                              .replace('.', ',')
                          : '0,00'
                        }
                      </Text>
                      <Text style={styles.goalMetricLabel}>Valor Restante</Text>
                    </View>
                    <View style={styles.goalMetricItem}>
                      <Text style={styles.goalMetricValue}>
                        {goalsData.length > 0 && goalsData.filter(goal => goal && goal.deadline).length > 0
                          ? goalsData
                              .filter(goal => goal && goal.deadline)
                              .sort((a, b) => a.deadline.localeCompare(b.deadline))[0].deadline
                          : 'Nenhuma meta'
                        }
                      </Text>
                      <Text style={styles.goalMetricLabel}>Próximo Prazo</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Metas Financeiras</Text>
                <TouchableOpacity 
                  style={styles.addCategoryButton}
                  onPress={openNewGoalModal}
                >
                  <Plus size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {goalsData.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Nenhuma meta financeira criada ainda.</Text>
                  <Text style={styles.emptySubtext}>Toque no botão + para criar sua primeira meta!</Text>
                </View>
              ) : (
                goalsData.filter(goal => goal && goal.id).map(goal => (
                <View key={goal.id} style={styles.goalCard}>
                  <TouchableOpacity 
                    style={styles.goalHeader}
                    onPress={() => toggleGoalExpanded(goal.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.goalIcon, { backgroundColor: goal.color }]}>
                      <Text style={styles.goalIconText}>{goal.icon}</Text>
                    </View>

                    <View style={styles.goalInfo}>
                      <View style={styles.goalTitleRow}>
                        <Text style={styles.goalTitle}>{goal.title}</Text>
                        <Text style={styles.goalDeadline}>{goal.deadline}</Text>
                      </View>

                      <View style={styles.goalBarContainer}>
                        <View 
                          style={[
                            styles.goalBar, 
                            { 
                              width: `${goal.percentage}%`,
                              backgroundColor: goal.color
                            }
                          ]} 
                        />
                      </View>
                      
                      <View style={styles.goalDetails}>
                        <Text style={styles.goalAmountText}>
                          R$ {(goal.current || 0).toFixed(2).replace('.', ',')} <Text style={styles.goalTargetText}>/ R$ {(goal.target || 0).toFixed(2).replace('.', ',')}</Text>
                        </Text>
                        <Text style={styles.goalPercentageText}>
                          {goal.percentage || 0}%
                        </Text>
                      </View>
                    </View>

                    <View style={styles.goalActions}>
                      <TouchableOpacity 
                        style={styles.goalActionButton}
                        onPress={() => {
                          console.log('Botão edit pressionado para meta:', goal.id);
                          openEditGoalModal(goal);
                        }}
                        activeOpacity={0.7}
                      >
                        <Edit2 size={18} color="#666" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.goalActionButton, styles.deleteButton]}
                        onPress={() => {
                          console.log('Botão delete pressionado para meta:', goal.id);
                          handleDeleteGoal(goal.id);
                        }}
                        activeOpacity={0.7}
                      >
                        <X size={18} color="#FF4757" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                  
                  {expandedGoal === goal.id && (
                    <View style={styles.goalExpanded}>
                      <View style={styles.goalTransactionsSection}>
                        <Text style={styles.expandedSectionTitle}>Histórico de Transações</Text>
                        
                        {(goal.transactions || []).length === 0 ? (
                          <View style={styles.emptyTransactions}>
                            <Text style={styles.emptyTransactionsText}>Nenhuma transação vinculada a esta meta ainda.</Text>
                          </View>
                        ) : (
                          (goal.transactions || []).map((transaction, index) => (
                            <View key={transaction.id || index} style={styles.transactionRow}>
                              <View style={styles.transactionInfo}>
                                <Text style={styles.transactionDesc}>{transaction.description}</Text>
                                <Text style={styles.transactionDate}>{transaction.date}</Text>
                              </View>
                              <Text style={[
                                styles.transactionAmount,
                                { color: '#00C851' }
                              ]}>
                                +R$ {Math.abs(transaction.amount || 0).toFixed(2).replace('.', ',')}
                              </Text>
                            </View>
                          ))
                        )}
                      </View>
                    </View>
                  )}
                </View>
                ))
              )}
              
              {/* Modal para adicionar nova meta */}
              <Modal
                visible={showNewGoalModal}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Nova Meta Financeira</Text>
                      <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => {
                          setShowNewGoalModal(false);
                          setNewGoalIconsVisible(false);
                        }}
                      >
                        <X size={24} color="#333" />
                      </TouchableOpacity>
                    </View>
                    
                    <ScrollView 
                      style={styles.modalScrollView}
                      contentContainerStyle={styles.modalScrollContent}
                      showsVerticalScrollIndicator={false}
                      keyboardShouldPersistTaps="handled"
                    >
                      <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Título da Meta</Text>
                      <TextInput
                        style={styles.textInput}
                        value={newGoalTitle}
                        onChangeText={setNewGoalTitle}
                        placeholder="Ex: Viagem, Carro novo..."
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Valor da Meta</Text>
                      <View style={styles.amountInputContainer}>
                        <Text style={styles.currencySymbol}>R$</Text>
                        <TextInput
                          style={styles.amountInput}
                          value={parseFloat(newGoalAmount) > 0 ? parseFloat(newGoalAmount).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).replace('R$', '').trim() : ''}
                          onChangeText={(text) => {
                            // Remove tudo que não é número
                            const numericValue = text.replace(/[^0-9]/g, '');
                            // Formata como moeda brasileira
                            if (numericValue) {
                              const formattedValue = (parseInt(numericValue) / 100);
                              setNewGoalAmount(formattedValue.toString());
                            } else {
                              setNewGoalAmount('');
                            }
                          }}
                          placeholder="0,00"
                          keyboardType="numeric"
                          placeholderTextColor="#999"
                        />
                      </View>
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Prazo</Text>
                      <TouchableOpacity style={styles.goalDateInput} onPress={toggleDeadlineDropdown}>
                        <Calendar size={20} color="#666" style={styles.inputIcon} />
                        <Text style={styles.goalDateText}>{getDeadlineTypeLabel(deadlineType)}</Text>
                        <ChevronDown size={20} color="#666" />
                      </TouchableOpacity>
                      
                      {deadlineDropdownVisible && (
                        <View style={styles.deadlineDropdown}>
                          {['semestral', 'anual', 'cinco_anos', 'personalizado'].map((type) => (
                            <TouchableOpacity
                              key={type}
                              style={[
                                styles.deadlineOption,
                                deadlineType === type && styles.deadlineOptionSelected
                              ]}
                              onPress={() => selectDeadlineType(type)}
                            >
                              <Text style={[
                                styles.deadlineOptionText,
                                deadlineType === type && styles.deadlineOptionTextSelected
                              ]}>
                                {getDeadlineTypeLabel(type)}
                              </Text>
                              {deadlineType === type && (
                                <Check size={16} color={theme.primary} />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                      
                      {customDeadlineVisible && (
                        <View style={styles.customDeadlineContainer}>
                          <Text style={styles.customDeadlineLabel}>Data personalizada:</Text>
                          <View style={styles.goalDateInput}>
                            <Calendar size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                              style={styles.goalDateTextInput}
                              value={goalSelectedDate}
                              onChangeText={(text) => {
                                // Aplicar máscara dd/mm/yyyy
                                let masked = text.replace(/\D/g, ''); // Remove caracteres não numéricos
                                if (masked.length >= 3) {
                                  masked = masked.replace(/(\d{2})(\d)/, '$1/$2');
                                }
                                if (masked.length >= 6) {
                                  masked = masked.replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
                                }
                                if (masked.length > 10) {
                                  masked = masked.substring(0, 10);
                                }
                                setGoalSelectedDate(masked);
                              }}
                              placeholder="dd/mm/yyyy"
                              keyboardType="numeric"
                              maxLength={10}
                            />
                          </View>
                        </View>
                      )}
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Ícone da Meta</Text>
                      <TouchableOpacity 
                        style={styles.iconSelectorContainer}
                        onPress={toggleNewGoalIcons}
                      >
                        <View style={styles.emojiSelectorButton}>
                          <Text style={styles.emojiSelectorText}>
                            {newGoalIcon}
                          </Text>
                        </View>
                        <Text style={styles.iconSelectorText}>
                          Toque para escolher um ícone
                        </Text>
                      </TouchableOpacity>
                      
                      {newGoalIconsVisible && (
                        <View style={styles.emojiDropdown}>
                          <View style={styles.emojiGrid}>
                            {['🎯', '💰', '🏠', '🚗', '✈️', '🎓', '💍', '📱', '🏖️', '🎮', '📚', '🎸', '🏋️', '🎨'].map((emoji, index) => (
                              <TouchableOpacity 
                                key={index}
                                style={[
                                  styles.emojiGridItem,
                                  newGoalIcon === emoji && styles.emojiGridItemSelected
                                ]}
                                onPress={() => selectNewGoalIcon(emoji)}
                              >
                                <Text style={styles.emojiGridText}>{emoji}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                    </ScrollView>

                    <TouchableOpacity 
                      style={styles.submitButton}
                      onPress={handleAddGoal}
                    >
                      <Text style={styles.submitButtonText}>Criar Meta</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
              
              {/* Modal para editar meta */}
              <Modal
                visible={showEditGoalModal}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Editar Meta</Text>
                      <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => setShowEditGoalModal(false)}
                      >
                        <X size={24} color="#333" />
                      </TouchableOpacity>
                    </View>
                    
                    {currentGoal && (
                      <>
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Título da Meta</Text>
                          <TextInput
                            style={styles.textInput}
                            value={currentGoal.title}
                            onChangeText={(text) => setCurrentGoal({...currentGoal, title: text})}
                            placeholder="Ex: Viagem, Carro novo..."
                          />
                        </View>
                        
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Valor da Meta</Text>
                          <View style={styles.amountInputContainer}>
                            <Text style={styles.currencySymbol}>R$</Text>
                            <TextInput
                              style={styles.amountInput}
                              value={currentGoal.target > 0 ? currentGoal.target.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              }).replace('R$', '').trim() : ''}
                              onChangeText={(text) => {
                                // Remove tudo que não é número
                                const numericValue = text.replace(/[^0-9]/g, '');
                                // Formata como moeda brasileira
                                if (numericValue) {
                                  const formattedValue = (parseInt(numericValue) / 100);
                                  setCurrentGoal({
                                    ...currentGoal, 
                                    target: formattedValue,
                                    percentage: (currentGoal.current / formattedValue) * 100
                                  });
                                } else {
                                  setCurrentGoal({...currentGoal, target: 0});
                                }
                              }}
                              placeholder="0,00"
                              keyboardType="numeric"
                              placeholderTextColor="#999"
                            />
                          </View>
                        </View>
                        
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Prazo</Text>
                          <TextInput
                            style={styles.textInput}
                            value={currentGoal.deadline}
                            onChangeText={(text) => setCurrentGoal({...currentGoal, deadline: text})}
                            placeholder="Ex: Dez 2024"
                          />
                        </View>

                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Ícone da Meta</Text>
                          <TouchableOpacity 
                            style={styles.iconSelectorContainer}
                            onPress={() => {
                              setCurrentGoal({...currentGoal, showIconSelector: !currentGoal.showIconSelector});
                            }}
                          >
                            <View style={styles.emojiSelectorButton}>
                              <Text style={styles.emojiSelectorText}>
                                {currentGoal.icon}
                              </Text>
                            </View>
                            <Text style={styles.iconSelectorText}>
                              Toque para escolher um ícone
                            </Text>
                          </TouchableOpacity>
                          
                          {currentGoal.showIconSelector && (
                            <View style={styles.emojiDropdown}>
                              <View style={styles.emojiGrid}>
                                {['🎯', '💰', '🏠', '🚗', '✈️', '🎓', '💍', '📱', '🏖️', '🎮', '📚', '🎸', '🏋️', '🎨'].map((emoji, index) => (
                                  <TouchableOpacity 
                                    key={index}
                                    style={[
                                      styles.emojiGridItem,
                                      currentGoal.icon === emoji && styles.emojiGridItemSelected
                                    ]}
                                    onPress={() => setCurrentGoal({
                                      ...currentGoal, 
                                      icon: emoji,
                                      showIconSelector: false
                                    })}
                                  >
                                    <Text style={styles.emojiGridText}>{emoji}</Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </View>
                          )}
                        </View>

                        <TouchableOpacity 
                          style={styles.submitButton}
                          onPress={async () => {
                            if (!currentGoal.title.trim()) {
                              Alert.alert('Erro', 'Por favor, insira um título para a meta');
                              return;
                            }
                            
                            if (!currentGoal.target || currentGoal.target <= 0) {
                              Alert.alert('Erro', 'Por favor, insira um valor válido para a meta');
                              return;
                            }

                            await updateFinancialGoal(
                              currentGoal.id, 
                              currentGoal.title, 
                              currentGoal.target, 
                              currentGoal.deadline,
                              currentGoal.icon
                            );
                            
                            setShowEditGoalModal(false);
                            setCurrentGoal(null);
                          }}
                        >
                          <Text style={styles.submitButtonText}>Salvar Alterações</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </Modal>

            </View>
          )}
        </ScrollView>

        {/* Modal para mostrar todas as transações com orçamento */}
        <Modal
          visible={allTransactionsModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Todas as Transações com Orçamento</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setAllTransactionsModalVisible(false)}
                >
                  <X size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.transactionsModalList}>
                {allTransactions.length === 0 ? (
                  <View style={styles.emptyTransactions}>
                    <Text style={styles.emptyTransactionsText}>Nenhuma transação com orçamento encontrada.</Text>
                  </View>
                ) : (
                  allTransactions.map((transaction, index) => (
                    <View key={transaction.id} style={styles.transactionItem}>
                      <View style={[styles.transactionIcon, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
                        <Text style={{ fontSize: 20 }}>{transaction.budgetIcon}</Text>
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionTitle}>{transaction.description}</Text>
                        <Text style={styles.transactionTime}>{transaction.date} • {transaction.time} • {transaction.user}</Text>
                        <Text style={styles.transactionCategory}>{transaction.budgetCategory}</Text>
                      </View>
                      <Text style={styles.transactionAmount}>
                        -R$ {transaction.amount.toFixed(2).replace('.', ',')}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Menu Modal */}
        <MenuModal
          visible={menuModalVisible}
          onClose={() => setMenuModalVisible(false)}
          theme={theme}
        />

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
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
            onPress={() => {
              if (activeTab === 'budget') {
                openNewBudgetModal();
              } else {
                openNewGoalModal();
              }
            }}
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
            onPress={() => router.push('/(app)/notifications')}
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
            onPress={() => router.push('/(app)/cards')}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Rect width="20" height="14" x="2" y="5" rx="2" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <Line x1="2" y1="10" x2="22" y2="10" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.navText}>Cartões</Text>
          </TouchableOpacity>
        </View>

        {/* Modal de Meta Atingida */}
        {goalReachedModal.visible && (
          <GoalReachedModal
            visible={goalReachedModal.visible}
            goalTitle={goalReachedModal.goalTitle}
            goalAmount={goalReachedModal.goalAmount}
            onClose={closeGoalReachedModal}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}