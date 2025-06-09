# 📱 MyFinlove - Documentação Completa do Projeto

## 📋 Visão Geral

MyFinlove é um aplicativo móvel de gerenciamento financeiro desenvolvido especificamente para casais. O app permite que parceiros gerenciem suas finanças de forma colaborativa e transparente, com funcionalidades para transações individuais e compartilhadas.

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React Native** `^0.76.9` - Framework principal para desenvolvimento mobile
- **Expo** `~52.0.42` - Plataforma de desenvolvimento e deploy
- **Expo Router** `~4.0.20` - Sistema de navegação baseado em arquivos
- **TypeScript** `^5.3.3` - Linguagem de programação tipada

### UI/UX
- **React Native Paper** `^5.13.5` - Biblioteca de componentes Material Design
- **Expo Linear Gradient** `^14.0.2` - Gradientes lineares
- **Expo Blur** `^14.0.3` - Efeitos de blur
- **Lucide React Native** `^0.303.0` - Ícones modernos
- **@expo-google-fonts/poppins** `^0.2.3` - Fonte Poppins

### Backend e Autenticação
- **Supabase** `^2.39.3` - Backend as a Service (BaaS)
- **Expo Secure Store** `~14.0.1` - Armazenamento seguro local
- **@react-native-async-storage/async-storage** `^2.1.2` - Armazenamento local

### Formulários e Validação
- **Formik** `^2.4.6` - Gerenciamento de formulários
- **Yup** `^1.6.1` - Validação de esquemas

### Gráficos e Visualização
- **React Native SVG** `^14.2.0` - Suporte a SVG
- **React Native SVG Charts** `^5.4.0` - Gráficos e visualizações

### Funcionalidades Específicas
- **Credit Card Type** `^10.0.2` - Detecção de tipos de cartão de crédito
- **React Credit Cards 2** `^1.0.3` - Componentes de cartão de crédito
- **@react-native-community/datetimepicker** `^8.3.0` - Seletor de data e hora

## 📁 Estrutura do Projeto

```
myfinlove/
├── app/                          # Páginas principais (Expo Router)
│   ├── (auth)/                   # Páginas de autenticação
│   ├── (app)/                    # Páginas do aplicativo
│   ├── supabase/                 # Configurações do Supabase
│   ├── lib/                      # Bibliotecas e utilitários
│   ├── _layout.tsx               # Layout principal
│   ├── index.tsx                 # Página inicial
│   ├── convite-casal.tsx         # Página de convite para casais
│   ├── forgot-password.tsx       # Recuperação de senha
│   └── recover-password.tsx      # Redefinição de senha
├── components/                   # Componentes reutilizáveis
│   ├── BottomNavigation.tsx      # Navegação inferior
│   ├── FinloveLogo.tsx          # Logo do aplicativo
│   └── MenuModal.tsx            # Modal de menu
├── assets/                       # Recursos estáticos
├── constants/                    # Constantes do projeto
├── hooks/                        # Hooks customizados
├── lib/                         # Bibliotecas e configurações
├── utils/                       # Funções utilitárias
├── supabase/                    # Configuração local do Supabase
├── ios/                         # Configurações iOS
└── docs/                        # Documentações adicionais
```

## 🗄️ Banco de Dados (Supabase)

### Tabelas Principais

#### 1. `profiles`
Armazena informações dos usuários:
- `id` (uuid) - Identificador único
- `name` (text) - Nome do usuário
- `email` (text) - Email do usuário
- `gender` (text) - Gênero
- `account_type` (text) - Tipo de conta
- `created_at` (timestamp) - Data de criação

#### 2. `couples`
Gerencia relacionamentos entre casais:
- `id` (uuid) - Identificador único
- `user1_id` (uuid) - ID do primeiro usuário
- `user2_id` (uuid) - ID do segundo usuário
- `invitation_token` (text) - Token de convite
- `invitation_email` (text) - Email do convite
- `status` (text) - Status do relacionamento
- `created_at` (timestamp) - Data de criação

#### 3. `transactions`
Registra transações financeiras:
- `id` (uuid) - Identificador único
- `user_id` (uuid) - ID do usuário
- `couple_id` (uuid) - ID do casal
- `transaction_type` (text) - Tipo de transação
- `amount` (numeric) - Valor da transação
- `description` (text) - Descrição
- `is_shared` (boolean) - Se é compartilhada
- `created_at` (timestamp) - Data de criação

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI
- Conta no Supabase

### Passos de Instalação

1. **Clone o repositório:**
```bash
git clone [URL_DO_REPOSITORIO]
cd myfinlove
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
Crie um arquivo `.env` na raiz do projeto com:
```env
EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. **Inicie o projeto:**
```bash
npm run dev
```

## 📱 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run android` - Executa no Android
- `npm run ios` - Executa no iOS
- `npm run build:web` - Build para web
- `npm run vercel-build` - Build para Vercel
- `npm run lint` - Executa o linter

## 🌐 Deploy

### Vercel (Web)
O projeto está configurado para deploy automático na Vercel:
- Arquivo `vercel.json` configurado
- Deploy automático via GitHub

### Expo Application Services (EAS)
Para builds mobile:
- Configuração em `eas.json`
- Project ID: `353a1b05-09b7-4634-9a5c-b6404ebcdd9d`

### Netlify
Configuração alternativa disponível em `netlify.toml`

## 🔧 Configurações Importantes

### Expo Configuration (`app.json`)
- **Nome:** MyFinlove
- **Slug:** myfinlove
- **Versão:** 1.0.0
- **Bundle ID:** com.myfinlove.app
- **Orientação:** Portrait apenas
- **Tema:** Automático (claro/escuro)

### TypeScript
Configuração em `tsconfig.json` com strict mode habilitado.

## 🎨 Design System

### Cores Principais
- **Primária:** `#b687fe` (Roxo/Lilás)
- **Background Splash:** `#b687fe`

### Fontes
- **Principal:** Poppins (Google Fonts)

## 🔐 Segurança

- Autenticação via Supabase
- Armazenamento seguro com Expo Secure Store
- Tokens de convite para pareamento de casais
- Validação de formulários com Yup

## 📊 Funcionalidades Principais

1. **Autenticação de Usuários**
   - Login/Registro
   - Recuperação de senha
   - Perfis personalizados

2. **Sistema de Casais**
   - Convites via email
   - Pareamento seguro
   - Gestão de relacionamentos

3. **Gestão Financeira**
   - Transações individuais
   - Transações compartilhadas
   - Categorização
   - Visualizações gráficas

4. **Interface Moderna**
   - Material Design
   - Navegação intuitiva
   - Responsivo

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de execução de scripts no Windows:**
```powershell
Set-ExecutionPolicy RemoteSigned
```

2. **Problemas com Expo:**
```bash
npx expo install --fix
```

3. **Cache issues:**
```bash
npx expo start --clear
```

## 📝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Equipe

- **Desenvolvedor Principal:** [Nome do desenvolvedor]
- **Designer:** [Nome do designer]
- **Product Owner:** [Nome do PO]

## 📞 Suporte

Para suporte técnico ou dúvidas sobre o projeto, entre em contato através dos canais oficiais.

---

**Última atualização:** $(date)
**Versão da documentação:** 1.0.0 