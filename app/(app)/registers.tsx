import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Platform, Modal, TextInput } from 'react-native';
import { ChevronLeft, ChevronRight, Search, ArrowLeft, Filter, Plus, PlusCircle, X, Calendar, ArrowRight, ArrowDown, DollarSign, CreditCard, RefreshCw, BarChart, Menu, Home, Bell, Receipt, Wallet, Info, ExternalLink, ArrowUp, ArrowUpCircle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import BottomNavigation from '@/components/BottomNavigation';
import { useRouter } from 'expo-router';
import { fontFallbacks } from '@/utils/styles';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Definição de temas
const themes = {
  feminine: {
    primary: '#b687fe',
    secondary: '#8B5CF6',
    accent: '#FF3B30',
    background: '#f5f7fa',
    card: '#ffffff',
    expense: '#FF3B30',
    income: '#4CD964',
    shared: '#0073ea',
    text: '#333333'
  },
  masculine: {
    primary: '#0073ea',
    secondary: '#3c79e6',
    accent: '#FF3B30',
    background: '#f5f7fa',
    card: '#ffffff',
    expense: '#FF3B30',
    income: '#4CD964',
    shared: '#8B5CF6',
    text: '#333333'
  }
};

// Definindo um themeDefault para ser usado no StyleSheet estático
const themeDefault = {
  primary: '#b687fe',
  secondary: '#8B5CF6',
  accent: '#FF3B30',
  background: '#f5f7fa',
  card: '#ffffff',
  expense: '#FF3B30',
  income: '#4CD964',
  shared: '#0073ea',
  text: '#333333'
};

// Mock data para registros de transações (expandido com mais exemplos)
const records = [
  {
    id: '1',
    name: 'Apple',
    amount: 32.65,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Assinatura',
    person: 'Maria',
    recurrent: true,
    icon: '🍎'
  },
  {
    id: '2',
    name: 'Google',
    amount: 32.21,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Assinatura',
    person: 'João',
    recurrent: true,
    icon: '🌐'
  },
  {
    id: '3',
    name: 'Netflix',
    amount: 13.93,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Entretenimento',
    person: 'Maria',
    recurrent: true,
    icon: '📺'
  },
  {
    id: '4',
    name: 'Spotify',
    amount: 10.54,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Entretenimento',
    person: 'Conjunto',
    recurrent: true,
    icon: '🎵'
  },
  {
    id: '5',
    name: 'Mercado',
    amount: 124.87,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Alimentação',
    person: 'João',
    recurrent: false,
    icon: '🛒'
  },
  {
    id: '6',
    name: 'Combustível',
    amount: 89.45,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Transporte',
    person: 'Maria',
    recurrent: false,
    icon: '⛽'
  },
  {
    id: '7',
    name: 'Restaurante',
    amount: 57.80,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Alimentação',
    person: 'Conjunto',
    recurrent: false,
    icon: '🍽️'
  },
  {
    id: '8',
    name: 'Salário',
    amount: 3500.00,
    date: 'April 22',
    day: 'Wednesday',
    type: 'income',
    category: 'Trabalho',
    person: 'João',
    recurrent: true,
    icon: '💰'
  },
  {
    id: '9',
    name: 'Freelance',
    amount: 1200.00,
    date: 'April 22',
    day: 'Wednesday',
    type: 'income',
    category: 'Trabalho',
    person: 'Maria',
    recurrent: false,
    icon: '💻'
  },
  {
    id: '10',
    name: 'Farmácia',
    amount: 43.50,
    date: 'April 22',
    day: 'Wednesday',
    type: 'expense',
    category: 'Saúde',
    person: 'Maria',
    recurrent: false,
    icon: '💊'
  }
];

// Nomes dos dias da semana e meses
const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Lista de contas demo
const demoAccounts = [
  { id: '1', name: 'Nubank', type: 'Conta Corrente', icon: '💜' },
  { id: '2', name: 'Santander', type: 'Conta Poupança', icon: '🔴' },
  { id: '3', name: 'Caixa', type: 'Conta Corrente', icon: '🏦' },
  { id: '4', name: 'Inter', type: 'Conta Digital', icon: '🟠' }
];

// Função para obter o tema inicial
const getInitialTheme = () => {
  // Verificar primeiro se há um tema global definido
  if (global.dashboardTheme === 'masculine') {
    return themes.masculine;
  }
  
  // Se não houver tema global, usar o tema padrão feminino
  return themes.feminine;
};

// Definir o StyleSheet totalmente estático sem nenhuma referência ao tema dinâmico
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor será aplicado inline
  },
  mainScrollView: {
    flex: 1,
    marginBottom: 80, // Para não sobrepor à barra de navegação
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // backgroundColor será aplicado inline
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    color: '#FFF',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  searchButton: {
    padding: 8,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  monthArrow: {
    padding: 5,
  },
  monthYearText: {
    fontSize: 18,
    color: '#FFF',
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  calendarContainer: {
    marginHorizontal: 10,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  calendarHeaderCell: {
    width: width / 7 - 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarHeaderText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    opacity: 0.9,
  },
  calendarCell: {
    width: width / 7 - 10,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayCircle: {
    backgroundColor: '#FFF',
  },
  calendarDay: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  currentMonthDay: {
    color: '#FFF',
  },
  otherMonthDay: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  selectedDayText: {
    // color será aplicada inline baseada no tema
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  currentMonthCell: {},
  otherMonthCell: {
    opacity: 0.6,
  },
  selectedCell: {},
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dateText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
  },
  optionsButton: {
    padding: 8,
  },
  optionsButtonText: {
    fontSize: 20,
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: fontFallbacks.Poppins_400Regular,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  incomeValue: {
    color: '#4CD964',
  },
  expenseValue: {
    color: '#FF3B30',
  },
  divider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  recordsContainer: {
    marginHorizontal: 16,
  },
  recordsTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
  },
  recordsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  addTransactionButton: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
    // backgroundColor será aplicado inline
  },
  addTransactionButtonText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#FFF',
    marginLeft: 6,
  },
  recordsList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  recordIconText: {
    fontSize: 24,
  },
  recordInfo: {
    flex: 1,
  },
  recordName: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
    marginBottom: 2,
  },
  recordDetail: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#888',
  },
  recordAmount: {
    alignItems: 'flex-end',
  },
  recordAmountText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  incomeText: {
    color: '#00B16A',
  },
  expenseText: {
    color: '#333',
  },
  recordFrequency: {
    fontSize: 12,
    color: '#888',
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    maxHeight: '90%',
    zIndex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333333',
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  transactionTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  transactionTypeButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeTypeButton: {
    borderWidth: 1.5,
    // borderColor será aplicado inline
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  transactionTypeText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333333',
  },
  activeTypeText: {
    // color será aplicado inline
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333333',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  calendarButton: {
    padding: 5,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333333',
    marginRight: 5,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333333',
  },
  paymentMethodFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  paymentMethodSelected: {
    // borderColor será aplicado inline
    borderWidth: 1.5,
    backgroundColor: 'rgba(182, 135, 254, 0.05)',
  },
  paymentMethodSelectedText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    flex: 1,
  },
  paymentMethodText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    flex: 1,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  selectPlaceholder: {
    flex: 1,
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  addCategoryText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    marginLeft: 5,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    // backgroundColor será aplicado inline
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#fff',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0073ea',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 999,
  },
  pickerCalendarHeaderCell: {
    width: (width - 80) / 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  pickerCalendarHeaderText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
    opacity: 0.9,
  },
  pickerCalendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  pickerCalendarCell: {
    width: (width - 80) / 7,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerDayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerSelectedDayCircle: {
    backgroundColor: '#FFF',
  },
  pickerCalendarDay: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  pickerCurrentMonthCell: {},
  pickerOtherMonthCell: {
    opacity: 0.6,
  },
  pickerSelectedCell: {},
  pickerCurrentMonthDay: {
    color: '#FFF',
  },
  pickerOtherMonthDay: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  pickerSelectedDayText: {
    // color será aplicada inline baseada no tema
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  calendarPickerContainer: {
    marginTop: 10,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  calendarPickerHeader: {
    padding: 16,
    width: '100%',
    // backgroundColor será aplicado inline com base no tema
  },
  calendarPickerMonthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarPickerArrow: {
    padding: 5,
  },
  calendarPickerMonthText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#FFF',
  },
  pickerCalendarContainer: {
    marginHorizontal: 4,
  },
  paymentMethodsDropdown: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paymentMethodOptionSelected: {
    backgroundColor: 'rgba(182, 135, 254, 0.15)',
  },
  paymentMethodOptionText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333333',
    marginLeft: 12,
  },
  paymentMethodOptionTextSelected: {
    color: '#b687fe', // Usando uma cor fixa que será atualizada inline quando necessário
    fontFamily: fontFallbacks.Poppins_600SemiBold,
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
    // backgroundColor será aplicado inline
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  menuCloseButton: {
    padding: 10,
    borderRadius: 20,
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
    // backgroundColor será aplicado inline
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
    }),
    // backgroundColor será aplicado inline
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333333',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  emptyStateContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    fontFamily: fontFallbacks.Poppins_400Regular,
    textAlign: 'center',
  },
  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  iconSelectorText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    flex: 1,
  },
  selectedIconText: {
    fontSize: 24, 
    marginRight: 12,
  },
  selectedIconLabel: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  iconsDropdown: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  iconsScrollView: {
    maxHeight: 200,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 12,
  },
  iconItem: {
    width: '16.666%', // 6 ícones por linha
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 4,
  },
  selectedIconItem: {
    backgroundColor: 'rgba(182, 135, 254, 0.15)',
  },
  iconEmoji: {
    fontSize: 24,
  },
  sharingTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  sharingTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeSharingButton: {
    borderWidth: 1.5,
    backgroundColor: 'rgba(0, 115, 234, 0.05)',
  },
  sharingTypeText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#666',
  },
  activeSharingText: {
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  partnerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  partnerSelectorText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    flex: 1,
  },
  selectedPartnerText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    flex: 1,
  },
  partnersDropdown: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9998,
  },
  partnerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedPartnerOption: {
    backgroundColor: 'rgba(0, 115, 234, 0.15)',
  },
  partnerOptionText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333333',
  },
  selectedPartnerOptionText: {
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  transactionIndicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
  },
  selectedDayIndicatorsContainer: {
    bottom: 2, // Posiciona os indicadores dentro do círculo branco quando selecionado
    alignSelf: 'center',
  },
  transactionIndicator: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginHorizontal: 1,
  },
  selectedDayIndicator: {
    width: 4, // Tamanho ligeiramente menor quando selecionado
    height: 4,
    borderRadius: 2,
  },
  incomeIndicator: {
    backgroundColor: '#4CD964', // Verde para receitas
  },
  expenseIndicator: {
    backgroundColor: '#FF3B30', // Vermelho para despesas
  },
  transferIndicator: {
    backgroundColor: '#FFCC00', // Amarelo para transferências
  },
  pickerTransactionIndicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -4,
    left: 0,
    right: 0,
  },
  calendarLegendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  legendText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
  calendarGrid: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  weekDayText: {
    width: (width - 40) / 7,
    textAlign: 'center',
    color: '#333',
    fontSize: 12,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: (width - 40) / 7,
    height: 40,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  selectedDayCell: {
    backgroundColor: 'rgba(182, 135, 254, 0.15)',
  },
  todayCell: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dayText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333',
  },
  inactiveDayText: {
    color: 'rgba(150, 150, 150, 0.5)',
  },
  todayText: {
    color: '#0073ea',
  },
  calendarSelectedDayText: {
    color: '#FFF',
  },
  newCategoryContainer: {
    marginTop: 12,
    padding: 16,
    borderWidth: 1.5,
    borderRadius: 12,
    backgroundColor: 'rgba(182, 135, 254, 0.05)',
    // borderColor será aplicado inline
  },
  newCategoryTitle: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    marginBottom: 12,
    // color será aplicado inline
  },
  categoryButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#666',
    marginLeft: 4,
  },
  newCategoryFormContainer: {
    position: 'relative',
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 12, // 0.75rem = 12px
    height: 36,
    borderWidth: 1,
    // borderColor será aplicado inline baseado no tipo de transação
  },
  categoryFormRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emojiSelectorButton: {
    width: 30,
    height: 48,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgb(229, 231, 235)', // #e5e7eb
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emojiSelectorText: {
    fontSize: 24,
    lineHeight: 24,
  },
  categoryNameInput: {
    flex: 1,
    maxWidth: '60%',
    height: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgb(229, 231, 235)', // #e5e7eb
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: 'rgb(44, 44, 44)', // Cor do texto conforme CSS
    backgroundColor: '#ffffff',
  },
  addCategorySubmitButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addCategorySubmitText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  closeCategoryFormButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(248, 250, 252)', // Cor mais suave
    borderWidth: 1,
    borderColor: 'rgb(229, 231, 235)',
  },
  emojiDropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgb(229, 231, 235)', // #e5e7eb
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiGridItem: {
    width: '14.28%', // 7 colunas: 100% / 7
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  emojiGridItemSelected: {
    backgroundColor: 'rgb(243, 244, 246)', // Cor mais suave para seleção
    borderWidth: 1,
    borderColor: 'rgb(209, 213, 219)',
  },
  emojiGridText: {
    fontSize: 20,
    lineHeight: 24,
  },
});

