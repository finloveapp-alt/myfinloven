import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Platform, AppState } from 'react-native';
import { Search, BarChart, Menu, PlusCircle, Receipt, CreditCard, Home, Bell, Info, ExternalLink, Wallet, User, Diamond, Tag } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { fontFallbacks } from '@/utils/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import themes from '@/constants/themes';

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

export default function Notifications() {
  const [theme, setTheme] = useState(getInitialTheme());
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  
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

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView}>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Text style={styles.title}>Notificações</Text>
          <TouchableOpacity>
            <Search size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Novas</Text>
          <NotificationItem name="Ana" />
          <NotificationItem name="Achmad Fiqrih" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Anterior</Text>
          <NotificationItem name="Achmad Fiqrih" />
          <NotificationItem name="Achmad Fiqrih" />
          <NotificationItem name="Achmad Fiqrih" />
        </View>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card }]}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/(app)/dashboard')}
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
          style={styles.addButton}
          onPress={() => router.push('/(app)/registers')}
        >
          <View style={[styles.addButtonInner, { backgroundColor: theme.primary }]}>
            <PlusCircle size={32} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
        >
          <Receipt size={24} color={theme.primary} />
          <Text style={[styles.navText, { color: theme.primary }]}>Notificações</Text>
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
                <Text style={[styles.closeButtonText, { color: theme.primary }]}>Fechar</Text>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <CreditCard size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Cartões</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Cartões de crédito</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/categories');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <Tag size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Categorias</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Gerenciar categorias</Text>
                </TouchableOpacity>
              </View>

              {/* Terceira linha */}
              <View style={styles.menuRow}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/profile');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <User size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Perfil</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Configurações</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/subscription');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `${theme.primary}26` }]}>
                    <Diamond size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Assinatura</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Planos e preços</Text>
                </TouchableOpacity>

                <View style={styles.menuItem}>
                  {/* Item vazio para manter o alinhamento */}
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.closeFullButton, { backgroundColor: theme.primary }]}
              onPress={() => setMenuModalVisible(false)}
            >
              <Text style={[styles.closeFullButtonText, { color: '#ffffff' }]}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function NotificationItem({ name }: { name: string }) {
  return (
    <TouchableOpacity style={styles.notification}>
      <View style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.message}>Sua transferência para 4140581094 foi bem-sucedida.</Text>
        <Text style={styles.time}>16:48 Ter 2021</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    marginBottom: 80, // Adicionar espaço para o bottom navigation
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    color: '#ffffff',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: '#131313',
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F5FF',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#131313',
  },
  message: {
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  // Bottom Navigation Styles
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
    flex: 1,
  },
  navText: {
    fontSize: Platform.OS === 'android' ? 10 : 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
    numberOfLines: 1,
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
        elevation: 0,
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
    minHeight: 80,
    justifyContent: 'flex-start',
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
        elevation: 0,
      },
    }),
  },
  menuItemTitle: {
    fontSize: Platform.OS === 'android' ? 12 : 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    textAlign: 'center',
    marginBottom: 4,
    numberOfLines: 1,
    flexWrap: 'wrap',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeFullButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
});