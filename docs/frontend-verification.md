# Verificação da implementação do Figma

## Agenda dentro de Execução — 30/09/2026

**6 grupos de verificação aprovados, zero falhas pendentes.** A Agenda projeta iniciativas, marcos dos primeiros 90 dias e cadências existentes. Os KRs continuam no Plano de ação. Nenhuma operação da Agenda realizou POST ou alterou a sessão salva nos fluxos cobertos.

| Área | Evidência |
| --- | --- |
| Datas e referência | ISO/BR válidos, rejeição de 31/02 e ano não bissexto, intervalos invertidos sem agendamento; Dia 1 é a data de geração. Fixture 30/09/2026: Dia 15 = 14/10 e Dia 45 = 13/11 |
| Calendário | Mês, Semana com sete dias a partir da segunda-feira e 90 dias em três janelas de 30; anterior/próximo, Hoje e Início do plano com intervalos corretos |
| Filtros/detalhes | Tipo e Responsável combinados; dados originais, dependências e período no diálogo; Escape restaura foco, links levam à iniciativa com foco ou à Governança |
| Dados indefinidos | Cadência Semanal permanece a agendar; períodos vazios/inválidos continuam visíveis. Âncora inválida mantém eventos relativos sem data e preserva eventos absolutos; agenda vazia não inventa eventos |
| Preservação | KRs, prazos, iniciativas e premissas financeiras permanecem no Plano de ação; JSON igual ao plano completo e Markdown igual, byte a byte, ao formatter original |
| Mobile | Mês/Semana/90 dias e diálogo em 390 e 320 px sem overflow da página. Capturas atualizadas após o ajuste de largura da sidebar |

Os seis grupos foram executados com sessão local determinística e `/api/status` mockado; não houve consumo de IA ou erro JavaScript. O agente do helper também informou 12 gates de datas aprovados, incluindo consistência em cinco fusos horários. O agente principal confirmou build, TypeScript e lint aprovados e inspecionou capturas desktop/mobile. A suíte completa anterior não foi repetida.

Resultados e capturas: `design/implementation/verification/agenda/results.json`, `desktop-month.png`, `desktop-90-days.png`, `mobile-320-month.png`, `mobile-390-week.png`, demais `mobile-*-90-days.png`/`mobile-*-detail.png` e `empty-agenda.png`. Runner: `scripts/verification/agenda-regression.mjs`.

```powershell
npm exec --yes --package=playwright -- node scripts/verification/agenda-regression.mjs
```

Os reruns corrigiram expectativas do teste: o KR exibe `id · métrica`, o pager mensal reposiciona o cursor no dia 1 e Markdown já não exportava cadências de governança antes desta entrega. Esse limite anterior do Markdown foi preservado; JSON contém o plano integral. Não foram feitas alterações de produção pelo agente de verificação.

## Logo como indicador de carregamento real — 30/09/2026

**4 verificações pertinentes aprovadas, zero falhas pendentes.** A logo Grupo X5 acompanha o estado real de carregamento: anima em loop enquanto os recursos ou a resposta da API estão pendentes e desaparece quando a operação termina. A abertura não possui duração mínima nem botão de pular; movimento reduzido mantém a logo estática durante a espera.

| Verificação | Evidência |
| --- | --- |
| Fonte atrasada | Fonte interceptada e mantida pendente por mais de 3,1 s; SVG oficial permanece visível e o contorno reinicia. Liberação em 319 ms após resolver o recurso, incluindo fade |
| Recursos prontos | Reload com recursos disponíveis libera o aplicativo em 33 ms após load, sem aguardar um ciclo de 2,4 s. Navegação client-side não reabre o indicador |
| Movimento reduzido | Logo oficial estática, preenchida e visível no mobile 390 px enquanto a fonte está pendente; sai quando a fonte conclui |
| API da entrevista | O mesmo SVG aparece dentro de `.question-loading` enquanto a resposta está bloqueada; desaparece e a pergunta correta é exibida após resolver a resposta |

Nos fluxos cobertos não houve request de mídia ou erro JavaScript; o gate de recursos prontos também confirmou ausência de POST e de gravação de sessão. A geometria foi comparada com `public/brand/grupo-x5.svg`. A captura da API aguarda preenchimento completo para registrar a logo legível, com o request ainda pendente.

Evidências atuais: `design/implementation/verification/loading-real/results.json`, `font-pending-loop.png`, `reduced-motion-mobile-pending.png` e `interview-api-pending.png`. O runner `scripts/verification/preloader-regression.mjs` foi adaptado para estes quatro estados de carga. A captura de uma fonte deliberadamente bloqueada usa `PW_TEST_SCREENSHOT_NO_FONTS_READY=1` somente no processo de teste; o estado de prontidão do navegador/aplicativo permanece real. `light-theme-verification.mjs` também foi adaptado para segurar uma fonte na captura da logo, com sintaxe validada e sem repetir sua suíte.

O agente principal confirmou build, TypeScript e lint aprovados. Os gates de duração fixa e de skip/Escape documentados nas seções anteriores pertencem às entregas anteriores e foram retirados do runner atual.

