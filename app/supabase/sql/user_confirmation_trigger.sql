-- Função de trigger para processar associações pendentes quando um usuário é confirmado
CREATE OR REPLACE FUNCTION process_user_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o email foi confirmado (usamos a notificação de auth.users para detectar)
    IF TG_OP = 'UPDATE' AND 
       OLD.email_confirmed_at IS NULL AND 
       NEW.email_confirmed_at IS NOT NULL THEN
        
        -- Tenta criar um perfil, se necessário
        INSERT INTO public.profiles (id, email, created_at)
        VALUES (NEW.id, NEW.email, NOW())
        ON CONFLICT (id) DO NOTHING;
        
        -- Processa qualquer associação de casal pendente
        PERFORM process_pending_couple_association(NEW.id);
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cria o trigger na tabela auth.users (se tiver permissão)
-- DROP TRIGGER IF EXISTS user_email_confirmation_trigger ON auth.users;
-- CREATE TRIGGER user_email_confirmation_trigger
-- AFTER UPDATE ON auth.users
-- FOR EACH ROW
-- EXECUTE FUNCTION process_user_email_confirmation();

-- Se não tiver permissão para criar triggers diretamente em auth.users,
-- use webhooks do Supabase ou Edge Functions para detectar confirmação de email
-- e chamar a função process_pending_couple_association manualmente 