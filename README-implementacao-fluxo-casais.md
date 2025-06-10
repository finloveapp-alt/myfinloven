# Implementação do Fluxo de Convite de Casais no MyFinlove

Este documento explica como implementar corretamente o fluxo de convite de casais no MyFinlove, evitando os problemas de constraint foreign key relacionados às tabelas de usuários.

## Problema Identificado

Analisando os logs de erro, identificamos o seguinte problema:

1. Quando um usuário se registra a partir de um convite de casal, os seguintes erros ocorrem:
   - Erro ao criar/atualizar perfil: `Key (id)=(400347c3-a6cf-4461-8923-1f8d0285e127) is not present in table "users"`
   - Erro ao atualizar casal: `Key (user2_id)=(400347c3-a6cf-4461-8923-1f8d0285e127) is not present in table "users"`

2. Estes erros ocorrem porque:
   - As operações de inserção de perfil e atualização de casal estão sendo realizadas imediatamente após o registro
   - O usuário recém-registrado ainda não foi completamente replicado na tabela `auth.users` (que é gerenciada pelo Supabase Auth)
   - A confirmação de email não foi feita

## Solução Implementada

A solução implementa um sistema de processamento diferido que:

1. Armazena perfis e associações de casal pendentes em tabelas intermediárias
2. Processa esses registros pendentes quando o email do usuário é confirmado
3. Fornece APIs e funções para facilitar o processo

### Componentes da Solução

#### 1. Estrutura de Banco de Dados

O script SQL `fix_couple_invite_flow.sql` cria:

- Tabela `pending_profiles`: Armazena informações de perfil até a confirmação do email
- Tabela `pending_couple_associations`: Armazena associações entre usuários e casais
- Funções SQL para processar estes registros quando necessário
- Triggers para detectar confirmação de email e login

#### 2. Módulo JavaScript de Assistência

O arquivo `couples-invite-helper.js` fornece funções para:

- Extrair parâmetros de convite da URL ou token JWT
- Verificar a validade de convites
- Registrar perfis e associações pendentes
- Processar registros pendentes manualmente

#### 3. Hooks de Autenticação

O arquivo `setup-login-hooks.js` configura:

- Listeners de eventos de autenticação para processar itens pendentes após login
- Funções para processamento manual de pendências

## Guia de Implementação

Siga estas etapas para implementar a solução:

### 1. Executar Script SQL no Supabase

1. Acesse o painel de controle do Supabase
2. Vá para a seção "SQL Editor"
3. Crie uma nova consulta e cole o conteúdo do arquivo `app/supabase/sql/fix_couple_invite_flow.sql`
4. Execute o script

### 2. Integrar Módulos JavaScript

1. Integre os arquivos no projeto:
   - `app/supabase/couples-invite-helper.js`
   - `app/supabase/setup-login-hooks.js`

2. Configure os hooks de autenticação no componente principal da aplicação:

```javascript
// Em _layout.jsx, App.jsx ou equivalente
import { useEffect } from 'react';
import { setupAuthListeners } from '@/app/supabase/setup-login-hooks';

export default function AppLayout() {
  // Configurar hooks na montagem do componente
  useEffect(() => {
    setupAuthListeners();
  }, []);
  
  // Resto do componente
  return (/* ... */);
}
```

### 3. Modificar o Fluxo de Convite e Registro

#### Na página de convite de casal (`/convite-casal`):

```javascript
import { extractInviteParameters, verifyInvitation } from '@/app/supabase/couples-invite-helper';

export default function ConviteCasal() {
  const [inviteData, setInviteData] = useState(null);
  
  useEffect(() => {
    async function loadInviteData() {
      // Extrair parâmetros do convite da URL ou token
      const params = await extractInviteParameters();
      if (params?.token && params?.inviterId && params?.coupleId) {
        // Verificar validade do convite
        const inviteDetails = await verifyInvitation(
          params.token,
          params.inviterId,
          params.coupleId
        );
        
        if (inviteDetails) {
          setInviteData({
            ...params,
            ...inviteDetails
          });
        } else {
          // Convite inválido
          Alert.alert('Erro', 'Convite inválido ou expirado');
        }
      }
    }
    
    loadInviteData();
  }, []);
  
  // Função para aceitar o convite
  function acceptInvitation() {
    if (inviteData) {
      router.push({
        pathname: '/(auth)/register',
        params: {
          fromCoupleInvitation: 'true',
          invitationToken: inviteData.token,
          inviterId: inviteData.inviterId,
          coupleId: inviteData.coupleId
        }
      });
    }
  }
  
  // Renderização do componente...
}
```

#### No formulário de registro (`register.tsx`):

```javascript
import { registerFromCoupleInvitation } from '@/app/supabase/couples-invite-helper';

// Dentro do componente de registro
const params = useSearchParams();
const fromCoupleInvitation = params?.fromCoupleInvitation === 'true';
const invitationToken = params?.invitationToken;
const inviterId = params?.inviterId;
const coupleId = params?.coupleId;

// Função de registro modificada
async function signUpWithEmail() {
  // Validações existentes...
  
  setLoading(true);
  try {
    if (fromCoupleInvitation) {
      // Registrar usuário com fluxo de convite
      const result = await registerFromCoupleInvitation({
        email,
        password,
        name,
        gender,
        token: invitationToken,
        inviterId,
        coupleId
      });
      
      if (result.success) {
        // Mostrar modal de sucesso com mensagem sobre confirmação de email
        setEmailVerificationNeededModalVisible(true);
      } else {
        Alert.alert('Erro', `Falha ao criar conta: ${result.error?.message || 'Erro desconhecido'}`);
      }
    } else {
      // Fluxo normal de registro...
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
```

#### No fluxo de login (`login-form.tsx`):

```javascript
import { tryProcessPendingItems } from '@/app/supabase/setup-login-hooks';

// Função de login
async function signInWithEmail() {
  // Código de login existente...
  
  // Se autenticou com sucesso
  if (data && data.user) {
    // Tentar processar pendências, se existirem
    if (data.user.email_confirmed_at) {
      await tryProcessPendingItems();
    }
    
    // Redirecionar para dashboard normalmente
    router.replace('/(app)/dashboard');
  }
}
```

## Fluxo de Funcionamento

Após implementada, a solução funcionará da seguinte forma:

1. Um usuário cria uma conta de casal e convida seu parceiro
2. O convidado recebe o email e acessa o link de convite
3. Na tela de convite, ele vê quem o convidou e pode aceitar
4. Ao aceitar, ele é redirecionado para o formulário de registro
5. Após preencher os dados e enviar:
   - O usuário é criado no Supabase Auth
   - Os dados de perfil e associação são registrados como pendentes
   - O usuário recebe um email de confirmação
6. Quando confirma o email e faz login:
   - Os hooks detectam a confirmação
   - O perfil é criado e a associação de casal é ativada
   - Os registros pendentes são marcados como processados

## Considerações de Segurança

- As funções SQL usam `SECURITY DEFINER` para garantir permissões suficientes
- Validações são realizadas em múltiplas camadas
- Dados sensíveis não são expostos
- Verificações de propriedade são realizadas antes do processamento

## Solução de Problemas

Se houver problemas com o fluxo de convite:

1. Verifique os logs do console para identificar em que etapa ocorre o erro
2. Confirme que o usuário confirmou o email antes de tentar associá-lo
3. Use a função `processCurrentUserPendingItems()` manualmente para forçar o processamento
4. Verifique as tabelas `pending_profiles` e `pending_couple_associations` para registros não processados 