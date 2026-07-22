# Arquitetura

## Tipo de Aplicação

**Browser Extension — Manifest V3**

Extensões Manifest V3 operam com múltiplos contextos de execução isolados:

| Contexto | Arquivo | Capacidades |
|---|---|---|
| **Main World** (página) | `inject.js` | Acesso total ao `window`, `fetch`, variáveis da página |
| **Isolated World** (content script) | `content.js` | DOM compartilhado com a página, mas JS isolado |
| **Extension Context** (popup) | `popup.js` | APIs `chrome.*`, sem acesso ao DOM da página |

---

## Padrões de Projeto

### Feature-Based + Module Pattern
O projeto organiza o código por responsabilidade funcional:
- `data/` — dados e roteamento declarativo
- `lib/` — módulos de infraestrutura reutilizáveis
- `content-scripts/routes/` — handlers de feature por página

### Observer Pattern (Fetch Interceptor)
`inject.js` implementa um interceptor de `window.fetch` (monkey-patch) que notifica o content script via `postMessage` sempre que uma resposta de API relevante chega.

### Router Pattern
`router.js` + `page-routes.js` + `api-routes.js` implementam um roteador simples baseado em regex, desacoplando o despachante (`content.js`) dos handlers específicos de cada página/API.

### Service Layer
`StorageService` é um serviço singleton com prefixação de chaves e cache em memória. `initializeStoredValues` é um serviço de bootstrap para `chrome.storage.local`.

### Static Utility Classes
`DOM` e `ExperienceCard` usam o padrão de classe estática/método utilitário para manter a lógica de UI isolada e testável.

---

## Separação de Responsabilidades

```
┌─────────────────────────────────────────────────────┐
│                   MAIN WORLD (página)               │
│  inject.js — intercepta fetch, postMessage dados    │
└───────────────────────┬─────────────────────────────┘
                        │ postMessage("FCABR_EXTENSION")
┌───────────────────────▼─────────────────────────────┐
│              ISOLATED WORLD (content script)        │
│                                                     │
│  content.js ──► router.js ──► api-routes.js         │
│       │                 └──► page-routes.js         │
│       │                                             │
│       ▼                                             │
│  StorageService (Map em memória)                    │
│       │                                             │
│       ▼                                             │
│  routes/profile.js ──► dom.js                      │
│                    └──► experience-card.js          │
│                    └──► patents.js                  │
│                    └──► translations/               │
└─────────────────────────────────────────────────────┘
                        │ chrome.storage.local
┌───────────────────────▼─────────────────────────────┐
│              EXTENSION CONTEXT (popup)              │
│  popup.js ──► initializeStoredValues               │
│           └──► chrome.tabs API                     │
└─────────────────────────────────────────────────────┘
```

---

## Diagrama de Arquitetura (Mermaid)

```mermaid
graph TB
    subgraph Browser["Navegador"]
        subgraph Page["Página fcabr.net"]
            FetchAPI["window.fetch (original)"]
            PageDOM["DOM da Página"]
        end

        subgraph MainWorld["Main World"]
            Inject["inject.js\n(monkey-patch fetch)"]
        end

        subgraph IsolatedWorld["Isolated World (Content Script)"]
            Content["content.js\n(orquestrador)"]
            Router["router.js"]
            ApiRoutes["api-routes.js"]
            PageRoutes["page-routes.js"]
            ProfileHandler["routes/profile.js"]
            StorageSvc["StorageService\n(Map cache)"]
            DOMLib["dom.js"]
            ExpCard["experience-card.js"]
            Patents["patents.js"]
            Translations["translations/"]
            Utils["utils/"]
        end

        subgraph ExtContext["Extension Context"]
            Popup["popup.js"]
            ChromeStorage["chrome.storage.local\n(showNextPatent)"]
        end
    end

    FetchAPI -->|interceptado por| Inject
    Inject -->|postMessage| Content
    Content --> Router
    Router --> ApiRoutes
    Router --> PageRoutes
    ApiRoutes -->|storageKey fn| ProfileHandler
    PageRoutes -->|handler fn| ProfileHandler
    ProfileHandler --> StorageSvc
    ProfileHandler --> DOMLib
    ProfileHandler --> ExpCard
    ProfileHandler --> Patents
    ProfileHandler --> Translations
    ProfileHandler --> Utils
    ExpCard --> DOMLib
    ExpCard -->|atualiza| PageDOM
    Utils -->|lê/escreve| ChromeStorage
    Popup -->|lê/escreve| ChromeStorage
    Popup -->|reload tab| Content
```

---

## Diagrama de Dependências entre Módulos

```mermaid
graph LR
    content["content.js"] --> router["router.js"]
    content --> storage["storage-service.js"]
    content --> routekeys["routekeys.js"]

    router --> api-routes["api-routes.js"]
    router --> page-routes["page-routes.js"]

    api-routes --> profile["routes/profile.js"]
    page-routes --> profile

    profile --> dom["dom.js"]
    profile --> exp-card["experience-card.js"]
    profile --> patents["patents.js"]
    profile --> translations["translations/index.js"]
    profile --> storage
    profile --> routekeys
    profile --> utils["utils/index.js"]
    profile --> settings["utils/settings.js"]

    exp-card --> dom

    translations --> pt["translations/pt.js"]
    translations --> en["translations/en.js"]

    popup["popup.js"] --> utils
    popup --> settings
```

---

## Ausência de Padrões / Limitações Arquiteturais

| Aspecto | Situação |
|---|---|
| Clean Architecture / DDD | Não aplicado — projeto pequeno, não necessário |
| Injeção de Dependência | Não existe — dependências importadas diretamente |
| Princípios SOLID | Parcialmente — SRP razoável, mas acoplamento entre `profile.js` e `api-routes.js` (circular) |
| Service Worker (background) | Não implementado — extensão opera 100% por content scripts |
| Estado global reativo | Não existe — dados transitam por `Map` em memória sem reatividade |
