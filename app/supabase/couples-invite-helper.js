/**
 * Módulo de assistência para o fluxo de convite de casais no MyFinlove
 * Este módulo resolve o problema de associação de casais com o Supabase Auth
 */

import { supabase } from '../../lib/supabase';

/**
 * Extrai parâmetros de convite de casal da URL ou token JWT
 * @returns {Object|null} Objeto com os parâmetros do convite ou null se não houver
 */
export async function extractInviteParameters() {
  console.log("Iniciando extração de parâmetros do convite");
  
  // Verifica se estamos em ambiente web para acessar a URL
  if (typeof window !== 'undefined') {
    console.log("Ambiente web detectado, procurando hash ou parâmetros");
    
    // Obter hash e parâmetros da URL
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    
    // 1. Tentar extrair do hash (formato Supabase magic link)
    if (hash && hash.includes('access_token=')) {
      console.log(`Hash encontrado: ${hash}`);
      
      // Extrair o token de acesso
      const accessTokenMatch = hash.match(/access_token=([^&]*)/);
      if (accessTokenMatch && accessTokenMatch[1]) {
        console.log("Hash contém access_token do Supabase");
        const accessToken = accessTokenMatch[1];
        
        try {
          // Decodificar o token JWT (sem verificação)
          console.log("Access token extraído do hash");
          const payload = parseJwt(accessToken);
          console.log("Payload do token JWT decodificado:", payload);
          
          // Verificar se contém metadados de convite de casal
          if (payload && payload.user_metadata) {
            console.log("Verificando campo de metadados:", payload.user_metadata);
            
            // Se contém token de convite nos metadados
            if (payload.user_metadata.invitation_token) {
              console.log(`Token de convite encontrado: ${payload.user_metadata.invitation_token}`);
              
              return {
                token: payload.user_metadata.invitation_token,
                inviterId: payload.user_metadata.inviter_id,
                coupleId: payload.user_metadata.couple_id,
                inviterName: payload.user_metadata.inviter_name,
                email: payload.email
              };
            }
          }
        } catch (error) {
          console.error("Erro ao decodificar token:", error);
        }
      }
    }
    
    // 2. Tentar extrair dos parâmetros da URL
    if (params.has('token') && params.has('inviter') && params.has('couple')) {
      console.log("Parâmetros de convite encontrados na URL");
      
      return {
        token: params.get('token'),
        inviterId: params.get('inviter'),
        coupleId: params.get('couple'),
        inviterName: params.get('inviter_name'),
      };
    }
  }
  
  // 3. Se não encontrou na URL, verificar na sessão atual do Supabase
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.user_metadata) {
      const metadata = session.user.user_metadata;
      
      if (metadata.invitation_token && metadata.couple_id) {
        console.log("Metadados de convite encontrados na sessão do usuário");
        
        return {
          token: metadata.invitation_token,
          inviterId: metadata.inviter_id,
          coupleId: metadata.couple_id,
          inviterName: metadata.inviter_name,
          email: session.user.email
        };
      }
    }
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
  }
  
  return null;
}

/**
 * Verifica se um convite de casal é válido
 * @param {string} token Token de convite
 * @param {string} inviterId ID do usuário convidante
 * @param {string} coupleId ID do casal 
 * @returns {Promise<Object|null>} Objeto com os detalhes do convite ou null se inválido
 */
