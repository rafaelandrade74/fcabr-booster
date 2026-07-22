# FCABR Booster — Documentação Técnica

> Extensão de navegador (Manifest V3) que enriquece a experiência do usuário no site **fcabr.net**, exibindo informações precisas de progressão de patente no cartão de XP do perfil.

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

**FCABR Booster** é uma extensão de navegador para Chrome e Firefox que atua exclusivamente no domínio `https://fcabr.net`. Seu propósito é corrigir e enriquecer as informações exibidas no cartão de experiência (XP) das páginas de perfil dos jogadores.

### Problema que resolve

A plataforma FCABR exibe no perfil do jogador informações de progressão de patente (XP base, XP necessário para a próxima patente, barra de progresso), mas esses valores podem ser exibidos incorretamente ou de forma incompleta pelo site original. A extensão intercepta os dados brutos da API, calcula os valores corretos com base em sua própria tabela de patentes e atualiza os elementos visuais da página.

### Usuário-alvo

Jogadores da plataforma FCABR que desejam ver suas informações de progressão de patente de forma precisa e completa.

### Fluxo principal

1. Usuário instala a extensão e navega para `fcabr.net`.
2. A extensão injeta um script que monitora as chamadas fetch da página.
3. Quando a API de ranking é chamada, os dados são capturados.
4. A extensão aguarda o DOM carregar o cartão de XP.
5. O cartão é atualizado com os valores corretos de XP e a barra de progresso calculada.

---

## Stack Resumida

- **Linguagem:** JavaScript (ES2020), TypeScript apenas para tipos (`.d.ts`)
- **Build:** Webpack 5
- **Plataforma:** Browser Extension — Manifest V3 (Chrome + Firefox)
- **Armazenamento:** `chrome.storage.local` (settings) + `Map` em memória (dados de sessão)
- **APIs externas:** `https://fcabr.net/api/goa-rank-status`
- **Sem frameworks de UI:** DOM puro
