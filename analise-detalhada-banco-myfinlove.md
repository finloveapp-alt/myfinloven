# Análise Detalhada do Banco de Dados - MyFinlove

## Informações Gerais do Projeto
- **ID do Projeto**: `bellpfebhwltuqlkwirt`
- **Nome**: myfinlove
- **Região**: sa-east-1 (São Paulo)
- **Status**: ACTIVE_HEALTHY
- **Versão PostgreSQL**: 15.8.1.085
- **URL**: https://bellpfebhwltuqlkwirt.supabase.co

---

## 📊 Estrutura de Tabelas

### Schema `public` - Tabelas Principais

#### 1. **profiles** (Perfis de Usuários)
**Propósito**: Armazena informações de perfil dos usuários do sistema

**Colunas**:
- `id` (UUID, PK) - Identificador único vinculado ao auth.users
- `name` (TEXT) - Nome completo do usuário
- `email` (TEXT) - Email do usuário
- `gender` (TEXT) - Gênero do usuário
- `account_type` (TEXT) - Tipo de conta (individual, couple, etc.)
- `profile_picture_url` (TEXT) - URL da foto de perfil
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de última atualização

**Relacionamentos**:
- Referenciada por `accounts.owner_id` e `accounts.partner_id`
- Referenciada por `transactions.owner_id` e `transactions.partner_id`

#### 2. **couples** (Relacionamentos de Casais)
**Propósito**: Gerencia relacionamentos entre casais e convites

**Colunas**:
- `id` (UUID, PK) - Identificador único do casal
- `user1_id` (UUID) - ID do primeiro usuário
- `user2_id` (UUID) - ID do segundo usuário
- `invitation_token` (TEXT) - Token único para convites
- `invitation_email` (TEXT) - Email do convidado
- `status` (TEXT, default: 'pending') - Status do relacionamento
- `is_avatar` (BOOLEAN, default: false) - Indica se é um avatar
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de atualização

**Status possíveis**: pending, active, rejected

#### 3. **accounts** (Contas Financeiras)
**Propósito**: Armazena contas financeiras dos usuários (individuais ou compartilhadas)

**Colunas**:
- `id` (UUID, PK) - Identificador único da conta
- `name` (TEXT, NOT NULL) - Nome da conta
- `type` (TEXT, NOT NULL) - Tipo da conta com CHECK constraint
- `bank` (TEXT) - Instituição financeira
- `balance` (NUMERIC, default: 0) - Saldo atual
- `initial_balance` (NUMERIC, default: 0) - Saldo inicial
- `ownership_type` (TEXT, NOT NULL) - Tipo de propriedade
- `color` (TEXT) - Código hexadecimal para identificação visual
- `last_transaction_date` (TIMESTAMPTZ) - Data da última transação
- `owner_id` (UUID, NOT NULL, FK) - Proprietário principal
- `partner_id` (UUID, FK) - Parceiro (para contas compartilhadas)
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de atualização

**Tipos de conta permitidos**: 'Conta Corrente', 'Poupança', 'Investimento', 'Dinheiro Físico'

#### 4. **transactions** (Transações Financeiras)
**Propósito**: Registra todas as transações financeiras dos usuários

**Colunas**:
- `id` (UUID, PK) - Identificador único da transação
- `description` (TEXT, NOT NULL) - Descrição da transação
- `amount` (NUMERIC, NOT NULL) - Valor da transação
- `transaction_date` (TIMESTAMPTZ, NOT NULL) - Data da transação
- `transaction_type` (TEXT, NOT NULL) - Tipo com CHECK constraint
- `account_id` (UUID, NOT NULL, FK) - Conta de origem
- `destination_account_id` (UUID, FK) - Conta de destino (transferências)
- `payment_method` (TEXT) - Método de pagamento com CHECK constraint
- `card_id` (UUID) - ID do cartão utilizado
- `category` (TEXT) - Categoria da transação
- `recurrence_type` (TEXT, default: 'Não recorrente') - Tipo de recorrência
- `recurrence_frequency` (TEXT) - Frequência de recorrência
- `recurrence_end_date` (TIMESTAMPTZ) - Data fim da recorrência
- `owner_id` (UUID, NOT NULL, FK) - Usuário que criou a transação
- `partner_id` (UUID, FK) - Parceiro que compartilha a transação
- `icon` (TEXT) - Ícone da transação (máximo 10 caracteres)
- `created_at` (TIMESTAMPTZ) - Data de criação
- `updated_at` (TIMESTAMPTZ) - Data de atualização

