# Documentação - Elemento de Categoria Personalizada

## Visão Geral
Este documento analisa o componente de formulário para criação de categorias personalizadas presente na página `/dashboard/registro`. O elemento permite aos usuários criar categorias customizadas com ícones personalizáveis para classificar suas transações financeiras.

## Estrutura do Elemento

### Container Principal
```tsx
<div className="mt-2 space-y-2">
  {/* Formulário de entrada */}
  {/* Seletor de emojis */}
</div>
```

### Formulário de Entrada
O formulário principal possui a seguinte estrutura:

```tsx
<div className={`flex relative rounded-xl overflow-hidden ${
  formData.tipo === 'despesa' ? 'bg-red-50 border border-red-200' : 
  formData.tipo === 'receita' ? 'bg-green-50 border border-green-200' :
  'bg-white border border-gray-200'
}`}>
  {/* Botão de emoji */}
  {/* Campo de entrada */}
  {/* Botão adicionar */}
  {/* Botão fechar */}
</div>
```

## Análise Visual Detalhada

### 1. Design Responsivo e Layout
- **Container**: `mt-2 space-y-2` - Margem superior e espaçamento vertical entre elementos
- **Formato**: `rounded-xl overflow-hidden` - Bordas arredondadas grandes e conteúdo cortado
- **Layout**: `flex relative` - Flexbox horizontal com posicionamento relativo

### 2. Sistema de Cores Dinâmico
O elemento adapta suas cores baseado no tipo de transação:

#### Despesas (Vermelho)
- **Fundo**: `bg-red-50` (vermelho muito claro)
- **Borda**: `border-red-200` (vermelho claro)
- **Focus**: `focus:ring-red-400` (vermelho médio)
- **Botão**: `bg-red-500 hover:bg-red-600` (vermelho sólido com hover escuro)

#### Receitas (Verde)
- **Fundo**: `bg-green-50` (verde muito claro)
- **Borda**: `border-green-200` (verde claro)
- **Focus**: `focus:ring-green-400` (verde médio)
- **Botão**: `bg-green-500 hover:bg-green-600` (verde sólido com hover escuro)

#### Transferências (Neutro)
- **Fundo**: `bg-white` (branco)
- **Borda**: `border-gray-200` (cinza claro)
- **Focus**: `focus:ring-[#EE6C4D]` (laranja tema do app)
- **Botão**: `bg-[#EE6C4D] hover:bg-[#e85c3a]` (laranja com hover escuro)

### 3. Componentes Individuais

#### A. Botão Seletor de Emoji
```tsx
<div 
  onClick={() => setShowEmojiSelector(!showEmojiSelector)}
  className="flex items-center justify-center w-12 cursor-pointer bg-white border-r border-gray-200"
>
  <span className="text-xl">{selectedEmoji}</span>
</div>
```

**Características:**
- **Dimensões**: `w-12` (48px de largura)
- **Alinhamento**: `flex items-center justify-center` (centralizado)
- **Interação**: `cursor-pointer` (cursor de mão)
- **Separação**: `border-r border-gray-200` (borda direita cinza)
- **Fundo**: `bg-white` (sempre branco, independente do tipo)
- **Emoji**: `text-xl` (tamanho grande - 20px)

#### B. Campo de Entrada de Texto
```tsx
<input
  type="text"
  placeholder="Nome da nova categoria"
  value={novaCategoriaNome}
  onChange={(e) => setNovaCategoriaNome(e.target.value)}
  className={`flex-1 min-w-0 px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
    formData.tipo === 'despesa' ? 'bg-red-50 focus:ring-red-400' : 
    formData.tipo === 'receita' ? 'bg-green-50 focus:ring-green-400' :
    'bg-white focus:ring-[#EE6C4D]'
  }`}
/>
```

**Características:**
- **Expansão**: `flex-1 min-w-0` (ocupa espaço restante, largura mínima zero)
- **Padding**: `px-3 py-2` (12px horizontal, 8px vertical)
- **Texto**: `text-sm` (14px)
- **Focus**: `focus:outline-none focus:ring-2` (remove outline padrão, adiciona anel colorido)
- **Placeholder**: "Nome da nova categoria"

#### C. Botão Adicionar
```tsx
<button
  type="button"
  onClick={handleAdicionarCategoria}
  className={`px-4 py-2 text-sm font-medium text-white ${
    formData.tipo === 'despesa' ? 'bg-red-500 hover:bg-red-600' : 
    formData.tipo === 'receita' ? 'bg-green-500 hover:bg-green-600' :
    'bg-[#EE6C4D] hover:bg-[#e85c3a]'
  }`}
>
  Adicionar
</button>
```

