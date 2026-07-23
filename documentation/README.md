# FCABR Booster — Documentação Técnica

> Extensão de navegador (Manifest V3) que enriquece a experiência do usuário no site **fcabr.net**, exibindo informações de progressão de patente, ranking de experiência e ranking Fireteam nas páginas de perfil dos jogadores.

---

## Índice da Documentação

| Arquivo | Conteúdo |
|---|---|
| [README.md](./README.md) | Este arquivo — visão geral e índice |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Mapeamento de pastas e responsabilidades |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura, padrões e diagramas |
| [FLOWS.md](./FLOWS.md) | Fluxos de execução com diagramas |
| [FEATURES.md](./FEATURES.md) | Funcionalidades implementadas |
| [ROUTES.md](./ROUTES.md) | Rotas de API e rotas de página |
| [COMPONENTS.md](./COMPONENTS.md) | Classes e módulos principais |
| [SERVICES.md](./SERVICES.md) | Serviços internos |
| [API.md](./API.md) | Integrações com APIs externas |
| [DATABASE.md](./DATABASE.md) | Armazenamento e dados persistidos |
| [BUSINESS_RULES.md](./BUSINESS_RULES.md) | Regras de negócio |
| [SECURITY.md](./SECURITY.md) | Análise de segurança |
| [TECH_DEBT.md](./TECH_DEBT.md) | Dívidas técnicas |
| [IMPROVEMENTS.md](./IMPROVEMENTS.md) | Melhorias sugeridas |
| [DEPENDENCIES.md](./DEPENDENCIES.md) | Dependências e ferramentas |
| [ONBOARDING.md](./ONBOARDING.md) | Guia de onboarding para novos devs |
| [CHANGELOG_ANALYSIS.md](./CHANGELOG_ANALYSIS.md) | Análise do histórico de versões |

---

## Visão Geral

### O que é

**FCABR Booster** é uma extensão de navegador para Chrome e Firefox que atua exclusivamente no domínio `https://fcabr.net`. Seu propósito é enriquecer as informações exibidas nos perfis dos jogadores com dados de progressão de patente, posição no ranking de experiência e ranking Fireteam.

### Problema que resolve

A plataforma FCABR exibe informações de progressão de patente (XP base, XP necessário, barra de progresso) que podem ser exibidas de forma incompleta. Além disso, dados de ranking como posição no ranking geral e no ranking Fireteam do clã não são exibidos diretamente no perfil. A extensão intercepta e complementa essas informações.

### Usuário-alvo

Jogadores da plataforma FCABR que desejam ver informações completas de progressão, ranking de experiência e desempenho no Fireteam diretamente no perfil.

### Fluxo principal

1. Usuário instala a extensão e navega para `fcabr.net`.
2. A extensão injeta `inject.js` que intercepta as chamadas `fetch` da página.
3. Quando a API de perfil (`goa-rank-status`) é chamada, os dados são capturados e armazenados.
4. Periodicamente, `monitor-manager.js` busca dados de ranking de experiência e Fireteam.
5. A extensão aguarda o DOM carregar o cartão de XP e injeta os componentes visuais.
6. Ao trocar de perfil, os monitores são re-executados automaticamente.

---

## Stack Resumida

- **Linguagem:** JavaScript (ES2020), TypeScript apenas para tipos (`.d.ts`)
- **Build:** Webpack 5
- **Release:** `npm run release` → build + zip `release-v{version}.zip`
- **Plataforma:** Browser Extension — Manifest V3 (Chrome + Firefox)
- **Armazenamento:** `chrome.storage.local` (settings) + `Map` em memória (dados de sessão)
- **APIs externas:** `fcabr.net/api/goa-rank-status`, `fcabr.net/api/ranking/player`, `fcabr.net/api/ranking/clan/fireteam`
- **Sem frameworks de UI:** DOM puro
