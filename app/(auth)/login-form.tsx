import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { fontFallbacks } from '@/utils/styles';
import { Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { updateAuthUserData } from '@/app/supabase/couples-invite-helper';

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
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu email');
      return;
    }
    
    if (!password.trim()) {
      Alert.alert('Erro', 'Por favor, informe sua senha');
      return;
    }
    
    setLoading(true);
    try {
      // Log detalhado para depuração
      console.log(`### TENTANDO LOGIN PARA: ${email.trim()} (${password.length} caracteres)`);
      
      // Verificar se é um email de convite antes de tentar login
      console.log("Verificando se é um usuário convidado...");
      const { data: coupleData, error: coupleError } = await supabase
        .from('couples')
        .select('*')
        .eq('invitation_email', email.trim().toLowerCase())
        .maybeSingle();
        
      if (coupleError) {
        console.error("### ERRO AO VERIFICAR SE É CONVIDADO:", coupleError);
      } else if (coupleData) {
        console.log("### ENCONTRADO CONVITE PARA:", email);
        console.log("### DADOS DO CONVITE:", coupleData);
        console.log("### STATUS DO CONVITE:", coupleData.status);
      }
      
      // Tenta autenticar com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      // Se houver erro, verifica o tipo
      if (error) {
        console.error('### ERRO DE LOGIN:', error.message);
        
        if (error.message.includes('Email not confirmed')) {
          Alert.alert(
            'Email não confirmado',
            'Você precisa confirmar seu email antes de fazer login. Por favor, verifique sua caixa de entrada e clique no link de confirmação que enviamos.',
            [
              { 
                text: 'Reenviar email', 
                onPress: async () => {
                  try {
                    const { error: resendError } = await supabase.auth.resend({
                      type: 'signup',
                      email: email.trim(),
                    });
                    
                    if (resendError) {
                      Alert.alert('Erro', 'Não foi possível reenviar o email de confirmação. Tente novamente mais tarde.');
                    } else {
                      Alert.alert('Sucesso', 'Email de confirmação reenviado! Verifique sua caixa de entrada.');
                    }
                  } catch (e) {
                    Alert.alert('Erro', 'Ocorreu um erro ao tentar reenviar o email. Tente novamente mais tarde.');
                  }
                }
              },
              { text: 'OK', style: 'default' }
            ]
          );
        } else if (error.message.includes('Invalid login credentials')) {
          // Se o usuário possivelmente é um convidado que não completou o registro
          if (coupleData) {
            console.log("### USUÁRIO É UM CONVIDADO");
            
            if (coupleData.status === 'active') {
              console.log("### CONVITE JÁ ESTÁ ATIVO, MAS CREDENCIAIS INVÁLIDAS");
              Alert.alert(
                'Credenciais inválidas',
                'Este email já está associado a uma conta, mas a senha não está correta. ' +
                'Você pode tentar recuperar sua senha ou, se nunca completou o registro, aceitar o convite novamente.',
                [
                  { 
                    text: 'Recuperar senha', 
                    onPress: () => router.push('/forgot-password')
                  },
                  { 
                    text: 'OK', 
                    style: 'cancel' 
                  }
                ]
              );
            } else if (coupleData.status === 'pending') {
              console.log("### USUÁRIO É UM CONVIDADO COM REGISTRO INCOMPLETO");
              Alert.alert(
                'Convite pendente',
                'Parece que você recebeu um convite, mas ainda não completou o registro. Deseja criar uma conta agora?',
                [
                  { 
                    text: 'Sim', 
                    onPress: () => {
                      // Redirecionar para página de registro com os dados do convite
                      router.push({
                        pathname: '/(auth)/register',
                        params: {
                          fromCoupleInvitation: 'true',
                          invitationToken: coupleData.invitation_token,
                          inviterId: coupleData.user1_id,
                          coupleId: coupleData.id,
                          invitationEmail: email.trim(),
                          manualEntry: 'true'
                        }
                      });
                    }
                  },
                  { text: 'Não', style: 'cancel' }
                ]
              );
            } else {
              // Se o status não for reconhecido
              console.log(`### STATUS DE CONVITE NÃO RECONHECIDO: ${coupleData.status}`);
              Alert.alert('Erro', 'Email ou senha incorretos. Por favor, verifique suas credenciais.');
            }
          } else {
            Alert.alert('Erro', 'Email ou senha incorretos. Por favor, verifique suas credenciais.');
          }
        } else {
          Alert.alert('Erro de login', error.message);
        }
        return;
      }

      // Se autenticou com sucesso, procede normalmente
      if (data && data.user) {
        console.log('### LOGIN BEM SUCEDIDO:', data.user.email);
        console.log('### METADADOS DO USUÁRIO:', data.user.user_metadata);
        
        // Processar perfil temporário se existir
        try {
          console.log("Tentando processar dados de perfil temporário");
          
          // Chamar a função SQL para processar o perfil temporário pelo email
          const { data: tempProfileResult, error: tempProfileError } = await supabase
            .rpc('process_profile_temp_by_email', {
              p_email: email.trim().toLowerCase()
            });
            
          if (tempProfileError) {
            console.error("Erro ao processar perfil temporário:", tempProfileError);
          } else if (tempProfileResult) {
            console.log("Resultado do processamento de perfil:", tempProfileResult);
            
            // Se o resultado indica que um casal foi ativado
            if (tempProfileResult.success && tempProfileResult.couple_activated) {
              console.log("Casal ativado com sucesso durante login");
              
              // Mostrar mensagem de sucesso para casal
              Alert.alert(
                'Parabéns!',
                'Sua conta de casal foi ativada. Agora vocês podem compartilhar informações financeiras!',
                [{ 
                  text: 'OK', 
                  onPress: () => {
                    // Navegar para o dashboard após fechar o alerta
                    setTimeout(() => {
                      router.replace('/(app)/dashboard');
                    }, 100);
                  }
                }]
              );
              return;
            }
          }
        } catch (processingError) {
          console.error("Exceção ao processar perfil temporário:", processingError);
        }
        
        // Verificar se existe nome nos metadados e se é um usuário convidado
        const userName = data.user.user_metadata?.display_name || 
                        data.user.user_metadata?.name || 
                        data.user.user_metadata?.full_name;
                      
        const isCoupleInvitation = data.user.user_metadata?.couple_invitation === true;
        
        if (isCoupleInvitation) {
          console.log('### USUÁRIO É UM CONVIDADO DE CASAL');
          
          // Verificar se o perfil existe mas os metadados não estão completos
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();
              
            if (profileError) {
              console.error('Erro ao buscar perfil:', profileError);
            } else if (profileData && profileData.name && (!userName || userName !== profileData.name)) {
              console.log('Atualizando metadados do usuário com nome do perfil:', profileData.name);
              
              // Atualizar os metadados do usuário com o nome do perfil
              const { success: updateSuccess, metadataSuccess } = await updateAuthUserData(data.user.id, {
                name: profileData.name,
                email: data.user.email,
                gender: profileData.gender,
                accountType: profileData.account_type
              });
              
              console.log('Resultado da atualização de metadados:', { updateSuccess, metadataSuccess });
            }
          } catch (profileError) {
            console.error('Exceção ao processar perfil para metadados:', profileError);
          }
        }
        
        // Verificar se existem associações pendentes
        try {
          console.log("Verificando perfis e associações pendentes para o usuário:", data.user.id);
          
          // Processando atualizações pendentes de metadados
          try {
            const { data: pendingMetadataResult, error: pendingMetadataError } = await supabase
              .rpc('process_pending_metadata_updates', {
                p_user_id: data.user.id
              });
              
            if (pendingMetadataError) {
              console.log("Erro ao processar metadados pendentes:", pendingMetadataError);
            } else if (pendingMetadataResult?.success) {
              console.log("Metadados pendentes processados com sucesso:", pendingMetadataResult);
            }
          } catch (metadataError) {
            console.error("Exceção ao processar metadados pendentes:", metadataError);
          }
          
          // Verificar logs de função para depuração
          try {
            const { data: functionLogs, error: logsError } = await supabase
              .from('function_logs_view')
              .select('*')
              .limit(5);
              
            if (logsError) {
              console.log("Erro ao buscar logs:", logsError);
            } else if (functionLogs?.length > 0) {
              console.log("Logs recentes de funções:", functionLogs);
            }
          } catch (logsError) {
            console.error("Exceção ao buscar logs:", logsError);
          }
          
          // NOVO: Processar perfil pendente primeiro
          const { data: processProfileResult, error: processProfileError } = await supabase
            .rpc('process_pending_profile', {
              p_user_id: data.user.id
            });
            
          if (processProfileError) {
            console.error("Erro ao processar perfil pendente:", processProfileError);
          } else if (processProfileResult && processProfileResult.success) {
            console.log("Perfil processado com sucesso:", processProfileResult);
          }
          
          // Recuperar dados locais se disponíveis
          try {
            const localUserData = localStorage.getItem(`user_metadata_${email.trim().toLowerCase()}`);
            if (localUserData) {
              const parsedData = JSON.parse(localUserData);
              console.log("Dados locais encontrados:", parsedData);
              
              // Tentar atualizar metadados do usuário com os dados salvos localmente
              try {
                const { error: updateError } = await supabase.auth.updateUser({
                  data: {
                    display_name: parsedData.name,
                    name: parsedData.name,
                    full_name: parsedData.name,
                    gender: parsedData.gender,
                    account_type: parsedData.accountType,
                    name_saved: true
                  }
                });
                
                if (updateError) {
                  console.error("Erro ao atualizar metadados do usuário:", updateError);
                  
                  // Se falhou com a sessão, tenta método direto SQL
                  const { data: metadataResult, error: metadataError } = await supabase.rpc('update_user_metadata', {
                    p_user_id: data.user.id,
                    p_metadata: {
                      display_name: parsedData.name,
                      name: parsedData.name,
                      full_name: parsedData.name,
                      gender: parsedData.gender,
                      account_type: parsedData.accountType,
                      name_saved: true
                    }
                  });
                  
                  if (metadataError) {
                    console.error("Erro ao atualizar metadados via SQL:", metadataError);
                  } else {
                    console.log("Metadados atualizados com sucesso via SQL usando dados locais");
                    localStorage.removeItem(`user_metadata_${email.trim().toLowerCase()}`);
                  }
                } else {
                  console.log("Metadados do usuário atualizados com sucesso usando dados locais");
                  // Remover dados locais após uso bem-sucedido
                  localStorage.removeItem(`user_metadata_${email.trim().toLowerCase()}`);
                }
              } catch (updateError) {
                console.error("Exceção ao atualizar metadados:", updateError);
              }
            }
          } catch (localStorageError) {
            console.log("Erro ao acessar localStorage:", localStorageError);
          }
          
          // Verificar se existem associações pendentes
          const { data: pendingData, error: pendingError } = await supabase
            .from('pending_couple_associations')
            .select('*')
            .eq('user_id', data.user.id)
            .eq('processed', false)
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (pendingError) {
            console.error("Erro ao verificar associações pendentes:", pendingError);
          } else if (pendingData && pendingData.length > 0) {
            console.log("Associação pendente encontrada:", pendingData[0]);
            
            // Processar associação pendente
            const { data: processResult, error: processError } = await supabase
              .rpc('process_pending_couple_association', {
                p_user_id: data.user.id
              });
              
            if (processError) {
              console.error("Erro ao processar associação:", processError);
            } else if (processResult.success) {
              console.log("Associação processada com sucesso:", processResult);
              
              // Mostrar mensagem de sucesso
              Alert.alert(
                'Parabéns!',
                'Sua conta de casal foi ativada. Agora vocês podem compartilhar informações financeiras!',
                [{ 
                  text: 'OK', 
                  onPress: () => {
                    // Navegar para o dashboard após fechar o alerta
                    setTimeout(() => {
                      router.replace('/(app)/dashboard');
                    }, 100);
                  }
                }]
              );
              return;
            }
          } else {
            console.log("Nenhuma associação pendente encontrada para este usuário");
          }
        } catch (pendingError) {
          console.error("Exceção ao processar pendências:", pendingError);
        }
        
        // Verificar o perfil do usuário
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error('Erro ao buscar perfil:', profileError);
          } else if (profileData) {
            console.log('Perfil encontrado:', profileData);
            
            // Se o perfil existe mas o nome está vazio ou não definido
            if (!profileData.name && userName) {
              console.log('Atualizando nome do perfil com:', userName);
              
              // Atualizar o perfil com o nome disponível nos metadados
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ name: userName })
                .eq('id', data.user.id);
                
              if (updateError) {
                console.error('Erro ao atualizar nome no perfil:', updateError);
              } else {
                console.log('Nome atualizado no perfil com sucesso');
              }
            }
            
            // Se não tem display_name nos metadados mas tem nome no perfil
            if (!userName && profileData.name) {
              console.log('Atualizando display_name nos metadados com:', profileData.name);
              
              // Atualizar os metadados com o nome disponível no perfil
              try {
                const { error: updateError } = await supabase.auth.updateUser({
                  data: {
                    display_name: profileData.name,
                    name: profileData.name,
                    full_name: profileData.name
                  }
                });
                
                if (updateError) {
                  console.error('Erro ao atualizar display_name:', updateError);
                } else {
                  console.log('display_name atualizado com sucesso');
                }
              } catch (updateError) {
                console.error('Erro ao atualizar metadados:', updateError);
              }
            }
          } else {
            console.warn('Perfil não encontrado para o usuário, tentando criar...');
            
            // Criar perfil básico a partir dos metadados do usuário
            try {
              const userData = {
                id: data.user.id,
                email: data.user.email,
                name: userName || email.split('@')[0],
                gender: data.user.user_metadata?.gender || 'não informado',
                account_type: data.user.user_metadata?.account_type || 'individual',
                created_at: new Date().toISOString()
              };
              
              const { error: createError } = await supabase
                .from('profiles')
                .upsert(userData, { onConflict: 'id' });
                
              if (createError) {
                console.error('Erro ao criar perfil:', createError);
              } else {
                console.log('Perfil criado com sucesso a partir dos metadados');
              }
            } catch (e) {
              console.error('Exceção ao criar perfil:', e);
            }
          }
        } catch (profileError) {
          console.error('Exceção ao buscar perfil:', profileError);
        }
        
        // Verificar se é parte de um casal
        try {
          console.log('Verificando associações de casal para:', data.user.id);
          
          const { data: coupleData, error: coupleError } = await supabase
            .from('couples')
            .select('*')
            .or(`user1_id.eq.${data.user.id},user2_id.eq.${data.user.id}`)
            .maybeSingle();
            
          if (coupleError) {
            console.error('Erro ao verificar associação de casal:', coupleError);
          } else if (coupleData) {
            console.log('Associação de casal encontrada:', coupleData);
            
            // Verificar se é um convite pendente
            if (coupleData.status === 'pending') {
              console.log('Atualizando status do casal para active');
              
              // Atualizar status para active
              const { error: updateError } = await supabase
                .from('couples')
                .update({ status: 'active' })
                .eq('id', coupleData.id);
                
              if (updateError) {
                console.error('Erro ao atualizar status do casal:', updateError);
              } else {
                console.log('Status do casal atualizado com sucesso');
                
                // Mostrar mensagem de sucesso
                Alert.alert(
                  'Parabéns!',
                  'Sua conta de casal está ativa. Agora vocês podem compartilhar informações financeiras!',
                  [{ 
                    text: 'OK', 
                    onPress: () => {
                      // Navegar para o dashboard após fechar o alerta
                      setTimeout(() => {
                        router.replace('/(app)/dashboard');
                      }, 100);
                    }
                  }]
                );
                return;
              }
            }
          } else {
            console.log('Não há associação de casal para este usuário');
          }
        } catch (error) {
          console.error('Exceção ao verificar associação de casal:', error);
        }
        
        // Fluxo normal de redirecionamento
        router.replace('/(app)/dashboard');
      } else {
        Alert.alert('Erro', 'Não foi possível autenticar. Tente novamente.');
      }
    } catch (error) {
      console.error('Exceção na autenticação:', error);
      Alert.alert('Erro', 'Ocorreu um erro durante o login. Verifique sua conexão com a internet.');
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
            <Text style={styles.title}>Olá Novamente!</Text>
            <Text style={styles.subtitle}>Bem-vindo de volta, sentimos sua falta!</Text>
          </View>

          <View style={styles.form}>
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
            
            <TouchableOpacity 
              style={styles.forgotPasswordLink}
              onPress={() => router.push('/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Recuperar Senha</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={signInWithEmail}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.testAccountButton}
              onPress={signInWithTestAccount}
              disabled={loading}
            >
              <Text style={styles.testAccountButtonText}>
                Usar conta de demonstração
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
        </LinearGradient>
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
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 36,
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
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
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
    flex: 1,
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 16,
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
    top: 14,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: '#0073ea',
    fontFamily: fontFallbacks.Poppins_500Medium,
    fontSize: 15,
  },
  loginButton: {
    backgroundColor: '#b687fe',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
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
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  testAccountButtonText: {
    color: '#b687fe',
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    color: '#666666',
    fontFamily: fontFallbacks.Poppins_400Regular,
    fontSize: 15,
    marginHorizontal: 10,
  },
  socialButtonsContainer: {
    marginBottom: 36,
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
    padding: 16,
    width: '100%',
    height: 56,
  },
  googleButtonText: {
    marginLeft: 12,
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
    marginTop: 'auto',
    paddingTop: 24,
  },
  registerLinkText: {
    color: '#666666',
    fontFamily: fontFallbacks.Poppins_400Regular,
    fontSize: 15,
  },
  registerLinkHighlight: {
    color: '#0073ea',
    fontFamily: fontFallbacks.Poppins_600SemiBold,
    fontSize: 15,
  },
}); 