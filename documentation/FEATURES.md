# Funcionalidades Implementadas

## Tabela de Funcionalidades

| # | Nome | Status | Arquivos |
|---|---|---|---|
| 1 | Interceptação de chamadas fetch | ✅ Implementada | `inject.js` |
| 2 | Roteamento de mensagens API | ✅ Implementada | `content.js`, `router.js`, `api-routes.js` |
| 3 | Roteamento de páginas | ✅ Implementada | `content.js`, `router.js`, `page-routes.js` |
| 4 | Detecção de navegação SPA | ✅ Implementada | `content.js` |
| 5 | Detecção de resize (mobile/desktop) | ✅ Implementada | `content.js` |
| 6 | Cache em memória de dados de API | ✅ Implementada | `storage-service.js` |
| 7 | Exibição da próxima patente no perfil | ✅ Implementada | `routes/profile.js`, `experience-card.js` |
| 8 | Suporte a perfil próprio (PFP) | ✅ Implementada | `routes/profile.js` |
| 9 | Suporte a perfil de terceiro (PF) | ✅ Implementada | `routes/profile.js` |
| 10 | Atualização da barra de progresso de XP | ✅ Implementada | `experience-card.js` |
| 11 | Internacionalização (pt/en) | ✅ Implementada | `translations/` |
| 12 | Toggle "Mostrar próxima patente" no popup | ✅ Implementada | `popup.js`, `popup.html` |
| 13 | Persistência de configurações | ✅ Implementada | `utils/index.js`, `popup.js` |
| 14 | Restrição de uso ao domínio fcabr.net | ✅ Implementada | `popup.js`, `manifest.json` |
| 15 | Espera assíncrona pelo elemento DOM | ✅ Implementada | `dom.js` |

---

## Detalhamento por Funcionalidade

---

### 1. Interceptação de Chamadas Fetch

**Objetivo:** Capturar respostas de API da página sem acesso direto ao código da página (que roda em contexto isolado).

**Arquivos:** `src/content-scripts/inject.js`

**Como funciona:**
- `content.js` cria uma tag `<script>` que carrega `inject.js` via `chrome.runtime.getURL`.
- `inject.js` roda no **Main World** da página (mesmo escopo que o código JavaScript do site).
- Substitui `window.fetch` por uma função wrapper que:
  1. Executa o fetch original.
  2. Filtra apenas URLs contendo `/api/`.
  3. Clona a resposta (evitando consumir o body original).
  4. Parseia o JSON e envia via `window.postMessage`.

**Limitação:** Funciona apenas com `fetch`. Chamadas via `XMLHttpRequest` não são interceptadas.

---

### 2. Roteamento de Mensagens API

**Objetivo:** Decidir o que fazer com cada mensagem de API recebida.

**Arquivos:** `content.js`, `router.js`, `api-routes.js`, `routekeys.js`

**Como funciona:**
- `content.js` filtra apenas mensagens com `source === "FCABR_EXTENSION"`.
- Itera sobre `apiRoutes`, testando a URL com `regex`.
- Se houver match, chama `route.storageKey(data)` para obter a chave de cache.
- Persiste no `StorageService` e dispara `renderPage()`.

**Rota ativa:**
```
Regex: /\/api\/goa-rank-status\?.*oidUser=\d+/
StorageKey fn: storageKeyGoaRankStatus (routes/profile.js)
```

---

### 3. Roteamento de Páginas

**Objetivo:** Mapear URLs de página para handlers específicos.

**Arquivos:** `router.js`, `page-routes.js`, `routes/profile.js`

**Rota ativa:**
```
Regex: /^\/[a-z]{2}\/profile(?:\/[^/]+)?\/?$/
Handler: profilePage
```

Exemplos de URLs que batem: `/pt/profile`, `/pt/profile/jogador123`, `/en/profile/foo`

---

### 4. Detecção de Navegação SPA

**Objetivo:** Reagir a mudanças de URL sem recarregamento de página.

**Arquivos:** `content.js`

**Mecanismos (3 camadas de segurança):**
1. Patch em `history.pushState` e `history.replaceState`
2. Listener em evento `popstate`
3. Polling a cada 200ms comparando `location.href` com `lastUrl`

