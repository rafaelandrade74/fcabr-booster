# Fluxos de Execução

## 1. Fluxo de Inicialização da Extensão

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant Content as content.js
    participant Inject as inject.js
    participant Monitor as monitor-manager.js
    participant Page as fcabr.net

    Browser->>Content: Carrega content script (document_start)
    Content->>Page: Cria <script src="inject.js"> e insere no <head>
    Page->>Inject: Executa inject.js no Main World
    Inject->>Page: Monkey-patch window.fetch
    Content->>Page: Cria <script src="monitor-manager.js"> (se features ativas)
    Page->>Monitor: Executa monitor-manager.js no Main World
    Monitor->>Monitor: Inicia ExperienceRankingMonitor e/ou FireteamRankingMonitor
    Monitor->>Monitor: Inicia polling de 1s para detectar troca de perfil
    Content->>Content: Intercepta localStorage.setItem
    Content->>Content: Registra listener "message"
    Content->>Content: Aguarda DOMContentLoaded
    Content->>Content: Monkey-patch history.pushState/replaceState
    Content->>Content: Inicia polling de URL (200ms)
    Content->>Content: Chama renderPage() inicial
```

---

## 2. Fluxo de Interceptação de API (fetch)

```mermaid
sequenceDiagram
    participant Page as Código da Página
    participant Inject as inject.js (Main World)
    participant Content as content.js (Isolated)
    participant Storage as StorageService
    participant Profile as routes/profile.js

    Page->>Inject: fetch("/api/goa-rank-status?oidUser=123")
    Inject->>Page: Chama fetch original
    Page-->>Inject: Response
    Inject->>Inject: Clona response e parseia JSON
    Inject->>Content: postMessage({source:"FCABR_EXTENSION", url, data})
    Content->>Content: Encontra apiRoute via regex
    Content->>Profile: storageKeyGoaRankStatus(data)
    Profile-->>Content: [keyByOidUser, keyByNickname]
    Content->>Storage: StorageService.set(keyByOidUser, data)
    Content->>Storage: StorageService.set(keyByNickname, data)
    Content->>Content: renderPage()
```

---

## 3. Fluxo dos Monitores Periódicos

```mermaid
sequenceDiagram
    participant Monitor as monitor-manager.js
    participant API as fcabr.net/api
    participant Content as content.js
    participant Storage as StorageService

    Monitor->>Monitor: setInterval(execute, 600s)
    Monitor->>Monitor: getCurrentUserId() → oidUser

    alt ExperienceRankingMonitor
        Monitor->>API: XHR GET /ranking/player?tab=experience&pageSize=1000
        API-->>Monitor: Lista de jogadores com ranks
        Monitor->>Monitor: Encontra jogador por oidUser
        Monitor->>Content: postMessage({url:"fcabr://ranking/experience-position", data})
    end

    alt FireteamRankingMonitor
        Monitor->>API: XHR GET /profile?userId={oidUser}
        API-->>Monitor: {oidGuild}
        Monitor->>API: XHR GET /ranking/clan/fireteam?...
        API-->>Monitor: {rank, pointTotal, currentWeekID}
        Monitor->>Content: postMessage({url:"fcabr://ranking/fireteam/clan", data})
        Monitor->>API: XHR GET /ranking/clan/fireteam/{oidGuild}/players?weekId=...
        API-->>Monitor: Lista de jogadores do clã
        Monitor->>Content: postMessage({url:"fcabr://ranking/fireteam/clan/player", data})
    end

    Content->>Storage: StorageService.set(key, data)
    Content->>Content: renderPage()
```

---

## 4. Fluxo de Troca de Perfil

```mermaid
sequenceDiagram
    participant User as Usuário
    participant Page as fcabr.net
    participant LS as localStorage
    participant Content as content.js
    participant Monitor as monitor-manager.js

    User->>Page: Seleciona outro perfil
    Page->>LS: setItem("selected-profile-X", newOidUser)
    LS-->>Content: (interceptado por override de setItem)
    Content->>Content: renderPage() com novo oidUser

    Monitor->>Monitor: setInterval tick (1s)
    Monitor->>LS: getCurrentUserId()
    LS-->>Monitor: newOidUser ≠ lastProfileId
    Monitor->>Monitor: lastProfileId = newOidUser
    Monitor->>Monitor: manager.refresh() → execute() em todos os monitores
    Monitor->>Page: XHR com novo oidUser
    Page-->>Monitor: Novos dados de ranking
    Monitor->>Content: postMessage com novos dados
    Content->>Content: renderPage() → exibe dados do novo perfil
