# Dívidas Técnicas

## Classificação por Prioridade

### 🔴 Alta Prioridade

---

#### ~~TD-001: Dependência Circular entre `api-routes.js` e `routes/profile.js`~~ ✅ Resolvido

Criado `src/data/api-route-keys.js` com `storageKeyGoaRankStatus` e `RouteKeyProfile`, eliminando a dependência de `api-routes.js` em `routes/profile.js`.

---

#### TD-002: Race Condition no Boot — Dados de XP/Patente

**Arquivo:** `src/lib/storage-service.js`

**Comportamento do cache (intencional):** O `StorageService` usa `Map` em memória. Os dados existem enquanto a aba estiver aberta e são descartados ao fechar a página — comportamento correto e desejado. `chrome.storage.session` foi avaliado e descartado: não salva nem recupera dados de forma confiável neste contexto.

**Problema real — race condition no boot:**
- Página carrega → site faz `GET /api/goa-rank-status` → `inject.js` intercepta → `postMessage` → `content.js` grava no cache → `renderPage()`
- Se `renderPage()` rodar antes da resposta da API (DOMContentLoaded rápido + API lenta), o cartão não é renderizado na primeira tentativa
- Quando a API responde, `renderPage()` é chamado novamente — **normalmente resolve**
- Exceção: se o React destruir e recriar o DOM do cartão entre as duas tentativas, o `waitUntil` da segunda rodada pode selecionar o elemento errado ou atingir timeout

**Dados afetados:**

| Dado | Fonte | Situação |
|---|---|---|
| XP / patente (`goa-rank-status`) | Somente `fetch` interceptado por `inject.js` | ⚠️ Sujeito à race condition acima |
| Ranking de experiência | `inject.js` + `ExperienceRankingMonitor` (10min) | ✅ Monitor repopula independentemente |
| Ranking Fireteam (clã e jogador) | `inject.js` + `FireteamRankingMonitor` (10min) | ✅ Monitor repopula independentemente |

**Impacto:** Raro e restrito a dados de XP/patente; ocorre apenas quando a API responde devagar e o React recicla o DOM no intervalo. Na maioria dos casos a segunda chamada de `renderPage()` resolve.

**Solução em aberto:** `chrome.storage.session` e `sessionStorage` do site foram testados e ambos lançam `"Access to storage is not allowed from this context"` no contexto de content script. Alternativa viável: adicionar um monitor XHR proativo para `goa-rank-status` no boot, eliminando a dependência do timing do fetch interceptado — similar ao que os monitores de ranking já fazem.

---

### 🟡 Média Prioridade

---

#### TD-003: Seleção de Elementos DOM por Classes CSS (Frágil)

**Arquivo:** `src/lib/experience-card.js`

**Problema:** A localização dos elementos usa classes CSS utilitárias do Tailwind:
```js
element?.closest("div.rounded-lg")
".pt-2"
".bg-gradient-to-r"
"div.inline-flex.rounded.border > button"
```

Qualquer atualização de CSS no FCABR (refatoração, bump de Tailwind, mudança de framework) quebra silenciosamente a extensão.

**Impacto:** Alta frequência esperada de quebra em produção — manutenção reativa inevitável.

**Solução em aberto:** O site não expõe atributos `data-*` nem `aria-*` utilizáveis como âncoras estáveis. A única alternativa é traversal relativo a texto visível (ex.: encontrar o span com texto "Experiência"/"Experience" e subir na árvore), o que já é parcialmente feito mas ainda depende de classes para localizar a barra de progresso e o footer. Não há solução definitiva sem mudança no site.

---

#### ~~TD-004: `console.warn` em Produção~~ ✅ Resolvido

Os `console.warn` foram substituídos por `dwarn` (wrapper condicional a `__FCABR_DEBUG__`), que só emite logs em builds de desenvolvimento. Em produção o console do usuário permanece limpo.

---

#### ~~TD-005: `setInterval` de 200ms Rodando Continuamente~~ ✅ Resolvido

Intervalo aumentado de 200ms para 1000ms. O polling é fallback intencional para navegações SPA do Next.js que escapam dos patches de `pushState`/`replaceState` e do evento `popstate`. A diferença de responsividade é imperceptível para o usuário e o número de ticks foi reduzido em 5×.

---

#### ~~TD-006: Dois Métodos de Espera DOM com Semânticas Sobrepostas~~ ✅ Resolvido

`DOM.wait()` (MutationObserver) removido de `src/lib/dom.js`. Apenas `DOM.waitUntil()` (polling) permanece, eliminando a ambiguidade.

---

### 🟢 Baixa Prioridade

---

#### ~~TD-007: Ícones de Diferentes Tamanhos Apontando para o Mesmo Arquivo~~ ✅ Resolvido

Entradas `"16"` e `"32"` removidas de `manifest.json`. O objeto `icons` agora declara apenas os tamanhos com arquivos reais: `48` e `128`.

---

#### ~~TD-008: LICENSE.md Sem Licença Definida~~ ✅ Resolvido

Licença MIT adicionada — permissiva, sem restrições de uso, redistribuição ou modificação, mantendo apenas a exigência de atribuição de copyright.

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

#### ~~TD-011: Código Morto em `dom.js`~~ ✅ Resolvido

Todos os métodos sem uso externo removidos. `src/lib/dom.js` agora expõe apenas os três métodos efetivamente usados: `waitUntil`, `$$` e `byTextVisible`.

---

## Itens Não Encontrados

| Busca | Resultado |
|---|---|
| `TODO` | Não encontrado |
| `FIXME` | Não encontrado |
| `HACK` | Não encontrado |
| Componentes órfãos | Não aplicável (sem framework) |
| Endpoints sem uso | Vários métodos de `dom.js` (ver TD-011) |
| Variáveis não utilizadas | `RouteKeys.GoaRankStatus` em `content.js` (importado mas não usado diretamente) |
