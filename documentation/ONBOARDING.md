# Onboarding — Guia para Novos Desenvolvedores

## Pré-requisitos

- Node.js 18+
- npm
- Chrome ou Firefox

---

## Setup Inicial

```bash
# 1. Instalar dependências
npm install

# 2. Build de produção
npm run build

# 3. Build com watch (recompila ao salvar)
npm run dev
```

O build gera a pasta `dist/`.

---

## Instalando a Extensão no Chrome

1. Abra `chrome://extensions`
2. Ative **Modo do desenvolvedor** (canto superior direito)
3. Clique em **Carregar sem compactação**
4. Selecione a pasta `dist/`

Para atualizar após um novo build: clique no ícone de refresh na extensão em `chrome://extensions`.

---

## Instalando no Firefox

1. Abra `about:debugging#/runtime/this-firefox`
2. Clique em **Carregar extensão temporária**
3. Selecione o arquivo `dist/manifest.json`

---

## Estrutura Mental do Projeto

```
Problema: O site FCABR não mostra corretamente o XP base e a barra de progresso.

Solução:
  1. Interceptar a API do site antes que o site a consuma
  2. Guardar os dados em memória
  3. Quando a página de perfil carregar, reescrever os valores no DOM
```

---

## Fluxo de Desenvolvimento Típico

### Cenário 1: Adicionar suporte a uma nova página

1. Criar o handler em `src/content-scripts/routes/minha-pagina.js`
2. Registrar a rota em `src/data/page-routes.js`:
   ```js
   { regex: /^\/[a-z]{2}\/minha-pagina/, handler: minhaPagina }
   ```
3. Se precisar de dados de uma nova API, adicionar a rota em `src/data/api-routes.js`:
   ```js
   { regex: /\/api\/meu-endpoint/, storageKey: minhaStorageKeyFn }
   ```

### Cenário 2: Adicionar uma nova configuração

1. Adicionar o default em `src/utils/settings.js`:
   ```js
   export const DEFAULT_SETTINGS = {
     showNextPatent: true,
     minhaNovaConfig: false  // novo
   };
   ```
2. Adicionar o controle no popup HTML (`src/options/popup.html`)
3. Adicionar a lógica no popup JS (`src/options/popup.js`)
4. Consumir a configuração onde necessário via `initializeStoredValues`

### Cenário 3: Atualizar a tabela de patentes

Editar `src/data/patents.js` e adicionar/modificar as entradas conforme o jogo atualizar.

---

## Depuração

### Content Script / inject.js
- Abra as DevTools da aba do fcabr.net (F12)
- Em **Console**, selecione o contexto `"FCABR Booster"` (ou `"content script"`)
- `inject.js` roda no contexto da página principal

### Popup
- Clique com botão direito no ícone da extensão → **Inspecionar popup**

### Ver dados no StorageService
No console do content script:
```js
// O StorageService é um módulo — não acessível diretamente pelo console
// Adicionar temporariamente ao content.js para debug:
window.__fcabrCache = StorageService;
```

### Ver `chrome.storage.local`
No console do popup:
```js
chrome.storage.local.get(null, console.log)
```

---

## Armadilhas Conhecidas

### O cartão de XP não aparece
- Verifique se `showNextPatent` está `true` em `chrome.storage.local`
- Verifique se a API `/api/goa-rank-status` foi chamada (monitor no DevTools → Network)
- Verifique se o nome da patente no `data.patenteAtual` bate com um entry em `patents.js`

### Dados não aparecem após recarregar
- O `StorageService` é volátil. Os dados são perdidos ao recarregar.
- A extensão só funciona se a API for chamada **enquanto a extensão está ativa na aba**.

### Extensão não funciona em outras URLs
- Intencional. O `manifest.json` restringe a execução a `https://fcabr.net/*`.

### Mudança de CSS no FCABR quebrou a extensão
- Verifique os seletores em `experience-card.js` contra o DOM atual do site.

---

## Arquivos Mais Importantes

| Prioridade | Arquivo | Por quê |
|---|---|---|
| 1 | `src/content-scripts/content.js` | Orquestrador central |
| 2 | `src/content-scripts/routes/profile.js` | Handler da única feature ativa |
| 3 | `src/lib/experience-card.js` | Manipulação visual — quebra com CSS changes |
| 4 | `src/data/patents.js` | Tabela de dados de negócio |
| 5 | `manifest.json` | Permissões e entry points da extensão |
