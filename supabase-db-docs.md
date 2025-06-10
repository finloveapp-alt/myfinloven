# Documentação do Banco de Dados - Finlove (Supabase)

## Tabelas principais (schema 'public')

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

## Função SQL

**handle_new_user**: Função que é acionada quando um novo usuário é criado. Ela insere automaticamente os dados do usuário na tabela profiles, extraindo informações dos metadados.

## Observações
- Atualmente não há dados nas tabelas (profiles tem contagem 0)
- O sistema parece ser um gerenciador financeiro para casais, onde os usuários podem registrar transações individuais ou compartilhadas

A arquitetura sugere um aplicativo para casais gerenciarem finanças conjuntas, com sistema de convites para conectar parceiros e rastreamento de transações financeiras. 