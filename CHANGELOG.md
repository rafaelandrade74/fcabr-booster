# Changelog

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
