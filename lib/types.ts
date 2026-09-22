export const PHASES = [
  {
    id: "context",
    eyebrow: "Fundamentos",
    title: "Contexto",
    description: "Escopo, ambição e regras do jogo.",
  },
  {
    id: "current",
    eyebrow: "Diagnóstico",
    title: "Onde estamos",
    description: "Evidências, clientes e cenário atual.",
  },
  {
    id: "direction",
    eyebrow: "Escolhas",
    title: "Para onde vamos",
    description: "Avenidas, prioridades e renúncias.",
  },
  {
    id: "execution",
    eyebrow: "Execução",
    title: "Como vamos",
    description: "Resultados, iniciativas e dinheiro.",
  },
  {
    id: "people",
    eyebrow: "Governança",
    title: "Com quem vamos",
    description: "Donos, riscos e ritmo de gestão.",
  },
] as const;

export type PhaseId = (typeof PHASES)[number]["id"];
export type QuestionType = "textarea" | "text" | "number" | "select";

export type InterviewQuestion = {
  id: string;
  phase: PhaseId;
  title: string;
  prompt: string;
  helper: string;
  answerType: QuestionType;
  options: string[];
  whyItMatters: string;
};

export type AnswerEntry = {
  questionId: string;
  phase: PhaseId;
  question: string;
  answer: string;
  answeredAt: string;
};

export type InterviewResponse = {
  question: InterviewQuestion;
  insight: string;
  readiness: number;
  missingTopics: string[];
  provider: "gemini" | "demo";
};

export type CoachResponse = {
  guidance: string;
  suggestedStructure: string[];
  caution: string;
  provider: "gemini" | "demo";
};

export type PlannerSession = {
  id: string;
  organization: string;
  sector: string;
  horizon: string;
  challenge: string;
  phase: PhaseId;
  question: InterviewQuestion | null;
  answers: AnswerEntry[];
  askedQuestionIds: string[];
  readiness: number;
  missingTopics: string[];
  provider: "gemini" | "demo" | null;
  createdAt: string;
  updatedAt: string;
  plan: StrategicPlan | null;
};

export type EvidenceItem = {
  label: string;
  detail: string;
};

export type StrategicPlan = {
  meta: {
    organization: string;
    sector: string;
    horizon: string;
    generatedAt: string;
  };
  executiveSummary: string;
  evidenceStatus: {
    facts: EvidenceItem[];
    assumptions: EvidenceItem[];
    gaps: EvidenceItem[];
  };
  diagnosis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    strategicIssues: {
      issue: string;
      cause: string;
      consequence: string;
      urgency: "baixa" | "media" | "alta" | "critica";
    }[];
  };
  growthAvenues: {
    title: string;
    description: string;
    valueScore: number;
    complexityScore: number;
    decision: "agora" | "proxima" | "depois" | "descartar";
    reason: string;
  }[];
  strategicChoices: {
    thesis: string;
    ansoffDirection:
      | "penetracao_de_mercado"
      | "desenvolvimento_de_produto"
      | "desenvolvimento_de_mercado"
      | "diversificacao"
      | "portfolio_misto";
    priorities: string[];
    nonGoals: string[];
    requiredCapabilities: string[];
  };
  objectives: {
    id: string;
    title: string;
    rationale: string;
    owner: string;
    keyResults: {
      id: string;
      metric: string;
      baseline: string;
      target: string;
      unit: string;
      dueDate: string;
      source: string;
      frequency: string;
      owner: string;
    }[];
  }[];
  initiatives: {
    id: string;
    title: string;
    linkedKr: string;
    why: string;
    owner: string;
    startDate: string;
    endDate: string;
    how: string;
    cost: string;
    dependencies: string[];
  }[];
  financialPlan: {
    assumptions: string[];
    scenarios: {
      name: "adverso" | "base" | "favoravel";
      description: string;
      expectedImpact: string;
    }[];
    alerts: string[];
  };
  governance: {
    roles: { role: string; responsibility: string; decisionRights: string }[];
    cadences: { name: string; frequency: string; purpose: string }[];
    communication: string;
  };
  risks: {
    risk: string;
    probability: "baixa" | "media" | "alta";
    impact: "baixo" | "medio" | "alto" | "critico";
    earlySignal: string;
    mitigation: string;
    owner: string;
  }[];
  first90Days: {
    period: string;
    deliverable: string;
    owner: string;
  }[];
  quality: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
};
