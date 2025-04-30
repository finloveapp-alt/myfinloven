import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { fontFallbacks } from '@/utils/styles';
import { Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    return () => setMounted(false);
  }, []);

  async function signUpWithEmail() {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu nome');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu email');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name,
            display_name: name.split(' ')[0], // Primeiro nome como display name
            created_at: new Date().toISOString(),
          },
          emailRedirectTo: window.location?.origin || 'myfinlove://'
        }
      });

      if (error) {
        console.error("Erro no cadastro:", error.message);
        Alert.alert('Erro', `Falha ao criar conta: ${error.message}`);
      } else if (data?.user) {
        setSuccessModalVisible(true);
      } else {
        setSuccessModalVisible(true);
      }
    } catch (error) {
      console.error("Exceção no cadastro:", error);
      Alert.alert('Erro', 'Ocorreu um erro ao criar a conta. Verifique sua conexão com a internet.');
    } finally {
      if (mounted) {
        setLoading(false);
      }
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
        <LinearGradient
          colors={['#ffffff','rgba(182,135,254,0.2)']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.cardContainer}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Comece sua jornada financeira a dois</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Nome completo"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                style={styles.input}
                placeholderTextColor="#66666680"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                placeholderTextColor="#66666680"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                style={[styles.input, styles.passwordInput]}
                placeholderTextColor="#66666680"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff size={22} color="#666666" />
                ) : (
                  <Eye size={22} color="#666666" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                style={[styles.input, styles.passwordInput]}
                placeholderTextColor="#66666680"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                {showConfirmPassword ? (
                  <EyeOff size={22} color="#666666" />
                ) : (
                  <Eye size={22} color="#666666" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={signUpWithEmail}
              style={styles.registerButton}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLinkHighlight}>Fazer login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>

      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Finlove diz</Text>
            <Text style={styles.modalMessage}>
              Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setSuccessModalVisible(false);
                router.push('/(auth)/login');
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  cardContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'transparent',
    borderRadius: 30,
    padding: 24,
    elevation: 5,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundImage: 'linear-gradient(to bottom, #ffffff, rgba(182,135,254,0.2))',
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333333',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  registerButton: {
    backgroundColor: '#b687fe',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#666666',
    fontFamily: fontFallbacks.Poppins_400Regular,
    fontSize: 14,
  },
  loginLinkHighlight: {
    color: '#0073ea',
    fontFamily: fontFallbacks.Poppins_500Medium,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: '#b687fe',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: 'white',
  },
});