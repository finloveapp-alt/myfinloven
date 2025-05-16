Implementação Refinada de Sistema de Casais no MyFinlove com Supabase
Entendi que mesmo o usuário convidado deve passar pelo processo completo de registro (incluindo confirmação de email), mantendo a associação com o parceiro que o convidou. Vamos refinar a abordagem.

Estrutura de Dados Necessária


-- Tabela de perfis
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  gender TEXT,
  account_type TEXT CHECK (account_type IN ('individual', 'couple')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de casais
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES auth.users(id),
  user2_id UUID REFERENCES auth.users(id),
  invitation_token TEXT,
  invitation_email TEXT,
  status TEXT CHECK (status IN ('pending', 'active', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de transações (com marcação para compartilhamento seletivo)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  couple_id UUID REFERENCES couples(id),
  transaction_type TEXT,
  category TEXT,
  amount DECIMAL,
  description TEXT,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


Fluxo Refinado de Registro e Convite

1. Modificação do Registro Inicial

// Em register.tsx
const [accountType, setAccountType] = useState('individual'); // 'individual' ou 'couple'
const [partnerEmail, setPartnerEmail] = useState('');

// Interface para seleção do tipo de conta
<View style={styles.optionContainer}>
  <Text style={styles.label}>Tipo de Conta:</Text>
  <TouchableOpacity 
    style={[styles.option, accountType === 'individual' && styles.optionSelected]}
    onPress={() => setAccountType('individual')}
  >
    <Text>Individual</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={[styles.option, accountType === 'couple' && styles.optionSelected]}
    onPress={() => setAccountType('couple')}
  >
    <Text>Casal</Text>
  </TouchableOpacity>
</View>

{accountType === 'couple' && (
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

2. Processo de Registro com Geração de Convite

async function signUpWithEmail() {
  // Validações existentes...
  
  if (accountType === 'couple' && !partnerEmail.trim()) {
    Alert.alert('Erro', 'Por favor, informe o email do seu parceiro(a)');
    return;
  }
  
  setLoading(true);
  try {
    // Registro normal do usuário no Supabase
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          full_name: name,
          display_name: name.split(' ')[0],
          gender: gender,
          account_type: accountType,
          created_at: new Date().toISOString(),
        },
        emailRedirectTo: window.location?.origin || 'myfinlove://'
      }
    });

    if (error) {
      console.error("Erro no cadastro:", error.message);
      Alert.alert('Erro', `Falha ao criar conta: ${error.message}`);
      return;
    }

    // Criar perfil do usuário
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: name,
          gender: gender,
          account_type: accountType
        });

      // Se for casal, criar o registro de casal e gerar convite
      if (accountType === 'couple' && partnerEmail) {
        // Gerar token único para o convite
        const invitationToken = crypto.randomUUID();
        
        // Registrar o casal no banco com status pendente
        const { data: coupleData, error: coupleError } = await supabase
          .from('couples')
          .insert({
            user1_id: data.user.id,
            invitation_token: invitationToken,
            invitation_email: partnerEmail,
            status: 'pending'
          })
          .select();

        if (!coupleError && coupleData) {
          // Enviar email de convite personalizado
          const { error: emailError } = await supabase.functions.invoke('send-couple-invitation', {
            body: {
              partnerEmail: partnerEmail,
              inviterName: name,
              inviterId: data.user.id,
              invitationToken: invitationToken,
              coupleId: coupleData[0].id
            }
          });

          if (emailError) {
            console.error("Erro ao enviar convite:", emailError);
          }
        }
      }

      // Mostrar modal de confirmação apropriado
      if (accountType === 'couple') {
        setCoupleInviteSentModalVisible(true);
      } else {
        setSuccessModalVisible(true);
      }
    }
  } catch (error) {
    console.error("Exceção no cadastro:", error);
    Alert.alert('Erro', 'Ocorreu um erro ao criar a conta.');
  } finally {
    if (mounted) {
      setLoading(false);
    }
  }
}

3. Edge Function para Envio de Convite Personalizado

