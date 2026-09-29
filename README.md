# 🌍 World Explorer

> Aplicação React para explorar dados de países ao redor do mundo, consumindo a API REST Countries.

---

## 📋 Sumário

- [Problema](#-problema)
- [Solução](#-solução)
- [API Utilizada](#-api-utilizada)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Como Executar](#-como-executar)
- [Testes](#-testes)
- [Decisões Técnicas](#-decisões-técnicas)
- [Deploy](#-deploy)

---

## 🎯 Problema

Identificada a dificuldade de usuários em acessar e comparar informações sobre países de forma centralizada. Dados como população, área, idiomas, moedas e países vizinhos estão dispersos em múltiplas fontes, tornando a consulta lenta e fragmentada.

**Usuário alvo:** estudantes, viajantes e profissionais que precisam de acesso rápido a informações geopolíticas.

---

## 💡 Solução

Aplicação web responsiva que:
- Busca dados de todos os países via API pública
- Permite busca por nome (case-insensitive)
- Oferece filtro por região e múltiplas opções de ordenação
- Exibe detalhes completos em modal interativo
- Permite salvar favoritos com persistência local
- Suporta modo claro/escuro com preferência do sistema

---

## 🌐 API Utilizada

**Countries.dev API** — https://countries.dev

|| Critério | Avaliação |
|----------|-----------|
|| Autenticação | Não requer API key |
|| Dados disponíveis | Nome, bandeira, capital, região, população, área, idiomas, moedas, fronteiras, coordenadas |
|| Rate limit | Limite generoso, uso razoável |
|| Formato | JSON |
|| CORS | Habilitado (`Access-Control-Allow-Origin: *`) |

**Por que esta API:**
- Gratuita e sem configuração complexa
- Sem necessidade de API key
- CORS habilitado para chamadas diretas do navegador
- Substituta direta do antigo REST Countries v3.1 (agora descontinuado)
- Dados bem estruturados e resposta rápida

---

## ✨ Funcionalidades

### Busca e Filtros
- Busca por nome do país (tempo real, case-insensitive)
- Filtro por região (Africa, Americas, Asia, Europe, Oceania)
- Ordenação por nome, população ou área (crescente/decrescente)
- Contador de resultados atualizado dinamicamente

### Visualização de Dados
- Grid responsivo de cards com bandeira, nome, capital, região e população
- Modal de detalhes com informações completas
- Navegação entre países vizinhos no modal
- Formatação de números no padrão brasileiro

### Favoritos
- Adicionar/remover países dos favoritos
- Persistência via localStorage
- Visualização dedicada de favoritos
- Limite de 50 favoritos (validação)

### Tema
- Toggle manual claro/escuro
- Detecção automática da preferência do sistema
- Persistência da escolha do usuário

### Estados da Interface
- Loading: spinner durante carregamento inicial
- Erro: mensagem amigável com botão de retry
- Vazio: mensagem contextual (sem resultados / sem favoritos)

---

## 🏗️ Arquitetura

```
src/
├── App.tsx                    # Componente raiz — orquestra estado global
├── main.tsx                   # Entry point do React
├── index.css                  # Estilos globais + config Tailwind
│
├── components/                # Componentes de UI reutilizáveis
│   ├── Header.tsx             # Cabeçalho com busca, favoritos e tema
│   ├── FilterBar.tsx          # Filtros de região e ordenação
│   ├── CountryCard.tsx        # Card individual de país
│   ├── CountryGrid.tsx        # Grid responsivo de cards
│   ├── CountryDetail.tsx      # Modal de detalhes do país
│   ├── LoadingState.tsx       # Estado de carregamento
│   ├── ErrorState.tsx         # Estado de erro com retry
│   └── Footer.tsx             # Rodapé com créditos
│
├── hooks/                     # Hooks customizados (lógica de negócio)
│   ├── useCountries.ts        # Busca, filtro e ordenação de dados
│   ├── useFavorites.ts        # Gerenciamento de favoritos + localStorage
│   └── useTheme.ts            # Gerenciamento de tema claro/escuro
│
├── types/                     # Tipos TypeScript
│   └── country.ts             # Interfaces da API REST Countries
│
├── utils/                     # Utilitários
│   └── api.ts                 # Funções de comunicação com a API
│
└── test/                      # Testes automatizados
    ├── setup.ts               # Configuração do ambiente de teste
    ├── hooks/                 # Testes dos hooks
    ├── components/            # Testes dos componentes
    └── utils/                 # Testes das funções utilitárias
```

### Separação de Responsabilidades

| Camada | Responsabilidade | Exemplo |
|--------|-----------------|---------|
| **App** | Orquestração de estado, conexão entre hooks e UI | Gerencia modal, view de favoritos |
| **Hooks** | Lógica de negócio, side effects | `useCountries` busca e filtra dados |
| **Components** | Renderização, interação visual | `CountryCard` exibe dados de um país |
| **Utils** | Comunicação externa, formatação | `api.ts` faz chamadas HTTP |
| **Types** | Contrato de dados, type safety | `Country` define estrutura da API |

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Função |
|-----------|--------|--------|
| React | 18.2 | Biblioteca de UI |
| Vite | 6.x | Build tool e dev server |
| TypeScript | 5.7 | Type safety |
| Tailwind CSS | 4.x | Utility-first CSS |
| Lucide React | 0.294 | Ícones |
| Vitest | Latest | Framework de testes |
| Testing Library | Latest | Testes de componentes |

---

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar testes
npx vitest run
```

---

## 🧪 Testes

### Estratégia de Testes

Testes organizados por camada, cobrindo UI/UX e lógica de negócio:

| Tipo | Arquivo | Cobertura |
|------|---------|-----------|
| Hook | `useFavorites.test.ts` | Adicionar, remover, persistir, validar limite, tratar dados corrompidos |
| Hook | `useTheme.test.ts` | Toggle, persistência, aplicação de classe DOM |
| Componente | `Header.test.tsx` | Renderização, busca, favoritos, tema, acessibilidade |
| Componente | `CountryCard.test.tsx` | Dados exibidos, clique, favorito, bandeira |
| Componente | `FilterBar.test.tsx` | Selects, callbacks, contador, singular/plural |
| Componente | `CountryGrid.test.tsx` | Lista, estado vazio, view favoritos |
| Utilitário | `api.test.ts` | Sucesso, erro, 404, mock do fetch |

### Executar Testes

```bash
# Executar todos os testes
npx vitest run

# Executar em modo watch
npx vitest

# Executar com cobertura (se configurado)
npx vitest run --coverage
```

---

## 📐 Decisões Técnicas

### Por que REST Countries e não OMDB/TMDB?
- Não requer API key (simplifica desenvolvimento e deploy)
- Dados estruturados e ricos para demonstrar filtros e interações
- Resposta rápida sem rate limiting
- Substituta direta do antigo REST Countries v3.1 (agora descontinuado)

### Por que localStorage para favoritos?
- Persistência entre sessões sem backend
- Simples e confiável para dados de usuário
- Trade-off: limitado ao navegador/dispositivo

### Por que modal e não página separada?
- Contexto mantido (filtros, busca) ao visualizar detalhes
- Navegação mais fluida entre países vizinhos
- Trade-off: menos "profundo" que uma rota dedicada

### Por que useMemo nos filtros?
- Evita recálculo desnecessário a cada render
- Lista de 250+ países pode ser custosa
- Dependências bem definidas (query, região, ordenação)

### Por que campos selecionados na API?
- Reduz payload (~60% menor que resposta completa)
- Carregamento mais rápido, especialmente em mobile
- Campos escolhidos cobrem todas as necessidades da UI

### Modo escuro via classe vs. prefers-color-scheme
- Classe permite toggle manual (melhor UX)
- Detecção automática como fallback (primeira visita)
- Persistência da preferência do usuário

---

## 📦 Deploy

### Build de Produção

```bash
npm run build
```

Gerado em `dist/` — arquivos estáticos prontos para qualquer hosting:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Variáveis de Ambiente
Nenhuma variável de ambiente necessária. A API é pública e acessada diretamente pelo browser.

---

## 📝 Notas de Desenvolvimento

### Padrões Utilizados
- Componentes funcionais com hooks
- TypeScript strict mode
- Props tipadas com interfaces
- Callbacks memoizados com useCallback
- Computações derivadas com useMemo
- Tratamento de erros em todas as camadas

### Acessibilidade
- `aria-label` em todos os elementos interativos
- `role="dialog"` e `aria-modal` no modal
- `role="article"` nos cards
- Labels em todos os inputs e selects
- Navegação por teclado (ESC fecha modal)
- Contraste adequado nos dois temas

### Responsividade
- Mobile-first com breakpoints sm/lg/xl
- Grid adaptativo (1→2→3→4 colunas)
- Header compacto em telas pequenas
- Modal com scroll interno em telas pequenas

---

## 📄 Licença

Projeto desenvolvido para fins educacionais. API REST Countries é de uso livre.
