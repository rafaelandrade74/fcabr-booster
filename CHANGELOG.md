# Changelog

## Unreleased

- Corrige injeção de dados via `postMessage` forjado: tokens UUID gerados no content script (mundo isolado) autenticam cada canal de comunicação entre scripts da página e o content script, impedindo que scripts maliciosos injetem dados ou alterem configurações dos monitores
- Configura modos `development` e `production` corretamente no webpack: `npm run dev` gera bundle não-minificado com source maps e `__FCABR_DEBUG__` ativo; `npm run build` e `npm run release` geram bundle otimizado sem debug
- Aumenta intervalo do polling de detecção de URL de 200ms para 1000ms, reduzindo ticks em 5× sem impacto perceptível na responsividade da navegação SPA
- Remove `DOM.wait()` (MutationObserver) e demais métodos não utilizados de `dom.js`; classe retém apenas `waitUntil`, `$$` e `byTextVisible`
- Remove entradas de ícone `16` e `32` do `manifest.json`, que apontavam incorretamente para o arquivo de 48px
- Adiciona licença MIT

## 0.4.2

- Implementa Hot Reload das configurações via `ConfigDispatcher`: alterações no popup são refletidas imediatamente na página sem recarregar a aba
- Cria `ConfigDispatcher` com único listener `chrome.storage.onChanged` e API de subscribe/unsubscribe para notificar apenas os assinantes afetados
- Remove `chrome.tabs.reload()` do popup — a página reage via eventos
- Separa controles de "Próxima Patente" e "Ranking de Experiência" como flags independentes; cada um responde apenas à sua própria configuração
- Cria `PageSnapshot`: snapshot em memória do estado original dos elementos modificados pela feature "Próxima Patente"; restaura os valores originais ao desabilitar sem nova consulta ao storage
- Adiciona `ApiMonitorManager.update()` para iniciar, parar ou reconfigurar monitores em tempo real via `window.postMessage`
- Executa consulta imediata ao alterar o intervalo de atualização antes de iniciar o novo ciclo, sem aguardar o tempo completo decorrer
- Simplifica rótulos de posição no card Fireteam: "Posição do Clã" e "Posição no Clã" → "Posição"; "Clan Rank" e "Player Rank" → "Rank"
- Corrige renderização do slider no Opera com estilização explícita de `::-webkit-slider-thumb` e `::-webkit-slider-runnable-track`

## 0.4.1

- Exibe campos Fireteam com valor `0` quando o jogador não possui dados no ranking
- Exibe badge "Top +1000" no ranking de exp quando o jogador não está entre os primeiros
- Detecta troca de perfil via polling do `oidUser` no `monitor-manager` e re-executa os monitores imediatamente
- Ajusta altura do card "Em breve" lateral para acompanhar o card da extensão
- Salva dados da API sob as duas chaves (oidUser e nickname) para evitar inconsistência de lookup
- Intercepta `localStorage.setItem` em `content.js` para disparar `renderPage` na troca de perfil
- Adiciona comando `npm run release`: build de produção + zip da `dist/` nomeado `release-v{version}.zip`
- Adiciona `release-v*.zip` ao `.gitignore`

## 0.4.0

- Reorganiza popup com navegação por accordion/sidebar
- Auto-save de configurações com reload automático ao fechar o popup
- Reestrutura seção Fireteam com cards separados de Clã e Jogador
- Corrige erro de `removeChild` do React ao remover nós injetados

## 0.3.0

- Implementa monitoramento periódico de ranking via `monitor-manager.js`
- Adiciona ranking de experiência com badge de posição no perfil
- Adiciona ranking Fireteam: posição e pontos do clã e do jogador
- Adiciona `FireteamCard` com sub-cards de Clã e Jogador
- Suporte à detecção de troca de perfil via `localStorage`

## 0.2.0

- Adiciona suporte a perfil de terceiro (PF — `/pt/profile/jogador`)
- Implementa `watchTabSwitch` para re-renderizar ao trocar de aba no cartão de XP
- Adiciona badge de ranking de experiência (`Top #N`) no cabeçalho do perfil
- Melhora seleção de múltiplos cartões de XP (mobile + desktop do Next.js)

## 0.1.0

- Estrutura inicial da extensão
- Build configurado com webpack
- Popup movido para `src/options`
- Interceptação de `window.fetch` via `inject.js`
- Exibição da próxima patente no cartão de XP do perfil principal
- Barra de progresso de XP calculada com base na tabela de patentes
- Internacionalização: Português e Inglês
- Configuração `showNextPatent` persistida em `chrome.storage.local`