## Pré-loader Grupo X5 em SVG/React — 30/09/2026

**7 verificações pertinentes aprovadas, zero falhas pendentes.** Esta entrega substitui a reprodução do vídeo por animação vetorial em React/Motion, usando o vídeo apenas como referência de movimento. A logo exibida é Grupo X5; nenhum elemento de vídeo, imagem raster embutida ou request de mídia foi encontrado.

- Geometria validada contra `public/brand/grupo-x5.svg`: mesmo viewBox e mesmo conjunto de contornos, considerando apenas o reagrupamento e fechamento explícito dos subpaths. Os furos das letras permanecem na geometria oficial.
- Progressão real comprovada: `strokeDashoffset` diminui durante o desenho; o preenchimento parte de opacidade zero e chega a mais de 0,99 em todos os grupos. Capturas inicial, intermediária e final registram os estados.
- Término automático após aproximadamente 2,4 s de animação mais fade; login liberado, navegação client-side sem repetição, reload com nova reprodução. Pular animação e Escape liberam o conteúdo; movimento reduzido não monta o SVG animado.
- Logo preenchida visível e contida nos viewports de 390 e 320 px, sem overflow. Nenhum POST, gravação de sessão, request de mídia ou erro JavaScript foi observado nos fluxos cobertos.

Runner adaptado: `scripts/verification/preloader-regression.mjs`. Resultados e capturas atuais: `design/implementation/verification/preloader-svg/results.json`, `desktop-svg-beginning.png`, `desktop-svg-middle.png`, `desktop-svg-final.png`, `mobile-390-svg.png` e `mobile-320-svg.png`. O agente principal também inspecionou contorno/logo final e confirmou build, TypeScript e lint aprovados. `light-theme-verification.mjs` foi atualizado para conferir o SVG oficial, removendo expectativas de WebM/MP4; sua sintaxe passou e a suíte de cores não foi repetida.

As verificações de vídeo/fallback das seções anteriores abaixo são registros históricos. Os arquivos de vídeo que eram distribuídos com o aplicativo foram removidos; o conteúdo atual do pré-loader é vetorial.

## Paleta X5 e tema claro único — 30/09/2026

**5 verificações pontuais aprovadas, zero falhas pendentes.** Login, módulos, CTA, pré-loader e plano salvo foram conferidos com a preferência do sistema operacional definida como escura. A interface permanece clara (`color-scheme: light only`), com canvas `#E7EBE4`, superfícies brancas e CTA `#D8F36A`; o plano não oferece alternância de tema.

- Capturas do login em 1440 e 390 px aprovadas visualmente. Popovers abrem e fecham por teclado/Escape com foco restaurado; “Explorar demonstração” chega à homepage e permite abrir/cancelar o formulário sem POST ou persistência.
- Frames finais do WebM com alpha e do fallback MP4 mostram a logo preta nítida sobre o canvas claro, sem retângulo de fundo. Os quatro cantos da região de vídeo têm exatamente RGB `(231, 235, 228)` em ambos os formatos; mais de 25 mil pixels escuros comprovam a presença da logo.
- Plano salvo abre claro mesmo com preferência escura; nenhuma classe de tema escuro ou botão de alternância, abas funcionais e ausência de overflow/erros JavaScript no smoke.

Evidências atuais: `design/implementation/verification/light-theme/results.json`, `login-1440-dark-os.png`, `login-390-dark-os.png`, `webm-final-light.png`, `mp4-final-light.png` e `results-light-dark-os.png`. O runner pontual é `scripts/verification/light-theme-verification.mjs`. O agente principal confirmou build aprovado. A suíte completa não foi repetida; o agente de resultados atualizou suas expectativas antigas de tema escuro, e o runner do pré-loader agora espera a superfície clara. As seções anteriores abaixo registram a aparência validada nas entregas anteriores.

## Pré-loader com o vídeo X5 — 30/09/2026

**11 grupos de verificação isolados aprovados, zero falhas pendentes**, com reprodução real no Chrome/Chromium. A suíte anterior de 27 grupos não foi repetida nesta alteração. O agente principal confirmou novamente build de produção e TypeScript aprovados após a correção do fallback.

| Área | Evidência |
| --- | --- |
| Reprodução real | WebM de 2,4 s, muted, playsInline, sem loop; eventos `playing` e `ended`, 84 frames exibidos e último tempo de mídia 2,371 s |
| Liberação e navegação | Login utilizável após término; `/login` → `/inicio` não repete o vídeo; reload reproduz novamente; nenhuma gravação em localStorage ou POST |
| Referência visual | Frames inicial/intermediário/final sobre `#111111`, centralizados; inspeção das capturas e dos contatos do MOV original, preservando desenho e preenchimento da marca |
| Mobile | Logo decodificada com pixels visíveis em 390 e 320 px; vídeo central e contido no viewport, sem overflow horizontal |
| Movimento reduzido | Sem montagem de vídeo/source e sem request de mídia |
| Interrupção | Botão Pular animação pelo teclado e Escape liberam o conteúdo |
| Fallback MP4 | WebM 404 seguido de reprodução efetiva do MP4, com `playing` e `ended`; tela liberada em aproximadamente 3,10 s |
| Falhas | Todos os assets 404, autoplay rejeitado e request de mídia travado liberam o aplicativo; casos de timeout em aproximadamente 7,2 s incluindo navegação, hidratação e fade, abaixo do limite de teste de 8,5 s |