// supabase/functions/send-couple-invitation/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { partnerEmail, inviterName, inviterId, invitationToken, coupleId } = await req.json()
    
    // URL do aplicativo (configure nas variáveis de ambiente)
    const appUrl = Deno.env.get('APP_URL') || 'https://myfinlove.com'
    
    // Método 1: URL com query params padrão (mais compatível com Expo Router)
    // Esta é a maneira preferida se possível
    const inviteUrl = `${appUrl}/convite-casal?token=${encodeURIComponent(invitationToken)}&inviter=${encodeURIComponent(inviterId)}&couple=${encodeURIComponent(coupleId)}&inviter_name=${encodeURIComponent(inviterName)}`
    
    // Método 2: Usar Supabase Auth para enviar e-mail com magic link
    // Este método adiciona automaticamente os dados como JWT após o hash #
    // Requer que o cliente saiba lidar com o formato de hash do Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      { auth: { persistSession: false } }
    )
    
    // Criar um magic link de convite com metadados
    // Isso vai usar o URL padrão do Supabase que tem formato de hash (#access_token=...)
    const { error } = await supabaseClient.auth.admin.generateLink({
      type: 'invite',
      email: partnerEmail,
      options: {
        // Passar os dados do convite como metadados
        data: {
          inviter_id: inviterId,
          couple_id: coupleId,
          inviter_name: inviterName,
          invitation_token: invitationToken
        },
        // Configurar para redirecionar para a página de convite-casal
        redirectTo: `${appUrl}/convite-casal`
      }
    })
    
    if (error) {
      console.error('Erro ao gerar link de convite:', error)
      throw new Error('Falha ao gerar link de convite')
    }
    
    // ALTERNATIVA: Enviar email diretamente através de outro serviço
    // Exemplo com EmailJS
    /*
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: Deno.env.get('EMAILJS_SERVICE_ID'),
        template_id: Deno.env.get('EMAILJS_TEMPLATE_ID'),
        user_id: Deno.env.get('EMAILJS_USER_ID'),
        template_params: {
          to_email: partnerEmail,
          inviter_name: inviterName,
          invite_url: inviteUrl, // Usar a URL com query params
          app_name: 'MyFinlove'
        }
      })
    })
    
    if (!response.ok) {
      throw new Error('Falha ao enviar email de convite')
    }
    */

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

4. Página de Convite de Casal

// app/convite-casal.tsx
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

