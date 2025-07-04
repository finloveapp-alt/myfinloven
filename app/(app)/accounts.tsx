import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions, 
  Image,
  Platform,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  AppState
} from 'react-native';
import { ArrowLeft, CreditCard, Plus, ChevronRight, Wallet, Landmark, PiggyBank, DollarSign, Users, X, Check, Calendar, Settings, ArrowUpRight, ArrowDownRight, Music, Phone, User, BarChart, Menu, Receipt, PlusCircle, Home, Bell, Info, ExternalLink } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import BottomNavigation from '@/components/BottomNavigation';
import { fontFallbacks } from '@/utils/styles';
import { supabase } from '@/lib/supabase';
import MenuModal from '@/components/MenuModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.85;

// Declaração global para o tema
declare global {
  var dashboardTheme: 'feminine' | 'masculine' | undefined;
}

// Definição dos temas baseados no gênero
const themes = {
  feminine: {
    primary: '#b687fe',
    primaryGradient: ['#b687fe', '#9157ec'],
    secondary: '#0073ea',
    secondaryGradient: ['#0073ea', '#0056b3'],
    card: '#ffffff',
    text: '#333333'
  },
  masculine: {
    primary: '#0073ea',
    primaryGradient: ['#0073ea', '#0056b3'],
    secondary: '#b687fe',
    secondaryGradient: ['#b687fe', '#9157ec'],
    card: '#ffffff',
    text: '#333333'
  }
};

// Função para obter o tema inicial
const getInitialTheme = () => {
  // Verificar primeiro se há um tema global definido
  if (global.dashboardTheme === 'masculine') {
    return themes.masculine;
  }
  
  // Se não houver tema global, usar o tema padrão
  // e depois atualizamos no useEffect
  return themes.feminine; // Tema padrão
};

// Definindo um themeDefault para ser usado no StyleSheet estático
const themeDefault = {
  primary: '#b687fe',
  primaryGradient: ['#b687fe', '#9157ec'],
  secondary: '#0073ea',
  secondaryGradient: ['#0073ea', '#0056b3'],
  card: '#ffffff',
  text: '#333333'
};

// Adicionando interface para contas
interface Account {
  id: string;
  name: string;
  type: string;
  bank: string | null;
  balance: number;
  color: string;
  last_transaction_date: string | null;
  ownership_type: string;
  owner_id: string;
  partner_id: string | null;
  created_at: string;
}

