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
  Alert
} from 'react-native';
import { ArrowLeft, CreditCard, Plus, ChevronRight, Wallet, Landmark, PiggyBank, DollarSign, Users, X, Check, Calendar, Settings, ArrowUpRight, ArrowDownRight, Music, Phone, User, BarChart, Menu, Receipt, PlusCircle, Home, Bell, Info, ExternalLink } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import BottomNavigation from '@/components/BottomNavigation';
import { fontFallbacks } from '@/utils/styles';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.85;

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

// Definindo um themeDefault para ser usado no StyleSheet estático
const themeDefault = {
  primary: '#b687fe',
  primaryGradient: ['#b687fe', '#9157ec'],
  secondary: '#0073ea',
  secondaryGradient: ['#0073ea', '#0056b3'],
  card: '#ffffff',
  text: '#333333'
};

export default function Accounts() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Compartilhadas');
  const [theme, setTheme] = useState(themes.feminine); // Iniciar com tema feminino como padrão
  
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
  
  const [shareWithPerson, setShareWithPerson] = useState('');
  const [shareAccount, setShareAccount] = useState('');

  // Estado para o modal de detalhes da conta
  const [accountDetailsModalVisible, setAccountDetailsModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

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
    switch(activeTab) {
      case 'Compartilhadas':
        return sharedAccounts;
      case 'Maria':
        return mariaAccounts;
      case 'João':
        return joaoAccounts;
      default:
        return sharedAccounts;
    }
  };
  
  // Calcula o saldo total das contas exibidas
  const calculateTotalBalance = (accounts: Array<{balance: string}>) => {
    return accounts.reduce((total: number, account: {balance: string}) => {
      const balanceValue = parseFloat(account.balance.replace('R$ ', '').replace('.', '').replace(',', '.'));
      return total + balanceValue;
    }, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Função para criar uma nova conta
  const handleAddNewAccount = () => {
    // Validação básica
    if (!newAccountName || !newAccountType) {
      Alert.alert('Erro', 'Por favor preencha pelo menos o nome e o tipo da conta.');
      return;
    }
    
    // Simular adição de conta (em um app real, isso iria para um banco de dados)
    Alert.alert(
      'Sucesso',
      `Conta "${newAccountName}" criada com sucesso!`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Limpar o formulário e fechar o modal
            setNewAccountName('');
            setNewAccountType('');
            setNewAccountBank('');
            setNewAccountInitialBalance('');
            setNewAccountModalVisible(false);
          }
        }
      ]
    );
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
  const handleSavings = () => {
    if (!savingsAmount) {
      Alert.alert('Erro', 'Por favor informe o valor que deseja poupar.');
      return;
    }

    Alert.alert(
      'Poupança Registrada',
      `Valor de R$ ${savingsAmount} transferido para poupança${savingsGoal ? ` com objetivo: ${savingsGoal}` : ''}.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setSavingsAmount('');
            setSavingsGoal('');
            setSavingsModalVisible(false);
          }
        }
      ]
    );
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
    return activeTab === 'Maria' ? 'João' : 'Maria';
  };

  // Dados fictícios de transações para cada conta
  const getAccountTransactions = (accountId: string) => {
    const transactionsData = {
      '1': [ // Conta Conjunta
        { id: 't1', title: 'Spotify Premium', category: 'Assinatura', date: '28 Janeiro 2023', amount: -85.00, type: 'expense', icon: <Music size={20} color="#fff" />, iconBg: '#1ED760', person: 'Maria' },
        { id: 't2', title: 'Operadora Celular', category: 'Serviços', date: '25 Janeiro 2023', amount: 250.00, type: 'income', icon: <Phone size={20} color="#fff" />, iconBg: '#0073EA', person: 'João' },
        { id: 't3', title: 'Salário', category: 'Renda', date: '21 Janeiro 2023', amount: 5400.00, type: 'income', icon: <DollarSign size={20} color="#fff" />, iconBg: '#4CD964', person: 'Maria' },
      ],
      '2': [ // Poupança Casal
        { id: 't4', title: 'Transferência', category: 'Poupança', date: '22 Janeiro 2023', amount: 1000.00, type: 'income', icon: <ArrowUpRight size={20} color="#fff" />, iconBg: '#4CD964', person: 'João' },
        { id: 't5', title: 'Rendimento', category: 'Juros', date: '15 Janeiro 2023', amount: 62.50, type: 'income', icon: <DollarSign size={20} color="#fff" />, iconBg: '#FFB300', person: 'Sistema' },
      ],
      '3': [ // Reserva Emergência
        { id: 't6', title: 'Transferência', category: 'Investimento', date: '05 Janeiro 2023', amount: 1500.00, type: 'income', icon: <ArrowUpRight size={20} color="#fff" />, iconBg: '#4CD964', person: 'Maria' },
      ],
      '4': [ // Conta Pessoal Maria
        { id: 't7', title: 'Farmácia', category: 'Saúde', date: '18 Janeiro 2023', amount: -127.35, type: 'expense', icon: <DollarSign size={20} color="#fff" />, iconBg: '#FF3B30', person: 'Maria' },
        { id: 't8', title: 'Salário', category: 'Renda', date: '15 Janeiro 2023', amount: 4200.00, type: 'income', icon: <DollarSign size={20} color="#fff" />, iconBg: '#4CD964', person: 'Maria' },
      ],
      '5': [ // Carteira Maria
        { id: 't9', title: 'Saque', category: 'Transferência', date: '20 Janeiro 2023', amount: 350.00, type: 'income', icon: <ArrowUpRight size={20} color="#fff" />, iconBg: '#4CD964', person: 'Maria' },
      ],
      '6': [ // Conta Pessoal João
        { id: 't10', title: 'Restaurante', category: 'Alimentação', date: '15 Janeiro 2023', amount: -78.90, type: 'expense', icon: <DollarSign size={20} color="#fff" />, iconBg: '#FF3B30', person: 'João' },
        { id: 't11', title: 'Salário', category: 'Renda', date: '10 Janeiro 2023', amount: 3800.00, type: 'income', icon: <DollarSign size={20} color="#fff" />, iconBg: '#4CD964', person: 'João' },
      ],
      '7': [ // Carteira João
        { id: 't12', title: 'Saque', category: 'Transferência', date: '19 Janeiro 2023', amount: 280.00, type: 'income', icon: <ArrowUpRight size={20} color="#fff" />, iconBg: '#4CD964', person: 'João' },
      ],
    };
    
    return transactionsData[accountId as keyof typeof transactionsData] || [];
  };
  
  // Calcular totais para o resumo financeiro
  const getAccountSummary = (accountId: string) => {
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
    const expenseData = {
      Maria: 0,
      João: 0
    };
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense' && (transaction.person === 'Maria' || transaction.person === 'João')) {
        expenseData[transaction.person as keyof typeof expenseData] += Math.abs(transaction.amount);
      }
    });
    
    return expenseData;
  };
  
  // Abrir modal de detalhes da conta
  const handleOpenAccountDetails = (account: any) => {
    setSelectedAccount(account);
    setAccountDetailsModalVisible(true);
  };
  
  // Função utilitária para criar uma cor de fundo semitransparente com base na cor do tema
  const getThemeBackgroundColor = (color: string, opacity: number) => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  
  // Gerar dados para o gráfico de débito e crédito
  const generateChartData = () => {
    return [
      { day: 'Sáb', debit: 75, credit: 95 },
      { day: 'Dom', debit: 45, credit: 70 },
      { day: 'Seg', debit: 35, credit: 45 },
      { day: 'Ter', debit: 80, credit: 40 },
      { day: 'Qua', debit: 50, credit: 80 },
      { day: 'Qui', debit: 60, credit: 35 },
      { day: 'Sex', debit: 40, credit: 85 }
    ];
  };
  
  const chartData = generateChartData();
  const maxChartValue = Math.max(...chartData.map(item => Math.max(item.debit, item.credit)));

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
          <Text style={styles.balanceAmount}>R$ {calculateTotalBalance(displayAccounts())}</Text>
          <Text style={styles.balanceSubtext}>{displayAccounts().length} Contas • {activeTab}</Text>
        </View>
      </LinearGradient>

      {/* Account Type Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
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
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'Maria' && [
                styles.activeTab,
                { backgroundColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.1)` }
              ]
            ]}
            onPress={() => setActiveTab('Maria')}
          >
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
              style={styles.tabAvatar}
            />
            <Text style={[
              styles.tabText,
              activeTab === 'Maria' && { color: theme.primary }
            ]}>Maria</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tab, 
              activeTab === 'João' && [
                styles.activeTab,
                { backgroundColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.1)` }
              ]
            ]}
            onPress={() => setActiveTab('João')}
          >
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/42.jpg' }}
              style={styles.tabAvatar}
            />
            <Text style={[
              styles.tabText,
              activeTab === 'João' && { color: theme.primary }
            ]}>João</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Account Cards */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.accountsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suas Contas</Text>
            
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setNewAccountModalVisible(true)}
            >
              <Plus size={18} color={theme.primary} />
              <Text style={[styles.addButtonText, { color: theme.primary }]}>Adicionar Conta</Text>
            </TouchableOpacity>
          </View>

          {displayAccounts().map((account) => (
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
          ))}
        </View>

        {/* Quick Actions Section */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setNewAccountModalVisible(true)}
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
              onChangeText={setNewAccountInitialBalance}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Proprietário</Text>
              <View style={styles.pickerOptions}>
                {['Maria', 'João', 'Compartilhada'].map((owner) => (
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
        onRequestClose={() => setSavingsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transferir para Poupança</Text>
              <TouchableOpacity 
                onPress={() => setSavingsModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Valor a Poupar (R$)"
              value={savingsAmount}
              onChangeText={setSavingsAmount}
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

            <View style={styles.infoBox}>
              <PiggyBank size={20} color="#4CD964" style={{marginRight: 8}} />
              <Text style={styles.infoText}>
                Transferir para a Poupança Casal com rendimento de 0,5% ao mês.
              </Text>
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
              <TouchableOpacity 
                style={[
                  styles.sharePerson, 
                  shareWithPerson === getOtherPersonName() && [
                    styles.sharePersonSelected,
                    { 
                      backgroundColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.1)`,
                      borderWidth: 1,
                      borderColor: `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.3)`
                    }
                  ]
                ]}
                onPress={() => setShareWithPerson(getOtherPersonName())}
              >
                <Image 
                  source={{ 
                    uri: activeTab === 'Maria' 
                      ? 'https://randomuser.me/api/portraits/men/42.jpg'
                      : 'https://randomuser.me/api/portraits/women/44.jpg' 
                  }}
                  style={styles.sharePersonAvatar}
                />
                <Text style={styles.sharePersonName}>{getOtherPersonName()}</Text>
                {shareWithPerson === getOtherPersonName() && (
                  <Check size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Users size={20} color="#FFB300" style={{marginRight: 8}} />
              <Text style={styles.infoText}>
                Ao compartilhar esta conta, {getOtherPersonName()} poderá visualizar transações e saldo.
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
            <TouchableOpacity style={styles.detailsSettingsButton}>
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
                  {chartData.map((item, index) => (
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
                          backgroundColor: person === 'Maria' 
                            ? `rgba(${parseInt(theme.primary.slice(1, 3), 16)}, ${parseInt(theme.primary.slice(3, 5), 16)}, ${parseInt(theme.primary.slice(5, 7), 16)}, 0.2)` 
                            : `rgba(${parseInt(theme.secondary.slice(1, 3), 16)}, ${parseInt(theme.secondary.slice(3, 5), 16)}, ${parseInt(theme.secondary.slice(5, 7), 16)}, 0.2)` 
                        }
                      ]}>
                        <User size={20} color={person === 'Maria' ? theme.primary : theme.secondary} />
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
                  <View style={[styles.menuIconContainer, { backgroundColor: getThemeBackgroundColor(theme.primary, 0.15) }]}>
                    <Home size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Dashboard</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Página inicial</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    // Lógica para adicionar nova transação
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: getThemeBackgroundColor(theme.primary, 0.15) }]}>
                    <PlusCircle size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Novo Registro</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Adicionar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuItem}>
                  <View style={[styles.menuIconContainer, { backgroundColor: getThemeBackgroundColor(theme.primary, 0.15) }]}>
                    <Bell size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Notificações</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Alertas</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.menuRow}>
                <TouchableOpacity style={styles.menuItem}>
                  <View style={[styles.menuIconContainer, { backgroundColor: getThemeBackgroundColor(theme.primary, 0.15) }]}>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: getThemeBackgroundColor(theme.primary, 0.15) }]}>
                    <Wallet size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Cartões</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Gerenciar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.replace('/(app)/bill-payments');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: getThemeBackgroundColor(theme.primary, 0.15) }]}>
                    <Receipt size={24} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Contas a Pagar</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Pagamentos</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.menuRow}>
                <TouchableOpacity style={styles.menuItem}>
                  <View style={[styles.menuIconContainer, { backgroundColor: getThemeBackgroundColor(theme.primary, 0.15) }]}>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: getThemeBackgroundColor(theme.primary, 0.15) }]}>
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
          style={styles.floatingAddButton}
          onPress={() => setNewAccountModalVisible(true)}
        >
          <View style={styles.floatingButtonInner}>
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
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 