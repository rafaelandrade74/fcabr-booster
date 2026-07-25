# Melhorias Sugeridas

## Arquitetura

### ~~M-001: Resolver a Dependência Circular~~ ✅ Implementado
Criado `src/data/api-route-keys.js` com `storageKeyGoaRankStatus` e `RouteKeyProfile`, eliminando a dependência circular.

### M-002: Cache entre Reloads — Descartado
`chrome.storage.session` e `sessionStorage` do site foram testados e ambos lançam `"Access to storage is not allowed from this context"` no contexto de content script. O `Map` em memória é a única opção viável — mantido como está.

### M-003: Background Service Worker
Adicionar um service worker para centralizar a lógica de armazenamento e evitar a necessidade de postMessage entre Main World e Isolated World para dados de API.

---

## Robustez / Performance

### M-004: Usar `MutationObserver` Consistentemente
Substituir o `waitUntil` (polling) pelo `DOM.wait()` (MutationObserver) que já existe mas não é usado. É mais eficiente e reage instantaneamente.

### M-005: Estratégia de Seleção DOM Mais Estável
Em vez de selecionar por classes CSS do Tailwind (que podem mudar a qualquer deploy do site), usar atributos `data-*` ou `aria-*` quando disponíveis.

---

## Organização / DX

### M-006: Adicionar Testes Unitários
Framework sugerido: **Vitest** (compatível com ESModules, sem configuração).

Casos a testar:
- `resolveSelectedLanguage` com diferentes pathnames
- `storageKeyGoaRankStatus` com diferentes combinações de oidUser/nickname
- `initializeStoredValues` com storage vazio, parcial e completo
- Cálculo de progresso em `ExperienceCard.setProgress`
- `FireteamCard.render` com dados nulos

### M-007: Remover Métodos Não Utilizados de `dom.js`
Ou documentá-los explicitamente como "API pública para uso futuro".

### ~~M-008: Adicionar `source maps` para Debug~~ ✅ Implementado
`devtool: "cheap-module-source-map"` ativo em `development`; `false` em `production`.

### ~~M-009: Separar Build de Dev e Produção~~ ✅ Implementado
`npm run dev` usa `--mode development` — bundle não-minificado, source maps ativos, `__FCABR_DEBUG__` = `true`. `npm run build` e `npm run release` usam `--mode production`.

---

## Segurança

### ~~M-010: Adicionar Nonce ao Script Injetado~~ ✅ Implementado
Tokens UUID gerados com `crypto.randomUUID()` no Isolated World são passados via `data-*` para os scripts injetados e verificados em cada listener `postMessage`. Dois tokens independentes protegem as duas direções de comunicação.

---

## UX / Popup

### M-011: Mais Configurações no Popup
Potenciais configurações futuras:
- Formato de exibição do XP (número completo vs. abreviado)
- Tema do cartão Fireteam
- Intervalo configurável por tipo de monitor

---

## Manutenibilidade

### M-012: Criar Ícones de Múltiplos Tamanhos
Criar `icon-16.png`, `icon-32.png` para qualidade visual nos menus do navegador.

### M-013: Adicionar `eslint-plugin` para Extensões
`eslint-plugin-webextensions` ou regras customizadas para validar uso correto das APIs do browser.

### M-014: Suporte a `XMLHttpRequest` no inject.js
Atualmente apenas `fetch` é interceptado. Chamadas XHR nativas da página não são capturadas.