---

### 5. Detecção de Resize

**Objetivo:** Re-renderizar quando o usuário muda entre modo mobile e desktop.

**Arquivos:** `content.js`

**Threshold:** `1023px` — abaixo é mobile, acima é desktop.

**Por que isso importa:** O layout do cartão de XP difere entre mobile e desktop, exigindo estratégias diferentes de seleção de elementos DOM.

---

### 6. Cache em Memória

**Objetivo:** Armazenar dados de API entre a interceptação e a renderização da página.

**Arquivos:** `storage-service.js`

**Implementação:** `Map` JavaScript com prefixo `"fcabr."` em todas as chaves.

**Limitação crítica:** Os dados são perdidos ao recarregar a página. Se o usuário acessa `/pt/profile/jogador` diretamente (sem navegar pelo site), a extensão não terá dados para exibir até que a API seja chamada novamente.

---

### 7. Exibição da Próxima Patente no Perfil

**Objetivo:** Mostrar no cartão de XP o XP base da patente atual, o XP restante para a próxima e a barra de progresso correta.

**Arquivos:** `routes/profile.js`, `experience-card.js`, `patents.js`, `dom.js`

**Fluxo interno:**
1. Lê dados do `StorageService`.
2. Valida que os dados pertencem ao perfil exibido.
3. Aguarda o elemento `.rounded-lg` com o label de XP aparecer no DOM (timeout 10s).
4. Localiza a patente atual na tabela `patents.js`.
5. Calcula `remaining = max(0, expNecessario - exp)`.
6. Calcula `progress = ((exp - baseXp) / (nextXp - baseXp)) * 100`.
7. Atualiza 3 `<span>` do footer do cartão e o `style.width` da barra.

---

### 8 & 9. Perfil Próprio (PFP) vs Perfil de Terceiro (PF)

**Objetivo:** Tratar de forma diferente o perfil do usuário logado e o perfil de outro jogador.

| Tipo | URL exemplo | Identificação | Chave de storage |
|---|---|---|---|
| PFP (Perfil Principal) | `/pt/profile` | ID numérico do `localStorage` | `goa-rank-status-{oidUser}` |
| PF (Perfil de Terceiro) | `/pt/profile/jogador` | Nickname da URL | `goa-rank-status-{nickname}` |

**Identificação do perfil principal:**
- Busca em `localStorage` uma chave que começa com `"selected-profile-"`.
- O valor é o `oidUser` (ID numérico do usuário logado).

---

### 11. Internacionalização

**Idiomas suportados:** Português (`pt`) e Inglês (`en`)

**Estratégia de resolução:**
1. Tenta extrair idioma do pathname (`/pt/...` → `pt`)
2. Fallback para `document.documentElement.lang`
3. Fallback final: `pt`

**Strings traduzidas:**

| Chave | PT | EN |
|---|---|---|
| `Profile.xp-label` | "Experiência" | "Experience" |
| `Profile.xp-label-btn` | "EXP" | "EXP" |
| `Profile.xp-remaining-bg` | "XP restante" | "XP remaining" |

---

### 12 & 13. Toggle de Configuração

**Objetivo:** Permitir ao usuário ativar/desativar a exibição da próxima patente.

**Armazenamento:** `chrome.storage.local` com chave `showNextPatent` (booleano).

**Valor padrão:** `true` (ativado).

**Comportamento do popup:**
- Exibe UI principal somente quando a aba ativa é `fcabr.net`.
- Exibe mensagem de "Uso restrito" em outros domínios.
- Salvar = persistir em storage + recarregar a aba + fechar popup.

---

## Funcionalidades Ausentes / Planejadas

Com base na análise do código, as seguintes funcionalidades **não** foram implementadas mas seriam naturais evoluções:

- Suporte a `XMLHttpRequest` (além de `fetch`)
- Múltiplas configurações no popup
- Cache persistente (dados sobrevivem ao reload)
- Suporte a mais páginas além de `/profile`
- Notificações quando patente é alcançada
- Histórico de progressão de XP
