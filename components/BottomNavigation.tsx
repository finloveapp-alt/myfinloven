import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, BarChart, PlusCircle, Receipt, CreditCard } from 'lucide-react-native';
import { router } from 'expo-router';
import { fontFallbacks } from '@/utils/styles';

interface BottomNavigationProps {
  theme: {
    primary: string;
    card: string;
  };
}

export default function BottomNavigation({ theme }: BottomNavigationProps) {
  return (
    <View style={[styles.bottomNav, { backgroundColor: theme.card }]}>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => router.push('/(app)/dashboard')}
      >
        <Home size={24} color="#999" />
        <Text style={styles.navText}>Início</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => router.push('/(app)/dashboard')}
      >
        <BarChart size={24} color={theme.primary} />
        <Text style={[styles.navText, { color: theme.primary }]}>Dashboard</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.addButton}>
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
        onPress={() => router.push('/(app)/cards')}
      >
        <CreditCard size={24} color="#999" />
        <Text style={styles.navText}>Cartões</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
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
    backgroundColor: '#b687fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 