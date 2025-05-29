# Documentação do Menu Inferior - MyFinlove

## Visão Geral
O menu inferior do MyFinlove é um componente de navegação principal que permite aos usuários acessar as funcionalidades mais importantes do aplicativo. Ele está presente em todas as páginas do sistema e oferece acesso rápido às principais seções.

## Estrutura
O menu inferior é composto por 5 itens de navegação:

1. **Dashboard** - Página inicial/principal
2. **Menu** - Menu expandido com mais opções
3. **Adicionar** (botão central) - Ação principal para adicionar novos registros
4. **Notificações** - Acesso às notificações do sistema
5. **Cartões** - Acesso à seção de cartões

## Elementos Visuais

### Componentes
- Container principal: `div` com classe `css-g5y9jx` e várias classes de estilo React Native Web
- Itens de navegação: `div` com atributo `tabindex="0"` para permitir navegação por teclado
- Ícones: Implementados usando SVG inline
- Textos: `div` com direção automática (`dir="auto"`) e classes de estilo para texto

### Estilos
- O menu utiliza uma barra fixa na parte inferior da tela com fundo branco
- Item ativo (Dashboard): Texto e ícone na cor azul (#0073EA)
- Itens inativos: Texto e ícone na cor cinza (#999)
- Botão de adicionar: Círculo destacado no centro com ícone de "+" em branco
- Transições: Alguns itens possuem transições configuradas para efeitos visuais ao interagir

## Estado Atual
Na captura de tela analisada, o aplicativo está na página de **Dashboard**, como indicado pelo estado ativo deste item no menu (cor azul).

## Interatividade
- Cada item do menu é clicável (possui `tabindex="0"` e classe `r-lrvibr` que geralmente é usada para elementos interativos)
- O botão central de adicionar é destacado visualmente para chamar atenção como ação principal
- Os itens possuem efeitos de transição configurados para feedback visual durante interações

## Acessibilidade
- Os itens são navegáveis por teclado (tabindex="0")
- Há contraste adequado entre o texto e o fundo
- Os ícones SVG são complementados por texto descritivo

## Considerações Técnicas
- A implementação utiliza o sistema de estilo do React Native Web (prefixos r-* nas classes)
- A estrutura é responsiva e adaptável a diferentes tamanhos de tela
- O código utiliza SVG inline em vez de imagens, o que permite manipulação de cores e estilos via CSS

## Recomendações para Futuras Melhorias
1. Adicionar atributos `aria-label` ou `aria-labelledby` para melhorar a acessibilidade
2. Considerar adicionar indicadores visuais de notificações não lidas
3. Avaliar a possibilidade de personalização do menu pelo usuário
4. Implementar feedback tátil (vibração) em dispositivos móveis ao pressionar os botões

## Fluxo de Navegação
O menu inferior serve como ponto central de navegação, permitindo que o usuário acesse rapidamente as principais funcionalidades do aplicativo sem precisar voltar à tela inicial, criando uma experiência de usuário fluida e eficiente. 