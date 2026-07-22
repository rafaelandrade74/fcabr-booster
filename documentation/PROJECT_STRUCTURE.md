# Estrutura do Projeto

## Árvore Completa

```
fcabr-booster/
├── manifest.json               # Manifesto da extensão (Manifest V3)
├── package.json                # Dependências e scripts de build
├── webpack.config.js           # Configuração do bundler
├── jsconfig.json               # Configuração do compilador JS/TS
├── eslint.config.mjs           # Configuração de linting
├── commitlint.config.cjs       # Regras de mensagens de commit
├── CHANGELOG.md                # Histórico de versões
├── LICENSE.md                  # Licença (a definir)
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
│   │   ├── inject.js           # Injetado no mundo principal (main world) — intercepta fetch
│   │   ├── router.js           # Agrega e exporta as rotas (API + página)
│   │   └── routes/
│   │       └── profile.js      # Handler da página de perfil + lógica de storage key
│   │
│   ├── data/                   # Dados estáticos e configurações de rotas
│   │   ├── api-routes.js       # Definição das rotas de API monitoradas
│   │   ├── page-routes.js      # Definição das rotas de página tratadas
│   │   ├── patents.js          # Tabela de patentes GOA com XP de cada nível
│   │   └── routekeys.js        # Constantes de chaves de storage
│   │
│   ├── lib/                    # Bibliotecas internas reutilizáveis
│   │   ├── dom.js              # Utilitários de manipulação do DOM
│   │   ├── experience-card.js  # Classe que representa e manipula o cartão de XP
│   │   └── storage-service.js  # Serviço de cache em memória (Map)
│   │
│   ├── options/                # Interface do popup da extensão
│   │   ├── popup.html          # Estrutura HTML do popup
│   │   └── popup.js            # Lógica do popup (settings, tabs API)
│   │
│   ├── translations/           # Internacionalização (i18n)
│   │   ├── en.js               # Strings em inglês
│   │   ├── pt.js               # Strings em português
│   │   └── index.js            # Funções de resolução de idioma
│   │
│   ├── types/
│   │   └── translations.d.ts   # Definições de tipos TypeScript globais
│   │
│   └── utils/
│       ├── index.js            # initializeStoredValues — bootstrap do storage
│       └── settings.js         # DEFAULT_SETTINGS — valores padrão de configuração
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
            └── inject.js
```

---

## Responsabilidades por Diretório

### `src/content-scripts/`
Núcleo da extensão. Contém os scripts que rodam dentro do contexto da aba do navegador:

- **`content.js`** — Entry point. Injeta `inject.js` no mundo principal, escuta mensagens `postMessage`, persiste dados no `StorageService`, monitora mudanças de URL (SPA navigation) e dispara a renderização das páginas.
- **`inject.js`** — Roda no mundo principal da página (não no isolated world do content script). Monkey-patcha `window.fetch` para interceptar respostas de API e retransmiti-las via `postMessage`.
- **`router.js`** — Agregador simples que importa e re-exporta as rotas de API e de página como um objeto `routes`.
- **`routes/profile.js`** — Handler específico da página de perfil. Contém a lógica de identificação do perfil, leitura do storage, cálculo de XP e atualização do DOM.

### `src/data/`
Dados puros e configurações declarativas:

- **`api-routes.js`** — Array de objetos `{ regex, storageKey }` descrevendo quais URLs de API monitorar.
- **`page-routes.js`** — Array de objetos `{ regex, handler }` descrevendo quais páginas tratar.
- **`patents.js`** — Tabela estática com 11 níveis de patente GOA e seus respectivos XP-alvo (base).
- **`routekeys.js`** — Enum de chaves de storage para evitar strings mágicas.

### `src/lib/`
Módulos reutilizáveis de uso geral:

- **`dom.js`** — Classe utilitária estática com métodos de seleção, busca por texto, espera assíncrona e manipulação do DOM.
- **`experience-card.js`** — Classe que encapsula a localização e manipulação do cartão de XP no DOM do FCABR.
- **`storage-service.js`** — Cache em memória baseado em `Map` com prefixação de chaves.

### `src/options/`
Interface do popup que aparece ao clicar no ícone da extensão.

### `src/translations/`
Sistema de i18n simples para português e inglês.

### `src/utils/`
Funções utilitárias transversais, especialmente o bootstrap de `chrome.storage.local`.
