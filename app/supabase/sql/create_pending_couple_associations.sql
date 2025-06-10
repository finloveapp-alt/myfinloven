-- Tabela para armazenar associações pendentes entre usuários e casais
-- Esta tabela não usa foreign keys para evitar problemas de sincronização
CREATE TABLE IF NOT EXISTS pending_couple_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    couple_id UUID NOT NULL,
    invitation_token TEXT,
    email TEXT NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_pending_couple_user_id ON pending_couple_associations(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_couple_email ON pending_couple_associations(email);
CREATE INDEX IF NOT EXISTS idx_pending_couple_processed ON pending_couple_associations(processed);

-- Função para processar uma associação pendente
CREATE OR REPLACE FUNCTION process_pending_couple_association(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    pending_record RECORD;
    user_email TEXT;
    result JSON;
BEGIN
    -- Obter email do usuário para verificações adicionais
    SELECT email INTO user_email FROM auth.users WHERE id = p_user_id;
    
    -- NOVO: Limpar quaisquer associações pendentes conflitantes
    -- antes de processar a mais recente
    UPDATE pending_couple_associations
    SET processed = TRUE, processed_at = NOW()
    WHERE email = user_email 
      AND user_id != p_user_id
      AND processed = FALSE;
      
    -- Buscar registro pendente não processado
    SELECT * INTO pending_record
    FROM pending_couple_associations
    WHERE user_id = p_user_id AND processed = FALSE
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Se não encontrar, tentar buscar por email como fallback
    IF NOT FOUND THEN
        SELECT * INTO pending_record
        FROM pending_couple_associations
        WHERE email = user_email AND processed = FALSE
        ORDER BY created_at DESC
        LIMIT 1;
        
        -- Se ainda não encontrar, buscar em couples diretamente
        IF NOT FOUND THEN
            -- Verificar se há algum convite direto pendente
            UPDATE couples 
            SET status = 'active'
            WHERE invitation_email = user_email 
              AND user2_id = p_user_id
              AND status = 'pending'
            RETURNING id INTO pending_record;
            
            IF FOUND THEN
                RETURN json_build_object(
                    'success', TRUE,
                    'message', 'Casal ativado diretamente',
                    'couple_id', pending_record.id
                );
            ELSE
                RETURN json_build_object('success', FALSE, 'message', 'Nenhuma associação pendente encontrada');
            END IF;
        END IF;
    END IF;
    
    -- Atualizar o registro de casal
    UPDATE couples
    SET user2_id = p_user_id, status = 'active'
    WHERE id = pending_record.couple_id
    AND (status = 'pending' OR (status != 'active' AND user2_id = p_user_id));
    
    -- Marcar como processado
    UPDATE pending_couple_associations
    SET processed = TRUE, processed_at = NOW()
    WHERE id = pending_record.id;
    
    RETURN json_build_object(
        'success', TRUE,
        'message', 'Associação processada com sucesso',
        'couple_id', pending_record.couple_id
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', FALSE, 'message', 'Erro: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 