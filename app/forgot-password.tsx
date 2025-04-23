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

  async function handleResetPassword() {
    if (!email) {
      Alert.alert('Erro', 'Por favor, informe seu email');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'myfinlove://reset-password',
      });

      if (error) {
        Alert.alert('Erro', error.message);
        return;
      }

      setResetSent(true);
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
        <TouchableOpacity style={styles.topBackButton} onPress={() => router.replace('/login')}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        {/* cardContainer wrapper removed */}
        <View style={styles.cardContent}>
          <View style={styles.imageContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>Recuperar Senha</Text>
            <Text style={styles.subtitle}>
              {resetSent 
                ? 'Enviamos um email com instruções para redefinir sua senha. Verifique sua caixa de entrada.' 
                : 'Digite seu email e enviaremos instruções para redefinir sua senha'}
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
                onPress={() => router.replace('/login')}
              >
                <Text style={styles.returnButtonText}>Voltar para o login</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {/* end cardContainer wrapper removed */}
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
  cardContainer: {
    width: '100%',
    maxWidth: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 0,
    overflow: 'hidden',
    elevation: 5,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      web: { boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' },
    }),
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
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: -72,
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
    marginTop: 60,
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
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
