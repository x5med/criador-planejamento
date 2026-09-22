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
