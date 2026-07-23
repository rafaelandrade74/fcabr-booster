# Funcionalidades Implementadas

## Tabela de Funcionalidades

| # | Nome | Status | Arquivos |
|---|---|---|---|
| 1 | Interceptação de chamadas fetch | ✅ Implementada | `inject.js` |
| 2 | Roteamento de mensagens API | ✅ Implementada | `content.js`, `router.js`, `api-routes.js` |
| 3 | Roteamento de páginas | ✅ Implementada | `content.js`, `router.js`, `page-routes.js` |
| 4 | Detecção de navegação SPA | ✅ Implementada | `content.js` |
| 5 | Detecção de troca de perfil | ✅ Implementada | `content.js`, `monitor-manager.js` |
| 6 | Detecção de resize (mobile/desktop) | ✅ Implementada | `content.js` |
| 7 | Cache em memória de dados de API | ✅ Implementada | `storage-service.js` |
| 8 | Exibição da próxima patente no perfil | ✅ Implementada | `routes/profile.js`, `experience-card.js` |
| 9 | Suporte a perfil próprio (PFP) | ✅ Implementada | `routes/profile.js` |
| 10 | Suporte a perfil de terceiro (PF) | ✅ Implementada | `routes/profile.js` |
| 11 | Atualização da barra de progresso de XP | ✅ Implementada | `experience-card.js` |
| 12 | Badge de ranking de experiência | ✅ Implementada | `routes/profile.js`, `experience-card.js` |
| 13 | Monitor periódico de ranking de experiência | ✅ Implementada | `monitor-manager.js` |
| 14 | Monitor periódico de ranking Fireteam | ✅ Implementada | `monitor-manager.js` |
| 15 | Card Fireteam no perfil | ✅ Implementada | `routes/profile.js`, `fireteam-card.js` |
| 16 | Exibição de zeros quando sem dados de ranking | ✅ Implementada | `routes/profile.js`, `fireteam-card.js`, `experience-card.js` |
| 17 | Internacionalização (pt/en) | ✅ Implementada | `translations/` |
| 18 | Popup com configurações por seção | ✅ Implementada | `popup.js`, `popup.html` |
| 19 | Persistência de configurações | ✅ Implementada | `utils/index.js`, `popup.js` |
| 20 | Restrição de uso ao domínio fcabr.net | ✅ Implementada | `popup.js`, `manifest.json` |
| 21 | Espera assíncrona pelo elemento DOM | ✅ Implementada | `dom.js` |
| 22 | Ajuste de altura do card lateral "Em breve" | ✅ Implementada | `routes/profile.js` |
| 23 | Build + release zip via npm | ✅ Implementada | `scripts/release.js`, `package.json` |

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

**Limitação:** Funciona apenas com `fetch`. Chamadas via `XMLHttpRequest` não são interceptadas (os monitores usam XHR justamente para evitar o loop de interceptação).

---

### 2. Roteamento de Mensagens API

**Objetivo:** Decidir o que fazer com cada mensagem de API recebida.

**Arquivos:** `content.js`, `router.js`, `api-routes.js`, `routekeys.js`

**Como funciona:**
- `content.js` filtra apenas mensagens com `source === "FCABR_EXTENSION"`.
- Itera sobre `apiRoutes`, testando a URL com `regex`.
- Se houver match, chama `route.storageKey(data)` para obter a(s) chave(s) de cache.
- Suporta retorno de array de chaves — armazena sob todas elas e dispara `renderPage()`.

**Rotas ativas:**
```
/\/api\/goa-rank-status\?.*oidUser=\d+/   → storageKeyGoaRankStatus
fcabr://ranking/experience-position        → storageKeyExperienceRankingPosition
fcabr://ranking/fireteam/clan              → storageKeyFireteamClan
fcabr://ranking/fireteam/clan/player       → storageKeyFireteamClanPlayer
fcabr://ranking/fireteam/user-clan         → storageKeyFireteamUserClan
```

---

### 3. Roteamento de Páginas

**Objetivo:** Mapear URLs de página para handlers específicos.

**Rota ativa:**
```
Regex: /^\/[a-z]{2}\/profile(?:\/[^/]+)?\/?$/
Handler: profilePage
```

---

### 4. Detecção de Navegação SPA

