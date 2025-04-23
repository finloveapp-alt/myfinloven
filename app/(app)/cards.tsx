import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Plus, CreditCard, X, BarChart, Menu, PlusCircle, Receipt, Home, Bell, Info, ExternalLink, Wallet } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { fontFallbacks } from '@/utils/styles';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.6;
const cardHeight = cardWidth * 0.6;

const theme = {
  primary: '#b687fe',
  card: '#ffffff',
};

export default function Cards() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const handleAddCard = () => {
    if (!cardNumber || !cardName || !expiryDate || !cvv || !selectedType) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos');
      return;
    }
    
    // Aqui você adicionaria a lógica para salvar o cartão
    Alert.alert('Sucesso', 'Cartão adicionado com sucesso!');
    setIsModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
    setSelectedType('');
  };

  const transactions = [
    {
      id: '1',
      title: 'Apartamento',
      date: '21 Abril 2021',
      amount: 120,
      type: 'expense',
      iconBg: '#FFE2E6',
      icon: '🏢'
    },
    {
      id: '2',
      title: 'Pagamento',
      date: '18 Abril 2021',
      amount: 150,
      type: 'income',
      iconBg: '#E3F5FF',
      icon: '💳'
    },
    {
      id: '3',
      title: 'Compra Online',
      date: '19 Abril 2021',
      amount: 75,
      type: 'expense',
      iconBg: '#FFE2E6',
      icon: '🛍️'
    },
    {
      id: '4',
      title: 'Pagamento',
      date: '18 Abril 2021',
      amount: 150,
      type: 'income',
      iconBg: '#E3F5FF',
      icon: '💳'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Cartões</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
          decelerationRate="fast"
          snapToInterval={cardWidth + 16}
          style={styles.cardsScroll}
        >
          <TouchableOpacity 
            style={styles.addCardButton}
            onPress={() => setIsModalVisible(true)}
          >
            <View style={styles.addCardContent}>
              <Plus size={20} color="#b687fe" />
              <Text style={styles.addCardText}>Adicionar novo cartão</Text>
            </View>
          </TouchableOpacity>

          <LinearGradient
            colors={['#b687fe', '#9157ec']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity 
              style={styles.cardContent}
              onPress={() => router.push('/(app)/card-detail')}
            >
              <View style={styles.cardHeader}>
                <CreditCard size={24} color="#ffffff" />
                <Text style={styles.cardType}>mastercard</Text>
              </View>
              <Text style={styles.cardBalance}>R$ 875,46</Text>
              <Text style={styles.cardNumber}>124 987 324 ***</Text>
              <View style={styles.viewDetailsContainer}>
                <Text style={styles.viewDetailsText}>Toque para ver detalhes</Text>
                <View style={styles.viewDetailsIcon}>
                  <Text style={styles.viewDetailsIconText}>👆</Text>
                </View>
              </View>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#0073ea', '#0056b3']}
            style={styles.card}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity 
              style={styles.cardContent}
              onPress={() => router.push('/(app)/card-detail')}
            >
              <View style={styles.cardHeader}>
                <CreditCard size={24} color="#ffffff" />
                <Text style={styles.cardType}>VISA</Text>
              </View>
              <Text style={styles.cardBalance}>R$ 560,00</Text>
              <Text style={styles.cardNumber}>753 926 768 ***</Text>
              <View style={styles.viewDetailsContainer}>
                <Text style={styles.viewDetailsText}>Toque para ver detalhes</Text>
                <View style={styles.viewDetailsIcon}>
                  <Text style={styles.viewDetailsIconText}>👆</Text>
                </View>
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>

        <View style={styles.transactionSection}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionTitle}>Histórico de Transações</Text>
            <TouchableOpacity style={styles.filterButton}>
              <View style={styles.filterDots}>
                <View style={styles.filterDot} />
                <View style={styles.filterDot} />
              </View>
            </TouchableOpacity>
          </View>

          {transactions.map((transaction) => (
            <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
              <View style={[styles.transactionIcon, { backgroundColor: transaction.iconBg }]}>
                <Text style={styles.transactionIconText}>{transaction.icon}</Text>
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionName}>{transaction.title}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.type === 'expense' ? '#FF3B30' : '#4CD964' }
              ]}>
                {transaction.type === 'expense' ? '-' : '+'}R$ {transaction.amount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
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
          <View style={styles.addButtonInner}>
            <PlusCircle size={32} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => router.push('/(app)/notifications')}
        >
          <Receipt size={24} color="#999" />
          <Text style={styles.navText}>Notificações</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
        >
          <CreditCard size={24} color={theme.primary} />
          <Text style={[styles.navText, { color: theme.primary }]}>Cartões</Text>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(182, 135, 254, 0.15)` }]}>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(182, 135, 254, 0.15)` }]}>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(182, 135, 254, 0.15)` }]}>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(182, 135, 254, 0.15)` }]}>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(182, 135, 254, 0.15)` }]}>
                    <CreditCard size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Cartões</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Cartões de crédito</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.push('/(app)/accounts');
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(182, 135, 254, 0.15)` }]}>
                    <Wallet size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Contas</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Gerenciar contas</Text>
                </TouchableOpacity>
              </View>

              {/* Terceira linha */}
              <View style={styles.menuRow}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    // Navegação para sobre
                  }}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(182, 135, 254, 0.15)` }]}>
                    <Info size={28} color={theme.primary} />
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
                  <View style={[styles.menuIconContainer, { backgroundColor: `rgba(182, 135, 254, 0.15)` }]}>
                    <ExternalLink size={28} color={theme.primary} />
                  </View>
                  <Text style={[styles.menuItemTitle, { color: '#333' }]}>Logout</Text>
                  <Text style={[styles.menuItemSubtitle, { color: '#666' }]}>Sair do aplicativo</Text>
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
              <Text style={styles.closeFullButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Novo Cartão</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.cardTypeSelector}>
              <TouchableOpacity 
                style={[
                  styles.cardTypeOption,
                  selectedType === 'mastercard' && styles.selectedCardType
                ]}
                onPress={() => setSelectedType('mastercard')}
              >
                <CreditCard size={24} color={selectedType === 'mastercard' ? '#fff' : '#666'} />
                <Text style={[
                  styles.cardTypeText,
                  selectedType === 'mastercard' && styles.selectedCardTypeText
                ]}>Mastercard</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.cardTypeOption,
                  selectedType === 'visa' && styles.selectedCardType
                ]}
                onPress={() => setSelectedType('visa')}
              >
                <CreditCard size={24} color={selectedType === 'visa' ? '#fff' : '#666'} />
                <Text style={[
                  styles.cardTypeText,
                  selectedType === 'visa' && styles.selectedCardTypeText
                ]}>Visa</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Número do Cartão"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              maxLength={19}
              placeholderTextColor="#666"
            />

            <TextInput
              style={styles.input}
              placeholder="Nome no Cartão"
              value={cardName}
              onChangeText={setCardName}
              autoCapitalize="characters"
              placeholderTextColor="#666"
            />

            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="Validade (MM/AA)"
                value={expiryDate}
                onChangeText={setExpiryDate}
                keyboardType="numeric"
                maxLength={5}
                placeholderTextColor="#666"
              />

              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
                placeholder="CVV"
                value={cvv}
                onChangeText={setCvv}
                keyboardType="numeric"
                maxLength={3}
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddCard}
            >
              <Text style={styles.addButtonText}>Adicionar Cartão</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    marginBottom: 80,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#131313',
  },
  cardsScroll: {
    paddingLeft: 16,
  },
  cardsContainer: {
    paddingRight: 16,
    paddingVertical: 16,
  },
  addCardButton: {
    width: cardWidth * 0.8,
    height: cardHeight,
    backgroundColor: '#f5f7fa',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderStyle: 'dashed',
    padding: 12,
  },
  card: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardType: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBalance: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 8,
    letterSpacing: 0.5,
  },
  cardNumber: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
    letterSpacing: 2,
  },
  transactionSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  transactionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#131313',
  },
  filterButton: {
    padding: 8,
  },
  filterDots: {
    flexDirection: 'row',
    gap: 4,
  },
  filterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f7fa',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionIconText: {
    fontSize: 24,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    color: '#131313',
    marginBottom: 4,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#131313',
  },
  closeButton: {
    padding: 8,
  },
  cardTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f7fa',
    marginHorizontal: 8,
  },
  selectedCardType: {
    backgroundColor: '#b687fe',
  },
  cardTypeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  selectedCardTypeText: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#131313',
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 24,
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
    backgroundColor: '#b687fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginTop: 8,
  },
  viewDetailsText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  viewDetailsIcon: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDetailsIconText: {
    fontSize: 16,
  },
  addCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardText: {
    color: '#b687fe',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
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
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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