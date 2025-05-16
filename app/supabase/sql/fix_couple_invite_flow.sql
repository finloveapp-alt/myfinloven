-- Script para corrigir o fluxo de convite para casais
-- Este script cria funções e triggers que garantem a correta associação
-- entre usuários e casais após a confirmação de email

-- Verifica se as tabelas necessárias existem
DO $$
BEGIN
    -- Verifica e cria a tabela de perfis pendentes se não existir
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pending_profiles') THEN
        CREATE TABLE public.pending_profiles (
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
        
        CREATE INDEX idx_pending_profiles_user_id ON public.pending_profiles(user_id);
        CREATE INDEX idx_pending_profiles_email ON public.pending_profiles(email);
        CREATE INDEX idx_pending_profiles_processed ON public.pending_profiles(processed);
    END IF;

    -- Verifica e cria a tabela de associações de casais pendentes se não existir
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pending_couple_associations') THEN
        CREATE TABLE public.pending_couple_associations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            couple_id UUID NOT NULL,
            invitation_token TEXT,
            email TEXT NOT NULL,
            processed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            processed_at TIMESTAMPTZ
        );
        
        CREATE INDEX idx_pending_couple_user_id ON public.pending_couple_associations(user_id);
        CREATE INDEX idx_pending_couple_email ON public.pending_couple_associations(email);
        CREATE INDEX idx_pending_couple_processed ON public.pending_couple_associations(processed);
    END IF;
END
$$;

