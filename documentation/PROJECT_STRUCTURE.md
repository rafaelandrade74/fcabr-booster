# Estrutura do Projeto

## Árvore Completa

```
fcabr-booster/
├── manifest.json               # Manifesto da extensão (Manifest V3)
├── package.json                # Dependências e scripts de build
├── webpack.config.js           # Configuração do bundler
├── jsconfig.json               # Configuração do compilador JS/TS
├── eslint.config.mjs           # Configuração de linting (ESLint flat config)
├── commitlint.config.cjs       # Regras de mensagens de commit
├── CHANGELOG.md                # Histórico de versões
├── LICENSE.md                  # Licença MIT
├── README.md                   # Documentação raiz
│
├── public/                     # Arquivos estáticos copiados diretamente para dist/
│   ├── images/
│   │   ├── icon-48.png         # Ícone da extensão (48x48)
│   │   └── icon-128.png        # Ícone da extensão (128x128)
│   └── styles/
│       └── popup.css           # Estilos da interface do popup
│
├── src/                        # Todo o código-fonte
│   ├── content-scripts/        # Scripts executados no contexto da página web
│   │   ├── content.js          # Entry point do content script — orquestra a extensão
│   │   ├── inject.js           # Injetado no Main World — intercepta window.fetch
│   │   ├── monitor-manager.js  # Injetado no Main World — monitores periódicos via XHR
│   │   ├── router.js           # Agrega e exporta as rotas (API + página)
│   │   └── routes/
│   │       ├── profile.js      # Handler da página de perfil + renderização DOM
│   │       └── ranking.js      # Funções de storageKey para rotas de ranking
│   │
│   ├── data/                   # Dados estáticos e configurações de rotas
│   │   ├── api-route-keys.js   # Chaves e funções de storage para rotas de API
│   │   ├── api-routes.js       # Definição das rotas de API monitoradas (regex + storageKey)
│   │   ├── page-routes.js      # Definição das rotas de página tratadas (regex + handler)
│   │   ├── patents.js          # Tabela de patentes GOA com XP de cada nível
│   │   └── routekeys.js        # Enum de chaves de storage (evita strings mágicas)
│   │
│   ├── lib/                    # Bibliotecas internas reutilizáveis
│   │   ├── config-dispatcher.js  # Observer de chrome.storage.onChanged com subscribe/unsubscribe
│   │   ├── dom.js                # Utilitários de seleção, espera e manipulação do DOM
│   │   ├── experience-card.js    # Encapsula localização e atualização do cartão de XP
│   │   ├── fireteam-card.js      # Renderiza o card de ranking Fireteam no perfil
│   │   ├── page-snapshot.js      # Snapshot/restore do estado original dos elementos modificados
│   │   └── storage-service.js    # Cache em memória (Map) com prefixação de chaves
│   │
│   ├── options/                # Interface do popup da extensão
│   │   ├── popup.html          # Estrutura HTML do popup
│   │   └── popup.js            # Lógica do popup (settings, tabs API)
│   │
│   ├── translations/           # Internacionalização (i18n)
│   │   ├── en.js               # Strings em inglês
│   │   ├── pt.js               # Strings em português
│   │   └── index.js            # Funções de resolução de idioma por pathname/lang
│   │
│   ├── types/
│   │   └── translations.d.ts   # Definições de tipos TypeScript globais
│   │
│   └── utils/
│       ├── debug-log.js        # Wrappers dlog/dwarn/derror condicionais a __FCABR_DEBUG__
│       ├── index.js            # initializeStoredValues — bootstrap do storage com defaults
│       └── settings.js         # DEFAULT_SETTINGS e constantes de intervalo
│
└── dist/                       # Gerado pelo build (não versionado)
    ├── manifest.json
    ├── popup.html
    ├── images/
    ├── styles/
    └── scripts/
        ├── popup.js
        └── content-scripts/
            ├── content.js
            ├── inject.js
            └── monitor-manager.js
```

---

## Responsabilidades por Diretório

### `src/content-scripts/`
Núcleo da extensão. Contém os scripts que rodam dentro do contexto da aba do navegador:

- **`content.js`** — Entry point. Injeta `inject.js` no Main World, escuta mensagens `postMessage`, persiste dados no `StorageService`, monitora mudanças de URL (SPA navigation) e dispara a renderização das páginas.
- **`inject.js`** — Roda no Main World da página (sem acesso a `chrome.*`). Monkey-patcha `window.fetch` para interceptar respostas de API e retransmiti-las via `postMessage`.
- **`monitor-manager.js`** — Roda no Main World. Implementa monitores periódicos via XHR (evitando re-interceptação pelo `inject.js`); publica dados via `postMessage` ao `content.js`.
- **`router.js`** — Agregador que importa e re-exporta as rotas de API e de página como um objeto `routes`.
- **`routes/profile.js`** — Handler da página de perfil: identifica o tipo de perfil, lê o storage, calcula XP e atualiza o DOM.
- **`routes/ranking.js`** — Funções de `storageKey` para as rotas de ranking de experiência e Fireteam.

### `src/data/`
Dados puros e configurações declarativas:

- **`api-route-keys.js`** — Chaves de storage e funções auxiliares para rotas de API (`storageKeyGoaRankStatus`, `RouteKeyProfile`, `FALLBACK_OID_USER_KEY`).
- **`api-routes.js`** — Array de objetos `{ regex, storageKey }` descrevendo quais URLs de API monitorar.
- **`page-routes.js`** — Array de objetos `{ regex, handler }` descrevendo quais páginas tratar.
- **`patents.js`** — Tabela estática com 11 níveis de patente GOA e seus respectivos XP-alvo (base).
- **`routekeys.js`** — Enum de chaves de storage para evitar strings mágicas.

### `src/lib/`
Módulos reutilizáveis de uso geral:

- **`config-dispatcher.js`** — Observer de `chrome.storage.onChanged` com API de `subscribe`/`unsubscribe`; notifica apenas os assinantes das chaves alteradas (hot-reload).
- **`dom.js`** — Classe utilitária estática com métodos de seleção, busca por texto visível, espera assíncrona e manipulação do DOM.
- **`experience-card.js`** — Encapsula a localização e atualização do cartão de XP no DOM do FCABR (XP, progresso, badge de ranking).
- **`fireteam-card.js`** — Renderiza o card de ranking Fireteam (posição de clã e jogador) nas páginas de perfil.
- **`page-snapshot.js`** — Captura e restaura o estado original dos elementos DOM modificados pela extensão, usado pelo hot-reload de configurações.
- **`storage-service.js`** — Cache em memória baseado em `Map` com prefixação de chaves (`fcabr.*`).

### `src/options/`
Interface do popup que aparece ao clicar no ícone da extensão.

### `src/translations/`
Sistema de i18n simples para português e inglês, resolvendo o idioma pelo `pathname` e `document.documentElement.lang`.

### `src/utils/`
Funções utilitárias transversais:

- **`debug-log.js`** — Wrappers `dlog`/`dwarn`/`derror` que emitem logs apenas quando `__FCABR_DEBUG__` é `true` (builds de desenvolvimento).
- **`index.js`** — `initializeStoredValues`: lê `chrome.storage.local` e mescla com defaults.
- **`settings.js`** — `DEFAULT_SETTINGS` e constantes de intervalo mínimo/máximo de polling.
