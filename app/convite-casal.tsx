import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { fontFallbacks } from '@/utils/styles';
import * as Linking from 'expo-linking';
import { extractInviteParameters, verifyInvitation } from './supabase/couples-invite-helper';

// Função para decodificar Base64URL para texto
const base64UrlDecode = (input: string) => {
  try {
    // Substituir caracteres especiais do Base64URL
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    // Adicionar padding se necessário
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    
    // Em React Native/Expo, precisamos de uma abordagem que funcione em ambientes
    if (typeof atob !== 'undefined') {
      return atob(base64 + padding);
    } else {
      // Em React Native puro usaríamos Buffer, mas como estamos com Expo:
      // Decodificação manual para ambientes sem atob
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let output = '';
      let i = 0;
      
      const encoded = base64 + padding;
      
      while (i < encoded.length) {
        const char1 = chars.indexOf(encoded.charAt(i++));
        const char2 = chars.indexOf(encoded.charAt(i++));
        const char3 = chars.indexOf(encoded.charAt(i++));
        const char4 = chars.indexOf(encoded.charAt(i++));
        
        const byte1 = (char1 << 2) | (char2 >> 4);
        const byte2 = ((char2 & 15) << 4) | (char3 >> 2);
        const byte3 = ((char3 & 3) << 6) | char4;
        
        output += String.fromCharCode(byte1);
        
        if (char3 !== 64) {
          output += String.fromCharCode(byte2);
        }
        if (char4 !== 64) {
          output += String.fromCharCode(byte3);
        }
      }
      
      return output;
    }
  } catch (error) {
    console.error('Erro na decodificação Base64:', error);
    return '';
  }
};

export default function ConviteCasal() {
  const [loading, setLoading] = useState(true);
  const [inviterDetails, setInviterDetails] = useState<any>(null);
  const [inviteData, setInviteData] = useState<{
    token?: string;
    inviterId?: string;
    coupleId?: string;
    inviterName?: string;
    email?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInviteData() {
      try {
        setLoading(true);
        
        // Usar o helper para extrair parâmetros
        const params = await extractInviteParameters();
        console.log('Parâmetros de convite extraídos:', params);
        
        if (!params?.token || !params?.inviterId || !params?.coupleId) {
          setError('Não foi possível processar o link do convite. Por favor, solicite um novo convite.');
          setLoading(false);
          return;
        }
        
        setInviteData(params);
        
        // Verificar validade do convite
        const inviteDetails = await verifyInvitation(
          params.token,
          params.inviterId,
          params.coupleId
        );
        
        if (!inviteDetails) {
          setError('Convite inválido ou expirado');
          setLoading(false);
          return;
        }
        
        console.log('Detalhes do convite:', inviteDetails);
        
        // Se temos os dados do convidante incluídos na resposta
        if (inviteDetails.inviter) {
          setInviterDetails(inviteDetails.inviter);
        } else {
          // Buscar detalhes do convidante separadamente
          await fetchInviterDetails(params.inviterId);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao processar convite:', error);
        setError('Ocorreu um erro ao processar o convite');
        setLoading(false);
      }
    }
    
    loadInviteData();
  }, []);

  async function fetchInviterDetails(inviterId: string) {
    if (!inviterId) return;
    
    try {
      console.log(`Buscando detalhes do convidante com ID: ${inviterId}`);
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', inviterId)
        .single();
      
      if (profileError) {
        console.error('Erro ao buscar perfil do convidante:', profileError);
        return;
      }
      
      if (profileData) {
        console.log('Dados do convidante encontrados:', profileData);
        setInviterDetails(profileData);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do convidante:', error);
    }
  }

  function acceptInvitation() {
    if (!inviteData.token || !inviteData.inviterId || !inviteData.coupleId) {
      Alert.alert('Erro', 'Dados do convite incompletos');
      return;
    }
    
    // Verificar email do convite para garantir que não está vazio
    const invitationEmail = inviteData.email || 
                           (inviterDetails && inviterDetails.invitation_email) || 
                           '';
                           
    console.log('Redirecionando para registro com email:', invitationEmail);
    
    // Redirecionar para tela de registro com os parâmetros
    router.push({
      pathname: '/(auth)/register',
      params: {
        fromCoupleInvitation: 'true',
        invitationToken: inviteData.token,
        inviterId: inviteData.inviterId,
        coupleId: inviteData.coupleId,
        invitationEmail: invitationEmail
      }
    });
  }

  async function rejectInvitation() {
    if (!inviteData.coupleId) {
      router.replace('/');
      return;
    }
    
    try {
      setLoading(true);
      
      // Atualizar status do convite para rejeitado
      const { error } = await supabase
        .from('couples')
        .update({ status: 'rejected' })
        .eq('id', inviteData.coupleId);
      
      if (error) {
        console.error('Erro ao rejeitar convite:', error);
      }
      
      // Redirecionar para home de qualquer forma
      router.replace('/');
    } catch (error) {
      console.error('Erro ao rejeitar convite:', error);
      router.replace('/');
    }
  }

  return (
    <LinearGradient
      colors={['#ffffff', 'rgba(182,135,254,0.2)']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Convite de Casal</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#B687FE" />
              <Text style={styles.loadingText}>Verificando convite...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.buttonPrimary}
                onPress={() => router.replace('/')}
              >
                <Text style={styles.buttonText}>Voltar para Início</Text>
              </TouchableOpacity>
            </View>
          ) : inviterDetails ? (
            <>
              <Text style={styles.message}>
                {inviterDetails.name || inviterDetails.full_name || inviteData.inviterName || 'Seu parceiro(a)'} convidou você para gerenciar finanças juntos no MyFinlove!
              </Text>
              
              <Text style={styles.subMessage}>
                Ao aceitar este convite, você poderá compartilhar informações financeiras selecionadas com seu parceiro(a).
              </Text>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.buttonPrimary}
                  onPress={acceptInvitation}
                >
                  <Text style={styles.buttonText}>Aceitar Convite</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.buttonSecondary}
                  onPress={rejectInvitation}
                >
                  <Text style={styles.buttonTextSecondary}>Recusar</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Não foi possível carregar os detalhes do convite.</Text>
              <TouchableOpacity 
                style={styles.buttonPrimary}
                onPress={() => router.replace('/')}
              >
                <Text style={styles.buttonText}>Voltar para Início</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: fontFallbacks.bold,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    fontFamily: fontFallbacks.medium,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  subMessage: {
    fontSize: 16,
    fontFamily: fontFallbacks.regular,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  buttonPrimary: {
    backgroundColor: '#B687FE',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fontFallbacks.medium,
  },
  buttonTextSecondary: {
    color: '#666',
    fontSize: 16,
    fontFamily: fontFallbacks.medium,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    fontFamily: fontFallbacks.regular,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fontFallbacks.regular,
  }
}); 