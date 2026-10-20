# X5 Planejamento — criador estratégico com IA

Aplicação web que entrevista o usuário, transforma respostas em escolhas estratégicas e gera um plano executável com Gemini. O projeto aplica o método **Onde estamos → Para onde vamos → Como vamos → Com quem vamos**, com controles para evidências, OKRs, orçamento, riscos e governança.

## Funcionalidades

- entrevista adaptativa: a próxima pergunta considera as respostas anteriores;
- ajuda da IA para estruturar respostas sem inventar dados;
- cinco fases de descoberta com progresso e salvamento local;
- autenticação por e-mail/senha ou Google com Supabase Auth;
- rotas do planejador e geração por IA protegidas por sessão;
- geração estruturada de diagnóstico, SWOT, avenidas, tese e não-objetivos;
- objetivos com KRs separados de iniciativas 5W2H;
- premissas financeiras, cenários, riscos, governança e primeiros 90 dias;
- placar de qualidade do plano;
- exportação em Markdown e JSON;
- modo demonstração automático quando não há chave Gemini.

O [mapa funcional](docs/feature-map.md) relaciona cada tela às regras do método. A [arquitetura](docs/architecture.md) explica as decisões técnicas e de segurança.

O [PRD do front end e novo design system](docs/prd-frontend-design-system.md) define a experiência proposta, requisitos e critérios de aceite. O [guia do design system X5 Business](design/figma/README.md) reúne as telas no Figma, tokens nativos, componentes, protótipo e prévias.

O novo design está implementado na abertura, autenticação, entrevista e nas cinco vistas do plano, com Sora, marca SVG X5, cards chip e layouts para desktop e celular. “Criar meu planejamento” solicita acesso e, após a autenticação, abre o formulário de contexto. O [guia da implementação](design/implementation/README.md) registra os componentes e a referência visual; o [relatório de verificação](docs/frontend-verification.md) documenta os testes de preservação dos fluxos e a comparação com o Figma.

O [pré-loader X5](design/implementation/preloader/README.md) anima o SVG oficial do Grupo X5 em React com Motion enquanto o conteúdo está carregando. A animação se repete até a conclusão real e fica estática para quem prefere movimento reduzido.

## Rodar localmente

Requisitos: Node.js 22 ou superior.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `NEXT_PUBLIC_SITE_URL`. `/` apresenta o produto; `/login` e `/cadastro` oferecem acesso por e-mail/senha ou Google. `/inicio`, `/api/interview` e `/api/plan` exigem uma sessão autenticada. O plano continua salvo no navegador, mas agora em uma chave isolada pelo ID do usuário.

Para usar Gemini de verdade, preencha `GEMINI_API_KEY` em `.env.local`. Sem a chave, todas as telas continuam funcionando com respostas demonstrativas claramente identificadas.

## Validar

```bash
npm run lint
npm run typecheck
npm run build
```

## Hospedar na Vercel

1. Importe este repositório na Vercel.
2. Mantenha o preset Next.js.
3. Cadastre as três variáveis públicas do Supabase, `GEMINI_API_KEY` e, opcionalmente, `GEMINI_MODEL` nas variáveis do projeto.
4. Faça o deploy.

A chave nunca é enviada ao navegador: as chamadas passam por rotas server-side. Segundo a documentação oficial, a chave Gemini deve ser mantida como segredo no ambiente do servidor.

## Dados e privacidade

No MVP, planos ficam no `localStorage` do navegador, em uma chave por usuário autenticado. O Supabase mantém a identidade e a sessão; o servidor recebe somente o contexto necessário para a chamada atual e não persiste o conteúdo do plano em banco. Evite inserir dados pessoais sensíveis ou segredos comerciais sem uma política de tratamento apropriada.

## Modelo

O padrão é `gemini-3.6-flash`, configurável por `GEMINI_MODEL`. A integração usa saída JSON estruturada e validação Zod antes de enviar o resultado ao cliente. Falhas transitórias de capacidade recebem novas tentativas automáticas e, se persistirem, o app mantém a jornada disponível no modo demonstrativo.