**Tipos de transação**: 'expense', 'income', 'transfer'
**Métodos de pagamento**: 'Débito', 'Crédito', 'PIX', 'Dinheiro'

### Tabelas de Controle e Temporárias

#### 5. **profiles_temp** (Perfis Temporários)
**Propósito**: Armazena dados temporários durante o processo de registro

**Colunas**:
- `temp_id` (TEXT, PK) - Identificador temporário
- `user_id` (UUID) - ID do usuário (quando disponível)
- `email` (TEXT, NOT NULL) - Email do usuário
- `name` (TEXT) - Nome do usuário
- `gender` (TEXT) - Gênero
- `account_type` (TEXT) - Tipo de conta
- `is_couple_invitation` (BOOLEAN, default: false) - Se é convite de casal
- `couple_id` (UUID) - ID do casal relacionado
- `invitation_token` (TEXT) - Token do convite
- `processed` (BOOLEAN, default: false) - Se foi processado
- `created_at` (TIMESTAMPTZ) - Data de criação

#### 6. **pending_couple_associations** (Associações de Casal Pendentes)
**Propósito**: Gerencia convites pendentes entre casais

**Colunas**:
- `id` (INTEGER, PK) - Identificador sequencial
- `user_id` (UUID, NOT NULL) - ID do usuário
- `email` (TEXT, NOT NULL) - Email do convidado
- `name` (TEXT) - Nome do convidado
- `gender` (TEXT) - Gênero
- `couple_id` (UUID, NOT NULL) - ID do casal
- `invitation_token` (TEXT) - Token do convite
- `temp_id` (TEXT) - ID temporário
- `processed` (BOOLEAN, default: false) - Se foi processado
- `created_at` (TIMESTAMPTZ) - Data de criação

#### 7. **pending_metadata_updates** (Atualizações de Metadados Pendentes)
**Propósito**: Gerencia atualizações pendentes de metadados dos usuários

**Colunas**:
- `id` (UUID, PK) - Identificador único
- `user_id` (UUID, NOT NULL) - ID do usuário
- `email` (TEXT) - Email do usuário
- `metadata` (JSONB) - Metadados a serem aplicados
- `processed` (BOOLEAN, default: false) - Se foi processado
- `created_at` (TIMESTAMPTZ) - Data de criação
- `processed_at` (TIMESTAMPTZ) - Data de processamento

#### 8. **function_logs** (Logs de Funções)
**Propósito**: Registra logs de execução de funções serverless e RPC

**Colunas**:
- `id` (UUID, PK) - Identificador único
- `function_name` (TEXT, NOT NULL) - Nome da função executada
- `input_params` (JSONB) - Parâmetros de entrada
- `result` (JSONB) - Resultado da execução
- `error_message` (TEXT) - Mensagem de erro (se houver)
- `created_at` (TIMESTAMPTZ) - Data de criação

#### 9. **pending_profiles** (Perfis Pendentes - Legado)
**Propósito**: Tabela legada para perfis pendentes

**Colunas**:
- `id` (INTEGER, PK) - Identificador sequencial
- `user_id` (UUID, NOT NULL) - ID do usuário
- `email` (TEXT, NOT NULL) - Email
- `name` (TEXT) - Nome
- `gender` (TEXT) - Gênero
- `account_type` (TEXT) - Tipo de conta
- `processed` (BOOLEAN, default: false) - Se foi processado
- `created_at` (TIMESTAMPTZ) - Data de criação

---

## 🔐 Políticas de Segurança (RLS)

### Tabela `profiles`
- **Service role can do anything**: Permite todas as operações para service_role
- **Users can view their own profile**: Usuários podem ver apenas seu próprio perfil
- **Users can update their own profile**: Usuários podem atualizar apenas seu próprio perfil

