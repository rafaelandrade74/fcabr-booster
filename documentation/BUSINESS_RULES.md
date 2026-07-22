# Regras de Negócio

## Domínio: Patentes GOA

### RN-001: Apenas domínio fcabr.net
A extensão só opera no domínio `https://fcabr.net`. Em qualquer outro domínio, o popup exibe mensagem de restrição e nenhum script é injetado (pelo `manifest.json`).

### RN-002: Exclusão de rotas de autenticação
O content script é excluído de `https://fcabr.net/api/auth/*` para não interferir no processo de login.

### RN-003: Tabela de patentes estática
A extensão mantém sua própria tabela com 11 patentes GOA (IDs 56–66). O XP base de cada patente (`targetXp`) é o ponto de partida da progressão naquele nível.

### RN-004: Determinação do XP base
O XP base é lido da tabela interna pela patente atual do jogador (`patenteAtual`). Não se usa o campo da API para isso — a API fornece `expNecessario` (próxima patente), não o `targetXp` atual.

### RN-005: Cálculo do XP restante
```
remaining = max(0, expNecessario - exp)
```
O `max(0, ...)` garante que nunca exiba negativo (caso `exp > expNecessario`).

### RN-006: Cálculo da barra de progresso
```
percent = ((exp - baseXp) / (nextXp - baseXp)) * 100
percent = clamp(percent, 0, 100)
```
Onde:
- `baseXp` = `targetXp` da patente atual (tabela interna)
- `nextXp` = `expNecessario` da API

### RN-007: Fallback quando `expNecessario` é null
```js
const nextExperiencePoints = data.data.expNecessario || currentExperiencePoints;
```
Se a API não retornar `expNecessario`, usa `exp` atual como next, resultando em progresso de 100% e remaining de 0.

### RN-008: Distinção entre perfil próprio e de terceiro
- **Perfil próprio** (`/pt/profile`): identificado pelo `oidUser` do `localStorage`.
- **Perfil de terceiro** (`/pt/profile/nickname`): identificado pelo nickname na URL.

### RN-009: Validação de dados do perfil
Ao renderizar um perfil de terceiro, a extensão verifica:
```js
if (tipoPagina === "PF" && data.data.nickname !== playerName) return;
```
Isso evita exibir dados de um jogador no perfil de outro (possível colisão de cache se dois perfis forem visitados rapidamente).

### RN-010: Feature flag `showNextPatent`
A funcionalidade toda pode ser desligada pelo usuário via popup. Default é `true`.

### RN-011: Timeout de 10 segundos para o DOM
A extensão espera até 10 segundos pelo cartão de XP aparecer no DOM. Se não aparecer, silenciosamente não faz nada.

### RN-012: Formatação numérica localizada
XP é formatado conforme o idioma:
- Português: `50.000.000` (separador de milhar: ponto)
- Inglês: `50,000,000` (separador de milhar: vírgula)

### RN-013: Resolução de idioma
O idioma é determinado pelo prefixo do pathname (`/pt/` ou `/en/`). Fallback para o atributo `lang` do documento HTML. Fallback final: português.

### RN-014: Rerenderização ao mudar tamanho de tela
A extensão rerenderiza ao cruzar o threshold de 1023px (mobile ↔ desktop), pois o layout do cartão de XP difere entre os dois modos.

### RN-015: Rerenderização ao navegar (SPA)
Toda mudança de URL dentro do site dispara nova tentativa de renderização, permitindo que a extensão funcione mesmo em navegação sem reload.

## Domínio: Configuração

### RN-016: Valores default de configuração
```js
DEFAULT_SETTINGS = { showNextPatent: true }
```
Ao instalar a extensão, ou se a chave não existir, `showNextPatent` é automaticamente inicializado como `true`.

### RN-017: Salvar configuração recarrega a página
Para que a nova configuração entre em vigor imediatamente, o popup recarrega a aba ativa após salvar.