export default function ConviteCasal() {
  const { token, inviter, couple } = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [inviterDetails, setInviterDetails] = useState(null);

  useEffect(() => {
    // Verificar validade do convite
    async function checkInvitation() {
      if (!token || !inviter || !couple) {
        Alert.alert('Erro', 'Convite inválido ou expirado');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('couples')
          .select(`
            id,
            user1:user1_id(
              id,
              email:auth.users!inner(email),
              profile:profiles!inner(full_name, gender)
            )
          `)
          .eq('id', couple)
          .eq('user1_id', inviter)
          .eq('invitation_token', token)
          .eq('status', 'pending')
          .single();

        if (error || !data) {
          Alert.alert('Erro', 'Convite inválido ou expirado');
          return;
        }

        setInviterDetails({
          name: data.user1.profile.full_name,
          gender: data.user1.profile.gender,
          email: data.user1.email.email
        });
      } catch (err) {
        console.error("Erro ao verificar convite:", err);
        Alert.alert('Erro', 'Não foi possível verificar o convite');
      }
    }

    checkInvitation();
  }, [token, inviter, couple]);

  // Aceitar convite e ir para registro
  function acceptInvitation() {
    router.push({
      pathname: '/(auth)/register',
      params: {
        fromCoupleInvitation: 'true',
        invitationToken: token,
        inviterId: inviter,
        coupleId: couple
      }
    });
  }

  return (
    <LinearGradient
      colors={['#ffffff','rgba(182,135,254,0.2)']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Convite de Casal</Text>
          
          {inviterDetails ? (
            <>
              <Text style={styles.message}>
                {inviterDetails.name} convidou você para gerenciar finanças juntos no MyFinlove!
              </Text>
              
              <Text style={styles.subMessage}>
                Ao aceitar este convite, você poderá compartilhar informações financeiras selecionadas com seu parceiro(a).
              </Text>
              
              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={acceptInvitation}
              >
                <Text style={styles.buttonText}>Aceitar e Criar Conta</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.rejectButton}
                onPress={() => router.replace('/')}
              >
                <Text style={styles.rejectButtonText}>Recusar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.loadingText}>Verificando convite...</Text>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

5. Modificação do Registro para Suporte a Convites

// Em register.tsx, modificar para suportar convites de casal
// Adicionar aos parâmetros de rota
const params = useSearchParams();
const fromCoupleInvitation = params?.fromCoupleInvitation === 'true';
const invitationToken = params?.invitationToken;
const inviterId = params?.inviterId;
const coupleId = params?.coupleId;

// No início do componente, pré-preencher tipo de conta se for convite
useEffect(() => {
  if (fromCoupleInvitation) {
    setAccountType('couple');
  }
}, [fromCoupleInvitation]);

// Modificar função de signUp para incluir lógica de convite
async function signUpWithEmail() {
  // Validações existentes...
  
  setLoading(true);
  try {
    // Registro no Supabase (fluxo normal com confirmação de email)
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          full_name: name,
          display_name: name.split(' ')[0],
          gender: gender,
          account_type: 'couple', // Fixo como 'couple' para convidados
          created_at: new Date().toISOString(),
          ...(fromCoupleInvitation && { couple_invitation: true, couple_id: coupleId })
        },
        emailRedirectTo: window.location?.origin || 'myfinlove://'
      }
    });

    if (error) {
      console.error("Erro no cadastro:", error.message);
      Alert.alert('Erro', `Falha ao criar conta: ${error.message}`);
      return;
    }

    // Processar registro normal
    if (data?.user) {
      // Criar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: name,
          gender: gender,
          account_type: 'couple'
        });

      // Se for de um convite, atualizar a tabela de casais
      if (fromCoupleInvitation && coupleId) {
        // Atualizar a tabela de casais com o ID do usuário convidado
        const { error: coupleError } = await supabase
          .from('couples')
          .update({ 
            user2_id: data.user.id
            // Mantém status como 'pending' até que o email seja confirmado
          })
          .eq('id', coupleId)
          .eq('invitation_token', invitationToken);
          
        if (coupleError) {
          console.error("Erro ao atualizar registro de casal:", coupleError);
        }
      }

      // Modal de sucesso modificado para incluir mensagem sobre verificação
      setEmailVerificationNeededModalVisible(true);
    }
  } catch (error) {
    console.error("Exceção no cadastro:", error);
    Alert.alert('Erro', 'Ocorreu um erro ao criar a conta.');
  } finally {
    if (mounted) {
      setLoading(false);
    }
  }
}

6. Completando a Associação após Verificação do Email

Este processo deve acontecer no login, após o usuário confirmar o email:

// Em login-form.tsx, após login bem-sucedido
async function signInWithEmail() {
  // Código de login existente...
  
  // Se autenticou com sucesso, verifica se tem associação de casal pendente
  if (data && data.user) {
    // Verificar se é parte de um casal com verificação pendente
    const { data: coupleData } = await supabase
      .from('couples')
      .select('*')
      .or(`user1_id.eq.${data.user.id},user2_id.eq.${data.user.id}`)
      .eq('status', 'pending')
      .maybeSingle();
      
    if (coupleData) {
      // Se for o segundo usuário (convidado) e o email já foi verificado
      if (coupleData.user2_id === data.user.id && data.user.email_confirmed_at) {
        // Ativar o casal
        await supabase
          .from('couples')
          .update({ status: 'active' })
          .eq('id', coupleData.id);
          
        // Mostrar mensagem de boas-vindas personalizada
        Alert.alert(
          'Parabéns!',
          'Sua conta de casal foi ativada. Agora vocês podem compartilhar informações financeiras!',
          [{ text: 'OK', onPress: () => router.replace('/(app)/dashboard') }]
        );
        return;
      }
    }
    
    // Fluxo normal de redirecionamento
    router.replace('/(app)/dashboard');
  }
}

