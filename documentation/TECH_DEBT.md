# Dívidas Técnicas

## Classificação por Prioridade

### 🔴 Alta Prioridade

---

#### TD-001: Dependência Circular entre `api-routes.js` e `routes/profile.js`

**Arquivo:** `src/data/api-routes.js` ↔ `src/content-scripts/routes/profile.js`

**Problema:**
- `api-routes.js` importa `storageKeyGoaRankStatus` de `routes/profile.js`.
- `routes/profile.js` importa `RouteKeys` de `data/routekeys.js`.
- `content.js` importa `router.js` que importa `api-routes.js` que importa `profile.js`.
- `profile.js` é um handler de página — misturar responsabilidades de "como calcular a chave de storage" com "como renderizar a página" é uma violação do SRP.

**Impacto:** A função `storageKeyGoaRankStatus` está no arquivo errado. Ela pertence a `api-routes.js` ou a um arquivo de utils de rota.

**Solução sugerida:** Mover `storageKeyGoaRankStatus` e `RouteKeyProfile` para `api-routes.js` ou criar `src/data/api-route-keys.js`.

---

#### TD-002: Cache Volátil — Dados Perdidos ao Recarregar

**Arquivo:** `src/lib/storage-service.js`

**Problema:** O `StorageService` usa um `Map` em memória. Se o usuário acessa `/pt/profile/jogador` diretamente (digitando a URL), a API é chamada pelo site, mas a resposta pode chegar antes que o listener esteja pronto, ou o cache pode estar vazio.

Na prática, o fluxo é: página carrega → API é chamada → resposta interceptada → cache populado → página renderizada. Mas há uma race condition sutil:

- Se `DOMContentLoaded` dispara antes da resposta da API, `renderPage()` roda com cache vazio.
- Quando a API responde, `renderPage()` é chamado novamente — isso funciona.
- Mas se o DOM do cartão de XP já foi renderizado e destruído/recriado antes disso, o `waitUntil` pode falhar.

**Impacto:** Possível não-renderização em alguns cenários de timing.

**Solução sugerida:** `chrome.storage.session` (MV3) para cache entre navegações sem exigir reload.

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

**Problema:**
```js
setInterval(checkUrlChange, 200);
```

Este intervalo roda indefinidamente enquanto a aba estiver aberta, verificando se a URL mudou. Consome CPU a cada 200ms mesmo quando o usuário não está navegando.

**Impacto:** Pequeno impacto de performance, mas é um anti-padrão.

**Solução sugerida:** Os patches em `pushState`/`replaceState` + `popstate` já cobrem 99% dos casos. O polling poderia ser removido ou ter seu intervalo aumentado para 1000ms.

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

#### TD-009: CHANGELOG.md Incompleto

**Arquivo:** `CHANGELOG.md`

Documenta apenas a versão `0.1.0`, mas o `manifest.json` está na `0.1.2`. As mudanças das versões `0.1.1` e `0.1.2` não estão documentadas.

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
