# Análise do Projeto MyFinlove

## Visão Geral
O MyFinlove é um aplicativo de gerenciamento financeiro para casais, desenvolvido com React Native e Expo. A plataforma permite que parceiros gerenciem suas finanças de forma colaborativa, registrando e compartilhando transações financeiras.

## Arquitetura Técnica

### Frontend/Mobile
- **React Native (v0.76.9)** como framework principal
- **Expo (v52.0.42)** como plataforma de desenvolvimento 
- **Expo Router (v4.0.20)** para navegação baseada em arquivos
- **TypeScript (v5.3.3)** para tipagem
- **Formik (v2.4.6)** e **Yup (v1.6.1)** para validação de formulários
- **React Native Paper (v5.13.5)** como biblioteca de componentes UI
- **React Native Reanimated (v3.16.7)** para animações

### Backend
- **Supabase (v2.39.3)** como BaaS (Backend as a Service)
- PostgreSQL para banco de dados
- Autenticação e autorização gerenciada pelo Supabase

### Estrutura do Projeto
- **/app/** - Telas e rotas usando Expo Router
  - **(app)/** - Área autenticada (dashboard, transações, etc.)
  - **(auth)/** - Páginas de autenticação (login, registro) 
- **/components/** - Componentes reutilizáveis
- **/lib/** - Configurações como Supabase
- **/hooks/** - Hooks personalizados
- **/assets/** - Recursos estáticos 

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
  - processed (BOOLEAN)

#### function_logs
- **Propósito**: Registra logs de execução de funções
- **Colunas principais**:
  - id (UUID, PK)
  - function_name (TEXT)
  - input_params (JSONB)
  - result (JSONB)
  - error_message (TEXT)
  - created_at (TIMESTAMP)

## Funcionalidades Principais

### Autenticação
- Registro de novos usuários
- Login com email/senha
- Recuperação de senha
- Confirmação de email

### Sistema de Casais
- Convite para associação de casal via email
- Fluxo de aceitação/rejeição de convites
- Visualização compartilhada de transações

### Dashboard Financeiro
- Visão geral das finanças
- Categorização de despesas
- Gráficos e análises financeiras

### Gerenciamento de Transações
- Registro de receitas e despesas
- Marcação de transações como compartilhadas ou privadas
- Histórico de transações

## Fluxos de Usuário

### Fluxo de Registro
1. Usuário se registra fornecendo dados básicos
2. Opção de convidar parceiro durante o registro
3. Email de confirmação enviado ao usuário
4. Após confirmação, acesso ao dashboard

### Fluxo de Convite de Casal
1. Usuário envia convite para parceiro
2. Convite armazenado no banco com status "pending"
3. Email com token enviado ao parceiro
4. Parceiro acessa link de convite e é direcionado para tela de aceitação
5. Após aceitar, o parceiro cria conta ou faz login
6. Relacionamento entre os usuários é estabelecido no banco de dados

### Fluxo de Gerenciamento Financeiro
1. Usuários registram transações individuais ou compartilhadas
2. Dashboard mostra visão consolidada das finanças
3. Dados compartilhados são visíveis para ambos os parceiros

## Estrutura de Navegação
- Área de autenticação: Login, Registro, Recuperação de Senha
- Área autenticada: Dashboard, Transações, Cartões, Configurações

## Observações Técnicas

### Segurança
- Tokens JWT para autenticação
- Armazenamento seguro de credenciais (Expo Secure Store)
- Políticas de RLS (Row Level Security) do Supabase

### Experiência de Usuário
- Interface adaptada por gênero (temas masculinos/femininos)
- Navegação por barra inferior
- Layout responsivo adaptado para web e mobile

### Áreas para Melhorias Potenciais
- Adicionar mais testes automatizados
- Implementar notificações push
- Expandir recursos de planejamento financeiro
- Integração com APIs bancárias

## Conclusão
O MyFinlove apresenta uma solução bem estruturada para gerenciamento financeiro focado em casais, com uma arquitetura moderna utilizando React Native, Expo e Supabase. O sistema de convites e associação entre parceiros é um diferencial importante do aplicativo, permitindo que casais compartilhem e gerenciem suas finanças de forma colaborativa. 