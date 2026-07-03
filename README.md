# FCABR Booster

Extensão para o navegador com build via webpack.

## Estrutura

- `public/images` para imagens estáticas
- `public/styles` para estilos estáticos
- `src/options` para a interface do popup
- `src/content-scripts` para scripts injetados na página
- `src/lib` para bibliotecas internas
- `src/translations` para arquivos de idioma
- `src/utils/index.js` para inicialização de dados no storage

## Build

```bash
npm run build
```

O build é gerado em `dist/`.
