# Segurança

## Análise do Modelo de Segurança de Extensões MV3

Manifest V3 (MV3) traz melhorias de segurança em relação ao MV2:
- Sem `eval()` ou código dinâmico remoto em content scripts.
- `web_accessible_resources` restringe quais recursos são expostos.
- Sem background pages persistentes (service workers).

---

## Análise por Área

### Isolamento de Contextos

| Aspecto | Implementação | Avaliação |
|---|---|---|
| Content script em Isolated World | Sim (padrão MV3) | ✅ Correto |
| inject.js em Main World (necessário) | Sim, via tag `<script>` | ⚠️ Necessário mas é o vetor mais sensível |
| Comunicação Main→Isolated via postMessage | Sim | ✅ Correto para MV3 |

### Validação de Mensagens postMessage

**Código:**
```js
// content.js (Isolated World) — gera tokens únicos por sessão
const PAGE_TOKEN = crypto.randomUUID();
const MANAGER_TOKEN = crypto.randomUUID();

// token passado via data-* antes de inserir o <script> no DOM
script.dataset.fcabrToken = PAGE_TOKEN;

// inject.js / monitor-manager.js (Main World) — lê token na inicialização
const TOKEN = document.currentScript?.dataset.fcabrToken;

// validação no listener do content script
window.addEventListener("message", async event => {
    if (event.source !== window) return;
    if (event.data?.source !== "FCABR_EXTENSION") return;
    if (event.data?.token !== PAGE_TOKEN) return;  // ← autenticação por token
    ...
});
```

**Análise:**
- `event.source !== window`: filtra mensagens de iframes e outros frames. ✅
- `event.data?.source !== "FCABR_EXTENSION"`: tag de identificação. ✅
- `event.data?.token !== PAGE_TOKEN`: token UUID gerado no Isolated World, inacessível a scripts de página. ✅

**Por que funciona:** Os tokens são gerados com `crypto.randomUUID()` dentro do content script, que roda no Isolated World — scripts de página não têm acesso a essa memória. Os tokens são compartilhados com os scripts injetados exclusivamente via atributo `data-*` no momento da inserção do `<script>`, e o elemento é removido imediatamente após a carga.

**Canais protegidos:**

| Canal | Token | Direção |
|---|---|---|
| `inject.js` → `content.js` | `PAGE_TOKEN` | page → content |
| `monitor-manager.js` → `content.js` | `PAGE_TOKEN` | page → content |
| `content.js` → `monitor-manager.js` (CONFIG_UPDATE) | `MANAGER_TOKEN` | content → page |

---

### XSS (Cross-Site Scripting)

**Vetores analisados:**

| Local | Dado externo | Proteção |
|---|---|---|
| `spans[0..2].textContent` | `data.exp`, `data.expNecessario` | ✅ `.textContent` não parseia HTML |
| `progressBar.style.width` | Valor calculado numericamente | ✅ Valor clampado entre 0-100 |
| Labels de tradução | Strings estáticas em arquivos locais | ✅ Não vem de dados externos |

**Conclusão:** Sem risco de XSS. A extensão usa `.textContent` (não `.innerHTML`) e `style.width` com valor numérico calculado.

---

### Acesso a `localStorage` da Página

**Código:**
```js
const profileKey = Object.keys(localStorage)
    .find(k => k.startsWith("selected-profile-"));
const profileValue = Number(localStorage.getItem(profileKey));
```

**Análise:**
- Lê, mas nunca escreve no `localStorage` do site. ✅
- Usa `Number()` para sanitizar o valor, evitando uso de strings arbitrárias como chave. ✅
- `Number.isNaN` verificado antes do uso. ✅

---

### Permissões da Extensão

**Permissões declaradas:**
```json
"permissions": ["tabs", "storage"]
```

| Permissão | Necessidade | Justificativa |
|---|---|---|
| `tabs` | ✅ Mínima | Necessária para `chrome.tabs.query` e `chrome.tabs.reload` no popup |
| `storage` | ✅ Mínima | Necessária para `chrome.storage.local` |

Sem `host_permissions` declaradas além do `matches` do content script. ✅

---

### Integridade do Fetch Interceptado

`inject.js` usa `response.clone()` antes de ler o JSON, garantindo que a resposta original não seja consumida e o site funcione normalmente. ✅

---

### CORS / Requisições Externas

A extensão não faz nenhuma requisição HTTP própria. Não há risco de CORS. ✅

---

### Dados Sensíveis

| Dado | Armazenado em | Sensível? |
|---|---|---|
| `showNextPatent` | `chrome.storage.local` | ❌ Não sensível |
| Dados de XP/patente | `StorageService` (memória) | ❌ Dados públicos de gameplay |
| `oidUser` | Memória + chave de cache | ⚠️ ID de usuário, mas apenas em memória de sessão |

Nenhum dado sensível (tokens, senhas, dados pessoais) é tratado pela extensão. ✅

---

## Resumo de Riscos

| Risco | Severidade | Exploitabilidade | Status |
|---|---|---|---|
| Injeção de dados via postMessage forjado | Baixa | Requer JS na página | ✅ Corrigido — tokens UUID por sessão |
| Quebra de layout por mudança CSS do FCABR | Média | Automática | Sem mitigação |
| Dados ausentes (cache volátil) | Média | Ao recarregar | Limitação conhecida |
| Exposição de oidUser | Muito baixa | Apenas em memória | Aceitável |
