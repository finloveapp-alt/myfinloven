import React from 'react';
import { View, Text, Modal, TouchableOpacity, Platform } from 'react-native';
import { Home, PlusCircle, Bell, BarChart, CreditCard, Wallet, ArrowUpCircle, ExternalLink } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { fontFallbacks } from '@/utils/styles';
import themes from '@/constants/themes';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  theme: any;
}

export default function MenuModal({ visible, onClose, theme }: MenuModalProps) {
  const router = useRouter();

  const styles = {
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
      flexDirection: 'row' as const,
      justifyContent: 'flex-end' as const,
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
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      marginBottom: 24,
    },
    menuItem: {
      width: '30%',
      alignItems: 'center' as const,
    },
    menuIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 18,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
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
      textAlign: 'center' as const,
      marginBottom: 4,
    },
    menuItemSubtitle: {
      fontSize: 12,
      fontFamily: fontFallbacks.Poppins_400Regular,
      textAlign: 'center' as const,
      opacity: 0.8,
    },
    closeFullButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center' as const,
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
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.menuModalContainer}>
        <View style={[styles.menuModalContent, { backgroundColor: theme.card }]}>
          <View style={styles.menuHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
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
                  onClose();
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
                  onClose();
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
                  onClose();
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
                  onClose();
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
                  onClose();
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
                  onClose();
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
                  onClose();
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
                  onClose();
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
                  onClose();
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
            onPress={onClose}
          >
            <Text style={styles.closeFullButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
} 