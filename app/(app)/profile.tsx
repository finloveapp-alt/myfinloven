import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { User, DollarSign, Shield, FileText, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import themes from '@/constants/themes';
import { fontFallbacks } from '@/utils/styles';
import BottomNavigation from '@/components/BottomNavigation';

// Interface para o perfil de usuário
interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender: string;
  avatar_url?: string;
  profile_picture_url?: string;
  account_type?: string;
  is_avatar?: boolean;
}

export default function Profile() {
  const [theme, setTheme] = useState(themes.feminine);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar perfil:', error);
        } else if (profile) {
          setCurrentUser({
            id: profile.id,
            name: profile.name || 'Usuário',
            email: profile.email || user.email || '',
            gender: profile.gender || 'feminine',
            avatar_url: profile.avatar_url,
            profile_picture_url: profile.profile_picture_url,
            account_type: profile.account_type,
            is_avatar: profile.is_avatar
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.clear();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const renderAvatar = () => {
    const avatarSize = 100;
    const avatarStyle = {
      width: avatarSize,
      height: avatarSize,
      borderRadius: avatarSize / 2,
      backgroundColor: theme.primary,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: 16,
    };

    return (
      <View style={avatarStyle}>
        <User size={50} color="#ffffff" />
      </View>
    );
  };

  const MenuOption = ({ icon, title, onPress, isLogout = false }: {
    icon: React.ReactNode;
    title: string;
    onPress: () => void;
    isLogout?: boolean;
  }) => (
    <TouchableOpacity 
      style={[styles.menuOption, isLogout && styles.logoutOption]} 
      onPress={onPress}
    >
      <View style={styles.menuOptionIcon}>
        {icon}
      </View>
      <Text style={[
        styles.menuOptionText, 
        isLogout && { color: '#FF3B30' }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="dark" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header com Avatar */}
        <View style={styles.header}>
          {renderAvatar()}
          <Text style={styles.userName}>{currentUser?.name || 'Usuário'}</Text>
          <Text style={styles.userEmail}>{currentUser?.email}</Text>
          <Text style={styles.userPlan}>Plano Gratuito</Text>
        </View>

        {/* Menu de Opções */}
        <View style={styles.menuContainer}>
          <MenuOption
            icon={<User size={24} color="#666" />}
            title={currentUser?.email || 'joaodev@teste.com'}
            onPress={() => {
              // Navegar para edição de perfil
            }}
          />
          
          <MenuOption
            icon={<DollarSign size={24} color="#666" />}
            title="Planos e Preços"
            onPress={() => {
              // Navegar para planos
            }}
          />
          
          <MenuOption
            icon={<Shield size={24} color="#666" />}
            title="Políticas de privacidade"
            onPress={() => {
              // Navegar para políticas
            }}
          />
          
          <MenuOption
            icon={<FileText size={24} color="#666" />}
            title="Termos de uso"
            onPress={() => {
              // Navegar para termos
            }}
          />
          
          <MenuOption
            icon={<LogOut size={24} color="#FF3B30" />}
            title="Excluir Conta"
            onPress={handleLogout}
            isLogout={true}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100, // Espaço para o bottom navigation
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  userName: {
    fontSize: 24,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666',
    marginBottom: 8,
  },
  userPlan: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logoutOption: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  menuOptionIcon: {
    marginRight: 16,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuOptionText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333',
    flex: 1,
  },
});