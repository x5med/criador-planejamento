# Arquitetura

```text
Navegador
  ├─ login/cadastro Supabase
  ├─ entrevista, progresso e plano
  ├─ localStorage isolado por usuário
  └─ exportação Markdown/JSON
          │ HTTPS
          ▼
Next.js App Router
  ├─ proxy: renovação e proteção da sessão
  ├─ GET  /auth/callback
  ├─ POST /api/interview
  ├─ POST /api/plan
  └─ GET  /api/status
          ├──────────► Supabase Auth
          │ servidor somente
          └──────────► Gemini API / Vercel AI Gateway
```

## Decisões

- **Entrada:** `/` é a apresentação pública. `/login` e `/cadastro` autenticam com e-mail/senha ou Google. O proxy redireciona visitantes sem sessão de `/inicio` para o login e usuários conectados para o planejador.
- **Autenticação:** `@supabase/ssr` mantém cookies entre navegador, Server Actions, callback OAuth e componentes do servidor. A identidade usada para autorizar APIs é sempre revalidada no Supabase com `auth.getUser()`.

- **Next.js:** uma aplicação e suas rotas server-side no mesmo deploy.
- **TypeScript + Zod:** validação de entrada e da resposta da IA.
- **Saída estruturada:** schema menor e específico para evitar JSON inconsistente.
- **Chave no servidor:** `GEMINI_API_KEY` nunca usa prefixo `NEXT_PUBLIC_`.
- **Modo demonstração:** permite testar a jornada antes de configurar faturamento ou segredo.
- **Persistência local por usuário:** reduz infraestrutura no MVP e evita misturar planos entre contas no mesmo navegador; o formato JSON permite migração futura.

## Segurança

- limite de tamanho e validação para requisições;
- prompts tratam respostas do usuário como dados, não como instruções;
- mensagens de erro não retornam a chave ou detalhes do provedor;
- nenhuma execução de ferramenta ou ação externa é concedida ao modelo;
- saída do modelo passa por validação antes da renderização.
- `/inicio`, `/api/interview` e `/api/plan` exigem usuário autenticado;
- redirecionamentos de callback aceitam somente caminhos internos;
- a chave `service_role` não é usada pela aplicação.

Antes de uso amplo com dados reais, adicionar consentimento, política de retenção, rate limiting persistente, monitoramento de custo e revisão de privacidade.
