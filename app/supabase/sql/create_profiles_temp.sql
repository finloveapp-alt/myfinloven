-- Tabela temporária para armazenar dados de perfil sem restrições de chave estrangeira
CREATE TABLE IF NOT EXISTS profiles_temp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temp_id TEXT NOT NULL UNIQUE,
    user_id UUID,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    gender TEXT,
    account_type TEXT,
    is_couple_invitation BOOLEAN DEFAULT FALSE,
    couple_id UUID,
    invitation_token TEXT,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_temp_temp_id ON profiles_temp(temp_id);
CREATE INDEX IF NOT EXISTS idx_profiles_temp_email ON profiles_temp(email);
CREATE INDEX IF NOT EXISTS idx_profiles_temp_user_id ON profiles_temp(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_temp_processed ON profiles_temp(processed);

-- Função para processar perfis temporários
CREATE OR REPLACE FUNCTION process_profiles_temp()
RETURNS VOID AS $$
DECLARE
    profile_record RECORD;
BEGIN
    -- Encontrar todos os perfis temporários que possuem user_id atribuído
    -- mas ainda não foram processados
    FOR profile_record IN
        SELECT * FROM profiles_temp
        WHERE user_id IS NOT NULL AND processed = FALSE
    LOOP
        -- Tentar inserir na tabela de perfis real
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
                profile_record.user_id,
                profile_record.name,
                profile_record.email,
                profile_record.gender,
                profile_record.account_type,
                NOW()
            )
            ON CONFLICT (id) 
            DO UPDATE SET
                name = profile_record.name,
                gender = profile_record.gender,
                account_type = profile_record.account_type;
                
            -- Marcar como processado
            UPDATE profiles_temp
            SET processed = TRUE, processed_at = NOW()
            WHERE id = profile_record.id;
            
            -- Se for um convite de casal, processar também
            IF profile_record.is_couple_invitation AND profile_record.couple_id IS NOT NULL THEN
                -- Atualizar o registro de casal 
                UPDATE couples
                SET user2_id = profile_record.user_id,
                    status = 'active'
                WHERE id = profile_record.couple_id
                AND invitation_token = profile_record.invitation_token;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            -- Em caso de erro, apenas registra e continua
            RAISE NOTICE 'Erro ao processar perfil temporário %: %', profile_record.id, SQLERRM;
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para ser chamada durante o login
CREATE OR REPLACE FUNCTION process_profile_temp_by_email(p_email TEXT)
RETURNS JSON AS $$
DECLARE
    profile_record RECORD;
    result JSON;
BEGIN
    -- Buscar o perfil temporário pelo email
    SELECT * INTO profile_record
    FROM profiles_temp
    WHERE email = p_email AND processed = FALSE
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Se não encontrar, retorna
    IF NOT FOUND THEN
        RETURN json_build_object('success', FALSE, 'message', 'Nenhum perfil temporário encontrado');
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
            profile_record.user_id,
            profile_record.name,
            profile_record.email,
            profile_record.gender,
            profile_record.account_type,
            NOW()
        )
        ON CONFLICT (id) 
        DO UPDATE SET
            name = profile_record.name,
            gender = profile_record.gender,
            account_type = profile_record.account_type;
            
        -- Marcar como processado
        UPDATE profiles_temp
        SET processed = TRUE, processed_at = NOW()
        WHERE id = profile_record.id;
        
        -- Se for um convite de casal, processar também
        IF profile_record.is_couple_invitation AND profile_record.couple_id IS NOT NULL THEN
            -- Atualizar o registro de casal 
            UPDATE couples
            SET user2_id = profile_record.user_id,
                status = 'active'
            WHERE id = profile_record.couple_id
            AND invitation_token = profile_record.invitation_token;
            
            RETURN json_build_object(
                'success', TRUE,
                'message', 'Perfil processado e casal vinculado com sucesso',
                'couple_activated', TRUE
            );
        END IF;
        
        RETURN json_build_object(
            'success', TRUE,
            'message', 'Perfil processado com sucesso'
        );
    EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object('success', FALSE, 'message', 'Erro: ' || SQLERRM);
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar trigger para usar a nova tabela
CREATE OR REPLACE FUNCTION process_user_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o email foi confirmado 
    IF TG_OP = 'UPDATE' AND 
       OLD.email_confirmed_at IS NULL AND 
       NEW.email_confirmed_at IS NOT NULL THEN
        
        -- Verificar se há um perfil temporário para este usuário
        DECLARE
            temp_profile_id UUID;
        BEGIN
            SELECT id INTO temp_profile_id 
            FROM profiles_temp 
            WHERE user_id = NEW.id AND processed = FALSE
            LIMIT 1;
            
            IF FOUND THEN
                -- Processar o perfil temporário
                PERFORM process_profiles_temp();
            ELSE
                -- Tentar criar um perfil mínimo
                INSERT INTO profiles (id, email, created_at)
                VALUES (NEW.id, NEW.email, NOW())
                ON CONFLICT (id) DO NOTHING;
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 