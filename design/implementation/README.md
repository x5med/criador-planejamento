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
| Tema escuro (referência histórica; fora do produto) | `6:2463` | Não implementar |
| Cards chip | `60:650` | Variantes nativas mobile |

A abertura foi adaptada a pedido do usuário: apresenta o produto e o método, com o formulário de organização acessível somente pelo botão “Gerar planejamento”. O login visual segue o código de referência do projeto Metrics (`src/app/login/page.tsx`, `login.css` e `LoginConnections.tsx`), com marca e módulos do Planejamento. Mantém o card central de 420 px, fundo `#E7EBE4`, superfície `#FFFFFF` e destaque verde-lima `#D8F36A`, controles arredondados e conexões laterais; a tipografia continua Sora.

## Organização

- `components/StrategicPlanner.tsx`: controlador original de sessão, persistência e chamadas às APIs, preservado; somente o endereço da imagem de carregamento mudou para SVG.
- `app/page.tsx`: redireciona a entrada para `/login`; `app/inicio/page.tsx` apresenta o controlador de planejamento.
- `components/LoginPreview.tsx`, `components/LoginModules.tsx` e `app/login/`: esqueleto visual do login com acesso explícito à demonstração; sem autenticação ou banco.
- `components/PlannerJourney.tsx` e `app/journey.css`: apresentação do produto e entrevista, opções, ajuda, histórico e menu mobile.
- `components/NewPlanDialog.tsx`: formulário inicial sob demanda, com campos originais, foco contido e retorno ao botão ao fechar.
- `components/PlannerResults.tsx` e `app/results.css`: cinco vistas do plano, navegação, temas, exportação e apresentação dos dados.
- `components/PlannerPrimitives.tsx`: marca, status do provedor e indicadores chip com dados reais do plano.
- `app/globals.css`: tokens semânticos, controles comuns, foco, tipografia e movimento.
- `app/layout.tsx`: Sora variável via `next/font`, com fonte servida pelo próprio aplicativo.
- `components/AppPreloader.tsx` e `app/preloader.css`: loading real de documento e fontes, com a marca Grupo X5 em loop usando Motion para React. `AnimatedGroupLogo.tsx` também é usado em `app/loading.tsx` e nas esperas de sessão/IA. Saída quando o conteúdo estiver pronto, sem botão nem duração mínima. [Referência e preparação](preloader/README.md).

## Movimento e acessibilidade

O Figma consultado não forneceu animações nativas para a visão geral. As interações adicionadas na implementação incluem entrada suave das vistas, feedback de hover e pressão dos botões, transições dos segmentos, abertura do menu da entrevista e mudança dos indicadores. São movimentos curtos, sem atrasar as chamadas ou o salvamento. `prefers-reduced-motion` desativa animações e transições; foco visível, teclado e retorno de foco estão contemplados.

## Preservação do produto

O controlador e os arquivos de `app/api` e `lib` são comparados com o baseline registrado antes da implementação. As exportações continuam usando o plano completo e o conversor Markdown original. Conteúdos extensos aumentam a altura dos cards; não são truncados para reproduzir os textos ilustrativos do Figma. Informações de validação e limites permanecem disponíveis no celular em uma seção expansível. A opção original “Ano de 2027” foi mantida junto aos três horizontes do formulário.

## Verificação

Consulte [o relatório](../../docs/frontend-verification.md) para o resultado e a execução reproduzível. Os screenshots da aplicação e o JSON dos resultados estão em `verification/`; as referências e contextos do Figma estão em `figma/`.

## Agenda de execução

- `components/PlannerAgenda.tsx`: visões mensal/semanal/90 dias, filtros, seleção de dia e detalhes acessíveis.
- `app/agenda.css`: calendário e painéis com os tokens claros X5, Sora, verde-lima para iniciativas e menta para marcos.
- `lib/agenda.ts`: projeção pura das datas e itens do plano, sem mutações nem persistência adicional.
- `PlannerResults`: abas Plano de ação/Agenda dentro de Execução, mantendo o conteúdo e exportações existentes.

A referência de calendário fornecida pelo usuário orienta a organização visual. Eventos representam datas e períodos; horários de reunião não são inventados. Cadências sem dia definido aparecem em A agendar. Datas relativas usam a geração do plano como referência explícita e precisam de validação pelos responsáveis.
