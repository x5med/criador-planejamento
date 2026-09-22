import type {
  AnswerEntry,
  CoachResponse,
  InterviewQuestion,
  InterviewResponse,
  PhaseId,
  StrategicPlan,
} from "@/lib/types";

type DemoContext = {
  organization: string;
  sector: string;
  horizon: string;
  challenge: string;
};

const QUESTIONS: InterviewQuestion[] = [
  {
    id: "context-decision",
    phase: "context",
    title: "Decisão central",
    prompt: "Qual decisão mais importante este planejamento precisa destravar?",
    helper: "Ex.: escolher a principal avenida de crescimento, recuperar margem ou reduzir dependência de um canal.",
    answerType: "textarea",
    options: [],
    whyItMatters: "Um plano só é útil quando melhora decisões reais.",
  },
  {
    id: "context-sponsor",
    phase: "context",
    title: "Patrocínio e decisão",
    prompt: "Quem aprova o plano e quem precisa participar da construção?",
    helper: "Liste o patrocinador, os decisores e os representantes que conhecem clientes, operação e finanças.",
    answerType: "textarea",
    options: [],
    whyItMatters: "Estratégia sem responsabilidade clara perde força na execução.",
  },
  {
    id: "context-constraints",
    phase: "context",
    title: "Restrições reais",
    prompt: "Quais limites de caixa, pessoas, tecnologia, prazo ou regulação não podem ser ignorados?",
    helper: "Se algo ainda não for conhecido, escreva explicitamente que precisa ser validado.",
    answerType: "textarea",
    options: [],
    whyItMatters: "Restrições determinam quais escolhas são realmente executáveis.",
  },
  {
    id: "current-baselines",
    phase: "current",
    title: "Números de partida",
    prompt: "Quais são os principais indicadores atuais e seus valores de referência?",
    helper: "Inclua período e fonte: receita, margem, caixa, aquisição, retenção, satisfação, ocupação ou capacidade.",
    answerType: "textarea",
    options: [],
    whyItMatters: "Sem baseline, não existe resultado-chave mensurável.",
  },
  {
    id: "current-customers",
    phase: "current",
    title: "Voz do cliente",
    prompt: "Por que os clientes escolhem, permanecem ou deixam a organização?",
    helper: "Diferencie evidências de pesquisa, dados de comportamento e percepções da equipe.",
    answerType: "textarea",
    options: [],
    whyItMatters: "A estratégia precisa responder ao valor percebido, não apenas à visão interna.",
  },
  {
    id: "current-internal",
    phase: "current",
    title: "Forças e gargalos",
    prompt: "Quais capacidades geram resultado e quais gargalos fazem a empresa perder valor, tempo ou dinheiro?",
    helper: "Considere comercial, atendimento, operação, pessoas, tecnologia e gestão.",
    answerType: "textarea",
    options: [],
    whyItMatters: "A escolha estratégica deve aproveitar forças e enfrentar restrições internas.",
  },
  {
    id: "current-external",
    phase: "current",
    title: "Mercado e ameaças",
    prompt: "Que mudanças de mercado, tecnologia, comportamento, concorrência ou regulação podem alterar o plano?",
    helper: "Informe a fonte quando possível e marque tendências ainda incertas como hipóteses.",
    answerType: "textarea",
    options: [],
    whyItMatters: "O plano deve sobreviver ao ambiente externo, não apenas ao cenário atual.",
  },
  {
    id: "direction-avenues",
    phase: "direction",
    title: "Avenidas de crescimento",
    prompt: "Quais opções reais de crescimento ou melhoria estão sobre a mesa?",
    helper: "Pense em base atual, novos produtos, novos mercados, canais, parcerias e eficiência.",
    answerType: "textarea",
    options: [],
    whyItMatters: "Escolher exige comparar alternativas, não defender a primeira ideia.",
  },
  {
    id: "direction-tradeoffs",
    phase: "direction",
    title: "Renúncias",
    prompt: "O que não será prioridade neste horizonte, mesmo sendo uma boa ideia?",
    helper: "Considere capacidade, timing, dependências e distância das competências atuais.",
    answerType: "textarea",
    options: [],
    whyItMatters: "Estratégia é também decidir o que não fazer agora.",
  },
  {
    id: "direction-advantage",
    phase: "direction",
    title: "Como vencer",
    prompt: "Que combinação de cliente, proposta de valor e capacidade pode criar uma vantagem defendível?",
    helper: "Descreva para quem, qual resultado entregue e por que a organização consegue fazê-lo melhor.",
    answerType: "textarea",
    options: [],
    whyItMatters: "A tese estratégica precisa explicar como as escolhas produzirão resultado.",
  },
  {
    id: "execution-outcomes",
    phase: "execution",
    title: "Resultados observáveis",
    prompt: "Que mudanças mensuráveis provariam que a estratégia funcionou?",
    helper: "Para cada resultado, informe baseline, meta, unidade, prazo e fonte se já existirem.",
    answerType: "textarea",
    options: [],
    whyItMatters: "Resultados-chave medem mudança; tarefas pertencem às iniciativas.",
  },
  {
    id: "execution-initiatives",
    phase: "execution",
    title: "Trabalho decisivo",
    prompt: "Quais iniciativas têm maior chance de mover esses resultados e quais dependências carregam?",
    helper: "Informe responsável, prazo, custo e definição de concluído quando conhecidos.",
    answerType: "textarea",
    options: [],
    whyItMatters: "A execução conecta escolhas a trabalho financiado e responsável.",
  },
  {
    id: "execution-finance",
    phase: "execution",
    title: "Capacidade financeira",
    prompt: "Quais premissas financeiras e limites de caixa precisam sustentar o plano?",
    helper: "Considere receita, margem, custos, investimentos, capital de giro, dívida e sazonalidade.",
    answerType: "textarea",
    options: [],
    whyItMatters: "Lucro projetado não garante caixa disponível para executar.",
  },
  {
    id: "people-owners",
    phase: "people",
    title: "Donos da estratégia",
    prompt: "Quem será o dono único de cada resultado e que capacidade a equipe ainda precisa desenvolver?",
    helper: "Use papéis ou nomes. Separe responsável final de colaboradores.",
    answerType: "textarea",
    options: [],
    whyItMatters: "Responsabilidade difusa costuma virar execução difusa.",
  },
  {
    id: "people-risks",
    phase: "people",
    title: "Riscos e sinais",
    prompt: "Quais riscos podem invalidar o plano e que sinal antecipado mostrará cada um deles?",
    helper: "Inclua mitigação, contingência e dono sempre que possível.",
    answerType: "textarea",
    options: [],
    whyItMatters: "Sinais antecipados permitem corrigir antes de o resultado aparecer no fechamento.",
  },
  {
    id: "people-cadence",
    phase: "people",
    title: "Ritmo de gestão",
    prompt: "Como o plano será acompanhado e quais decisões acontecerão semanal, mensal e trimestralmente?",
    helper: "Defina participantes, indicadores de entrada e decisões esperadas em cada ritual.",
    answerType: "textarea",
    options: [],
    whyItMatters: "Um plano sem cadência vira um documento estático.",
  },
];

