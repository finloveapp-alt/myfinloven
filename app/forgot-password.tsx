import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { fontFallbacks } from '@/utils/styles';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Armazenaremos a nova senha no localStorage/AsyncStorage para usá-la depois
  const storePasswordForReset = async (email: string, newPassword: string) => {
    try {
      // Em um app real, você precisaria criptografar esta senha ou usar uma solução mais segura
      // Esta é uma implementação simples para fins de demonstração
      localStorage.setItem(`reset_password_${email}`, newPassword);
      return true;
    } catch (error) {
      console.error("Erro ao armazenar senha temporária:", error);
      return false;
    }
  };

  async function handleResetPassword() {
    if (!email) {
      Alert.alert('Erro', 'Por favor, informe seu email');
      return;
    }

    if (!newPassword) {
      Alert.alert('Erro', 'Por favor, informe sua nova senha');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    
    setLoading(true);
    try {
      // Armazenar a senha temporariamente
      const stored = await storePasswordForReset(email, newPassword);
      if (!stored) {
        Alert.alert('Erro', 'Não foi possível processar sua solicitação');
        setLoading(false);
        return;
      }

      // Enviar email de redefinição
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'myfinlove://reset-password',
      });

      if (error) {
        Alert.alert('Erro', error.message);
        return;
      }

      setResetSent(true);
      Alert.alert(
        'Email enviado',
        'Enviamos um link para o seu email. Clique nele para confirmar a redefinição de senha.'
      );
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao processar sua solicitação');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={['#ffffff','rgba(182,135,254,0.2)']}
      start={{ x: 0.5, y: 0.5 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.topBackButton} onPress={() => router.push('/(auth)/login')}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.cardContent}>
          <View style={styles.imageContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.push('/(auth)/login')}
            >
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>
              {resetSent 
                ? 'Enviamos um email com instruções para redefinir sua senha. Verifique sua caixa de entrada e clique no link para confirmar.' 
                : 'Preencha seu email e defina uma nova senha. Após enviar, você receberá um link de confirmação no seu email.'}
            </Text>
          </View>

          {!resetSent ? (
            <>
              <View style={styles.inputsContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    style={styles.input}
                    placeholderTextColor="#66666680"
                    keyboardType="email-address"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Nova senha"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    style={styles.input}
                    placeholderTextColor="#66666680"
                  />
                </View>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    style={styles.input}
                    placeholderTextColor="#66666680"
                  />
                </View>
              </View>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity 
                  style={styles.resetButton}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  <Text style={styles.resetButtonText}>
                    {loading ? 'Enviando...' : 'Enviar instruções'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.returnButton}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.returnButtonText}>Voltar para o login</Text>
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
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContent: {
    alignItems: 'center',
    padding: 0,
    flex: 1,
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#b687fe',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  textContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#131313',
    marginBottom: 12,
    lineHeight: 34,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666666',
    lineHeight: 22,
    textAlign: 'left',
  },
  inputsContainer: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 20,
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  buttonsContainer: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 30,
  },
  resetButton: {
    backgroundColor: '#b687fe',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  returnButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#b687fe',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  returnButtonText: {
    color: '#b687fe',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  topBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
