# My Finlove

Um aplicativo de gerenciamento financeiro pessoal desenvolvido com React Native e Expo.

## Funcionalidades

- Login e autenticação com Supabase
- Dashboard para visualização de transações
- Navegação entre transações
- Funcionalidade de logout

## Tecnologias Utilizadas

- React Native
- Expo
- Supabase para autenticação
- Expo Router para navegação

## Instalação

1. Clone o repositório:
```
git clone https://github.com/LumiaIA/Finlove.git
```

2. Instale as dependências:
```
cd Finlove
npm install
```

3. Crie um arquivo `.env` baseado no `.env.example` e adicione suas credenciais do Supabase.

4. Inicie o aplicativo:
```
npx expo start
```

## Deploy

Este aplicativo está configurado para deploy na Vercel usando integração contínua. Cada push para a branch main aciona automaticamente um novo deploy.

### Configuração da Vercel

O arquivo `vercel.json` na raiz do projeto configura o ambiente de deploy para garantir que as rotas funcionem corretamente na Vercel.

# Documentação do Banco de Dados - Finlove

Este documento contém informações sobre a estrutura do banco de dados Supabase utilizado no projeto Finlove.

## Tabelas Principais (schema 'public')

### 1. profiles
- **Colunas**: 
  - id (uuid) - NOT NULL
  - name (text)
  - email (text)
  - created_at (timestamp with time zone)
  - gender (text)
  - account_type (text)
- **Descrição**: Armazena informações de perfil dos usuários

### 2. couples
- **Colunas**:
  - id (uuid) - NOT NULL
  - user1_id (uuid)
  - user2_id (uuid)
  - invitation_token (text)
  - invitation_email (text)
  - status (text)
  - created_at (timestamp with time zone)
- **Descrição**: Gerencia os relacionamentos entre casais e convites

### 3. transactions
- **Colunas**:
  - id (uuid) - NOT NULL
  - user_id (uuid) - NOT NULL
  - couple_id (uuid)
  - transaction_type (text)
  - amount (numeric)
  - description (text)
  - is_shared (boolean)
  - created_at (timestamp with time zone)
- **Descrição**: Registra transações financeiras dos usuários
- **Relações**: Possui chave estrangeira para couples (couple_id → couples.id)

## Funções SQL

**handle_new_user**: Função que é acionada quando um novo usuário é criado. Ela insere automaticamente os dados do usuário na tabela profiles, extraindo informações dos metadados do usuário.

## Lógica do Sistema

O sistema aparenta ser um gerenciador financeiro para casais, com as seguintes funcionalidades:

1. Registro de usuários com perfis individuais
2. Sistema de pareamento de casais através de convites
3. Registro de transações financeiras (individuais ou compartilhadas)
4. Gerenciamento de finanças conjuntas

A arquitetura sugere um aplicativo focado em ajudar casais a gerenciarem suas finanças de forma colaborativa e transparente.
