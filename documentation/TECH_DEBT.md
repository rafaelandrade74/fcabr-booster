# Dívidas Técnicas

## Classificação por Prioridade

### 🔴 Alta Prioridade

---

#### ~~TD-001: Dependência Circular entre `api-routes.js` e `routes/profile.js`~~ ✅ Resolvido

Criado `src/data/api-route-keys.js` com `storageKeyGoaRankStatus` e `RouteKeyProfile`, eliminando a dependência de `api-routes.js` em `routes/profile.js`.

---

#### TD-002: Cache Volátil — Dados de XP/Patente Perdidos ao Recarregar

**Arquivo:** `src/lib/storage-service.js`

**Problema:** O `StorageService` usa um `Map` em memória — os dados são perdidos a cada reload ou navegação direta para a URL. O cache só é populado quando `inject.js` intercepta a resposta de uma chamada `fetch` da própria página.

**Race condition no boot:**
- Página carrega → site faz a chamada `GET /api/goa-rank-status` → `inject.js` intercepta → `postMessage` → `content.js` grava no cache → `renderPage()`
- Se `renderPage()` rodar antes da resposta da API (DOMContentLoaded rápido + API lenta), o cartão não é renderizado na primeira tentativa
- Quando a API responde, `renderPage()` é chamado novamente — **normalmente resolve**
- Exceção: se o DOM do cartão de XP for destruído e recriado pelo React entre as duas tentativas, o `waitUntil` da segunda rodada pode selecionar o elemento errado ou falhar no timeout

**Dados afetados por gravidade:**

| Dado | Fonte | Mitigação atual |
|---|---|---|
| XP / patente (`goa-rank-status`) | Somente `fetch` interceptado por `inject.js` | ⚠️ Nenhuma — depende do timing da API |
| Ranking de experiência | `inject.js` + `ExperienceRankingMonitor` (10min) | ✅ Monitor repopula mesmo após reload |
| Ranking Fireteam (clã e jogador) | `inject.js` + `FireteamRankingMonitor` (10min) | ✅ Monitor repopula mesmo após reload |

**Impacto real:** Restrito a dados de XP/patente em navegações diretas com timing desfavorável. Dados de ranking são cobertos pelos monitores periódicos.

**Solução sugerida:** `chrome.storage.session` (MV3) para persistir dados de XP/patente entre navegações sem reexigir a interceptação do fetch.

---

### 🟡 Média Prioridade

---

#### TD-003: Seleção de Elementos DOM por Classes CSS (Frágil)

**Arquivo:** `src/lib/experience-card.js`

**Problema:** A localização dos elementos usa classes CSS do site:
```js
element?.closest("div.rounded-lg")
".pt-2"
".bg-gradient-to-r"
"div.inline-flex.rounded.border > button"
```

Qualquer atualização de CSS no FCABR (refatoração, mudança de framework, atualização de Tailwind) quebra silenciosamente a extensão.

**Impacto:** Alta frequência esperada de quebra em produção.

**Solução sugerida:** Usar atributos `data-*` via DOM traversal relativo ao texto localizado, ou `aria-*` attributes que são mais estáveis.

---

#### TD-004: `console.warn` em Produção

**Arquivo:** `src/lib/experience-card.js`

**Problema:**
```js
console.warn("Base XP is undefined or null");
console.warn("Remaining XP is undefined or null");
console.warn("Next XP is undefined or null");
```

Logs em produção expõem detalhes internos da extensão no console do usuário.

**Solução sugerida:** Remover ou condicionar a uma flag `DEBUG`.

---

#### TD-005: `setInterval` de 200ms Rodando Continuamente

**Arquivo:** `src/content-scripts/content.js`

**Situação atual:**
```js
// Fallback para casos onde o framework altera a URL sem disparar os eventos acima
setInterval(checkUrlChange, 200);
```

O intervalo é intencional e está documentado no código — existe como último recurso para navegações SPA que escapam dos patches de `pushState`/`replaceState` e do evento `popstate`. O Next.js (usado pelo fcabr.net) pode alterar a URL via Router interno sem passar pelos mecanismos padrão em alguns cenários (ex.: shallow routing, prefetch).