**Mecanismos (3 camadas):**
1. Patch em `history.pushState` e `history.replaceState`
2. Listener em evento `popstate`
3. Polling a cada 200ms comparando `location.href` com `lastUrl`

---

### 5. Detecção de Troca de Perfil

**Objetivo:** Reagir quando o usuário troca entre seus perfis ("bonecos") sem mudar a URL.

**Duas camadas:**

| Camada | Arquivo | Ação |
|---|---|---|
| `content.js` | Intercepta `localStorage.setItem` | Chama `renderPage()` imediatamente quando `selected-profile-*` é escrito |
| `monitor-manager.js` | Polling de 1 segundo do `oidUser` | Quando detecta mudança, chama `manager.refresh()` para re-executar todos os monitores |

---

### 8, 9, 10. Progressão de Patente no Perfil

**Fluxo interno:**
1. Lê dados do `StorageService`.
2. Aguarda o elemento `.rounded-lg` com o label de XP aparecer no DOM (timeout 10s).
3. Localiza a patente atual na tabela `patents.js`.
4. Calcula `remaining = max(0, expNecessario - exp)`.
5. Calcula `progress = ((exp - baseXp) / (nextXp - baseXp)) * 100`.
6. Atualiza 3 `<span>` do footer e o `style.width` da barra.

**Exemplo:**
```
patenteAtual: "1º MAJOR" | exp: 1.459.900 | expNecessario: 1.533.000
baseXp = 1.400.000 | remaining = 73.100 | progress ≈ 45%
```

---

### 12. Badge de Ranking de Experiência

**Comportamento:**

| Situação | Exibição |
|---|---|
| Jogador está no ranking (top 1000) | `Top #N` |
| Jogador não está no ranking | `Top +1000` |
| `showExperienceRanking` desativado | Não exibe |

**Só aparece no perfil próprio (PFP).**

---

### 13 & 14. Monitores Periódicos (`monitor-manager.js`)

**Objetivo:** Buscar dados de ranking que não são expostos pelo fluxo normal de fetch da página.

**Arquitetura:**
- Roda como script de página (Main World) — usa `XMLHttpRequest` para não ser interceptado pelo próprio `inject.js`.
- Dois monitores independentes com intervalo mínimo de 10 minutos.
- Re-executa imediatamente ao detectar troca de perfil.

**ExperienceRankingMonitor:**
1. Obtém `oidUser` do `localStorage`.
2. Busca `ranking/player?tab=experience&pageSize=1000`.
3. Encontra o jogador na lista e publica a posição via `postMessage`.

**FireteamRankingMonitor:**
1. Obtém `oidUser` do `localStorage`.
2. Busca perfil do usuário → obtém `oidGuild`.
3. Busca ranking de clãs Fireteam → obtém rank e `currentWeekID`.
4. Busca jogadores do clã na semana → obtém rank e pontos do jogador.
5. Publica dados do clã e do jogador via `postMessage`.

---

### 15 & 16. Card Fireteam

**Componente:** `FireteamCard` — renderizado após o cartão de XP no perfil próprio.

**Sub-cards:** Clã e Jogador (exibidos apenas quando as respectivas features estão ativas no popup).

**Comportamento quando sem dados:**
- Renderiza os campos habilitados com valor `"0"` (em vez de ocultar o card).
- Garante que o usuário veja que a feature está ativa mesmo sem dados de ranking.

---

### 17. Internacionalização

**Idiomas suportados:** Português (`pt`) e Inglês (`en`)

**Estratégia de resolução:**
1. Tenta extrair idioma do pathname (`/pt/...` → `pt`)
2. Fallback para `document.documentElement.lang`
3. Fallback final: `pt`

---

### 18. Popup de Configurações

**Seções:**
- **Patente** — toggle para mostrar progressão de XP
- **Ranking de Experiência** — toggle + intervalo de atualização
- **Fireteam** — toggles individuais para posição do clã, pontos do clã, posição do jogador, pontos do jogador, XP do jogador

**Comportamento:** Auto-save ao fechar o popup; recarrega a aba automaticamente.

---

### 23. Build + Release

```bash
npm run build    # gera dist/
npm run release  # gera dist/ + release-v{version}.zip
```

O zip é gerado pelo `scripts/release.js` usando `archiver@6` e é ignorado pelo git.
