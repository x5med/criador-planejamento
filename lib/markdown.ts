import type { StrategicPlan } from "@/lib/types";

const list = (items: string[]) =>
  items.length ? items.map((item) => `- ${item}`).join("\n") : "- Nenhum item registrado";

export function planToMarkdown(plan: StrategicPlan) {
  const objectives = plan.objectives
    .map(
      (objective) => `### ${objective.id} — ${objective.title}

**Razão:** ${objective.rationale}
**Dono:** ${objective.owner}

| KR | Métrica | Baseline | Meta | Prazo | Fonte | Dono |
|---|---|---|---|---|---|---|
${objective.keyResults
  .map(
    (kr) =>
      `| ${kr.id} | ${kr.metric} | ${kr.baseline} | ${kr.target} ${kr.unit} | ${kr.dueDate} | ${kr.source} | ${kr.owner} |`,
  )
  .join("\n")}`,
    )
    .join("\n\n");

  return `# Plano estratégico — ${plan.meta.organization}

**Setor:** ${plan.meta.sector}
**Horizonte:** ${plan.meta.horizon}
**Gerado em:** ${plan.meta.generatedAt}

## Resumo executivo

${plan.executiveSummary}

## Diagnóstico

### Forças
${list(plan.diagnosis.strengths)}

### Fraquezas
${list(plan.diagnosis.weaknesses)}

### Oportunidades
${list(plan.diagnosis.opportunities)}

### Ameaças
${list(plan.diagnosis.threats)}

## Tese e escolhas

${plan.strategicChoices.thesis}

### Prioridades
${list(plan.strategicChoices.priorities)}

### Não-objetivos
${list(plan.strategicChoices.nonGoals)}

## Objetivos e resultados-chave

${objectives}

## Iniciativas

| ID | Iniciativa | KR | Dono | Prazo | Custo |
|---|---|---|---|---|---|
${plan.initiatives
  .map(
    (item) =>
      `| ${item.id} | ${item.title} | ${item.linkedKr} | ${item.owner} | ${item.startDate} → ${item.endDate} | ${item.cost} |`,
  )
  .join("\n")}

## Riscos

${plan.risks
  .map(
    (item) =>
      `- **${item.risk}** — ${item.probability}/${item.impact}. Sinal: ${item.earlySignal}. Mitigação: ${item.mitigation}. Dono: ${item.owner}.`,
  )
  .join("\n")}

## Primeiros 90 dias

${plan.first90Days
  .map((item) => `- **${item.period}:** ${item.deliverable} — ${item.owner}`)
  .join("\n")}

## Qualidade do plano

**${plan.quality.score}/100**

### Melhorias necessárias
${list(plan.quality.improvements)}
`;
}
