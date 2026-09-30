# PRD — Front end e novo design system do X5 Planejamento

**Versão:** 0.9 · **Data:** 30/09/2026 · **Status:** design implementado, com pré-loader, revisão da entrada e esqueleto de login · **Prioridade:** P0 = necessário para lançamento; P1 = próximo incremento; P2 = evolução.

## 1. Resumo e decisão de produto

O X5 Planejamento conduz uma entrevista adaptativa e transforma as respostas em um plano estratégico estruturado. O novo front end deve fazer o usuário entender onde está na jornada, distinguir evidência de hipótese, confiar nos limites da IA e levar o plano para uma decisão prática. O design system deve dar uma linguagem visual e interativa única à abertura, à entrevista e à leitura do plano.

Este PRD especifica **a experiência e o contrato de interface**. A direção visual atual, revisada com as referências TaskLab e widgets chip e padrões de navegação das Apple Human Interface Guidelines, usa canvas cinza claro, cards brancos, preto, verde-lima e vidro translúcido nos controles. A família tipográfica é Sora em toda a interface: Regular para leitura, SemiBold para controles e indicadores, Bold/ExtraBold para títulos. As telas, componentes e tokens estão no [Figma](https://www.figma.com/design/o19AXjLOrcFxDc4VMnpuG8?node-id=6-328); o [guia de entrega](../design/figma/README.md) registra cobertura, decisões, limitações e atalhos.

## 2. Contexto verificado no repositório

- O MVP é uma aplicação Next.js 16, React 19 e TypeScript. `/` redireciona para o login visual em `/login`; o acesso demonstrativo leva a `/inicio`. O controlador `components/StrategicPlanner.tsx` alterna entre apresentação, entrevista e plano; a apresentação está dividida em componentes próprios.
- Há cinco fases: Contexto, Onde estamos, Para onde vamos, Como vamos e Com quem vamos. A entrevista oferece pergunta adaptativa, ajuda para responder, histórico, lacunas, prontidão e geração do plano após pelo menos cinco respostas.
- O plano possui cinco vistas: Visão geral, Diagnóstico, Escolhas, Execução e Governança. Inclui qualidade, evidências/hipóteses/lacunas, SWOT, avenidas, tese, OKRs, iniciativas, cenários financeiros, riscos e primeiros 90 dias.
- A sessão é salva em `localStorage`; há modo Gemini e modo demonstração. O usuário pode iniciar um novo plano e exportar Markdown ou JSON. Não há autenticação, banco ou colaboração.
- O CSS atual define cores e estilos por classes de tela, com valores locais além das variáveis raiz. A substituição deve migrar para tokens sem quebrar os dados, a jornada ou os contratos descritos em `docs/feature-map.md` e `lib/types.ts`.

## 3. Objetivos, público e indicadores

**Público principal:** dono do negócio, gestor, consultor ou liderança que prepara uma decisão estratégica, muitas vezes sem baselines completos. **Contexto:** sessões longas, textos extensos, alternância entre desktop e celular, possível interrupção e retomada no mesmo navegador.

| Objetivo | Indicador de resultado | Meta de aceite inicial |
|---|---|---|
| Começar sem ambiguidade | Usuários que concluem os quatro campos iniciais e recebem a primeira pergunta | Fluxo completo em teste de usabilidade, sem ajuda do moderador |
| Sustentar a entrevista | Usuários que respondem cinco perguntas e entendem o próximo passo | 5/5 participantes de teste conseguem localizar progresso, ajuda e histórico |
| Apoiar decisão | Usuários que identificam tese, prioridades, lacunas e responsável por uma iniciativa | 5/5 participantes encontram esses itens no plano em até 2 minutos |
| Manter confiança | Usuários que distinguem conteúdo real, demonstrativo, fato, hipótese e lacuna | 5/5 participantes classificam corretamente esses estados em teste |
| Garantir inclusão | Conformidade das jornadas principais | WCAG 2.2 AA, com verificação manual de teclado e leitor de tela |

As metas de usabilidade são **critérios propostos**, não uma medição da versão atual. Registrar uma linha de base antes do rollout e medir separadamente mobile e desktop. Não enviar respostas ou conteúdo estratégico para analytics.

## 4. Escopo e princípios

### Dentro do escopo P0

- Nova arquitetura visual, tokens, componentes, documentação e estados de todas as telas existentes.
- Jornada responsiva e acessível, com navegação por teclado e leitor de tela.
- Comunicação precisa de salvamento local, provedor de IA, modo demonstração, erros e limites de confiança.
- Apresentação legível de dados densos, inclusive tabelas de KRs, SWOT, cenários e riscos.
- Preservação das funções existentes: começar, responder, pedir ajuda, gerar, revisar, exportar, retomar e iniciar novo plano.
- Esqueleto visual do login com referência no Metrics, sem autenticação ou banco de dados, e formulário de contexto aberto somente pelo CTA inicial.

### Fora do escopo deste PRD

Autenticação, contas, colaboração, edição estrutural do plano gerado, banco de dados, upload, cobrança e mudança do método estratégico ou dos schemas da API. Essas funções exigem PRDs próprios. Melhorias de interface que dependam de alteração de dados estão identificadas como dependências, não como funções já disponíveis.

### Princípios de decisão

1. **Evidência antes de ornamento:** a hierarquia destaca decisões, fontes e lacunas.
2. **Progresso honesto:** prontidão e qualidade não aparentam precisão maior que a oferecida pelo método.
3. **IA compreensível:** informar se o resultado veio de Gemini ou da demonstração e o que o usuário deve validar.
4. **Leitura em camadas:** resumo primeiro, detalhe sob demanda, sem esconder informação essencial.
5. **Controle do usuário:** ações com consequência, salvamento e retomada devem ser previsíveis.

## 5. Requisitos funcionais por jornada

| ID | Prioridade | Requisito e critério de aceitação |
|---|---|---|
| FE-01 | P0 | **Abertura:** apresentar o que é o X5 Planejamento, as quatro partes do método e as entregas em `/inicio`, sem formulário visível. O botão “Gerar planejamento” abre o formulário em diálogo. Não usar depoimento, número ou selo de segurança sem evidência verificável. |
| FE-02 | P0 | **Criação:** pedir organização, setor, horizonte e desafio central com rótulos persistentes, ajuda concisa e validação. O horizonte usa seleção única entre 12, 24 e 36 meses e “Ano de 2027”, com estado selecionado anunciado e operação por teclado. Cancelar ou Esc fecha o diálogo sem iniciar uma sessão e devolve o foco ao CTA. A interface explicita o salvamento neste navegador e o envio de contexto à IA quando ativa. |
| FE-03 | P0 | **Retomada:** ao abrir o app com sessão local válida, restaurar pergunta, respostas, fase e plano sem pedir dados novamente. Em sessão corrompida, oferecer recuperação clara e caminho para começar de novo; evitar tela vazia. |
| FE-04 | P0 | **Orientação da entrevista:** mostrar fase atual, cinco fases, quantidade de respostas e prontidão com texto, não apenas barra ou anel. Fases concluídas e atual são distinguíveis sem depender só de cor. |
| FE-05 | P0 | **Pergunta adaptativa:** mostrar pergunta, contexto, exemplo/ajuda e por que importa. Renderizar corretamente os tipos retornados pela API (`textarea`, `text`, `number`, `select`), com semântica, validação e entrada adequadas. |
| FE-06 | P0 | **Resposta:** impedir envio vazio, comunicar envio em andamento, impedir clique duplicado e manter a resposta no campo se a próxima pergunta falhar. O sucesso deve ser confirmado como salvo localmente; rascunho ainda não enviado deve ser tratado como estado distinto. |
| FE-07 | P0 | **Ajuda da IA:** mostrar orientação, estrutura sugerida e ressalva sem preencher a resposta automaticamente nem transformar sugestão em fato. Estado de carregamento e falha têm ação de tentar novamente. |
| FE-08 | P0 | **Histórico:** permitir abrir/fechar e ler respostas anteriores por fase, com controle que anuncia estado expandido. Preservar textos longos e quebras de linha; qualquer função de editar resposta depende de regra de regeneração e fica fora do P0. |
| FE-09 | P0 | **Geração:** habilitar após a quantidade mínima vigente de respostas, explicar o que falta antes disso, mostrar espera e possíveis falhas, e permitir tentar novamente sem perder a entrevista. A UI não afirma que todas as cinco fases foram completadas quando o plano é gerado antecipadamente. |
| FE-10 | P0 | **Plano — visão geral:** destacar resumo executivo, tese, prioridades, renúncias, qualidade, próximos 90 dias e validações pendentes. Pontuação deve incluir significado textual e não substituir a inspeção de lacunas. |
| FE-11 | P0 | **Plano — diagnóstico:** separar visual e semanticamente fatos declarados, hipóteses e lacunas; apresentar SWOT e questões estratégicas com causa, consequência e urgência legíveis. Não inventar fonte ou grau de certeza ausente do contrato. |
| FE-12 | P0 | **Plano — escolhas:** comparar avenidas, valor, complexidade, decisão e justificativa; mostrar tese, direção Ansoff, prioridades, não objetivos e capacidades necessárias. Barras de pontuação exibem valores numéricos e rótulos. |
| FE-13 | P0 | **Plano — execução:** distinguir objetivos/KRs de iniciativas; apresentar baseline, meta, unidade, prazo, fonte, frequência e dono quando existirem no contrato. Exibir 5W2H, dependências e custos sem truncamento; cenários e alertas financeiros são qualitativos quando faltam dados. |
| FE-14 | P0 | **Plano — governança:** apresentar papéis e direitos de decisão, cadências, comunicação, riscos, sinais, mitigação e dono. Probabilidade e impacto precisam de rótulos além da cor. |
| FE-15 | P0 | **Navegação do plano:** as cinco vistas têm nomes persistentes, estado selecionado anunciado e foco previsível. Em celular, todas continuam alcançáveis sem scroll horizontal na página; o conteúdo ativo conserva um título claro. |
| FE-16 | P0 | **Exportação:** permitir Markdown e JSON com nomes de arquivo previsíveis, feedback de início do download ou falha na preparação do arquivo e identificação do modo demonstração no conteúdo ou junto à ação. O conteúdo exportado corresponde ao plano exibido. |
| FE-17 | P0 | **Novo plano:** informar claramente que a sessão local atual será apagada, exigir confirmação acessível e manter a sessão quando a ação for cancelada. A UI não promete sincronização ou recuperação remota. |
| FE-18 | P0 | **Estados globais:** projetar inicialização, carregamento da pergunta, carregamento da ajuda, geração, vazio, erro de rede/API, resposta demonstrativa e plano pronto. Cada estado indica o que acontece e a próxima ação possível. |
| FE-19 | P1 | **Navegação persistente:** permitir voltar a uma vista do plano por URL/estado restaurável, quando houver desenho técnico para persistir a seleção sem expor dados sensíveis na URL. |
| FE-20 | P1 | **Comparação de versões:** avaliar somente depois de existir modelo de versões e regra de alteração do plano. |
| FE-21 | P0 | **Login — esqueleto:** a entrada `/` direciona a `/login`, com layout baseado no Metrics, marca Grupo X5 e módulos de planejamento. E-mail, senha e Entrar ficam desativados, sem capturar credenciais. Uma indicação de login em breve acompanha “Explorar demonstração”, que leva a `/inicio`. Não criar sessão autenticada, cookies, chamadas de autenticação ou alegação de proteção. A integração real com autenticação e banco fica para etapa posterior. |
| FE-22 | P0 | **Loading:** animar o SVG oficial do Grupo X5 com Motion para React, usando o vídeo somente como referência visual. Repetir contorno e preenchimento enquanto documento/fontes, rota ou solicitação de pergunta/plano estiverem pendentes. A conclusão real determina a saída; não impor duração mínima nem encerrar por término do ciclo. Não exibir botão de pular ou percentual fictício. Com movimento reduzido, manter logo estática durante a espera. Não reproduzir mídia X5 MED. |

## 6. Requisitos do design system

### 6.1 Fundações e tokens

| ID | Prioridade | Contrato |
|---|---|---|
| DS-01 | P0 | Definir tokens primitivos e semânticos para cor, tipografia, espaçamento, tamanho, borda, raio, sombra, opacidade, z-index e movimento. Componentes usam tokens semânticos; valores hexadecimais e medidas arbitrárias ficam fora das classes de tela, salvo exceções documentadas. |
| DS-02 | P0 | Definir cores por função: superfícies, texto principal/secundário, bordas, ação primária/secundária, foco, informação, sucesso, atenção, erro, fato, hipótese, lacuna e modo demonstração. Cada par texto/fundo tem contraste medido. A cor nunca é o único sinal. |
| DS-03 | P0 | Criar escala tipográfica para display, H1–H4, corpo, legenda e dados; definir pesos, line-height, comprimento de linha e comportamento de quebra. Corpo deve permanecer legível a 200% de zoom; textos extensos do plano não podem ser cortados. |
| DS-04 | P0 | Definir escala de espaçamento e grid responsivo, com áreas de leitura e densidade apropriadas para entrevista e painel. A largura de linha de texto corrido e as colunas de dados devem responder ao conteúdo, não a um número fixo de cartões. |
| DS-05 | P0 | Entregar estados `default`, `hover`, `focus-visible`, `active/selected`, `disabled`, `loading`, `success` e `error` para controles aplicáveis, com especificação de teclado, toque e leitor de tela. |
| DS-06 | P0 | Usar exclusivamente o tema claro em login, pré-loader, abertura e workspace, inclusive com preferência escura no sistema operacional. Não exibir alternância de tema. Compartilhar os tokens de cor do design system. |
| DS-07 | P0 | Usar ícones SVG consistentes (biblioteca atual: Lucide), acompanhados de texto ou nome acessível quando a ação não for óbvia. Ícones decorativos ficam ocultos da árvore de acessibilidade. |
| DS-08 | P0 | Criar documentação com catálogo de tokens, variantes, estados, exemplos corretos/incorretos e orientação de conteúdo. Os nomes de tokens devem indicar função, não cor física (`--color-action-primary`, por exemplo). |
| DS-09 | P0 | Concentrar o material translúcido na navegação, nas barras e nos controles. Oferecer superfície sólida em redução de transparência; manter contraste dos rótulos no tema claro. O controle segmentado tem segmentos equivalentes, seleção persistente e alvos de pelo menos 44 × 44 px. |
| DS-10 | P0 | Usar cards chip nos indicadores da visão geral: corpo preto, recorte superior arredondado, numerais Sora SemiBold e faixas da paleta X5: lima para prioridades, menta para objetivos, lima claro para qualidade e coral suave para lacunas. As oito variantes no Figma cobrem quatro métricas em Desktop e Mobile. Rótulo, valor e descrição devem acompanhar os dados reais; a barra e os pontos não podem divergir do valor. Cor e decoração não substituem a informação textual. A grade se reorganiza sem cortar conteúdo ou provocar rolagem horizontal da página. |

### 6.2 Componentes obrigatórios

**Estrutura:** cabeçalho, marca, container, grid, sidebar/drawer, navegação por etapas, navegação por abas, cabeçalho de seção, divisor, rodapé e painel contextual.

**Controles:** botões primário/secundário/terciário/destrutivo, botão de ícone, input, textarea, select, grupo de escolha, ajuda de campo, erro de campo, confirmação e controle expansível.

**Feedback:** indicador de progresso, badge de provedor, banner de aviso/erro/sucesso, estado vazio, skeleton ou status de processamento, confirmação de salvamento e indicador de qualidade com descrição textual.

**Dados:** card de resumo, bloco de evidência, tag semântica, lista de prioridades, matriz SWOT, cartão de avenida, tabela de KR, cartão de iniciativa, cenário, cronograma de 90 dias e cartão de risco. O mesmo componente semântico deve servir às vistas que compartilham função, com variantes documentadas.

**Card chip:** família `X5/Card/Chip`, com `Metric` (Priorities, Objectives, Quality, Gaps) e `Size` (Desktop, Mobile). Todos os textos usam Sora; valores grandes usam SemiBold em 46 px no desktop e 32 px no mobile. Os três pontos no recorte são decorativos. A faixa interna apresenta a descrição e a contagem ou barra correspondente. As dimensões de referência e as cores estão em [tokens.json](../design/figma/tokens.json); a implementação usa largura fluida.

### 6.3 Linguagem e conteúdo

- Usar português brasileiro claro e consistente. Preferir verbos de ação: “Salvar resposta”, “Gerar plano”, “Exportar Markdown”.
- Diferenciar **salvo localmente**, **enviando**, **falha ao salvar** e **gerado**; nunca apresentar salvamento como garantido se o armazenamento falhar.
- Identificar “Demonstração” junto a resultados demonstrativos e explicar que números, nomes e recomendações exigem validação. Não usar “IA” como selo de qualidade.
- Para valores ausentes, mostrar “A definir” ou “Não informado” de forma consistente. Não usar zero ou campo vazio como substituto de informação desconhecida.
- Mensagens de erro dizem o que aconteceu em linguagem simples, se o conteúdo foi preservado e como tentar novamente.

## 7. Responsividade e acessibilidade

| ID | Prioridade | Critério verificável |
|---|---|---|
| UX-01 | P0 | Usar layout fluido que funcione de 320 CSS px a telas largas, com pontos de reorganização guiados pelo conteúdo. Verificar 320, 375, 768, 1024 e 1440 px e zoom de 200%/400% sem perda de função nem scroll horizontal da página. Tabelas podem ter região própria de rolagem, identificada e acessível, ou virar cartões. |
| UX-02 | P0 | Em mobile, sidebar vira drawer ou navegação compacta; foco entra no menu, Escape fecha, foco volta ao acionador e o fundo não fica operável enquanto aberto. A ação principal permanece alcançável sem cobrir texto ou controle. |
| UX-03 | P0 | Meta de conformidade: [WCAG 2.2 nível AA](https://www.w3.org/TR/WCAG22/). Texto normal ≥ 4,5:1; texto grande e elementos gráficos essenciais ≥ 3:1. Medir estados reais, inclusive foco, disabled, badges e gráficos. |
| UX-04 | P0 | Todas as ações são operáveis com teclado. Ordem de foco segue a leitura; foco visível não fica oculto por cabeçalho/sticky; mudança de pergunta ou vista move ou anuncia o foco de modo previsível. |
| UX-05 | P0 | Campos têm `label` e instruções/erros associados; grupos de escolha têm nome; botões expansíveis anunciam expansão; abas seguem semântica e comportamento de teclado apropriados ou usam navegação comum. Mensagens assíncronas relevantes são anunciadas sem interromper a digitação. |
| UX-06 | P0 | Informações codificadas por cor também têm texto, ícone ou padrão. Gráficos e anéis trazem valor e explicação em texto. Conteúdo aceita tradução futura e expansão de texto sem quebra. |
| UX-07 | P0 | Alvos de toque seguem no mínimo WCAG 2.2 AA; meta interna de 44 × 44 CSS px para ações principais e ícones isolados. Dar espaço entre alvos próximos. |
| UX-08 | P0 | Respeitar `prefers-reduced-motion`; animação nunca é necessária para compreender progresso ou mudança de estado. Evitar foco automático inesperado e movimento durante a digitação. |

## 8. Performance e qualidade técnica do front end

| ID | Prioridade | Critério verificável |
|---|---|---|
| NFR-01 | P0 | Medir [Core Web Vitals](https://web.dev/articles/vitals/) em campo por mobile e desktop; metas p75: LCP ≤ 2,5 s, INP ≤ 200 ms e CLS ≤ 0,1. Enquanto não houver tráfego, usar medidas de laboratório como alerta, sem alegar aprovação em campo. |
| NFR-02 | P0 | Reservar espaço para estados assíncronos e evitar saltos na troca pergunta/plano. Não carregar bibliotecas visuais pesadas para efeitos decorativos; gráficos simples usam CSS/SVG acessíveis. |
| NFR-03 | P0 | Componentes apresentam dados de `lib/types.ts` sem alterar conteúdo gerado; textos longos, arrays vazios e “A definir” têm tratamento explícito. Não inserir HTML do modelo sem sanitização. |
| NFR-04 | P0 | Salvamento local trata indisponibilidade/quota/corrupção com feedback honesto. Não registrar respostas em console, telemetria, query string ou erros externos. |
| NFR-05 | P0 | Manter Next.js/React/TypeScript existentes; antes de codificar, consultar a documentação local do Next.js conforme `AGENTS.md`. A implementação deve passar `npm run lint`, `npm run typecheck` e `npm run build`. |
| NFR-06 | P1 | Adicionar testes automatizados de componentes e fluxos críticos onde reduzam risco real: retomada, falha após envio, troca de abas, menu mobile, confirmação e exportação. Complementar com inspeção manual de leitor de tela. |

## 9. Eventos e pesquisa de produto

Medir apenas metadados agregados e consentidos quando houver infraestrutura de analytics: abertura do formulário, início da entrevista, pergunta respondida (somente fase e contagem), ajuda acionada, geração iniciada/concluída/falha, vista do plano aberta, exportação por formato e novo plano confirmado. **Nunca** incluir nome da organização, setor, desafio, resposta, texto do plano ou arquivos exportados. Este PRD não autoriza instalar um provedor de analytics no MVP.

Pesquisa de validação: testar um fluxo com dados incompletos, um com modo demonstração e um com falha de rede; observar especialmente compreensão de prontidão, distinção KR/iniciativa, leitura de riscos e confiança na origem dos dados.

## 10. Entregáveis e sequência

1. **P0 — Inventário e direção:** mapa de telas/estados, auditoria de contraste e componentes atuais, duas explorações visuais da direção “clareza executiva” e decisão registrada de marca.
2. **P0 — Fundações:** tokens semânticos, tipografia, grid, conteúdo, componentes base e catálogo com estados acessíveis.
3. **P0 — Fluxos:** abertura/criação, entrevista completa, plano nas cinco vistas, estados de falha/demonstração, exportação e novo plano.
4. **P0 — Validação:** revisão de conteúdo, testes de usabilidade, teclado/leitor de tela, responsividade, contraste, regressão funcional e performance. Corrigir bloqueios antes de substituir a interface atual.
5. **P1:** navegação persistente por vista e refinamentos após métricas reais.

**Definição de pronto P0:** cada requisito P0 possui estado e variante documentados; os fluxos existentes funcionam com Gemini e demonstração; a auditoria WCAG 2.2 AA não encontra bloqueios nas jornadas principais; casos de erro/retomada são verificáveis; build, lint e typecheck passam; há registro de decisões de marca e dos resultados dos testes de usabilidade.

## 11. Dependências, riscos e decisões em aberto

| Tema | Decisão necessária antes do design final |
|---|---|
| Marca | Logo Grupo X5 fornecida em PNG transparente e aplicada no produto e no Figma; SVG vetorizado guardado como referência. Manter contraste no tema claro, com descritor Planejamento, preto, verde-lima, branco e Sora. Validar a proposta visual com usuários. |
| Perfil de uso | Validar se o usuário primário é liderança de pequena empresa, consultor ou time corporativo; isso afeta densidade e tom. |
| Tema | O produto usa apenas tema claro por decisão do usuário. A referência escura do Figma é histórica e não faz parte da implementação. |
| Salvamento | Definir comportamento de rascunho ainda não enviado e o texto exato de falha do `localStorage`; a versão atual persiste respostas submetidas, não cada tecla. |
| Proveniência | Decidir como marcar o plano demonstrativo também nos arquivos exportados sem alterar o schema JSON existente. |
| Edição | Retorno da vista do plano à entrevista hoje descarta o plano gerado; qualquer edição/regeneração exige regra de versão e alerta específico. |
| Dados | O contrato possui `text` e `number`, mas a UI atual apresenta tudo que não é `select` como `textarea`; a nova UI deve respeitar o tipo e testar respostas inesperadas. |

## 12. Referências do projeto e normas

- Produto e limites atuais: `README.md`, `docs/feature-map.md`, `docs/architecture.md`.
- Contratos de dados e fases: `lib/types.ts`.
- UI e estilos atuais: `components/StrategicPlanner.tsx`, `app/globals.css`.
- Acessibilidade: [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/).
- Materiais e controles: [Apple HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials) e [Segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls).
- Performance: [web.dev — Core Web Vitals](https://web.dev/articles/vitals/).

## Agenda (incremento implementado)

| ID | Prioridade | Requisito |
|---|---|---|
| AG-01 | P0 | Disponibilizar Agenda dentro de Execução, mantendo Plano de ação e exportações. |
| AG-02 | P0 | Oferecer visões semanal, mensal e de 90 dias, período anterior/próximo, Hoje e Início do plano. |
| AG-03 | P0 | Projetar iniciativas e marcos a partir dos dados existentes, com filtro por tipo e responsável e detalhes vinculados à origem. |
| AG-04 | P0 | Identificar como estimadas as datas relativas calculadas a partir de generatedAt. Manter sem data os itens ambíguos, inválidos ou sem referência confiável. |
| AG-05 | P0 | Exibir cadências em A agendar, sem criar reuniões, datas ou horários fictícios. |
| AG-06 | P0 | Distinguir situação do prazo de status de execução; não presumir conclusão ou atraso operacional. |
| AG-07 | P0 | Manter tema claro X5, navegação por teclado, diálogo com Esc e restauração de foco, e layout sem overflow em celular. |
| AG-08 | P0 | Preservar esquema/API, persistência e exportações do plano. Agenda é visualização dos dados existentes; agendamento compartilhado e integração externa não fazem parte deste incremento. |
