# Implementação do RevenueCat com Supabase

## Resumo das Alterações

Esta implementação integra o RevenueCat com o Supabase de forma que o `user_id` do usuário logado seja usado diretamente como `app_user_id` no RevenueCat, eliminando a necessidade de IDs anônimos.

## Arquivos Modificados

### 1. `/app/(app)/subscription.tsx`

**Alterações principais:**
- Importação do cliente Supabase
- Configuração do RevenueCat com `appUserID` do Supabase
- Obtenção do usuário atual antes da configuração

**Código adicionado:**
```typescript
import { supabase } from '@/lib/supabase';

// Na função initRevenueCat:
const { data: { user }, error: userError } = await supabase.auth.getUser();
const userId = user?.id;

// Configuração com user_id:
await Purchases.configure({
  apiKey: 'sua_api_key',
  appUserID: userId, // ID do usuário do Supabase
});
```

### 2. Edge Function `revenuecat-webhook`

**Alterações principais:**
- Remoção da lógica de IDs anônimos
- Uso direto do `app_user_id` como `user_id` do Supabase
- Verificação de existência do usuário na tabela `profiles`

## Como Funciona

### 1. Configuração do RevenueCat

Quando o usuário acessa a tela de assinatura:
1. O app obtém o usuário atual do Supabase (`supabase.auth.getUser()`)
2. Usa o `user.id` como `appUserID` na configuração do RevenueCat
3. Todas as compras ficam associadas ao ID real do usuário

### 2. Processamento de Webhooks

Quando o RevenueCat envia um webhook:
1. O `app_user_id` no payload é o ID do usuário do Supabase
2. A função verifica se o usuário existe na tabela `profiles`
3. Mapeia o `product_id` para o `plan_template_id` correto
4. Atualiza ou cria o registro na tabela `user_plans`

### 3. Mapeamento de Produtos

```typescript
// Produtos mapeados:
'premium_annual' ou 'anual' → '421afebc-6f92-4fbd-af24-50a55b48a0be'
'premium_monthly' ou 'mensal' → '63f1a6d3-38f0-48a2-bf8e-a02120d6f5bd'
```

## Estrutura do Banco de Dados

### Tabela `profiles`
- `id` (uuid) - ID do usuário (mesmo do Supabase Auth)
- `name`, `email`, `gender`, etc.

### Tabela `user_plans`
- `user_id` (uuid) - Referência ao usuário
- `plan_template_id` (uuid) - Referência ao plano
- `start_date`, `end_date` - Período do plano
- `is_active` (boolean) - Status do plano
- `payment_status` - Status do pagamento

### Tabela `plan_templates`
- `id` (uuid) - ID do template
- `product_id` - ID do produto no RevenueCat
- `name` - Nome do plano

## URL do Webhook

```
https://bellpfebhwltuqlkwirt.supabase.co/functions/v1/revenuecat-webhook
```

## Exemplo de Teste

Para testar a implementação, você pode usar este payload:

```json
{
  "app_user_id": "f87bcbd5-7ab6-4657-bafd-f611d4b5a101",
  "product_id": "premium_annual:premium-anual",
  "type": "INITIAL_PURCHASE",
  "expiration_at_ms": 1672531200000
}
```

**Substitua o `app_user_id` por um ID real de usuário da sua tabela `profiles`.**

## Vantagens desta Implementação

1. **Simplicidade**: Não há necessidade de gerenciar IDs anônimos
2. **Consistência**: O mesmo ID é usado em todo o sistema
3. **Rastreabilidade**: Fácil associação entre usuários e compras
4. **Manutenibilidade**: Menos lógica condicional no webhook

## Considerações Importantes

1. **Autenticação Obrigatória**: O usuário deve estar logado antes de acessar a tela de assinatura
2. **Configuração Única**: O RevenueCat deve ser configurado apenas após o login
3. **Logout**: Ao fazer logout, o RevenueCat deve ser reconfigurado ou limpo
4. **Teste**: Sempre teste com IDs reais de usuários existentes na base

## Próximos Passos

1. Teste a implementação com usuários reais
2. Configure o webhook no dashboard do RevenueCat
3. Monitore os logs da Edge Function
4. Implemente tratamento de erros adicional se necessário