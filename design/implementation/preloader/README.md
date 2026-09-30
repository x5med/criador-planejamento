# Loading Grupo X5

Animação vetorial em React com `useAnimate` de Motion. Usa os 13 contornos oficiais de `public/brand/grupo-x5.svg`, agrupados em X, 5, palavra GRUPO e detalhes. Os furos das letras são preservados com `fillRule="evenodd"`.

## Duração controlada pelo carregamento

- `AppPreloader`: aguarda o carregamento do documento (`window.load`) e das fontes (`document.fonts.ready`). Remove a cobertura assim que ambos concluem. Se já estão prontos, não impõe duração mínima. A transição de saída dura 220 ms.
- `app/loading.tsx`: fallback real de Suspense do Next.js, desmontado quando a rota fica pronta.
- `StrategicPlanner`: mostra a logo durante a recuperação inicial da sessão.
- `PlannerJourney`: mostra a logo enquanto uma pergunta ou o plano está sendo gerado; a própria flag `loading` existente controla sua presença. Erros continuam seguindo o fluxo atual do produto.

`AnimatedGroupLogo` repete o desenho dos contornos, preenchimento e uma breve transição de reinício em ciclos de 2,4 segundos. O ciclo não libera a tela: é a conclusão do carregamento que desmonta a animação. O componente cancela seu trabalho ao desmontar.

Não há botão de pular, percentuais fictícios, espera mínima artificial ou vídeo. Com movimento reduzido, a marca fica estática enquanto o conteúdo carrega. O fundo continua claro com a marca escura, inclusive se o sistema operacional prefere tema escuro. Sem JavaScript, a cobertura inicial é removida por `noscript`; há também uma proteção CSS para uma cobertura que permaneça no estado anterior à hidratação.

## Referência de movimento

O vídeo `X5 SEM FUNDO (1).mov` é apenas referência para desenho e preenchimento; sua assinatura X5 MED não aparece no aplicativo. Os contatos `reference-contact-sheet.png` e `reveal-contact-sheet.png` documentam essa referência. As capturas históricas de abertura com duração fixa não descrevem mais o comportamento de carregamento atual.

API usada: [Motion useAnimate](https://motion.dev/docs/react-use-animate).
