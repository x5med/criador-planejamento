# Implementação do design X5

## Referência

[Arquivo Figma](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8), com tipografia Sora, marca Grupo X5 e componentes chip. Os exports em `public/design` são arquivos locais usados pela aplicação. A marca foi atualizada para SVG a pedido do usuário, conforme descrito em [brand/README.md](brand/README.md). As capturas do Figma servem somente à conferência visual.

| Tela | Referência desktop | Referência mobile |
| --- | --- | --- |
| Abertura | `6:682` | `6:2782` |
| Entrevista | `6:799` | `6:2844` |
| Visão geral | `6:1038` | `6:2916` |
| Diagnóstico | `6:1357` | Adaptação responsiva |
| Escolhas | `6:1627` | Adaptação responsiva |
| Execução | `6:1900` | Adaptação responsiva |
| Governança | `6:2216` | Adaptação responsiva |
| Tema escuro | `6:2463` | Adaptação responsiva |
| Cards chip | `60:650` | Variantes nativas mobile |

## Organização

- `components/StrategicPlanner.tsx`: controlador original de sessão, persistência e chamadas às APIs, preservado; somente o endereço da imagem de carregamento mudou para SVG.
- `components/PlannerJourney.tsx` e `app/journey.css`: abertura e entrevista, formulário, opções, ajuda, histórico e menu mobile.
- `components/PlannerResults.tsx` e `app/results.css`: cinco vistas do plano, navegação, temas, exportação e apresentação dos dados.
- `components/PlannerPrimitives.tsx`: marca, status do provedor e indicadores chip com dados reais do plano.
- `app/globals.css`: tokens semânticos, controles comuns, foco, tipografia e movimento.
- `app/layout.tsx`: Sora variável via `next/font`, com fonte servida pelo próprio aplicativo.

## Movimento e acessibilidade

O Figma consultado não forneceu animações nativas para a visão geral. As interações adicionadas na implementação incluem entrada suave das vistas, feedback de hover e pressão dos botões, transições dos segmentos, abertura do menu da entrevista e mudança dos indicadores. São movimentos curtos, sem atrasar as chamadas ou o salvamento. `prefers-reduced-motion` desativa animações e transições; foco visível, teclado e retorno de foco estão contemplados.

## Preservação do produto

O controlador e os arquivos de `app/api` e `lib` são comparados com o baseline registrado antes da implementação. As exportações continuam usando o plano completo e o conversor Markdown original. Conteúdos extensos aumentam a altura dos cards; não são truncados para reproduzir os textos ilustrativos do Figma. Informações de validação e limites permanecem disponíveis no celular em uma seção expansível. A opção original “Ano de 2027” foi mantida junto aos três horizontes do formulário.

## Verificação

Consulte [o relatório](../../docs/frontend-verification.md) para o resultado e a execução reproduzível. Os screenshots da aplicação e o JSON dos resultados estão em `verification/`; as referências e contextos do Figma estão em `figma/`.
