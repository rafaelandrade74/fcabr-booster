# APIs e Integrações Externas

## Visão Geral

A extensão **não faz chamadas de API diretamente**. Ela intercepta passivamente as chamadas que o próprio site FCABR faz, capturando as respostas.

---

## API Monitorada: `goa-rank-status`

**URL base:** `https://fcabr.net`

**Endpoint:** `GET /api/goa-rank-status`

**Query params observados:** `oidUser={number}` (obrigatório para o match da regex)

**Autenticação:** Gerenciada pelo site (cookies de sessão). A extensão não intervém.

**Quando é chamada:** Automaticamente pelo site ao carregar uma página de perfil.

### Estrutura da Resposta (inferida do código)

```json
{
  "data": {
    "oidUser": 12345,
    "nickname": "jogador123",
    "patenteAtual": "GOA Gold",
    "exp": 50000000,
    "expNecessario": 80000000
  }
}
```

| Campo | Tipo | Uso pela extensão |
|---|---|---|
| `data.oidUser` | number | Identifica se é perfil próprio; compõe a chave de storage |
| `data.nickname` | string | Compõe chave de storage para perfil de terceiro |
| `data.patenteAtual` | string | Busca na tabela `patents.js` para obter o XP base |
| `data.exp` | number | XP atual do jogador |
| `data.expNecessario` | number | XP necessário para a próxima patente (vindo da API) |

### Campos não utilizados

A resposta pode conter outros campos que a extensão não usa (não é possível confirmar sem observar a resposta real da API).

---

## APIs do Navegador (WebExtension APIs)

### `chrome.storage.local`

**Uso:** Persistência das configurações do usuário.

| Operação | Onde | Dados |
|---|---|---|
| `get(null)` | `popup.js`, `routes/profile.js` | Lê todas as configurações |
| `set({showNextPatent})` | `popup.js` | Salva preferência do toggle |
| `set(missingValues)` | `utils/index.js` | Inicializa valores ausentes |

### `chrome.tabs`

**Uso:** Popup precisa saber a URL da aba ativa e recarregá-la.

| Operação | Onde | Propósito |
|---|---|---|
| `query({active:true, currentWindow:true})` | `popup.js` | Verifica se aba é fcabr.net |
| `reload(tabId)` | `popup.js` | Recarrega após salvar configurações |

### `chrome.runtime`

**Uso:** Obter a URL do arquivo `inject.js` para injetá-lo na página.

| Operação | Onde | Propósito |
|---|---|---|
| `getURL("scripts/content-scripts/inject.js")` | `content.js` | URL acessível da extensão |

---

## APIs Web Padrão Utilizadas

| API | Onde | Uso |
|---|---|---|
| `window.fetch` | `inject.js` | Monkey-patched para interceptação |
| `window.postMessage` | `inject.js` → `content.js` | Comunicação Main World → Isolated World |
| `MutationObserver` | `dom.js` | Aguarda elementos DOM aparecerem |
| `history.pushState/replaceState` | `content.js` | Detecção de navegação SPA |
| `localStorage` | `routes/profile.js` | Lê `selected-profile-*` para identificar usuário logado |
| `performance.now()` | `dom.js` | Medição de timeout em `waitUntil` |
| `Number.toLocaleString` | `experience-card.js` | Formatação de números por locale |