-- Função para processar perfis pendentes
CREATE OR REPLACE FUNCTION public.process_pending_profile(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    pending_record RECORD;
    user_record RECORD;
    result JSONB;
BEGIN
    -- Verifica se o usuário existe e está confirmado
    SELECT * INTO user_record 
    FROM auth.users 
    WHERE id = p_user_id AND email_confirmed_at IS NOT NULL;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Usuário não existe ou email não confirmado');
    END IF;

    -- Buscar registro pendente não processado
    SELECT * INTO pending_record
    FROM public.pending_profiles
    WHERE user_id = p_user_id AND processed = FALSE
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Se não encontrar, verifica pelo email
    IF NOT FOUND THEN
        SELECT * INTO pending_record
        FROM public.pending_profiles
        WHERE email = user_record.email AND processed = FALSE
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;

    -- Se ainda não encontrar, retorna
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Nenhum perfil pendente encontrado');
    END IF;
    
    -- Tentar criar o perfil
    BEGIN
        INSERT INTO public.profiles (
            id, 
            name, 
            email, 
            gender, 
            account_type, 
            created_at
        )
        VALUES (
            p_user_id,
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
        UPDATE public.pending_profiles
        SET processed = TRUE, processed_at = NOW(), user_id = p_user_id
        WHERE id = pending_record.id;
        
        RETURN jsonb_build_object(
            'success', TRUE,
            'message', 'Perfil processado com sucesso'
        );
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Erro: ' || SQLERRM);
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para processar associações de casal pendentes
CREATE OR REPLACE FUNCTION public.process_pending_couple_association(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    pending_record RECORD;
    user_record RECORD;
    result JSONB;
BEGIN
    -- Verifica se o usuário existe e está confirmado
    SELECT * INTO user_record 
    FROM auth.users 
    WHERE id = p_user_id AND email_confirmed_at IS NOT NULL;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Usuário não existe ou email não confirmado');
    END IF;

    -- Buscar registro pendente não processado pelo ID do usuário
    SELECT * INTO pending_record
    FROM public.pending_couple_associations
    WHERE user_id = p_user_id AND processed = FALSE
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Se não encontrar, procurar pelo email
    IF NOT FOUND THEN
        SELECT * INTO pending_record
        FROM public.pending_couple_associations
        WHERE email = user_record.email AND processed = FALSE
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;
    
    -- Se ainda não encontrar, retorna
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Nenhuma associação pendente encontrada');
    END IF;
    
    -- Atualizar o registro de casal
    BEGIN
        UPDATE public.couples
        SET user2_id = p_user_id, status = 'active'
        WHERE id = pending_record.couple_id;
        
        -- Marcar como processado
        UPDATE public.pending_couple_associations
        SET processed = TRUE, processed_at = NOW(), user_id = p_user_id
        WHERE id = pending_record.id;
        
        RETURN jsonb_build_object(
            'success', TRUE,
            'message', 'Associação processada com sucesso',
            'couple_id', pending_record.couple_id
        );
    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Erro: ' || SQLERRM);
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para processar quando um email é confirmado
CREATE OR REPLACE FUNCTION public.process_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o email foi confirmado
    IF NEW.email_confirmed_at IS NOT NULL AND 
       (OLD.email_confirmed_at IS NULL OR OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at) THEN
        -- Processar perfil pendente
        PERFORM public.process_pending_profile(NEW.id);
        
        -- Processar associação de casal pendente
        PERFORM public.process_pending_couple_association(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar convite de casal pendente
CREATE OR REPLACE FUNCTION public.register_pending_couple_invitation(
    p_user_id UUID,
    p_email TEXT,
    p_couple_id UUID,
    p_invitation_token TEXT
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Verificar se já existe uma associação pendente
    IF EXISTS (
        SELECT 1 FROM public.pending_couple_associations
        WHERE email = p_email AND processed = FALSE
    ) THEN
        -- Atualizar o registro existente
        UPDATE public.pending_couple_associations
        SET user_id = p_user_id,
            couple_id = p_couple_id,
            invitation_token = p_invitation_token,
            created_at = NOW()
        WHERE email = p_email AND processed = FALSE;
    ELSE
        -- Inserir novo registro
        INSERT INTO public.pending_couple_associations (
            user_id,
            email,
            couple_id,
            invitation_token
        ) VALUES (
            p_user_id,
            p_email,
            p_couple_id,
            p_invitation_token
        );
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Convite de casal registrado com sucesso'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Erro: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar perfil pendente
CREATE OR REPLACE FUNCTION public.register_pending_profile(
    p_user_id UUID,
    p_email TEXT,
    p_name TEXT,
    p_gender TEXT,
    p_account_type TEXT
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Verificar se já existe um perfil pendente
    IF EXISTS (
        SELECT 1 FROM public.pending_profiles
        WHERE email = p_email AND processed = FALSE
    ) THEN
        -- Atualizar o registro existente
        UPDATE public.pending_profiles
        SET user_id = p_user_id,
            name = p_name,
            gender = p_gender,
            account_type = p_account_type,
            created_at = NOW()
        WHERE email = p_email AND processed = FALSE;
    ELSE
        -- Inserir novo registro
        INSERT INTO public.pending_profiles (
            user_id,
            email,
            name,
            gender,
            account_type
        ) VALUES (
            p_user_id,
            p_email,
            p_name,
            p_gender,
            p_account_type
        );
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Perfil pendente registrado com sucesso'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Erro: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para processar automaticamente quando email for confirmado
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.process_email_confirmation();

-- Função para verificar e processar pendências no login
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
    -- Quando um usuário faz login e seu email já está confirmado
    IF NEW.last_sign_in_at IS NOT NULL AND 
       NEW.email_confirmed_at IS NOT NULL AND 
       (OLD.last_sign_in_at IS NULL OR OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at) THEN
        
        -- Verifica se já existe um perfil para o usuário
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
            -- Tentar processar perfil pendente
            PERFORM public.process_pending_profile(NEW.id);
        END IF;
        
        -- Verifica se há associações de casal pendentes
        PERFORM public.process_pending_couple_association(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para processar pendências no login
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_login();

-- Função RPC para processar pendências manualmente
CREATE OR REPLACE FUNCTION public.process_pending_items(user_id UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
    profile_result JSONB;
    association_result JSONB;
    result JSONB;
BEGIN
    -- Verifica se é o próprio usuário ou um administrador
    IF user_id IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Usuário não autenticado');
    END IF;
    
    -- Processar perfil pendente
    profile_result := public.process_pending_profile(user_id);
    
    -- Processar associação de casal pendente
    association_result := public.process_pending_couple_association(user_id);
    
    -- Retornar resultado combinado
    RETURN jsonb_build_object(
        'success', TRUE,
        'profile', profile_result,
        'couple_association', association_result
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', FALSE, 'message', 'Erro: ' || SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 