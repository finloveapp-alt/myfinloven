import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Diamond, Crown, Check, X } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import themes from '@/constants/themes';
import { fontFallbacks } from '@/utils/styles';
import BottomNavigation from '@/components/BottomNavigation';

export default function Subscription() {
  const [theme, setTheme] = useState(themes.feminine);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'monthly' | 'annual'>('free');

  // Carregar tema do AsyncStorage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('@MyFinlove:theme');
        if (storedTheme === 'masculine') {
          setTheme(themes.masculine);
        } else {
          setTheme(themes.feminine);
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      }
    };
    
    loadTheme();
  }, []);

  const PlanCard = ({ 
    type, 
    title, 
    subtitle, 
    price, 
    isSelected, 
    onPress, 
    isPremium = false 
  }: {
    type: 'free' | 'monthly' | 'annual';
    title: string;
    subtitle: string;
    price?: string;
    isSelected: boolean;
    onPress: () => void;
    isPremium?: boolean;
  }) => (
    <TouchableOpacity 
      style={[
        styles.planCard, 
        isSelected && styles.selectedPlanCard,
        type === 'free' && styles.freePlanCard,
        type === 'monthly' && styles.monthlyPlanCard,
        type === 'annual' && styles.annualPlanCard
      ]} 
      onPress={onPress}
    >
      <View style={styles.planCardContent}>
        <View style={styles.planIcon}>
          {type === 'free' ? (
            <Diamond size={24} color="#ffffff" />
          ) : (
            <Crown size={24} color="#ffffff" />
          )}
        </View>
        <View style={styles.planInfo}>
          <Text style={[
            styles.planTitle,
            (type === 'free' || isPremium) && { color: '#ffffff' }
          ]}>
            {title}
          </Text>
          <Text style={[
            styles.planSubtitle,
            (type === 'free' || isPremium) && { color: '#ffffff', opacity: 0.8 }
          ]}>
            {subtitle}
          </Text>
        </View>
        {price && (
          <Text style={[styles.planPrice, { color: '#ffffff' }]}>
            {price}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const ResourceRow = ({ 
    title, 
    freeValue, 
    premiumValue, 
    isBoolean = false 
  }: {
    title: string;
    freeValue: string | boolean;
    premiumValue: string | boolean;
    isBoolean?: boolean;
  }) => (
    <View style={styles.resourceRow}>
      <Text style={styles.resourceTitle}>{title}</Text>
      <View style={styles.resourceValues}>
        <View style={styles.resourceValue}>
          {isBoolean ? (
            freeValue ? (
              <Check size={20} color="#4CD964" />
            ) : (
              <X size={20} color="#FF3B30" />
            )
          ) : (
            <Text style={styles.resourceText}>{freeValue as string}</Text>
          )}
        </View>
        <View style={styles.resourceValue}>
          {isBoolean ? (
            premiumValue ? (
              <Check size={20} color="#4CD964" />
            ) : (
              <X size={20} color="#FF3B30" />
            )
          ) : (
            <Text style={[styles.resourceText, { color: '#4CD964' }]}>
              {premiumValue as string}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Diamond size={24} color={theme.primary} />
          </View>
          <Text style={styles.headerTitle}>Gerenciamento de Assinatura</Text>
          <Text style={styles.headerSubtitle}>
            Gerencie seu plano atual e aproveite todos os recursos disponíveis
          </Text>
        </View>

        {/* Planos */}
        <View style={styles.plansContainer}>
          <PlanCard
            type="free"
            title="Plano Gratuito"
            subtitle="Recursos limitados"
            isSelected={selectedPlan === 'free'}
            onPress={() => setSelectedPlan('free')}
          />
          
          <PlanCard
            type="monthly"
            title="Plano Premium"
            subtitle=""
            price="R$9,90 mensal"
            isSelected={selectedPlan === 'monthly'}
            onPress={() => setSelectedPlan('monthly')}
            isPremium={true}
          />
          
          <PlanCard
            type="annual"
            title="Plano Premium"
            subtitle=""
            price="R$99,90 anual"
            isSelected={selectedPlan === 'annual'}
            onPress={() => setSelectedPlan('annual')}
            isPremium={true}
          />
        </View>

        {/* Tabela de Recursos */}
        <View style={styles.resourcesContainer}>
          <View style={styles.resourcesHeader}>
            <Text style={styles.resourcesTitle}>Recursos</Text>
            <View style={styles.resourcesHeaderIcons}>
                             <View style={styles.resourcesHeaderItem}>
                 <View style={styles.heartIcon}>
                   <Text style={styles.heartEmoji}>❤️</Text>
                 </View>
                 <Text style={styles.resourcesHeaderText}>Gratuito</Text>
               </View>
              <View style={styles.resourcesHeaderItem}>
                <View style={styles.crownIcon}>
                  <Crown size={20} color="#FFD700" />
                </View>
                <Text style={styles.resourcesHeaderText}>Premium</Text>
              </View>
            </View>
          </View>

          <View style={styles.resourcesList}>
            <ResourceRow
              title="Movimentações"
              freeValue="15/mês"
              premiumValue="ilimitado"
            />
            
            <ResourceRow
              title="Cartões"
              freeValue="1"
              premiumValue="Vários"
            />
            
            <ResourceRow
              title="Contas bancárias"
              freeValue="2"
              premiumValue="ilimitadas"
            />
            
            <ResourceRow
              title="Relatórios detalhados"
              freeValue={false}
              premiumValue={true}
              isBoolean={true}
            />
            
            <ResourceRow
              title="Categorias"
              freeValue="2"
              premiumValue="ilimitadas"
            />
            
            <ResourceRow
              title="Metas financeiras"
              freeValue="1"
              premiumValue="ilimitadas"
            />
            
            <ResourceRow
              title="Orçamentos"
              freeValue="1"
              premiumValue="ilimitados"
            />
          </View>
        </View>

        {/* Garantia */}
        <View style={styles.guaranteeContainer}>
          <View style={styles.guaranteeIcon}>
            <Text style={styles.guaranteeIconText}>⚠️</Text>
          </View>
          <Text style={styles.guaranteeText}>
            Garantia de 7 dias. Se não estiver satisfeito, devolvemos seu dinheiro.
          </Text>
        </View>
      </ScrollView>

      <BottomNavigation theme={theme} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100, // Espaço para o bottom navigation
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerIcon: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  planCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  selectedPlanCard: {
    // Pode adicionar estilo para plano selecionado se necessário
  },
  freePlanCard: {
    backgroundColor: '#4a5568', // Cor escura como na imagem
  },
  monthlyPlanCard: {
    backgroundColor: '#CD5C5C', // Cor coral/vermelha para o plano mensal
  },
  annualPlanCard: {
    backgroundColor: '#DAA520', // Cor dourada para o plano anual
  },
  premiumPlanCard: {
    // Removido pois agora usamos monthlyPlanCard e annualPlanCard
  },
  planCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  planIcon: {
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
    marginBottom: 2,
  },
  planSubtitle: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  planPrice: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  resourcesContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  resourcesHeader: {
    backgroundColor: '#4a5568',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resourcesTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#ffffff',
  },
  resourcesHeaderIcons: {
    flexDirection: 'row',
  },
  resourcesHeaderItem: {
    alignItems: 'center',
    marginLeft: 24,
  },
  heartIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  heartEmoji: {
    fontSize: 16,
  },
  crownIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  resourcesHeaderText: {
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#ffffff',
  },
  resourcesList: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resourceTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333',
  },
  resourceValues: {
    flexDirection: 'row',
    width: 140,
  },
  resourceValue: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#666',
    textAlign: 'center',
  },
  guaranteeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff5f5',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  guaranteeIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  guaranteeIconText: {
    fontSize: 16,
  },
  guaranteeText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    lineHeight: 20,
  },
}); 