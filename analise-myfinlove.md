# Análise do Projeto MyFinlove

## Visão Geral
O MyFinlove é um aplicativo de gerenciamento financeiro para casais, desenvolvido com React Native e Expo. A plataforma permite que parceiros gerenciem suas finanças de forma colaborativa, registrando e compartilhando transações financeiras, contas e planejamentos.

## Arquitetura Técnica

### Frontend/Mobile
- **React Native (v0.76.9)** como framework principal
- **Expo (v52.0.42)** como plataforma de desenvolvimento 
- **Expo Router (v4.0.20)** para navegação baseada em arquivos
- **TypeScript (v5.3.3)** para tipagem
- **Formik (v2.4.6)** e **Yup (v1.6.1)** para validação de formulários
- **React Native Paper (v5.13.5)** como biblioteca de componentes UI
- **React Native Reanimated (v3.16.7)** para animações
- **Lucide React Native (v0.303.0)** para ícones
- **React Native SVG (v14.2.0)** e **React Native SVG Charts (v5.4.0)** para gráficos

### Backend
- **Supabase (v2.39.3)** como BaaS (Backend as a Service)
- PostgreSQL para banco de dados
- Autenticação e autorização gerenciada pelo Supabase
- Edge Functions para processamento serverless
- Resend para envio de emails