**Impacto real:** Baixo. `checkUrlChange` é uma função trivial (`location.href === lastUrl ? return : renderPage()`); o custo por tick é desprezível. O impacto de falso negativo (não detectar a navegação) seria maior do que o custo do polling.

**Possível melhoria:** Aumentar o intervalo para 1000ms — a diferença de responsividade seria imperceptível para o usuário e reduziria o número de ticks em 5×. Remover completamente só seria seguro após confirmar que os patches cobrem 100% das navegações do Next.js em uso.

---

#### TD-006: Dois Métodos de Espera DOM com Semânticas Sobrepostas

**Arquivo:** `src/lib/dom.js`

**Problema:**
- `DOM.waitUntil()` — polling com `setTimeout`
- `DOM.wait()` — `MutationObserver`

Apenas `waitUntil` é usado (`routes/profile.js`). `DOM.wait()` é código morto.

**Impacto:** Confusão para novos desenvolvedores sobre qual usar.

**Solução sugerida:** Remover `DOM.wait()` ou documentar quando usar cada um.

---

### 🟢 Baixa Prioridade

---

#### TD-007: Ícones de Diferentes Tamanhos Apontando para o Mesmo Arquivo

**Arquivo:** `manifest.json`

**Problema:**
```json
"icons": {
  "16": "images/icon-48.png",
  "32": "images/icon-48.png",
  "48": "images/icon-48.png",
  "128": "images/icon-128.png"
}
```

Ícones de 16px e 32px apontam para um arquivo de 48px. O navegador vai redimensionar.

**Solução sugerida:** Criar ícones específicos para cada tamanho.

---

#### TD-008: LICENSE.md Sem Licença Definida

**Arquivo:** `LICENSE.md`

**Conteúdo atual:**
```
Licença a definir pelo projeto.
```

**Impacto:** Legalmente ambíguo. Sem licença, o código é "all rights reserved" por default.

---

#### ~~TD-009: CHANGELOG.md Incompleto~~ ✅ Resolvido

CHANGELOG atualizado e mantido a partir da v0.4.1. Versões 0.1.0 a 0.4.2 documentadas; seção `## Unreleased` em uso para mudanças ainda sem número de versão.

---

#### TD-010: Sem Testes

Nenhum arquivo de teste existe no projeto. Zero cobertura de testes unitários ou de integração.

**Funções que se beneficiariam de testes:**
- `storageKeyGoaRankStatus` (lógica de resolução de chave)
- `resolveSelectedLanguage` (lógica de idioma)
- `profilePage` (fluxo principal, com DOM mockado)
- `ExperienceCard.setProgress` (cálculo de percentual)
- `initializeStoredValues` (merge de configurações)

---

#### TD-011: Código Morto em `dom.js`

**Arquivo:** `src/lib/dom.js`

Os métodos abaixo existem mas não são referenciados em nenhum outro arquivo:

| Método | Referenciado? |
|---|---|
| `DOM.wait()` | ❌ Não |
| `DOM.exists()` | ❌ Não |
| `DOM.allText()` | ❌ Não |
| `DOM.attr()` | ❌ Não |
| `DOM.html()` | ❌ Não |
| `DOM.text()` | ❌ Não |
| `DOM.parent()` | ❌ Não |
| `DOM.containsText()` | ❌ Não |

**Sugestão:** Manter apenas os usados ou documentar como biblioteca para uso futuro.

---

## Itens Não Encontrados

| Busca | Resultado |
|---|---|
| `TODO` | Não encontrado |
| `FIXME` | Não encontrado |
| `HACK` | Não encontrado |
| Componentes órfãos | Não aplicável (sem framework) |
| Endpoints sem uso | `DOM.wait()` e vários métodos de `dom.js` |
| Variáveis não utilizadas | `RouteKeys.GoaRankStatus` em `content.js` (importado mas não usado diretamente) |
