# 🌍 World Explorer

> Aplicação React para explorar dados de países ao redor do mundo, consumindo a API Countries.dev.

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
- [Registro de Alterações](#-registro-de-alterações)

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

| Critério | Avaliação |
|----------|-----------|
| Autenticação | Não requer API key |
| Dados disponíveis | Nome, bandeira, capital, região, população, área, idiomas, moedas, fronteiras, coordenadas |
| Endpoints usados | `/countries` (lista completa), `/name/{nome}` e `/alpha/{código}` |
| Volume retornado | 250 países em uma única chamada, sem paginação |
| Cache | Cabeçalhos `Cache-Control` com CDN (`s-maxage`), reduzindo chamadas repetidas |
| Formato | JSON |
| CORS | Habilitado (`Access-Control-Allow-Origin: *`) |

**Por que esta API:**
- Gratuita e sem configuração complexa
- Sem necessidade de API key (evita guardar segredo no deploy)
- CORS habilitado para chamadas diretas do navegador
- Substituta do antigo REST Countries v3.1 (agora descontinuado)
- Dados bem estruturados e resposta rápida

**Campos não fornecidos pela API:** `continents`, `unMember`, `landlocked`, `startOfWeek` e `coatOfArms` não existem na resposta da Countries.dev. Esses campos não recebem valores fixos — a interface exibe apenas os dados recebidos.

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
│   └── country.ts             # Contrato de dados usado pela aplicação
│
├── utils/                     # Utilitários
│   ├── api.ts                 # Comunicação com a API + mapeamento dos dados
│   └── regions.ts             # Regiões suportadas pelo filtro (fonte única)
│
└── test/                      # Testes automatizados
    ├── setup.ts               # Configuração do ambiente de teste
    ├── App.test.tsx           # Teste de integração da aplicação
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
| TypeScript | 5.9 | Type safety |
| Tailwind CSS | 4.x | Utility-first CSS |
| Lucide React | 0.294 | Ícones |
| Vitest | 5.x | Framework de testes |
| Testing Library | 16.x | Testes de componentes e hooks |
| ESLint | 10.x | Padrão de código e validação estática |

---

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento (http://localhost:3000)
npm run dev

# Build para produção
npm run build

# Executar testes
npm test

# Executar testes em modo watch
npx vitest

# Validar padrão de código (0 erros e 0 avisos)
npm run lint

# Validar tipos TypeScript
npm run typecheck
```

---

## 🧪 Testes

### Estratégia de Testes

Testes organizados por camada, cobrindo UI/UX e lógica de negócio:

| Tipo | Arquivo | Cobertura |
|------|---------|-----------|
| Integração | `App.test.tsx` | Carga, busca, favoritos, modal, estado de erro, tema |
| Hook | `useCountries.test.ts` | Carga, sucesso, erro, busca, região, ordenação, recarga |
| Hook | `useFavorites.test.ts` | Adicionar, remover, persistir, validar limite, tratar dados corrompidos |
| Hook | `useTheme.test.ts` | Toggle, persistência, aplicação de classe DOM |
| Componente | `Header.test.tsx` | Renderização, busca, favoritos, tema, acessibilidade |
| Componente | `CountryCard.test.tsx` | Dados exibidos, clique, favorito, bandeira |
| Componente | `CountryDetail.test.tsx` | Dados do modal, campos ausentes, área não informada, foco, ESC, vizinhos |
| Componente | `CountryGrid.test.tsx` | Lista, estado vazio, view favoritos |
| Componente | `FilterBar.test.tsx` | Selects, callbacks, contador, singular/plural |
| Componente | `LoadingState.test.tsx` | Mensagem padrão e mensagem personalizada |
| Componente | `ErrorState.test.tsx` | Mensagem de erro e ação de tentar novamente |
| Componente | `Footer.test.tsx` | Créditos, link da API e segurança do link externo |
| Utilitário | `api.test.ts` | Contrato de mapeamento, falhas de comunicação, tempo limite, 404 |

### Executar Testes

```bash
# Executar todos os testes (13 arquivos / 105 testes)
npm test

# Executar em modo watch
npx vitest

# Validar padrão de código (0 erros e 0 avisos)
npm run lint

# Validar tipos TypeScript
npm run typecheck
```

### Validações Aplicadas

- Mapeamento da API validado com amostra real da resposta (campos, listas e campos ausentes).
- Respostas inválidas validadas: corpo sem JSON, lista com objetos vazios e status HTTP de erro.
- Tempo limite validado com relógio simulado.
- Comportamentos do modal validados: ESC, clique fora, foco inicial e bloqueio do scroll.
- Integração validada: busca, favoritos, modal, navegação entre vizinhos e estado de erro com recarga.

---

## 📐 Decisões Técnicas

### Por que Countries.dev e não OMDB/TMDB?
- Não requer API key (simplifica desenvolvimento e deploy)
- Dados estruturados e ricos para demonstrar filtros e interações
- Chamadas diretas do navegador, sem proxy e sem segredo no deploy
- CORS habilitado, o que evita erro de origem no deploy
- Substituta do REST Countries v3.1 (descontinuado)

### Por que não preencher campos ausentes com valores fixos?
- A API não fornece `unMember`, `landlocked` e `continents`
- Valores fixos exibiam informação incorreta (todos os países apareciam como "Não")
- Padrão adotado: campos ausentes ficam indefinidos e a interface não os renderiza
- Trade-off: a tela de detalhes mostra menos campos, porém sempre corretos

### Por que normalizar as regiões na camada de API?
- A API retorna `Polar` e `Antarctic Ocean`, fora do conjunto exibido no filtro
- A normalização converte ambos para `Antarctic`
- Padrão adotado: `utils/regions.ts` é a fonte única das regiões
- Resultado validado por teste: toda região retornada é selecionável no filtro

### Por que limitar o tempo da requisição?
- Uma resposta lenta deixaria o usuário no carregamento indefinidamente
- Foi aplicado `AbortController` com limite de 15 segundos
- Ao exceder, a aplicação exibe mensagem específica e libera o botão de tentar novamente

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
Nenhuma variável de ambiente necessária. A API é pública, sem autenticação, e é acessada diretamente pelo navegador.

### Validação Antes do Deploy

```bash
npm run lint       # 0 erros e 0 avisos
npm run typecheck  # sem erros de tipo
npm test           # 13 arquivos / 105 testes
npm run build      # gera dist/

# Confirmar que o bundle usa a API atual
grep -c countries.dev dist/assets/*.js
```

Após o deploy, validações aplicadas:
- Lista de países carregada na página inicial (250 países).
- Console do navegador sem erro de CORS.
- Filtro por região retornando resultados para todas as opções exibidas.
- Tema claro/escuro, favoritos e modal de detalhes funcionando em mobile e desktop.

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

## 📝 Registro de Alterações

### 29/09/2026 — Correção do contrato de dados após descontinuidade da API v3.1

- Identificada a API Countries.dev como alternativa ao REST Countries v3.1, que foi descontinuado e passou a retornar erro de CORS no deploy.
- Ajustado o mapeamento dos dados para o formato achatado da API (name como texto, alpha3Code, languages[] e currencies[]).
- Removidos valores fixos nos campos `unMember`, `landlocked` e `continents`, que exibiam informação incorreta para todos os países.
- Ajustada a tela de detalhes para exibir apenas os campos informados pela API.
- Ajustada a exibição de área: mostra "Não informada" quando a API não retorna o valor, em vez de "0 km²".
- Normalizadas as regiões `Polar` e `Antarctic Ocean` para `Antarctic`, garantindo que todos os países sejam selecionáveis no filtro.
- Ajustados os campos `nativeName` (texto, conforme a API) e `ccn3` (usando `numericCode`).
- Tratada a resposta com objetos vazios retornada quando o parâmetro `fields` é inválido: a aplicação exibe erro e libera a nova tentativa.
- Adicionado limite de 15 segundos na requisição, evitando carregamento infinito.
- Corrigido o rodapé, que ainda apontava para a API descontinuada.
- Adicionados testes de contrato de mapeamento, de falhas de comunicação, do modal de detalhes, dos estados de carregamento e erro, do hook de dados e de integração (52 → 105 testes).
- Configurado o ESLint em flat config, com validação de código em 0 erros e 0 avisos.
- Validado o fluxo completo com lint, typecheck, testes, build e verificação dos dados da API.

---

## 📄 Licença

Projeto desenvolvido para fins educacionais. Dados fornecidos pela Countries.dev.
