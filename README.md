# FCABR Booster

Extensão de navegador (Manifest V3 — Chrome e Firefox) que enriquece a experiência no site **fcabr.net**, exibindo informações precisas de progressão de patente, ranking de experiência e ranking Fireteam no perfil do jogador.

## Funcionalidades

- **Progressão de patente** — exibe XP base, XP restante e barra de progresso correta no cartão de XP
- **Ranking de experiência** — badge "Top #N" ou "Top +1000" quando o jogador não está entre os primeiros do ranking
- **Ranking Fireteam** — card com posição e pontos do clã e do jogador no ranking semanal
- **Suporte a múltiplos perfis** — detecta troca de perfil e recarrega os dados automaticamente
- **Popup de configurações** — painel lateral com toggles para ativar/desativar cada funcionalidade
- **Internacionalização** — suporte a Português e Inglês

## Pré-requisitos

- Node.js 18+
- npm

## Instalação

```bash
npm install
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run build` | Build de produção na pasta `dist/` |
| `npm run dev` | Build em modo watch (recompila ao salvar) |
| `npm run release` | Build de produção + gera `release-v{version}.zip` |

## Instalação da Extensão (modo desenvolvedor)

1. Execute `npm run build`
2. No Chrome: `chrome://extensions` → Ativar modo desenvolvedor → Carregar sem compactação → selecionar a pasta `dist/`
3. No Firefox: `about:debugging` → Este Firefox → Carregar extensão temporária → selecionar `dist/manifest.json`

## Publicar uma Release

```bash
npm run release
```

Gera `release-v{version}.zip` na raiz do projeto pronto para upload nas lojas de extensões.

## Estrutura

```
src/
├── content-scripts/
│   ├── content.js          # Orquestrador principal (content script)
│   ├── inject.js           # Interceptador de fetch (Main World)
│   ├── monitor-manager.js  # Monitores periódicos de API (Main World)
│   ├── router.js           # Roteador de API e páginas
│   └── routes/
│       └── profile.js      # Handler da página de perfil
├── lib/
│   ├── dom.js              # Utilitários de DOM
│   ├── experience-card.js  # Componente do cartão de XP
│   └── fireteam-card.js    # Componente do cartão Fireteam
├── data/
│   ├── api-routes.js       # Rotas de API interceptadas
│   ├── page-routes.js      # Rotas de página
│   ├── patents.js          # Tabela de patentes e XP
│   └── routekeys.js        # Chaves de armazenamento
├── translations/           # Strings em pt e en
├── utils/                  # Inicialização de settings
└── options/
    └── popup.js            # Interface do popup
public/
├── images/                 # Ícones da extensão
└── styles/                 # CSS do popup
scripts/
└── release.js              # Script de geração do zip de release
```

## Documentação Técnica

Consulte a pasta [`documentation/`](./documentation/README.md) para arquitetura, fluxos, regras de negócio e guia de onboarding.