### Tabela `accounts`
- **Users can view their own accounts**: Usuários podem ver contas próprias ou compartilhadas
- **Users can insert their own accounts**: Usuários podem criar apenas suas próprias contas
- **Users can update their own accounts**: Proprietário ou parceiro podem atualizar
- **Only owner can delete accounts**: Apenas o proprietário pode deletar

### Tabela `transactions`
- **Usuários podem ver suas próprias transações**: Acesso a transações próprias, do parceiro ou de contas compartilhadas

### Tabela `couples`
- **Service role can do anything with couples**: Service role tem acesso total
- **Users can view couples they belong to**: Usuários veem apenas casais dos quais fazem parte
- **Users can create couples**: Usuários podem criar relacionamentos
- **Users can update couples they created**: Apenas o criador pode atualizar

### Tabelas Temporárias
- **Allow anonymous insert**: Permite inserções anônimas para registro
- **Service role can do anything**: Service role tem controle total
- **Admin access**: Funções administrativas têm acesso completo

---

## ⚡ Triggers e Automações

### 1. **update_account_balance** (Transações)
**Eventos**: INSERT, UPDATE, DELETE na tabela `transactions`
**Função**: Atualiza automaticamente o saldo das contas baseado nas transações
**Lógica**:
- **Despesas**: Reduz o saldo da conta
- **Receitas**: Aumenta o saldo da conta
- **Transferências**: Reduz da conta origem e aumenta na conta destino
- **Atualizações**: Reverte a transação anterior e aplica a nova
- **Exclusões**: Reverte a transação

### 2. **update_account_last_transaction_date** (Transações)
**Eventos**: INSERT, UPDATE na tabela `transactions`
**Função**: Atualiza a data da última transação na conta

### 3. **update_accounts_updated_at** (Contas)
**Eventos**: UPDATE na tabela `accounts`
**Função**: Atualiza automaticamente o campo `updated_at`

---

## 🔧 Funções Customizadas (RPC)

### Funções de Processamento de Usuários

#### 1. **update_user_metadata**
**Parâmetros**: `p_user_id` (UUID), `p_metadata` (JSONB)
**Propósito**: Atualiza metadados do usuário na tabela auth.users
**Retorno**: JSONB com status de sucesso/erro

#### 2. **update_user_password**
**Parâmetros**: `p_user_id` (UUID), `p_password` (TEXT)
**Propósito**: Atualiza senha do usuário com criptografia adequada
**Retorno**: JSONB com status de sucesso/erro

#### 3. **debug_user**
**Parâmetros**: `p_email` (TEXT)
**Propósito**: Função de depuração que retorna informações completas do usuário
**Retorno**: JSONB com dados do usuário, perfil e registros pendentes

### Funções de Processamento de Perfis

#### 4. **process_pending_profile**
**Parâmetros**: `p_user_id` (UUID)
**Propósito**: Processa perfis temporários e cria perfis permanentes
**Funcionalidades**:
- Busca registros em `profiles_temp`
- Cria ou atualiza perfil em `profiles`
- Atualiza metadados do usuário
- Marca como processado

#### 5. **process_profile_temp_by_email**
**Parâmetros**: `p_email` (TEXT)
**Propósito**: Processa perfis temporários usando email como chave
**Funcionalidades**:
- Encontra usuário pelo email
- Processa perfil temporário
- Ativa relacionamento de casal se aplicável

#### 6. **process_pending_metadata_updates**
**Parâmetros**: `p_user_id` (UUID)
**Propósito**: Aplica atualizações de metadados pendentes

### Funções de Gerenciamento de Casais

#### 7. **register_pending_couple_invitation**
**Parâmetros**: `p_user_id`, `p_email`, `p_couple_id`, `p_invitation_token`
**Propósito**: Registra convite de casal pendente

#### 8. **process_pending_items**
**Propósito**: Processa todos os itens pendentes do usuário autenticado
**Funcionalidades**:
- Processa perfis pendentes
- Ativa relacionamentos de casal

### Funções Especiais

#### 9. **create_avatar_user**
**Parâmetros**: `creator_id`, `avatar_email`, `avatar_password`
**Propósito**: Cria usuários avatar para simulação de parceiros
**Funcionalidades**:
- Cria usuário na tabela auth.users
- Configura metadados específicos para avatar
- Cria identidade de email