**Características:**
- **Padding**: `px-4 py-2` (16px horizontal, 8px vertical)
- **Texto**: `text-sm font-medium text-white` (14px, peso médio, branco)
- **Cores**: Dinâmicas baseadas no tipo de transação
- **Hover**: Escurece a cor de fundo

#### D. Botão Fechar (X)
```tsx
<button
  type="button"
  onClick={() => {
    setMostrarCampoNovaCategoria(false);
    setNovaCategoriaNome('');
    setSelectedEmoji('📝');
  }}
  className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
>
  <X className="h-4 w-4" />
</button>
```

**Características:**
- **Padding**: `p-2` (8px em todos os lados)
- **Cores**: Cinza com suporte a modo escuro
- **Ícone**: X do Lucide React (16x16px)
- **Hover**: Escurece o texto
- **Função**: Limpa estados e fecha o formulário

### 4. Seletor de Emojis
```tsx
{showEmojiSelector && (
  <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-10">
    <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
      Selecione um ícone
    </div>
    <div className="grid grid-cols-7 gap-2">
      {emojis.map((emoji, index) => (
        <button
          key={index}
          type="button"
          onClick={() => {
            setSelectedEmoji(emoji);
            setShowEmojiSelector(false);
          }}
          className={`p-2 text-xl rounded-lg hover:bg-gray-100 ${
            selectedEmoji === emoji ? 'bg-gray-200' : ''
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  </div>
)}
```

**Características:**
- **Posicionamento**: `z-10` (fica acima de outros elementos)
- **Layout**: `grid grid-cols-7 gap-2` (grade de 7 colunas com espaçamento)
- **Sombra**: `shadow-lg` (sombra grande para destaque)
- **Modo Escuro**: Suporte completo com `dark:` prefixes
- **Interação**: Hover e seleção com destaque visual

## Análise Funcional

### Estados Relacionados
```tsx
// Controle de visibilidade
const [mostrarCampoNovaCategoria, setMostrarCampoNovaCategoria] = useState(false);

// Dados do formulário
const [novaCategoriaNome, setNovaCategoriaNome] = useState('');
const [selectedEmoji, setSelectedEmoji] = useState('📝');
const [showEmojiSelector, setShowEmojiSelector] = useState(false);

