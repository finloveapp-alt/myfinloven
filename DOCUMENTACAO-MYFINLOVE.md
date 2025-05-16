# Documentação do MyFinLove

## Visão Geral
MyFinLove é um aplicativo de gerenciamento financeiro para casais, desenvolvido usando React Native e Expo. A aplicação permite que casais gerenciem suas finanças de forma colaborativa, registrando transações individuais e compartilhadas.

## Tecnologias Utilizadas

### Frontend/Mobile
- **React Native** (v0.76.9) - Framework para desenvolvimento mobile
- **Expo** (v52.0.42) - Plataforma para desenvolvimento React Native
- **Expo Router** (v4.0.20) - Sistema de navegação baseado em arquivos
- **TypeScript** (v5.3.3) - Superset tipado de JavaScript
- **Formik** (v2.4.6) e **Yup** (v1.6.1) - Bibliotecas para validação de formulários
- **React Native Paper** (v5.13.5) - Biblioteca de componentes UI
- **React Native Reanimated** (v3.16.7) - Biblioteca para animações

### Backend/Autenticação
- **Supabase** (v2.39.3) - Plataforma de Backend as a Service (BaaS)
- **Expo Secure Store** (v14.0.1) - Armazenamento seguro para tokens

### Deployment
- **Vercel** - Plataforma de deploy para web
- **EAS** (v16.2.1) - Serviço de build para aplicações Expo

## Estrutura do Projeto

### Diretórios Principais
- **/app/** - Contém as telas e rotas da aplicação (usando Expo Router)
  - **(app)/** - Telas autenticadas (dashboard, despesas, receitas, etc.)
  - **(auth)/** - Telas de autenticação (login, registro)
- **/components/** - Componentes reutilizáveis
- **/lib/** - Utilitários e configurações (como Supabase)
- **/hooks/** - React hooks customizados
- **/assets/** - Imagens e outros recursos estáticos

### Sistema de Navegação
O projeto utiliza Expo Router, que implementa um sistema de navegação baseado em arquivos:
- Arquivos `_layout.tsx` definem o layout de navegação para um grupo de telas
- Arquivos regulares (como `dashboard.tsx`) definem as telas individuais
- Diretórios entre parênteses como `(app)` e `(auth)` são usados para agrupar rotas

## Banco de Dados (Supabase)

### Tabelas Principais (schema 'public')

#### 1. profiles
- Armazena informações de perfil dos usuários
- Colunas principais: id, name, email, gender, account_type

#### 2. couples
- Gerencia os relacionamentos entre casais e convites
- Colunas principais: id, user1_id, user2_id, invitation_token, status

#### 3. transactions
- Registra transações financeiras dos usuários
- Colunas principais: id, user_id, couple_id, transaction_type, amount, is_shared

### Funções SQL
- **handle_new_user**: Função acionada quando um novo usuário é criado que insere automaticamente seus dados na tabela profiles

## Funcionalidades Principais

### Autenticação
- Registro de usuários
- Login
- Recuperação de senha
- Sistema de convite para casais

### Gestão Financeira
- Dashboard com visão geral das finanças
- Registro de receitas
- Registro de despesas
- Histórico de transações
- Gestão de cartões
- Planejamento financeiro

### Funcionalidades para Casais
- Sistema de convites para pareamento
- Transações compartilhadas
- Visualização de finanças conjuntas

## Fluxos de Usuário

### Fluxo de Registro e Pareamento
1. Um usuário se registra na plataforma
2. O usuário pode convidar seu parceiro(a) por email
3. O parceiro recebe o convite e pode aceitar
4. Após aceito, o casal está pareado no sistema

### Fluxo de Transações
1. Usuários podem registrar receitas e despesas
2. Ao registrar, podem marcar como compartilhado ou individual
3. Transações compartilhadas aparecem para ambos os usuários
4. O dashboard mostra métricas consolidadas

## Estrutura de Navegação

### Área de Autenticação
- Tela de Login
- Tela de Registro
- Recuperação de Senha

### Área Autenticada
- Dashboard
- Gerenciamento de Receitas
- Gerenciamento de Despesas
- Histórico de Transações
- Planejamento Financeiro
- Cartões
- Notificações
- Configurações

## Segurança
- As credenciais do Supabase são protegidas usando variáveis de ambiente
- Tokens de autenticação são armazenados de forma segura com Expo Secure Store
- Diferentes estratégias de armazenamento para web (localStorage) e mobile (SecureStore)

## Deploy
- Web: Configurado para deploy na Vercel
- Mobile: Uso do EAS para builds de Android e iOS

## Próximos Passos e Desenvolvimento Futuro
- Implementação de notificações push
- Melhorias no sistema de compartilhamento entre casais
- Relatórios financeiros avançados
- Integração com APIs bancárias

---

Documentação criada em [DATA], representando o estado atual do projeto MyFinLove. 