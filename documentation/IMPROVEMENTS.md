# Melhorias Sugeridas

## Arquitetura

### M-001: Resolver a Dependência Circular
Mover `storageKeyGoaRankStatus` e `RouteKeyProfile` para fora de `routes/profile.js`. Sugestão: criar `src/data/route-helpers.js` com as funções de resolução de chave.

### M-002: Usar `chrome.storage.session` para Cache
Substituir o `Map` em memória do `StorageService` por `chrome.storage.session` (disponível no MV3). Os dados persistiriam durante a sessão de navegação mas seriam limpos ao fechar o navegador.

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

### M-008: Adicionar `source maps` para Debug
No `webpack.config.js`:
```js
devtool: argv.mode === 'development' ? 'inline-source-map' : false
```

### M-009: Separar Build de Dev e Produção
Atualmente ambos usam `mode=production`. Em dev, minificação dificulta o debug.

---

## Segurança

### M-010: Adicionar Nonce ao Script Injetado
Gerar um nonce único por sessão para validar as mensagens postMessage:

```js
const nonce = crypto.randomUUID();
// Compartilhar nonce via atributo no script tag
// Verificar nonce nas mensagens recebidas
```

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
