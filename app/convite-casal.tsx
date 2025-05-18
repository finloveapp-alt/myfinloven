import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams, Link } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { fontFallbacks } from '@/utils/styles';
import { verifyInvitation } from '@/app/supabase/couples-invite-helper';
import { LinearGradient } from 'expo-linear-gradient';

// Função auxiliar para extrair parâmetros da URL
function extractParamsFromUrl() {
  // Verifica se estamos em ambiente web
  if (typeof window !== 'undefined') {
    // Tenta extrair do redirect_to
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect_to');
    
    if (redirectTo) {
      // Se temos um redirect_to, precisamos decodificá-lo e extrair seus parâmetros
      try {
        const decodedRedirect = decodeURIComponent(redirectTo);
        const redirectUrl = new URL(decodedRedirect);
        const redirectParams = new URLSearchParams(redirectUrl.search);
        
        return {
          token: redirectParams.get('token'),
          inviter: redirectParams.get('inviter'),
          couple: redirectParams.get('couple'),
          email: redirectParams.get('email')
        };
      } catch (error) {
        console.error("Erro ao decodificar redirect_to:", error);
      }
    }
    
    // Tenta extrair diretamente da URL atual
    const currentParams = new URLSearchParams(window.location.search);
    return {
      token: currentParams.get('token'),
      inviter: currentParams.get('inviter'),
      couple: currentParams.get('couple'),
      email: currentParams.get('email')
    };
  }
  
  return { token: null, inviter: null, couple: null, email: null };
}

export default function ConviteCasal() {
  // Obter parâmetros da URL de duas maneiras possíveis
  const params = useLocalSearchParams();
  const [urlParams, setUrlParams] = useState({
    token: params?.token as string,
    inviter: params?.inviter as string,
    couple: params?.couple as string,
    email: params?.email as string
  });

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState('');

  // Tentar extrair parâmetros da URL em um efeito separado
  useEffect(() => {
    // Se não temos todos os parâmetros, tentar extrair da URL
    if (!urlParams.token || !urlParams.inviter || !urlParams.couple) {
      console.log("Tentando extrair parâmetros da URL");
      const extractedParams = extractParamsFromUrl();
      console.log("Parâmetros extraídos:", extractedParams);
      
      if (extractedParams.token && extractedParams.inviter && extractedParams.couple) {
        setUrlParams(extractedParams);
      }
    }
  }, []);

  useEffect(() => {
    if (!urlParams.token || !urlParams.inviter || !urlParams.couple) {
      console.error("Parâmetros incompletos:", urlParams);
      setError('Link de convite inválido ou incompleto');
      setLoading(false);
      return;
    }

    async function verifyInvite() {
      try {
        console.log("Verificando convite:", urlParams);
        const inviteDetails = await verifyInvitation(urlParams.token, urlParams.inviter, urlParams.couple);
        
        if (!inviteDetails) {
          console.error("Detalhes do convite não encontrados");
          setError('Convite não encontrado ou já utilizado');
        } else {
          console.log("Detalhes do convite encontrados:", inviteDetails);
          setInviteData(inviteDetails);
        }
      } catch (err) {
        console.error("Erro ao verificar convite:", err);
        setError('Erro ao verificar convite. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }

    verifyInvite();
  }, [urlParams.token, urlParams.inviter, urlParams.couple]);

  const handleAcceptInvite = () => {
    // Redirecionar para a tela de registro com os parâmetros necessários
    const registerParams = new URLSearchParams({
      fromCoupleInvitation: 'true',
      invitationToken: urlParams.token,
      inviterId: urlParams.inviter,
      coupleId: urlParams.couple
    });

    if (urlParams.email) {
      registerParams.append('invitationEmail', urlParams.email);
    } else {
      registerParams.append('manualEntry', 'true');
    }

    router.push({
      pathname: '/(auth)/register',
      params: Object.fromEntries(registerParams)
    });
  };

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#ffffff', 'rgba(182,135,254,0.2)']}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Verificando convite...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#ffffff', 'rgba(182,135,254,0.2)']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.title}>
              {error ? 'Ops! Temos um problema' : 'Convite para MyFinlove'}
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => router.push('/')}
                >
                  <Text style={styles.buttonText}>Voltar para o início</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleSignIn}
                >
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>Já tenho uma conta</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.contentContainer}>
                <Text style={styles.inviteText}>
                  {inviteData?.inviter?.name 
                    ? `${inviteData.inviter.name} convidou você para gerenciar finanças juntos no MyFinlove!` 
                    : 'Você foi convidado para gerenciar finanças em casal no MyFinlove!'}
                </Text>
                
                <View style={styles.divider} />
                
                <Text style={styles.instructionText}>
                  Para aceitar o convite, crie uma conta associada ao seu parceiro(a):
                </Text>
                
                <TouchableOpacity 
                  style={styles.button}
                  onPress={handleAcceptInvite}
                >
                  <Text style={styles.buttonText}>Aceitar convite e criar conta</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleSignIn}
                >
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                    Já tenho uma conta
                  </Text>
                </TouchableOpacity>
                
                <Text style={styles.infoText}>
                  Ao criar uma conta através deste convite, você estará se conectando ao perfil do seu parceiro(a) para compartilhar o gerenciamento financeiro.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#555',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  contentContainer: {
    alignItems: 'center',
  },
  inviteText: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_500Medium,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
  },
  instructionText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6c5ce7',
  },
  secondaryButtonText: {
    color: '#6c5ce7',
  },
  infoText: {
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
}); 