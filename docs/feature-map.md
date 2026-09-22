# Mapa de funcionalidades

## Jornada principal

| Etapa | Interface | Inteligência | Saída |
|---|---|---|---|
| Início | nome da organização, setor e horizonte | define contexto e decisão | sessão local |
| Contexto | pergunta adaptativa | delimita escopo, restrições e decisores | contrato do plano |
| Onde estamos | perguntas de evidência | separa fatos, hipóteses e lacunas | diagnóstico e SWOT |
| Para onde vamos | perguntas de escolha | gera e prioriza avenidas | tese, prioridades e não-objetivos |
| Como vamos | perguntas de resultado e capacidade | diferencia KR de iniciativa | objetivos, KRs, 5W2H e finanças |
| Com quem vamos | perguntas de governança | define donos, riscos e cadências | execução e primeiros 90 dias |
| Plano | navegação por blocos | saída estruturada + rubrica | Markdown e JSON exportáveis |

## Entrevista adaptativa

- `POST /api/interview` com modo `next`: gera a próxima pergunta com base no que ainda falta.
- `POST /api/interview` com modo `coach`: explica o que uma boa resposta deve conter e propõe uma estrutura usando apenas fatos já informados.
- O modelo não pode inventar baseline, concorrente, prazo, responsável ou valor financeiro.
- Com a chave ausente ou indisponível, o servidor usa um banco de perguntas e orientações demonstrativas.

## Geração do plano

`POST /api/plan` recebe perguntas e respostas, solicita JSON estruturado ao Gemini, valida o resultado e devolve:

1. resumo executivo;
2. evidências, hipóteses e lacunas;
3. diagnóstico e questões estratégicas;
4. avenidas com valor, complexidade e decisão;
5. tese, prioridades e não-objetivos;
6. objetivos e KRs;
7. iniciativas 5W2H;
8. finanças e cenários;
9. governança, riscos e 90 dias;
10. placar de qualidade.

## Estados e persistência

- A sessão é salva automaticamente no navegador.
- Recarregar a página restaura entrevista ou plano.
- “Novo plano” limpa apenas a sessão desta aplicação.
- Exportar JSON preserva a estrutura para integrações futuras.

## Fora do escopo do MVP

- autenticação e organizações multiusuário;
- banco de dados e colaboração em tempo real;
- upload/análise de documentos;
- cobrança e limites por conta;
- integração automática com ERP, CRM ou contabilidade.

Esses itens estão desacoplados da experiência principal e podem ser adicionados sem alterar o contrato do plano.
