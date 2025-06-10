# Documentação da Feature de Contas (Accounts) - MyFinlove

## Visão Geral

A tela de Contas no aplicativo MyFinlove permite aos usuários visualizar, gerenciar e interagir com todas as suas contas financeiras, sejam elas individuais ou compartilhadas com o parceiro. Esta feature facilita o controle financeiro do casal, permitindo uma melhor organização e acompanhamento das finanças.

## Funcionalidades Principais

### 1. Visualização de Contas
- **Segmentação por Proprietário**: Contas são organizadas em três categorias - Compartilhadas, Maria (pessoa 1) e João (pessoa 2)
- **Resumo de Saldo Total**: Exibição do saldo total consolidado das contas na categoria selecionada
- **Lista de Contas**: Exibição detalhada de cada conta, incluindo nome, tipo, banco, saldo e data da última transação

### 2. Gerenciamento de Contas
- **Adição de Nova Conta**: Interface para criação de contas com os seguintes campos:
  - Nome da conta
  - Tipo de conta (Conta Corrente, Poupança, Investimento, Dinheiro Físico)
  - Banco (opcional)
  - Saldo inicial
  - Proprietário (Maria, João ou Compartilhada)
- **Ações Rápidas**: 
  - Depositar: Adicionar fundos a uma conta existente
  - Poupar: Transferir valores para contas de poupança
  - Compartilhar: Compartilhar acesso a uma conta com o parceiro

### 3. Detalhes da Conta
- **Visualização Detalhada**: Ao selecionar uma conta, o usuário pode visualizar:
  - Informações gerais da conta (tipo, banco, proprietário)
  - Saldo atual e receitas/despesas do mês
  - Histórico de transações recentes
  - Gráfico de débito e crédito dos últimos 7 dias
  - Gastos por pessoa (em contas compartilhadas)

## Interface do Usuário

### Tela Principal
1. **Cabeçalho com Degradê**: 
   - Exibe o título "Contas"
   - Mostra o saldo total das contas na categoria selecionada
   - Indica o número de contas e a categoria atual

2. **Seletor de Categorias**:
   - Tabs para alternar entre "Compartilhadas", "Maria" e "João"
   - Exibição de avatar para as categorias de pessoas individuais

3. **Lista de Contas**:
   - Cards para cada conta exibindo:
     - Ícone colorido representando o tipo de conta
     - Nome da conta e tipo/banco
     - Saldo atual
     - Data da última transação

4. **Seção de Ações Rápidas**:
   - Botões para: Nova Conta, Depositar, Poupar e Compartilhar
   - Interface simplificada para acesso rápido às funcionalidades mais utilizadas

### Modais

1. **Modal de Nova Conta**:
   - Formulário para inserção de dados da nova conta
   - Seletor de tipo de conta e proprietário
   - Botão de confirmação para criação

2. **Modal de Depósito**:
   - Seletor de conta de destino
   - Campo para valor do depósito
   - Botão de confirmação

3. **Modal de Poupança**:
   - Campo para valor a ser poupado
   - Campo opcional para meta de poupança
   - Botão de confirmação

4. **Modal de Compartilhamento**:
   - Seletor de conta a ser compartilhada
   - Seletor de pessoa para compartilhamento
   - Botão de confirmação

5. **Modal de Detalhes da Conta**:
   - Cabeçalho com informações da conta
   - Seção de resumo financeiro
   - Lista de transações recentes
   - Gráfico de débito e crédito
   - Análise de gastos por pessoa (em contas compartilhadas)

## Fluxos de Usuário

### Adicionar Nova Conta
1. Usuário acessa a tela de Contas
2. Toca no botão "Adicionar Conta" ou na ação rápida "Nova Conta"
3. Preenche os dados solicitados no formulário
4. Confirma a criação da conta
5. A nova conta é adicionada à lista na categoria apropriada

### Visualizar Detalhes da Conta
1. Usuário acessa a tela de Contas
2. Seleciona uma conta da lista
3. Visualiza informações detalhadas no modal de detalhes
4. Pode navegar entre diferentes seções de informação dentro do modal
5. Fecha o modal para voltar à lista de contas

### Realizar Depósito
1. Usuário acessa a tela de Contas
2. Toca na ação rápida "Depositar"
3. Seleciona a conta de destino
4. Insere o valor do depósito
5. Confirma a operação
6. O saldo da conta é atualizado automaticamente

## Dados e Estados

A tela gerencia os seguintes estados principais:
- **activeTab**: Controla qual categoria de contas está sendo exibida (Compartilhadas, Maria, João)
- **selectedAccount**: Armazena dados da conta selecionada para visualização detalhada
- **modalVisibility**: Controla a visibilidade dos diferentes modais (nova conta, depósito, poupança, compartilhamento)
- **formData**: Armazena temporariamente os dados inseridos nos formulários dos modais

## Integração com Outras Features

- **Dashboard**: As informações de saldo total e transações recentes são refletidas no dashboard do aplicativo
- **Transações**: Movimentações financeiras registradas nas contas aparecem no histórico de transações
- **Planejamento**: As metas de poupança e orçamentos estão vinculados às contas configuradas

## Considerações Técnicas

- A interface utiliza componentes de UI como LinearGradient para criar o cabeçalho com degradê
- Os gráficos de débito e crédito são construídos com componentes personalizados
- Todos os valores monetários são formatados de acordo com o padrão brasileiro (R$)
- Os modais e navegação utilizam componentes nativos do React Native
- A estilização segue o design system do aplicativo, com cores e tipografia consistentes 