```

---

## 5. Fluxo de Renderização da Página de Perfil

```mermaid
flowchart TD
    A[renderPage chamado] --> B{URL bate com regex\n/lang/profile...?}
    B -->|Não| Z[Retorna]
    B -->|Sim| C[profilePage]

    C --> D{getProfilePageType?}
    D -->|Não| Z
    D -->|Sim| E{playerName na URL?}

    E -->|Sim| F["PF — perfil de terceiro"]
    E -->|Não| G["PFP — perfil próprio"]

    F --> H[RouteKeyProfile com nickname]
    G --> I[RouteKeyProfile com oidUser do localStorage]

    H --> J[StorageService.get routeKey]
    I --> J

    J --> K{data no cache?}
    K -->|Não| Z
    K -->|Sim| L[getTranslations + initializeStoredValues]

    L --> M{shouldShowNextPatent\nou shouldShowAnyFireteam?}
    M -->|Não| Z
    M -->|Sim| N[DOM.waitUntil — aguarda cartão de XP]

    N --> O{showNextPatent?}
    O -->|Sim| P[Calcula XP e atualiza cartão]
    P --> Q{isOwnProfile\n+ showExperienceRanking?}
    Q -->|rank encontrado| R[badge Top #N]
    Q -->|sem rank| S[badge Top +1000]
    Q -->|feature off| T[sem badge]

    O --> U{shouldShowAnyFireteam?}
    U -->|Sim| V[FireteamCard.render com clanData e playerData]
    V --> W[Campos com dados reais ou zero]

    N --> X[Ajusta altura card 'Em breve']
    N --> Y[watchTabSwitch]
```

---

## 6. Fluxo de Navegação SPA

```mermaid
flowchart TD
    A[Usuário navega no site] --> B{Como a URL mudou?}

    B -->|history.pushState| C[Interceptado pelo patch em content.js]
    B -->|history.replaceState| D[Interceptado pelo patch em content.js]
    B -->|Botão voltar/avançar| E[Evento popstate]
    B -->|Outros métodos| F[Polling a cada 200ms detecta mudança]

    C --> G[checkUrlChange]
    D --> G
    E --> G
    F --> G

    G --> H{location.href mudou?}
    H -->|Não| I[Ignora]
    H -->|Sim| J[Atualiza lastUrl → renderPage]
```

---

## 7. Fluxo do Popup (Configurações)

```mermaid
sequenceDiagram
    participant User as Usuário
    participant Popup as popup.js
    participant ChromeTabs as chrome.tabs API
    participant ChromeStorage as chrome.storage.local

    User->>Popup: Clica no ícone da extensão
    Popup->>ChromeTabs: query({active:true, currentWindow:true})
    ChromeTabs-->>Popup: tab com URL atual

    alt URL não é fcabr.net
        Popup->>User: Exibe "Uso restrito"
    else URL é fcabr.net
        Popup->>ChromeStorage: get(null)
        ChromeStorage-->>Popup: settings atuais
        Popup->>User: Exibe seções com toggles no estado atual

        User->>Popup: Altera toggles
        Popup->>ChromeStorage: set(novasSettings) — auto-save
        Popup->>ChromeTabs: reload(tab.id)
        Popup->>Popup: window.close()
    end
```

---

## 8. Fluxo de Cálculo do Cartão de XP

```
Dados da API (goa-rank-status):
  patenteAtual: "1º MAJOR"
  exp: 1.459.900
  expNecessario: 1.533.000

Tabela patents.js:
  { name: "1º MAJOR", targetXp: 1.400.000 }

Cálculo:
  baseXp    = 1.400.000  (targetXp da patente atual)
  nextXp    = 1.533.000  (expNecessario da API)
  remaining = max(0, 1.533.000 - 1.459.900) = 73.100
  progress  = ((1.459.900 - 1.400.000) / (1.533.000 - 1.400.000)) * 100 ≈ 45%

Atualização do DOM:
  spans[0].nodeValue = "1.400.000"            (base XP)
  spans[1].nodeValue = "73.100 XP restante"
  spans[2].nodeValue = "1.533.000"            (próximo XP)
  progressBar.style.width = "45%"
```