const PHASE_ORDER: PhaseId[] = [
  "context",
  "current",
  "direction",
  "execution",
  "people",
];

export function getDemoInterview(
  phase: PhaseId,
  answers: AnswerEntry[],
  askedQuestionIds: string[],
): InterviewResponse {
  const currentIndex = PHASE_ORDER.indexOf(phase);
  let question = QUESTIONS.find(
    (item) => item.phase === phase && !askedQuestionIds.includes(item.id),
  );

  if (!question) {
    for (let index = currentIndex + 1; index < PHASE_ORDER.length; index += 1) {
      question = QUESTIONS.find(
        (item) =>
          item.phase === PHASE_ORDER[index] && !askedQuestionIds.includes(item.id),
      );
      if (question) break;
    }
  }

  question ??= {
    id: `final-reflection-${answers.length}`,
    phase: "people",
    title: "Informação complementar",
    prompt: "Que informação relevante ainda não apareceu e poderia mudar uma das escolhas do plano?",
    helper: "Inclua divergências entre líderes, compromissos já assumidos ou evidências que contrariem a direção atual.",
    answerType: "textarea",
    options: [],
    whyItMatters: "Uma última busca por evidência contrária reduz confiança excessiva no plano.",
  };
  const answeredPhases = new Set(answers.map((item) => item.phase));
  const missingTopics = PHASE_ORDER.filter((item) => !answeredPhases.has(item)).map(
    (item) =>
      ({
        context: "escopo e restrições",
        current: "baselines e evidências",
        direction: "escolhas e renúncias",
        execution: "KRs, iniciativas e finanças",
        people: "donos, riscos e cadência",
      })[item],
  );

  return {
    question,
    insight:
      answers.length === 0
        ? "Vamos começar pela decisão que o plano precisa melhorar."
        : "Sua resposta foi registrada. A próxima pergunta cobre a lacuna de maior impacto desta fase.",
    readiness: Math.min(96, Math.round((answers.length / 15) * 100)),
    missingTopics: missingTopics.slice(0, 5),
    provider: "demo",
  };
}

