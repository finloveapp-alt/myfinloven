import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { fontFallbacks } from '@/utils/styles';
import { Eye, EyeOff } from 'lucide-react-native';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    return () => setMounted(false);
  }, []);

  async function signInWithEmail() {
    setLoading(true);
    try {
      try {
        // Tenta autenticar com Supabase
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        // Se houver erro, mostra mensagem
        if (error && mounted) {
          alert(error.message);
          return;
        }

        // Se autenticou com sucesso, redireciona
        if (mounted) {
          router.replace('/(app)/dashboard');
          return;
        }
      } catch (supabaseError) {
        console.log('Erro Supabase:', supabaseError);
        alert('Erro de conexão com o servidor. Tente novamente ou use a conta de teste.');
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }

  async function signInWithProvider(provider: 'google') {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      });

      if (error) {
        alert(`Erro ao fazer login com Google: ${error.message}`);
      }
    } catch (error) {
      alert('Erro ao conectar com provedor externo');
    }
  }

  async function signInWithTestAccount() {
    // Detectar qual conta usar baseado no email fornecido
    const isMasculineTheme = email.toLowerCase() === 'homem@finlove.com';
    const loginEmail = email.toLowerCase() === 'homem@finlove.com' ? 'homem@finlove.com' : 'teste@finlove.com';
    
    setLoading(true);
    try {
      try {
        // Tenta autenticar com Supabase
        const { error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: 'senha123',
        });

        // Se autenticou com sucesso, redireciona
        if (!error && mounted) {
          // Armazenar o tema escolhido
          global.dashboardTheme = isMasculineTheme ? 'masculine' : 'feminine';
          router.replace('/(app)/dashboard');
          return;
        }
      } catch (supabaseError) {
        console.log('Erro Supabase:', supabaseError);
        // Erro silencioso - continua para o modo de contingência
      }

      // Modo de contingência - usuário de demonstração quando Supabase falha
      if (mounted) {
        console.log('Usando modo de demonstração');
        // Armazenar o tema escolhido
        global.dashboardTheme = isMasculineTheme ? 'masculine' : 'feminine';
        // Ainda assim, navega para o dashboard
        router.replace('/(app)/dashboard');
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.cardContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Olá Novamente!</Text>
            <Text style={styles.subtitle}>Bem-vindo de volta, sentimos sua falta!</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Email (teste@finlove.com ou homem@finlove.com)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
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
            
            <TouchableOpacity 
              style={styles.forgotPasswordLink}
              onPress={() => router.push('/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Recuperar Senha</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={signInWithTestAccount}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Ou continue com</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity 
                style={styles.googleButton}
                onPress={() => signInWithProvider('google')}
              >
                <Image 
                  source={require('@/assets/google-icon.png')} 
                  style={styles.socialIcon}
                  resizeMode="contain"
                />
                <Text style={styles.googleButtonText}>Continuar com Google</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.registerLinkContainer}>
              <Text style={styles.registerLinkText}>Não tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.registerLinkHighlight}>Cadastre-se agora</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
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
    backgroundColor: '#ffffff',
    borderRadius: 30,
    padding: 24,
    elevation: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      }
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
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#0073ea',
    fontFamily: fontFallbacks.Poppins_500Medium,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#b687fe',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  testAccountButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#b687fe',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  testAccountButtonText: {
    color: '#b687fe',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    color: '#666666',
    fontFamily: fontFallbacks.Poppins_400Regular,
    fontSize: 14,
    marginHorizontal: 10,
  },
  socialButtonsContainer: {
    marginBottom: 24,
    width: '100%',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    width: '100%',
  },
  googleButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333333',
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#666666',
    fontFamily: fontFallbacks.Poppins_400Regular,
    fontSize: 14,
  },
  registerLinkHighlight: {
    color: '#0073ea',
    fontFamily: fontFallbacks.Poppins_500Medium,
    fontSize: 14,
  },
}); 