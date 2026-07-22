# Análise do Histórico de Versões

## Versões Documentadas no CHANGELOG.md

### v0.1.0 — Versão inicial
- Estrutura inicial da extensão
- Build configurado com webpack
- Popup movido para `src/options`

---

## Lacunas no CHANGELOG

O `manifest.json` está na versão `0.1.2`, mas o `CHANGELOG.md` documenta apenas a `0.1.0`.

**Versões não documentadas:**
- `0.1.1` — Sem registro
- `0.1.2` — Sem registro

---

## Análise do Histórico Git (commits recentes)

Com base nos commits visíveis no histórico do repositório:

| Commit | Mensagem | Inferência |
|---|---|---|
| `70e4f39` | `fix: ajuste para todos os perfis carregar e exibir corretamente` | Correção no suporte a perfil PF vs PFP |
| `b90796d` | `fix: correção da exibição da xp faltante após mudança no layout da pagina profile` | Adaptação a mudança de layout no FCABR |
| `f2cdd3b` | `retirado logs` | Limpeza de console.logs de debug |
| `8e9df14` | `correção do idioma inglês na consulta e adicionado validação quando mudar o tamanho da tela para atualizar componente de mobile` | Suporte a `/en/profile`, detecção de resize |
| `b56e101` | `precisa fazer varios ajustes` | Commit de trabalho em progresso (WIP) |

---

## Padrão de Commits

O projeto usa `commitlint` com regra de `header-max-length: 100`. No entanto, os commits analisados **não seguem o padrão Conventional Commits** de forma consistente:

| Commit | Segue Conventional Commits? |
|---|---|
| `fix: ajuste para todos os perfis...` | ✅ Sim |
| `fix: correção da exibição...` | ✅ Sim |
| `retirado logs` | ❌ Não (sem tipo) |
| `correção do idioma inglês...` | ❌ Não (sem tipo) |
| `precisa fazer varios ajustes` | ❌ Não (sem tipo, estilo WIP) |

**Sugestão:** Adotar Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`) de forma mais consistente para facilitar geração automática de CHANGELOG.

---

## Estado Atual Estimado (v0.1.2)

Com base na análise do código, o estado atual da extensão representa:

- ✅ Interceptação de API funcional
- ✅ Suporte a perfil próprio e de terceiro
- ✅ Suporte a inglês e português
- ✅ Detecção de resize mobile/desktop
- ✅ Toggle de configuração no popup
- ✅ Build webpack funcional
- ❌ Testes
- ❌ CHANGELOG atualizado
- ❌ Licença definida
