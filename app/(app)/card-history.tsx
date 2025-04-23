import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Trash2, DollarSign, ArrowRight, Repeat } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import BottomNavigation from '@/components/BottomNavigation';

const theme = {
  primary: '#6366f1',
  card: '#ffffff',
};

const transactions = [
  {
    id: '1',
    title: 'Receita',
    date: '18 Abril 2021',
    amount: 150,
    type: 'income',
    icon: 'income'
  },
  {
    id: '2',
    title: 'Despesa',
    date: '20 Abril 2021',
    amount: 35,
    type: 'expense',
    icon: 'expense'
  },
  {
    id: '3',
    title: 'Transferência',
    date: '19 Abril 2021',
    amount: 75,
    type: 'transfer',
    icon: 'transfer'
  },
  {
    id: '4',
    title: 'Receita',
    date: '18 Abril 2021',
    amount: 150,
    type: 'income',
    icon: 'income'
  },
  {
    id: '5',
    title: 'Despesa',
    date: '17 Abril 2021',
    amount: 103,
    type: 'expense',
    icon: 'expense'
  },
  {
    id: '6',
    title: 'Transferência',
    date: '18 Abril 2021',
    amount: 150,
    type: 'transfer',
    icon: 'transfer'
  },
  {
    id: '7',
    title: 'Receita',
    date: '16 Abril 2021',
    amount: 200,
    type: 'income',
    icon: 'income'
  },
];

export default function CardHistory() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  const filters = [
    { id: 'all', label: 'Todos', icon: '⊞' },
    { id: 'income', label: 'Receita', icon: '💰' },
    { id: 'expense', label: 'Despesa', icon: '💳' },
    { id: 'transfer', label: 'Transferência', icon: '↔️' },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    if (selectedFilter === 'Todos') return true;
    if (selectedFilter === 'Receita') return transaction.type === 'income';
    if (selectedFilter === 'Despesa') return transaction.type === 'expense';
    if (selectedFilter === 'Transferência') return transaction.type === 'transfer';
    return true;
  });

  const renderIcon = (type: string) => {
    switch(type) {
      case 'income':
        return <DollarSign size={20} color="#4CD964" />;
      case 'expense':
        return <ArrowRight size={20} color="#FF3B30" />;
      case 'transfer':
        return <Repeat size={20} color="#5856D6" />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico do cartão</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.label && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.label)}
            >
              <Text style={[
                styles.filterIcon,
                selectedFilter === filter.label && styles.filterIconActive
              ]}>{filter.icon}</Text>
              <Text style={[
                styles.filterText,
                selectedFilter === filter.label && styles.filterTextActive
              ]}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
      <ScrollView 
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <View style={[
                styles.transactionIcon,
                transaction.type === 'income' ? styles.incomeIcon : 
                transaction.type === 'expense' ? styles.expenseIcon : styles.transferIcon
              ]}>
                {renderIcon(transaction.type)}
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
            </View>
            <View style={styles.transactionRight}>
              <Text style={[
                styles.transactionAmount,
                transaction.type === 'income' ? styles.incomeText : 
                transaction.type === 'expense' ? styles.expenseText : styles.transferText
              ]}>
                {transaction.type === 'income' ? '+' : 
                 transaction.type === 'expense' ? '-' : ''}
                R$ {transaction.amount}
              </Text>
              <TouchableOpacity style={styles.deleteButton}>
                <Trash2 size={16} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <BottomNavigation theme={theme} />
    </View>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#6366f1',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  filtersContainer: {
    backgroundColor: '#6366f1',
    paddingBottom: 20,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#fff',
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 6,
    opacity: 0.9,
  },
  filterIconActive: {
    opacity: 1,
  },
  filterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.9,
  },
  filterTextActive: {
    color: '#6366f1',
    opacity: 1,
  },
  transactionsList: {
    flex: 1,
  },
  transactionsContent: {
    padding: 20,
    paddingBottom: 100,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incomeIcon: {
    backgroundColor: 'rgba(76, 217, 100, 0.15)',
  },
  expenseIcon: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  transferIcon: {
    backgroundColor: 'rgba(88, 86, 214, 0.15)',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#888',
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    marginRight: 12,
  },
  incomeText: {
    color: '#4CD964',
  },
  expenseText: {
    color: '#FF3B30',
  },
  transferText: {
    color: '#5856D6',
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 