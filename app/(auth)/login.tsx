import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView, Platform, Animated } from 'react-native';
import FinloveLogo from '@/components/FinloveLogo';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { fontFallbacks } from '@/utils/styles';
import { LinearGradient } from 'expo-linear-gradient';

// Animatable gradient container
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const formAnimation = useRef(new Animated.Value(0)).current;
  const cardAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    // animação sutil ao montar o card
    Animated.spring(cardAnimation, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }).start();
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
    <LinearGradient
      colors={['#ffffff', 'rgba(182,135,254,0.2)']}
      start={{ x: 0.5, y: 0.5 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.cardContainer}>
          <AnimatedGradient
            colors={['#ffffff', 'rgba(182,135,254,0.2)']}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.cardContent, { opacity: cardAnimation, transform: [{ scale: cardAnimation.interpolate({ inputRange: [0,1], outputRange: [0.98, 1] }) }] }]}
          >
            <View style={styles.imageContainer}>
              <Image
                source={require('@/assets/imagem-casal-3-edson.png')}
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
                  showLoginForm && styles.signInButtonActive,
                  { overflow: 'hidden' }
                ]}
                onPress={handleEnterPress}
                disabled={loading}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.95)','rgba(182,135,254,0.04)']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[StyleSheet.absoluteFillObject, styles.buttonGradient]}
                />
                <Text style={[
                  styles.signInButtonText,
                  !showLoginForm && styles.signInButtonTextInactive
                ]}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  { overflow: 'hidden', backgroundColor: 'transparent' }
                ]}
                onPress={() => router.push('/register')}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.95)','rgba(182,135,254,0.04)']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[StyleSheet.absoluteFillObject, styles.buttonGradient]}
                />
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
          </AnimatedGradient>
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
    padding: 0,
  },
  cardContainer: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 0,
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
    height: '100%',
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: '100%',
    height: '55%',
    backgroundColor: '#b687fe',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  image: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    resizeMode: "cover"
  },
  textContainer: {
    width: '100%',
    padding: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    color: '#131313',
    marginBottom: 12,
    lineHeight: 40,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#666666',
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 32,
    justifyContent: 'space-between',
  },
  registerButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#b687fe',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' },
    }),
  },
  registerButtonText: {
    color: '#b687fe',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  signInButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#0073ea',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' },
    }),
  },
  signInButtonActive: {
    backgroundColor: '#0073ea',
    borderWidth: 0,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_600SemiBold,
  },
  signInButtonTextInactive: {
    color: '#0073ea',
  },
  buttonGradient: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 3px rgba(0,0,0,0.08)' },
    }),
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
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginRight: 0,
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#b687fe',
    fontSize: 15,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
});