export function getDemoCoach(question: InterviewQuestion | null): CoachResponse {
  return {
    guidance:
      "Responda com o que é conhecido hoje e separe claramente evidência, percepção e hipótese. Uma resposta curta, datada e verificável é melhor que uma explicação ampla sem fonte.",
    suggestedStructure: [
      "Situação atual ou valor de referência",
      "Fonte, período e nível de confiança",
      "Causa percebida e consequência para o negócio",
      "O que ainda precisa ser validado",
    ],
    caution: question
      ? `Não transforme exemplos do campo “${question.title}” em dados reais da organização.`
      : "Não invente números para completar a resposta.",
    provider: "demo",
  };
}

export function buildDemoPlan(
  context: DemoContext,
  answers: AnswerEntry[],
): StrategicPlan {
  const facts = answers.slice(0, 4).map((item) => ({
    label: item.question,
    detail: `Informação declarada pelo usuário: ${item.answer.slice(0, 240)}`,
  }));
  const today = new Date().toISOString().slice(0, 10);

  return {
    meta: {
      organization: context.organization,
      sector: context.sector,
      horizon: context.horizon,
      generatedAt: today,
    },
    executiveSummary: `${context.organization} precisa transformar o desafio “${context.challenge}” em escolhas mensuráveis. Este plano demonstrativo prioriza aprofundar evidências, concentrar capacidade nas frentes de maior valor e instalar uma cadência de decisão antes de escalar investimentos.`,
    evidenceStatus: {
      facts,
      assumptions: [
        {
          label: "Hipótese de foco",
          detail: "A organização pode obter mais valor concentrando capacidade em até duas prioridades.",
        },
      ],
      gaps: [
        {
          label: "Baselines",
          detail: "Validar métricas financeiras, comerciais, de clientes e de capacidade com fonte e período.",
        },
        {
          label: "Capacidade financeira",
          detail: "Confirmar orçamento, fluxo de caixa e limites de investimento para o horizonte.",
        },
      ],
    },
    diagnosis: {
      strengths: ["Conhecimento do contexto declarado durante a entrevista", "Intenção explícita de planejar e acompanhar"],
      weaknesses: ["Baselines ainda incompletos", "Rastreabilidade das evidências precisa ser consolidada"],
      opportunities: ["Priorizar a base e as capacidades existentes", "Usar dados para testar opções antes de escalar"],
      threats: ["Dispersão entre iniciativas", "Investimento antes da validação financeira e de demanda"],
      strategicIssues: [
        {
          issue: "A ambição ainda não está inteiramente traduzida em indicadores verificáveis.",
          cause: "Faltam baselines, fontes e responsáveis em parte das respostas.",
          consequence: "A organização pode confundir atividade com progresso estratégico.",
          urgency: "alta",
        },
      ],
    },
    growthAvenues: [
      {
        title: "Aprofundar valor na base atual",
        description: "Testar melhorias de retenção, expansão e experiência antes de aumentar a complexidade.",
        valueScore: 8,
        complexityScore: 4,
        decision: "agora",
        reason: "Usa capacidades próximas e permite validar resultados com menor risco.",
      },
      {
        title: "Nova oferta ou novo mercado",
        description: "Manter como opção condicionada a evidência de demanda e capacidade financeira.",
        valueScore: 7,
        complexityScore: 8,
        decision: "proxima",
        reason: "O potencial pode ser alto, mas as lacunas atuais impedem compromisso integral.",
      },
    ],
    strategicChoices: {
      thesis: "Gerar crescimento sustentável concentrando execução na base e validando cada nova avenida com evidência, caixa e capacidade antes de escalar.",
      ansoffDirection: "penetracao_de_mercado",
      priorities: ["Consolidar baselines e voz do cliente", "Executar até duas iniciativas ligadas a resultados"],
      nonGoals: ["Abrir muitas frentes simultaneamente", "Aprovar investimentos sem cenário de caixa"],
      requiredCapabilities: ["Gestão por indicadores", "Descoberta de cliente", "Planejamento financeiro"],
    },
    objectives: [
      {
        id: "O-01",
        title: "Transformar foco estratégico em resultado comprovável",
        rationale: "A organização precisa medir mudança, não apenas concluir projetos.",
        owner: "A definir com o patrocinador",
        keyResults: [
          {
            id: "KR-01",
            metric: "Indicador principal de crescimento sustentável",
            baseline: "A definir",
            target: "A definir após validação do baseline",
            unit: "A definir",
            dueDate: context.horizon,
            source: "A definir",
            frequency: "Mensal",
            owner: "A definir",
          },
          {
            id: "KR-02",
            metric: "Percentual de iniciativas estratégicas com evidência, dono e impacto financeiro validados",
            baseline: "A definir",
            target: "100",
            unit: "%",
            dueDate: context.horizon,
            source: "Painel estratégico",
            frequency: "Mensal",
            owner: "Dono do plano",
          },
        ],
      },
    ],
    initiatives: [
      {
        id: "I-01",
        title: "Auditar baselines e fontes",
        linkedKr: "KR-01, KR-02",
        why: "Criar uma base confiável para metas e decisões.",
        owner: "Dono do plano",
        startDate: "Primeiros 30 dias",
        endDate: "Até o dia 30",
        how: "Reconciliar dados comerciais, operacionais e financeiros com seus responsáveis.",
        cost: "A definir",
        dependencies: ["Acesso aos sistemas", "Responsáveis pelos dados"],
      },
      {
        id: "I-02",
        title: "Selecionar e detalhar o portfólio prioritário",
        linkedKr: "KR-02",
        why: "Evitar dispersão de capacidade e investimento.",
        owner: "Patrocinador executivo",
        startDate: "Dia 15",
        endDate: "Dia 45",
        how: "Comparar valor, complexidade, dependências, risco e caixa de cada avenida.",
        cost: "Sem investimento material antes da aprovação",
        dependencies: ["Baselines mínimos", "Limite financeiro"],
      },
    ],
    financialPlan: {
      assumptions: ["Receita, margem, sazonalidade e caixa ainda precisam ser informados", "Nenhuma iniciativa é considerada financiada sem validação"],
      scenarios: [
        { name: "adverso", description: "Demanda e implantação abaixo do esperado.", expectedImpact: "Preservar caixa e adiar a segunda prioridade." },
        { name: "base", description: "Execução conforme capacidade validada.", expectedImpact: "Financiar as prioridades dentro do limite aprovado." },
        { name: "favoravel", description: "Resultados e caixa acima da trajetória.", expectedImpact: "Acelerar apenas após confirmar sustentabilidade." },
      ],
      alerts: ["Projetar fluxo de caixa mensal", "Validar tributos e dívida com especialistas"],
    },
    governance: {
      roles: [
        { role: "Patrocinador", responsibility: "Aprovar escolhas e trade-offs", decisionRights: "Alterar prioridades e orçamento" },
        { role: "Dono do plano", responsibility: "Manter indicadores, riscos e decisões", decisionRights: "Convocar revisões e escalar impedimentos" },
      ],
      cadences: [
        { name: "Execução", frequency: "Semanal", purpose: "Remover bloqueios e confirmar entregas" },
        { name: "Performance", frequency: "Mensal", purpose: "Revisar KRs, previsão e caixa" },
        { name: "Estratégia", frequency: "Trimestral", purpose: "Revisar escolhas, riscos e cenários" },
      ],
      communication: "Apresentar escolhas primeiro às lideranças e depois à organização, registrando decisões e aprendizados.",
    },
    risks: [
      {
        risk: "Dispersão em projetos não priorizados",
        probability: "alta",
        impact: "alto",
        earlySignal: "Mais de duas iniciativas materiais iniciadas sem dono e KR.",
        mitigation: "Portão mensal de portfólio e não-objetivos visíveis.",
        owner: "Patrocinador",
      },
      {
        risk: "Plano inviável para o caixa",
        probability: "media",
        impact: "critico",
        earlySignal: "Projeção abaixo do caixa mínimo definido.",
        mitigation: "Cenários mensais e implantação por estágios.",
        owner: "Responsável financeiro",
      },
    ],
    first90Days: [
      { period: "Dias 1–30", deliverable: "Baselines, fontes, donos e lacunas auditados", owner: "Dono do plano" },
      { period: "Dias 31–60", deliverable: "Avenidas priorizadas e iniciativas detalhadas", owner: "Patrocinador" },
      { period: "Dias 61–90", deliverable: "Primeira revisão de KRs, riscos e caixa", owner: "Comitê estratégico" },
    ],
    quality: {
      score: Math.min(82, 38 + answers.length * 3),
      strengths: ["Método completo", "Trade-offs explícitos", "Governança definida"],
      improvements: ["Substituir campos 'A definir' por dados verificados", "Validar metas e cenários financeiros"],
    },
  };
}