#### 10. **handle_new_user** (Trigger Function)
**Propósito**: Trigger que cria perfil automaticamente quando novo usuário é criado

---

## 📈 Índices de Performance

### Tabela `accounts`
- `accounts_owner_id_ownership_type_idx`: Otimiza consultas por proprietário e tipo
- `accounts_partner_id_idx`: Otimiza consultas por parceiro
- `accounts_last_transaction_date_idx`: Otimiza ordenação por data da última transação

### Tabela `transactions`
- `idx_transactions_account_id`: Otimiza consultas por conta
- `idx_transactions_owner_id`: Otimiza consultas por proprietário
- `idx_transactions_transaction_date`: Otimiza consultas e ordenação por data
- `idx_transactions_transaction_type`: Otimiza filtros por tipo de transação

### Tabela `pending_metadata_updates`
- `idx_pending_metadata_user_id`: Otimiza consultas por usuário
- `idx_pending_metadata_processed`: Otimiza filtros por status de processamento

---

## 🌐 Edge Functions

### 1. **send-couple-invitation**
**Propósito**: Envia convites por email para parceiros
**Funcionalidades**:
- Gera link de convite com token
- Envia email via Resend API
- Registra logs da operação
- Suporte a CORS para múltiplas origens

**Parâmetros**:
- `partnerEmail`: Email do convidado
- `inviterName`: Nome de quem convida
- `inviterId`: ID de quem convida
- `invitationToken`: Token único do convite
- `coupleId`: ID do relacionamento

### 2. **update-invited-user**
**Propósito**: Atualiza dados do usuário convidado após aceitação
**Funcionalidades**:
- Atualiza metadados do usuário
- Define senha automaticamente
- Confirma email automaticamente
- Cria/atualiza perfil
- Ativa relacionamento de casal

**Parâmetros**:
- `userId`: ID do usuário
- `name`: Nome completo
- `email`: Email
- `password`: Senha
- `gender`: Gênero
- `token`: Token do convite
- `inviterId`: ID de quem convidou
- `coupleId`: ID do casal

### 3. **get-project-url**
**Propósito**: Retorna URL do projeto Supabase
**Funcionalidades**:
- Endpoint simples para obter configurações
- Suporte a CORS
- Requer JWT válido

### 4. **send-email**
**Propósito**: Serviço genérico para envio de emails
**Funcionalidades**:
- Utiliza Supabase Auth para envio
- Suporte a HTML
- Logs de operação

### 5. **confirm-avatar-email**
**Propósito**: Confirma email de usuários avatar automaticamente
**Funcionalidades**:
- Confirma email sem necessidade de verificação
- Específico para usuários avatar
- Requer JWT válido

---

## 🔄 Migrações Aplicadas

### Migrações Iniciais (2025-05-16)
1. **create_initial_tables**: Criação das tabelas principais
2. **add_rls_policies**: Implementação das políticas de segurança
3. **create_rpc_functions**: Criação das funções RPC
4. **allow_anonymous_registration**: Permissões para registro anônimo

### Migrações de Metadados (2025-05-18)
5. **create_update_user_metadata_function**: Função para atualizar metadados
6. **improve_update_user_metadata**: Melhorias na função de metadados
7. **create_function_logs_table**: Tabela de logs de funções
8. **improve_process_pending_metadata**: Melhorias no processamento
9. **create_update_user_password**: Função para atualizar senhas
10. **create_function_logs_view**: View para logs
11. **create_process_pending_profile**: Processamento de perfis pendentes
12. **create_debug_user_function**: Função de depuração
13. **ensure_profiles_updated_at**: Garantir campo updated_at
14. **create_process_profile_temp_by_email_function**: Processamento por email
15. **fix_process_profile_temp_by_email_function**: Correções
16. **add_updated_at_to_couples**: Campo updated_at em couples
17. **update_function_logs_view**: Atualização da view de logs
18. **add_profile_picture_url_column**: Coluna para foto de perfil

