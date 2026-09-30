# Logo Grupo X5 em SVG

Fonte fornecida: `grupox5 (1) copiar.pdf`. O PDF contém uma imagem RGB de 998 × 690 px com máscara de opacidade, sem a marca em contornos vetoriais.

A máscara foi extraída com Poppler e vetorizada com Potrace, mantendo o desenho da marca e as áreas vazadas. O SVG final contém um caminho vetorial, sem imagem embutida e com fundo transparente. O enquadramento inclui margem de dois pixels para não cortar as bordas. As variantes diferem somente na cor de preenchimento:

- `public/brand/grupo-x5.svg`: preto, usado nos fundos claros.
- `public/brand/grupo-x5-white.svg`: branco, usado nos fundos escuros e nos símbolos do cabeçalho.

A marca aparece na abertura, entrevista, sidebar, cabeçalho mobile, plano e estado inicial de carregamento. A substituição não modifica dados ou ações da sessão. O Figma mantém sua referência anterior em PNG; a aplicação usa os contornos SVG solicitados posteriormente.

`conversion.json` registra os parâmetros. Para reproduzir após extrair a máscara como `extracted-001.png`:

```powershell
npm exec --yes --package=potrace -- node design/implementation/brand/vectorize-logo.mjs
```

A dependência de conversão roda pelo cache npm; não foi incluída no aplicativo.
