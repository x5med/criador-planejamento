# Arquitetura

```text
Navegador
  ├─ entrevista, progresso e plano
  ├─ localStorage
  └─ exportação Markdown/JSON
          │ HTTPS
          ▼
Next.js App Router
  ├─ POST /api/interview
  ├─ POST /api/plan
  └─ GET  /api/status
          │ servidor somente
          ▼
Gemini API (@google/genai)
```

## Decisões

- **Entrada:** `/` redireciona para `/login`; “Explorar demonstração” navega para `/inicio`. Sem sessão salva, a página apresenta o sistema e abre o formulário de contexto somente após “Gerar planejamento”. Com sessão salva, o controlador retoma a entrevista ou o plano.
- **Login visual:** o componente de apresentação segue o layout do Metrics. Campos e ação Entrar estão desativados. Nenhuma credencial é capturada, enviada ou persistida; não há sessão autenticada, cookie de acesso ou proteção de rotas.

- **Next.js:** uma aplicação e suas rotas server-side no mesmo deploy.
- **TypeScript + Zod:** validação de entrada e da resposta da IA.
- **Saída estruturada:** schema menor e específico para evitar JSON inconsistente.
- **Chave no servidor:** `GEMINI_API_KEY` nunca usa prefixo `NEXT_PUBLIC_`.
- **Modo demonstração:** permite testar a jornada antes de configurar faturamento ou segredo.
- **Persistência local:** reduz infraestrutura no MVP; o formato JSON permite migração futura.

## Segurança

- limite de tamanho e validação para requisições;
- prompts tratam respostas do usuário como dados, não como instruções;
- mensagens de erro não retornam a chave ou detalhes do provedor;
- nenhuma execução de ferramenta ou ação externa é concedida ao modelo;
- saída do modelo passa por validação antes da renderização.

Antes de uso público com dados reais, adicionar autenticação, consentimento, política de retenção, rate limiting persistente, monitoramento de custo e revisão de privacidade.

## Integração futura do login

O esqueleto em `components/LoginPreview.tsx` está separado do controlador de planejamento. A próxima etapa deve conectar o formulário a um provedor de autenticação pelo servidor, criar a sessão e autorizar acesso nas rotas e APIs. Somente depois disso os campos e Entrar devem ser habilitados e a entrada pública de demonstração revista. O armazenamento local atual é uma sessão de trabalho, não uma identidade autenticada.