Compartilhamento Seletivo de Informações Financeiras
Para garantir que apenas algumas informações sejam compartilhadas, podemos implementar:

1. Interface de Criação/Edição de Transações com Opção de Compartilhame

// Em formulários de despesas/receitas
<View style={styles.shareSection}>
  <Text style={styles.sectionTitle}>Compartilhamento</Text>
  
  <TouchableOpacity 
    style={[styles.option, isShared && styles.optionSelected]}
    onPress={() => setIsShared(!isShared)}
  >
    <Text>Compartilhar com meu parceiro(a)</Text>
  </TouchableOpacity>
  
  {isShared && (
    <Text style={styles.helperText}>
      Esta informação financeira será visível para seu parceiro(a).
    </Text>
  )}
</View>

2. Regras de Segurança no Supabase (RLS)

-- Política para transações pessoais (proprietário)
CREATE POLICY "Usuários podem ver suas próprias transações" ON transactions
  FOR SELECT
  USING (user_id = auth.uid());

-- Política para transações compartilhadas (casal)
CREATE POLICY "Usuários podem ver transações compartilhadas do casal" ON transactions
  FOR SELECT
  USING (
    is_shared = true AND 
    couple_id IN (
      SELECT id FROM couples WHERE 
        (user1_id = auth.uid() OR user2_id = auth.uid()) AND
        status = 'active'
    )
  );
  
  
  3. Função para Buscar Transações (Pessoais + Compartilhadas)
  
  async function fetchTransactions(type = 'all') {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return [];
  
  // Buscar ID do casal do usuário atual
  const { data: coupleData } = await supabase
    .from('couples')
    .select('id')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq('status', 'active')
    .single();

  // Construir consulta base
  let query = supabase
    .from('transactions')
    .select('*');
  
  // Filtrar por tipo se necessário
  if (type !== 'all') {
    query = query.eq('transaction_type', type);
  }
  
  // Transações pessoais + compartilhadas com o casal (se houver)
  if (coupleData?.id) {
    query = query.or(`user_id.eq.${userId},and(is_shared.eq.true,couple_id.eq.${coupleData.id})`);
  } else {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) {
    console.error("Erro ao buscar transações:", error);
    return [];
  }
  
  return data || [];
}

4. Interface para Distinguir Transações Pessoais vs. Compartilhadas

// Em componentes de listagem de transações
{transactions.map(transaction => (
  <View key={transaction.id} style={styles.transactionItem}>
    <View style={styles.transactionHeader}>
      <Text style={styles.transactionTitle}>{transaction.description}</Text>
      
      {/* Indicador de compartilhamento */}
      {transaction.is_shared && (
        <View style={styles.sharedBadge}>
          <Text style={styles.sharedBadgeText}>Compartilhado</Text>
        </View>
      )}
      
      {/* Indicador de proprietário (se não for o usuário atual) */}
      {transaction.user_id !== userId && (
        <Text style={styles.partnerIndicator}>
          Adicionado por: {partnerName}
        </Text>
      )}
    </View>
    
    <Text style={styles.transactionAmount}>
      R$ {parseFloat(transaction.amount).toFixed(2)}
    </Text>
  </View>
))}

Resumo das Modificações
O usuário pode escolher criar uma conta individual ou de casal no registro
No caso de casal, o usuário pode convidar o parceiro informando o email
O parceiro recebe um email de convite com link personalizado
Ao acessar o link, o parceiro vê informações sobre quem convidou e decide aceitar
Aceitando, ele é direcionado para a página de registro normal
Após registrar, o parceiro recebe email de confirmação padrão do Supabase
Quando confirma o email e faz login, a associação de casal é ativada
Cada usuário controla quais informações financeiras deseja compartilhar
Transações marcadas como compartilhadas ficam visíveis para ambos
A interface indica claramente quais itens são compartilhados e quem os criou
Essa abordagem preserva o fluxo de verificação de email enquanto mantém a associação entre os usuários do casal, permitindo compartilhamento seletivo de informações financeiras.
