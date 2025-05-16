-- Função para atualizar o campo user2_id na tabela couples
-- Esta função contorna problemas de sincronização entre auth.users e tabelas de aplicação
CREATE OR REPLACE FUNCTION update_couple_user2(p_couple_id UUID, p_user2_id UUID)
RETURNS JSON AS $$
DECLARE
    result RECORD;
    success BOOLEAN := FALSE;
    message TEXT := 'Falha na operação';
BEGIN
    -- Verificar se o casal existe
    BEGIN
        SELECT * INTO result FROM couples WHERE id = p_couple_id;
        
        IF NOT FOUND THEN
            message := 'Casal não encontrado';
            RETURN json_build_object('success', success, 'message', message);
        END IF;
        
        -- Tentar atualizar o registro do casal
        UPDATE couples 
        SET 
            user2_id = p_user2_id,
            status = 'active',
            updated_at = NOW()
        WHERE id = p_couple_id;
        
        success := TRUE;
        message := 'Casal atualizado com sucesso';
        
        EXCEPTION WHEN OTHERS THEN
            message := 'Erro ao atualizar casal: ' || SQLERRM;
    END;
    
    RETURN json_build_object('success', success, 'message', message);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 