export default function Registers() {
  const router = useRouter();
  const currentDate = new Date();
  const [theme, setTheme] = useState(getInitialTheme()); // Usar a função para inicializar o tema
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth()); // Mês atual (0-indexed)
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear()); // Ano atual
  const [selectedDay, setSelectedDay] = useState(currentDate.getDate()); // Dia atual
  const [modalVisible, setModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState('expense'); // 'expense', 'income', 'transfer'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState(''); // Nova propriedade para descrição da transação
  const [selectedDate, setSelectedDate] = useState(
    `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`
  );
  const [selectedCard, setSelectedCard] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [recurrenceType, setRecurrenceType] = useState('Não recorrente');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null); // Novo estado para armazenar o ID da conta
  const [accountsVisible, setAccountsVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(currentDate.getMonth());
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());
  const [pickerDay, setPickerDay] = useState(currentDate.getDate());
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentMethodsVisible, setPaymentMethodsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Novo estado para controlar o estado de salvamento
  const [errorMessage, setErrorMessage] = useState(''); // Novo estado para mensagens de erro
  const [userAccounts, setUserAccounts] = useState<any[]>([]); // Estado para armazenar as contas do usuário
  const [currentUser, setCurrentUser] = useState<any>(null); // Estado para armazenar o usuário atual
  const [transactions, setTransactions] = useState<any[]>([]); // Novo estado para armazenar transações
  const [isLoading, setIsLoading] = useState(false); // Estado para indicar carregamento das transações
  const [accountsMap, setAccountsMap] = useState<{[key: string]: any}>({}); // Mapa para acessar detalhes das contas rapidamente
  const [selectedIcon, setSelectedIcon] = useState(''); // Estado para armazenar o ícone selecionado
  const [iconsVisible, setIconsVisible] = useState(false); // Estado para controlar a visibilidade do seletor de ícones
  const [isSharedTransaction, setIsSharedTransaction] = useState(false); // Estado para controlar se a transação é compartilhada
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null); // Estado para armazenar o ID do parceiro selecionado
  const [userPartners, setUserPartners] = useState<any[]>([]); // Estado para armazenar os parceiros do usuário
  const [partnersVisible, setPartnersVisible] = useState(false); // Estado para controlar a visibilidade da lista de parceiros
  const [monthTransactions, setMonthTransactions] = useState<{[key: string]: {income: boolean, expense: boolean, transfer: boolean}}>({});
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [recurrenceVisible, setRecurrenceVisible] = useState(false);
  const [recurrenceEndDateVisible, setRecurrenceEndDateVisible] = useState(false);
  const [recurrenceEndPickerMonth, setRecurrenceEndPickerMonth] = useState(new Date().getMonth());
  const [recurrenceEndPickerYear, setRecurrenceEndPickerYear] = useState(new Date().getFullYear());
  const [recurrenceEndPickerDay, setRecurrenceEndPickerDay] = useState(new Date().getDate());
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [newCategoryIconsVisible, setNewCategoryIconsVisible] = useState(false);
  
  // Lista de ícones disponíveis para seleção
  const availableIcons = [
    { emoji: '🍎', category: 'Alimentação' },
    { emoji: '🍕', category: 'Alimentação' },
    { emoji: '🍔', category: 'Alimentação' },
    { emoji: '🛒', category: 'Compras' },
    { emoji: '🏠', category: 'Moradia' },
    { emoji: '💡', category: 'Utilidades' },
    { emoji: '💻', category: 'Trabalho' },
    { emoji: '📱', category: 'Tecnologia' },
    { emoji: '🚗', category: 'Transporte' },
    { emoji: '⛽', category: 'Transporte' },
    { emoji: '🎓', category: 'Educação' },
    { emoji: '📚', category: 'Educação' },
    { emoji: '🏥', category: 'Saúde' },
    { emoji: '💊', category: 'Saúde' },
    { emoji: '🎬', category: 'Entretenimento' },
    { emoji: '🎮', category: 'Entretenimento' },
    { emoji: '📺', category: 'Entretenimento' },
    { emoji: '🎵', category: 'Entretenimento' },
    { emoji: '💰', category: 'Dinheiro' },
    { emoji: '💸', category: 'Dinheiro' },
    { emoji: '💳', category: 'Cartão' },
    { emoji: '🏦', category: 'Banco' },
    { emoji: '✈️', category: 'Viagem' },
    { emoji: '🏨', category: 'Hospedagem' }
  ];

  // useEffect para carregar o tema com base no gênero do usuário
  useEffect(() => {
    // Buscar informações do usuário atual
    fetchUserTheme();
    // Buscar contas do usuário
    fetchUserAccounts();
    // Buscar transações do usuário
    fetchTransactions();
    // Buscar parceiros do usuário
    fetchUserPartners();
  }, []);

  // useEffect para atualizar as transações quando o usuário seleciona outro dia
  useEffect(() => {
    fetchTransactions();
  }, [selectedDay, currentMonth, currentYear]);
  
  // useEffect para buscar todas as transações do mês quando o mês/ano mudar
  useEffect(() => {
    fetchMonthTransactions();
  }, [currentMonth, currentYear]);

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
          updateTheme('masculine');
        } else if (gender === 'feminino' || gender === 'mulher' || gender === 'female' || gender === 'f') {
          console.log('Aplicando tema feminino (rosa) com base no perfil');
          updateTheme('feminine');
        } else {
          // Se o gênero no perfil não for reconhecido, tentar obter dos metadados da sessão
          const userMetadata = session.user.user_metadata;
          const metadataGender = userMetadata?.gender || '';
          
          console.log('Verificando gênero dos metadados:', metadataGender);
          
          if (metadataGender && typeof metadataGender === 'string') {
            const metaGenderLower = metadataGender.toLowerCase();
            
            if (metaGenderLower === 'masculino' || metaGenderLower === 'homem' || 
                metaGenderLower === 'male' || metaGenderLower === 'm') {
              console.log('Aplicando tema masculino (azul) com base nos metadados');
              updateTheme('masculine');
            } else if (metaGenderLower === 'feminino' || metaGenderLower === 'mulher' || 
                       metaGenderLower === 'female' || metaGenderLower === 'f') {
              console.log('Aplicando tema feminino (rosa) com base nos metadados');
              updateTheme('feminine');
            } else {
              // Usar o tema global ou padrão se o gênero nos metadados também não for reconhecido
              if (global.dashboardTheme === 'masculine') {
                updateTheme('masculine');
                console.log('Aplicando tema masculino (azul) da variável global');
              } else {
                updateTheme('feminine');
                console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
              }
            }
          } else {
            // Usar o tema global ou padrão se não houver gênero nos metadados
            if (global.dashboardTheme === 'masculine') {
              updateTheme('masculine');
              console.log('Aplicando tema masculino (azul) da variável global');
            } else {
              updateTheme('feminine');
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
            updateTheme('masculine');
          } else if (metaGenderLower === 'feminino' || metaGenderLower === 'mulher' || 
                     metaGenderLower === 'female' || metaGenderLower === 'f') {
            console.log('Aplicando tema feminino (rosa) com base nos metadados');
            updateTheme('feminine');
          } else {
            // Usar o tema global ou padrão se o gênero nos metadados não for reconhecido
            if (global.dashboardTheme === 'masculine') {
              updateTheme('masculine');
              console.log('Aplicando tema masculino (azul) da variável global');
            } else {
              updateTheme('feminine');
              console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
            }
          }
        } else {
          // Usar o tema global ou padrão se não houver gênero nos metadados
          if (global.dashboardTheme === 'masculine') {
            updateTheme('masculine');
            console.log('Aplicando tema masculino (azul) da variável global');
          } else {
            updateTheme('feminine');
            console.log('Aplicando tema feminino (rosa) por padrão ou da variável global');
          }
        }
      }
    } catch (error) {
      console.error('Erro ao definir tema:', error);
    }
  };

  // Função para salvar o tema no AsyncStorage
  const saveThemeToStorage = async (themeValue: string) => {
    try {
      await AsyncStorage.setItem('@MyFinlove:theme', themeValue);
      console.log('Tema salvo no AsyncStorage:', themeValue);
    } catch (error) {
      console.error('Erro ao salvar tema no AsyncStorage:', error);
    }
  };

  // Função para atualizar o tema e garantir que seja persistido
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

  // useEffect para carregar o tema do AsyncStorage no início, caso não esteja definido globalmente
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
  }, []);

  // Função para buscar as contas do usuário
  const fetchUserAccounts = async () => {
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
      setCurrentUser({ id: userId });
      
      // Buscar as contas do usuário (próprias ou compartilhadas)
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .or(`owner_id.eq.${userId},partner_id.eq.${userId}`);
        
      if (accountsError) {
        console.error('Erro ao buscar contas do usuário:', accountsError);
        return;
      }
      
      if (accounts && accounts.length > 0) {
        setUserAccounts(accounts);
        
        // Criar um mapa de contas para acesso rápido por ID
        const accountsMapObj: {[key: string]: any} = {};
        accounts.forEach(account => {
          accountsMapObj[account.id] = account;
        });
        setAccountsMap(accountsMapObj);
      } else {
        console.log('Nenhuma conta encontrada para o usuário');
      }
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
    }
  };

  // Função para buscar transações do banco de dados
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      
      // Obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao obter sessão:', sessionError);
        setIsLoading(false);
        return;
      }
      
      if (!session?.user) {
        console.log('Nenhuma sessão de usuário encontrada');
        setIsLoading(false);
        return;
      }
      
      const userId = session.user.id;
      
      // Construir o intervalo de datas para filtrar as transações
      const startDate = new Date(currentYear, currentMonth, selectedDay);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(currentYear, currentMonth, selectedDay);
      endDate.setHours(23, 59, 59, 999);
      
      // Consultar transações no intervalo de datas
      const { data: userTransactions, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          accounts:account_id(name, type, color),
          owner:owner_id(name),
          partner:partner_id(name)
        `)
        .gte('transaction_date', startDate.toISOString())
        .lte('transaction_date', endDate.toISOString())
        .or(`owner_id.eq.${userId},partner_id.eq.${userId}`)
        .order('transaction_date', { ascending: false });
      
      if (transactionsError) {
        console.error('Erro ao buscar transações:', transactionsError);
        setIsLoading(false);
        return;
      }
      
      console.log('Transações encontradas:', userTransactions);
      
      if (userTransactions) {
        setTransactions(userTransactions);
      } else {
        setTransactions([]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      setIsLoading(false);
    }
  };

  // Função para buscar os parceiros do usuário
  const fetchUserPartners = async () => {
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
      
      // Buscar casais onde o usuário é user1 ou user2 e o status é 'active'
      const { data: couples, error: couplesError } = await supabase
        .from('couples')
        .select('id, user1_id, user2_id, is_avatar')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'active');
      
      if (couplesError) {
        console.error('Erro ao buscar casais:', couplesError);
        return;
      }
      
      if (couples && couples.length > 0) {
        // Criar uma lista de IDs de parceiros para buscar seus perfis
        const partnerIds = couples.map(couple => {
          return couple.user1_id === userId ? couple.user2_id : couple.user1_id;
        }).filter(id => id !== null);
        
        // Buscar os perfis dos parceiros
        const { data: partnerProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', partnerIds);
        
        if (profilesError) {
          console.error('Erro ao buscar perfis dos parceiros:', profilesError);
          return;
        }
        
        // Criar um mapa de ID -> perfil para facilitar acesso
        const profileMap: {[key: string]: any} = {};
        if (partnerProfiles) {
          partnerProfiles.forEach(profile => {
            profileMap[profile.id] = profile;
          });
        }
        
        // Processar a lista de parceiros para facilitar o uso na interface
        const partners = couples.map(couple => {
          // Determinar qual usuário é o parceiro (não o usuário atual)
          const isUser1 = couple.user1_id === userId;
          const partnerId = isUser1 ? couple.user2_id : couple.user1_id;
          const partnerProfile = profileMap[partnerId];
          
          return {
            id: partnerId,
            name: partnerProfile ? partnerProfile.name : 'Sem nome',
            coupleId: couple.id,
            isAvatar: couple.is_avatar
          };
        }).filter(partner => partner.id !== null); // Filtrar apenas parceiros válidos
        
        setUserPartners(partners);
        console.log('Parceiros encontrados:', partners);
      } else {
        console.log('Nenhum parceiro encontrado para o usuário');
        setUserPartners([]);
      }
    } catch (error) {
      console.error('Erro ao buscar parceiros:', error);
    }
  };

  // Função para alternar a visibilidade da lista de parceiros
  const togglePartners = () => {
    setPartnersVisible(!partnersVisible);
    
    // Fechar outros dropdowns se estiverem abertos
    if (paymentMethodsVisible) {
      setPaymentMethodsVisible(false);
    }
    if (calendarVisible) {
      setCalendarVisible(false);
    }
    if (accountsVisible) {
      setAccountsVisible(false);
    }
    if (iconsVisible) {
      setIconsVisible(false);
    }
  };

  // Função para selecionar um parceiro
  const selectPartner = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setPartnersVisible(false);
  };

  // Função para abrir o modal
  const openAddTransactionModal = () => {
    // Resetar os estados
    setTransactionType('expense');
    setAmount('');
    setDescription('');
    setSelectedDate(
      `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`
    );
    setSelectedCard('');
    setSelectedCategory('');
    setRecurrenceType('Não recorrente');
    setIsRecurrent(false);
    setRecurrenceEndDate('');
    setSelectedAccount('');
    setSelectedAccountId(null);
    setPaymentMethod('');
    setErrorMessage('');
    setSelectedIcon(''); // Resetar o ícone selecionado
    setIsSharedTransaction(false); // Resetar para transação pessoal
    setSelectedPartnerId(null); // Resetar parceiro selecionado
    
    setModalVisible(true);
  };

  // Função para fechar o modal
  const closeModal = () => {
    setModalVisible(false);
    setCalendarVisible(false);
    setPaymentMethodsVisible(false);
    setAccountsVisible(false);
    setIconsVisible(false); // Fechar o seletor de ícones
    setPartnersVisible(false); // Fechar a lista de parceiros
    setRecurrenceVisible(false); // Fechar o seletor de recorrência
    setRecurrenceEndDateVisible(false); // Fechar o calendário de data fim
    setIsAddingCategory(false); // Fechar o formulário de nova categoria
    setNewCategoryName(''); // Limpar nome da categoria
    setNewCategoryIcon(''); // Limpar ícone da categoria
    setNewCategoryIconsVisible(false); // Fechar seletor de ícones da categoria
  };

  // Função para alternar a visibilidade do seletor de ícones
  const toggleIcons = () => {
    setIconsVisible(!iconsVisible);
    
    // Fechar outros dropdowns se estiverem abertos
    if (paymentMethodsVisible) {
      setPaymentMethodsVisible(false);
    }
    if (calendarVisible) {
      setCalendarVisible(false);
    }
    if (accountsVisible) {
      setAccountsVisible(false);
    }
  };

  // Função para selecionar um ícone
  const selectTransactionIcon = (icon: string) => {
    setSelectedIcon(icon);
    setIconsVisible(false);
  };

  // Funções para gerenciar recorrência
  const toggleRecurrence = () => {
    setRecurrenceVisible(!recurrenceVisible);
    
    // Fechar outros dropdowns se estiverem abertos
    if (paymentMethodsVisible) {
      setPaymentMethodsVisible(false);
    }
    if (calendarVisible) {
      setCalendarVisible(false);
    }
    if (accountsVisible) {
      setAccountsVisible(false);
    }
    if (iconsVisible) {
      setIconsVisible(false);
    }
    if (partnersVisible) {
      setPartnersVisible(false);
    }
  };

  const selectRecurrenceType = (type: string) => {
    setRecurrenceType(type);
    setIsRecurrent(type !== 'Não recorrente');
    setRecurrenceVisible(false);
    
    // Se não for recorrente, limpar a data de fim
    if (type === 'Não recorrente') {
      setRecurrenceEndDate('');
    }
  };

  const toggleRecurrenceEndCalendar = () => {
    // Usar as mesmas variáveis do calendário principal
    if (!recurrenceEndDateVisible) {
      // Ao abrir, sincronizar com a data atual ou data já selecionada
      if (recurrenceEndDate) {
        const [day, month, year] = recurrenceEndDate.split('/').map(Number);
        setPickerMonth(month - 1);
        setPickerYear(year);
        setPickerDay(day);
      } else {
        const today = new Date();
        setPickerMonth(today.getMonth());
        setPickerYear(today.getFullYear());
        setPickerDay(today.getDate());
      }
    }
    setRecurrenceEndDateVisible(!recurrenceEndDateVisible);
  };

  const goToPreviousRecurrenceEndPickerMonth = () => {
    if (recurrenceEndPickerMonth === 0) {
      setRecurrenceEndPickerMonth(11);
      setRecurrenceEndPickerYear(recurrenceEndPickerYear - 1);
    } else {
      setRecurrenceEndPickerMonth(recurrenceEndPickerMonth - 1);
    }
  };

  const goToNextRecurrenceEndPickerMonth = () => {
    if (recurrenceEndPickerMonth === 11) {
      setRecurrenceEndPickerMonth(0);
      setRecurrenceEndPickerYear(recurrenceEndPickerYear + 1);
    } else {
      setRecurrenceEndPickerMonth(recurrenceEndPickerMonth + 1);
    }
  };

  const selectRecurrenceEndDateFromPicker = (day: number) => {
    setPickerDay(day);
    const newDate = `${String(day).padStart(2, '0')}/${String(pickerMonth + 1).padStart(2, '0')}/${pickerYear}`;
    setRecurrenceEndDate(newDate);
    setRecurrenceEndDateVisible(false);
  };

  const generateRecurrenceEndPickerCalendarDays = () => {
    const daysInMonth = new Date(recurrenceEndPickerYear, recurrenceEndPickerMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(recurrenceEndPickerYear, recurrenceEndPickerMonth, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    // Dias do mês anterior para completar a primeira semana
    const daysFromPreviousMonth = adjustedFirstDay;
    const previousMonthDays = [];
    if (daysFromPreviousMonth > 0) {
      const daysInPreviousMonth = new Date(recurrenceEndPickerYear, recurrenceEndPickerMonth, 0).getDate();
      for (let i = daysInPreviousMonth - daysFromPreviousMonth + 1; i <= daysInPreviousMonth; i++) {
        previousMonthDays.push({
          day: i,
          currentMonth: false,
          isToday: false,
          isSelected: false
        });
      }
    }
    
    // Dias do mês atual
    const currentMonthDays = [];
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = 
        day === today.getDate() && 
        recurrenceEndPickerMonth === today.getMonth() && 
        recurrenceEndPickerYear === today.getFullYear();
      
      const isSelected = day === recurrenceEndPickerDay;
      
      currentMonthDays.push({
        day,
        currentMonth: true,
        isToday,
        isSelected
      });
    }
    
    // Dias do próximo mês para completar a última semana
    const totalDaysShown = previousMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDaysShown; // 6 semanas * 7 dias
    const nextMonthDays = [];
    for (let day = 1; day <= remainingDays; day++) {
      nextMonthDays.push({
        day,
        currentMonth: false,
        isToday: false,
        isSelected: false
      });
    }
    
    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const renderRecurrenceEndPickerCalendarGrid = () => {
    const days = generateRecurrenceEndPickerCalendarDays();
    const rows: JSX.Element[] = [];
    let cells: JSX.Element[] = [];

    // Adicionar cabeçalho dos dias da semana
    const headerCells = weekDays.map((day, index) => (
      <View key={`picker-header-${index}`} style={styles.pickerCalendarHeaderCell}>
        <Text style={styles.pickerCalendarHeaderText}>{day}</Text>
      </View>
    ));
    rows.push(
      <View key="picker-header" style={styles.pickerCalendarRow}>
        {headerCells}
      </View>
    );

    // Agrupar os dias em semanas
    days.forEach((day, index) => {
      const isSelected = pickerDay === day.day && day.currentMonth;
      
      cells.push(
        <TouchableOpacity
          key={`picker-day-${index}`}
          style={[
            styles.pickerCalendarCell,
            day.currentMonth ? styles.pickerCurrentMonthCell : styles.pickerOtherMonthCell,
            isSelected ? styles.pickerSelectedCell : null
          ]}
          onPress={() => day.currentMonth && selectRecurrenceEndDateFromPicker(day.day)}
        >
          <View
            style={[
              styles.pickerDayCircle,
              isSelected ? styles.pickerSelectedDayCircle : null
            ]}
          >
            <Text
              style={[
                styles.pickerCalendarDay,
                day.currentMonth ? styles.pickerCurrentMonthDay : styles.pickerOtherMonthDay,
                isSelected ? [styles.pickerSelectedDayText, { color: theme.primary }] : null
              ]}
            >
              {day.day}
            </Text>
          </View>
        </TouchableOpacity>
      );

      // Completar uma semana
      if ((index + 1) % 7 === 0 || index === days.length - 1) {
        rows.push(
          <View key={`picker-row-${Math.floor(index / 7)}`} style={styles.pickerCalendarRow}>
            {cells}
          </View>
        );
        cells = [];
      }
    });

    return rows;
  };

  // Função para salvar a nova transação
  const saveTransaction = async () => {
    try {
      setErrorMessage('');
      setIsSaving(true);
      
      // Validações básicas
      if (!description.trim()) {
        setErrorMessage('Por favor, informe uma descrição para a transação.');
        setIsSaving(false);
        return;
      }
      
      if (!amount || isNaN(parseFloat(amount.replace(',', '.')))) {
        setErrorMessage('Por favor, informe um valor válido.');
        setIsSaving(false);
        return;
      }
      
      if (!selectedAccountId) {
        setErrorMessage('Por favor, selecione uma conta.');
        setIsSaving(false);
        return;
      }
      
      // Validação adicional para transação compartilhada
      if (isSharedTransaction && !selectedPartnerId) {
        setErrorMessage('Por favor, selecione um parceiro para compartilhar a transação.');
        setIsSaving(false);
        return;
      }
      
      // Validação adicional para transação recorrente
      if (isRecurrent && !recurrenceEndDate) {
        setErrorMessage('Por favor, informe a data de fim da recorrência.');
        setIsSaving(false);
        return;
      }
      
      // Obter a sessão atual para o ID do usuário
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setErrorMessage('Usuário não autenticado.');
        setIsSaving(false);
        return;
      }
      
      const userId = session.user.id;
      
      // Preparar o valor conforme o tipo de transação
      let transactionAmount = parseFloat(amount.replace(',', '.'));
      if (transactionType === 'expense') {
        transactionAmount = -Math.abs(transactionAmount); // Garantir que será negativo
      } else if (transactionType === 'income') {
        transactionAmount = Math.abs(transactionAmount); // Garantir que será positivo
      }
      
      // Converter a data selecionada para o formato ISO
      const parsedDate = parseDate(selectedDate);
      
      // Converter a data de fim da recorrência se existir
      let parsedRecurrenceEndDate = null;
      if (isRecurrent && recurrenceEndDate) {
        parsedRecurrenceEndDate = parseDate(recurrenceEndDate);
      }
      
      // Preparar os dados da transação
      const transactionData = {
        description,
        amount: transactionAmount,
        transaction_date: parsedDate.toISOString(),
        transaction_type: transactionType,
        account_id: selectedAccountId,
        payment_method: paymentMethod || null,
        category: selectedCategory || null,
        recurrence_type: recurrenceType,
        recurrence_frequency: isRecurrent ? 'monthly' : null,
        recurrence_end_date: parsedRecurrenceEndDate ? parsedRecurrenceEndDate.toISOString() : null,
        owner_id: userId,
        partner_id: isSharedTransaction ? selectedPartnerId : null, // Incluir parceiro apenas se for transação compartilhada
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        icon: selectedIcon || null // Incluir o ícone selecionado nos dados da transação
      };
      
      // Inserir a transação no banco de dados
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select();
      
      if (error) {
        console.error('Erro ao salvar transação:', error);
        setErrorMessage(`Erro ao salvar: ${error.message}`);
        setIsSaving(false);
        return;
      }
      
      console.log('Transação salva com sucesso:', data);
      
      // Se for recorrente, criar as transações futuras
      if (isRecurrent && recurrenceEndDate && parsedRecurrenceEndDate) {
        await createRecurringTransactions(transactionData, parsedDate, parsedRecurrenceEndDate);
      }
      
      // Verificar se a data da transação está no mês atual para determinar quais atualizações fazer
      const transactionDate = new Date(parsedDate);
      const isCurrentMonthTransaction = 
        transactionDate.getMonth() === currentMonth && 
        transactionDate.getFullYear() === currentYear;
      
      // Verificar se a data da transação é o dia selecionado atual
      const isSelectedDayTransaction = 
        transactionDate.getDate() === selectedDay && 
        isCurrentMonthTransaction;
      
      // Sequência de atualização otimizada:
      // 1. Atualizar o status de salvamento antes das chamadas assícronas
      setIsSaving(false);
      
      // 2. Fechar o modal imediatamente para melhorar a experiência do usuário
      closeModal();
      
      // 3. Atualizar os dados relevantes
      if (isCurrentMonthTransaction) {
        // Atualizar os indicadores do mês
        await fetchMonthTransactions();
      }
      
      if (isSelectedDayTransaction) {
        // Atualizar as transações do dia atual
        await fetchTransactions();
      }
      
      // 4. Mostrar mensagem de sucesso após o modal estar fechado
      const successMessage = isRecurrent ? 
        'Transação recorrente criada com sucesso! As próximas transações foram agendadas automaticamente.' : 
        'Transação registrada com sucesso!';
      alert(successMessage);
      
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      setErrorMessage('Ocorreu um erro ao salvar a transação. Por favor, tente novamente.');
      setIsSaving(false);
    }
  };

  // Função para criar transações recorrentes
  const createRecurringTransactions = async (baseTransactionData: any, startDate: Date, endDate: Date) => {
    try {
      const recurringTransactions = [];
      const currentDate = new Date(startDate);
      
      // Avançar para o próximo mês
      currentDate.setMonth(currentDate.getMonth() + 1);
      
      // Criar transações mensais até a data de fim
      while (currentDate <= endDate) {
        const recurringTransaction = {
          ...baseTransactionData,
          transaction_date: currentDate.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        recurringTransactions.push(recurringTransaction);
        
        // Avançar para o próximo mês
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      // Inserir todas as transações recorrentes de uma vez
      if (recurringTransactions.length > 0) {
        const { error: recurringError } = await supabase
          .from('transactions')
          .insert(recurringTransactions);
        
        if (recurringError) {
          console.error('Erro ao criar transações recorrentes:', recurringError);
          // Não interromper o fluxo, apenas logar o erro
        } else {
          console.log(`${recurringTransactions.length} transações recorrentes criadas com sucesso`);
        }
      }
    } catch (error) {
      console.error('Erro ao processar transações recorrentes:', error);
      // Não interromper o fluxo, apenas logar o erro
    }
  };

  // Funções para o calendário do modal de transação
  const toggleCalendar = () => {
    setCalendarVisible(!calendarVisible);
  };

  const goToPreviousPickerMonth = () => {
    if (pickerMonth === 0) {
      setPickerMonth(11);
      setPickerYear(pickerYear - 1);
    } else {
      setPickerMonth(pickerMonth - 1);
    }
  };

  const goToNextPickerMonth = () => {
    if (pickerMonth === 11) {
      setPickerMonth(0);
      setPickerYear(pickerYear + 1);
    } else {
      setPickerMonth(pickerMonth + 1);
    }
  };

  const selectDateFromPicker = (day: number) => {
    setPickerDay(day);
    const newDate = `${String(day).padStart(2, '0')}/${String(pickerMonth + 1).padStart(2, '0')}/${pickerYear}`;
    setSelectedDate(newDate);
    setCalendarVisible(false);
  };

  // Função para gerar os dias do mês para o calendário do modal
  const generatePickerCalendarDays = () => {
    const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(pickerYear, pickerMonth, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    // Dias do mês anterior para completar a primeira semana
    const daysFromPreviousMonth = adjustedFirstDay;
    const previousMonthDays = [];
    if (daysFromPreviousMonth > 0) {
      const daysInPreviousMonth = new Date(pickerYear, pickerMonth, 0).getDate();
      for (let i = daysInPreviousMonth - daysFromPreviousMonth + 1; i <= daysInPreviousMonth; i++) {
        previousMonthDays.push({
          day: i,
          currentMonth: false,
          date: new Date(pickerYear, pickerMonth - 1, i)
        });
      }
    }
    
    // Dias do mês atual
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        day: i,
        currentMonth: true,
        date: new Date(pickerYear, pickerMonth, i)
      });
    }
    
    // Dias do próximo mês para completar a última semana
    const remainingDays = (7 - ((adjustedFirstDay + daysInMonth) % 7)) % 7;
    const nextMonthDays = [];
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        day: i,
        currentMonth: false,
        date: new Date(pickerYear, pickerMonth + 1, i)
      });
    }
    
    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Renderizar os dias do calendário em formato de grade para o modal
  const renderPickerCalendarGrid = (isRecurrenceEndDate = false) => {
    const days = generatePickerCalendarDays();
    const rows: JSX.Element[] = [];
    let cells: JSX.Element[] = [];

    // Adicionar cabeçalho dos dias da semana
    const headerCells = weekDays.map((day, index) => (
      <View key={`picker-header-${index}`} style={styles.pickerCalendarHeaderCell}>
        <Text style={styles.pickerCalendarHeaderText}>{day}</Text>
      </View>
    ));
    rows.push(
      <View key="picker-header" style={styles.pickerCalendarRow}>
        {headerCells}
      </View>
    );

    // Agrupar os dias em semanas
    days.forEach((day, index) => {
      // Verificar se este dia tem transações (apenas se for do mês atual do picker e não for para recorrência)
      const isCurrentMonthDay = day.currentMonth && pickerMonth === currentMonth && pickerYear === currentYear;
      const dayKey = day.day.toString();
      const hasTransactions = !isRecurrenceEndDate && isCurrentMonthDay && monthTransactions[dayKey];
      const isSelected = pickerDay === day.day && day.currentMonth;
      
      cells.push(
        <TouchableOpacity
          key={`picker-day-${index}`}
          style={[
            styles.pickerCalendarCell,
            day.currentMonth ? styles.pickerCurrentMonthCell : styles.pickerOtherMonthCell,
            isSelected ? styles.pickerSelectedCell : null
          ]}
          onPress={() => day.currentMonth && (isRecurrenceEndDate ? selectRecurrenceEndDateFromPicker(day.day) : selectDateFromPicker(day.day))}
        >
          <View
            style={[
              styles.pickerDayCircle,
              isSelected ? styles.pickerSelectedDayCircle : null
            ]}
          >
            <Text
              style={[
                styles.pickerCalendarDay,
                day.currentMonth ? styles.pickerCurrentMonthDay : styles.pickerOtherMonthDay,
                isSelected ? [styles.pickerSelectedDayText, { color: theme.primary }] : null
              ]}
            >
              {day.day}
            </Text>
            
            {/* Indicadores de transações - só mostrar se não for para recorrência */}
            {hasTransactions && (
              <View style={[
                styles.pickerTransactionIndicatorsContainer,
                isSelected ? styles.selectedDayIndicatorsContainer : null
              ]}>
                {hasTransactions.income && (
                  <View style={[
                    styles.transactionIndicator, 
                    styles.incomeIndicator,
                    isSelected ? styles.selectedDayIndicator : null
                  ]} />
                )}
                {hasTransactions.expense && (
                  <View style={[
                    styles.transactionIndicator, 
                    styles.expenseIndicator,
                    isSelected ? styles.selectedDayIndicator : null
                  ]} />
                )}
                {hasTransactions.transfer && (
                  <View style={[
                    styles.transactionIndicator, 
                    styles.transferIndicator,
                    isSelected ? styles.selectedDayIndicator : null
                  ]} />
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      );

      // Completar uma semana
      if ((index + 1) % 7 === 0 || index === days.length - 1) {
        rows.push(
          <View key={`picker-row-${Math.floor(index / 7)}`} style={styles.pickerCalendarRow}>
            {cells}
          </View>
        );
        cells = [];
      }
    });

    return rows;
  };

  // Função para gerar os dias do mês
  const generateCalendarDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    // Dias do mês anterior para completar a primeira semana
    const daysFromPreviousMonth = adjustedFirstDay;
    const previousMonthDays = [];
    if (daysFromPreviousMonth > 0) {
      const daysInPreviousMonth = new Date(currentYear, currentMonth, 0).getDate();
      for (let i = daysInPreviousMonth - daysFromPreviousMonth + 1; i <= daysInPreviousMonth; i++) {
        previousMonthDays.push({
          day: i,
          currentMonth: false,
          date: new Date(currentYear, currentMonth - 1, i)
        });
      }
    }
    
    // Dias do mês atual
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        day: i,
        currentMonth: true,
        date: new Date(currentYear, currentMonth, i)
      });
    }
    
    // Dias do próximo mês para completar a última semana
    const remainingDays = (7 - ((adjustedFirstDay + daysInMonth) % 7)) % 7;
    const nextMonthDays = [];
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        day: i,
        currentMonth: false,
        date: new Date(currentYear, currentMonth + 1, i)
      });
    }
    
    return [...previousMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Navegar para o mês anterior
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navegar para o próximo mês
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Funções para formatar datas
  const formatWeekDay = (date: Date) => {
    const weekDaysFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return weekDaysFull[date.getDay()];
  };

  const formatDateHeader = (day: number, month: number, year: number) => {
    const date = new Date(year, month, day);
    const monthName = months[month];
    const weekDay = formatWeekDay(date);
    return `${day} de ${monthName}, ${weekDay}`;
  };

  // Selecionar um dia
  const selectDay = (day: number) => {
    setSelectedDay(day);
    // Também atualiza a data selecionada para o modal
    const newSelectedDate = `${String(day).padStart(2, '0')}/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`;
    setSelectedDate(newSelectedDate);
  };

  // Renderizar os dias do calendário em formato de grade
  const renderCalendarGrid = () => {
    const days = generateCalendarDays();
    const rows: JSX.Element[] = [];
    let cells: JSX.Element[] = [];

    // Adicionar cabeçalho dos dias da semana
    const headerCells = weekDays.map((day, index) => (
      <View key={`header-${index}`} style={styles.calendarHeaderCell}>
        <Text style={styles.calendarHeaderText}>{day}</Text>
      </View>
    ));
    rows.push(
      <View key="header" style={styles.calendarRow}>
        {headerCells}
      </View>
    );

    // Agrupar os dias em semanas
    days.forEach((day, index) => {
      // Verificar se este dia tem transações
      const dayKey = day.day.toString();
      const hasTransactions = day.currentMonth && monthTransactions[dayKey];
      const isSelected = selectedDay === day.day && day.currentMonth;
      
      cells.push(
        <TouchableOpacity
          key={`day-${index}`}
          style={[
            styles.calendarCell,
            day.currentMonth ? styles.currentMonthCell : styles.otherMonthCell,
            isSelected ? styles.selectedCell : null
          ]}
          onPress={() => day.currentMonth && selectDay(day.day)}
        >
          <View
            style={[
              styles.dayCircle,
              isSelected ? styles.selectedDayCircle : null
            ]}
          >
            <Text
              style={[
                styles.calendarDay,
                day.currentMonth ? styles.currentMonthDay : styles.otherMonthDay,
                isSelected ? [styles.selectedDayText, { color: theme.primary }] : null
              ]}
            >
              {day.day}
            </Text>
            
            {/* Indicadores de transações */}
            {hasTransactions && (
              <View style={[
                styles.transactionIndicatorsContainer,
                isSelected ? styles.selectedDayIndicatorsContainer : null
              ]}>
                {hasTransactions.income && (
                  <View style={[
                    styles.transactionIndicator, 
                    styles.incomeIndicator,
                    isSelected ? styles.selectedDayIndicator : null
                  ]} />
                )}
                {hasTransactions.expense && (
                  <View style={[
                    styles.transactionIndicator, 
                    styles.expenseIndicator,
                    isSelected ? styles.selectedDayIndicator : null
                  ]} />
                )}
                {hasTransactions.transfer && (
                  <View style={[
                    styles.transactionIndicator, 
                    styles.transferIndicator,
                    isSelected ? styles.selectedDayIndicator : null
                  ]} />
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      );

      // Completar uma semana
      if ((index + 1) % 7 === 0 || index === days.length - 1) {
        rows.push(
          <View key={`row-${Math.floor(index / 7)}`} style={styles.calendarRow}>
            {cells}
          </View>
        );
        cells = [];
      }
    });

    return rows;
  };

  // Filtrar registros pelo dia selecionado
  const filteredRecords = React.useMemo(() => {
    return transactions;
  }, [transactions]);

  // Calcular totais de receitas e despesas
  const { incomeTotal, expenseTotal } = React.useMemo(() => {
    let income = 0;
    let expense = 0;
    
    filteredRecords.forEach(record => {
      const amount = parseFloat(record.amount);
      if (amount > 0) {
        income += amount;
      } else if (amount < 0) {
        expense += Math.abs(amount);
      }
    });
    
    return { incomeTotal: income, expenseTotal: expense };
  }, [filteredRecords]);

  // Funções para o seletor de método de pagamento
  const togglePaymentMethods = () => {
    setPaymentMethodsVisible(!paymentMethodsVisible);
    // Fecha o calendário se estiver aberto
    if (calendarVisible) {
      setCalendarVisible(false);
    }
  };

  const selectPaymentMethod = (method: string) => {
    setPaymentMethod(method);
    setPaymentMethodsVisible(false);
  };

  // Funções para o seletor de contas
  const toggleAccounts = () => {
    setAccountsVisible(!accountsVisible);
    
    // Fecha outros dropdowns se estiverem abertos
    if (paymentMethodsVisible) {
      setPaymentMethodsVisible(false);
    }
    if (calendarVisible) {
      setCalendarVisible(false);
    }
  };

  const selectAccount = (account: any) => {
    setSelectedAccount(account.name);
    setSelectedAccountId(account.id); // Armazenar o ID da conta
    setAccountsVisible(false);
  };

  // Converter data no formato DD/MM/YYYY para objeto Date
  const parseDate = (dateString: string) => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Função para buscar todas as transações do mês
  const fetchMonthTransactions = async () => {
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
      
      // Construir o intervalo de datas para o mês inteiro
      const startDate = new Date(currentYear, currentMonth, 1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(currentYear, currentMonth + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      
      // Consultar todas as transações do mês
      const { data: monthData, error: transactionsError } = await supabase
        .from('transactions')
        .select('transaction_date, transaction_type, amount')
        .gte('transaction_date', startDate.toISOString())
        .lte('transaction_date', endDate.toISOString())
        .or(`owner_id.eq.${userId},partner_id.eq.${userId}`);
      
      if (transactionsError) {
        console.error('Erro ao buscar transações do mês:', transactionsError);
        return;
      }
      
      // Processar os dados para criar um mapa de dias com transações
      const transactionsByDay: {[key: string]: {income: boolean, expense: boolean, transfer: boolean}} = {};
      
      if (monthData && monthData.length > 0) {
        monthData.forEach(transaction => {
          const date = new Date(transaction.transaction_date);
          const day = date.getDate();
          const key = day.toString();
          
          // Inicializar o objeto para este dia se ainda não existir
          if (!transactionsByDay[key]) {
            transactionsByDay[key] = {
              income: false,
              expense: false,
              transfer: false
            };
          }
          
          // Marcar o tipo de transação
          if (transaction.transaction_type === 'income' || parseFloat(transaction.amount) > 0) {
            transactionsByDay[key].income = true;
          } else if (transaction.transaction_type === 'expense' || parseFloat(transaction.amount) < 0) {
            transactionsByDay[key].expense = true;
          } else if (transaction.transaction_type === 'transfer') {
            transactionsByDay[key].transfer = true;
          }
        });
      }
      
      setMonthTransactions(transactionsByDay);
      console.log('Transações do mês por dia:', transactionsByDay);
      
    } catch (error) {
      console.error('Erro ao buscar transações do mês:', error);
    }
  };

  // Funções para gerenciar adição de categoria
  const toggleAddCategory = () => {
    setIsAddingCategory(!isAddingCategory);
    if (!isAddingCategory) {
      // Resetar campos ao abrir
      setNewCategoryName('');
      setNewCategoryIcon('');
      setNewCategoryIconsVisible(false);
    }
  };

  const toggleNewCategoryIcons = () => {
    setNewCategoryIconsVisible(!newCategoryIconsVisible);
  };

  const selectNewCategoryIcon = (icon: string) => {
    setNewCategoryIcon(icon);
    setNewCategoryIconsVisible(false);
  };

  const saveNewCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Por favor, informe um nome para a categoria.');
      return;
    }
    
    if (!newCategoryIcon) {
      alert('Por favor, selecione um ícone para a categoria.');
      return;
    }
    
    try {
      // Obter a sessão atual para o ID do usuário
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        alert('Usuário não autenticado.');
        return;
      }
      
      const userId = session.user.id;
      
      // Determinar a cor automática baseada no tipo de transação
      const categoryColor = transactionType === 'expense' ? '#FF5252' : 
                           transactionType === 'income' ? '#9AFFCB' : '#666666';
      
      // Preparar os dados da categoria
      const categoryData = {
        user_id: userId,
        nome: newCategoryName.trim(),
        tipo: transactionType === 'expense' ? 'despesa' : 
              transactionType === 'income' ? 'receita' : 'transferencia',
        icone: newCategoryIcon,
        cor: categoryColor,
        created_at: new Date().toISOString()
      };
      
      // Inserir a categoria no banco de dados
      const { data, error } = await supabase
        .from('user_categories')
        .insert([categoryData])
        .select();
      
      if (error) {
        console.error('Erro ao salvar categoria:', error);
        alert(`Erro ao salvar categoria: ${error.message}`);
        return;
      }
      
      console.log('Categoria salva com sucesso:', data);
      
      // Criar a nova categoria formatada para uso local
      const newCategory = `${newCategoryIcon} ${newCategoryName.trim()}`;
      setSelectedCategory(newCategory);
      
      // Resetar e fechar o formulário
      setNewCategoryName('');
      setNewCategoryIcon('');
      setIsAddingCategory(false);
      setNewCategoryIconsVisible(false);
      
      alert('Categoria criada com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Ocorreu um erro ao salvar a categoria. Por favor, tente novamente.');
    }
  };

  const cancelAddCategory = () => {
    setNewCategoryName('');
    setNewCategoryIcon('');
    setIsAddingCategory(false);
    setNewCategoryIconsVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" />

      <ScrollView 
        style={styles.mainScrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              onPress={() => router.push('/(app)/dashboard')}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Registros</Text>
            <TouchableOpacity style={styles.searchButton}>
              <Search size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthArrow}>
              <ChevronLeft size={24} color="#FFF" />
            </TouchableOpacity>
            
            <Text style={styles.monthYearText}>
              {months[currentMonth]} {currentYear}
            </Text>
            
            <TouchableOpacity onPress={goToNextMonth} style={styles.monthArrow}>
              <ChevronRight size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarContainer}>
            {renderCalendarGrid()}
          </View>

          <View style={styles.calendarLegendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, styles.incomeIndicator]} />
              <Text style={styles.legendText}>Receita</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, styles.expenseIndicator]} />
              <Text style={styles.legendText}>Despesa</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIndicator, styles.transferIndicator]} />
              <Text style={styles.legendText}>Transf.</Text>
            </View>
          </View>
        </View>

        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>
            {formatDateHeader(selectedDay, currentMonth, currentYear)}
          </Text>
          <TouchableOpacity style={styles.optionsButton}>
            <Filter size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Receitas</Text>
            <Text style={[styles.summaryValue, styles.incomeValue]}>
              + R$ {incomeTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Despesas</Text>
            <Text style={[styles.summaryValue, styles.expenseValue]}>
              - R$ {expenseTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        <View style={styles.recordsHeaderContainer}>
          <Text style={styles.recordsTitle}>Todos os Registros</Text>
          <TouchableOpacity 
            style={[styles.addTransactionButton, { backgroundColor: theme.primary }]}
            onPress={openAddTransactionModal}
          >
            <Plus size={24} color="#FFF" />
            <Text style={styles.addTransactionButtonText}>Nova Transação</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recordsContainer}>
          <View style={styles.recordsList}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando transações...</Text>
              </View>
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map(record => {
                // Determinar o ícone com base na categoria ou tipo de transação
                let icon = '💰'; // Ícone padrão
                
                // Se a transação tem um ícone definido, use-o
                if (record.icon) {
                  icon = record.icon;
                } 
                // Caso contrário, determine o ícone com base na categoria ou tipo
                else if (record.category) {
                  // Mapeamento básico de categorias para ícones
                  const categoryIcons: {[key: string]: string} = {
                    'Alimentação': '🍽️',
                    'Transporte': '🚗',
                    'Saúde': '💊',
                    'Educação': '📚',
                    'Lazer': '🎮',
                    'Moradia': '🏠',
                    'Vestuário': '👕',
                    'Trabalho': '💼',
                    'Investimento': '📈',
                    'Assinatura': '📱',
                    'Entretenimento': '🎬'
                  };
                  icon = categoryIcons[record.category] || '📋';
                } else if (record.transaction_type === 'income') {
                  icon = '💵';
                } else if (record.transaction_type === 'expense') {
                  icon = '💸';
                } else if (record.transaction_type === 'transfer') {
                  icon = '🔄';
                }
                
                // Formatar a data para exibição
                const transactionDate = new Date(record.transaction_date);
                const formattedDate = `${String(transactionDate.getDate()).padStart(2, '0')}/${String(transactionDate.getMonth() + 1).padStart(2, '0')}/${transactionDate.getFullYear()}`;
                const formattedTime = `${String(transactionDate.getHours()).padStart(2, '0')}:${String(transactionDate.getMinutes()).padStart(2, '0')}`;
                
                // Determinar proprietário da transação para exibição
                let person = "Você";
                if (record.partner && record.partner.name && record.owner_id !== currentUser?.id) {
                  person = record.partner.name;
                } else if (record.owner && record.owner.name && record.owner_id !== currentUser?.id) {
                  person = record.owner.name;
                }
                
                // Verificar se o valor é positivo (receita) ou negativo (despesa)
                const isIncome = parseFloat(record.amount) > 0;
                const isRecurrent = record.recurrence_type !== 'Não recorrente';
                
                return (
                  <TouchableOpacity key={record.id} style={styles.recordItem}>
                    <View style={styles.recordIcon}>
                      <Text style={styles.recordIconText}>{icon}</Text>
                    </View>
                    <View style={styles.recordInfo}>
                      <Text style={styles.recordName}>{record.description}</Text>
                      <Text style={styles.recordDetail}>
                        {record.category || 'Sem categoria'} • {person} • {formattedDate}
                      </Text>
                    </View>
                    <View style={styles.recordAmount}>
                      <Text style={[
                        styles.recordAmountText,
                        isIncome ? styles.incomeText : styles.expenseText
                      ]}>
                        {isIncome ? '+ ' : '- '}R$ {Math.abs(parseFloat(record.amount)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                      {isRecurrent && <Text style={styles.recordFrequency}>/mês</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>Nenhuma transação encontrada para esta data.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Botão flutuante fixo para adicionar transação */}
      <TouchableOpacity style={styles.floatingAddButton} onPress={openAddTransactionModal}>
        <PlusCircle size={30} color="#FFF" />
      </TouchableOpacity>

      {/* Modal de Nova Transação */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Transação</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <X size={20} color={themeDefault.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 20 }}
            >

            {/* Buttons for transaction type */}
            <View style={styles.transactionTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.transactionTypeButton,
                  transactionType === 'expense' && [styles.activeTypeButton, { 
                    backgroundColor: `${theme.expense}15`, 
                    borderColor: theme.expense 
                  }]
                ]}
                onPress={() => setTransactionType('expense')}
              >
                <View style={[styles.transactionIconContainer, { backgroundColor: transactionType === 'expense' ? theme.expense : '#f5f5f5' }]}>
                  <ArrowDown size={20} color={transactionType === 'expense' ? 'white' : '#666'} />
                </View>
                <Text style={[
                  styles.transactionTypeText,
                  transactionType === 'expense' && [styles.activeTypeText, { color: theme.expense }]
                ]}>Despesa</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.transactionTypeButton,
                  transactionType === 'income' && [styles.activeTypeButton, { 
                    backgroundColor: `${theme.income}15`, 
                    borderColor: theme.income 
                  }]
                ]}
                onPress={() => setTransactionType('income')}
              >
                <View style={[styles.transactionIconContainer, { backgroundColor: transactionType === 'income' ? theme.income : '#f5f5f5' }]}>
                  <ArrowUp size={20} color={transactionType === 'income' ? 'white' : '#666'} />
                </View>
                <Text style={[
                  styles.transactionTypeText,
                  transactionType === 'income' && [styles.activeTypeText, { color: theme.income }]
                ]}>Receita</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.transactionTypeButton,
                  transactionType === 'transfer' && [styles.activeTypeButton, { 
                    backgroundColor: 'rgba(255, 204, 0, 0.15)', 
                    borderColor: 'rgb(255, 204, 0)' 
                  }]
                ]}
                onPress={() => setTransactionType('transfer')}
              >
                <View style={[styles.transactionIconContainer, { backgroundColor: transactionType === 'transfer' ? 'rgb(255, 204, 0)' : '#f5f5f5' }]}>
                  <RefreshCw size={20} color={transactionType === 'transfer' ? 'white' : '#666'} />
                </View>
                <Text style={[
                  styles.transactionTypeText,
                  transactionType === 'transfer' && [styles.activeTypeText, { color: 'rgb(255, 204, 0)' }]
                ]}>Transferência</Text>
              </TouchableOpacity>
            </View>

            {/* Campo de Descrição */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={styles.textInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Ex: Mercado, Salário, Aluguel"
                placeholderTextColor="#999"
              />
            </View>

            {/* Seletor de Ícone */}
            <View style={[styles.inputGroup, { zIndex: 12 }]}>
              <Text style={styles.inputLabel}>Ícone</Text>
              <TouchableOpacity 
                style={[
                  styles.iconSelector,
                  selectedIcon ? { borderColor: theme.primary, borderWidth: 1.5 } : null
                ]} 
                onPress={toggleIcons}
              >
                {selectedIcon ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.selectedIconText}>{selectedIcon}</Text>
                    <Text style={[styles.selectedIconLabel, { color: theme.primary }]}>Ícone selecionado</Text>
                  </View>
                ) : (
                  <Text style={styles.iconSelectorText}>Escolha um ícone (opcional)</Text>
                )}
                <ChevronRight size={18} color="#666" style={{ transform: [{ rotate: '90deg' }] as any }} />
              </TouchableOpacity>
              
              {iconsVisible && (
                <View style={styles.iconsDropdown}>
                  <ScrollView style={styles.iconsScrollView} horizontal={false} showsVerticalScrollIndicator={true}>
                    <View style={styles.iconsGrid}>
                      {availableIcons.map((item, index) => (
                        <TouchableOpacity 
                          key={index} 
                          style={[
                            styles.iconItem,
                            selectedIcon === item.emoji && styles.selectedIconItem
                          ]} 
                          onPress={() => selectTransactionIcon(item.emoji)}
                        >
                          <Text style={styles.iconEmoji}>{item.emoji}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Tipo de Transação (Pessoal ou Compartilhada) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tipo de Transação</Text>
              <View style={styles.sharingTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.sharingTypeButton,
                    !isSharedTransaction && [styles.activeSharingButton, { borderColor: theme.primary }]
                  ]}
                  onPress={() => {
                    setIsSharedTransaction(false);
                    setSelectedPartnerId(null);
                  }}
                >
                  <Text style={[
                    styles.sharingTypeText,
                    !isSharedTransaction && [styles.activeSharingText, { color: theme.primary }]
                  ]}>Pessoal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.sharingTypeButton,
                    isSharedTransaction && [styles.activeSharingButton, { borderColor: theme.shared }]
                  ]}
                  onPress={() => setIsSharedTransaction(true)}
                >
                  <Text style={[
                    styles.sharingTypeText,
                    isSharedTransaction && [styles.activeSharingText, { color: theme.shared }]
                  ]}>Compartilhada</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Seletor de Parceiro (apenas visível se for transação compartilhada) */}
            {isSharedTransaction && (
              <View style={[styles.inputGroup, { zIndex: 11 }]}>
                <Text style={styles.inputLabel}>Compartilhar com</Text>
                <TouchableOpacity 
                  style={[
                    styles.partnerSelector,
                    selectedPartnerId ? { borderColor: theme.shared, borderWidth: 1.5 } : null
                  ]} 
                  onPress={togglePartners}
                >
                  {selectedPartnerId ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.selectedPartnerText, { color: theme.shared }]}>
                        {userPartners.find(p => p.id === selectedPartnerId)?.name || 'Parceiro'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.partnerSelectorText}>Selecione um parceiro</Text>
                  )}
                  <ChevronRight size={18} color="#666" style={{ transform: [{ rotate: '90deg' }] as any }} />
                </TouchableOpacity>
                
                {partnersVisible && (
                  <View style={styles.partnersDropdown}>
                    {userPartners.length > 0 ? (
                      userPartners.map((partner, index) => (
                        <TouchableOpacity 
                          key={index} 
                          style={[
                            styles.partnerOption,
                            selectedPartnerId === partner.id && styles.selectedPartnerOption,
                            index === userPartners.length - 1 && { borderBottomWidth: 0 }
                          ]} 
                          onPress={() => selectPartner(partner.id)}
                        >
                          <Text style={[
                            styles.partnerOptionText,
                            selectedPartnerId === partner.id && [styles.selectedPartnerOptionText, { color: theme.shared }]
                          ]}>
                            {partner.name} {partner.isAvatar ? '(Avatar)' : ''}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={styles.partnerOption}>
                        <Text style={styles.partnerOptionText}>Nenhum parceiro disponível</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Seletor de Data */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Data</Text>
              <TouchableOpacity style={styles.dateInput} onPress={toggleCalendar}>
                <Calendar size={20} color="#666" style={styles.inputIcon} />
                <Text style={styles.dateText}>{selectedDate}</Text>
                <TouchableOpacity style={styles.calendarButton} onPress={toggleCalendar}>
                  <Calendar size={20} color="#666" />
                </TouchableOpacity>
              </TouchableOpacity>
              
              {calendarVisible && (
                <View style={styles.calendarPickerContainer}>
                  <View
                    style={[styles.calendarPickerHeader, { backgroundColor: theme.primary }]}
                  >
                    <View style={styles.calendarPickerMonthSelector}>
                      <TouchableOpacity onPress={goToPreviousPickerMonth} style={styles.calendarPickerArrow}>
                        <ChevronLeft size={24} color="#FFF" />
                      </TouchableOpacity>
                      
                      <Text style={styles.calendarPickerMonthText}>
                        {months[pickerMonth]} {pickerYear}
                      </Text>
                      
                      <TouchableOpacity onPress={goToNextPickerMonth} style={styles.calendarPickerArrow}>
                        <ChevronRight size={24} color="#FFF" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.pickerCalendarContainer}>
                      {renderPickerCalendarGrid()}
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Campo de Valor */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Valor</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>R$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0,00"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { zIndex: 10 }]}>
              <Text style={styles.inputLabel}>Forma de Pagamento</Text>
              <TouchableOpacity 
                style={[
                  styles.paymentMethodFullButton,
                  paymentMethod ? styles.paymentMethodSelected : null
                ]} 
                onPress={togglePaymentMethods}
              >
                {paymentMethod ? (
                  <>
                    {paymentMethod === 'Débito' && <CreditCard size={20} color={theme.primary} style={{marginRight: 10}} />}
                    {paymentMethod === 'Crédito' && <CreditCard size={20} color={theme.primary} style={{marginRight: 10}} />}
                    {paymentMethod === 'PIX' && <RefreshCw size={20} color={theme.primary} style={{marginRight: 10}} />}
                    {paymentMethod === 'Dinheiro' && <DollarSign size={20} color={theme.primary} style={{marginRight: 10}} />}
                    <Text style={styles.paymentMethodSelectedText}>{paymentMethod}</Text>
                  </>
                ) : (
                  <Text style={styles.paymentMethodText}>Selecione forma de pagamento</Text>
                )}
                <ChevronRight size={18} color="#666" style={{ transform: [{ rotate: '90deg' }] as any }} />
              </TouchableOpacity>
              
              {paymentMethodsVisible && (
                <View style={styles.paymentMethodsDropdown}>
                  <TouchableOpacity 
                    style={[
                      styles.paymentMethodOption,
                      paymentMethod === 'Débito' && styles.paymentMethodOptionSelected
                    ]} 
                    onPress={() => selectPaymentMethod('Débito')}
                  >
                    <CreditCard size={20} color={paymentMethod === 'Débito' ? theme.primary : theme.text} />
                    <Text style={[
                      styles.paymentMethodOptionText,
                      paymentMethod === 'Débito' && styles.paymentMethodOptionTextSelected
                    ]}>Débito</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.paymentMethodOption,
                      paymentMethod === 'Crédito' && styles.paymentMethodOptionSelected
                    ]} 
                    onPress={() => selectPaymentMethod('Crédito')}
                  >
                    <CreditCard size={20} color={paymentMethod === 'Crédito' ? theme.primary : theme.text} />
                    <Text style={[
                      styles.paymentMethodOptionText,
                      paymentMethod === 'Crédito' && styles.paymentMethodOptionTextSelected
                    ]}>Crédito</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.paymentMethodOption,
                      paymentMethod === 'PIX' && styles.paymentMethodOptionSelected
                    ]} 
                    onPress={() => selectPaymentMethod('PIX')}
                  >
                    <RefreshCw size={20} color={paymentMethod === 'PIX' ? theme.primary : theme.text} />
                    <Text style={[
                      styles.paymentMethodOptionText,
                      paymentMethod === 'PIX' && styles.paymentMethodOptionTextSelected
                    ]}>PIX</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.paymentMethodOption,
                      paymentMethod === 'Dinheiro' && styles.paymentMethodOptionSelected,
                      {borderBottomWidth: 0}
                    ]} 
                    onPress={() => selectPaymentMethod('Dinheiro')}
                  >
                    <DollarSign size={20} color={paymentMethod === 'Dinheiro' ? theme.primary : theme.text} />
                    <Text style={[
                      styles.paymentMethodOptionText,
                      paymentMethod === 'Dinheiro' && styles.paymentMethodOptionTextSelected
                    ]}>Dinheiro</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Seleção de Cartão */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Selecione o Cartão</Text>
              <TouchableOpacity style={styles.selectInput}>
                <Text style={styles.selectPlaceholder}>
                  {selectedCard || 'Selecione um cartão'}
                </Text>
                <ChevronRight size={20} color="#666" style={{ transform: [{ rotate: '90deg' }] as any }} />
              </TouchableOpacity>
            </View>

            {/* Configuração de Repetição */}
            <View style={[styles.inputGroup, { zIndex: 10 }]}>
              <Text style={styles.inputLabel}>Configurar Repetição</Text>
              <TouchableOpacity 
                style={[
                  styles.selectInput,
                  recurrenceType !== 'Não recorrente' ? { borderColor: theme.primary, borderWidth: 1.5 } : null
                ]} 
                onPress={toggleRecurrence}
              >
                {recurrenceType !== 'Não recorrente' ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <RefreshCw size={20} color={theme.primary} style={{marginRight: 10}} />
                    <Text style={[styles.selectPlaceholder, { color: theme.primary, fontFamily: fontFallbacks.Poppins_500Medium }]}>
                      {recurrenceType}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.selectPlaceholder}>{recurrenceType}</Text>
                )}
                <ChevronRight size={20} color="#666" style={{ transform: [{ rotate: '90deg' }] as any }} />
              </TouchableOpacity>
              
              {recurrenceVisible && (
                <View style={styles.paymentMethodsDropdown}>
                  <TouchableOpacity 
                    style={[
                      styles.paymentMethodOption,
                      recurrenceType === 'Não recorrente' && styles.paymentMethodOptionSelected
                    ]} 
                    onPress={() => selectRecurrenceType('Não recorrente')}
                  >
                    <X size={20} color={recurrenceType === 'Não recorrente' ? theme.primary : theme.text} />
                    <Text style={[
                      styles.paymentMethodOptionText,
                      recurrenceType === 'Não recorrente' && styles.paymentMethodOptionTextSelected
                    ]}>Não recorrente</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.paymentMethodOption,
                      recurrenceType === 'Mensal' && styles.paymentMethodOptionSelected,
                      {borderBottomWidth: 0}
                    ]} 
                    onPress={() => selectRecurrenceType('Mensal')}
                  >
                    <RefreshCw size={20} color={recurrenceType === 'Mensal' ? theme.primary : theme.text} />
                    <Text style={[
                      styles.paymentMethodOptionText,
                      recurrenceType === 'Mensal' && styles.paymentMethodOptionTextSelected
                    ]}>Mensal</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Campo de Data de Fim da Recorrência - só aparece se for recorrente */}
            {isRecurrent && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Data de Fim da Recorrência</Text>
                <TouchableOpacity style={styles.dateInput} onPress={toggleRecurrenceEndCalendar}>
                  <Calendar size={20} color="#666" style={styles.inputIcon} />
                  <Text style={[styles.dateText, !recurrenceEndDate && { color: '#999' }]}>
                    {recurrenceEndDate || 'Selecione a data de fim'}
                  </Text>
                  <TouchableOpacity style={styles.calendarButton} onPress={toggleRecurrenceEndCalendar}>
                    <Calendar size={20} color="#666" />
                  </TouchableOpacity>
                </TouchableOpacity>
                
                {recurrenceEndDateVisible && (
                  <View style={styles.calendarPickerContainer}>
                    <View
                      style={[styles.calendarPickerHeader, { backgroundColor: theme.primary }]}
                    >
                      <View style={styles.calendarPickerMonthSelector}>
                        <TouchableOpacity onPress={goToPreviousRecurrenceEndPickerMonth} style={styles.calendarPickerArrow}>
                          <ChevronLeft size={24} color="#FFF" />
                        </TouchableOpacity>
                        
                        <Text style={styles.calendarPickerMonthText}>
                          {months[recurrenceEndPickerMonth]} {recurrenceEndPickerYear}
                        </Text>
                        
                        <TouchableOpacity onPress={goToNextRecurrenceEndPickerMonth} style={styles.calendarPickerArrow}>
                          <ChevronRight size={24} color="#FFF" />
                        </TouchableOpacity>
                      </View>

                      <View style={styles.pickerCalendarContainer}>
                        {renderRecurrenceEndPickerCalendarGrid()}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Categoria */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoria</Text>
              <TouchableOpacity style={styles.selectInput}>
                <Text style={styles.selectPlaceholder}>
                  {selectedCategory || 'Selecione'}
                </Text>
                <ChevronRight size={20} color="#666" style={{ transform: [{ rotate: '90deg' }] as any }} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.addCategoryButton} onPress={toggleAddCategory}>
                <PlusCircle size={16} color={theme.primary} />
                <Text style={[styles.addCategoryText, { color: theme.primary }]}>Adicionar Nova Categoria</Text>
              </TouchableOpacity>
              
              {/* Campo para adicionar nova categoria */}
              {isAddingCategory && (
                <View style={[
                  styles.newCategoryFormContainer,
                  {
                    borderColor: transactionType === 'expense' ? 'rgb(254, 202, 202)' : // #fecaca
                               transactionType === 'income' ? 'rgb(187, 247, 208)' : 'rgb(229, 231, 235)', // #bbf7d0 : #e5e7eb
                    marginTop: 12,
                  }
                ]}>
                  {/* Container horizontal com elementos */}
                  <View style={styles.categoryFormRow}>
                    {/* Botão seletor de emoji */}
                    <TouchableOpacity 
                      style={styles.emojiSelectorButton}
                      onPress={toggleNewCategoryIcons}
                    >
                      <Text style={styles.emojiSelectorText}>
                        {newCategoryIcon || '📝'}
                      </Text>
                    </TouchableOpacity>
                    
                    {/* Campo de entrada de texto */}
                    <TextInput
                      style={[
                        styles.categoryNameInput,
                        {
                          borderColor: transactionType === 'expense' ? 'rgb(254, 202, 202)' : // #fecaca
                                     transactionType === 'income' ? 'rgb(187, 247, 208)' : 'rgb(229, 231, 235)', // #bbf7d0 : #e5e7eb
                        }
                      ]}
                      value={newCategoryName}
                      onChangeText={setNewCategoryName}
                      placeholder="Nome da nova categoria"
                      placeholderTextColor="rgb(156, 163, 175)" // #9ca3af
                    />
                    
                    {/* Botão Adicionar */}
                    <TouchableOpacity 
                      style={[
                        styles.addCategorySubmitButton,
                        {
                          backgroundColor: transactionType === 'expense' ? 'rgb(239, 68, 68)' : // #ef4444
                                         transactionType === 'income' ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)', // #22c55e : #3b82f6
                        }
                      ]}
                      onPress={saveNewCategory}
                    >
                      <Text style={[
                        styles.addCategorySubmitText,
                        {
                          color: '#ffffff'
                        }
                      ]}>
                        Adicionar
                      </Text>
                    </TouchableOpacity>
                    
                    {/* Botão fechar */}
                    <TouchableOpacity 
                      style={styles.closeCategoryFormButton}
                      onPress={cancelAddCategory}
                    >
                      <X size={18} color="rgb(107, 114, 128)" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Seletor de emojis dropdown */}
                  {newCategoryIconsVisible && (
                    <View style={styles.emojiDropdown}>
                      <View style={styles.emojiGrid}>
                        {['📝', '🍽️', '🏠', '🚗', '🏥', '🎭', '💰', '🛒', '✈️', '📱', '📚', '🎁', '📊', '👕'].map((emoji, index) => (
                          <TouchableOpacity 
                            key={index}
                            style={[
                              styles.emojiGridItem,
                              newCategoryIcon === emoji && styles.emojiGridItemSelected
                            ]}
                            onPress={() => selectNewCategoryIcon(emoji)}
                          >
                            <Text style={styles.emojiGridText}>{emoji}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Conta */}
            <View style={[styles.inputGroup, { zIndex: 9 }]}>
              <Text style={styles.inputLabel}>Conta</Text>
              <TouchableOpacity 
                style={[
                  styles.selectInput,
                  selectedAccount ? { borderColor: theme.primary, borderWidth: 1.5 } : null
                ]} 
                onPress={toggleAccounts}
              >
                {selectedAccount ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.selectPlaceholder, { color: theme.primary, fontFamily: fontFallbacks.Poppins_500Medium }]}>
                      {selectedAccount}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.selectPlaceholder}>Selecione</Text>
                )}
                <ChevronRight size={20} color="#666" style={{ transform: [{ rotate: '90deg' }] as any }} />
              </TouchableOpacity>
              
              {accountsVisible && (
                <View style={styles.paymentMethodsDropdown}>
                  {userAccounts.length > 0 ? userAccounts.map((account) => (
                    <TouchableOpacity 
                      key={account.id}
                      style={[
                        styles.paymentMethodOption,
                        selectedAccountId === account.id && styles.paymentMethodOptionSelected,
                        account.id === userAccounts[userAccounts.length - 1].id && {borderBottomWidth: 0}
                      ]} 
                      onPress={() => selectAccount(account)}
                    >
                      {/* Emoji baseado no tipo de conta */}
                      <Text style={{ fontSize: 20, marginRight: 10 }}>
                        {account.type === 'Conta Corrente' ? '🏦' : 
                         account.type === 'Poupança' ? '💰' : 
                         account.type === 'Investimento' ? '📈' : 
                         account.type === 'Dinheiro Físico' ? '💵' : '💳'}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[
                          styles.paymentMethodOptionText,
                          selectedAccountId === account.id && styles.paymentMethodOptionTextSelected
                        ]}>{account.name}</Text>
                        <Text style={{ fontSize: 12, color: '#777', fontFamily: fontFallbacks.Poppins_400Regular }}>
                          {account.type}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )) : (
                    <View style={styles.paymentMethodOption}>
                      <Text style={styles.paymentMethodOptionText}>Nenhuma conta encontrada</Text>
                    </View>
                  )}
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.addCategoryButton}
                onPress={() => router.push('/(app)/accounts')}
              >
                <PlusCircle size={16} color={theme.primary} />
                <Text style={[styles.addCategoryText, { color: theme.primary }]}>Adicionar Nova Conta</Text>
              </TouchableOpacity>
            </View>

            {/* Mensagem de erro */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton, 
                { backgroundColor: theme.primary },
                isSaving && styles.saveButtonDisabled
              ]}
              onPress={saveTransaction}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Salvando...' : 'Salvar Transação'}
              </Text>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
                style={styles.menuCloseButton}
                onPress={() => setMenuModalVisible(false)}
              >
                <X size={24} color={theme.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuGrid}>
              {/* Primeira linha */}
              <View style={styles.menuRow}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuModalVisible(false);
                    router.replace('/(app)/dashboard');
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
                    setMenuModalVisible(false);
                    openAddTransactionModal();
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
                    setMenuModalVisible(false);
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
                    setMenuModalVisible(false);
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
                    setMenuModalVisible(false);
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
                    setMenuModalVisible(false);
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
                    setMenuModalVisible(false);
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
                    setMenuModalVisible(false);
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
                    setMenuModalVisible(false);
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
              onPress={() => setMenuModalVisible(false)}
            >
              <Text style={styles.closeFullButtonText}>Fechar</Text>
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
          style={styles.addButton}
          onPress={openAddTransactionModal}
        >
          <View style={[styles.addButtonInner, { backgroundColor: theme.primary }]}>
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
