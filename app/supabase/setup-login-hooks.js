/**
 * Configuração de hooks para processar itens pendentes após login
 * Este módulo deve ser importado e executado no componente principal da aplicação
 */

import { supabase } from '../lib/supabase';
import { processCurrentUserPendingItems } from './couples-invite-helper';

let isSetup = false;
let pendingProcessed = false;

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
    
    if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at && !pendingProcessed) {
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
      
      if (data?.session?.user?.email_confirmed_at) {
        console.log("Sessão existente com email confirmado, processando pendências");
        pendingProcessed = true;
        
        const result = await processCurrentUserPendingItems();
        console.log("Resultado do processamento manual:", result);
        
        return result;
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