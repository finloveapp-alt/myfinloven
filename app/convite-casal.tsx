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
    console.log("DEPURAÇÃO - URL completa:", window.location.href);
    
    // Tenta extrair do redirect_to
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get('redirect_to');
    console.log("DEPURAÇÃO - Parâmetro redirect_to:", redirectTo);
    
    if (redirectTo) {
      // Se temos um redirect_to, precisamos decodificá-lo e extrair seus parâmetros
      try {
        const decodedRedirect = decodeURIComponent(redirectTo);
        console.log("DEPURAÇÃO - URL decodificada:", decodedRedirect);
        
        const redirectUrl = new URL(decodedRedirect);
        const redirectParams = new URLSearchParams(redirectUrl.search);
        console.log("DEPURAÇÃO - Parâmetros da URL redirecionada:", {
          token: redirectParams.get('token'),
          inviter: redirectParams.get('inviter'),
          couple: redirectParams.get('couple'),
          email: redirectParams.get('email')
        });
        
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
    console.log("DEPURAÇÃO - Parâmetros da URL atual:", {
      token: currentParams.get('token'),
      inviter: currentParams.get('inviter'),
      couple: currentParams.get('couple'),
      email: currentParams.get('email')
    });
    
    // Try parsing hash params if they exist
    if (window.location.hash) {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        console.log("DEPURAÇÃO - Parâmetros do hash:", {
          token: hashParams.get('token'),
          inviter: hashParams.get('inviter'),
          couple: hashParams.get('couple'),
          email: hashParams.get('email')
        });
        
        // If hash params are valid, return them
        if (hashParams.get('token') && hashParams.get('inviter') && hashParams.get('couple')) {
          return {
            token: hashParams.get('token'),
            inviter: hashParams.get('inviter'),
            couple: hashParams.get('couple'),
            email: hashParams.get('email')
          };
        }
      } catch (e) {
        console.error("Erro ao processar hash:", e);
      }
    }
    
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
  const [debugInfo, setDebugInfo] = useState('');

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState('');

  // Depurar parâmetros no início
  useEffect(() => {
    console.log("DEPURAÇÃO - useLocalSearchParams:", params);
    const debugText = `Params recebidos:
    token: ${params?.token || 'null'}
    inviter: ${params?.inviter || 'null'}
    couple: ${params?.couple || 'null'}
    email: ${params?.email || 'null'}`;
    setDebugInfo(debugText);
  }, [params]);

  // Tentar extrair parâmetros da URL em um efeito separado
  useEffect(() => {
    // Se não temos todos os parâmetros, tentar extrair da URL
    if (!urlParams.token || !urlParams.inviter || !urlParams.couple) {
      console.log("Tentando extrair parâmetros da URL");
      const extractedParams = extractParamsFromUrl();
      console.log("Parâmetros extraídos:", extractedParams);
      
      if (extractedParams.token && extractedParams.inviter && extractedParams.couple) {
        setUrlParams(extractedParams);
        
        // Atualizar informações de depuração
        const newDebugText = `${debugInfo}\n\nParâmetros extraídos da URL:
        token: ${extractedParams.token || 'null'}
        inviter: ${extractedParams.inviter || 'null'}
        couple: ${extractedParams.couple || 'null'}
        email: ${extractedParams.email || 'null'}`;
        setDebugInfo(newDebugText);
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
          
          // Atualizar informações de depuração
          const newDebugText = `${debugInfo}\n\nDados do convite:
          id: ${inviteDetails.id || 'null'}
          status: ${inviteDetails.status || 'null'}
          user1_id: ${inviteDetails.user1_id || 'null'}
          invitation_email: ${inviteDetails.invitation_email || 'null'}`;
          setDebugInfo(newDebugText);
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
    // Garantir que todos os parâmetros necessários sejam incluídos
    // Mesmo que alguns estejam vazios, vamos incluí-los explicitamente para debugging
    const registerParams = {
      fromCoupleInvitation: 'true',
      invitationToken: urlParams.token || '',
      inviterId: urlParams.inviter || '',
      coupleId: urlParams.couple || ''
    };

    // Adicionar email se disponível
    if (urlParams.email) {
      registerParams['invitationEmail'] = urlParams.email;
    } else {
      registerParams['manualEntry'] = 'true';
    }

    console.log("DEPURAÇÃO - Parâmetros para registro:", registerParams);

    // Na versão web, também podemos tentar pegar parâmetros da URL diretamente
    if (typeof window !== 'undefined') {
      console.log("DEPURAÇÃO - URL ao aceitar convite:", window.location.href);
      
      // Se estamos em modo de desenvolvimento, vamos adicionar informações adicionais
      if (process.env.NODE_ENV === 'development') {
        const extractedParams = extractParamsFromUrl();
        console.log("DEPURAÇÃO - Parâmetros extraídos ao aceitar:", extractedParams);
        
        // Se temos parâmetros válidos da URL que podem estar faltando nos urlParams
        if (extractedParams.token && !urlParams.token) registerParams['invitationToken'] = extractedParams.token;
        if (extractedParams.inviter && !urlParams.inviter) registerParams['inviterId'] = extractedParams.inviter;
        if (extractedParams.couple && !urlParams.couple) registerParams['coupleId'] = extractedParams.couple;
        if (extractedParams.email && !urlParams.email) registerParams['invitationEmail'] = extractedParams.email;
      }
    }

    // Redirecionar para o registro com os parâmetros
    router.push({
      pathname: '/(auth)/register',
      params: registerParams
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
                <View style={styles.debugContainer}>
                  <Text style={styles.debugTitle}>Informações de Debug:</Text>
                  <Text style={styles.debugText}>{debugInfo}</Text>
                </View>
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
                
                <View style={styles.debugContainer}>
                  <Text style={styles.debugTitle}>Informações de Debug:</Text>
                  <Text style={styles.debugText}>{debugInfo}</Text>
                </View>
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
  debugContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#555',
    whiteSpace: 'pre-wrap'
  }
}); 