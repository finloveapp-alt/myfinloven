import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Platform, Pressable, SafeAreaView, Alert, Modal, TextInput, KeyboardAvoidingView, ActivityIndicator, useWindowDimensions, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { BarChart, ArrowLeft, ArrowRight, LogOut, Calendar, DollarSign, Check, Clock, ArrowDownCircle, ArrowUpCircle, ChevronRight, Info, ChevronDown, BookUser, Users, X, FileText, Settings, CreditCard, BarChart3, Bell, Menu, PlusCircle, Wallet, ExternalLink, Target, Receipt, Camera, Upload, ImageIcon, Home } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import themes from '@/constants/themes';
import { fontFallbacks } from '@/utils/styles';
import { getBudgetValueById, FeasibilityResults } from '@/utils/budgetCalculator';

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

// Interface para o perfil de usuário
interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender: string;
  avatar_url?: string;
  profile_picture_url?: string;
  account_type?: string;
  is_avatar?: boolean; // Nova propriedade para indicar se é um avatar
}

export default function Dashboard() {
  const router = useRouter();
  const [theme, setTheme] = useState(getInitialTheme());
  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [partnerUser, setPartnerUser] = useState<UserProfile | null>(null);
  const [partnerUsers, setPartnerUsers] = useState<UserProfile[]>([]); // Novo estado para armazenar múltiplos parceiros
  const [profilePictureModalVisible, setProfilePictureModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [typeSelectionModalVisible, setTypeSelectionModalVisible] = useState(false); // Novo modal de seleção
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState(''); // Novo estado para nome
  const [avatarPhoto, setAvatarPhoto] = useState<string | null>(null); // Estado para foto do avatar
  const [inviting, setInviting] = useState(false);
  const [isUserInviter, setIsUserInviter] = useState(false);
  const [isInviteAvatar, setIsInviteAvatar] = useState(false); // Novo estado para marcar convite como avatar
  const [inviteSuccessModalVisible, setInviteSuccessModalVisible] = useState(false); // Modal de sucesso do convite
  const [invitedEmail, setInvitedEmail] = useState(''); // Email do usuário convidado para exibir no modal
  
  // Estados para dados financeiros reais
  const [financialData, setFinancialData] = useState({
    receitas: { total: 0, change: 0 },
    despesas: { total: 0, change: 0 },
    debitos: { total: 0, change: 0 },
    creditos: { total: 0, change: 0 }
  });
  const [loadingFinancialData, setLoadingFinancialData] = useState(true);
  const [summaryData, setSummaryData] = useState({
    saldoTotal: 0,
    receitasMes: 0,
    despesasMes: 0
  });
  const [loadingSummaryData, setLoadingSummaryData] = useState(true);
  const [expensesByPerson, setExpensesByPerson] = useState({
    currentUser: { name: '', amount: 0, percentage: 0 },
    partner: { name: '', amount: 0, percentage: 0 },
    shared: { amount: 0, percentage: 0 }
  });
  const [loadingExpensesByPerson, setLoadingExpensesByPerson] = useState(true);
  const [billsAndCards, setBillsAndCards] = useState<any[]>([]);
  const [loadingBillsAndCards, setLoadingBillsAndCards] = useState(true);
  const [accountsReceivable, setAccountsReceivable] = useState<any[]>([]);
  const [loadingAccountsReceivable, setLoadingAccountsReceivable] = useState(false);
  const [financialGoals, setFinancialGoals] = useState<any[]>([]);
  const [loadingFinancialGoals, setLoadingFinancialGoals] = useState(false);
  const [initialBalance, setInitialBalance] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [predictedBalance, setPredictedBalance] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<{[key: string]: {income: boolean, expense: boolean, transfer: boolean}}>({});
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [calendarCurrentDate, setCalendarCurrentDate] = useState(new Date());
  
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
  
  useEffect(() => {
    // Buscar informações do usuário atual e seus parceiros
    fetchUserAndPartner();
    // Buscar dados financeiros reais
    fetchFinancialData();
    // Buscar dados do resumo
    fetchSummaryData();
    // Buscar últimas transações
    fetchRecentTransactions();
    // Buscar gastos por pessoa
    fetchExpensesByPerson();
    // Buscar contas a pagar e cartões
    fetchBillsAndCards();
    // Buscar contas a receber
    fetchAccountsReceivable();
    // Buscar metas financeiras
    fetchFinancialGoals();
    // Buscar saldo inicial
    fetchInitialBalance();
    // Buscar saldo atual
    fetchCurrentBalance();
    // Buscar saldo previsto
    fetchPredictedBalance();
    // Buscar dados do gráfico
    fetchChartData();
    // Buscar eventos do calendário
    fetchCalendarEvents();
  }, []);
  
  // Função para buscar o usuário atual e seus parceiros
  const fetchUserAndPartner = async () => {
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
            updateTheme('masculine');
          } else if (metaGenderLower === 'feminino' || metaGenderLower === 'mulher' || 
                     metaGenderLower === 'female' || metaGenderLower === 'f') {
            console.log('Aplicando tema feminino (rosa) com base nos metadados');
            updateTheme('feminine');
          } else {
            // Usar o tema global ou padrão se o gênero nos metadados não for reconhecido
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
      
      // Verificar se o usuário é um convidador (user1_id em algum registro de couples)
      const { data: userAsInviter, error: inviterError } = await supabase
        .from('couples')
        .select('id')
        .eq('user1_id', userId)
        .limit(1);
        
      if (inviterError) {
        console.error('Erro ao verificar se usuário é convidador:', inviterError);
      }
      
      const isInviter = userAsInviter && userAsInviter.length > 0;
      console.log('Usuário é convidador:', isInviter);
      setIsUserInviter(isInviter);
      
      if (userProfile) {
        // Certifique-se de que account_type seja sempre 'individual' quando não for 'couple'
        const accountType = userProfile.account_type === 'couple' ? 'couple' : 'individual';
        
        console.log('Perfil do usuário carregado:', {
          id: userProfile.id,
          account_type_raw: userProfile.account_type,
          account_type_processed: accountType,
          isInviter: isInviter
        });
        
        setCurrentUser({
          id: userProfile.id,
          name: userProfile.name || 'Usuário',
          email: userProfile.email || '',
          gender: userProfile.gender || '',
          account_type: accountType,
          profile_picture_url: userProfile.profile_picture_url || null,
          avatar_url: userProfile.profile_picture_url || (userProfile.gender?.toLowerCase() === 'homem' ? 
            'https://randomuser.me/api/portraits/men/36.jpg' : 
            'https://randomuser.me/api/portraits/women/44.jpg'),
          is_avatar: userProfile.is_avatar || false
        });
      }
      
      // Buscar todos os relacionamentos de casal ativos
      const { data: couplesData, error: couplesError } = await supabase
        .from('couples')
        .select('id, user1_id, user2_id, is_avatar, avatar_name, avatar_photo_url')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'active');
        
      if (couplesError) {
        console.error('Erro ao buscar relacionamentos de casal:', couplesError);
        return;
      }
      
      console.log(`Encontrados ${couplesData?.length || 0} casais ativos para o usuário`);
      
      // Verificar se encontrou casais ativos
      if (couplesData && couplesData.length > 0) {
        // Array para armazenar todos os parceiros
        const partnerProfiles: UserProfile[] = [];
        
        // Para cada casal, buscar o perfil do parceiro
        for (const coupleData of couplesData) {
          if (coupleData.is_avatar) {
            // Para avatars, usar os dados diretamente da tabela couples
            const avatarProfileData: UserProfile = {
              id: coupleData.id, // Usar o ID do casal como ID do avatar
              name: coupleData.avatar_name || 'Avatar',
              email: '',
              gender: '',
              profile_picture_url: coupleData.avatar_photo_url || null,
              avatar_url: coupleData.avatar_photo_url || 'https://randomuser.me/api/portraits/lego/1.jpg', // Imagem padrão para avatar
              is_avatar: true
            };
            
            partnerProfiles.push(avatarProfileData);
          } else {
            // Para usuários reais, buscar o perfil normalmente
            const partnerId = coupleData.user1_id === userId ? coupleData.user2_id : coupleData.user1_id;
            
            if (partnerId) {
              // Buscar o perfil do parceiro
              const { data: partnerProfile, error: partnerError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', partnerId)
                .single();
                
              if (partnerError) {
                console.error(`Erro ao buscar perfil do parceiro (${partnerId}):`, partnerError);
                continue;
              }
              
              if (partnerProfile) {
                const partnerProfileData: UserProfile = {
                  id: partnerProfile.id,
                  name: partnerProfile.name || 'Parceiro',
                  email: partnerProfile.email || '',
                  gender: partnerProfile.gender || '',
                  profile_picture_url: partnerProfile.profile_picture_url || null,
                  avatar_url: partnerProfile.profile_picture_url || (partnerProfile.gender?.toLowerCase() === 'homem' ? 
                    'https://randomuser.me/api/portraits/men/42.jpg' : 
                    'https://randomuser.me/api/portraits/women/33.jpg'),
                  is_avatar: false
                };
                
                partnerProfiles.push(partnerProfileData);
                
                // Se não havia parceiro principal definido ainda, define o primeiro como principal
                if (!partnerUser) {
                  setPartnerUser(partnerProfileData);
                }
              }
            }
          }
        }
        
        // Atualizar o estado com todos os parceiros encontrados
        setPartnerUsers(partnerProfiles);
        
        // Se não conseguimos definir um parceiro principal e temos ao menos um parceiro, use o primeiro
        if (!partnerUser && partnerProfiles.length > 0) {
          setPartnerUser(partnerProfiles[0]);
        }
      } else {
        console.log('Nenhum casal ativo encontrado para este usuário');
        setPartnerUsers([]);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  // Função para buscar dados financeiros reais do banco de dados
  const fetchFinancialData = async () => {
    try {
      setLoadingFinancialData(true);
      
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
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      
      // Buscar receitas do mês atual
      const { data: currentIncomes, error: incomesError } = await supabase
        .from('incomes')
        .select('amount')
        .eq('owner_id', userId)
        .gte('receipt_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('receipt_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      // Buscar receitas do mês anterior
      const { data: previousIncomes, error: prevIncomesError } = await supabase
        .from('incomes')
        .select('amount')
        .eq('owner_id', userId)
        .gte('receipt_date', `${previousYear}-${previousMonth.toString().padStart(2, '0')}-01`)
        .lt('receipt_date', `${previousYear}-${currentMonth.toString().padStart(2, '0')}-01`);
      
      // Buscar despesas do mês atual
      const { data: currentExpenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('owner_id', userId)
        .gte('due_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('due_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      // Buscar despesas do mês anterior
      const { data: previousExpenses, error: prevExpensesError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('owner_id', userId)
        .gte('due_date', `${previousYear}-${previousMonth.toString().padStart(2, '0')}-01`)
        .lt('due_date', `${previousYear}-${currentMonth.toString().padStart(2, '0')}-01`);
      
      // Buscar transações de débito do mês atual
      const { data: currentDebits, error: debitsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('owner_id', userId)
        .eq('payment_method', 'Débito')
        .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      // Buscar transações de débito do mês anterior
      const { data: previousDebits, error: prevDebitsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('owner_id', userId)
        .eq('payment_method', 'Débito')
        .gte('transaction_date', `${previousYear}-${previousMonth.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${previousYear}-${currentMonth.toString().padStart(2, '0')}-01`);
      
      // Buscar transações de crédito do mês atual
      const { data: currentCredits, error: creditsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('owner_id', userId)
        .eq('payment_method', 'Crédito')
        .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      // Buscar transações de crédito do mês anterior
      const { data: previousCredits, error: prevCreditsError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('owner_id', userId)
        .eq('payment_method', 'Crédito')
        .gte('transaction_date', `${previousYear}-${previousMonth.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${previousYear}-${currentMonth.toString().padStart(2, '0')}-01`);
      
      // Calcular totais
      const receitasTotal = currentIncomes?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
      const receitasPrevious = previousIncomes?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
      const receitasChange = receitasPrevious > 0 ? ((receitasTotal - receitasPrevious) / receitasPrevious) * 100 : 0;
      
      const despesasTotal = currentExpenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
      const despesasPrevious = previousExpenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
      const despesasChange = despesasPrevious > 0 ? ((despesasTotal - despesasPrevious) / despesasPrevious) * 100 : 0;
      
      const debitosTotal = Math.abs(currentDebits?.reduce((sum, debit) => sum + Number(debit.amount), 0) || 0);
      const debitosPrevious = Math.abs(previousDebits?.reduce((sum, debit) => sum + Number(debit.amount), 0) || 0);
      const debitosChange = debitosPrevious > 0 ? ((debitosTotal - debitosPrevious) / debitosPrevious) * 100 : 0;
      
      const creditosTotal = Math.abs(currentCredits?.reduce((sum, credit) => sum + Number(credit.amount), 0) || 0);
      const creditosPrevious = Math.abs(previousCredits?.reduce((sum, credit) => sum + Number(credit.amount), 0) || 0);
      const creditosChange = creditosPrevious > 0 ? ((creditosTotal - creditosPrevious) / creditosPrevious) * 100 : 0;
      
      // Atualizar estado com dados reais
      setFinancialData({
        receitas: { total: receitasTotal, change: receitasChange },
        despesas: { total: despesasTotal, change: despesasChange },
        debitos: { total: debitosTotal, change: debitosChange },
        creditos: { total: creditosTotal, change: creditosChange }
      });
      
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    } finally {
      setLoadingFinancialData(false);
    }
  };

  // Função para buscar dados do resumo do mês
  const fetchSummaryData = async () => {
    try {
      setLoadingSummaryData(true);
      
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
      
      // Buscar saldo total das contas
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('owner_id', userId);
      
      // Buscar receitas do mês atual
      const { data: monthlyIncomes, error: monthlyIncomesError } = await supabase
        .from('incomes')
        .select('amount')
        .eq('owner_id', userId)
        .gte('receipt_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('receipt_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      // Buscar despesas do mês atual
      const { data: monthlyExpenses, error: monthlyExpensesError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('owner_id', userId)
        .gte('due_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('due_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);
      
      // Calcular totais
      const saldoTotal = accounts?.reduce((sum, account) => sum + Number(account.balance), 0) || 0;
      const receitasMes = monthlyIncomes?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
      const despesasMes = monthlyExpenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
      
      // Atualizar estado
      setSummaryData({
        saldoTotal,
        receitasMes,
        despesasMes
      });
      
    } catch (error) {
      console.error('Erro ao buscar dados do resumo:', error);
    } finally {
      setLoadingSummaryData(false);
    }
  };

  // Função para buscar últimas transações
  const fetchRecentTransactions = async () => {
    try {
      setLoadingTransactions(true);
      
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Erro ao obter sessão:', sessionError);
        return;
      }
      
      const userId = session.user.id;
      
      // Buscar as 10 transações mais recentes do usuário
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          id,
          description,
          amount,
          transaction_date,
          transaction_type,
          payment_method,
          category,
          icon,
          accounts!transactions_account_id_fkey(name)
        `)
        .eq('owner_id', userId)
        .order('transaction_date', { ascending: false })
        .limit(10);
      
      if (transactionsError) {
        console.error('Erro ao buscar transações:', transactionsError);
        return;
      }
      
      // Formatar transações para o formato esperado pelo componente
      const formattedTransactions = transactions?.map(transaction => {
        // Definir ícone baseado na categoria ou usar o ícone salvo
        let icon = transaction.icon || '💰';
        let backgroundColor = '#E3F5FF';
        
        // Definir ícone e cor baseado na categoria se não houver ícone personalizado
        if (!transaction.icon) {
          switch (transaction.category?.toLowerCase()) {
            case 'alimentação':
            case 'mercado':
              icon = '🥕';
              backgroundColor = '#FFEEE2';
              break;
            case 'transporte':
            case 'combustível':
              icon = '⛽';
              backgroundColor = '#E3F5FF';
              break;
            case 'restaurante':
            case 'lazer':
              icon = '🍽️';
              backgroundColor = '#FFE2E6';
              break;
            case 'saúde':
              icon = '🏥';
              backgroundColor = '#E8F5E8';
              break;
            case 'educação':
              icon = '📚';
              backgroundColor = '#FFF2E8';
              break;
            default:
              icon = '💰';
              backgroundColor = '#E3F5FF';
          }
        }
        
        // Formatar subtítulo baseado no tipo de transação
        let subtitle = '';
        if (transaction.accounts?.name) {
          subtitle = `${transaction.accounts.name}`;
        }
        if (transaction.payment_method) {
          subtitle += subtitle ? ` - ${transaction.payment_method}` : transaction.payment_method;
        }
        
        return {
          id: transaction.id,
          icon,
          backgroundColor,
          title: transaction.description,
          subtitle: subtitle || 'Transação',
          amount: transaction.transaction_type === 'income' 
            ? `+${formatCurrency(Math.abs(Number(transaction.amount)))}` 
            : `-${formatCurrency(Math.abs(Number(transaction.amount)))}`,
          paymentMethod: transaction.payment_method || 'N/A',
          date: transaction.transaction_date,
          type: transaction.transaction_type
        };
      }) || [];
      
      setRecentTransactions(formattedTransactions);
      
      // Resetar índice se necessário
      if (formattedTransactions.length > 0 && currentTransactionIndex >= formattedTransactions.length) {
        setCurrentTransactionIndex(0);
      }
      
    } catch (error) {
      console.error('Erro ao buscar transações recentes:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Função para buscar gastos por pessoa
  const fetchExpensesByPerson = async () => {
    try {
      setLoadingExpensesByPerson(true);
      
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Erro ao obter sessão:', sessionError);
        return;
      }
      
      const userId = session.user.id;
      
      // Buscar perfil do usuário atual para obter o nome
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', userId)
        .single();
      
      // Buscar parceiro ativo
      const { data: coupleData, error: coupleError } = await supabase
        .from('couples')
        .select('user1_id, user2_id, is_avatar, avatar_name')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'active')
        .single();
      
      let partnerName = '';
      let partnerId = null;
      
      if (coupleData && !coupleError) {
        if (coupleData.is_avatar) {
          partnerName = coupleData.avatar_name || 'Avatar';
        } else {
          partnerId = coupleData.user1_id === userId ? coupleData.user2_id : coupleData.user1_id;
          
          if (partnerId) {
            const { data: partnerProfile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', partnerId)
              .single();
            
            partnerName = partnerProfile?.name || 'Parceiro';
          }
        }
      }
      
      // Buscar todas as transações de despesa do usuário atual
      const { data: userTransactions, error: userTransError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('owner_id', userId)
        .eq('transaction_type', 'expense');
      
      // Buscar todas as despesas do usuário atual
      const { data: userExpenses, error: userExpError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('owner_id', userId);
      
      // Calcular total de gastos do usuário atual
      const userTransactionTotal = userTransactions?.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0;
      const userExpenseTotal = userExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const currentUserTotal = userTransactionTotal + userExpenseTotal;
      
      let partnerTotal = 0;
      let sharedTotal = 0;
      
      if (partnerId) {
        // Buscar transações do parceiro
        const { data: partnerTransactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('owner_id', partnerId)
          .eq('transaction_type', 'expense');
        
        // Buscar despesas do parceiro
        const { data: partnerExpenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('owner_id', partnerId);
        
        const partnerTransactionTotal = partnerTransactions?.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0;
        const partnerExpenseTotal = partnerExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
        partnerTotal = partnerTransactionTotal + partnerExpenseTotal;
        
        // Buscar gastos compartilhados (onde partner_id está preenchido)
        const { data: sharedTransactions } = await supabase
          .from('transactions')
          .select('amount')
          .not('partner_id', 'is', null)
          .or(`owner_id.eq.${userId},partner_id.eq.${userId}`)
          .eq('transaction_type', 'expense');
        
        const { data: sharedExpenses } = await supabase
          .from('expenses')
          .select('amount')
          .not('partner_id', 'is', null)
          .or(`owner_id.eq.${userId},partner_id.eq.${userId}`);
        
        const sharedTransactionTotal = sharedTransactions?.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0;
        const sharedExpenseTotal = sharedExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
        sharedTotal = sharedTransactionTotal + sharedExpenseTotal;
      }
      
      // Calcular total geral
      const totalExpenses = currentUserTotal + partnerTotal + sharedTotal;
      
      // Calcular percentuais
      const currentUserPercentage = totalExpenses > 0 ? (currentUserTotal / totalExpenses) * 100 : 0;
      const partnerPercentage = totalExpenses > 0 ? (partnerTotal / totalExpenses) * 100 : 0;
      const sharedPercentage = totalExpenses > 0 ? (sharedTotal / totalExpenses) * 100 : 0;
      
      // Atualizar estado
      setExpensesByPerson({
        currentUser: {
          name: userProfile?.name || 'Você',
          amount: currentUserTotal,
          percentage: currentUserPercentage
        },
        partner: {
          name: partnerName || 'Parceiro',
          amount: partnerTotal,
          percentage: partnerPercentage
        },
        shared: {
          amount: sharedTotal,
          percentage: sharedPercentage
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar gastos por pessoa:', error);
    } finally {
      setLoadingExpensesByPerson(false);
    }
  };

  // Função para buscar contas a pagar e cartões
  const fetchBillsAndCards = async () => {
    try {
      setLoadingBillsAndCards(true);
      
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Erro ao obter sessão:', sessionError);
        return;
      }
      
      const userId = session.user.id;
      const currentDate = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(currentDate.getDate() - 30);
      
      // Buscar despesas não pagas (contas a pagar) - incluindo vencidas
      const { data: unpaidExpenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_paid', false)
        .gte('due_date', thirtyDaysAgo.toISOString()) // Incluir contas vencidas dos últimos 30 dias
        .order('due_date', { ascending: true })
        .limit(8); // Aumentar limite para mais contas
      
      // Buscar cartões de crédito com saldo pendente (negativos)
      const { data: creditCards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_credit', true)
        .eq('is_active', true)
        .gt('current_balance', 0)
        .order('current_balance', { ascending: false })
        .limit(5); // Aumentar limite para mais cartões
      
      const combinedData: any[] = [];
      
      // Processar despesas não pagas (contas a pagar)
      if (unpaidExpenses && !expensesError) {
        unpaidExpenses.forEach(expense => {
          const dueDate = new Date(expense.due_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Zerar horas para comparação precisa
          dueDate.setHours(0, 0, 0, 0);
          
          const diffTime = dueDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          let dateText = '';
          let backgroundColor = '#E3F5FF';
          let iconColor = '#0095FF';
          
          if (diffDays < 0) {
            const overdueDays = Math.abs(diffDays);
            dateText = overdueDays === 1 ? 'Venceu ontem' : `Venceu há ${overdueDays} dias`;
            backgroundColor = '#FFE2E6';
            iconColor = '#FF3B30';
          } else if (diffDays === 0) {
            dateText = 'Vence hoje';
            backgroundColor = '#FFE2E6';
            iconColor = '#FF5A6E';
          } else if (diffDays === 1) {
            dateText = 'Vence amanhã';
            backgroundColor = '#FFF6E3';
            iconColor = '#FFB627';
          } else if (diffDays <= 7) {
            dateText = `Vence em ${diffDays} dias`;
            backgroundColor = '#FFF6E3';
            iconColor = '#FFB627';
          } else if (diffDays <= 30) {
            dateText = `Vence em ${dueDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
            backgroundColor = '#E3F5FF';
            iconColor = '#0095FF';
          } else {
            dateText = `Vence em ${dueDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
            backgroundColor = '#F0F0F0';
            iconColor = '#666666';
          }
          
          // Definir ícone baseado na categoria ou tipo de despesa
          let icon = Receipt;
          const category = expense.category?.toLowerCase() || '';
          const title = expense.title?.toLowerCase() || '';
          
          if (category.includes('cartão') || category.includes('crédito') || title.includes('cartão')) {
            icon = CreditCard;
          } else if (category.includes('energia') || category.includes('luz') || title.includes('energia') || title.includes('luz')) {
            icon = Receipt; // Pode usar um ícone específico se disponível
          } else if (category.includes('água') || title.includes('água')) {
            icon = Receipt;
          } else if (category.includes('internet') || category.includes('telefone') || title.includes('internet') || title.includes('telefone')) {
            icon = Receipt;
          } else if (category.includes('aluguel') || title.includes('aluguel')) {
            icon = Receipt;
          }
          
          combinedData.push({
            id: expense.id,
            type: 'expense',
            title: expense.title || 'Conta a pagar',
            subtitle: dateText,
            amount: expense.amount,
            backgroundColor,
            iconColor,
            icon,
            dueDate: expense.due_date,
            category: expense.category,
            isOverdue: diffDays < 0
          });
        });
      }
      
      // Processar cartões de crédito
      if (creditCards && !cardsError) {
        creditCards.forEach(card => {
          const currentBalance = Number(card.current_balance) || 0;
          const creditLimit = Number(card.credit_limit) || 0;
          const availableLimit = creditLimit - currentBalance;
          const usagePercentage = creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 0;
          
          let subtitle = '';
          let backgroundColor = '#E3F5FF';
          let iconColor = '#0095FF';
          
          if (currentBalance <= 0) {
            subtitle = `Sem fatura pendente`;
            backgroundColor = '#E8F9E8';
            iconColor = '#28A745';
          } else if (usagePercentage > 90) {
            subtitle = `Limite quase esgotado (${usagePercentage.toFixed(0)}%)`;
            backgroundColor = '#FFE2E6';
            iconColor = '#FF3B30';
          } else if (usagePercentage > 70) {
            subtitle = `${usagePercentage.toFixed(0)}% do limite usado`;
            backgroundColor = '#FFF6E3';
            iconColor = '#FFB627';
          } else if (currentBalance > 0) {
            subtitle = `Fatura atual: ${formatCurrency(currentBalance)}`;
            backgroundColor = '#FFE2E6';
            iconColor = '#FF5A6E';
          }
          
          // Só adicionar cartões com saldo > 0 (com fatura pendente)
          if (currentBalance > 0) {
            combinedData.push({
              id: card.id,
              type: 'card',
              title: card.name || 'Cartão de Crédito',
              subtitle,
              amount: currentBalance,
              backgroundColor,
              iconColor,
              icon: CreditCard,
              creditLimit,
              availableLimit,
              usagePercentage,
              bankName: card.bank_name
            });
          }
        });
      }
      
      // Ordenar por urgência (contas vencidas primeiro, depois por vencimento, depois cartões)
      combinedData.sort((a, b) => {
        // Priorizar contas vencidas
        if (a.type === 'expense' && b.type === 'expense') {
          if (a.isOverdue && !b.isOverdue) return -1;
          if (!a.isOverdue && b.isOverdue) return 1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        // Despesas sempre antes de cartões
        if (a.type === 'expense' && b.type === 'card') return -1;
        if (a.type === 'card' && b.type === 'expense') return 1;
        // Entre cartões, ordenar por saldo
        if (a.type === 'card' && b.type === 'card') {
          return Number(b.amount) - Number(a.amount);
        }
        return 0;
      });
      
      console.log('Contas a pagar encontradas:', unpaidExpenses?.length || 0);
      console.log('Cartões encontrados:', creditCards?.length || 0);
      console.log('Total combinado:', combinedData.length);
      
      setBillsAndCards(combinedData.slice(0, 8)); // Aumentar limite para 8 itens
      
    } catch (error) {
      console.error('Erro ao buscar contas a pagar e cartões:', error);
      setBillsAndCards([]); // Limpar dados em caso de erro
    } finally {
      setLoadingBillsAndCards(false);
    }
  };

  // Função para buscar contas a receber
  const fetchAccountsReceivable = async () => {
    try {
      console.log('Iniciando busca de contas a receber...');
      setLoadingAccountsReceivable(true);
      
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Erro ao obter sessão:', sessionError);
        return;
      }
      
      const userId = session.user.id;
      
      // Buscar receitas não recebidas (contas a receber)
      const { data: unpaidIncomes, error: incomesError } = await supabase
        .from('incomes')
        .select('*')
        .eq('owner_id', userId)
        .eq('is_received', false)
        .order('receipt_date', { ascending: false })
        .limit(3);
      
      const receivableData: any[] = [];
      
      // Processar receitas não recebidas
      if (unpaidIncomes && !incomesError) {
        unpaidIncomes.forEach(income => {
          const receiptDate = new Date(income.receipt_date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          receiptDate.setHours(0, 0, 0, 0);
          
          const diffTime = receiptDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          let dateText = '';
          let backgroundColor = '#E8F9E8';
          let iconColor = '#28A745';
          
          if (diffDays < 0) {
            const overdueDays = Math.abs(diffDays);
            if (overdueDays === 1) {
              dateText = 'Atrasou ontem';
            } else if (overdueDays <= 30) {
              dateText = `Atrasou há ${overdueDays} dias`;
            } else {
              dateText = `Atrasou em ${receiptDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
            }
            backgroundColor = '#FFF6E3';
            iconColor = '#FFB627';
          } else if (diffDays === 0) {
            dateText = 'Recebe hoje';
            backgroundColor = '#E8F9E8';
            iconColor = '#28A745';
          } else if (diffDays === 1) {
            dateText = 'Recebe amanhã';
            backgroundColor = '#E8F9E8';
            iconColor = '#28A745';
          } else if (diffDays <= 7) {
            dateText = `Recebe em ${diffDays} dias`;
            backgroundColor = '#E8F9E8';
            iconColor = '#28A745';
          } else {
            dateText = `Previsto para ${receiptDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`;
            backgroundColor = '#E3F5FF';
            iconColor = '#0095FF';
          }
          
          // Definir categoria baseada na descrição
          let category = 'Receita';
          const description = income.description?.toLowerCase() || '';
          
          if (description.includes('salário') || description.includes('salario')) {
            category = 'Salário';
          } else if (description.includes('freelance') || description.includes('freela')) {
            category = 'Freelance';
          } else if (description.includes('reembolso')) {
            category = 'Reembolso';
          } else if (description.includes('venda')) {
            category = 'Venda';
          } else if (description.includes('aluguel')) {
            category = 'Aluguel';
          }
          
          receivableData.push({
            id: income.id,
            type: 'income',
            title: income.description || 'Receita',
            subtitle: dateText,
            amount: income.amount,
            backgroundColor,
            iconColor,
            icon: ArrowDownCircle,
            receiptDate: income.receipt_date,
            category,
            isOverdue: diffDays < 0
          });
        });
      }
      
      if (incomesError) {
        console.error('Erro ao buscar receitas:', incomesError);
      }
      
      console.log('Contas a receber encontradas:', unpaidIncomes?.length || 0);
      console.log('Dados das receitas:', unpaidIncomes);
      console.log('Dados processados para exibição:', receivableData);
      
      setAccountsReceivable(receivableData);
      
    } catch (error) {
      console.error('Erro ao buscar contas a receber:', error);
      setAccountsReceivable([]);
    } finally {
      setLoadingAccountsReceivable(false);
    }
  };

  // Função para buscar metas financeiras
  const fetchFinancialGoals = async () => {
    try {
      console.log('Iniciando busca de metas financeiras...');
      setLoadingFinancialGoals(true);
      
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Erro ao obter sessão:', sessionError);
        return;
      }
      
      const userId = session.user.id;
      
      // Buscar metas financeiras do usuário
      const { data: goals, error: goalsError } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (goalsError) {
        console.error('Erro ao buscar metas financeiras:', goalsError);
        setFinancialGoals([]);
        return;
      }
      
      const goalsData: any[] = [];
      
      // Processar metas financeiras
      if (goals && goals.length > 0) {
        goals.forEach(goal => {
          const targetAmount = Number(goal.target_amount) || 0;
          const currentAmount = Number(goal.current_amount) || 0;
          const percentage = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;
          
          goalsData.push({
            id: goal.id,
            title: goal.title || 'Meta Financeira',
            targetAmount,
            currentAmount,
            percentage: Math.min(percentage, 100), // Limitar a 100%
            deadline: goal.deadline,
            icon: goal.icon || '🎯',
            color: goal.color || theme.primary
          });
        });
      }
      
      console.log('Metas financeiras encontradas:', goals?.length || 0);
      console.log('Dados das metas:', goalsData);
      
      setFinancialGoals(goalsData);
      
    } catch (error) {
      console.error('Erro ao buscar metas financeiras:', error);
      setFinancialGoals([]);
    } finally {
      setLoadingFinancialGoals(false);
    }
  };

  // Função para buscar saldo inicial
  const fetchInitialBalance = async () => {
    try {
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Erro ao obter sessão:', sessionError);
        return;
      }
      
      const userId = session.user.id;
      
      // Buscar todas as contas do usuário
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('initial_balance')
        .eq('owner_id', userId);
      
      if (accountsError) {
        console.error('Erro ao buscar contas:', accountsError);
        return;
      }
      
      // Somar todos os saldos iniciais
      const totalInitialBalance = accounts?.reduce((total, account) => {
        return total + (Number(account.initial_balance) || 0);
      }, 0) || 0;
      
      setInitialBalance(totalInitialBalance);
      
    } catch (error) {
      console.error('Erro ao buscar saldo inicial:', error);
    }
  };

  // Função para buscar saldo atual
  const fetchCurrentBalance = async () => {
    try {
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Erro ao obter sessão:', sessionError);
        return;
      }
      
      const userId = session.user.id;
      
      // Buscar todas as contas do usuário
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('owner_id', userId);
      
      if (accountsError) {
        console.error('Erro ao buscar contas:', accountsError);
        return;
      }
      
      // Somar todos os saldos atuais
      const totalCurrentBalance = accounts?.reduce((total, account) => {
        return total + (Number(account.balance) || 0);
      }, 0) || 0;
      
      setCurrentBalance(totalCurrentBalance);
      
    } catch (error) {
      console.error('Erro ao buscar saldo atual:', error);
    }
  };

  // Função para buscar saldo previsto (receitas - gastos do mês)
  const fetchPredictedBalance = async () => {
    try {
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Erro ao obter sessão:', sessionError);
        return;
      }
      
      const userId = session.user.id;
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Buscar receitas do mês
      const { data: incomes, error: incomesError } = await supabase
        .from('incomes')
        .select('amount')
        .eq('owner_id', userId)
        .gte('receipt_date', startOfMonth.toISOString())
        .lte('receipt_date', endOfMonth.toISOString());
      
      // Buscar despesas do mês
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('owner_id', userId)
        .gte('due_date', startOfMonth.toISOString())
        .lte('due_date', endOfMonth.toISOString());
      
      if (incomesError || expensesError) {
        console.error('Erro ao buscar receitas/despesas:', incomesError || expensesError);
        return;
      }
      
      // Somar receitas do mês
      const totalIncomes = incomes?.reduce((total, income) => {
        return total + (Number(income.amount) || 0);
      }, 0) || 0;
      
      // Somar despesas do mês
      const totalExpenses = expenses?.reduce((total, expense) => {
        return total + (Number(expense.amount) || 0);
      }, 0) || 0;
      
      // Saldo previsto = receitas - despesas
      const predicted = totalIncomes - totalExpenses;
      setPredictedBalance(predicted);
      
    } catch (error) {
      console.error('Erro ao buscar saldo previsto:', error);
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
      
      // Buscar saldo inicial das contas
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('balance, initial_balance')
        .eq('owner_id', userId);
      
      if (accountsError) {
        console.error('Erro ao buscar contas:', accountsError);
        return;
      }
      
      const currentAccountBalance = accounts?.reduce((total, account) => {
        return total + (Number(account.balance) || 0);
      }, 0) || 0;
      
      const initialAccountBalance = accounts?.reduce((total, account) => {
        return total + (Number(account.initial_balance) || 0);
      }, 0) || 0;
      
      // Buscar todas as transações para calcular saldos históricos
      const accountIds = accounts?.map(acc => acc.id).filter(id => id) || [];
      
      let transactions = [];
      
      if (accountIds.length > 0) {
        const { data: transactionData } = await supabase
          .from('transactions')
          .select('amount, transaction_date, account_id')
          .in('account_id', accountIds)
          .order('transaction_date', { ascending: true });
        
        transactions = transactionData || [];
      } else {
        console.log('Nenhuma conta encontrada, usando dados padrão para o gráfico');
      }
      
      // Gerar dados do gráfico: ontem, hoje e próximos 5 dias
      const chartPoints = [];
      
      // Calcular saldo de ontem baseado nas transações
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(23, 59, 59, 999); // Final do dia de ontem
      
      // Transações até o final de ontem
      const transactionsUntilYesterday = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.transaction_date);
        return transactionDate <= yesterday;
      });
      
      const totalTransactionsUntilYesterday = transactionsUntilYesterday.reduce((sum, transaction) => {
        return sum + (Number(transaction.amount) || 0);
      }, 0);
      
      const yesterdayBalance = initialAccountBalance + totalTransactionsUntilYesterday;
      
      // Adicionar ponto de ontem
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      chartPoints.push({
        date: yesterdayDate,
        balance: yesterdayBalance,
        day: yesterdayDate.getDate(),
        isToday: false
      });
      
      // Buscar receitas e despesas futuras (próximos 5 dias)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      futureDate.setHours(23, 59, 59, 999);
      
      const { data: futureIncomes } = await supabase
        .from('incomes')
        .select('amount, receipt_date')
        .eq('owner_id', userId)
        .gte('receipt_date', new Date().toISOString())
        .lte('receipt_date', futureDate.toISOString())
        .eq('is_received', false);
      
      const { data: futureExpenses } = await supabase
        .from('expenses')
        .select('amount, due_date')
        .eq('owner_id', userId)
        .gte('due_date', new Date().toISOString())
        .lte('due_date', futureDate.toISOString())
        .eq('is_paid', false);
      
      // Gerar pontos de hoje e próximos dias
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        let dayBalance;
        
        if (i === 0) {
          // Hoje: usar saldo atual real
          dayBalance = currentAccountBalance;
        } else {
          // Dias futuros: calcular baseado em receitas e despesas previstas até esta data
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + i);
          targetDate.setHours(23, 59, 59, 999);
          
          // Filtrar receitas até esta data
          const incomesUntilDate = (futureIncomes || []).filter(income => {
            const incomeDate = new Date(income.receipt_date);
            return incomeDate <= targetDate;
          });
          
          // Filtrar despesas até esta data
          const expensesUntilDate = (futureExpenses || []).filter(expense => {
            const expenseDate = new Date(expense.due_date);
            return expenseDate <= targetDate;
          });
          
          const totalFutureIncome = incomesUntilDate.reduce((sum, income) => sum + (Number(income.amount) || 0), 0);
          const totalFutureExpense = expensesUntilDate.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
          
          dayBalance = currentAccountBalance + totalFutureIncome - totalFutureExpense;
        }
        
        chartPoints.push({
          date: date,
          balance: dayBalance,
          day: date.getDate(),
          isToday: i === 0
        });
      }
      
      // Debug: log dos pontos calculados
      console.log('Chart Data Calculado:', chartPoints.map(point => ({
        date: point.date.toLocaleDateString('pt-BR'),
        balance: point.balance,
        isToday: point.isToday
      })));
      
      setChartData(chartPoints);
      
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
    }
  };

  // Função para buscar transações do calendário financeiro
  const fetchCalendarEvents = async () => {
    try {
      setLoadingCalendar(true);
      
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('Erro ao obter sessão:', sessionError);
        return;
      }
      
      const userId = session.user.id;
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);
      
      // Buscar todas as transações do mês
      const { data: monthData, error: transactionsError } = await supabase
        .from('transactions')
        .select('transaction_date, transaction_type, amount')
        .gte('transaction_date', startOfMonth.toISOString())
        .lte('transaction_date', endOfMonth.toISOString())
        .or(`owner_id.eq.${userId},partner_id.eq.${userId}`);
      
      if (transactionsError) {
        console.error('Erro ao buscar transações do mês:', transactionsError);
        return;
      }
      
      // Processar os dados para criar um mapa de dias com transações
      const transactionsByDay: {[key: string]: {income: boolean, expense: boolean, transfer: boolean}} = {};
      
      if (monthData && monthData.length > 0) {
        monthData.forEach(transaction => {
          const date = new Date(transaction.transaction_date);
          const day = date.getDate();
          const key = day.toString();
          
          // Inicializar o objeto para este dia se ainda não existir
          if (!transactionsByDay[key]) {
            transactionsByDay[key] = {
              income: false,
              expense: false,
              transfer: false
            };
          }
          
          // Marcar o tipo de transação
          if (transaction.transaction_type === 'income' || parseFloat(transaction.amount) > 0) {
            transactionsByDay[key].income = true;
          } else if (transaction.transaction_type === 'expense' || parseFloat(transaction.amount) < 0) {
            transactionsByDay[key].expense = true;
          } else if (transaction.transaction_type === 'transfer') {
            transactionsByDay[key].transfer = true;
          }
        });
      }
      
      setCalendarEvents(transactionsByDay);
      
    } catch (error) {
      console.error('Erro ao buscar transações do calendário:', error);
    } finally {
      setLoadingCalendar(false);
    }
  };

  // Funções para navegar entre meses
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };
  
  // Formatar nome do mês atual
  const formatMonthName = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long' });
  };

  // Capitalize primeira letra
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar percentual de mudança
  const formatPercentageChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}% desde o mês anterior`;
  };

  // Função para gerar dias do calendário
  const generateCalendarDays = () => {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInWeek = 7;
    const startDay = Math.max(1, currentDay - 3); // Mostrar 3 dias antes do atual
    const endDay = Math.min(new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(), startDay + daysInWeek - 1);
    
    const days = [];
    for (let day = startDay; day <= endDay; day++) {
      days.push(day);
    }
    
    return days;
  };

  // Função para obter transações de um dia específico
  const getTransactionsForDay = (day: number) => {
    const dayKey = day.toString();
    return calendarEvents[dayKey] || null;
  };

  // Nomes baseados no tema
  const primaryPerson = theme === themes.masculine ? 'João' : 'Maria';
  const secondaryPerson = theme === themes.masculine ? 'Maria' : 'João';
  
  // Dados das transações
  const transactions = [
    {
      icon: '🥕',
      backgroundColor: '#FFEEE2',
      title: 'Mercado',
      subtitle: `Mercado por ${secondaryPerson}`,
      amount: 'R$ 50',
      paymentMethod: 'Dinheiro'
    },
    {
      icon: '⛽',
      backgroundColor: '#E3F5FF',
      title: 'Combustível',
      subtitle: `Posto Shell - ${primaryPerson}`,
      amount: 'R$ 120',
      paymentMethod: 'Cartão de crédito'
    },
    {
      icon: '🍽️',
      backgroundColor: '#FFE2E6',
      title: 'Restaurante',
      subtitle: 'Almoço Compartilhado',
      amount: 'R$ 85',
      paymentMethod: 'Pix'
    }
  ];
  
  // Funções para navegar entre transações
  const goToPreviousTransaction = () => {
    if (recentTransactions.length > 0) {
      setCurrentTransactionIndex(prev => 
        prev === 0 ? recentTransactions.length - 1 : prev - 1
      );
    }
  };
  
  const goToNextTransaction = () => {
    if (recentTransactions.length > 0) {
      setCurrentTransactionIndex(prev => 
        prev === recentTransactions.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Gerar datas para a linha do tempo
  const generateTimelineDates = (date: Date) => {
    // Sempre retornar chartData se disponível, pois contém os saldos reais
    if (chartData.length > 0) {
      return chartData;
    }
    
    // Fallback: gerar dados vazios se chartData ainda não foi carregado
    const dates = [];
    for (let i = -1; i < 6; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + i);
      dates.push({
        date: currentDate,
        balance: 0, // Saldo zero até os dados reais serem carregados
        day: currentDate.getDate(),
        isToday: i === 0
      });
    }
    
    return dates;
  };

  // Formatar data para exibição
  const formatDateForTimeline = (dataPoint: any) => {
    if (dataPoint.date) {
      return `${dataPoint.date.getDate().toString().padStart(2, '0')}/${(dataPoint.date.getMonth() + 1).toString().padStart(2, '0')}`;
    }
    return `${dataPoint.getDate().toString().padStart(2, '0')}/${(dataPoint.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // Função para selecionar imagem da galeria
  const pickImage = async () => {
    try {
      // Importar ImagePicker dinamicamente apenas quando a função for chamada
      const ImagePicker = Platform.OS !== 'web' 
        ? await import('expo-image-picker') 
        : null;
      
      if (!ImagePicker) {
        Alert.alert('Não suportado', 'Essa funcionalidade não está disponível nesta plataforma.');
        return;
      }

      // Solicitar permissão para acessar a galeria
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar sua galeria.');
        return;
      }

      // Abrir seletor de imagem
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  // Função para tirar foto com a câmera
  const takePhoto = async () => {
    try {
      // Importar ImagePicker dinamicamente apenas quando a função for chamada
      const ImagePicker = Platform.OS !== 'web' 
        ? await import('expo-image-picker') 
        : null;
      
      if (!ImagePicker) {
        Alert.alert('Não suportado', 'Essa funcionalidade não está disponível nesta plataforma.');
        return;
      }

      // Solicitar permissão para acessar a câmera
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar sua câmera.');
        return;
      }

      // Abrir câmera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  // Função para fazer upload da imagem para o Storage do Supabase
  const uploadImage = async (uri: string) => {
    try {
      setUploading(true);

      // Obter sessão do usuário
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error('Falha ao obter sessão do usuário');
      }

      // Converter imagem para blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Gerar nome de arquivo único
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
      const filePath = `profile_pictures/${fileName}`;

      // Upload para o storage
      const { error: uploadError } = await supabase.storage
        .from('user_uploads')
        .upload(filePath, blob);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública da imagem
      const { data: urlData } = await supabase.storage
        .from('user_uploads')
        .getPublicUrl(filePath);

      // Atualizar perfil do usuário com URL da imagem
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: urlData.publicUrl })
        .eq('id', session.user.id);

      if (updateError) {
        throw updateError;
      }

      // Atualizar estado local
      setImageUrl(urlData.publicUrl);
      setCurrentUser(prev => prev ? {
        ...prev,
        profile_picture_url: urlData.publicUrl,
        avatar_url: urlData.publicUrl
      } : null);

      Alert.alert('Sucesso', 'Sua foto de perfil foi atualizada com sucesso!');
      setProfilePictureModalVisible(false);
      
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      Alert.alert('Erro', 'Não foi possível fazer o upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  // Função para upload de foto do avatar
  const uploadAvatarImage = async (uri: string) => {
    try {
      // Obter sessão do usuário
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error('Falha ao obter sessão do usuário');
      }

      // Converter imagem para blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Gerar nome de arquivo único para avatar
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `avatar_${session.user.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatar_pictures/${fileName}`;

      // Upload para o storage
      const { error: uploadError } = await supabase.storage
        .from('user_uploads')
        .upload(filePath, blob);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública da imagem
      const { data: urlData } = await supabase.storage
        .from('user_uploads')
        .getPublicUrl(filePath);

      // Atualizar estado local com a foto do avatar
      setAvatarPhoto(urlData.publicUrl);
      
    } catch (error) {
      console.error('Erro ao fazer upload da imagem do avatar:', error);
      Alert.alert('Erro', 'Não foi possível fazer o upload da imagem');
    }
  };

  // Função para selecionar imagem do avatar
  const pickAvatarImage = async () => {
    try {
      const ImagePicker = Platform.OS !== 'web' 
        ? await import('expo-image-picker') 
        : null;
      
      if (!ImagePicker) {
        Alert.alert('Não suportado', 'Essa funcionalidade não está disponível nesta plataforma.');
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar sua galeria.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadAvatarImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem do avatar:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  // Função para tirar foto do avatar
  const takeAvatarPhoto = async () => {
    try {
      const ImagePicker = Platform.OS !== 'web' 
        ? await import('expo-image-picker') 
        : null;
      
      if (!ImagePicker) {
        Alert.alert('Não suportado', 'Essa funcionalidade não está disponível nesta plataforma.');
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de permissão para acessar sua câmera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await uploadAvatarImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto do avatar:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  };

  // Alternativa para upload de foto em ambiente web
  const handleImageInputChange = async (event) => {
    try {
      if (Platform.OS === 'web' && event.target.files && event.target.files.length > 0) {
        setUploading(true);
        const file = event.target.files[0];
        await uploadImage(URL.createObjectURL(file));
      }
    } catch (error) {
      console.error('Erro ao processar arquivo web:', error);
      Alert.alert('Erro', 'Não foi possível processar o arquivo');
      setUploading(false);
    }
  };

  // Função para enviar convite
  const handleSendInvitation = async () => {
    // Validação baseada no tipo (avatar ou parceiro real)
    if (isInviteAvatar) {
      if (!inviteName || !inviteName.trim()) {
        Alert.alert('Erro', 'Por favor, informe o nome do avatar');
        return;
      }
    } else {
      if (!inviteEmail || !inviteEmail.trim()) {
        Alert.alert('Erro', 'Por favor, informe o email do convidado');
        return;
      }
    }
    
    setInviting(true);
    try {
      if (!currentUser) {
        throw new Error('Nenhum usuário logado');
      }
      
      // Gerar token único para o convite
      const invitationToken = Math.random().toString(36).substring(2, 15) + 
        Math.random().toString(36).substring(2, 15);
      
      if (isInviteAvatar) {
        // Lógica para criar avatar (sem envio de email)
        const { data: coupleData, error: coupleError } = await supabase
          .from('couples')
          .insert({
            user1_id: currentUser.id,
            invitation_token: invitationToken,
            invitation_email: null, // Avatar não tem email
            status: 'active', // Avatar é ativado imediatamente
            is_avatar: true,
            avatar_name: inviteName.trim(), // Armazenar o nome do avatar
            avatar_photo_url: avatarPhoto // Armazenar a URL da foto do avatar
          })
          .select('id')
          .single();
          
        if (coupleError) {
          throw new Error('Falha ao criar avatar.');
        }
        
        // Fechar modal e limpar estados
        setInviteModalVisible(false);
        setIsInviteAvatar(false);
        setInviteName('');
        setInviteEmail('');
        setAvatarPhoto(null);
        
        // Atualizar os dados do usuário e parceiro imediatamente
        fetchUserAndPartner();
      } else {
        // Fluxo normal para convites de usuários reais
        try {
          const { data: coupleData, error: coupleError } = await supabase
            .from('couples')
            .insert({
              user1_id: currentUser.id,
              invitation_token: invitationToken,
              invitation_email: inviteEmail.trim().toLowerCase(),
              status: 'pending',
              is_avatar: false
            })
            .select('id')
            .single();
            
          if (coupleError) {
            throw new Error('Falha ao criar registro. Verifique se o email é válido.');
          }
          
          // Enviar convite por email para usuários reais
          const inviteResponse = await fetch(`${supabase.supabaseUrl}/functions/v1/send-couple-invitation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              partnerEmail: inviteEmail.trim().toLowerCase(),
              inviterName: currentUser.name || 'Seu parceiro',
              inviterId: currentUser.id,
              invitationToken: invitationToken,
              coupleId: coupleData.id
            })
          });
          
          if (!inviteResponse.ok) {
            const errorData = await inviteResponse.json();
            throw new Error(`Falha ao enviar convite: ${errorData.error || 'Erro desconhecido'}`);
          }
          
          // Armazenar o email convidado e mostrar modal de sucesso
          setInvitedEmail(inviteEmail.trim().toLowerCase());
          setInviteModalVisible(false);
          setInviteSuccessModalVisible(true);
          
          // Limpar campos
          setInviteEmail('');
          setInviteName('');
          setIsInviteAvatar(false);
        } catch (error) {
          console.error('Erro ao enviar convite:', error);
          Alert.alert('Erro', error.message || 'Falha ao enviar o convite');
          setInviting(false);
          return;
        }
      }
      
      setInviteEmail('');
      setInviteName('');
      setAvatarPhoto(null); // Limpar foto do avatar
      setInviting(false);
    } catch (error) {
      console.error('Erro ao processar operação:', error);
      Alert.alert('Erro', error.message || 'Falha ao processar a operação. Por favor, tente novamente.');
      setInviting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />
      <ScrollView>
        {/* Header Section */}
        <LinearGradient
          colors={[theme.primaryGradient[0], theme.primaryGradient[1]]}
          style={styles.headerContainer}
        >
          <SafeAreaView style={styles.headerContent}>
            <View style={styles.profileSection}>
              <View style={styles.profileInfo}>
                <TouchableOpacity onPress={() => setProfilePictureModalVisible(true)}>
                  <Image
                    source={{ uri: currentUser?.profile_picture_url || (theme === themes.masculine 
                      ? 'https://randomuser.me/api/portraits/men/36.jpg'
                      : 'https://randomuser.me/api/portraits/women/44.jpg') }}
                    style={styles.profileImage}
                  />
                </TouchableOpacity>
                <View style={styles.monthSelectorContainer}>
                  <TouchableOpacity style={styles.monthNavButton} onPress={goToPreviousMonth}>
                    <ArrowLeft size={22} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.monthText}>{capitalizeFirstLetter(formatMonthName(currentMonth))}</Text>
                  <TouchableOpacity style={styles.monthNavButton} onPress={goToNextMonth}>
                    <ArrowRight size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={styles.logoutButton}
                  onPress={() => {
                    router.replace('/(auth)/login');
                  }}
                  accessibilityLabel="Botão de logout"
                  accessibilityHint="Pressione para sair do aplicativo"
                >
                  <LogOut size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.balanceSection}>
              <View style={styles.balanceHeaderRow}>
                <View style={styles.balanceHeaderItem}>
                  <View style={styles.balanceIconCircle}>
                    <Check size={16} color="#fff" />
                  </View>
                  <Text style={styles.balanceHeaderText}>Inicial</Text>
                </View>
                
                <View style={styles.balanceHeaderItem}>
                  <View style={[styles.balanceIconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.5)' }]}>
                    <DollarSign size={16} color="#fff" />
                  </View>
                  <Text style={styles.balanceHeaderText}>Saldo</Text>
                </View>
                
                <View style={styles.balanceHeaderItem}>
                  <View style={styles.balanceIconCircle}>
                    <Clock size={16} color="#fff" />
                  </View>
                  <Text style={styles.balanceHeaderText}>Previsto</Text>
                </View>
              </View>
              
              <View style={styles.balanceValueRow}>
                <View style={styles.balanceValueItem}>
                  <Text style={styles.balanceAmountSmall}>{formatCurrency(initialBalance)}</Text>
                </View>
                <View style={[styles.balanceValueItem, styles.balanceValueCenterItem]}>
                  <Text style={styles.balanceAmountLarge}>{formatCurrency(currentBalance)}</Text>
                </View>
                <View style={styles.balanceValueItem}>
                  <Text style={styles.balanceAmountSmall}>{formatCurrency(predictedBalance)}</Text>
                </View>
              </View>
              

            </View>

            <View style={styles.usersRow}>
              {currentUser && (
                <Image
                  source={{ uri: currentUser.avatar_url || (theme === themes.masculine 
                    ? 'https://randomuser.me/api/portraits/men/36.jpg'
                    : 'https://randomuser.me/api/portraits/women/44.jpg') }}
                  style={styles.userAvatar}
                />
              )}
              
              {/* Exibir todos os parceiros encontrados */}
              {partnerUsers.map((partner, index) => (
                <TouchableOpacity 
                  key={`partner-${partner.id}-${index}`}
                  onPress={() => {
                    Alert.alert(
                      partner.is_avatar ? 'Avatar' : 'Parceiro',
                      `${partner.name}${partner.is_avatar ? ' (Avatar)' : ''}`
                    );
                  }}
                >
                  <Image
                    source={{ uri: partner.avatar_url }}
                    style={[
                      styles.userAvatar,
                      partner.is_avatar ? styles.avatarPartner : null
                    ]}
                    accessibilityLabel={`${partner.name}${partner.is_avatar ? ' (Avatar)' : ''}`}
                  />
                </TouchableOpacity>
              ))}
              
              {/* Botão de adicionar usuário apenas se o usuário atual for um convidador */}
              {console.log('Renderização condicional do botão +:', { 
                currentUser: currentUser,
                currentUserAccountType: currentUser?.account_type,
                shouldShowButton: currentUser?.account_type !== 'couple',
                isNull: currentUser?.account_type === null,
                isUndefined: currentUser?.account_type === undefined,
                isTypeOfString: typeof currentUser?.account_type === 'string',
                comparison: currentUser?.account_type === 'couple',
                isUserInviter: isUserInviter
              })}
              
              {/* Mostrar o botão se o usuário for um convidador (independente do account_type) OU se for individual */}
              {currentUser && (isUserInviter || currentUser.account_type !== 'couple') && (
                <TouchableOpacity 
                  style={styles.addUserAvatar}
                  onPress={() => setTypeSelectionModalVisible(true)}
                >
                  <Text style={styles.addUserText}>+</Text>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Financial Cards - Receitas, Despesas, Débitos e Créditos */}
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsScrollContainer}
        >
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Pressable 
              style={({pressed}) => [
                styles.financialCard, 
                { backgroundColor: theme.card },
                pressed && styles.financialCardPressed
              ]}
              onPressIn={() => setPressedCard('receitas')}
              onPressOut={() => {
                setPressedCard(null);
              }}
            >
              <Text style={styles.cardLabel}>Receitas</Text>
              {loadingFinancialData ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <>
                  <Text style={styles.cardAmount}>{formatCurrency(financialData.receitas.total)}</Text>
                  <Text style={[
                    financialData.receitas.change >= 0 ? styles.cardChangePositive : styles.cardChangeNegative
                  ]}>
                    {formatPercentageChange(financialData.receitas.change)}
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable 
              style={({pressed}) => [
                styles.financialCard, 
                { backgroundColor: theme.card },
                pressed && styles.financialCardPressed
              ]}
              onPressIn={() => setPressedCard('despesas')}
              onPressOut={() => {
                setPressedCard(null);
              }}
            >
              <Text style={styles.cardLabel}>Despesas</Text>
              {loadingFinancialData ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <>
                  <Text style={styles.cardAmount}>{formatCurrency(financialData.despesas.total)}</Text>
                  <Text style={[
                    financialData.despesas.change >= 0 ? styles.cardChangeNegative : styles.cardChangePositive
                  ]}>
                    {formatPercentageChange(financialData.despesas.change)}
                  </Text>
                </>
              )}
            </Pressable>
            
            <Pressable 
              style={({pressed}) => [
                styles.financialCard, 
                { backgroundColor: theme.card },
                pressed && styles.financialCardPressed
              ]}
              onPressIn={() => setPressedCard('debitos')}
              onPressOut={() => {
                setPressedCard(null);
              }}
            >
              <Text style={styles.cardLabel}>Débitos</Text>
              {loadingFinancialData ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <>
                  <Text style={styles.cardAmount}>{formatCurrency(financialData.debitos.total)}</Text>
                  <Text style={[
                    financialData.debitos.change >= 0 ? styles.cardChangeNegative : styles.cardChangePositive
                  ]}>
                    {formatPercentageChange(financialData.debitos.change)}
                  </Text>
                </>
              )}
            </Pressable>
            
            <Pressable 
              style={({pressed}) => [
                styles.financialCard, 
                { backgroundColor: theme.card },
                pressed && styles.financialCardPressed
              ]}
              onPressIn={() => setPressedCard('creditos')}
              onPressOut={() => {
                setPressedCard(null);
              }}
            >
              <Text style={styles.cardLabel}>Créditos</Text>
              {loadingFinancialData ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <>
                  <Text style={styles.cardAmount}>{formatCurrency(financialData.creditos.total)}</Text>
                  <Text style={[
                    financialData.creditos.change >= 0 ? styles.cardChangeNegative : styles.cardChangePositive
                  ]}>
                    {formatPercentageChange(financialData.creditos.change)}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>

        {/* Transaction List */}
        <View style={[styles.transactionContainer, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimas Transações</Text>
            <TouchableOpacity onPress={goToNextTransaction}>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>
          
          {loadingTransactions ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={styles.loadingText}>Carregando transações...</Text>
            </View>
          ) : recentTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma transação encontrada</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity onPress={goToNextTransaction} style={styles.transactionRow}>
                <View style={[styles.iconContainer, {backgroundColor: recentTransactions[currentTransactionIndex]?.backgroundColor || '#E3F5FF'}]}>
                  <Text style={styles.iconText}>{recentTransactions[currentTransactionIndex]?.icon || '💰'}</Text>
                </View>
                
                <View style={styles.textContainer}>
                  <Text style={styles.titleText} numberOfLines={1}>
                    {recentTransactions[currentTransactionIndex]?.title || 'Transação'}
                  </Text>
                  <Text style={styles.subtitleText} numberOfLines={1}>
                    {recentTransactions[currentTransactionIndex]?.subtitle || 'Detalhes'}
                  </Text>
                </View>
                
                <View style={styles.amountContainer}>
                  <Text style={[
                    styles.amountText,
                    { color: recentTransactions[currentTransactionIndex]?.type === 'income' ? '#4CD964' : '#FF3B30' }
                  ]} numberOfLines={1}>
                    {recentTransactions[currentTransactionIndex]?.amount || 'R$ 0,00'}
                  </Text>
                  <Text style={styles.methodText} numberOfLines={1}>
                    {recentTransactions[currentTransactionIndex]?.paymentMethod || 'N/A'}
                  </Text>
                </View>
                
                <ChevronRight size={16} color="#999" />
              </TouchableOpacity>
              
              <View style={styles.paginationDots}>
                {recentTransactions.map((_, index) => (
                  <View 
                    key={index}
                    style={[styles.paginationDot, 
                      index === currentTransactionIndex ? 
                      { backgroundColor: theme.secondary, width: 20 } : 
                      { backgroundColor: '#e0e0e0' }
                    ]} 
                  />
                ))}
              </View>
            </>
          )}
        </View>

        {/* Resumo do Mês */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Resumo do Mês</Text>
          </View>

          {loadingSummaryData ? (
            <View style={styles.summaryItem}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={styles.summaryLabel}>Carregando dados...</Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryItem}>
                <DollarSign size={18} color={theme.primary} />
                <Text style={styles.summaryLabel}>Saldo total atual:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(summaryData.saldoTotal)}</Text>
              </View>

              <TouchableOpacity 
                style={[styles.summaryItem, styles.clickableItem]}
                onPress={() => router.push('/historico-receitas')}
                activeOpacity={0.7}
              >
                <ArrowDownCircle size={18} color={theme.income} />
                <Text style={styles.summaryLabel}>Receitas totais do mês:</Text>
                <Text style={[styles.summaryValue, {color: theme.income}]}>{formatCurrency(summaryData.receitasMes)}</Text>
                <ChevronRight size={16} color="#999" style={styles.chevronIcon} />
              </TouchableOpacity>

              <View style={styles.summaryItem}>
                <ArrowUpCircle size={18} color={theme.expense} />
                <Text style={styles.summaryLabel}>Despesas totais do mês:</Text>
                <Text style={[styles.summaryValue, {color: theme.expense}]}>{formatCurrency(summaryData.despesasMes)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Gastos por Pessoa */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gastos por Pessoa (até hoje)</Text>
          </View>

          {loadingExpensesByPerson ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={styles.loadingText}>Carregando gastos...</Text>
            </View>
          ) : (
            <>
              <View style={styles.personExpense}>
                <View style={styles.personExpenseHeader}>
                  <Text style={styles.personName}>{expensesByPerson.currentUser.name}:</Text>
                  <Text style={styles.personAmount}>{formatCurrency(expensesByPerson.currentUser.amount)}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { 
                    backgroundColor: theme.primary, 
                    width: `${expensesByPerson.currentUser.percentage}%` 
                  }]} />
                </View>
              </View>

              {expensesByPerson.partner.name !== 'Parceiro' && expensesByPerson.partner.amount > 0 && (
                <View style={styles.personExpense}>
                  <View style={styles.personExpenseHeader}>
                    <Text style={styles.personName}>{expensesByPerson.partner.name}:</Text>
                    <Text style={styles.personAmount}>{formatCurrency(expensesByPerson.partner.amount)}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { 
                      backgroundColor: theme === themes.masculine ? theme.shared : theme.primary, 
                      width: `${expensesByPerson.partner.percentage}%` 
                    }]} />
                  </View>
                </View>
              )}

              {expensesByPerson.shared.amount > 0 && (
                <View style={styles.personExpense}>
                  <View style={styles.personExpenseHeader}>
                    <Text style={styles.personName}>Compartilhado:</Text>
                    <Text style={styles.personAmount}>{formatCurrency(expensesByPerson.shared.amount)}</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { 
                      backgroundColor: theme.shared, 
                      width: `${expensesByPerson.shared.percentage}%` 
                    }]} />
                  </View>
                </View>
              )}

              {expensesByPerson.currentUser.amount === 0 && 
               expensesByPerson.partner.amount === 0 && 
               expensesByPerson.shared.amount === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Nenhum gasto encontrado</Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Contas a Pagar & Cartões */}
        <TouchableOpacity onPress={() => router.push('/expenses')} activeOpacity={0.8}>
          <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}> 
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Contas a Pagar & Cartões</Text>
              <ChevronRight size={20} color="#999" />
            </View>
            
            {loadingBillsAndCards ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={styles.loadingText}>Carregando contas...</Text>
              </View>
            ) : billsAndCards.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma conta pendente</Text>
              </View>
            ) : (
              billsAndCards.map((item, index) => (
                <View key={item.id || index} style={styles.billItem}>
                  <View style={[styles.billIconContainer, {backgroundColor: item.backgroundColor}]}>
                    <item.icon size={20} color={item.iconColor} />
                  </View>
                  <View style={styles.billDetails}>
                    <Text style={styles.billTitle}>{item.title}</Text>
                    <Text style={styles.billDate}>{item.subtitle}</Text>
                  </View>
                  <Text style={styles.billAmount}>{formatCurrency(Number(item.amount))}</Text>
                </View>
              ))
            )}
          </View>
        </TouchableOpacity>

        {/* Contas a Receber */}
        <TouchableOpacity onPress={() => router.push('/receitas')} activeOpacity={0.8}>
          <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}> 
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Contas a Receber</Text>
              <ChevronRight size={20} color="#999" />
            </View>
            
            {loadingAccountsReceivable ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={styles.loadingText}>Carregando receitas...</Text>
              </View>
            ) : accountsReceivable.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma receita pendente</Text>
              </View>
            ) : (
              accountsReceivable.map((item, index) => (
                <View key={item.id || index} style={styles.billItem}>
                  <View style={[styles.billIconContainer, {backgroundColor: item.backgroundColor}]}>
                    <item.icon size={20} color={item.iconColor} />
                  </View>
                  <View style={styles.billDetails}>
                    <Text style={styles.billTitle}>{item.title}</Text>
                    <Text style={styles.billDate}>{item.subtitle}</Text>
                  </View>
                  <Text style={styles.billAmount}>{formatCurrency(Number(item.amount))}</Text>
                </View>
              ))
            )}
          </View>
        </TouchableOpacity>

        {/* Metas Financeiras */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Metas Financeiras</Text>
            <TouchableOpacity onPress={() => router.push('/planning')}>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {loadingFinancialGoals ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={styles.loadingText}>Carregando metas...</Text>
            </View>
          ) : financialGoals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma meta cadastrada</Text>
            </View>
          ) : (
            financialGoals.map((goal, index) => (
              <View key={goal.id || index} style={styles.goalItem}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalTitleContainer}>
                    <Target size={18} color={goal.color} />
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                  </View>
                  {goal.percentage <= 100 ? (
                    <Text style={styles.goalPercentage}>{goal.percentage}%</Text>
                  ) : (
                    <Text style={styles.goalAmount}>
                      {formatCurrency(goal.currentAmount)} <Text style={styles.goalTarget}>/ {formatCurrency(goal.targetAmount)}</Text>
                    </Text>
                  )}
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { backgroundColor: goal.color, width: `${Math.min(goal.percentage, 100)}%` }]} />
                </View>
              </View>
            ))
          )}
        </View>

        {/* Calendário Financeiro - Funcional */}
        <View style={[styles.sectionContainer, { backgroundColor: theme.card, marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Calendário Financeiro</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/registers')}>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {loadingCalendar ? (
            <View style={styles.calendarLoadingContainer}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={styles.calendarLoadingText}>Carregando eventos...</Text>
            </View>
          ) : (
            <View style={styles.calendarPreview}>
              <View style={styles.calendarRow}>
                {generateCalendarDays().map((day, index) => {
                  const today = new Date().getDate();
                  const isToday = day === today;
                  const dayTransactions = getTransactionsForDay(day);
                  
                  return (
                    <TouchableOpacity 
                      key={day} 
                      style={[
                        styles.calendarDay,
                        isToday && styles.calendarDayToday
                      ]}
                      onPress={() => {
                        if (dayTransactions) {
                          const types = [];
                          if (dayTransactions.income) types.push('Receitas');
                          if (dayTransactions.expense) types.push('Despesas');
                          if (dayTransactions.transfer) types.push('Transferências');
                          
                          Alert.alert(
                            `Transações do dia ${day}`,
                            `Tipos de transações:\n• ${types.join('\n• ')}`,
                            [{ text: 'OK' }]
                          );
                        }
                      }}
                    >
                      <Text style={[
                        styles.calendarDayText,
                        isToday && styles.calendarDayTextToday
                      ]}>
                        {day}
                      </Text>
                      
                      {/* Indicadores de transações */}
                      {dayTransactions && (
                        <View style={styles.calendarTransactionIndicators}>
                          {dayTransactions.income && (
                            <View style={[styles.calendarTransactionDot, { backgroundColor: '#4CD964' }]} />
                          )}
                          {dayTransactions.expense && (
                            <View style={[styles.calendarTransactionDot, { backgroundColor: '#FF3A30' }]} />
                          )}
                          {dayTransactions.transfer && (
                            <View style={[styles.calendarTransactionDot, { backgroundColor: '#FFCC02' }]} />
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.calendarLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: '#4CD964'}]} />
                  <Text style={styles.legendText}>Receitas</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: '#FF3A30'}]} />
                  <Text style={styles.legendText}>Despesas</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: '#FFCC02'}]} />
                  <Text style={styles.legendText}>Transferências</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.navItem}>
          <BarChart size={24} color={theme.primary} />
          <Text style={[styles.navText, { color: theme.primary }]}>Dashboard</Text>
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
          onPress={() => router.push('/(app)/registers')}
        >
          <View style={[styles.addButtonInner, { backgroundColor: theme.primary }]}>
            <PlusCircle size={32} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push('/(app)/notifications')}
        >
          <Receipt size={24} color="#999" />
          <Text style={styles.navText}>Notificações</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push('/(app)/cards')}
        >
          <CreditCard size={24} color="#999" />
          <Text style={styles.navText}>Cartões</Text>
        </TouchableOpacity>
      </View>

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
                <X size={24} color={theme.primary} />
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

      {/* Profile Picture Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profilePictureModalVisible}
        onRequestClose={() => setProfilePictureModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alterar Foto de Perfil</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setProfilePictureModalVisible(false)}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {uploading ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.uploadingText}>Enviando sua foto...</Text>
              </View>
            ) : (
              <>
                <View style={styles.currentPhotoContainer}>
                  <Image 
                    source={{ 
                      uri: currentUser?.profile_picture_url || (theme === themes.masculine 
                        ? 'https://randomuser.me/api/portraits/men/36.jpg'
                        : 'https://randomuser.me/api/portraits/women/44.jpg')
                    }}
                    style={styles.currentPhoto} 
                  />
                </View>
                
                {Platform.OS === 'web' ? (
                  <View style={styles.webButtonContainer}>
                    <TouchableOpacity 
                      style={[styles.photoButton, { backgroundColor: theme.primary }]}
                      onPress={() => {
                        // Disparar o input file via JS
                        const fileInput = document.getElementById('profile-picture-input');
                        if (fileInput) fileInput.click();
                      }}
                    >
                      <View style={styles.buttonContent}>
                        <Upload size={24} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Escolher Foto</Text>
                      </View>
                    </TouchableOpacity>
                    
                    {/* Input file oculto para web */}
                    {Platform.OS === 'web' && (
                      <input
                        type="file"
                        id="profile-picture-input"
                        accept="image/*"
                        onChange={handleImageInputChange}
                        style={{ display: 'none' }}
                      />
                    )}
                  </View>
                ) : (
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                      style={[styles.photoButton, { backgroundColor: theme.primary }]}
                      onPress={takePhoto}
                    >
                      <View style={styles.buttonContent}>
                        <Camera size={24} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Tirar Foto</Text>
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.photoButton, { backgroundColor: theme.secondary }]}
                      onPress={pickImage}
                    >
                      <View style={styles.buttonContent}>
                        <ImageIcon size={24} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.buttonText}>Escolher Foto</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Tipo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={typeSelectionModalVisible}
        onRequestClose={() => setTypeSelectionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha uma opção</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setTypeSelectionModalVisible(false)}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              O que você gostaria de fazer?
            </Text>
            
            <View style={styles.optionButtonsContainer}>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.primary }]}
                onPress={() => {
                  setTypeSelectionModalVisible(false);
                  setIsInviteAvatar(true);
                  setInviteModalVisible(true);
                }}
              >
                <View style={styles.optionButtonContent}>
                  <BookUser size={28} color="#fff" style={styles.optionButtonIcon} />
                  <Text style={styles.optionButtonTitle}>Criar Avatar</Text>
                  <Text style={styles.optionButtonSubtitle}>
                    Organize gastos por categoria ou finalidade
                  </Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: theme.secondary }]}
                onPress={() => {
                  setTypeSelectionModalVisible(false);
                  setIsInviteAvatar(false);
                  setInviteModalVisible(true);
                }}
              >
                <View style={styles.optionButtonContent}>
                  <Users size={28} color="#fff" style={styles.optionButtonIcon} />
                  <Text style={styles.optionButtonTitle}>Convidar Usuário</Text>
                  <Text style={styles.optionButtonSubtitle}>
                    Convide alguém para compartilhar finanças
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Convite */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={inviteModalVisible}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isInviteAvatar ? 'Criar Avatar' : 'Convidar Usuário'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setInviteModalVisible(false);
                  setIsInviteAvatar(false);
                  setInviteName('');
                  setInviteEmail('');
                }}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {inviting ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.uploadingText}>
                  {isInviteAvatar ? 'Criando avatar...' : 'Enviando convite...'}
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalSubtitle}>
                  {isInviteAvatar 
                    ? 'Crie um avatar para organizar gastos e receitas de forma categorizada.'
                    : 'Convide alguém para compartilhar finanças e organizar o orçamento juntos.'}
                </Text>
                
                {/* Campo Nome (apenas para avatar) */}
                {isInviteAvatar && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Nome do Avatar</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: Gastos Pessoais, Investimentos..."
                      value={inviteName}
                      onChangeText={setInviteName}
                    />
                  </View>
                )}
                
                {/* Seção de foto do avatar */}
                {isInviteAvatar && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Foto do Avatar (opcional)</Text>
                    
                    {avatarPhoto ? (
                      <View style={styles.avatarPhotoContainer}>
                        <Image source={{ uri: avatarPhoto }} style={styles.avatarPhotoPreview} />
                        <TouchableOpacity 
                          style={[styles.changePhotoButton, { backgroundColor: theme.secondary }]}
                          onPress={() => setAvatarPhoto(null)}
                        >
                          <Text style={styles.changePhotoText}>Alterar Foto</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.photoButtonsContainer}>
                        {Platform.OS === 'web' ? (
                          <TouchableOpacity 
                            style={[styles.avatarPhotoButton, { backgroundColor: theme.secondary }]}
                            onPress={() => {
                              // Disparar o input file via JS
                              const fileInput = document.getElementById('avatar-picture-input');
                              if (fileInput) fileInput.click();
                            }}
                          >
                            <Upload size={20} color="#fff" style={styles.photoButtonIcon} />
                            <Text style={styles.photoButtonText}>Escolher Foto</Text>
                          </TouchableOpacity>
                        ) : (
                          <>
                            <TouchableOpacity 
                              style={[styles.avatarPhotoButton, { backgroundColor: theme.secondary }]}
                              onPress={takeAvatarPhoto}
                            >
                              <Camera size={20} color="#fff" style={styles.photoButtonIcon} />
                              <Text style={styles.photoButtonText}>Tirar Foto</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={[styles.avatarPhotoButton, { backgroundColor: theme.primary }]}
                              onPress={pickAvatarImage}
                            >
                              <ImageIcon size={20} color="#fff" style={styles.photoButtonIcon} />
                              <Text style={styles.photoButtonText}>Galeria</Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    )}
                    
                    {/* Input file oculto para web */}
                    {Platform.OS === 'web' && (
                      <input
                        type="file"
                        id="avatar-picture-input"
                        accept="image/*"
                        onChange={async (event) => {
                          if (event.target.files && event.target.files.length > 0) {
                            const file = event.target.files[0];
                            await uploadAvatarImage(URL.createObjectURL(file));
                          }
                        }}
                        style={{ display: 'none' }}
                      />
                    )}
                  </View>
                )}
                
                {/* Campo Email (só aparece quando não é avatar) */}
                {!isInviteAvatar && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email do Convidado</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Digite o email do convidado"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={inviteEmail}
                      onChangeText={setInviteEmail}
                    />
                  </View>
                )}
                
                <TouchableOpacity
                  style={[styles.inviteButton, { backgroundColor: theme.primary }]}
                  onPress={handleSendInvitation}
                >
                  <Text style={styles.inviteButtonText}>
                    {isInviteAvatar ? 'Criar Avatar' : 'Enviar Convite'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Sucesso do Convite */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={inviteSuccessModalVisible}
        onRequestClose={() => setInviteSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Convite Enviado!</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setInviteSuccessModalVisible(false)}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.successIconContainer}>
              <View style={[styles.successIcon, { backgroundColor: theme.primary }]}>
                <Check size={32} color="#fff" />
              </View>
            </View>
            
            <Text style={styles.successTitle}>Convite enviado com sucesso!</Text>
            <Text style={styles.successMessage}>
              Um convite foi enviado para {invitedEmail}. Seu convidado receberá instruções para aceitar o convite e começar a compartilhar finanças com você.
            </Text>
            
            <TouchableOpacity
              style={[styles.successButton, { backgroundColor: theme.primary }]}
              onPress={() => setInviteSuccessModalVisible(false)}
            >
              <Text style={styles.successButtonText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  financialCard: {
    width: 170,
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 18,
    paddingBottom: 8,
    marginRight: 8,
    height: 120,
    overflow: 'hidden',
    transform: [{ translateY: 0 }],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      }
    }),
  },
  financialCardPressed: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        transform: [{ scale: 1.05 }, { translateY: -5 }],
      },
      android: {
        elevation: 8,
        transform: [{ scale: 1.05 }, { translateY: -5 }],
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        transform: [{ scale: 1.05 }, { translateY: -5 }],
      },
      default: {}
    }),
  },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContent: {
    paddingBottom: 5,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
    paddingHorizontal: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(8px)',
    ...Platform.select({
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 10px rgba(255, 255, 255, 0.1)',
      }
    }),
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: 10,
    borderRadius: 20,
    transform: [{ scale: 1 }],
    ...Platform.select({
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(255, 255, 255, 0.15)',
      }
    }),
  },
  profileImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }
    }),
  },
  budgetTitle: {
    fontSize: 20,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: 'white',
  },
  budgetSubtitle: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: 'rgba(255,255,255,0.8)',
  },
  monthSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  monthText: {
    color: 'white',
    marginHorizontal: 10,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    fontSize: 18,
    textAlign: 'center',
  },
  monthNavButton: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 1 }],
    ...Platform.select({
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(255, 255, 255, 0.15)',
      }
    }),
  },
  balanceSection: {
    marginBottom: 16,
    marginTop: 30,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(8px)',
    ...Platform.select({
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 10px rgba(255, 255, 255, 0.1)',
      }
    }),
  },
  balanceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  balanceHeaderItem: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  balanceIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
      }
    }),
  },
  balanceHeaderText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: 'white',
    marginTop: 2,
  },
  balanceValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginVertical: 8,
  },
  balanceValueItem: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  balanceValueCenterItem: {
    flex: 1.2,
    alignItems: 'center',
  },
  balanceAmountSmall: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: 'white',
    textAlign: 'center',
  },
  balanceAmountLarge: {
    fontSize: 28,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  usersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 12,
    marginTop: 6,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'white',
    marginLeft: -10,
  },
  avatarPartner: {
    borderColor: '#FFD700', // Borda dourada para indicar que é um avatar
    borderWidth: 3, // Borda mais espessa
    opacity: 0.85, // Leve opacidade para distinguir
  },
  addUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addUserText: {
    color: 'white',
    fontSize: 18,
  },
  // Section Container
  sectionContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    transform: [{ translateY: 0 }],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      }
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  // Summary Items
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  // Person Expense
  personExpense: {
    marginBottom: 15,
  },
  personExpenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  personName: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
  },
  personAmount: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  // Financial Cards
  summaryCardsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  card: {
    width: 170,
    borderRadius: 16,
    padding: 14,
    paddingHorizontal: 18,
    paddingBottom: 8,
    marginRight: 8,
    height: 120,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      }
    }),
  },
  cardPressed: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        transform: [{ scale: 1.05 }, { translateY: -5 }],
      },
      android: {
        elevation: 8,
        transform: [{ scale: 1.05 }, { translateY: -5 }],
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        transform: [{ scale: 1.05 }, { translateY: -5 }],
      },
      default: {}
    }),
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
    marginBottom: 8,
    flexShrink: 1,
  },
  cardAmount: {
    fontSize: 20,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
    marginBottom: 2,
    flexShrink: 1,
  },
  cardChangePositive: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#4CD964',
    flexShrink: 1,
    flexWrap: 'nowrap',
    marginBottom: 0,
  },
  cardChangeNegative: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#FF3B30',
    flexShrink: 1,
    flexWrap: 'nowrap',
    marginBottom: 0,
  },
  // Bills
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  billIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  billDetails: {
    flex: 1,
  },
  billTitle: {
    fontSize: 15,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
  },
  billDate: {
    fontSize: 13,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  billAmount: {
    fontSize: 15,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  // Transaction
  transactionContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    transform: [{ translateY: 0 }],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      }
    }),
  },
  // Loading and Empty States
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  
  // Transaction Row
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 8,
  },
  amountText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
    marginBottom: 2,
  },
  methodText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },

  rejectButton: {
    // Removido a cor de fundo fixa, será aplicada dinamicamente
  },
  approveButton: {
    // Removido a cor de fundo fixa, será aplicada dinamicamente
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    // Removido a cor de fundo fixa, será aplicada dinamicamente
  },
  // Budget Overview
  overviewContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    transform: [{ translateY: 0 }],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      }
    }),
  },
  overviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginBottom: 5,
  },
  statAmount: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  spentAmount: {
    // Removido referência direta de cor
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 217, 100, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  trackingText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#4CD964',
  },
  // Goals
  goalItem: {
    marginBottom: 15,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
    marginLeft: 8,
  },
  goalPercentage: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  goalAmount: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  goalTarget: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  // Calendar
  calendarPreview: {
    marginTop: 10,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calendarDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  calendarDayToday: {
    backgroundColor: '#f0f0f0',
  },
  calendarDayText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333',
  },
  calendarDayTextToday: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  calendarEvent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 0,
  },
  calendarLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  calendarLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  calendarLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  calendarTransactionIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
  },
  calendarTransactionDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 1,
  },
  // Bottom Navigation
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
  activeNavText: {
    // Removido referência direta de cor
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
    // backgroundColor: themes.feminine.primary, // Removendo a cor estática
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
  cardsScrollContainer: {
    paddingLeft: 16,
    paddingRight: 24,
    marginTop: 16,
    marginBottom: 16,
  },
  // Já definido acima como summaryCardsContainer
  
  // Estilo financialCard já definido acima
  
  cardTitle: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333333',
    marginBottom: 8,
  },
  cardPercentage: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  // Menu Modal Styles
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
  dateSelector: {
    marginTop: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  dateTimeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 8,
    height: 24,
  },
  timelineLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    left: 4,
    right: 4,
    top: 4,
    zIndex: 1,
  },
  dateItem: {
    alignItems: 'center',
    zIndex: 2,
  },
  dateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 10,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: 'white',
    textAlign: 'center',
    marginTop: 2,
  },
  clickableItem: {
    position: 'relative',
    paddingRight: 24,
    backgroundColor: 'rgba(179, 136, 255, 0.05)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 4,
  },
  chevronIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 40,
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
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  currentPhotoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  currentPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#f0f0f0',
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
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    gap: 20,
  },
  photoButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
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
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#ffffff',
  },
  uploadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    height: 100,
  },
  uploadingText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333',
    marginTop: 15,
  },
  webButtonContainer: {
    paddingHorizontal: 10,
    marginTop: 0,
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 40,
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
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  inviteButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
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
  },
  inviteButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333',
  },
  passwordHint: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  optionButtonsContainer: {
    flexDirection: 'column',
    gap: 15,
    marginTop: 20,
  },
  optionButton: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
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
  },
  optionButtonContent: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  optionButtonIcon: {
    marginBottom: 5,
  },
  optionButtonTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#ffffff',
    marginBottom: 4,
  },
  optionButtonSubtitle: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  avatarPhotoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarPhotoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changePhotoButton: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  changePhotoText: {
    color: 'white',
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  photoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  avatarPhotoButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
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
  },
  photoButtonIcon: {
    marginBottom: 5,
  },
  photoButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  successTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  successButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
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
  },
  successButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
}); 