export async function verifyInvitation(token, inviterId, coupleId) {
  if (!token || !inviterId || !coupleId) {
    console.error("Parâmetros de convite incompletos");
    return null;
  }
  
  // Fazer até 3 tentativas (para lidar com possíveis atrasos de replicação)
  for (let attempt = 1; attempt <= 3; attempt++) {
    console.log(`Verificando convite com token: ${token} (tentativa ${attempt}/3)`);
    
    try {
      // Buscar no registro de casais
      const { data: coupleData, error: coupleError } = await supabase
        .from('couples')
        .select('*')
        .eq('id', coupleId)
        .eq('user1_id', inviterId)
        .eq('invitation_token', token)
        .eq('status', 'pending')
        .single();
      
      if (coupleError) {
        console.error("Erro ao verificar convite:", coupleError);
        if (attempt < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        return null;
      }
      
      if (coupleData) {
        console.log("Dados do convite encontrados:", coupleData);
        
        // Buscar detalhes do usuário convidante
        try {
          console.log(`Buscando detalhes do convidante com ID: ${inviterId}`);
          const { data: inviterData, error: inviterError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', inviterId)
            .single();
          
          if (inviterError) {
            console.error("Erro ao buscar detalhes do convidante:", inviterError);
          } else if (inviterData) {
            console.log("Dados do convidante encontrados:", inviterData);
            return {
              ...coupleData,
              inviter: inviterData
            };
          }
        } catch (error) {
          console.error("Erro ao buscar convidante:", error);
        }
        
        return coupleData;
      }
    } catch (error) {
      console.error("Erro ao verificar convite:", error);
    }
    
    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return null;
}

/**
 * Registra dados de perfil pendente para processamento após confirmação de email
 * @param {Object} userData Dados do usuário para registro
 * @returns {Promise<Object>} Resultado da operação
 */
export async function registerPendingProfile(userData) {
  if (!userData || !userData.user_id || !userData.email || !userData.name) {
    return { success: false, message: "Dados do usuário incompletos" };
  }
  
  try {
    // Chamar a função RPC para registrar perfil pendente
    const { data, error } = await supabase.rpc('register_pending_profile', {
      p_user_id: userData.user_id,
      p_email: userData.email,
      p_name: userData.name,
      p_gender: userData.gender || null,
      p_account_type: userData.account_type || 'couple'
    });
    
    if (error) {
      console.error("Erro ao registrar perfil pendente:", error);
      
      // Inserção direta como fallback
      const { error: insertError } = await supabase
        .from('pending_profiles')
        .insert({
          user_id: userData.user_id,
          email: userData.email,
          name: userData.name,
          gender: userData.gender,
          account_type: userData.account_type || 'couple'
        });
        
      if (insertError) {
        console.error("Erro na inserção direta do perfil pendente:", insertError);
        return { success: false, error: insertError };
      }
      
      return { success: true, message: "Perfil pendente registrado (método fallback)" };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Exceção ao registrar perfil pendente:", error);
    return { success: false, error };
  }
}

/**
 * Registra associação de casal pendente para processamento após confirmação de email
 * @param {Object} inviteData Dados do convite
 * @returns {Promise<Object>} Resultado da operação
 */
export async function registerPendingCoupleAssociation(inviteData) {
  if (!inviteData || !inviteData.user_id || !inviteData.email || !inviteData.coupleId || !inviteData.token) {
    return { success: false, message: "Dados de convite incompletos" };
  }
  
  try {
    // Chamar a função RPC para registrar associação pendente
    const { data, error } = await supabase.rpc('register_pending_couple_invitation', {
      p_user_id: inviteData.user_id,
      p_email: inviteData.email,
      p_couple_id: inviteData.coupleId,
      p_invitation_token: inviteData.token
    });
    
    if (error) {
      console.error("Erro ao registrar associação pendente:", error);
      
      // Inserção direta como fallback
      const { error: insertError } = await supabase
        .from('pending_couple_associations')
        .insert({
          user_id: inviteData.user_id,
          email: inviteData.email,
          couple_id: inviteData.coupleId,
          invitation_token: inviteData.token
        });
        
      if (insertError) {
        console.error("Erro na inserção direta da associação pendente:", insertError);
        return { success: false, error: insertError };
      }
      
      return { success: true, message: "Associação pendente registrada (método fallback)" };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Exceção ao registrar associação pendente:", error);
    return { success: false, error };
  }
}

/**
 * Processa manualmente as associações pendentes para o usuário atual
 * Útil para chamar em eventos como login ou abertura do app
 * @returns {Promise<Object>} Resultado do processamento
 */
export async function processCurrentUserPendingItems() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: "Usuário não autenticado" };
    }
    
    // Chamar a função RPC para processar itens pendentes
    const { data, error } = await supabase.rpc('process_pending_items');
    
    if (error) {
      console.error("Erro ao processar itens pendentes:", error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Exceção ao processar itens pendentes:", error);
    return { success: false, error };
  }
}

/**
 * Função auxiliar para extrair payload de um token JWT sem validação
 * @param {string} token Token JWT 
 * @returns {Object|null} Payload do token ou null se inválido
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Erro ao parsear JWT:", e);
    return null;
  }
}

/**
 * Função para tentar registrar um usuário a partir de um convite de casal
 * @param {Object} userData Dados do usuário e convite
 * @returns {Promise<Object>} Resultado do registro
 */
export async function registerFromCoupleInvitation(userData) {
  // Valida dados necessários
  if (!userData || !userData.email || !userData.password || !userData.name || 
      !userData.token || !userData.inviterId || !userData.coupleId) {
    return { 
      success: false, 
      message: "Dados incompletos para registro a partir de convite" 
    };
  }
  
  console.log("Registro a partir de convite:", {
    token: userData.token,
    inviterId: userData.inviterId,
    coupleId: userData.coupleId,
    email: userData.email,
    name: userData.name
  });
  
  try {
    console.log("Iniciando processo de registro no Supabase");
    
    // NOVO: Limpar convites antigos pendentes para o mesmo email
    try {
      console.log("Limpando associações pendentes anteriores para o email:", userData.email);
      const { error: cleanupError } = await supabase
        .from('pending_couple_associations')
        .update({ processed: true })
        .eq('email', userData.email.toLowerCase().trim())
        .neq('couple_id', userData.coupleId);
        
      if (cleanupError) {
        console.error("Erro ao limpar associações anteriores:", cleanupError);
      }
    } catch (cleanupError) {
      console.error("Exceção ao limpar associações anteriores:", cleanupError);
    }
    
    // Montar metadados para o registro
    const metadata = {
      name: userData.name,
      full_name: userData.name,
      display_name: userData.name.split(' ')[0],
      firstName: userData.name.split(' ')[0],
      lastName: userData.name.split(' ').slice(1).join(' '),
      gender: userData.gender || '',
      account_type: 'couple',
      couple_id: userData.coupleId,
      invitation_token: userData.token,
      inviter_id: userData.inviterId,
      invitation_type: 'couple',
    };
    
    console.log("Metadados para registro:", metadata);
    
    // 1. Registrar o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: metadata,
        emailRedirectTo: window.location?.origin || 'myfinlove://'
      }
    });
    
    if (authError) {
      console.error("Erro no registro:", authError);
      return { success: false, error: authError };
    }
    
    // Registro bem-sucedido!
    console.log("Usuário criado com sucesso, ID:", authData.user.id);
    
    try {
      // NOVO: Criar perfil diretamente (não apenas pendente)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: userData.email.toLowerCase().trim(),
          name: userData.name.trim(),
          gender: userData.gender,
          account_type: 'couple'
        });
        
      if (profileError) {
        console.error("Erro ao criar perfil direto:", profileError);
      } else {
        console.log("Perfil criado diretamente com sucesso");
      }
      
      // NOVO: Tentar atualizar o registro de casal diretamente 
      // (mesmo que ainda seja necessário confirmar email)
      const { error: coupleError } = await supabase
        .from('couples')
        .update({ 
          user2_id: authData.user.id
        })
        .eq('id', userData.coupleId)
        .eq('invitation_token', userData.token);
        
      if (coupleError) {
        console.error("Erro ao atualizar registro de casal:", coupleError);
      } else {
        console.log("Registro de casal atualizado com sucesso");
      }
      
      // 2. Registrar perfil pendente (backup)
      await registerPendingProfile({
        user_id: authData.user.id,
        email: userData.email,
        name: userData.name,
        gender: userData.gender,
        account_type: 'couple'
      });
      
      // 3. Registrar associação de casal pendente (backup)
      await registerPendingCoupleAssociation({
        user_id: authData.user.id,
        email: userData.email,
        coupleId: userData.coupleId,
        token: userData.token
      });
      
      return { 
        success: true, 
        message: "Registro realizado com sucesso! Verifique seu email para confirmar a conta.",
        user: authData.user
      };
    } catch (error) {
      console.error("Erro ao registrar dados pendentes:", error);
      return { 
        success: true, 
        warning: "Usuário registrado, mas houve um problema ao armazenar dados adicionais.",
        user: authData.user
      };
    }
  } catch (error) {
    console.error("Exceção no processo de registro:", error);
    return { success: false, error };
  }
}

export default {
  extractInviteParameters,
  verifyInvitation,
  registerPendingProfile,
  registerPendingCoupleAssociation,
  processCurrentUserPendingItems,
  registerFromCoupleInvitation
}; 