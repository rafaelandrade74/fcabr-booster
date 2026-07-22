# Melhorias Sugeridas

## Arquitetura

### M-001: Resolver a Dependência Circular
Mover `storageKeyGoaRankStatus` e `RouteKeyProfile` para fora de `routes/profile.js`. Sugestão: criar `src/data/route-helpers.js` com as funções de resolução de chave.

### M-002: Usar `chrome.storage.session` para Cache
Substituir o `Map` em memória do `StorageService` por `chrome.storage.session` (disponível no MV3). Os dados persistiriam durante a sessão de navegação mas seriam limpos ao fechar o navegador.

```js
// Antes
static set(key, value) { this.cache.set(this.buildKey(key), value); }

// Depois
static async set(key, value) {
    await chrome.storage.session.set({ [this.buildKey(key)]: value });
}
```

### M-003: Background Service Worker
Adicionar um service worker para centralizar a lógica de armazenamento e evitar a necessidade de postMessage entre Main World e Isolated World para dados de API.

---

## Robustez / Performance

### M-004: Remover ou Aumentar Intervalo do Polling
O `setInterval(checkUrlChange, 200)` pode ser aumentado para 1000ms ou removido completamente, já que os patches de `pushState`/`replaceState` + `popstate` cobrem os casos principais.

### M-005: Usar `MutationObserver` Consistentemente
Substituir o `waitUntil` (polling) pelo `DOM.wait()` (MutationObserver) que já existe mas não é usado. É mais eficiente e reage instantaneamente.

### M-006: Estratégia de Seleção DOM Mais Estável
Em vez de selecionar por classes CSS do Tailwind (que podem mudar):

```js
// Frágil
DOM.byTextVisible("span", translations.Profile["xp-label"])
    ?.closest("div.rounded-lg")

// Mais robusto — usar posição relativa ao texto encontrado
// ou atributos aria/data que tendam a ser mais estáveis
```

---

## Organização / DX

### M-007: Adicionar Testes Unitários
Framework sugerido: **Vitest** (compatível com ESModules, sem configuração).

Casos a testar:
- `resolveSelectedLanguage` com diferentes pathnames
- `storageKeyGoaRankStatus` com diferentes combinações
- `initializeStoredValues` com storage vazio, parcial e completo
- Cálculo de progresso em `ExperienceCard.setProgress`

### M-008: Remover Métodos Não Utilizados de `dom.js`
Ou documentá-los explicitamente como "API pública para uso futuro".

### M-009: Adicionar `source maps` para Debug
No `webpack.config.js`:
```js
devtool: argv.mode === 'development' ? 'inline-source-map' : false
```

### M-010: Separar Build de Dev e Produção
Atualmente ambos usam `mode=production`. Em dev, minificação dificulta o debug.

---

## Segurança

### M-011: Adicionar Nonce ao Script Injetado
Gerar um nonce único por sessão para validar as mensagens postMessage:

```js
const nonce = crypto.randomUUID();
// Compartilhar nonce via atributo no script tag
// Verificar nonce nas mensagens recebidas
```

---

## UX / Popup

### M-012: Feedback Visual ao Salvar
O popup fecha imediatamente ao salvar. Adicionar um estado de "Salvando..." antes de fechar melhoraria a percepção.

### M-013: Mais Configurações no Popup
Potenciais configurações futuras:
- Mostrar/ocultar barra de progresso
- Formato de exibição do XP (número completo vs. abreviado)
- Tema do cartão

---

## Manutenibilidade

### M-014: Completar CHANGELOG.md
Documentar as versões 0.1.1 e 0.1.2.

### M-015: Definir Licença
Escolher e adicionar uma licença (MIT, Apache 2.0, etc.) ao `LICENSE.md`.

### M-016: Criar Ícones de Múltiplos Tamanhos
Criar `icon-16.png`, `icon-32.png` para qualidade visual nos menus do navegador.

### M-017: Adicionar `eslint-plugin` para Extensões
`eslint-plugin-webextensions` ou regras customizadas para validar uso correto das APIs do browser.
