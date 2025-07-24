import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Diamond, Crown, Check, X } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Purchases, { PurchasesOffering, PurchasesPackage, LOG_LEVEL } from 'react-native-purchases';
import themes from '@/constants/themes';
import { fontFallbacks } from '@/utils/styles';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/lib/supabase';

export default function Subscription() {
  const [theme, setTheme] = useState(themes.feminine);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'monthly' | 'annual'>('free');
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Inicializar RevenueCat
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        // Verificar se Purchases está disponível e se tem os métodos necessários
        if (!Purchases || typeof Purchases.configure !== 'function') {
          console.warn('RevenueCat não está disponível neste ambiente - usando modo simulado');
          return;
        }

        // Verificar se setLogLevel está disponível antes de usar
        if (typeof Purchases.setLogLevel === 'function') {
          Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
        }
        
        console.log('Iniciando configuração do RevenueCat...');
        
        // Obter o usuário atual do Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Erro ao obter usuário do Supabase:', userError);
          console.warn('Continuando sem user_id - RevenueCat usará ID anônimo');
        }
        
        const userId = user?.id;
        console.log('User ID do Supabase para RevenueCat:', userId);
        
        // Configurar RevenueCat baseado na plataforma
        if (Platform.OS === 'ios') {
          await Purchases.configure({
            apiKey: 'appl_your_ios_api_key_here', // Substitua pela chave iOS
            appUserID: userId, // Usar o ID do usuário do Supabase
          });
        } else if (Platform.OS === 'android') {
          await Purchases.configure({
            apiKey: 'goog_DBbaqJRWLlHiVzmqtsAGnTcYkqS',
            appUserID: userId, // Usar o ID do usuário do Supabase
          });
        }
        
        console.log('RevenueCat configurado com sucesso com user_id:', userId);
        
        // Buscar ofertas disponíveis
        const offerings = await Purchases.getOfferings();
        if (offerings.current) {
          setOfferings(offerings.current);
          console.log('Ofertas carregadas:', offerings.current);
        }
      } catch (error) {
        console.error('Erro ao inicializar RevenueCat:', error);
        console.warn('Continuando sem RevenueCat - funcionalidades de compra serão simuladas');
      }
    };
    
    // Aguardar um pouco antes de inicializar para garantir que os módulos nativos estejam carregados
    const timer = setTimeout(initRevenueCat, 1000);
    return () => clearTimeout(timer);
  }, []);

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

  // Função para realizar compra
  const handlePurchase = async (productId: string) => {
    if (isPurchasing) return;
    
    // Verificar se RevenueCat está disponível
    if (!Purchases || typeof Purchases.purchaseProduct !== 'function') {
      Alert.alert(
        'Modo de demonstração',
        'Esta é uma demonstração. Em um ambiente de produção, a compra seria processada aqui.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsPurchasing(true);
    try {
      const purchaserInfo = await Purchases.purchaseProduct(productId);
      
      if (purchaserInfo.customerInfo.entitlements.active['premium']) {
        Alert.alert(
          'Compra realizada!',
          'Sua assinatura premium foi ativada com sucesso.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert(
          'Erro na compra',
          'Não foi possível processar sua compra. Tente novamente.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  // Função para restaurar compras
  const handleRestorePurchases = async () => {
    if (isRestoring) return;
    
    // Verificar se RevenueCat está disponível
    if (!Purchases || typeof Purchases.restorePurchases !== 'function') {
      Alert.alert(
        'Modo de demonstração',
        'Esta é uma demonstração. Em um ambiente de produção, as compras seriam restauradas aqui.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsRestoring(true);
    try {
      const purchaserInfo = await Purchases.restorePurchases();
      
      if (purchaserInfo.entitlements.active['premium']) {
        Alert.alert(
          'Compras restauradas!',
          'Sua assinatura premium foi restaurada com sucesso.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Nenhuma compra encontrada',
          'Não foram encontradas compras anteriores para restaurar.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Erro ao restaurar',
        'Não foi possível restaurar suas compras. Tente novamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRestoring(false);
    }
  };

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
  }) => {
    const handleCardPress = () => {
      if (type === 'monthly') {
        handlePurchase('premium_monthly:plano-mensal');
      } else if (type === 'annual') {
        handlePurchase('premium_annual:premium-anual');
      } else {
        onPress();
      }
    };

    return (
      <TouchableOpacity 
        style={[
          styles.planCard, 
          isSelected && styles.selectedPlanCard,
          type === 'free' && styles.freePlanCard,
          type === 'monthly' && styles.monthlyPlanCard,
          type === 'annual' && styles.annualPlanCard
        ]} 
        onPress={handleCardPress}
        disabled={isPurchasing && (type === 'monthly' || type === 'annual')}
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
              {isPurchasing && (type === 'monthly' || type === 'annual') ? 'Processando...' : price}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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

        {/* Botão Restaurar Compras */}
        <View style={styles.restoreContainer}>
          <TouchableOpacity 
            style={styles.restoreButton}
            onPress={handleRestorePurchases}
            disabled={isRestoring}
          >
            <Text style={styles.restoreButtonText}>
              {isRestoring ? 'Restaurando...' : 'Restaurar Compras'}
            </Text>
          </TouchableOpacity>
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
    paddingTop: 50,
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
  restoreContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  restoreButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#666',
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