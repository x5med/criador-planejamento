import { z } from "zod";

export const phaseSchema = z.enum([
  "context",
  "current",
  "direction",
  "execution",
  "people",
]);

export const answerEntrySchema = z.object({
  questionId: z.string().min(1).max(120),
  phase: phaseSchema,
  question: z.string().min(1).max(600),
  answer: z.string().min(1).max(8000),
  answeredAt: z.string().max(50),
});

export const interviewRequestSchema = z.object({
  mode: z.enum(["next", "coach"]),
  context: z.object({
    organization: z.string().min(1).max(180),
    sector: z.string().min(1).max(180),
    horizon: z.string().min(1).max(120),
    challenge: z.string().min(1).max(1200),
  }),
  phase: phaseSchema,
  answers: z.array(answerEntrySchema).max(60),
  askedQuestionIds: z.array(z.string().max(120)).max(80),
  currentQuestion: z
    .object({
      id: z.string().max(120),
      prompt: z.string().max(600),
      helper: z.string().max(1200),
    })
    .nullable(),
});

export const questionSchema = z.object({
  id: z.string().min(1).max(120),
  phase: phaseSchema,
  title: z.string().min(1).max(100),
  prompt: z.string().min(1).max(600),
  helper: z.string().min(1).max(1200),
  answerType: z.enum(["textarea", "text", "number", "select"]),
  options: z.array(z.string().max(120)).max(8),
  whyItMatters: z.string().min(1).max(500),
});

export const nextQuestionOutputSchema = z.object({
  question: questionSchema,
  insight: z.string().max(800),
  readiness: z.number().int().min(0).max(100),
  missingTopics: z.array(z.string().max(160)).max(8),
});

export const coachOutputSchema = z.object({
  guidance: z.string().min(1).max(1800),
  suggestedStructure: z.array(z.string().max(400)).min(1).max(6),
  caution: z.string().min(1).max(600),
});

export const planRequestSchema = z.object({
  context: z.object({
    organization: z.string().min(1).max(180),
    sector: z.string().min(1).max(180),
    horizon: z.string().min(1).max(120),
    challenge: z.string().min(1).max(1200),
  }),
  answers: z.array(answerEntrySchema).min(5).max(60),
});

const evidenceItemSchema = z.object({
  label: z.string().min(1),
  detail: z.string().min(1),
});

export const strategicPlanSchema = z.object({
  meta: z.object({
    organization: z.string().min(1),
    sector: z.string().min(1),
    horizon: z.string().min(1),
    generatedAt: z.string().min(1),
  }),
  executiveSummary: z.string().min(40),
  evidenceStatus: z.object({
    facts: z.array(evidenceItemSchema),
    assumptions: z.array(evidenceItemSchema),
    gaps: z.array(evidenceItemSchema),
  }),
  diagnosis: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    threats: z.array(z.string()),
    strategicIssues: z.array(
      z.object({
        issue: z.string(),
        cause: z.string(),
        consequence: z.string(),
        urgency: z.enum(["baixa", "media", "alta", "critica"]),
      }),
    ),
  }),
  growthAvenues: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      valueScore: z.number().int().min(1).max(10),
      complexityScore: z.number().int().min(1).max(10),
      decision: z.enum(["agora", "proxima", "depois", "descartar"]),
      reason: z.string(),
    }),
  ),
  strategicChoices: z.object({
    thesis: z.string().min(20),
    ansoffDirection: z.enum([
      "penetracao_de_mercado",
      "desenvolvimento_de_produto",
      "desenvolvimento_de_mercado",
      "diversificacao",
      "portfolio_misto",
    ]),
    priorities: z.array(z.string()),
    nonGoals: z.array(z.string()),
    requiredCapabilities: z.array(z.string()),
  }),
  objectives: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      rationale: z.string(),
      owner: z.string(),
      keyResults: z.array(
        z.object({
          id: z.string(),
          metric: z.string(),
          baseline: z.string(),
          target: z.string(),
          unit: z.string(),
          dueDate: z.string(),
          source: z.string(),
          frequency: z.string(),
          owner: z.string(),
        }),
      ),
    }),
  ),
  initiatives: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      linkedKr: z.string(),
      why: z.string(),
      owner: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      how: z.string(),
      cost: z.string(),
      dependencies: z.array(z.string()),
    }),
  ),
  financialPlan: z.object({
    assumptions: z.array(z.string()),
    scenarios: z.array(
      z.object({
        name: z.enum(["adverso", "base", "favoravel"]),
        description: z.string(),
        expectedImpact: z.string(),
      }),
    ),
    alerts: z.array(z.string()),
  }),
  governance: z.object({
    roles: z.array(
      z.object({
        role: z.string(),
        responsibility: z.string(),
        decisionRights: z.string(),
      }),
    ),
    cadences: z.array(
      z.object({
        name: z.string(),
        frequency: z.string(),
        purpose: z.string(),
      }),
    ),
    communication: z.string(),
  }),
  risks: z.array(
    z.object({
      risk: z.string(),
      probability: z.enum(["baixa", "media", "alta"]),
      impact: z.enum(["baixo", "medio", "alto", "critico"]),
      earlySignal: z.string(),
      mitigation: z.string(),
      owner: z.string(),
    }),
  ),
  first90Days: z.array(
    z.object({
      period: z.string(),
      deliverable: z.string(),
      owner: z.string(),
    }),
  ),
  quality: z.object({
    score: z.number().int().min(0).max(100),
    strengths: z.array(z.string()),
    improvements: z.array(z.string()),
  }),
});

export type ParsedStrategicPlan = z.infer<typeof strategicPlanSchema>;
