import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import BottomNavigation from '@/components/BottomNavigation';

const { width } = Dimensions.get('window');
const cardWidth = width - 40;

const theme = {
  primary: '#6366f1',
  card: '#ffffff',
};

export default function CardDetail() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const weekData = [
    { day: 'Seg', value: 31 },
    { day: 'Ter', value: 27 },
    { day: 'Qua', value: 39 },
    { day: 'Qui', value: 14 },
    { day: 'Sex', value: 28 },
    { day: 'Sáb', value: 24 },
    { day: 'Dom', value: 33 },
  ];

  const maxValue = Math.max(...weekData.map(item => item.value));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Cartão</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card */}
        <LinearGradient
          colors={['#b687fe', '#8d9eff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.card}
        >
          <Text style={styles.cardLabel}>Saldo</Text>
          <Text style={styles.cardBalance}>R$ 293.214</Text>
          <Text style={styles.cardNumber}>4231 5432 3218 4563</Text>
          <Text style={styles.cardExpiry}>02/25</Text>
        </LinearGradient>

        {/* Balance */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Saldo</Text>
          <Text style={styles.balanceAmount}>R$ 875,46</Text>
        </View>

        {/* Income/Expenditure */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.incomeCard]}>
            <View style={styles.statIcon}>
              <Text style={styles.plusIcon}>+</Text>
            </View>
            <View>
              <Text style={styles.statAmount}>R$ 250</Text>
              <Text style={styles.statLabel}>Receitas</Text>
            </View>
          </View>

          <View style={[styles.statCard, styles.expenditureCard]}>
            <View style={[styles.statIcon, styles.expenditureIcon]}>
              <Text style={styles.minusIcon}>-</Text>
            </View>
            <View>
              <Text style={styles.statAmount}>R$ 108</Text>
              <Text style={styles.statLabel}>Despesas</Text>
            </View>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chart}>
            {weekData.map((item, index) => (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { height: (item.value / maxValue) * 120 }
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{item.day}</Text>
                <Text style={styles.chartValue}>R$ {item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Card History Button */}
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => router.push('/(app)/card-history')}
        >
          <Text style={styles.historyButtonText}>Histórico do Cartão</Text>
        </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  card: {
    width: cardWidth,
    height: cardWidth * 0.6,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  cardLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 6,
  },
  cardBalance: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 20,
  },
  cardNumber: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    letterSpacing: 2,
    marginBottom: 6,
  },
  cardExpiry: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  balanceSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    width: '48%',
  },
  incomeCard: {
    backgroundColor: '#f0fdf4',
  },
  expenditureCard: {
    backgroundColor: '#fef2f2',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  expenditureIcon: {
    backgroundColor: '#ef4444',
  },
  plusIcon: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  minusIcon: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  statAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
  },
  chartColumn: {
    alignItems: 'center',
    width: '14%',
  },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 3,
    backgroundColor: '#6366f1',
    borderRadius: 1.5,
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    marginBottom: 2,
  },
  chartValue: {
    fontSize: 11,
    color: '#000',
    fontWeight: '500',
  },
  historyButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 32,
  },
  historyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
}); 