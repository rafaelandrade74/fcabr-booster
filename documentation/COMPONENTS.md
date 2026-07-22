# Componentes e Módulos

Este projeto não usa um framework de UI. Os "componentes" são classes JavaScript e módulos ES que encapsulam responsabilidades específicas.

---

## `DOM` — `src/lib/dom.js`

**Tipo:** Classe estática utilitária

**Responsabilidade:** Abstração sobre a API nativa do DOM — seleção, busca por texto, espera assíncrona e navegação na árvore de elementos.

### Métodos

| Método | Assinatura | Descrição |
|---|---|---|
| `waitUntil` | `(fn, timeout=10000, interval=100) → Promise` | Polling assíncrono até `fn()` retornar truthy. Lança Error no timeout. |
| `wait` | `(predicate, timeout=10000) → Promise` | Aguarda elemento via MutationObserver. Mais eficiente que polling. |
| `$` | `(selector, parent=document)` | `querySelector` com escopo opcional |
| `$$` | `(selector, parent=document)` | `querySelectorAll` retornando array |
| `byText` | `(selector, text, parent)` | Encontra elemento pelo texto exato |
| `byTextVisible` | `(selector, text, parent)` | Idem, mas ignora elementos ocultos (`offsetParent === null`) |
| `containsText` | `(selector, text, parent)` | Encontra elemento que contém o texto |
| `closest` | `(element, selector)` | `element.closest` com null-safety |
| `parent` | `(element, levels=1)` | Sobe N níveis na árvore DOM |
| `exists` | `(selector, parent)` | Retorna booleano |
| `allText` | `(selector, parent)` | Array com `.textContent.trim()` de todos os matches |
| `attr` | `(selector, attribute, parent)` | Lê atributo do primeiro match |
| `html` | `(selector, parent)` | `innerHTML` do primeiro match |
| `text` | `(selector, parent)` | `textContent.trim()` do primeiro match |

### Observações
- Dois métodos de espera com filosofias diferentes: `waitUntil` (polling) e `wait` (MutationObserver). `waitUntil` é o usado na prática, mas `wait` é mais eficiente.
- Todos os métodos são estáticos — a classe não é instanciada.

---

## `ExperienceCard` — `src/lib/experience-card.js`

**Tipo:** Classe instanciável

**Responsabilidade:** Localizar o cartão de XP no DOM e atualizar seus valores.

### Construtor

```js
new ExperienceCard(translations, tipoPerfil)
```

- `translations` — objeto de strings localizadas
- `tipoPerfil` — `"PF"` (terceiro) ou `"PFP"` (próprio)

### Métodos Estáticos

| Método | Descrição |
|---|---|
| `findCardElementByName(translations, name)` | Despacha para o finder correto por tipo de perfil |
| `findCardElementPerfil(translations)` | Busca cartão para perfil de terceiro — span visível com texto "Experiência"/"Experience" dentro de `div.rounded-lg` |
| `findCardElementPerfilPrincipal(translations)` | Busca cartão para perfil próprio — botão visível com texto "EXP" dentro de `div.inline-flex.rounded.border > button`, depois sobe para `div.rounded-lg` |

### Métodos de Instância

| Método | Descrição |
|---|---|
| `getFooter()` | Retorna elemento `.pt-2` dentro do card |
| `getFooterSpans()` | Retorna array de `<span>` dentro do footer |
| `setBaseXp(xp)` | Atualiza `spans[0]` com XP base formatado |
| `setRemaining(xp)` | Atualiza `spans[1]` com XP restante + label localizado |
| `setNextXp(xp)` | Atualiza `spans[2]` com próximo XP formatado |
| `setProgress(currentXp, baseXp, nextXp)` | Calcula percentual e aplica `style.width` na barra `.bg-gradient-to-r` |

### Função auxiliar interna

```js
function formatXP(value, lang = "pt")
```

Formata número com separadores locais: `pt` → `"pt-BR"`, `en` → `"en-US"`.

### Dependências de seletor CSS (frágeis)

| Seletor | Uso |
|---|---|
| `div.rounded-lg` | Container do cartão de XP |
| `.pt-2` | Footer do cartão |
| `.bg-gradient-to-r` | Barra de progresso |
| `div.inline-flex.rounded.border > button` | Botão de aba XP no perfil próprio |

**Risco:** Qualquer mudança de CSS/classes pelo site FCABR quebra a localização dos elementos.

---

## `StorageService` — `src/lib/storage-service.js`

**Tipo:** Classe estática (singleton por módulo)

**Responsabilidade:** Cache em memória com prefixação de chaves para os dados de API interceptados.

### Propriedades

| Propriedade | Valor | Descrição |
|---|---|---|
| `prefix` | `"fcabr"` | Prefixo adicionado a todas as chaves |
| `cache` | `new Map()` | Armazenamento interno |

### Métodos

| Método | Descrição |
|---|---|
| `buildKey(key)` | Retorna `"fcabr.{key}"` |
| `set(key, value)` | Armazena no Map |
| `get(key)` | Recupera do Map |
| `has(key)` | Verifica existência |
| `remove(key)` | Remove do Map |
| `clear()` | Limpa tudo |
| `keys()` | Lista todas as chaves |
| `values()` | Lista todos os valores |
| `entries()` | Lista todos os pares |

**Limitação:** Cache volátil — dados perdidos ao recarregar a página.

---

## `initializeStoredValues` — `src/utils/index.js`

**Tipo:** Função assíncrona

**Responsabilidade:** Bootstrap de `chrome.storage.local`. Lê os valores armazenados, compara com os defaults, persiste os valores faltantes e retorna o estado mesclado.

```js
async function initializeStoredValues(defaultValues = {}) → Promise<Object>
```

**Comportamento:**
1. Se `chrome.storage.local` não estiver disponível (ex: fora de extensão), retorna `defaultValues` imediatamente.
2. Lê todo o storage (`get(null)`).
3. Identifica chaves ausentes no storage.
4. Persiste as ausentes.
5. Retorna `{ ...defaultValues, ...storedValues, ...missingValues }`.

**Nota:** A ordem de merge garante que valores armazenados sobrescrevem os defaults, e os recém-inseridos também ficam no resultado.

---

## Módulo de Traduções — `src/translations/`

**Tipo:** Módulo com funções exportadas

### Funções

| Função | Descrição |
|---|---|
| `getTranslations(pathname, documentLang)` | Retorna objeto de traduções para a língua detectada |
| `resolveSelectedLanguage(pathname, documentLang)` | Resolve o código de idioma (`"pt"` ou `"en"`) |
| `getTranslationsByLanguage(language)` | Retorna traduções diretamente por código de idioma |
