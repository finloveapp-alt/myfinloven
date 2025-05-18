import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams, Link } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { fontFallbacks } from '@/utils/styles';
import { verifyInvitation } from '@/app/supabase/couples-invite-helper';
import { LinearGradient } from 'expo-linear-gradient';

export default function ConviteCasal() {
  const params = useLocalSearchParams();
  const token = params?.token as string;
  const inviter = params?.inviter as string;
  const couple = params?.couple as string;
  const email = params?.email as string;

  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !inviter || !couple) {
      console.error("Parâmetros incompletos:", { token, inviter, couple });
      setError('Link de convite inválido ou incompleto');
      setLoading(false);
      return;
    }

    async function verifyInvite() {
      try {
        console.log("Verificando convite:", { token, inviter, couple });
        const inviteDetails = await verifyInvitation(token, inviter, couple);
        
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
  }, [token, inviter, couple]);

  const handleAcceptInvite = () => {
    // Redirecionar para a tela de registro com os parâmetros necessários
    const registerParams = new URLSearchParams({
      fromCoupleInvitation: 'true',
      invitationToken: token,
      inviterId: inviter,
      coupleId: couple
    });

    if (email) {
      registerParams.append('invitationEmail', email);
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