### Estrutura do Projeto
- **/app/** - Telas e rotas usando Expo Router
  - **(app)/** - Área autenticada (dashboard, transações, contas, etc.)
  - **(auth)/** - Páginas de autenticação (login, registro)
  - **convite-casal.tsx** - Página de aceitação de convite para casal
  - **forgot-password.tsx** e **recover-password.tsx** - Fluxo de recuperação de senha
- **/components/** - Componentes reutilizáveis (BottomNavigation, FinloveLogo)
- **/lib/** - Configurações como Supabase
- **/hooks/** - Hooks personalizados
- **/assets/** - Recursos estáticos
- **/constants/** - Constantes da aplicação
- **/utils/** - Funções utilitárias

## Modelo de Dados

### Principais Tabelas

#### profiles
- **Propósito**: Armazena informações de perfil dos usuários
- **Colunas principais**: 
  - id (UUID, PK)
  - name (TEXT)
  - email (TEXT)
  - gender (TEXT)
  - account_type (TEXT)
  - profile_picture_url (TEXT)
  - created_at, updated_at (TIMESTAMP)

#### couples
- **Propósito**: Gerencia relacionamentos entre casais
- **Colunas principais**:
  - id (UUID, PK)
  - user1_id (UUID, FK)
  - user2_id (UUID, FK)
  - invitation_token (TEXT)
  - invitation_email (TEXT)
  - status (TEXT) - 'pending', 'active', 'rejected'
  - created_at, updated_at (TIMESTAMP)
  - is_avatar (BOOLEAN) - Indica se o convite é para um avatar

#### profiles_temp
- **Propósito**: Armazena dados temporários durante o processo de registro
- **Colunas principais**:
  - temp_id (TEXT, PK)
  - user_id (UUID)
  - email (TEXT)
  - name, gender, account_type
  - is_couple_invitation (BOOLEAN)
  - couple_id (UUID)
  - invitation_token (TEXT)
  - processed (BOOLEAN)

#### pending_couple_associations
- **Propósito**: Gerencia convites pendentes entre casais
- **Colunas principais**:
  - id (INTEGER, PK)
  - user_id (UUID)
  - email (TEXT)
  - couple_id (UUID)
  - invitation_token (TEXT)
  - name, gender (TEXT)
  - temp_id (TEXT)
  - processed (BOOLEAN)
  - created_at (TIMESTAMP)

#### accounts
- **Propósito**: Armazena contas financeiras dos usuários
- **Colunas principais**:
  - id (UUID, PK)
  - name (TEXT)
  - type (TEXT) - 'Conta Corrente', 'Poupança', 'Investimento', 'Dinheiro Físico'
  - bank (TEXT)
  - balance, initial_balance (NUMERIC)
  - ownership_type (TEXT) - individual ou compartilhada
  - color (TEXT) - código hexadecimal para identificação visual
  - owner_id (UUID, FK) - referência ao perfil do proprietário
  - partner_id (UUID, FK) - referência ao perfil do parceiro (opcional)
  - created_at, updated_at (TIMESTAMP)

#### transactions
- **Propósito**: Armazena transações financeiras
- **Colunas principais**:
  - id (UUID, PK)
  - description (TEXT)
  - amount (NUMERIC)
  - transaction_date (TIMESTAMP)
  - transaction_type (TEXT) - 'expense', 'income', 'transfer'
  - account_id (UUID, FK)
  - destination_account_id (UUID, FK) - para transferências
  - payment_method (TEXT) - 'Débito', 'Crédito', 'PIX', 'Dinheiro'
  - card_id (UUID, FK)
  - category (TEXT)
  - recurrence_type, recurrence_frequency (TEXT)
  - owner_id (UUID, FK) - usuário que criou a transação
  - partner_id (UUID, FK) - parceiro que compartilha a transação (opcional)
  - icon (TEXT) - ícone para representar a transação
  - created_at, updated_at (TIMESTAMP)

#### function_logs
- **Propósito**: Registra logs de execução de funções serverless
- **Colunas principais**:
  - id (UUID, PK)
  - function_name (TEXT)
  - input_params (JSONB)
  - result (JSONB)
  - error_message (TEXT)
  - created_at (TIMESTAMP)

#### pending_metadata_updates
- **Propósito**: Gerencia atualizações pendentes de metadados dos usuários
- **Colunas principais**:
  - id (UUID, PK)
  - user_id (UUID)
  - email (TEXT)
  - metadata (JSONB)
  - processed (BOOLEAN)
  - created_at, processed_at (TIMESTAMP)

## Edge Functions

### send-couple-invitation
- **Propósito**: Envia email de convite para parceiro se juntar ao casal
- **Funcionalidades**:
  - Gera link de convite com token
  - Envia email usando Resend API
  - Registra logs da operação

### update-invited-user
- **Propósito**: Atualiza dados do usuário convidado após aceitação do convite
- **Funcionalidades**:
  - Atualiza metadados do usuário
  - Define senha e confirma email automaticamente
  - Atualiza registro de casal

### get-project-url
- **Propósito**: Retorna a URL do projeto Supabase
- **Funcionalidades**:
  - Fornece URL para configuração do cliente

### send-email
- **Propósito**: Serviço genérico para envio de emails
- **Funcionalidades**:
  - Utiliza Supabase Auth para envio de emails

### confirm-avatar-email
- **Propósito**: Confirma email de usuários avatar automaticamente
- **Funcionalidades**:
  - Marca email como confirmado sem necessidade de verificação

## Funcionalidades Principais

### Autenticação
- Registro de novos usuários
- Login com email/senha
- Recuperação de senha
- Confirmação de email

### Sistema de Casais
- Convite para associação de casal via email
- Fluxo de aceitação/rejeição de convites
- Visualização compartilhada de transações e contas
- Suporte para usuários "avatar" (simulação de parceiro)

### Gerenciamento de Contas
- Criação de contas bancárias e financeiras
- Categorização por tipo (Conta Corrente, Poupança, etc.)
- Contas individuais e compartilhadas
- Personalização com cores para identificação visual

### Dashboard Financeiro
- Visão geral das finanças
- Categorização de despesas
- Gráficos e análises financeiras
- Filtros por período

### Gerenciamento de Transações
- Registro de receitas e despesas
- Transferências entre contas
- Categorização de transações
- Transações recorrentes
- Marcação de transações como compartilhadas ou privadas
- Histórico de transações

### Planejamento Financeiro
- Definição de metas financeiras
- Acompanhamento de orçamentos
- Análise de gastos por categoria

## Fluxos de Usuário

### Fluxo de Registro
1. Usuário se registra fornecendo dados básicos
2. Opção de convidar parceiro durante o registro
3. Email de confirmação enviado ao usuário
4. Após confirmação, acesso ao dashboard

### Fluxo de Convite de Casal
1. Usuário envia convite para parceiro
2. Convite armazenado no banco com status "pending"
3. Email com token enviado ao parceiro via Edge Function
4. Parceiro acessa link de convite e é direcionado para tela de aceitação
5. Após aceitar, o parceiro cria conta ou faz login
6. Relacionamento entre os usuários é estabelecido no banco de dados

### Fluxo de Gerenciamento Financeiro
1. Usuários registram transações individuais ou compartilhadas
2. Dashboard mostra visão consolidada das finanças
3. Dados compartilhados são visíveis para ambos os parceiros
4. Possibilidade de filtrar por categorias e períodos

## Estrutura de Navegação
- Área de autenticação: Login, Registro, Recuperação de Senha
- Área autenticada:
  - Dashboard - Visão geral das finanças
  - Receitas - Gerenciamento de entradas
  - Despesas - Gerenciamento de saídas
  - Contas - Gerenciamento de contas financeiras
  - Cartões - Gerenciamento de cartões de crédito/débito
  - Planejamento - Orçamentos e metas financeiras
  - Notificações - Sistema de alertas e lembretes

## Observações Técnicas

### Segurança
- Tokens JWT para autenticação
- Armazenamento seguro de credenciais (Expo Secure Store)
- Políticas de RLS (Row Level Security) do Supabase
- Edge Functions para operações sensíveis

### Experiência de Usuário
- Interface adaptada por gênero (temas masculinos/femininos)
- Navegação por barra inferior
- Layout responsivo adaptado para web e mobile
- Suporte a temas claro e escuro

### Áreas para Melhorias Potenciais
- Implementar testes automatizados
- Adicionar notificações push
- Integração com APIs bancárias via Open Banking
- Melhorar performance de telas com grande volume de dados
- Implementar sincronização offline

## Conclusão
O MyFinlove apresenta uma solução completa para gerenciamento financeiro focado em casais, com uma arquitetura moderna utilizando React Native, Expo e Supabase. O sistema de convites e associação entre parceiros é um diferencial importante do aplicativo, permitindo que casais compartilhem e gerenciem suas finanças de forma colaborativa. A aplicação possui uma estrutura robusta de banco de dados e Edge Functions que suportam os diversos fluxos de usuário, desde a autenticação até o gerenciamento detalhado de transações financeiras. 