Foi encontrado e corrigido um defeito real do fallback: o erro do `<source>` WebM propagava para o handler React do vídeo, encerrando a animação antes do MP4 terminar. O handler agora considera apenas erros do próprio elemento de vídeo. Foram repetidos somente fallback, 404 e a captura dos frames; todos passaram. Os demais grupos foram mantidos da execução isolada inicial.

O runner está em `scripts/verification/preloader-regression.mjs`. Resultados consolidados e capturas estão em `design/implementation/verification/preloader/`, incluindo `results.json`, `desktop-video-beginning.png`, `desktop-video-middle.png`, `desktop-video-final.png`, `mobile-390-preloader.png` e `mobile-320-preloader.png`. As referências e a preparação da mídia estão documentadas em `design/implementation/preloader/README.md`. As verificações de navegador desta rodada foram executadas em desenvolvimento; build de produção aprovado não significa execução desta suíte em outros navegadores.

```powershell
npm exec --yes --package=playwright -- node scripts/verification/preloader-regression.mjs
```

O runner usa o Chrome instalado e o cache do npm, sem alterar as dependências do aplicativo. `TEST_URL`, `TEST_OUTPUT` e `TEST_FILTER` permitem selecionar servidor, pasta de artefatos e grupos específicos. `/api/status` é mockado quando a navegação alcança `/inicio`; nenhum serviço de IA é consumido.

## Entrada explicativa e login visual — 30/09/2026

**27 grupos de verificação aprovados, zero falhas pendentes em desenvolvimento**, consolidados em `design/implementation/verification/entry-login/results.json`. Foram executados 22 grupos do fluxo de planejamento e, depois da integração do login, cinco grupos restritos à nova entrada. Esta rodada não repetiu a suíte completa em produção; o build de produção, TypeScript e lint foram executados pelo agente principal. O histórico de produção abaixo pertence à entrega anterior.

O agente principal confirmou build de produção e TypeScript aprovados, lint sem erros e 11 avisos históricos nos scripts Figma. Os novos componentes não apresentaram avisos no lint restrito aos arquivos alterados. A sintaxe do runner e `git diff --check` dos arquivos de verificação também passaram.

- `/` redireciona para `/login`. E-mail, senha e o botão Entrar estão desabilitados; nenhuma autenticação foi implementada. A exploração dos módulos por teclado, Escape e botão de fechamento restaura o foco. Não houve POST nem gravação em localStorage durante o login e suas interações.
- “Explorar demonstração” abre `/inicio`, que apresenta o produto sem exibir campos de planejamento. “Gerar planejamento” abre o formulário em diálogo; Escape e Cancelar fecham o diálogo e restauram o foco sem criar uma sessão. Os quatro horizontes, validação de campos obrigatórios e o payload original de início foram aprovados.
- Os nove hashes de API/biblioteca permanecem iguais. O controlador `StrategicPlanner()` também permanece igual ao registro original, normalizando apenas quebras de linha e o caminho da logo SVG já autorizado. Entrevista, ajuda, falhas simuladas, persistência, geração, cinco abas, exportações e confirmação de reset passaram novamente.
- Login, homepage, diálogo, entrevista e abas foram verificados em 1440, 390 e 320 px, sem overflow horizontal da página. Popovers do login foram verificados adicionalmente em 1051, 1100 e 1200 px; não invadem o cartão central. Sora, logo SVG, imagens carregadas, tema escuro, movimento normal/reduzido e ausência de erros JavaScript foram aprovados.

Capturas atuais: `entry-login/login-1440.png`, `login-390.png`, `login-320.png`, `login-390-module.png`, `login-320-module.png`, `1440-homepage.png`, `390-homepage.png`, `320-homepage.png` e `*-planning-modal.png`, dentro de `design/implementation/verification/`. Os PNGs de login e homepage foram inspecionados visualmente; o login segue a composição da referência Metrics, com a marca e os módulos deste produto. A homepage tem conteúdo novo solicitado pelo usuário; as capturas das cinco abas continuam comparáveis às pranchas Figma anteriores.

Uma primeira tentativa de capturar o popover com `fullPage` provocou resize temporário do Chrome e seu fechamento intencional pelo componente. O runner passou a capturar somente o elemento do popover e as duas verificações mobile foram repetidas com sucesso. Não foi necessário modificar código de produção para resolver esse artefato de teste.

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

A suíte verifica a entrada em `/login`, a homepage em `/inicio`, payloads e persistência, falhas de rede simuladas, conteúdo das cinco abas, downloads, confirmação, responsividade em 1440/390/320 px, Sora, movimento reduzido e teclado no menu mobile. Screenshots e resultados atuais são gravados em `design/implementation/verification/entry-login`. Execuções com `TEST_FILTER` substituem somente os grupos selecionados no resultado consolidado; uma execução completa recria o resultado.

## Histórico da primeira implementação — 30/09/2026

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
