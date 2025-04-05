import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, Platform, Animated } from 'react-native';
import FinloveLogo from '@/components/FinloveLogo';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { fontFallbacks } from '@/utils/styles';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const formAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    Animated.timing(formAnimation, {
      toValue: showLoginForm ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showLoginForm]);

  const handleEnterPress = () => {
    if (!showLoginForm) {
      router.push('/(auth)/login-form');
    } else {
      signInWithEmail();
    }
  };

  async function signInWithEmail() {
    if (!showLoginForm) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error && mounted) {
        alert(error.message);
        return;
      }

      if (mounted) {
        router.replace('/(app)');
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }

  const inputsHeight = formAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 150]
  });

  const inputsOpacity = formAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1]
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.cardContainer}>
          <View style={styles.cardContent}>
            <View style={styles.imageContainer}>
              <Image
                source={require('@/assets/login-main-image.png')}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
            
            <View style={styles.textContainer}>
              <Text style={styles.title}>Descubra seu{'\n'}Futuro Financeiro</Text>
              <Text style={styles.subtitle}>Explore todas as possibilidades para gerenciar suas finanças com quem você ama</Text>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={[
                  styles.signInButton, 
                  showLoginForm && styles.signInButtonActive
                ]}
                onPress={handleEnterPress}
                disabled={loading}
              >
                <Text style={[
                  styles.signInButtonText,
                  !showLoginForm && styles.signInButtonTextInactive
                ]}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.registerButton}
                onPress={() => router.push('/register')}
              >
                <Text style={styles.registerButtonText}>Cadastrar</Text>
              </TouchableOpacity>
            </View>

            <Animated.View 
              style={[
                styles.loginInputsContainer,
                {
                  maxHeight: inputsHeight,
                  opacity: inputsOpacity,
                  overflow: 'hidden'
                }
              ]}
            >
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Email"
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
                  secureTextEntry={true}
                  autoCapitalize="none"
                  style={styles.input}
                  placeholderTextColor="#66666680"
                />
              </View>
              
              <TouchableOpacity 
                style={styles.forgotPasswordContainer}
                onPress={() => router.push('/recover-password')}
              >
                <Text style={styles.forgotPasswordText}>Recuperar Senha</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </View>
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
    backgroundColor: '#ffffff',
    borderRadius: 30,
    overflow: 'hidden',
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
  cardContent: {
    alignItems: 'center',
    padding: 0,
  },
  imageContainer: {
    width: '100%',
    height: 350,
    backgroundColor: '#b687fe',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    width: '100%',
    padding: 24,
    paddingTop: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
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
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 30,
    justifyContent: 'space-between',
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#b687fe',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  registerButtonText: {
    color: '#b687fe',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  signInButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#0073ea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  signInButtonActive: {
    backgroundColor: '#0073ea',
    borderWidth: 0,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  signInButtonTextInactive: {
    color: '#0073ea',
  },
  loginInputsContainer: {
    width: '100%',
    paddingHorizontal: 24,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginRight: 24,
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#b687fe',
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
});