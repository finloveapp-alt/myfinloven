import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Platform, TextInput, Modal, Alert, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import { ArrowLeft, MoreVertical, Plus, BarChart2, Target, Repeat, DollarSign, User, Clock, X, Edit2, AlertCircle, BarChart, Menu, Receipt, CreditCard, PlusCircle, Home, Bell, Wallet, Info, ExternalLink } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { fontFallbacks } from '@/utils/styles';
import Svg, { Line, Circle, Path, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const theme = {
  primary: '#b687fe',
  card: '#ffffff',
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
  const [activeTab, setActiveTab] = useState('budget'); // 'budget' ou 'goals'
  const [expandedBudget, setExpandedBudget] = useState<string | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [budgetData, setBudgetData] = useState(budgets);
  const [goalsData, setGoalsData] = useState(goals);
  
  // Estados para modais
  const [showNewBudgetModal, setShowNewBudgetModal] = useState(false);
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [showAddDepositModal, setShowAddDepositModal] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false); // Para o modal de menu
  
  // Estados para edição
  const [currentBudget, setCurrentBudget] = useState<any>(null);
  const [currentGoal, setCurrentGoal] = useState<any>(null);
  
  // Valores para novos orçamentos/metas
  const [newCategory, setNewCategory] = useState('');
  const [newAllocated, setNewAllocated] = useState('');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');
  const [newDepositAmount, setNewDepositAmount] = useState('');
  const [selectedUser, setSelectedUser] = useState('Maria');

  const scrollViewRef = useRef<ScrollView>(null);

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
  
  const handleAddBudget = () => {
    if (!newCategory || !newAllocated) {
      Alert.alert("Informações Incompletas", "Por favor, preencha todos os campos.");
      return;
    }
    
    const newBudgetItem = {
      id: (budgetData.length + 1).toString(),
      category: newCategory,
      allocated: parseFloat(newAllocated),
      spent: 0,
      percentage: 0,
      icon: '📊',
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      warning: false,
      users: [
        { name: 'Maria', spent: 0, percentage: 0 },
        { name: 'João', spent: 0, percentage: 0 }
      ],
      transactions: []
    };
    
    setBudgetData([...budgetData, newBudgetItem]);
    setNewCategory('');
    setNewAllocated('');
    setShowNewBudgetModal(false);
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
  
  const handleAddGoal = () => {
    if (!newGoalTitle || !newGoalAmount || !newGoalDeadline) {
      Alert.alert("Informações Incompletas", "Por favor, preencha todos os campos.");
      return;
    }
    
    const newGoalItem = {
      id: (goalsData.length + 1).toString(),
      title: newGoalTitle,
      target: parseFloat(newGoalAmount),
      current: 0,
      percentage: 0,
      deadline: newGoalDeadline,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      icon: '🎯',
      deposits: [],
      teamContributions: [
        { name: 'Maria', amount: 0, percentage: 0 },
        { name: 'João', amount: 0, percentage: 0 }
      ]
    };
    
    setGoalsData([...goalsData, newGoalItem]);
    setNewGoalTitle('');
    setNewGoalAmount('');
    setNewGoalDeadline('');
    setShowNewGoalModal(false);
  };
  
  const handleAddDeposit = () => {
    if (!currentGoal || !newDepositAmount) {
      Alert.alert("Informações Incompletas", "Por favor, preencha todos os campos.");
      return;
    }
    
    const depositAmount = parseFloat(newDepositAmount);
    const today = new Date();
    const formattedDate = `${today.getDate()} ${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][today.getMonth()]} ${today.getFullYear()}`;
    
    const newDeposit = {
      date: formattedDate,
      amount: depositAmount,
      user: selectedUser
    };
    
    // Atualiza o valor atual e a porcentagem
    const updatedCurrent = currentGoal.current + depositAmount;
    const updatedPercentage = parseFloat(((updatedCurrent / currentGoal.target) * 100).toFixed(1));
    
    // Atualiza as contribuições da equipe
    const updatedTeamContributions = currentGoal.teamContributions.map((contribution: any) => {
      if (contribution.name === selectedUser) {
        const newAmount = contribution.amount + depositAmount;
        return {
          ...contribution,
          amount: newAmount,
          percentage: parseFloat(((newAmount / updatedCurrent) * 100).toFixed(1))
        };
      }
      return {
        ...contribution,
        percentage: parseFloat(((contribution.amount / updatedCurrent) * 100).toFixed(1))
      };
    });
    
    const updatedGoal = {
      ...currentGoal,
      deposits: [newDeposit, ...currentGoal.deposits],
      current: updatedCurrent,
      percentage: updatedPercentage,
      teamContributions: updatedTeamContributions
    };
    
    const updatedGoals = goalsData.map(goal => 
      goal.id === currentGoal.id ? updatedGoal : goal
    );
    
    setGoalsData(updatedGoals);
    setNewDepositAmount('');
    setShowAddDepositModal(false);
  };

  // Função para rolar até o topo quando abrir modais
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Modificar as funções de abertura de modal para incluir scrollToTop
  const openNewBudgetModal = () => {
    scrollToTop();
    setShowNewBudgetModal(true);
  };
  
  const openEditBudgetModal = (budget: any) => {
    scrollToTop();
    setCurrentBudget(budget);
    setShowEditBudgetModal(true);
  };
  
  const openNewGoalModal = () => {
    scrollToTop();
    setShowNewGoalModal(true);
  };
  
  const openEditGoalModal = (goal: any) => {
    scrollToTop();
    setCurrentGoal(goal);
    setShowEditGoalModal(true);
  };
  
  const openAddDepositModal = (goal: any) => {
    scrollToTop();
    setCurrentGoal(goal);
    setShowAddDepositModal(true);
  };

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
            <Text style={styles.dateText}>12 de Agosto, 2022</Text>
            <Text style={styles.amountText}>R$ 5.543,43</Text>
            <Text style={styles.amountLabel}>Saldo</Text>
          </View>

          {activeTab === 'budget' ? (
            // Conteúdo da aba Orçamentos
            <View style={styles.budgetContent}>
              <View style={styles.donutChartContainer}>
                {/* Aqui iria o componente de gráfico circular */}
                <View style={styles.chartRow}>
                  <View style={styles.donutChart}>
                    {/* Simulação visual do gráfico */}
                    <View style={styles.donutChartInner} />
                  </View>
                  
                  <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#4CD964' }]} />
                      <Text style={styles.legendText}>Receita</Text>
                      <Text style={styles.legendPercentValue}>45%</Text>
                    </View>
                    
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
                      <Text style={styles.legendText}>Despesa</Text>
                      <Text style={styles.legendPercentValue}>35%</Text>
                    </View>
                    
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#5856D6' }]} />
                      <Text style={styles.legendText}>Transferência</Text>
                      <Text style={styles.legendPercentValue}>20%</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Histórico</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllLink}>Ver Todos</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.transactionsList}>
                <View style={styles.transactionItem}>
                  <View style={[styles.transactionIcon, { backgroundColor: 'rgba(76, 217, 100, 0.15)' }]}>
                    <DollarSign size={24} color="#4CD964" />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>Receita</Text>
                    <Text style={styles.transactionTime}>11:25 am • Maria</Text>
                  </View>
                  <Text style={[styles.transactionAmount, styles.incomeAmount]}>+R$ 982,21</Text>
                </View>

                <View style={styles.transactionItem}>
                  <View style={[styles.transactionIcon, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
                    <ArrowLeft size={24} color="#FF3B30" />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>Despesa</Text>
                    <Text style={styles.transactionTime}>01:50 pm • João</Text>
                  </View>
                  <Text style={styles.transactionAmount}>-R$ 387,11</Text>
                </View>

                <View style={styles.transactionItem}>
                  <View style={[styles.transactionIcon, { backgroundColor: 'rgba(88, 86, 214, 0.15)' }]}>
                    <Repeat size={24} color="#5856D6" />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>Transferência</Text>
                    <Text style={styles.transactionTime}>09:30 am • Maria → João</Text>
                  </View>
                  <Text style={[styles.transactionAmount, styles.transferAmount]}>R$ 500,00</Text>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categorias de Orçamento</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={openNewBudgetModal}
                >
                  <Plus size={16} color="#FFF" />
                  <Text style={styles.addButtonText}>Adicionar</Text>
                </TouchableOpacity>
              </View>

              {budgetData.map(budget => (
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
                  </TouchableOpacity>
                  
                  {expandedBudget === budget.id && (
                    <View style={styles.budgetExpanded}>
                      <View style={styles.spendingByPersonSection}>
                        <Text style={styles.expandedSectionTitle}>Quem gastou</Text>
                        
                        {budget.users.map((user, index) => (
                          <View key={index} style={styles.userRow}>
                            <View style={styles.userInfo}>
                              <View style={[
                                styles.userIcon, 
                                { backgroundColor: user.name === 'Maria' ? 'rgba(182, 135, 254, 0.2)' : 'rgba(0, 115, 234, 0.2)' }
                              ]}>
                                <User size={16} color={user.name === 'Maria' ? '#b687fe' : '#0073ea'} />
                              </View>
                              <Text style={styles.userName}>{user.name}</Text>
                            </View>

                            <View style={styles.userSpentInfo}>
                              <Text style={styles.userSpentText}>R$ {user.spent.toFixed(2).replace('.', ',')}</Text>
                              <Text style={styles.userPercentageText}>({user.percentage}%)</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                      
                      <View style={styles.transactionsSection}>
                        <Text style={styles.expandedSectionTitle}>Últimas transações</Text>
                        
                        {budget.transactions.slice(0, 3).map((transaction, index) => (
                          <View key={index} style={styles.transactionRow}>
                            <View style={styles.transactionInfo}>
                              <Text style={styles.transactionDesc}>{transaction.description}</Text>
                              <Text style={styles.transactionDate}>{transaction.date} • {transaction.user}</Text>
                            </View>
                            <Text style={styles.transactionAmount}>R$ {transaction.amount.toFixed(2).replace('.', ',')}</Text>
                          </View>
                        ))}
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
              ))}
              
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
                        onPress={() => setShowNewBudgetModal(false)}
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
                      <Text style={styles.inputLabel}>Valor do Orçamento (R$)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={newAllocated}
                        onChangeText={setNewAllocated}
                        placeholder="500,00"
                        keyboardType="decimal-pad"
                      />
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

                        <TouchableOpacity 
                          style={styles.submitButton}
                          onPress={handleEditBudget}
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
                  <Text style={styles.chartTitle}>Progresso das Metas</Text>
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
                        {goalsData.reduce((sum, goal) => sum + goal.current, 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
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
                    <View style={styles.goalDivider} />
                    <View style={styles.goalMetricItem}>
                      <Text style={styles.goalMetricValue}>
                        R$ {goalsData.reduce((sum, goal) => sum + (goal.target - goal.current), 0).toFixed(2).replace('.', ',')}
                      </Text>
                      <Text style={styles.goalMetricLabel}>Valor Restante</Text>
                    </View>
                    <View style={styles.goalDivider} />
                    <View style={styles.goalMetricItem}>
                      <Text style={styles.goalMetricValue}>
                        {goalsData.sort((a, b) => 
                          a.deadline.localeCompare(b.deadline)
                        )[0].deadline}
                      </Text>
                      <Text style={styles.goalMetricLabel}>Próximo Prazo</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Metas Financeiras</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={openNewGoalModal}
                >
                  <Plus size={16} color="#FFF" />
                  <Text style={styles.addButtonText}>Nova Meta</Text>
                </TouchableOpacity>
              </View>

              {goalsData.map(goal => (
                <View key={goal.id} style={styles.goalCard}>
                  <TouchableOpacity 
                    style={styles.goalHeader}
                    onPress={() => toggleGoalExpanded(goal.id)}
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
                          R$ {goal.current.toFixed(2).replace('.', ',')} <Text style={styles.goalTargetText}>/ R$ {goal.target.toFixed(2).replace('.', ',')}</Text>
                        </Text>
                        <Text style={styles.goalPercentageText}>
                          {goal.percentage}%
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                  
                  {expandedGoal === goal.id && (
                    <View style={styles.goalExpanded}>
                      <View style={styles.goalDepositsSection}>
                        <Text style={styles.expandedSectionTitle}>Histórico de Depósitos</Text>
                        
                        {goal.deposits.map((deposit, index) => (
                          <View key={index} style={styles.depositRow}>
                            <View style={styles.depositInfo}>
                              <View style={[
                                styles.userIcon, 
                                { backgroundColor: deposit.user === 'Maria' ? 'rgba(182, 135, 254, 0.2)' : 'rgba(0, 115, 234, 0.2)' }
                              ]}>
                                <User size={16} color={deposit.user === 'Maria' ? '#b687fe' : '#0073ea'} />
                              </View>
                              <View>
                                <Text style={styles.depositUserName}>{deposit.user}</Text>
                                <Text style={styles.depositDate}>{deposit.date}</Text>
                              </View>
                            </View>

                            <Text style={styles.depositAmount}>+R$ {deposit.amount.toFixed(2).replace('.', ',')}</Text>
                          </View>
                        ))}
                      </View>
                      
                      <View style={styles.teamProgress}>
                        <Text style={styles.expandedSectionTitle}>Progresso da Equipe</Text>
                        
                        <View style={styles.teamMembersProgress}>
                          {goal.teamContributions.map((member, index) => (
                            <View key={index} style={styles.teamMember}>
                              <View style={[styles.teamMemberIcon, { backgroundColor: member.name === 'Maria' ? 'rgba(182, 135, 254, 0.2)' : 'rgba(0, 115, 234, 0.2)' }]}>
                                <User size={18} color={member.name === 'Maria' ? '#b687fe' : '#0073ea'} />
                              </View>
                              <View style={styles.teamMemberInfo}>
                                <View style={styles.teamMemberNameRow}>
                                  <Text style={styles.teamMemberName}>{member.name}</Text>
                                  <Text style={styles.teamMemberContribution}>R$ {member.amount.toFixed(2).replace('.', ',')}</Text>
                                </View>
                                <View style={styles.teamMemberBarContainer}>
                                  <View 
                                    style={[
                                      styles.teamMemberBar, 
                                      { 
                                        width: `${member.percentage}%`,
                                        backgroundColor: member.name === 'Maria' ? '#b687fe' : '#0073ea'
                                      }
                                    ]} 
                                  />
                                </View>
                                <Text style={styles.teamMemberPercentage}>{member.percentage}%</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                      
                      <View style={styles.goalActions}>
                        <TouchableOpacity 
                          style={styles.goalActionButton}
                          onPress={() => openAddDepositModal(goal)}
                        >
                          <DollarSign size={16} color="#FFF" />
                          <Text style={styles.goalActionButtonText}>Adicionar Depósito</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.goalActionButton, styles.goalEditButton]}
                          onPress={() => openEditGoalModal(goal)}
                        >
                          <Text style={styles.goalEditButtonText}>Editar Meta</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              ))}
              
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
                        onPress={() => setShowNewGoalModal(false)}
                      >
                        <X size={24} color="#333" />
                      </TouchableOpacity>
                    </View>
                    
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
                      <Text style={styles.inputLabel}>Valor da Meta (R$)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={newGoalAmount}
                        onChangeText={setNewGoalAmount}
                        placeholder="10000,00"
                        keyboardType="decimal-pad"
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Prazo</Text>
                      <TextInput
                        style={styles.textInput}
                        value={newGoalDeadline}
                        onChangeText={setNewGoalDeadline}
                        placeholder="Ex: Dez 2023"
                      />
                    </View>

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
                          />
                        </View>
                        
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Valor da Meta (R$)</Text>
                          <TextInput
                            style={styles.textInput}
                            value={currentGoal.target.toString()}
                            onChangeText={(text) => setCurrentGoal({
                              ...currentGoal, 
                              target: parseFloat(text) || 0,
                              percentage: (currentGoal.current / (parseFloat(text) || 1)) * 100
                            })}
                            keyboardType="decimal-pad"
                          />
                        </View>
                        
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Prazo</Text>
                          <TextInput
                            style={styles.textInput}
                            value={currentGoal.deadline}
                            onChangeText={(text) => setCurrentGoal({...currentGoal, deadline: text})}
                          />
                        </View>

                        <TouchableOpacity 
                          style={styles.submitButton}
                          onPress={() => {
                            const updatedGoals = goalsData.map(goal => 
                              goal.id === currentGoal.id ? currentGoal : goal
                            );
                            
                            setGoalsData(updatedGoals);
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
              
              {/* Modal para adicionar depósito */}
              <Modal
                visible={showAddDepositModal}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Adicionar Depósito</Text>
                      <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => setShowAddDepositModal(false)}
                      >
                        <X size={24} color="#333" />
                      </TouchableOpacity>
                    </View>
                    
                    {currentGoal && (
                      <>
                        <View style={styles.goalSummary}>
                          <Text style={styles.goalSummaryTitle}>{currentGoal.title}</Text>
                          <Text style={styles.goalSummaryAmount}>
                            R$ {currentGoal.current.toFixed(2).replace('.', ',')} / R$ {currentGoal.target.toFixed(2).replace('.', ',')}
                          </Text>
                        </View>
                      
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Quem está depositando</Text>
                          <View style={styles.userSelectorContainer}>
                            <TouchableOpacity 
                              style={[
                                styles.userSelectorButton,
                                selectedUser === 'Maria' && styles.userSelectorButtonActive
                              ]}
                              onPress={() => setSelectedUser('Maria')}
                            >
                              <User size={16} color={selectedUser === 'Maria' ? '#FFF' : '#666'} />
                              <Text style={[
                                styles.userSelectorButtonText,
                                selectedUser === 'Maria' && styles.userSelectorButtonTextActive
                              ]}>Maria</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={[
                                styles.userSelectorButton,
                                selectedUser === 'João' && styles.userSelectorButtonActive
                              ]}
                              onPress={() => setSelectedUser('João')}
                            >
                              <User size={16} color={selectedUser === 'João' ? '#FFF' : '#666'} />
                              <Text style={[
                                styles.userSelectorButtonText,
                                selectedUser === 'João' && styles.userSelectorButtonTextActive
                              ]}>João</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                        
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Valor do Depósito (R$)</Text>
                          <TextInput
                            style={styles.textInput}
                            value={newDepositAmount}
                            onChangeText={setNewDepositAmount}
                            placeholder="500,00"
                            keyboardType="decimal-pad"
                          />
                        </View>

                        <TouchableOpacity 
                          style={styles.submitButton}
                          onPress={handleAddDeposit}
                        >
                          <Text style={styles.submitButtonText}>Adicionar Depósito</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </Modal>
            </View>
          )}
        </ScrollView>

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
                      // Lógica para adicionar nova transação
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
                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuModalVisible(false);
                      router.replace('/(auth)/register');
                    }}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(182, 135, 254, 0.15)' }]}>
                      <Info size={24} color={theme.primary} />
                    </View>
                    <Text style={[styles.menuItemTitle, { color: '#333' }]}>Cadastro</Text>
                    <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Novo usuário</Text>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 10,
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
    borderBottomColor: '#6930c3',
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
    flex: 1,
    paddingLeft: 20,
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
    color: '#6930c3',
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
    marginTop: 20,
    justifyContent: 'center',
  },
  budgetActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6930c3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 0.7,
    shadowColor: '#6930c3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#6930c3',
    backgroundColor: 'rgba(105, 48, 195, 0.1)',
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
    color: '#6930c3',
    backgroundColor: 'rgba(105, 48, 195, 0.1)',
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
  goalDepositsSection: {
    marginBottom: 20,
  },
  depositRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  depositInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  depositUserName: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
  },
  depositDate: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#888',
  },
  depositAmount: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#4CD964',
  },
  teamProgress: {
    marginBottom: 20,
  },
  teamMembersProgress: {
    
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamMemberIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  teamMemberName: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
  },
  teamMemberContribution: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
  },
  teamMemberBarContainer: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 4,
  },
  teamMemberBar: {
    height: 6,
    borderRadius: 3,
  },
  teamMemberPercentage: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#888',
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  goalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6930c3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 0.48,
    shadowColor: '#6930c3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  goalActionButtonText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#FFF',
    marginLeft: 8,
  },
  goalEditButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6930c3',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  goalEditButtonText: {
    color: '#6930c3',
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
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
  submitButton: {
    backgroundColor: '#6930c3',
    padding: width < 360 ? 14 : 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#6930c3',
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
    backgroundColor: '#6930c3',
    borderColor: '#6930c3',
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
    color: '#6930c3',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    backgroundColor: 'rgba(105, 48, 195, 0.1)',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalMetricItem: {
    flex: 1,
    alignItems: 'center',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: width < 360 ? 10 : 20, // Responsive padding
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    height: 80,
  },
  navItem: {
    alignItems: 'center',
    width: width < 360 ? 50 : 60, // Responsive width
  },
  navText: {
    fontSize: 11, // Smaller font size for better fit
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#999',
    marginTop: 4,
    textAlign: 'center', // Ensure text is centered
  },
  addButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#b687fe',
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
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }
    }),
  },
}); 