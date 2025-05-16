import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Animated } from 'react-native';
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
    try {
      router.back();
    } catch (error) {
      // Fallback em caso de erro
      router.navigate('/(app)');
    }
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
  const maxIndex = weekData.findIndex(item => item.value === maxValue);

  // Referências para animação
  const barAnimations = useRef(weekData.map(() => new Animated.Value(0))).current;
  
  // Animar as barras quando o componente montar
  useEffect(() => {
    Animated.stagger(100, 
      barAnimations.map(anim => 
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  // Calcular média e gasto total
  const mediaGasto = Math.round(weekData.reduce((acc, item) => acc + item.value, 0) / weekData.length);
  const gastoTotal = weekData.reduce((acc, item) => acc + item.value, 0);

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
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Gastos Semanais</Text>
          </View>
          
          <View style={styles.chartWrapper}>
            <View style={styles.chart}>
              {/* Linhas de grade horizontais */}
              <View style={styles.gridLines}>
                {[0, 1, 2].map((_, index) => (
                  <View key={index} style={styles.gridLine} />
                ))}
              </View>
              
              {weekData.map((item, index) => {
                // Destacar apenas o valor máximo
                const isMax = item.value === maxValue;
                
                return (
                  <View key={index} style={styles.chartColumn}>
                    <View style={styles.barContainer}>
                      <Animated.View 
                        style={[
                          styles.bar, 
                          { 
                            height: (item.value / maxValue) * 120,
                            transform: [
                              { scaleY: barAnimations[index] }
                            ],
                            opacity: barAnimations[index].interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.4, 1]
                            })
                          },
                          isMax && styles.maxBar
                        ]}
                      />
                    </View>
                    <Text style={styles.chartLabel}>{item.day}</Text>
                    <Text style={[
                      styles.chartValue,
                      isMax && styles.maxValueText
                    ]}>R$ {item.value}</Text>
                  </View>
                );
              })}
            </View>
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  chartWrapper: {
    paddingHorizontal: 8,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 10,
    paddingBottom: 10,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 50,
    justifyContent: 'space-between',
    zIndex: 0,
  },
  gridLine: {
    height: 1,
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
  chartColumn: {
    alignItems: 'center',
    width: '13%',
    zIndex: 1,
  },
  barContainer: {
    height: 130,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: 18,
    backgroundColor: '#6366f1',
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  maxBar: {
    backgroundColor: '#5145e5',
  },
  chartLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 10,
    marginBottom: 3,
    fontWeight: '500',
  },
  chartValue: {
    fontSize: 11,
    color: '#333',
    fontWeight: '600',
  },
  maxValueText: {
    color: '#5145e5',
    fontWeight: '700',
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