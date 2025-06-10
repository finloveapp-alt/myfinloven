/**
 * Configuração de hooks para processar itens pendentes após login
 * Este módulo deve ser importado e executado no componente principal da aplicação
 */

import { supabase } from '../lib/supabase';
import { processCurrentUserPendingItems } from './couples-invite-helper';

let isSetup = false;
let pendingProcessed = false;

/**
 * Verifica o gênero do usuário e define o tema apropriado
 * @param {Object} user - O objeto de usuário do Supabase
 */
async function checkUserGenderAndSetTheme(user) {
  if (!user) return;
  
  try {
    // Primeiro tenta obter dos metadados
    let userGender = user.user_metadata?.gender || null;
    
    // Se não encontrou nos metadados, busca no perfil
    if (!userGender) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('gender')
        .eq('id', user.id)
        .maybeSingle();
        
      if (!profileError && profileData) {
        userGender = profileData.gender;
      }
    }
    
    console.log('### GÊNERO DO USUÁRIO:', userGender);
    
    // Define o tema baseado no gênero: 'masculine' para homem, 'feminine' para mulher
    if (userGender) {
      if (userGender.toLowerCase() === 'male' || 
          userGender.toLowerCase() === 'masculino' || 
          userGender.toLowerCase() === 'homem' || 
          userGender.toLowerCase() === 'm') {
        global.dashboardTheme = 'masculine';
        console.log('### TEMA DEFINIDO: Masculino (Azul)');
      } else if (userGender.toLowerCase() === 'female' || 
                userGender.toLowerCase() === 'feminino' || 
                userGender.toLowerCase() === 'mulher' || 
                userGender.toLowerCase() === 'f') {
        global.dashboardTheme = 'feminine';
        console.log('### TEMA DEFINIDO: Feminino (Rosa)');
      }
    }
  } catch (genderError) {
    console.error('### ERRO AO OBTER GÊNERO:', genderError);
  }
}

/**
 * Configura os listeners de autenticação que tentarão processar
 * perfis e associações de casal pendentes após o login
 */
export function setupAuthListeners() {
  // Evita configuração duplicada
  if (isSetup) return;
  
  // Listener para alterações de autenticação
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log(`Evento de autenticação: ${event}`);
    
    if (event === 'SIGNED_IN' && session?.user) {
      // Verifica o gênero e define o tema apropriado
      await checkUserGenderAndSetTheme(session.user);
      
      if (session.user.email_confirmed_at && !pendingProcessed) {
        console.log("Usuário autenticado com email confirmado, processando pendências");
        
        try {
          pendingProcessed = true;
          const result = await processCurrentUserPendingItems();
          
          console.log("Resultado do processamento de pendências:", result);
          
          // Poderia mostrar uma notificação aqui se necessário
          if (result.success && 
              (result.data?.profile?.success || result.data?.couple_association?.success)) {
            console.log("Itens pendentes processados com sucesso!");
            
            // Poderia exibir uma mensagem ao usuário, se necessário
            // ou disparar algum evento para atualizar a UI
          }
        } catch (error) {
          console.error("Erro ao processar pendências:", error);
        } finally {
          // Reset após um delay para permitir novas tentativas se necessário
          setTimeout(() => {
            pendingProcessed = false;
          }, 60000); // 1 minuto
        }
      }
    } else if (event === 'SIGNED_OUT') {
      // Reset de flags quando o usuário faz logout
      pendingProcessed = false;
    }
  });
  
  isSetup = true;
  console.log("Hooks de autenticação configurados");
}

/**
 * Tenta processar manualmente os itens pendentes para o usuário atual
 * Pode ser chamado em pontos específicos como abertura da aplicação
 */
export async function tryProcessPendingItems() {
  if (!pendingProcessed) {
    try {
      const { data } = await supabase.auth.getSession();
      
      if (data?.session?.user) {
        // Verifica o gênero e define o tema apropriado
        await checkUserGenderAndSetTheme(data.session.user);
        
        if (data.session.user.email_confirmed_at) {
          console.log("Sessão existente com email confirmado, processando pendências");
          pendingProcessed = true;
          
          const result = await processCurrentUserPendingItems();
          console.log("Resultado do processamento manual:", result);
          
          return result;
        }
      }
    } catch (error) {
      console.error("Erro ao processar pendências manualmente:", error);
    } finally {
      // Reset após um delay
      setTimeout(() => {
        pendingProcessed = false;
      }, 60000); // 1 minuto
    }
  }
  
  return { success: false, message: "Processamento já em andamento ou não necessário" };
}

export default {
  setupAuthListeners,
  tryProcessPendingItems
}; 