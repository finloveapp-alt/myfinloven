# Análise da Tabela de Contas para o MyFinlove

## Estrutura Proposta

A tabela `accounts` precisaria armazenar todas as informações relevantes para as contas financeiras apresentadas na interface, permitindo a categorização, filtros e relacionamentos necessários. Abaixo, descrevo os campos essenciais que esta tabela deve conter:

### Campos Principais

1. **`id` (UUID/TEXT)**
   - Identificador único primário para cada conta
   - Preferencialmente UUID para maior segurança

2. **`name` (TEXT)**
   - Nome da conta (ex: "Conta Conjunta", "Poupança Casal", "Reserva Emergência")
   - Obrigatório, conforme validação no modal

3. **`type` (TEXT/ENUM)**
   - Tipo da conta, com base nas opções disponíveis no modal
   - Valores possíveis: "Conta Corrente", "Poupança", "Investimento", "Dinheiro Físico"
   - Obrigatório, conforme validação no modal

4. **`bank` (TEXT)**
   - Nome da instituição financeira
   - Opcional, conforme interface do modal

5. **`balance` (DECIMAL)**
   - Saldo atual da conta
   - Precisão de pelo menos 2 casas decimais
   - Valor inicial informado no modal de criação

6. **`initial_balance` (DECIMAL)**
   - Saldo inicial quando a conta foi criada
   - Histórico para rastreamento

7. **`ownership_type` (TEXT/ENUM)**
   - Tipo de propriedade: "individual", "compartilhada"
   - Determina a categoria da conta na interface

8. **`color` (TEXT)**
   - Código de cor em formato hexadecimal
   - Para identificação visual (gerando cores automaticamente por enquanto)

9. **`last_transaction_date` (TIMESTAMP)**
   - Data da última transação realizada na conta
   - Exibida no card da conta na interface principal

10. **`created_at` (TIMESTAMP)**
    - Data de criação da conta
    - Controle administrativo e ordenação

11. **`updated_at` (TIMESTAMP)**
    - Data da última atualização da conta
    - Controle administrativo e monitoramento

### Campos de Relacionamentos

12. **`owner_id` (UUID/TEXT - Foreign Key)**
    - Referência ao usuário principal dono da conta
    - Chave estrangeira para a tabela `profiles`
    - Obrigatório para todas as contas

13. **`partner_id` (UUID/TEXT - Foreign Key)**
    - Referência ao parceiro com quem a conta é compartilhada
    - Chave estrangeira para a tabela `profiles`
    - Opcional, preenchido apenas para contas compartilhadas
    - Pode ser NULL para contas individuais

## Índices Recomendados

Para otimizar a performance das consultas mais comuns:

1. Índice primário em `id`
2. Índice composto em (`owner_id`, `ownership_type`)
3. Índice em `partner_id` 
4. Índice em `last_transaction_date` para ordenação de contas por atividade recente

## Restrições e Validações

1. O campo `balance` deve sempre refletir o saldo real baseado nas transações vinculadas à conta
2. Restrição de exclusão para impedir a remoção de contas com transações associadas
3. Validação para garantir que contas marcadas como "compartilhadas" tenham um `partner_id` válido

## Relacionamentos com Outras Tabelas

A tabela `accounts` se relacionaria com:

1. **`profiles`**: Através de `owner_id` e `partner_id`
   - Relacionamento N:1 com usuários do sistema

2. **`transactions`**: Relacionamento 1:N
   - Cada conta pode ter múltiplas transações
   - Uma transação pertence a exatamente uma conta

3. **`couples`**: Relacionamento indireto
   - Através dos campos `owner_id` e `partner_id`
   - Para verificação de relacionamentos válidos

## Considerações para Implementação

1. **Implementação Multiusuário**: A estrutura proposta permite que cada usuário veja suas contas pessoais e compartilhadas na interface de abas.

2. **Sincronização de Saldo**: Será necessário implementar triggers ou lógica de aplicação para manter o campo `balance` sincronizado com as transações.

3. **Histórico de Alterações**: Considerar a criação de uma tabela auxiliar `account_history` para registrar mudanças importantes em contas (especialmente mudanças de saldo).

4. **Segurança**: Implementar regras de acesso para garantir que usuários só possam visualizar e modificar contas próprias ou compartilhadas.

## Consultas SQL Comuns

### Obter Todas as Contas de um Usuário (Pessoais e Compartilhadas)

```sql
SELECT * FROM accounts
WHERE owner_id = :user_id 
   OR partner_id = :user_id
ORDER BY ownership_type, last_transaction_date DESC;
```

### Obter Apenas Contas Compartilhadas de um Casal

```sql
SELECT * FROM accounts
WHERE ownership_type = 'compartilhada'
  AND ((owner_id = :user_id AND partner_id = :partner_id)
       OR (owner_id = :partner_id AND partner_id = :user_id))
ORDER BY last_transaction_date DESC;
```

### Calcular Saldo Total por Tipo de Propriedade

```sql
SELECT ownership_type, SUM(balance) as total_balance
FROM accounts
WHERE owner_id = :user_id OR partner_id = :user_id
GROUP BY ownership_type;
```

## Conclusão

Esta estrutura suportaria adequadamente as funcionalidades descritas na documentação da feature de Contas e no modal de Nova Conta, permitindo todas as operações necessárias (visualização, filtragem, criação, compartilhamento) e mantendo a integridade dos dados financeiros.

A modelagem proposta é flexível o suficiente para comportar futuras melhorias, como a personalização de cores e ícones para contas, além de possibilitar a implementação de recursos avançados como categorização automática de transações e análises de gastos por pessoa em contas compartilhadas. 