export default function Accounts() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Compartilhadas');
  const [theme, setTheme] = useState(getInitialTheme()); // Iniciar com tema feminino como padrão
  
  // Estados para armazenar usuários e contas
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [userAccounts, setUserAccounts] = useState<{[key: string]: any[]}>({
    'Compartilhadas': [],
    'Pessoal': []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para controlar a visibilidade dos modais
  const [newAccountModalVisible, setNewAccountModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [savingsModalVisible, setSavingsModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false); // Para o modal de menu
  
  // Estados para os formulários de cada modal
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('');
  const [newAccountBank, setNewAccountBank] = useState('');
  const [newAccountInitialBalance, setNewAccountInitialBalance] = useState('');
  
  const [depositAmount, setDepositAmount] = useState('');
  const [depositAccount, setDepositAccount] = useState('');
  
  const [savingsAmount, setSavingsAmount] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [selectedSavingsAccount, setSelectedSavingsAccount] = useState('');

  // Função para formatar valor monetário
  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, '');
    
    // Se não há valor, retorna vazio
    if (!numericValue) return '';
    
    // Converte para número e divide por 100 para ter centavos
    const floatValue = parseFloat(numericValue) / 100;
    
    // Formata como moeda brasileira
    return floatValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para lidar com mudança no valor da poupança
  const handleSavingsAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setSavingsAmount(formatted);
  };

  // Função para lidar com mudança no saldo inicial
  const handleInitialBalanceChange = (text: string) => {
    const formatted = formatCurrency(text);
    setNewAccountInitialBalance(formatted);
  };
  
  const [shareWithPerson, setShareWithPerson] = useState('');
  const [shareAccount, setShareAccount] = useState('');

  // Estado para o modal de detalhes da conta
  const [accountDetailsModalVisible, setAccountDetailsModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  // Estados para o modal de edição da conta
  const [editAccountModalVisible, setEditAccountModalVisible] = useState(false);
  const [editAccountName, setEditAccountName] = useState('');
  const [editAccountType, setEditAccountType] = useState('');
  const [editAccountStatus, setEditAccountStatus] = useState('Ativa');
  const [savingAccount, setSavingAccount] = useState(false);

  // Estado para armazenar dados reais do resumo da conta
  const [accountSummaryData, setAccountSummaryData] = useState<{[key: string]: any}>({});
  
  // Estado para armazenar transações reais da conta
  const [accountTransactions, setAccountTransactions] = useState<{[key: string]: any[]}>({});
  
  // Estado para armazenar avatares
  const [avatars, setAvatars] = useState<any[]>([]);
  
  // Estado para armazenar dados do gráfico
  const [chartData, setChartData] = useState<{[key: string]: any[]}>({});

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

  // useEffect para carregar o tema com base no gênero do usuário
  useEffect(() => {
    // Buscar informações do usuário atual
    fetchUserTheme();
    fetchUsersAndAccounts();
    fetchAvatars();
  }, []);
  
  // Função para buscar avatares criados pelo usuário atual
  const fetchAvatars = async () => {
    try {
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.log('Usuário não autenticado');
        return;
      }

      const { data: avatarsData, error } = await supabase
        .from('couples')
        .select('id, avatar_name, avatar_photo_url')
        .eq('is_avatar', true)
        .eq('user1_id', session.user.id);

      if (error) throw error;

      setAvatars(avatarsData || []);
    } catch (error) {
      console.error('Erro ao buscar avatares:', error);
    }
  };

  // Função para buscar dados do gráfico para uma conta específica
  const fetchAccountChartData = async (accountId: string) => {
    try {
      const data = await generateChartData(accountId);
      setChartData(prev => ({
        ...prev,
        [accountId]: data
      }));
    } catch (error) {
      console.error('Erro ao buscar dados do gráfico:', error);
    }
  };

  // Função para buscar últimas transações reais da conta
  const fetchAccountTransactions = async (accountId: string) => {
    try {
      // Buscar últimas 5 transações até a data atual
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', accountId)
        .lte('transaction_date', new Date().toISOString().split('T')[0])
        .order('transaction_date', { ascending: false })
        .limit(5);

      if (error) throw error;

      // Armazenar transações no estado
      setAccountTransactions(prev => ({
        ...prev,
        [accountId]: transactions || []
      }));

    } catch (error) {
      console.error('Erro ao buscar transações da conta:', error);
    }
  };

  // Função para buscar dados reais do resumo da conta
  const fetchAccountSummary = async (accountId: string) => {
    try {
      // Buscar receitas recebidas
      const { data: incomes, error: incomesError } = await supabase
        .from('incomes')
        .select('amount')
        .eq('account_id', accountId)
        .eq('is_received', true)
        .lte('receipt_date', new Date().toISOString().split('T')[0]);

      if (incomesError) throw incomesError;

      // Buscar transações (receitas e despesas)
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount, transaction_type')
        .eq('account_id', accountId)
        .lte('transaction_date', new Date().toISOString().split('T')[0]);

      if (transactionsError) throw transactionsError;

      // Buscar poupanças
      const { data: savings, error: savingsError } = await supabase
        .from('savings')
        .select('amount')
        .eq('account_id', accountId);

      if (savingsError) throw savingsError;

      // Calcular totais
      let totalIncomes = 0;
      let totalExpenses = 0;
      let totalSavings = 0;

      // Somar receitas da tabela incomes
      incomes?.forEach(income => {
        totalIncomes += parseFloat(income.amount) || 0;
      });

      // Somar transações
      transactions?.forEach(transaction => {
        const amount = parseFloat(transaction.amount) || 0;
        if (transaction.transaction_type === 'income') {
          totalIncomes += amount;
        } else if (transaction.transaction_type === 'expense') {
          totalExpenses += Math.abs(amount);
        }
      });

      // Somar poupanças
      savings?.forEach(saving => {
        totalSavings += parseFloat(saving.amount) || 0;
      });

      // Armazenar dados no estado
      setAccountSummaryData(prev => ({
        ...prev,
        [accountId]: {
          income: totalIncomes,
          expense: totalExpenses,
          savings: totalSavings
        }
      }));

    } catch (error) {
      console.error('Erro ao buscar resumo da conta:', error);
    }
  };

  // Função para buscar usuários e suas contas
  const fetchUsersAndAccounts = async () => {
    try {
      setIsLoading(true);
      
      // Obter a sessão atual para identificar o usuário logado
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao obter sessão:', sessionError);
        setIsLoading(false);
        return;
      }
      
      if (!session?.user) {
        console.log('Nenhuma sessão de usuário encontrada');
        setIsLoading(false);
        return;
      }
      
      const currentUserId = session.user.id;
      
      // Buscar o usuário atual
      const { data: currentUserData, error: currentUserError } = await supabase
        .from('profiles')
        .select('id, name, profile_picture_url, gender')
        .eq('id', currentUserId)
        .single();
        
      if (currentUserError) {
        console.error('Erro ao buscar usuário atual:', currentUserError);
        setIsLoading(false);
        return;
      }
      
      setCurrentUser(currentUserData);
      
      // Buscar relacionamentos do usuário atual na tabela couples
      const { data: couplesData, error: couplesError } = await supabase
        .from('couples')
        .select('*')
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`);
      
      if (couplesError) {
        console.error('Erro ao buscar relacionamentos:', couplesError);
        setIsLoading(false);
        return;
      }
      
      // Extrair IDs dos parceiros do usuário atual
      const relatedUserIds = new Set<string>();
      const relatedUsers: any[] = [];
      
      if (couplesData && couplesData.length > 0) {
        // Obter todos os IDs de parceiros
        const partnerIds = couplesData.map(couple => 
          couple.user1_id === currentUserId ? couple.user2_id : couple.user1_id
        ).filter(id => id !== null);
        
        // Buscar perfis dos parceiros
        if (partnerIds.length > 0) {
          const { data: partnerProfiles, error: partnersError } = await supabase
            .from('profiles')
            .select('id, name, profile_picture_url, gender, email')
            .in('id', partnerIds);
            
          if (partnersError) {
            console.error('Erro ao buscar perfis dos parceiros:', partnersError);
          } else if (partnerProfiles) {
            console.log('Perfis dos parceiros:', partnerProfiles);
            // Adicionar usuários únicos à lista
            partnerProfiles.forEach(profile => {
              if (!relatedUserIds.has(profile.id)) {
                relatedUserIds.add(profile.id);
                relatedUsers.push(profile);
              }
            });
          }
        }
      }
      
      console.log(`Encontrados ${relatedUsers.length} usuários relacionados`);
      setUsers(relatedUsers);
      
      // Buscar todas as contas do usuário atual (próprias e compartilhadas)
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select(`
          *,
          avatar:avatar_id(id, avatar_name)
        `)
        .or(`owner_id.eq.${currentUserId},partner_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });
      
      if (accountsError) {
        console.error('Erro ao buscar contas:', accountsError);
        setIsLoading(false);
        return;
      }

      // Buscar contas dos avatares do usuário
      let avatarAccountsData = [];
      if (avatars.length > 0) {
        const avatarIds = avatars.map(avatar => avatar.id);
        const { data: avatarAccounts, error: avatarAccountsError } = await supabase
          .from('accounts')
          .select(`
            *,
            avatar:avatar_id(id, avatar_name)
          `)
          .in('avatar_id', avatarIds)
          .order('created_at', { ascending: false });

        if (avatarAccountsError) {
          console.error('Erro ao buscar contas dos avatares:', avatarAccountsError);
        } else {
          avatarAccountsData = avatarAccounts || [];
        }
      }

      // Combinar todas as contas
      const allAccountsData = [...(accountsData || []), ...avatarAccountsData];
      
      console.log('Contas recuperadas:', allAccountsData);
      
      // Organizar contas por tipo de propriedade (compartilhadas ou individuais)
      const accountsByUser: {[key: string]: any[]} = {
        'Compartilhadas': [],
        'Pessoal': []
      };
      
      // Adicionar usuários atuais ao objeto de contas
      if (currentUserData) {
        accountsByUser[currentUserData.name || 'Você'] = [];
      }
      
      // Adicionar parceiros ao objeto de contas
      relatedUsers.forEach(user => {
        if (user.name) {
          accountsByUser[user.name] = [];
        }
      });

      // Adicionar avatares ao objeto de contas
      avatars.forEach(avatar => {
        if (avatar.avatar_name) {
          accountsByUser[avatar.avatar_name] = [];
        }
      });
      
      // Distribuir as contas nas categorias apropriadas
      if (allAccountsData) {
        allAccountsData.forEach((account: Account) => {
          // Processar contas para exibição
          const processedAccount = {
            id: account.id,
            name: account.name,
            type: account.type,
            bank: account.bank || '',
            balance: `R$ ${account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: getAccountIcon(account.type),
            color: account.color || getRandomColorForType(account.type),
            status: account.status || 'Ativa',
            lastTransaction: account.last_transaction_date 
              ? new Date(account.last_transaction_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
              : new Date(account.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
          };
          
          if (account.ownership_type === 'compartilhada') {
            // Adicionar à categoria compartilhadas
            accountsByUser['Compartilhadas'].push(processedAccount);
          } else {
            // Contas individuais - verificar se pertence a um avatar ou usuário
            const isOwner = account.owner_id === currentUserId;
            
            // Verificar se a conta pertence a um avatar
            if (account.avatar && account.avatar.avatar_name) {
              // Conta pertence a um avatar
              if (!accountsByUser[account.avatar.avatar_name]) {
                accountsByUser[account.avatar.avatar_name] = [];
              }
              accountsByUser[account.avatar.avatar_name].push(processedAccount);
            } else {
              // Conta pertence a um usuário
              const ownerProfile = isOwner ? currentUserData : relatedUsers.find(u => u.id === account.owner_id);
              
              if (ownerProfile && ownerProfile.name) {
                if (!accountsByUser[ownerProfile.name]) {
                  accountsByUser[ownerProfile.name] = [];
                }
                accountsByUser[ownerProfile.name].push(processedAccount);
                
                // Se a conta pertence ao usuário atual, adicionar também na categoria "Pessoal"
                if (isOwner) {
                  accountsByUser['Pessoal'].push(processedAccount);
                }
              }
            }
          }
        });
      }
      
      // Se não houver contas compartilhadas, usar uma mensagem amigável
      if (accountsByUser['Compartilhadas'].length === 0) {
        // Manter o array vazio para exibir a mensagem de "sem contas"
      }
      
      // Se não houver contas individuais para o usuário atual
      if (currentUserData && accountsByUser[currentUserData.name || 'Você']?.length === 0) {
        // Manter o array vazio para exibir a mensagem de "sem contas"
      }
      
      setUserAccounts(accountsByUser);
      
      // Definir a primeira aba ativa
      if (accountsByUser['Pessoal'] && accountsByUser['Pessoal'].length > 0) {
        // Se houver contas pessoais, mostrar a aba Pessoal primeiro
        setActiveTab('Pessoal');
      } else if (accountsByUser['Compartilhadas'] && accountsByUser['Compartilhadas'].length > 0) {
        // Se houver contas compartilhadas, mostrar a aba Compartilhadas
        setActiveTab('Compartilhadas');
      } else if (relatedUsers && relatedUsers.length > 0) {
        // Se não houver contas próprias, mas houver usuários relacionados, mostrar a aba do primeiro usuário
        setActiveTab(relatedUsers[0].name);
      } else if (currentUserData && currentUserData.name) {
        // Se não houver outras opções, mostrar o nome do usuário atual
        setActiveTab(currentUserData.name);
      } else {
        // Caso extremo - sem nome de usuário
        setActiveTab('Compartilhadas');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao buscar usuários e contas:', error);
      setIsLoading(false);
    }
  };
  
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
          updateTheme('masculine');
        } else if (gender === 'feminino' || gender === 'mulher' || gender === 'female' || gender === 'f') {
          console.log('Aplicando tema feminino (rosa) com base no perfil');
          updateTheme('feminine');
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
    } catch (error) {
      console.error('Erro ao definir tema:', error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Dados fictícios para as contas
  const sharedAccounts = [
    {
      id: '1',
      name: 'Conta Conjunta',
      type: 'Conta Corrente',
      bank: 'Nubank',
      balance: 'R$ 3.457,82',
      icon: <Landmark size={24} color="#fff" />,
      color: '#8A5CF6',
      lastTransaction: '14 julho, 2023'
    },
    {
      id: '2',
      name: 'Poupança Casal',
      type: 'Poupança',
      bank: 'Banco do Brasil',
      balance: 'R$ 12.500,00',
      icon: <PiggyBank size={24} color="#fff" />,
      color: '#5896FF',
      lastTransaction: '22 junho, 2023'
    },
    {
      id: '3',
      name: 'Reserva Emergência',
      type: 'Investimento',
      bank: 'XP Investimentos',
      balance: 'R$ 25.780,45',
      icon: <DollarSign size={24} color="#fff" />,
      color: '#4CD964',
      lastTransaction: '05 maio, 2023'
    }
  ];
  
  const mariaAccounts = [
    {
      id: '4',
      name: 'Conta Pessoal',
      type: 'Conta Corrente',
      bank: 'Itaú',
      balance: 'R$ 2.124,35',
      icon: <Landmark size={24} color="#fff" />,
      color: themeDefault.primary,
      lastTransaction: '18 julho, 2023'
    },
    {
      id: '5',
      name: 'Minha Carteira',
      type: 'Dinheiro Físico',
      bank: '',
      balance: 'R$ 350,00',
      icon: <Wallet size={24} color="#fff" />,
      color: '#FF5A6E',
      lastTransaction: '20 julho, 2023'
    }
  ];
  
  const joaoAccounts = [
    {
      id: '6',
      name: 'Conta Pessoal',
      type: 'Conta Corrente',
      bank: 'Santander',
      balance: 'R$ 1.875,60',
      icon: <Landmark size={24} color="#fff" />,
      color: '#0073ea',
      lastTransaction: '15 julho, 2023'
    },
    {
      id: '7',
      name: 'Minha Carteira',
      type: 'Dinheiro Físico',
      bank: '',
      balance: 'R$ 280,00',
      icon: <Wallet size={24} color="#fff" />,
      color: '#FFB300',
      lastTransaction: '19 julho, 2023'
    }
  ];
  
  // Determina quais contas exibir com base na aba selecionada
  const displayAccounts = () => {
    if (isLoading) return [];
    
    const accounts = userAccounts[activeTab] || [];
    
    // Se não houver contas, retornar um array vazio
    // A renderização condicional será tratada na UI
    return accounts;
  };
  
  // Calcula o saldo total das contas exibidas
  const calculateTotalBalance = (accounts: Array<{balance: string}>) => {
    return accounts.reduce((total: number, account: {balance: string}) => {
      const balanceValue = parseFloat(account.balance.replace('R$ ', '').replace('.', '').replace(',', '.'));
      return total + balanceValue;
    }, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Função para criar uma nova conta
  const handleAddNewAccount = async () => {
    // Validação básica
    if (!newAccountName || !newAccountType) {
      Alert.alert('Erro', 'Por favor preencha pelo menos o nome e o tipo da conta.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Converter valor do saldo para número
      let initialBalance = 0;
      if (newAccountInitialBalance) {
        // Remover formatação de moeda e converter para número
        initialBalance = parseFloat(newAccountInitialBalance.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
      }
      
      // Determinar o tipo de propriedade e avatar com base na aba selecionada
      let ownershipType = 'individual';
      let partnerId = null;
      let avatarId = null;
      
      // Verificar se é um avatar selecionado
      const selectedAvatar = avatars.find(avatar => avatar.avatar_name === activeTab);
      
      if (activeTab === 'Compartilhadas') {
        ownershipType = 'compartilhada';
        // Se houver um parceiro, usar como partner_id
        if (users.length > 0) {
          partnerId = users[0].id;
        }
      } else if (activeTab === 'Pessoal') {
        // Explicitamente definir como conta individual pessoal
        ownershipType = 'individual';
        partnerId = null;
      } else if (selectedAvatar) {
        // Conta será vinculada ao avatar
        ownershipType = 'individual';
        avatarId = selectedAvatar.id;
      }
      
      // Obter sessão atual para ID do usuário
      const { data: { session } } = await supabase.auth.getSession();
      const ownerId = session?.user?.id;
      
      if (!ownerId) {
        Alert.alert('Erro', 'Sessão expirada. Por favor, faça login novamente.');
        setIsLoading(false);
        return;
      }
      
      // Cor aleatória baseada no tipo de conta
      const color = getRandomColorForType(newAccountType);
      
      // Criar a conta no Supabase
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          name: newAccountName,
          type: newAccountType,
          bank: newAccountBank || null,
          balance: initialBalance,
          initial_balance: initialBalance,
          ownership_type: ownershipType,
          color: color,
          owner_id: ownerId,
          partner_id: partnerId,
          avatar_id: avatarId
        })
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar conta:', error);
        Alert.alert('Erro', `Não foi possível criar a conta: ${error.message}`);
        setIsLoading(false);
        return;
      }
      
      console.log('Conta criada com sucesso:', data);
      
      // Limpar o formulário e fechar o modal imediatamente
      setNewAccountName('');
      setNewAccountType('');
      setNewAccountBank('');
      setNewAccountInitialBalance('');
      setNewAccountModalVisible(false);
      
      // Recarregar contas para mostrar a nova conta
      await fetchUsersAndAccounts();
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Erro ao processar criação de conta:', error);
      Alert.alert('Erro', error.message || 'Ocorreu um erro ao criar a conta.');
      setIsLoading(false);
    }
  };

  // Função para processar depósito
  const handleDeposit = () => {
    if (!depositAmount || !depositAccount) {
      Alert.alert('Erro', 'Por favor selecione uma conta e informe o valor.');
      return;
    }

    Alert.alert(
      'Depósito Registrado',
      `Depósito de R$ ${depositAmount} na conta ${depositAccount} registrado com sucesso!`,
      [
        {
          text: 'OK',
          onPress: () => {
            setDepositAmount('');
            setDepositAccount('');
            setDepositModalVisible(false);
          }
        }
      ]
    );
  };

  // Função para criar poupança ou transferir para poupança
  const handleSavings = async () => {
    if (!savingsAmount) {
      Alert.alert('Erro', 'Por favor informe o valor que deseja poupar.');
      return;
    }

    if (!selectedSavingsAccount) {
      Alert.alert('Erro', 'Por favor selecione uma conta para vincular a poupança.');
      return;
    }

    try {
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      // Encontrar a conta selecionada
      const allAccounts = displayAccounts();
      const selectedAccountDisplay = allAccounts.find(account => account.name === selectedSavingsAccount);
      
      if (!selectedAccountDisplay) {
        Alert.alert('Erro', 'Conta selecionada não encontrada');
        return;
      }

      // Buscar o saldo atual real da conta no banco de dados
      const { data: accountData, error: accountError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', selectedAccountDisplay.id)
        .single();

      if (accountError || !accountData) {
        Alert.alert('Erro', 'Não foi possível obter o saldo atual da conta');
        return;
      }

      const currentBalance = parseFloat(accountData.balance) || 0;

      // Converter valor para número
      const amount = parseFloat(savingsAmount.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
      
      if (amount <= 0) {
        Alert.alert('Erro', 'Valor inválido');
        return;
      }

      // Verificar se há saldo suficiente
      if (currentBalance < amount) {
        Alert.alert('Erro', 'Saldo insuficiente na conta selecionada');
        return;
      }

      // Calcular novo saldo
      const newBalance = currentBalance - amount;

      // Salvar poupança no banco
      const { error: savingsError } = await supabase
        .from('savings')
        .insert({
          account_id: selectedAccountDisplay.id,
          amount: amount,
          goal: savingsGoal || null,
          owner_id: session.user.id
        });

      if (savingsError) {
        throw savingsError;
      }

      // Atualizar o saldo da conta (subtraindo o valor poupado)
      const { error: updateError } = await supabase
        .from('accounts')
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAccountDisplay.id);

      if (updateError) {
        throw updateError;
      }

      // Fechar modal imediatamente
      setSavingsAmount('');
      setSavingsGoal('');
      setSelectedSavingsAccount('');
      setSavingsModalVisible(false);
      
      // Recarregar as contas para refletir mudanças
      fetchUsersAndAccounts();
    } catch (error) {
      console.error('Erro ao salvar poupança:', error);
      Alert.alert('Erro', 'Não foi possível salvar a poupança');
    }
  };

  // Função para compartilhar conta
  const handleShareAccount = () => {
    if (!shareAccount || !shareWithPerson) {
      Alert.alert('Erro', 'Por favor selecione uma conta e com quem deseja compartilhar.');
      return;
    }

    Alert.alert(
      'Conta Compartilhada',
      `A conta ${shareAccount} foi compartilhada com ${shareWithPerson} com sucesso!`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShareAccount('');
            setShareWithPerson('');
            setShareModalVisible(false);
          }
        }
      ]
    );
  };

  // Função para determinar o nome da outra pessoa com base no usuário atual
  const getOtherPersonName = () => {
    if (users.length === 0 || activeTab === 'Compartilhadas') {
      return currentUser?.name || 'Você';
    }
    
    // Se estiver na aba do parceiro, retornar o nome do usuário atual
    if (activeTab === users[0].name) {
      return currentUser?.name || 'Você';
    }
    
    // Se estiver na aba do usuário atual ou compartilhada, retornar o nome do parceiro
    return users[0].name || 'Parceiro';
  };

  // Buscar transações da conta (reais ou fictícias)
  const getAccountTransactions = (accountId: string) => {
    // Verificar se temos transações reais para esta conta
    if (accountTransactions[accountId] && accountTransactions[accountId].length > 0) {
      return accountTransactions[accountId].map(transaction => ({
        id: transaction.id,
        title: transaction.description,
        category: transaction.category || 'Geral',
        date: new Date(transaction.transaction_date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }),
        amount: parseFloat(transaction.amount),
        type: transaction.transaction_type,
        icon: transaction.icon ? <Text>{transaction.icon}</Text> : <DollarSign size={20} color="#fff" />,
        iconBg: transaction.transaction_type === 'income' ? '#4CD964' : '#FF3B30',
        person: 'Você'
      }));
    }

    // Fallback para dados fictícios se não houver dados reais
    // Nomes dos usuários para as transações
    const mainUserName = currentUser?.name || 'Você';
    const partnerName = users.length > 0 ? users[0].name : 'Parceiro';
    
    const transactionsData = {
      '1': [ // Conta Conjunta
        { id: 't1', title: 'Spotify Premium', category: 'Assinatura', date: '28 Janeiro 2023', amount: -85.00, type: 'expense', icon: <Music size={20} color="#fff" />, iconBg: '#1ED760', person: mainUserName },
        { id: 't2', title: 'Operadora Celular', category: 'Serviços', date: '25 Janeiro 2023', amount: 250.00, type: 'income', icon: <Phone size={20} color="#fff" />, iconBg: '#0073EA', person: partnerName },
        { id: 't3', title: 'Salário', category: 'Renda', date: '21 Janeiro 2023', amount: 5400.00, type: 'income', icon: <DollarSign size={20} color="#fff" />, iconBg: '#4CD964', person: mainUserName },
      ],
      '2': [ // Poupança Casal
        { id: 't4', title: 'Transferência', category: 'Poupança', date: '22 Janeiro 2023', amount: 1000.00, type: 'income', icon: <ArrowUpRight size={20} color="#fff" />, iconBg: '#4CD964', person: partnerName },
        { id: 't5', title: 'Rendimento', category: 'Juros', date: '15 Janeiro 2023', amount: 62.50, type: 'income', icon: <DollarSign size={20} color="#fff" />, iconBg: '#FFB300', person: 'Sistema' },
      ],
      '3': [ // Reserva Emergência
        { id: 't6', title: 'Transferência', category: 'Investimento', date: '05 Janeiro 2023', amount: 1500.00, type: 'income', icon: <ArrowUpRight size={20} color="#fff" />, iconBg: '#4CD964', person: mainUserName },
      ],
      '4': [ // Conta Pessoal usuário atual
        { id: 't7', title: 'Farmácia', category: 'Saúde', date: '18 Janeiro 2023', amount: -127.35, type: 'expense', icon: <DollarSign size={20} color="#fff" />, iconBg: '#FF3B30', person: mainUserName },
        { id: 't8', title: 'Salário', category: 'Renda', date: '15 Janeiro 2023', amount: 4200.00, type: 'income', icon: <DollarSign size={20} color="#fff" />, iconBg: '#4CD964', person: mainUserName },
      ],
      '5': [ // Carteira usuário atual
        { id: 't9', title: 'Saque', category: 'Transferência', date: '20 Janeiro 2023', amount: 350.00, type: 'income', icon: <ArrowUpRight size={20} color="#fff" />, iconBg: '#4CD964', person: mainUserName },
      ],
      '6': [ // Conta Pessoal parceiro
        { id: 't10', title: 'Restaurante', category: 'Alimentação', date: '15 Janeiro 2023', amount: -78.90, type: 'expense', icon: <DollarSign size={20} color="#fff" />, iconBg: '#FF3B30', person: partnerName },
        { id: 't11', title: 'Salário', category: 'Renda', date: '10 Janeiro 2023', amount: 3800.00, type: 'income', icon: <DollarSign size={20} color="#fff" />, iconBg: '#4CD964', person: partnerName },
      ],
      '7': [ // Carteira parceiro
        { id: 't12', title: 'Saque', category: 'Transferência', date: '19 Janeiro 2023', amount: 280.00, type: 'income', icon: <ArrowUpRight size={20} color="#fff" />, iconBg: '#4CD964', person: partnerName },
      ],
    };
    
    return transactionsData[accountId as keyof typeof transactionsData] || [];
  };
  
  // Calcular totais para o resumo financeiro
  const getAccountSummary = (accountId: string) => {
    // Verificar se temos dados reais para esta conta
    if (accountSummaryData[accountId]) {
      return accountSummaryData[accountId];
    }

    // Fallback para dados mock se não houver dados reais
    const transactions = getAccountTransactions(accountId);
    
    let income = 0;
    let expense = 0;
    let savings = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        income += transaction.amount;
        if (transaction.category === 'Poupança' || transaction.category === 'Investimento') {
          savings += transaction.amount;
        }
      } else if (transaction.type === 'expense') {
        expense += Math.abs(transaction.amount);
      }
    });
    
    return {
      balance: income - expense,
      income,
      expense,
      savings
    };
  };
  
  // Calcular gastos por pessoa para contas compartilhadas
  const getExpensesByPerson = (accountId: string) => {
    const transactions = getAccountTransactions(accountId);
    const mainUserName = currentUser?.name || 'Você';
    const partnerName = users.length > 0 ? users[0].name : 'Parceiro';
    
    const expenseData: {[key: string]: number} = {
      [mainUserName]: 0,
      [partnerName]: 0
    };
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense' && (transaction.person === mainUserName || transaction.person === partnerName)) {
        expenseData[transaction.person] += Math.abs(transaction.amount);
      }
    });
    
    return expenseData;
  };

  // Função para obter dados do gráfico de uma conta específica
  const getAccountChartData = (accountId: string) => {
    return chartData[accountId] || [
      { day: 'Sáb', debit: 0, credit: 0 },
      { day: 'Dom', debit: 0, credit: 0 },
      { day: 'Seg', debit: 0, credit: 0 },
      { day: 'Ter', debit: 0, credit: 0 },
      { day: 'Qua', debit: 0, credit: 0 },
      { day: 'Qui', debit: 0, credit: 0 },
      { day: 'Sex', debit: 0, credit: 0 }
    ];
  };
  
  // Abrir modal de detalhes da conta
  const handleOpenAccountDetails = (account: any) => {
    setSelectedAccount(account);
    setAccountDetailsModalVisible(true);
    // Buscar dados reais do resumo da conta
    fetchAccountSummary(account.id);
    // Buscar últimas transações da conta
    fetchAccountTransactions(account.id);
    // Buscar dados do gráfico da conta
    fetchAccountChartData(account.id);
  };

  const handleOpenEditAccount = () => {
    if (selectedAccount) {
      setEditAccountName(selectedAccount.name);
      setEditAccountType(selectedAccount.type);
      setEditAccountStatus(selectedAccount.status || 'Ativa');
      setEditAccountModalVisible(true);
    }
  };

  const handleSaveAccountChanges = async () => {
    console.log('handleSaveAccountChanges chamada');
    console.log('selectedAccount:', selectedAccount);
    console.log('editAccountName:', editAccountName);
    console.log('editAccountType:', editAccountType);
    
    if (!selectedAccount) {
      Alert.alert('Erro', 'Nenhuma conta selecionada');
      return;
    }

    if (!editAccountName.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha o nome da conta');
      return;
    }

    if (!editAccountType.trim()) {
      Alert.alert('Atenção', 'Por favor, selecione o tipo da conta');
      return;
    }

    setSavingAccount(true);

    try {
      console.log('Tentando atualizar conta no Supabase...');
      
      // Atualizar a conta no Supabase
      const { data, error } = await supabase
        .from('accounts')
        .update({
          name: editAccountName.trim(),
          type: editAccountType,
          status: editAccountStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedAccount.id)
        .select();

      console.log('Resposta do Supabase:', { data, error });

      if (error) {
        throw error;
      }

      console.log('Conta atualizada com sucesso!');

      // Fechar modais imediatamente
      setEditAccountModalVisible(false);
      setAccountDetailsModalVisible(false);
      
      // Atualizar as informações localmente
      setSelectedAccount({
        ...selectedAccount,
        name: editAccountName.trim(),
        type: editAccountType,
        status: editAccountStatus
      });
      
      // Recarregar as contas
      fetchUsersAndAccounts();
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      Alert.alert('Erro', `Não foi possível atualizar a conta: ${error.message}`);
    } finally {
      setSavingAccount(false);
    }
  };
  
  // Função utilitária para criar uma cor de fundo semitransparente com base na cor do tema
  const getThemeBackgroundColor = (color: string, opacity: number) => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  // Gerar dados para o gráfico de débito e crédito a partir do Supabase
  const generateChartData = async (accountId: string) => {
    try {
      // Buscar transações dos últimos 7 dias para a conta específica
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('account_id', accountId)
        .gte('transaction_date', sevenDaysAgo.toISOString())
        .order('transaction_date', { ascending: true });

      if (error) {
        console.error('Erro ao buscar transações para o gráfico:', error);
        // Retornar dados padrão em caso de erro
        return [
          { day: 'Sáb', debit: 0, credit: 0 },
          { day: 'Dom', debit: 0, credit: 0 },
          { day: 'Seg', debit: 0, credit: 0 },
          { day: 'Ter', debit: 0, credit: 0 },
          { day: 'Qua', debit: 0, credit: 0 },
          { day: 'Qui', debit: 0, credit: 0 },
          { day: 'Sex', debit: 0, credit: 0 }
        ];
      }

      // Criar um mapeamento dos últimos 7 dias
      const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const chartData = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = daysOfWeek[date.getDay()];
        
        // Filtrar transações do dia específico
        const dayTransactions = transactions?.filter(transaction => {
          const transactionDate = new Date(transaction.transaction_date);
          return transactionDate.toDateString() === date.toDateString();
        }) || [];
        
        // Calcular débito e crédito do dia
        let debitTotal = 0;
        let creditTotal = 0;
        
        dayTransactions.forEach(transaction => {
          const amount = Math.abs(parseFloat(transaction.amount));
          if (transaction.payment_method === 'Débito') {
            debitTotal += amount;
          } else if (transaction.payment_method === 'Crédito') {
            creditTotal += amount;
          }
        });
        
        chartData.push({
          day: dayName,
          debit: debitTotal,
          credit: creditTotal
        });
      }
      
      return chartData;
    } catch (error) {
      console.error('Erro ao gerar dados do gráfico:', error);
      // Retornar dados padrão em caso de erro
      return [
        { day: 'Sáb', debit: 0, credit: 0 },
        { day: 'Dom', debit: 0, credit: 0 },
        { day: 'Seg', debit: 0, credit: 0 },
        { day: 'Ter', debit: 0, credit: 0 },
        { day: 'Qua', debit: 0, credit: 0 },
        { day: 'Qui', debit: 0, credit: 0 },
        { day: 'Sex', debit: 0, credit: 0 }
      ];
    }
  };
  
  // Obter dados do gráfico para a conta selecionada
  const accountChartData = selectedAccount ? getAccountChartData(selectedAccount.id) : [];
  const maxChartValue = Math.max(...accountChartData.map(item => Math.max(item.debit, item.credit)), 1);

  // Função auxiliar para obter ícone com base no tipo de conta
  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'Conta Corrente':
        return <Landmark size={24} color="#fff" />;
      case 'Poupança':
        return <PiggyBank size={24} color="#fff" />;
      case 'Investimento':
        return <DollarSign size={24} color="#fff" />;
      case 'Dinheiro Físico':
        return <Wallet size={24} color="#fff" />;
      default:
        return <CreditCard size={24} color="#fff" />;
    }
  };

  // Função para gerar cores aleatórias com base no tipo de conta
  const getRandomColorForType = (type: string) => {
    switch (type) {
      case 'Conta Corrente':
        return '#8A5CF6';
      case 'Poupança':
        return '#5896FF';
      case 'Investimento':
        return '#4CD964';
      case 'Dinheiro Físico':
        return '#FF5A6E';
      default:
        return '#0073ea';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Cabeçalho unificado com degradê */}
      <LinearGradient
        colors={theme.primaryGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.unifiedHeader}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contas</Text>
        </View>
        
        <View style={styles.balanceContent}>
          <Text style={styles.balanceLabel}>Saldo Total</Text>
          <Text style={styles.balanceAmount}>
            {isLoading ? 'Carregando...' : `R$ ${calculateTotalBalance(displayAccounts())}`}
          </Text>
          <Text style={styles.balanceSubtext}>
            {isLoading 
              ? 'Carregando contas...' 
              : `${displayAccounts().length} Contas • ${activeTab}`
            }
          </Text>
        </View>
      </LinearGradient>

      {/* Account Type Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {/* Tab Compartilhadas */}
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'Compartilhadas' && [
                styles.activeTab,
                { backgroundColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.1)` }
              ]
            ]}
            onPress={() => setActiveTab('Compartilhadas')}
          >
            <Users size={18} color={activeTab === 'Compartilhadas' ? theme.primary : '#777'} />
            <Text style={[
              styles.tabText,
              activeTab === 'Compartilhadas' && { color: theme.primary }
            ]}>Compartilhadas</Text>
          </TouchableOpacity>
          
          {/* Tab Pessoal */}
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'Pessoal' && [
                styles.activeTab,
                { backgroundColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.1)` }
              ]
            ]}
            onPress={() => setActiveTab('Pessoal')}
          >
            <Wallet size={18} color={activeTab === 'Pessoal' ? theme.primary : '#777'} />
            <Text style={[
              styles.tabText,
              activeTab === 'Pessoal' && { color: theme.primary }
            ]}>Pessoal</Text>
          </TouchableOpacity>
          
          {/* Renderização dinâmica das abas de usuários */}
          {!isLoading && users.length > 0 ? (
            users.map((user) => (
              <TouchableOpacity 
                key={user.id}
                style={[
                  styles.tab, 
                  activeTab === user.name && [
                    styles.activeTab,
                    { backgroundColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.1)` }
                  ]
                ]}
                onPress={() => setActiveTab(user.name)}
              >
                <Image 
                  source={{ 
                    uri: user.profile_picture_url
                         ? user.profile_picture_url
                         : (user.gender?.toLowerCase().includes('f') 
                           ? 'https://randomuser.me/api/portraits/women/44.jpg' 
                           : 'https://randomuser.me/api/portraits/men/42.jpg') 
                  }}
                  style={styles.tabAvatar}
                />
                <Text style={[
                  styles.tabText,
                  activeTab === user.name && { color: theme.primary }
                ]}>{user.name || 'Avatar'}</Text>
              </TouchableOpacity>
            ))
          ) : !isLoading && (
            <View style={styles.emptyRelationshipContainer}>
              <Text style={styles.emptyRelationshipText}>
                Você ainda não tem relacionamentos.
              </Text>
            </View>
          )}

          {/* Renderização dinâmica das abas de avatares */}
          {!isLoading && avatars.length > 0 && (
            avatars.map((avatar) => (
              <TouchableOpacity 
                key={avatar.id}
                style={[
                  styles.tab, 
                  activeTab === avatar.avatar_name && [
                    styles.activeTab,
                    { backgroundColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.1)` }
                  ]
                ]}
                onPress={() => setActiveTab(avatar.avatar_name)}
              >
                <Image 
                  source={{ 
                    uri: avatar.avatar_photo_url || 'https://randomuser.me/api/portraits/lego/1.jpg'
                  }}
                  style={styles.tabAvatar}
                />
                <Text style={[
                  styles.tabText,
                  activeTab === avatar.avatar_name && { color: theme.primary }
                ]}>{avatar.avatar_name}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Account Cards */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, {color: theme.primary}]}>Carregando contas...</Text>
          </View>
        ) : (
          <>
            <View style={styles.accountsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Suas Contas</Text>
                
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => {
                    setActiveTab('Pessoal'); // Define 'Pessoal' como proprietário padrão
                    setNewAccountModalVisible(true);
                  }}
                >
                  <Plus size={18} color={theme.primary} />
                  <Text style={[styles.addButtonText, { color: theme.primary }]}>Adicionar Conta</Text>
                </TouchableOpacity>
              </View>

              {displayAccounts().length > 0 ? (
                displayAccounts().map((account) => (
                  <TouchableOpacity 
                    key={account.id} 
                    style={styles.accountCard}
                    onPress={() => handleOpenAccountDetails(account)}
                  >
                    <View style={[styles.accountIcon, { backgroundColor: account.color }]}>
                      {account.icon}
                    </View>
                    
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountName}>{account.name}</Text>
                      <Text style={styles.accountType}>
                        {account.type}{account.bank ? ` • ${account.bank}` : ''}
                      </Text>
                      <Text style={styles.accountDate}>
                        Última transação: {account.lastTransaction}
                      </Text>
                    </View>
                    
                    <View style={styles.accountBalance}>
                      <Text style={styles.accountBalanceText}>{account.balance}</Text>
                      <ChevronRight size={16} color="#999" />
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyAccountsContainer}>
                  <Text style={styles.emptyAccountsText}>
                    Nenhuma conta encontrada. Adicione uma nova conta clicando no botão acima.
                  </Text>
                </View>
              )}
            </View>

            {/* Quick Actions Section */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Ações Rápidas</Text>
              
              <View style={styles.actionsGrid}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    setActiveTab('Pessoal'); // Define 'Pessoal' como proprietário padrão
                    setNewAccountModalVisible(true);
                  }}
                >
                  <View style={[styles.actionIcon, { backgroundColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.2)` }]}>
                    <Wallet size={24} color={theme.primary} />
                  </View>
                  <Text style={styles.actionText}>Nova Conta</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setDepositModalVisible(true)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: `rgba(${parseInt(theme.secondary.slice(1, 3), 16)}, ${parseInt(theme.secondary.slice(3, 5), 16)}, ${parseInt(theme.secondary.slice(5, 7), 16)}, 0.2)` }]}>
                    <DollarSign size={24} color={theme.secondary} />
                  </View>
                  <Text style={styles.actionText}>Depositar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setSavingsModalVisible(true)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: 'rgba(76, 217, 100, 0.2)' }]}>
                    <PiggyBank size={24} color="#4CD964" />
                  </View>
                  <Text style={styles.actionText}>Poupar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setShareModalVisible(true)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: 'rgba(255, 179, 0, 0.2)' }]}>
                    <Users size={24} color="#FFB300" />
                  </View>
                  <Text style={styles.actionText}>Compartilhar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Modal: Nova Conta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={newAccountModalVisible}
        onRequestClose={() => setNewAccountModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Conta</Text>
              <TouchableOpacity 
                onPress={() => setNewAccountModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nome da Conta"
              value={newAccountName}
              onChangeText={setNewAccountName}
              placeholderTextColor="#999"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Tipo de Conta</Text>
              <View style={styles.pickerOptions}>
                {['Conta Corrente', 'Poupança', 'Investimento', 'Dinheiro Físico'].map((type) => (
                  <TouchableOpacity 
                    key={type}
                    style={[
                      styles.pickerOption,
                      newAccountType === type && [
                        styles.pickerOptionSelected,
                        { backgroundColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.2)` }
                      ]
                    ]}
                    onPress={() => setNewAccountType(type)}
                  >
                    <Text 
                      style={[
                        styles.pickerOptionText,
                        newAccountType === type && [
                          styles.pickerOptionTextSelected,
                          { color: theme.primary }
                        ]
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Banco (opcional)"
              value={newAccountBank}
              onChangeText={setNewAccountBank}
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.input}
              placeholder="Saldo Inicial (R$)"
              value={newAccountInitialBalance}
              onChangeText={handleInitialBalanceChange}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Proprietário</Text>
              <View style={styles.pickerOptions}>
                {[
                  'Pessoal', 
                  'Compartilhadas', 
                  ...(users.length > 0 ? users.map(user => user.name || 'Avatar') : [currentUser?.name || 'Avatar']),
                  ...avatars.map(avatar => avatar.avatar_name)
                ].map((owner) => (
                  <TouchableOpacity 
                    key={owner}
                    style={[
                      styles.pickerOption,
                      activeTab === owner && [
                        styles.pickerOptionSelected,
                        { backgroundColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.2)` }
                      ]
                    ]}
                    onPress={() => setActiveTab(owner)}
                  >
                    <Text 
                      style={[
                        styles.pickerOptionText,
                        activeTab === owner && [
                          styles.pickerOptionTextSelected,
                          { color: theme.primary }
                        ]
                      ]}
                    >
                      {owner}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.modalButton, {backgroundColor: theme.primary}]}
              onPress={handleAddNewAccount}
            >
              <Text style={styles.modalButtonText}>Criar Conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Depositar */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={depositModalVisible}
        onRequestClose={() => setDepositModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Depositar</Text>
              <TouchableOpacity 
                onPress={() => setDepositModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Selecione a Conta</Text>
              <ScrollView style={styles.accountPicker}>
                {displayAccounts().map((account) => (
                  <TouchableOpacity 
                    key={account.id}
                    style={[
                      styles.accountPickerItem,
                      depositAccount === account.name && [
                        styles.accountPickerItemSelected,
                        { 
                          backgroundColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.1)`,
                          borderWidth: 1,
                          borderColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.3)`
                        }
                      ]
                    ]}
                    onPress={() => setDepositAccount(account.name)}
                  >
                    <View style={[styles.accountPickerIcon, { backgroundColor: account.color }]}>
                      {account.icon}
                    </View>
                    <View style={styles.accountPickerInfo}>
                      <Text style={styles.accountPickerName}>{account.name}</Text>
                      <Text style={styles.accountPickerType}>{account.type}</Text>
                    </View>
                    {depositAccount === account.name && (
                      <Check size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Valor do Depósito (R$)"
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />

            <TouchableOpacity 
              style={[styles.modalButton, {backgroundColor: theme.primary}]}
              onPress={handleDeposit}
            >
              <Text style={styles.modalButtonText}>Confirmar Depósito</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Poupar */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={savingsModalVisible}
        onRequestClose={() => {
          setSavingsAmount('');
          setSavingsGoal('');
          setSelectedSavingsAccount('');
          setSavingsModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transferir para Poupança</Text>
              <TouchableOpacity 
                onPress={() => {
                  setSavingsAmount('');
                  setSavingsGoal('');
                  setSelectedSavingsAccount('');
                  setSavingsModalVisible(false);
                }}
                style={styles.closeButton}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Valor a Poupar (R$)"
              value={savingsAmount}
              onChangeText={handleSavingsAmountChange}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.input}
              placeholder="Objetivo (opcional)"
              value={savingsGoal}
              onChangeText={setSavingsGoal}
              placeholderTextColor="#999"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Selecione a Conta para Vincular</Text>
              <ScrollView style={styles.accountPicker}>
                {displayAccounts().map((account) => (
                  <TouchableOpacity 
                    key={account.id}
                    style={[
                      styles.accountPickerItem,
                      selectedSavingsAccount === account.name && [
                        styles.accountPickerItemSelected,
                        { 
                          backgroundColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.1)`,
                          borderWidth: 1,
                          borderColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.3)`
                        }
                      ]
                    ]}
                    onPress={() => setSelectedSavingsAccount(account.name)}
                  >
                    <View style={[styles.accountPickerIcon, { backgroundColor: account.color }]}>
                      {account.icon}
                    </View>
                    <View style={styles.accountPickerInfo}>
                      <Text style={styles.accountPickerName}>{account.name}</Text>
                      <Text style={styles.accountPickerType}>{account.type}</Text>
                    </View>
                    {selectedSavingsAccount === account.name && (
                      <Check size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>



            <TouchableOpacity 
              style={[styles.modalButton, {backgroundColor: theme.primary}]}
              onPress={handleSavings}
            >
              <Text style={styles.modalButtonText}>Confirmar Transferência</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Compartilhar */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={shareModalVisible}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Compartilhar Conta</Text>
              <TouchableOpacity 
                onPress={() => setShareModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Selecione a Conta para Compartilhar</Text>
              <ScrollView style={styles.accountPicker}>
                {displayAccounts().map((account) => (
                  <TouchableOpacity 
                    key={account.id}
                    style={[
                      styles.accountPickerItem,
                      shareAccount === account.name && [
                        styles.accountPickerItemSelected,
                        { 
                          backgroundColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.1)`,
                          borderWidth: 1,
                          borderColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.3)`
                        }
                      ]
                    ]}
                    onPress={() => setShareAccount(account.name)}
                  >
                    <View style={[styles.accountPickerIcon, { backgroundColor: account.color }]}>
                      {account.icon}
                    </View>
                    <View style={styles.accountPickerInfo}>
                      <Text style={styles.accountPickerName}>{account.name}</Text>
                      <Text style={styles.accountPickerType}>{account.type}</Text>
                    </View>
                    {shareAccount === account.name && (
                      <Check size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Compartilhar com</Text>
              {users.filter(user => user.name !== activeTab).map(user => (
                <TouchableOpacity 
                  key={user.id}
                  style={[
                    styles.sharePerson, 
                    shareWithPerson === user.name && [
                      styles.sharePersonSelected,
                      { 
                        backgroundColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.1)`,
                        borderWidth: 1,
                        borderColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.3)`
                      }
                    ]
                  ]}
                  onPress={() => setShareWithPerson(user.name)}
                >
                  <Image 
                    source={{ 
                      uri: user.profile_picture_url
                          ? user.profile_picture_url
                          : (user.gender?.toLowerCase().includes('f') 
                            ? 'https://randomuser.me/api/portraits/women/44.jpg' 
                            : 'https://randomuser.me/api/portraits/men/42.jpg') 
                    }}
                    style={styles.sharePersonAvatar}
                  />
                  <Text style={styles.sharePersonName}>{user.name || 'Avatar'}</Text>
                  {shareWithPerson === user.name && (
                    <Check size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              ))}
              {users.filter(user => user.name !== activeTab).length === 0 && (
                <Text style={styles.infoText}>
                  Não há usuários disponíveis para compartilhar.
                </Text>
              )}
            </View>

            <View style={styles.infoBox}>
              <Users size={20} color="#FFB300" style={{marginRight: 8}} />
              <Text style={styles.infoText}>
                {users.length > 0
                  ? `Ao compartilhar esta conta, seu parceiro poderá visualizar transações e saldo.`
                  : `Adicione um relacionamento para compartilhar contas.`
                }
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.modalButton, {backgroundColor: theme.primary}]}
              onPress={handleShareAccount}
            >
              <Text style={styles.modalButtonText}>Compartilhar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Detalhes da Conta */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={accountDetailsModalVisible}
        onRequestClose={() => setAccountDetailsModalVisible(false)}
      >
        <View style={styles.detailsContainer}>
          {/* Header */}
          <View style={styles.detailsHeader}>
            <TouchableOpacity 
              style={styles.detailsBackButton}
              onPress={() => setAccountDetailsModalVisible(false)}
            >
              <ArrowLeft size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.detailsHeaderTitle}>
              {selectedAccount?.name || 'Detalhes da Conta'}
            </Text>
            <TouchableOpacity 
              style={styles.detailsSettingsButton}
              onPress={handleOpenEditAccount}
            >
              <Settings size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.detailsContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Financial Summary Cards */}
            <View style={styles.summaryCardsContainer}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <View style={[styles.summaryIconContainer, { backgroundColor: 'rgba(255, 193, 7, 0.15)' }]}>
                    <Wallet size={24} color="#FFC107" />
                  </View>
                  <Text style={styles.summaryLabel}>Meu Saldo</Text>
                  <Text style={styles.summaryValue}>
                    {selectedAccount ? selectedAccount.balance : 'R$ 0,00'}
                  </Text>
                </View>

                <View style={styles.summaryCard}>
                  <View style={[styles.summaryIconContainer, { backgroundColor: 'rgba(66, 133, 244, 0.15)' }]}>
                    <ArrowUpRight size={24} color="#4285F4" />
                  </View>
                  <Text style={styles.summaryLabel}>Receita</Text>
                  <Text style={styles.summaryValue}>
                    {selectedAccount ? 
                      `R$ ${getAccountSummary(selectedAccount.id).income.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}` 
                      : 'R$ 0,00'}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <View style={[styles.summaryIconContainer, { backgroundColor: 'rgba(234, 67, 53, 0.15)' }]}>
                    <ArrowDownRight size={24} color="#EA4335" />
                  </View>
                  <Text style={styles.summaryLabel}>Despesa</Text>
                  <Text style={styles.summaryValue}>
                    {selectedAccount ? 
                      `R$ ${getAccountSummary(selectedAccount.id).expense.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}` 
                      : 'R$ 0,00'}
                  </Text>
                </View>

                <View style={styles.summaryCard}>
                  <View style={[styles.summaryIconContainer, { backgroundColor: 'rgba(76, 217, 100, 0.15)' }]}>
                    <PiggyBank size={24} color="#4CD964" />
                  </View>
                  <Text style={styles.summaryLabel}>Poupança</Text>
                  <Text style={styles.summaryValue}>
                    {selectedAccount ? 
                      `R$ ${getAccountSummary(selectedAccount.id).savings.toLocaleString('pt-BR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}` 
                      : 'R$ 0,00'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Last Transactions Section */}
            <View style={styles.detailsSection}>
              <View style={styles.detailsSectionHeader}>
                <Text style={styles.detailsSectionTitle}>Últimas Transações</Text>
                <TouchableOpacity>
                  <ChevronRight size={20} color="#999" />
                </TouchableOpacity>
              </View>

              {selectedAccount && getAccountTransactions(selectedAccount.id).map(transaction => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={[styles.transactionIcon, { backgroundColor: transaction.iconBg }]}>
                    {transaction.icon}
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{transaction.title}</Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'expense' 
                      ? { color: '#FF3B30' } 
                      : { color: '#4CD964' }
                  ]}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </Text>
                </View>
              ))}

              {(!selectedAccount || getAccountTransactions(selectedAccount.id).length === 0) && (
                <Text style={styles.noTransactionsText}>
                  Nenhuma transação encontrada
                </Text>
              )}
            </View>

            {/* Debit & Credit Overview */}
            {selectedAccount && (
              <View style={styles.detailsSection}>
                <View style={styles.detailsSectionHeader}>
                  <Text style={styles.detailsSectionTitle}>Débito & Crédito</Text>
                </View>
                
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#4285F4' }]} />
                    <Text style={styles.legendText}>Débito</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EA4335' }]} />
                    <Text style={styles.legendText}>Crédito</Text>
                  </View>
                </View>

                <View style={styles.chartContainer}>
                  {accountChartData.map((item, index) => (
                    <View key={index} style={styles.chartColumn}>
                      <View style={styles.chartBars}>
                        <View style={styles.barContainer}>
                          <View 
                            style={[
                              styles.bar, 
                              { 
                                height: (item.debit / maxChartValue) * 130,
                                backgroundColor: '#4285F4'
                              }
                            ]}
                          />
                        </View>
                        <View style={styles.barContainer}>
                          <View 
                            style={[
                              styles.bar, 
                              { 
                                height: (item.credit / maxChartValue) * 130,
                                backgroundColor: '#EA4335'
                              }
                            ]}
                          />
                        </View>
                      </View>
                      <Text style={styles.chartLabel}>{item.day}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Expense By Person (for shared accounts) */}
            {selectedAccount && selectedAccount.id === '1' && (
              <View style={styles.detailsSection}>
                <View style={styles.detailsSectionHeader}>
                  <Text style={styles.detailsSectionTitle}>Gastos por Pessoa</Text>
                </View>
                
                {Object.entries(getExpensesByPerson(selectedAccount.id)).map(([person, amount], index) => (
                  <View key={index} style={styles.personExpenseItem}>
                    <View style={styles.personInfo}>
                      <View style={[
                        styles.personAvatar, 
                        { 
                          backgroundColor: person === currentUser?.name || (users.length > 0 && person === users[0].name)
                            ? `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.2)` 
                            : `rgba(${parseInt(theme.secondary.slice(1, 3), 16)}, ${parseInt(theme.secondary.slice(3, 5), 16)}, ${parseInt(theme.secondary.slice(5, 7), 16)}, 0.2)` 
                        }
                      ]}>
                        <User size={20} color={person === currentUser?.name || (users.length > 0 && person === users[0].name) ? theme.primary : theme.secondary} />
                      </View>
                      <Text style={styles.personName}>{person}</Text>
                    </View>
                    <Text style={styles.personExpenseAmount}>
                      R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
              </Modal>

        {/* Modal: Editar Conta */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editAccountModalVisible}
          onRequestClose={() => setEditAccountModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar Conta</Text>
                <TouchableOpacity 
                  onPress={() => setEditAccountModalVisible(false)}
                  style={styles.closeButton}
                >
                  <X size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Nome da Conta"
                value={editAccountName}
                onChangeText={setEditAccountName}
                placeholderTextColor="#999"
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Tipo de Conta</Text>
                <View style={styles.pickerOptions}>
                  {['Conta Corrente', 'Poupança', 'Investimento', 'Dinheiro Físico'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.pickerOption,
                        editAccountType === type && [styles.pickerOptionSelected, { backgroundColor: theme.primary }]
                      ]}
                      onPress={() => setEditAccountType(type)}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        editAccountType === type && [styles.pickerOptionTextSelected, { color: '#fff' }]
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Status da Conta</Text>
                <View style={styles.pickerOptions}>
                  {['Ativa', 'Inativa'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.pickerOption,
                        editAccountStatus === status && [styles.pickerOptionSelected, { backgroundColor: theme.primary }]
                      ]}
                      onPress={() => setEditAccountStatus(status)}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        editAccountStatus === status && [styles.pickerOptionTextSelected, { color: '#fff' }]
                      ]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  { 
                    backgroundColor: savingAccount ? '#ccc' : theme.primary,
                    opacity: savingAccount ? 0.7 : 1
                  }
                ]}
                onPress={handleSaveAccountChanges}
                disabled={savingAccount}
              >
                {savingAccount ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.modalButtonText}>Salvando...</Text>
                  </View>
                ) : (
                  <Text style={styles.modalButtonText}>Salvar Alterações</Text>
                )}
              </TouchableOpacity>
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
          style={styles.floatingAddButton}
          onPress={() => setNewAccountModalVisible(true)}
        >
          <View style={[styles.floatingButtonInner, { backgroundColor: theme.primary }]}>
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

// Criando um stylesheet estático usando themeDefault
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  unifiedHeader: {
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#fff',
    marginLeft: 16,
  },
  balanceContent: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#fff',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: 'rgba(255,255,255,0.8)',
  },
  tabsContainer: {
    marginTop: -15,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tabsScroll: {
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 50,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activeTab: {
    // Mantendo este estilo vazio para compatibilidade com outras partes do código
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#777',
  },
  activeTabText: {
    color: themeDefault.primary,
  },
  tabAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  accountsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#131313',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  accountIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#131313',
    marginBottom: 2,
  },
  accountType: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginBottom: 2,
  },
  accountDate: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#999',
  },
  accountBalance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountBalanceText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#131313',
    marginRight: 8,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 30,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    width: '47%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#131313',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#131313',
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
  },
  input: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#131313',
    marginBottom: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#131313',
    marginBottom: 8,
  },
  pickerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  pickerOption: {
    backgroundColor: '#f5f7fa',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  pickerOptionSelected: {
    // Mantendo estilo vazio para compatibilidade
  },
  pickerOptionText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#666',
  },
  pickerOptionTextSelected: {
    // Mantendo estilo vazio para compatibilidade
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#fff',
  },
  accountPicker: {
    maxHeight: 200,
    marginBottom: 16,
  },
  accountPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  accountPickerItemSelected: {
    // Mantendo estilo vazio para compatibilidade
  },
  accountPickerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountPickerInfo: {
    flex: 1,
  },
  accountPickerName: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#131313',
  },
  accountPickerType: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  infoBox: {
    backgroundColor: 'rgba(76, 217, 100, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#131313',
  },
  sharePerson: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  sharePersonSelected: {
    // Mantendo estilo vazio para compatibilidade
  },
  sharePersonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  sharePersonName: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#131313',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  detailsBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsHeaderTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#131313',
  },
  detailsSettingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContent: {
    flex: 1,
    paddingTop: 20,
  },
  summaryCardsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#131313',
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  detailsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#131313',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
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
    color: '#131313',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  noTransactionsText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  chartLegend: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 180,
    marginTop: 10,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 130,
  },
  barContainer: {
    width: 8,
    height: 130,
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  bar: {
    width: 8,
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginTop: 8,
  },
  personExpenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  personName: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#131313',
  },
  personExpenseAmount: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#FF3B30',
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
  floatingAddButton: {
    marginTop: -30,
    backgroundColor: 'white',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: themeDefault.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    marginTop: 12,
  },
  emptyRelationshipContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 8,
    justifyContent: 'center',
  },
  emptyRelationshipText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#777',
    fontStyle: 'italic',
  },
  emptyAccountsContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 10,
  },
  emptyAccountsText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 