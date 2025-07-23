import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { fontFallbacks } from '@/utils/styles';
import { Eye, EyeOff, Check, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { registerFromCoupleInvitation } from '@/app/supabase/couples-invite-helper';

export default function Register() {
  // Obter parâmetros da URL para verificar se veio de um convite de casal
  const params = useLocalSearchParams();
  const fromCoupleInvitation = params?.fromCoupleInvitation === 'true';
  const invitationToken = params?.invitationToken as string;
  const inviterId = params?.inviterId as string;
  const coupleId = params?.coupleId as string;
  const invitationEmail = params?.invitationEmail as string;
  const manualEntry = params?.manualEntry === 'true';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [accountType, setAccountType] = useState(fromCoupleInvitation ? 'couple' : 'individual');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [coupleInviteSentModalVisible, setCoupleInviteSentModalVisible] = useState(false);
  const [emailVerificationNeededModalVisible, setEmailVerificationNeededModalVisible] = useState(false);

  // Funções para verificar regras de senha
  const checkPasswordLength = (password: string) => password.length >= 8;
  const checkUpperCase = (password: string) => /[A-Z]/.test(password);
  const checkLowerCase = (password: string) => /[a-z]/.test(password);
  const checkNumber = (password: string) => /[0-9]/.test(password);

  // Componente para mostrar regras de senha
  const PasswordRules = ({ password }: { password: string }) => {
    if (!password) return null;

    const rules = [
      { text: 'Mínimo de 8 caracteres', check: checkPasswordLength(password) },
      { text: 'Pelo menos 1 letra maiúscula (A-Z)', check: checkUpperCase(password) },
      { text: 'Pelo menos 1 letra minúscula (a-z)', check: checkLowerCase(password) },
      { text: 'Pelo menos 1 número (0-9)', check: checkNumber(password) },
    ];

    return (
      <View style={styles.passwordRulesContainer}>
        {rules.map((rule, index) => (
          <View key={index} style={styles.passwordRule}>
            {rule.check ? (
              <Check size={16} color="#22c55e" />
            ) : (
              <X size={16} color="#ef4444" />
            )}
            <Text style={[
              styles.passwordRuleText,
              { color: rule.check ? '#22c55e' : '#ef4444' }
            ]}>
              {rule.text}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  useEffect(() => {
    return () => setMounted(false);
  }, []);

  // Se veio de um convite, pre-configurar o tipo de conta como 'couple'
  useEffect(() => {
    if (fromCoupleInvitation) {
      setAccountType('couple');
      // Pré-preencher o email se veio de um convite
      if (invitationEmail) {
        console.log("Preenchendo email direto do parâmetro:", invitationEmail);
        setEmail(invitationEmail);
      } else if (manualEntry) {
        // Se for entrada manual, buscar o email do convite
        const fetchInvitationEmail = async () => {
          try {
            console.log("Buscando email do convite para:", {coupleId, inviterId});
            const { data, error } = await supabase
              .from('couples')
              .select('invitation_email')
              .eq('id', coupleId)
              .eq('user1_id', inviterId)
              .single();
              
            if (error) {
              console.error("Erro ao buscar email do convite:", error);
              return;
            }
              
            if (data?.invitation_email) {
              console.log("Email do convite recuperado via busca manual:", data.invitation_email);
              setEmail(data.invitation_email);
            } else {
              console.log("Email do convite não encontrado na busca manual");
            }
          } catch (err) {
            console.error("Exceção ao buscar email do convite:", err);
          }
        };
        
        fetchInvitationEmail();
      }
    }
  }, [fromCoupleInvitation, invitationEmail, manualEntry, coupleId, inviterId]);

  // Exibir logs para depuração do fluxo de convite
  useEffect(() => {
    if (fromCoupleInvitation) {
      console.log("Parâmetros de convite recebidos:", {
        fromCoupleInvitation,
        invitationToken,
        inviterId,
        coupleId,
        invitationEmail,
        manualEntry
      });
    }
  }, [fromCoupleInvitation, invitationToken, inviterId, coupleId, invitationEmail, manualEntry]);

  // Função para verificar se o usuário existe na tabela auth.users
  const verifyUserExists = async (userId) => {
    try {
      // Espera um tempo para garantir que o usuário seja sincronizado com o banco
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error("Erro ao verificar usuário:", error);
        return false;
      }
      
      return data !== null;
    } catch (err) {
      console.error("Exceção ao verificar usuário:", err);
      return false;
    }
  };

  async function signUpWithEmail() {
    // Adicionar logs para depuração do processo de convite
    if (fromCoupleInvitation) {
      console.log("Registro a partir de convite:", {
        token: invitationToken,
        inviterId,
        coupleId,
        email: invitationEmail || email,
        name: name // Log do nome para verificar
      });
    }
    
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu nome');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, informe seu email');
      return;
    }
    
    // Validação robusta da senha
    if (!checkPasswordLength(password)) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 8 caracteres');
      return;
    }
    
    if (!checkUpperCase(password)) {
      Alert.alert('Erro', 'A senha deve conter pelo menos 1 letra maiúscula (A-Z)');
      return;
    }
    
    if (!checkLowerCase(password)) {
      Alert.alert('Erro', 'A senha deve conter pelo menos 1 letra minúscula (a-z)');
      return;
    }
    
    if (!checkNumber(password)) {
      Alert.alert('Erro', 'A senha deve conter pelo menos 1 número (0-9)');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    
    if (!gender) {
      Alert.alert('Erro', 'Por favor, selecione seu gênero');
      return;
    }
    
    if (accountType === 'couple' && !fromCoupleInvitation && !partnerEmail.trim()) {
      Alert.alert('Erro', 'Por favor, informe o email do seu parceiro(a)');
      return;
    }
    
    setLoading(true);
    try {
      console.log("Iniciando registro direto com Supabase");
      
      // Processamento especial para registro a partir de convite de casal
      if (fromCoupleInvitation && invitationToken && inviterId && coupleId) {
        try {
          console.log("Registrando a partir de convite de casal");
          console.log("Dados para registro:", {
            email: email.toLowerCase().trim(),
            password: password.trim(),
            name: name.trim(),
            gender: gender,
            token: invitationToken,
            inviterId: inviterId,
            coupleId: coupleId
          });
          
          // Chamar a função especializada para registro a partir de convite
          const result = await registerFromCoupleInvitation({
            email: email.toLowerCase().trim(),
            password: password.trim(),
            name: name.trim(),
            gender: gender,
            token: invitationToken,
            inviterId: inviterId,
            coupleId: coupleId
          });
          
          if (!result.success) {
            console.error("Erro no registro a partir de convite:", result.error || result.message);
            Alert.alert('Erro', result.message || 'Não foi possível completar o registro. Tente novamente.');
            setLoading(false);
            return;
          }
          
          console.log("Registro a partir de convite bem-sucedido:", result);
          
          // Salvar dados localmente como backup
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(`user_metadata_${email.toLowerCase().trim()}`, JSON.stringify({
                name: name.trim(),
                gender: gender,
                accountType: 'couple'
              }));
              console.log("Dados do usuário salvos localmente como backup");
            } catch (e) {
              console.log("Não foi possível salvar dados localmente:", e);
            }
          }
          
          // Mostrar modal de confirmação de email
          setEmailVerificationNeededModalVisible(true);
          return;
        } catch (error) {
          console.error("Exceção ao registrar a partir de convite:", error);
          Alert.alert('Erro', 'Ocorreu um erro ao processar o convite. Tente novamente.');
          setLoading(false);
          return;
        }
      }
      
      // Etapa 1: Criar uma entrada na tabela profiles ANTES do registro do usuário
      // Esta abordagem é possível porque não temos restrição de chave estrangeira
      // no momento da criação do perfil - apenas será vinculado ao usuário depois
      const tempUserId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      try {
        // Criar entrada temporária na tabela profiles_temp
        const { error: tempProfileError } = await supabase
          .from('profiles_temp')
          .insert({
            temp_id: tempUserId,
            email: email.toLowerCase().trim(),
            name: name.trim(),
            gender: gender,
            account_type: fromCoupleInvitation ? 'couple' : accountType,
            created_at: new Date().toISOString(),
            processed: false,
            is_couple_invitation: fromCoupleInvitation,
            couple_id: coupleId || null,
            invitation_token: invitationToken || null
          });
          
        if (tempProfileError) {
          console.error("Erro ao criar perfil temporário:", tempProfileError);
        } else {
          console.log("Perfil temporário criado com sucesso:", {
            temp_id: tempUserId,
            email: email.toLowerCase().trim()
          });
        }
      } catch (tempProfileError) {
        console.error("Exceção ao criar perfil temporário:", tempProfileError);
      }
      
      // Etapa 2: Registrar usuário normalmente
      const userMetadata = {
        display_name: name.trim(),
        name: name.trim(),
        full_name: name.trim(),
        gender: gender,
        account_type: fromCoupleInvitation ? 'couple' : accountType,
        created_at: new Date().toISOString(),
        temp_id: tempUserId // Armazena o ID temporário para referência
      };
      
      // Adicionar dados do convite aos metadados se aplicável
      if (fromCoupleInvitation) {
        userMetadata.couple_invitation = true;
        userMetadata.couple_id = coupleId;
        userMetadata.inviter_id = inviterId;
        userMetadata.invitation_token = invitationToken;
      }
      
      console.log("Registrando usuário com metadados:", userMetadata);
      
      // Registrar no Supabase
      const { error, data } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: userMetadata,
          emailRedirectTo: window.location?.origin || 'myfinlove://'
        }
      });

      if (error) {
        console.error("Erro no cadastro:", error.message);
        Alert.alert('Erro', `Falha ao criar conta: ${error.message}`);
        return;
      }

      if (!data?.user?.id) {
        console.error("Usuário não foi criado corretamente");
        Alert.alert('Erro', 'Ocorreu um erro ao criar a conta');
        return;
      }
      
      console.log("Usuário criado com sucesso. ID:", data.user.id);
      
      // Etapa 3: Atualizar o perfil temporário com o ID real do usuário
      try {
        const { error: updateTempError } = await supabase
          .from('profiles_temp')
          .update({ user_id: data.user.id })
          .eq('temp_id', tempUserId);
          
        if (updateTempError) {
          console.error("Erro ao atualizar perfil temporário:", updateTempError);
        } else {
          console.log("Perfil temporário atualizado com ID real:", data.user.id);
          
          // Também salva na tabela oficial de perfis, tentativa direta
          try {
            const profileData = {
              id: data.user.id,
              name: name.trim(),
              email: email.toLowerCase().trim(),
              gender: gender,
              account_type: fromCoupleInvitation ? 'couple' : accountType,
              created_at: new Date().toISOString()
            };
            
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert(profileData);
              
            if (profileError) {
              console.log("Erro ao criar perfil diretamente (esperado):", profileError);
            } else {
              console.log("Perfil criado com sucesso via inserção direta");
            }
          } catch (profileError) {
            console.error("Exceção ao criar perfil direto:", profileError);
          }
        }
      } catch (updateError) {
        console.error("Exceção ao atualizar perfil temporário:", updateError);
      }
      
      // Etapa 4: Se for um convite de casal, armazena dados na tabela de associações pendentes
      if (fromCoupleInvitation && coupleId) {
        try {
          console.log("Registrando associação de casal pendente");
          
          const pendingData = {
            user_id: data.user.id,
            email: email.toLowerCase().trim(),
            name: name.trim(),
            gender: gender,
            couple_id: coupleId,
            invitation_token: invitationToken,
            temp_id: tempUserId,
            processed: false,
            created_at: new Date().toISOString()
          };
          
          const { error: pendingError } = await supabase
            .from('pending_couple_associations')
            .insert(pendingData);
            
          if (pendingError) {
            console.error("Erro ao registrar associação pendente:", pendingError);
          } else {
            console.log("Associação de casal pendente registrada com sucesso");
          }
        } catch (pendingError) {
          console.error("Exceção ao registrar associação pendente:", pendingError);
        }
        
        // Mostrar modal de convite aceito
        setEmailVerificationNeededModalVisible(true);
      }
      // Processar registro de casal iniciado pelo primeiro usuário
      else if (accountType === 'couple' && partnerEmail) {
        try {
          console.log("Configurando novo convite de casal");
          
          // Gerar token único para o convite
          const invitationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
          
          // Registrar o casal no banco com status pendente
          const { data: coupleData, error: coupleError } = await supabase
            .from('couples')
            .insert({
              user1_id: data.user.id,
              invitation_token: invitationToken,
              invitation_email: partnerEmail.toLowerCase().trim(),
              status: 'pending'
            })
            .select();

          if (coupleError) {
            console.error("Erro ao configurar casal:", coupleError.message);
          } else {
            console.log("Registro de casal criado com sucesso:", coupleData);
            
            // Chamar a Edge Function para enviar o convite por email
            try {
              const { error: emailError } = await supabase.functions.invoke('send-couple-invitation', {
                body: {
                  partnerEmail: partnerEmail.toLowerCase().trim(),
                  inviterName: name.trim(),
                  inviterId: data.user.id,
                  invitationToken: invitationToken,
                  coupleId: coupleData[0].id
                }
              });

              if (emailError) {
                console.error("Erro ao enviar convite:", emailError);
                Alert.alert(
                  'Aviso',
                  'Sua conta foi criada, mas houve um problema ao enviar o convite ao seu parceiro(a). Tente enviar o convite novamente mais tarde.'
                );
              } else {
                console.log("Convite enviado com sucesso");
              }
            } catch (emailError) {
              console.error("Exceção ao enviar email:", emailError);
            }
          }
          
          // Mostrar modal de convite enviado
          setCoupleInviteSentModalVisible(true);
        } catch (coupleError) {
          console.error("Erro ao registrar casal:", coupleError);
          setSuccessModalVisible(true);
        }
      } else {
        // Conta individual
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
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={['#ffffff','rgba(182,135,254,0.2)']}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.cardContainer}
          >
            <View style={styles.header}>
              <Text style={styles.title}>
                {fromCoupleInvitation ? 'Aceitar Convite' : 'Criar Conta'}
              </Text>
              <Text style={styles.subtitle}>
                {fromCoupleInvitation 
                  ? 'Complete seu cadastro para aceitar o convite de casal' 
                  : 'Comece sua jornada financeira a dois'}
              </Text>
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
                onChangeText={fromCoupleInvitation && !manualEntry ? undefined : setEmail}
                editable={!fromCoupleInvitation || manualEntry}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.input, fromCoupleInvitation && !manualEntry && styles.inputDisabled]}
                placeholderTextColor="#66666680"
              />
            </View>

            {fromCoupleInvitation && (
              <Text style={styles.inviteMessage}>
                {manualEntry 
                  ? 'Por favor, informe o email em que você recebeu o convite.' 
                  : 'Você está criando uma conta vinculada ao convite recebido. O email não pode ser alterado.'}
              </Text>
            )}

            <View style={styles.genderContainer}>
              <Text style={styles.genderLabel}>Você é:</Text>
              <View style={styles.genderOptions}>
                <TouchableOpacity 
                  style={[styles.genderOption, gender === 'homem' && styles.genderOptionSelected]}
                  onPress={() => setGender('homem')}
                >
                  <Text style={[styles.genderOptionText, gender === 'homem' && styles.genderOptionTextSelected]}>
                    Homem
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.genderOption, gender === 'mulher' && styles.genderOptionSelected]}
                  onPress={() => setGender('mulher')}
                >
                  <Text style={[styles.genderOptionText, gender === 'mulher' && styles.genderOptionTextSelected]}>
                    Mulher
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {!fromCoupleInvitation && (
              <View style={styles.accountTypeContainer}>
                <Text style={styles.accountTypeLabel}>Tipo de Conta:</Text>
                <View style={styles.accountTypeOptions}>
                  <TouchableOpacity 
                    style={[styles.accountTypeOption, accountType === 'individual' && styles.accountTypeOptionSelected]}
                    onPress={() => setAccountType('individual')}
                  >
                    <Text style={[styles.accountTypeText, accountType === 'individual' && styles.accountTypeTextSelected]}>
                      Individual
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.accountTypeOption, accountType === 'couple' && styles.accountTypeOptionSelected]}
                    onPress={() => setAccountType('couple')}
                  >
                    <Text style={[styles.accountTypeText, accountType === 'couple' && styles.accountTypeTextSelected]}>
                      Casal
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!fromCoupleInvitation && accountType === 'couple' && (
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Email do parceiro(a)"
                  value={partnerEmail}
                  onChangeText={setPartnerEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                  placeholderTextColor="#66666680"
                />
              </View>
            )}

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

            <PasswordRules password={password} />

            <TouchableOpacity
              onPress={signUpWithEmail}
              style={styles.registerButton}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Criando conta...' : fromCoupleInvitation ? 'Aceitar e Criar Conta' : 'Criar conta'}
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
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Cadastro Realizado!</Text>
            <Text style={styles.modalMessage}>
              Seu cadastro foi realizado com sucesso! Você receberá um email de confirmação. 
              Clique no link do email para ativar sua conta e poder fazer login.
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

      <Modal
        visible={coupleInviteSentModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Convite Enviado!</Text>
            <Text style={styles.modalMessage}>
              Sua conta foi criada e enviamos um convite para o email do seu parceiro(a).
              {"\n\n"}
              Importante:
              {"\n"}• Confirme seu email clicando no link que enviamos
              {"\n"}• Seu parceiro(a) também precisará confirmar o email recebido
              {"\n"}• O vínculo será ativado quando ambos confirmarem seus emails
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setCoupleInviteSentModalVisible(false);
                router.push('/(auth)/login');
              }}
            >
              <Text style={styles.modalButtonText}>Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={emailVerificationNeededModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Convite Aceito!</Text>
            <Text style={styles.modalMessage}>
              Você aceitou o convite com sucesso. Para finalizar o processo:
              {"\n\n"}
              1. Verifique seu email e clique no link de confirmação
              {"\n"}
              2. Após confirmar, faça login com seu email e senha
              {"\n"}
              3. O vínculo com seu parceiro(a) será ativado automaticamente
            </Text>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setEmailVerificationNeededModalVisible(false);
                router.push('/(auth)/login');
              }}
            >
              <Text style={styles.modalButtonText}>Entendi</Text>
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
  },
  scrollContainer: {
    flexGrow: 1,
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
  genderContainer: {
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333333',
    marginBottom: 8,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderOption: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  genderOptionSelected: {
    backgroundColor: '#b687fe',
  },
  genderOptionText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333333',
  },
  genderOptionTextSelected: {
    color: '#ffffff',
    fontFamily: fontFallbacks.Poppins_500Medium,
  },
  accountTypeContainer: {
    marginBottom: 16,
  },
  accountTypeLabel: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_500Medium,
    color: '#333333',
    marginBottom: 8,
  },
  accountTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accountTypeOption: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  accountTypeOptionSelected: {
    backgroundColor: '#b687fe',
  },
  accountTypeText: {
    fontSize: 16,
    fontFamily: fontFallbacks.Poppins_400Regular,
    color: '#333333',
  },
  accountTypeTextSelected: {
    color: '#ffffff',
    fontFamily: fontFallbacks.Poppins_500Medium,
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 0,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
      },
    }),
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
  inviteMessage: {
    color: '#666666',
    fontFamily: fontFallbacks.Poppins_400Regular,
    fontSize: 14,
    marginBottom: 16,
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
  },
  passwordRulesContainer: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  passwordRule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  passwordRuleText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: fontFallbacks.Poppins_400Regular,
  },
});