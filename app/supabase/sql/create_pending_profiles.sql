-- Tabela para armazenar informações de perfil pendentes
-- Evita problemas de foreign key constraint com auth.users
CREATE TABLE IF NOT EXISTS pending_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    gender TEXT,
    account_type TEXT,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_pending_profiles_user_id ON pending_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_profiles_email ON pending_profiles(email);
CREATE INDEX IF NOT EXISTS idx_pending_profiles_processed ON pending_profiles(processed);

-- Função para processar perfis pendentes
CREATE OR REPLACE FUNCTION process_pending_profile(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    pending_record RECORD;
    result JSON;
BEGIN
    -- Buscar registro pendente não processado
    SELECT * INTO pending_record
    FROM pending_profiles
    WHERE user_id = p_user_id AND processed = FALSE
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Se não encontrar, retorna
    IF NOT FOUND THEN
        RETURN json_build_object('success', FALSE, 'message', 'Nenhum perfil pendente encontrado');
    END IF;
    
    -- Tentar criar o perfil
    BEGIN
        INSERT INTO profiles (
            id, 
            name, 
            email, 
            gender, 
            account_type, 
            created_at
        )
        VALUES (
            pending_record.user_id,
            pending_record.name,
            pending_record.email,
            pending_record.gender,
            pending_record.account_type,
            NOW()
        )
        ON CONFLICT (id) 
        DO UPDATE SET
            name = pending_record.name,
            gender = pending_record.gender,
            account_type = pending_record.account_type;
            
        -- Marcar como processado
        UPDATE pending_profiles
        SET processed = TRUE, processed_at = NOW()
        WHERE id = pending_record.id;
        
        RETURN json_build_object(
            'success', TRUE,
            'message', 'Perfil processado com sucesso'
        );
    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object('success', FALSE, 'message', 'Erro: ' || SQLERRM);
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Modificar função existente para processar também o perfil
CREATE OR REPLACE FUNCTION process_user_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o email foi confirmado (usamos a notificação de auth.users para detectar)
    IF TG_OP = 'UPDATE' AND 
       OLD.email_confirmed_at IS NULL AND 
       NEW.email_confirmed_at IS NOT NULL THEN
        
        -- Processa o perfil pendente
        PERFORM process_pending_profile(NEW.id);
        
        -- Processa qualquer associação de casal pendente
        PERFORM process_pending_couple_association(NEW.id);
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 