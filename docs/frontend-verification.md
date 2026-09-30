# Verificação da implementação do Figma

## Contratos registrados antes da alteração visual

- A sessão usa `x5-strategic-planner-session-v1` no localStorage. Início salva organização, setor, horizonte e desafio; a primeira pergunta é solicitada com `mode: next`, fase `context`, respostas e perguntas anteriores vazias.
- A resposta é aparada e adicionada à sessão antes de solicitar a próxima pergunta. A pergunta seguinte atualiza fase, prontidão, lacunas, provedor e IDs sem duplicar IDs.
- A ajuda envia `mode: coach` com o mesmo contexto, respostas anteriores e pergunta atual. Seu resultado não substitui a resposta.
- A geração exige cinco respostas no frontend. `/api/plan` recebe contexto e respostas. Em falha, a entrevista e as respostas continuam salvas; no sucesso, o plano é persistido.
- As cinco abas são Visão geral, Diagnóstico, Escolhas, Execução e Governança. A apresentação usa dados do plano, sem inventar indicadores de negócios.
- Voltar à entrevista remove somente `plan`; Novo plano exige confirmação e remove a sessão quando aceito.
- JSON exporta o plano completo. Markdown usa `planToMarkdown`, com nome derivado da organização e sem acentos.
- Status indisponível utiliza demonstração local. Uma sessão inválida em JSON é descartada na hidratação.

Os hashes SHA256 de todos os arquivos de `app/api` e `lib` foram registrados em `scripts/verification/backend-baseline.json` antes da implementação.

## Limitações já existentes

- Se a geração da próxima pergunta falha, a resposta já está salva; o rascunho do campo é limpo. A pergunta antiga permanece e pode receber outra resposta. A implementação visual mantém esse contrato, sem transformar o redesenho em uma mudança do controlador.
- A interface original não exibia frequência dos KRs, dependências das iniciativas nem premissas financeiras. A nova apresentação também torna esses campos visíveis, mantendo os dados existentes. Os pontos fortes da avaliação de qualidade já apareciam no original e foram preservados.

## Execução reproduzível

Com o servidor Next.js em `http://localhost:3000`:

```powershell
npm exec --yes --package=playwright -- node scripts/verification/browser-regression.mjs
```

O Playwright é executado pelo cache do npm e usa o Chrome instalado. Nenhuma dependência de teste é adicionada ao aplicativo. `TEST_URL` e `CHROME_PATH` podem selecionar outro servidor/navegador. `TEST_OUTPUT` escolhe a pasta de artefatos e `TEST_FILTER` permite repetir somente verificações relacionadas a uma alteração. Todas as APIs de IA são interceptadas por respostas determinísticas locais; nenhum teste consome Gemini.

A suíte verifica payloads e persistência, falhas de rede simuladas, conteúdo das cinco abas, downloads, confirmação, responsividade em 1440/390/320 px, Sora, movimento reduzido e teclado no menu mobile. Screenshots e resultados são gravados em `design/implementation/verification`.

## Resultado — 30/09/2026

**19 verificações aprovadas, zero falhas na execução completa em desenvolvimento.** A versão de produção acumula nove grupos de verificação aprovados, incluindo a revisão final dos ajustes do tema escuro e da logo SVG. As últimas repetições foram restritas aos recursos visuais alterados e à integridade dos contratos.

| Área | Evidência |
| --- | --- |
| Backend e modelos | SHA256 dos nove arquivos de API/biblioteca idênticos ao registro anterior |
| Controlador da sessão | Bloco `StrategicPlanner()` igual ao arquivo anterior salvo em `design/implementation/baseline/StrategicPlanner.tsx.txt`, normalizando quebras de linha e somente o caminho da logo SVG solicitado para a tela de loading; hooks, requisições, persistência e ações permanecem iguais |
| Início e provedor | Campos obrigatórios, horizonte selecionado, contexto completo e modelo Gemini no status |
| Entrevista | Respostas de texto e seleção, orientação, falha de orientação, prontidão, histórico, recarga e descarte de JSON inválido |
| Falhas | Resposta submetida permanece salva quando a próxima pergunta falha; geração falha sem apagar a entrevista |
| Plano | Limite de cinco respostas, contexto/respostas enviados e persistência do plano gerado |
| Conteúdo | Dados das cinco abas, inclusive os campos antes omitidos, presentes no desktop e acessíveis no mobile |
| Exportação | JSON integral igual ao plano, conteúdo Markdown e nomes dos arquivos; menu fecha após download |
| Navegação | Voltar à entrevista, confirmar/cancelar novo plano, abas por teclado, tema sem alterar dados da sessão |
| Mobile | Menu com Escape e foco restaurado; informações complementares acessíveis por disclosure |
| Responsividade | Sem rolagem horizontal da página em 1440, 390 e 320 px; tabelas possuem área própria de rolagem |
| Tipografia e recursos | Sora, imagens efetivamente exibidas carregadas, símbolos em claro/escuro, nenhum erro JavaScript de página |
| Movimento | Entrada das telas e movimento do ícone ao hover ativos; animações e transições desativadas com movimento reduzido |
| Produção | Nove grupos aprovados: conteúdo/exportações, três larguras com Sora, recursos em claro/escuro/mobile, revisão final do tema escuro, hashes de API/biblioteca, controlador e logo SVG |
| Contraste final do tema escuro | Novo plano mantém texto claro e contraste de 9,82:1 no hover; opção JSON no hover tem texto escuro; superfície mobile mantém o fundo do tema sem bloco retangular adicional |
| Logo SVG | As variantes preta e branca contêm paths nativos, sem imagens/base64 embutidos; previews ampliadas de 1120×700 px e uso na aplicação aprovados em claro/escuro |

### Comparação visual

Foram comparados os PNGs atuais do Figma (`overview-desktop.png` e `overview-mobile.png`) com capturas da aplicação, além do contexto nativo exportado das telas. Os recortes dos cards usam os SVGs do próprio Figma; paleta X5, Sora, navegação, superfícies, cantos e faixas mantêm a referência. Foram corrigidos o símbolo X5 sem contraste no cabeçalho, o fechamento do menu de exportação, IDs duplicados da navegação e as quebras do título mobile durante a revisão.

As capturas `figma-landing-*`, `figma-interview-*` e `figma-overview-desktop.png` usam viewports correspondentes às pranchas. O conteúdo continua vindo do plano e da entrevista: nomes, quantidades, valores e textos dos testes diferem dos exemplos estáticos do Figma e podem aumentar a altura de um card. A implementação também mantém seções e ações funcionais que a composição mobile de referência resume. Portanto, esta é uma validação de componentes e composição; não é uma alegação de igualdade pixel a pixel com conteúdo diferente.

### Artefatos

- Resultado completo: `design/implementation/verification/results.json`.
- Capturas desktop, mobile, tema escuro e viewports Figma: `design/implementation/verification/*.png`.
- Resultado e capturas da versão de produção: `design/implementation/verification/production/`.
- Previews ampliadas da logo SVG: `design/implementation/verification/production/logo-svg-enlarged-light.png` e `logo-svg-enlarged-dark.png`.

### Limite da verificação

As chamadas reais ao Gemini não foram executadas. O trabalho preserva as rotas e seus contratos, e os testes usam respostas locais determinísticas. O comportamento já existente de falha da próxima pergunta, descrito acima, permanece como ponto de atenção separado do redesenho.
