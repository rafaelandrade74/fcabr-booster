# Dependências

## Runtime (Sem dependências de runtime)

O projeto não tem dependências de runtime (`dependencies` no `package.json`). Todo o código é compilado para um bundle que roda diretamente no navegador.

---

## Build (`devDependencies`)

| Pacote | Versão | Função |
|---|---|---|
| `webpack` | ^5.97.1 | Bundler — compila e empacota os módulos ES em scripts prontos para extensão |
| `webpack-cli` | ^6.0.1 | Interface de linha de comando do webpack |
| `html-webpack-plugin` | ^5.6.0 | Gera o `popup.html` no dist a partir do template |
| `copy-webpack-plugin` | ^12.0.2 | Copia `public/` e `manifest.json` para `dist/` sem processamento |

---

## Plataforma

| Tecnologia | Versão | Função |
|---|---|---|
| Manifest V3 | 3 | Especificação de extensão de navegador (Chrome + Firefox) |
| JavaScript | ES2020 | Linguagem principal |
| TypeScript (apenas tipos) | — | Arquivo `translations.d.ts` com tipos globais, sem compilação TS |
| Node.js | — | Ambiente de build (não vai para produção) |

---

## APIs do Navegador Utilizadas

| API | Contexto | Permissão necessária |
|---|---|---|
| `chrome.storage.local` | popup.js, utils/ | `"storage"` |
| `chrome.storage.session` | Não usado (sugerido) | `"storage"` |
| `chrome.tabs.query` | popup.js | `"tabs"` |
| `chrome.tabs.reload` | popup.js | `"tabs"` |
| `chrome.runtime.getURL` | content.js | Automático |
| `window.fetch` (override) | inject.js | Nenhuma |
| `window.postMessage` | inject.js → content.js | Nenhuma |
| `MutationObserver` | dom.js | Nenhuma |
| `localStorage` (leitura) | routes/profile.js | Nenhuma |
| `history.pushState/replaceState` (override) | content.js | Nenhuma |

---

## Diagrama de Dependências de Build

```mermaid
graph TD
    subgraph "Entry Points"
        E1["src/options/popup.js"]
        E2["src/content-scripts/content.js"]
        E3["src/content-scripts/inject.js"]
    end

    subgraph "Outputs"
        O1["dist/scripts/popup.js"]
        O2["dist/scripts/content-scripts/content.js"]
        O3["dist/scripts/content-scripts/inject.js"]
        O4["dist/popup.html"]
        O5["dist/manifest.json"]
        O6["dist/images/"]
        O7["dist/styles/"]
    end

    E1 -->|webpack bundle| O1
    E2 -->|webpack bundle| O2
    E3 -->|webpack bundle| O3
    HWP["html-webpack-plugin\n(src/options/popup.html)"] --> O4
    CWP["copy-webpack-plugin\n(public/ + manifest.json)"] --> O5
    CWP --> O6
    CWP --> O7
```

---

## Compatibilidade de Navegadores

Declarada no `manifest.json`:

```json
"browser_specific_settings": {
  "gecko": {
    "id": "contato@ferasgameshosting.com.br",
    "strict_min_version": "109.0"
  }
}
```

| Navegador | Suporte | Observação |
|---|---|---|
| Chrome / Chromium | ✅ | MV3 nativo |
| Firefox | ✅ | Firefox 109+ (MV3 suportado) |
| Safari | ❓ | Não testado, requer adaptação |
| Edge | ✅ | Baseado em Chromium |