### Migrações de Avatar (2025-05-22)
19. **add_is_avatar_to_couples**: Campo para identificar avatars
20. **add_avatar_password_to_couples**: Senha para avatars (removido depois)
21. **update_couples_status_for_avatar**: Status específico para avatars
22. **remove_avatar_password_from_couples**: Remoção da senha de avatars
23. **update_account_type_for_avatar**: Tipo de conta para avatars
24. **create_admin_role_for_avatar_creation**: Role administrativo
25. **fix_create_avatar_user_function**: Correções na função de avatar
26. **grant_permissions_to_avatar_function**: Permissões para avatars

### Migrações Financeiras (2025-05-23)
27. **create_accounts_table**: Criação da tabela de contas
28. **create_transactions_table**: Criação da tabela de transações
29. **add_icon_column_to_transactions**: Coluna de ícone para transações

### Migrações de Limpeza (2025-05-24)
30. **clean_user_data**: Limpeza de dados de usuário
31. **clean_auth_users**: Limpeza de usuários de autenticação

---

## 🔌 Extensões Instaladas

### Extensões Ativas
- **pg_graphql** (1.5.11): Suporte a GraphQL
- **pgcrypto** (1.3): Funções criptográficas
- **pg_stat_statements** (1.10): Estatísticas de consultas
- **pgjwt** (0.2.0): API de JSON Web Token
- **uuid-ossp** (1.1): Geração de UUIDs
- **supabase_vault** (0.3.1): Extensão do Supabase Vault
- **plpgsql** (1.0): Linguagem procedural PL/pgSQL

### Extensões Disponíveis (não instaladas)
- **postgis**: Tipos e funções espaciais
- **timescaledb**: Dados de série temporal
- **vector**: Tipo de dados vetorial
- **pg_cron**: Agendador de tarefas
- **pgtap**: Testes unitários
- **wrappers**: Foreign data wrappers

---

## 📊 Schemas do Banco

### Schema `public`
- Contém todas as tabelas de aplicação
- 9 tabelas principais
- Políticas RLS ativas
- Funções customizadas

### Schema `auth`
- Gerenciado pelo Supabase
- Tabelas de autenticação e autorização
- Usuários, sessões, identidades
- MFA e SSO (não utilizados atualmente)

### Schema `storage`
- Sistema de armazenamento do Supabase
- Buckets e objetos
- Uploads multipart
- 1 bucket configurado

### Schema `extensions`
- Extensões instaladas
- Funções criptográficas
- Estatísticas de performance

---

## 🚀 Análise de Performance e Otimizações

### Pontos Fortes
1. **Índices bem planejados**: Cobertura adequada para consultas frequentes
2. **Triggers eficientes**: Atualização automática de saldos e datas
3. **RLS bem estruturado**: Segurança granular por usuário/casal
4. **Funções otimizadas**: Processamento em lote de operações complexas
5. **Logs abrangentes**: Rastreabilidade completa de operações

### Áreas de Melhoria
1. **Particionamento**: Considerar particionamento da tabela `transactions` por data
2. **Arquivamento**: Implementar arquivamento de dados antigos
3. **Cache**: Implementar cache para consultas de saldo frequentes
4. **Monitoramento**: Adicionar métricas de performance customizadas

### Recomendações de Segurança
1. **Auditoria**: Implementar logs de auditoria para operações sensíveis
2. **Backup**: Configurar backups automáticos regulares
3. **Criptografia**: Considerar criptografia adicional para dados sensíveis
4. **Rate Limiting**: Implementar limitação de taxa para Edge Functions

---

## 📋 Resumo Executivo

O banco de dados MyFinlove apresenta uma arquitetura robusta e bem estruturada para um aplicativo de gerenciamento financeiro para casais. A implementação utiliza efetivamente os recursos do Supabase, incluindo:

- **Segurança**: RLS bem implementado com políticas granulares
- **Performance**: Índices estratégicos e triggers otimizados
- **Escalabilidade**: Estrutura preparada para crescimento
- **Manutenibilidade**: Funções bem documentadas e logs abrangentes
- **Funcionalidade**: Sistema completo de convites, perfis e transações

O sistema está preparado para produção com monitoramento adequado e práticas de segurança implementadas. As Edge Functions fornecem uma camada de serviços robusta para operações complexas como envio de emails e processamento de convites. 