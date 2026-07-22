# Rotas

## Rotas de API Monitoradas

Rotas de API são interceptadas via `inject.js` → `postMessage` → `content.js` → `api-routes.js`.

| # | Regex | Exemplo de URL | StorageKey fn | Armazena em |
|---|---|---|---|---|
| 1 | `/\/api\/goa-rank-status\?.*oidUser=\d+/` | `/api/goa-rank-status?oidUser=12345` | `storageKeyGoaRankStatus` | `goa-rank-status-{oidUser}` ou `goa-rank-status-{nickname}` |

### Detalhe da Rota: `goa-rank-status`

**Arquivo:** `src/data/api-routes.js`

**Quando é chamada:** Quando o site FCABR busca os dados de ranking do usuário (ao carregar um perfil).

**Dados recebidos da API (estrutura observada no código):**

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

**Lógica de chave de storage:**
- Se `data.oidUser === profileId` (perfil próprio): `goa-rank-status-{oidUser}`
- Caso contrário (perfil de terceiro): `goa-rank-status-{nickname}`

---

## Rotas de Página

Rotas de página determinam quais páginas recebem a modificação visual da extensão.

**Arquivo:** `src/data/page-routes.js`

| # | Regex | URLs que batem | Handler | Status |
|---|---|---|---|---|
| 1 | `/^\/[a-z]{2}\/profile(?:\/[^/]+)?\/?$/` | `/pt/profile`, `/pt/profile/foo`, `/en/profile/bar` | `profilePage` | ✅ Ativo |

### Exemplos de URLs cobertas

| URL | Bate? | Tipo |
|---|---|---|
| `/pt/profile` | ✅ | Perfil próprio (PFP) |
| `/en/profile` | ✅ | Perfil próprio (PFP) em inglês |
| `/pt/profile/jogador` | ✅ | Perfil de terceiro (PF) |
| `/en/profile/foo123` | ✅ | Perfil de terceiro (PF) em inglês |
| `/pt/ranking` | ❌ | Página não coberta |
| `/pt/home` | ❌ | Página não coberta |
| `/api/goa-rank-status` | ❌ | Rota de API, não de página |

---

## Rotas do Popup (Extension Pages)

| URL | Arquivo | Descrição |
|---|---|---|
| `chrome-extension://[id]/popup.html` | `popup.js` + `popup.html` | Interface de configuração da extensão |

---

## Configuração de Permissões de URL (manifest.json)

```json
"content_scripts": [{
  "matches": ["https://fcabr.net/*"],
  "exclude_matches": ["https://fcabr.net/api/auth/*"]
}]
```

A extensão roda em todas as páginas de `fcabr.net`, exceto rotas de autenticação.

```json
"web_accessible_resources": [{
  "resources": ["scripts/content-scripts/inject.js"],
  "matches": ["https://fcabr.net/*"]
}]
```

`inject.js` é exposto como recurso acessível para que o content script possa referenciá-lo via `chrome.runtime.getURL`.