// Lista de categorias personalizadas
const [categoriasPersonalizadas, setCategoriasPersonalizadas] = useState<Array<{ 
  id: string; 
  nome: string; 
  tipo: string; 
  icone?: string; 
  cor?: string 
}>>([]);
```

### Emojis Disponíveis
```tsx
const emojis = [
  '📝', '🍽️', '🏠', '🚗', '🏥', '🎭', '💰', 
  '🛒', '✈️', '📱', '📚', '🎁', '📊', '👕'
];
```

**Categorização dos Emojis:**
- **📝** - Padrão/Outros
- **🍽️** - Alimentação
- **🏠** - Moradia/Casa
- **🚗** - Transporte
- **🏥** - Saúde
- **🎭** - Entretenimento
- **💰** - Finanças/Investimentos
- **🛒** - Compras
- **✈️** - Viagens
- **📱** - Tecnologia
- **📚** - Educação
- **🎁** - Presentes
- **📊** - Relatórios/Análises
- **👕** - Vestuário

### Função Principal - handleAdicionarCategoria
```tsx
const handleAdicionarCategoria = async () => {
  if (!novaCategoriaNome.trim()) return;
  
  try {
    // 1. Verificar autenticação
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user?.id) throw new Error('Usuário não autenticado');

    // 2. Inserir no banco Supabase
    const { data, error } = await supabase
      .from('user_categories')
      .insert([{
        user_id: userData.user.id,
        nome: novaCategoriaNome.trim(),
        tipo: formData.tipo,
        icone: selectedEmoji,
        cor: formData.tipo === 'despesa' ? '#FF5252' : '#9AFFCB',
        created_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    
    // 3. Atualizar estado local
    if (data && data.length > 0) {
      const novaCategoria = {
        id: String(data[0].id),
        nome: String(data[0].nome),
        tipo: String(data[0].tipo),
        icone: String(data[0].icone || selectedEmoji),
        cor: String(data[0].cor)
      };
      
      setCategoriasPersonalizadas(prev => [...prev, novaCategoria]);
      setFormData(prev => ({ ...prev, categoria: novaCategoriaNome.trim() }));
      
      // 4. Limpar formulário
      setNovaCategoriaNome('');
      setSelectedEmoji('📝');
      setMostrarCampoNovaCategoria(false);
    }
  } catch (error) {
    console.error('Erro ao adicionar categoria:', error);
  }
};
```

#### Lógica de Cores Automáticas
- **Despesas**: `#FF5252` (vermelho)
- **Receitas**: `#9AFFCB` (verde claro)

### Fluxo de Interação

1. **Ativação**: Usuário clica em "Adicionar Nova Categoria"
2. **Exibição**: `setMostrarCampoNovaCategoria(true)` mostra o formulário
3. **Seleção de Emoji**: Clique no botão de emoji abre o seletor
4. **Escolha do Emoji**: Clique em emoji define `selectedEmoji` e fecha seletor
5. **Digitação**: Usuário digita nome da categoria
6. **Submissão**: Clique em "Adicionar" executa `handleAdicionarCategoria`
7. **Validação**: Verifica se há nome e se usuário está autenticado
8. **Persistência**: Salva no Supabase com tipo, emoji e cor automática
9. **Atualização**: Adiciona à lista local e seleciona no formulário
10. **Limpeza**: Reseta estados e esconde formulário

### Tratamento de Erros
- **Validação**: Nome vazio não permite submissão
- **Autenticação**: Verifica se usuário está logado
- **Banco**: Try-catch para erros do Supabase
- **Console**: Logs de erro para debugging

## Análise de UX/UI

### Pontos Fortes
1. **Feedback Visual Imediato**: Cores mudam baseadas no tipo de transação
2. **Microfeedback**: Hovers, focus states bem definidos
3. **Acessibilidade**: Suporte a modo escuro
4. **Usabilidade**: Ícones intuitivos e fácil seleção
5. **Consistência**: Segue padrão visual do app

### Aspectos de Melhoria
1. **Validação em Tempo Real**: Poderia mostrar erros de validação
2. **Loading State**: Não há indicador visual durante salvamento
3. **Toast/Feedback**: Não há confirmação visual de sucesso
4. **Limite de Caracteres**: Sem validação de tamanho máximo
5. **Duplicatas**: Não verifica se categoria já existe

## Prompt para Recriar o Elemento

```
Crie um componente React de formulário para adicionar categorias personalizadas com as seguintes especificações:

**Layout:**
- Container flex horizontal com bordas arredondadas (rounded-xl)
- Cores dinâmicas: fundo vermelho claro para despesas, verde claro para receitas, branco para transferências
- Bordas correspondentes às cores de fundo

**Elementos:**
1. Botão seletor de emoji (48px largura, centralizado, fundo branco sempre)
2. Campo de entrada de texto (flex-1, placeholder "Nome da nova categoria")
3. Botão "Adicionar" (cores dinâmicas baseadas no tipo)
4. Botão fechar com ícone X (cinza, suporte modo escuro)

**Seletor de Emojis:**
- Modal dropdown com grade 7 colunas
- 14 emojis: 📝 🍽️ 🏠 🚗 🏥 🎭 💰 🛒 ✈️ 📱 📚 🎁 📊 👕
- Fundo branco/cinza-800 (modo escuro), shadow-lg, z-10
- Botões hover com bg-gray-100, selecionado com bg-gray-200

**Estados React:**
- mostrarFormulario (boolean)
- nomeCategoria (string)
- emojiSelecionado (string, padrão '📝')
- mostrarSeletorEmoji (boolean)
- tipo ('despesa'|'receita'|'transferencia')

**Função de Salvar:**
- Validar nome não vazio
- Salvar no Supabase tabela 'user_categories'
- Campos: user_id, nome, tipo, icone, cor (automática), created_at
- Cor automática: #FF5252 (despesa), #9AFFCB (receita)
- Atualizar estado local e limpar formulário

**Estilo:**
- Tailwind CSS
- Suporte modo escuro com prefixo 'dark:'
- Focus ring colorido baseado no tipo
- Transições suaves nos hovers
- Texto sm (14px), padding px-3 py-2
- Container com espaçamento mt-2 space-y-2

**Integrações:**
- Lucide React para ícone X
```

## Conclusão

Este elemento representa uma solução elegante e funcional para criação de categorias personalizadas, com atenção especial ao feedback visual e experiência do usuário. O design responsivo, sistema de cores dinâmico e integração fluida com o banco de dados fazem dele um componente bem estruturado dentro do ecossistema.

A implementação demonstra boas práticas de React com hooks, TypeScript para tipagem segura, e Tailwind CSS para estilização eficiente. O elemento é reutilizável e aparece tanto no formulário principal quanto no modal de edição, mantendo consistência visual e funcional em todo o aplicativo. 
