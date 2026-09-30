"use client";

import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowUpRight, Check, CheckCheck, FileJson, FileText, Menu, Plus, X } from "lucide-react";
import { AiBadge, Brand, ChipCard, type ProviderStatus } from "@/components/PlannerPrimitives";
import { PlannerAgenda } from "./PlannerAgenda";
import { planToMarkdown } from "@/lib/markdown";
import type { PlannerSession, StrategicPlan } from "@/lib/types";
import assetGeometry from "@/public/design/plan/asset-geometry.json";

type PlanTab = "overview" | "diagnosis" | "choices" | "execution" | "governance";
const tabs: { id: PlanTab; label: string; icon: string; selected: string; mobile: string }[] = [
  { id: "overview", label: "Visão geral", icon: "d9bde", selected: "65b4e", mobile: "56ee1" },
  { id: "diagnosis", label: "Diagnóstico", icon: "97991", selected: "77685", mobile: "f31a1" },
  { id: "choices", label: "Escolhas", icon: "775db", selected: "b21a8", mobile: "acd7a" },
  { id: "execution", label: "Execução", icon: "6209d", selected: "a6c9b", mobile: "d2782" },
  { id: "governance", label: "Governança", icon: "170d4", selected: "a5fb8", mobile: "4fb07" },
];
const headings: Record<PlanTab, [string, string, string]> = {
  overview: ["Seu próximo ciclo", "Clareza para decidir.", ""],
  diagnosis: ["Onde estamos", "Antes de escolher, entender.", "Separe o que sabemos do que ainda precisa ser validado."],
  choices: ["Para onde vamos", "Escolher também é renunciar.", "Compare as avenidas e concentre energia nas escolhas deste ciclo."],
  execution: ["Como vamos", "Resultado medido. Trabalho responsável.", "Conecte cada iniciativa ao resultado que ela precisa mover."],
  governance: ["Com quem vamos", "A estratégia ganha dono e ritmo.", "Papéis claros, sinais antecipados e uma cadência de decisão."],
};
const directionLabels: Record<StrategicPlan["strategicChoices"]["ansoffDirection"], string> = {
  penetracao_de_mercado: "Penetração de mercado", desenvolvimento_de_produto: "Desenvolvimento de produto",
  desenvolvimento_de_mercado: "Desenvolvimento de mercado", diversificacao: "Diversificação", portfolio_misto: "Portfólio misto",
};
// Figma exports keep their native root dimensions; images are never stretched.
function Asset({ name }: { name: string }) {
  const size = (assetGeometry as Record<string, { width: number; height: number }>)[name];
  return <Image className="result-asset" src={`/design/plan/${name}.svg`} alt="" aria-hidden="true" unoptimized width={size.width} height={size.height} />;
}
function Tag({ children, tone = "" }: { children: ReactNode; tone?: string }) { return <span className={`result-tag ${tone}`}>{children}</span>; }
function CardTitle({ children, badge }: { children: ReactNode; badge?: ReactNode }) { return <div className="result-card-title"><h2>{children}</h2>{badge && <Tag>{badge}</Tag>}</div>; }
function Bullets({ items }: { items: string[] }) { return items.length ? <ul className="result-bullets">{items.map((item, i) => <li key={`${i}-${item}`}>{item}</li>)}</ul> : <p className="result-empty">Nenhum item informado.</p>; }
function qualityLabel(score: number) { return score >= 80 ? "Pronto para decisão" : score >= 60 ? "Bom, com ressalvas" : "Precisa de evidências"; }

export function PlanDashboard({ session, status, onBack, onNew }: { session: PlannerSession; status: ProviderStatus | null; onBack: () => void; onNew: () => void }) {
  const plan = session.plan as StrategicPlan;
  const [tab, setTab] = useState<PlanTab>("overview");
  const [drawer, setDrawer] = useState(false);
  const [showMethod, setShowMethod] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const methodRef = useRef<HTMLDialogElement>(null);
  const navId = useId();
  const demo = session.provider !== "gemini";
  const chooseTab = (id: PlanTab) => { setTab(id); if (drawer) { drawerRef.current?.close(); setDrawer(false); } };
  const download = (format: "json" | "md", source: HTMLButtonElement) => {
    const safeName = plan.meta.organization.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const content = format === "json" ? JSON.stringify(plan, null, 2) : planToMarkdown(plan);
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `plano-${safeName || "estrategico"}.${format}`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    const menu = source.closest("details");
    if (menu) menu.open = false;
  };
  const navKey = (event: KeyboardEvent<HTMLElement>) => {
    const offset = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!offset && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next = event.key === "Home" ? tabs[0] : event.key === "End" ? tabs[tabs.length - 1] : tabs[(tabs.findIndex(t => t.id === tab) + offset + tabs.length) % tabs.length];
    chooseTab(next.id);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-plan-tab="${next.id}"]`)?.focus();
  };
  const navigation = (mobile = false, placement = "desktop") => <nav className={mobile ? "result-bottom-nav" : "result-side-nav"} aria-label="Seções do plano" role="tablist" onKeyDown={navKey}>{tabs.map(item => <button key={item.id} type="button" role="tab" id={`${navId}-${mobile ? "mobile-" : placement === "drawer" ? "drawer-" : ""}${item.id}`} aria-selected={tab === item.id} aria-controls={`${navId}-panel`} tabIndex={tab === item.id ? 0 : -1} data-plan-tab={item.id} className={tab === item.id ? "is-active" : ""} onClick={() => chooseTab(item.id)}><Asset name={mobile ? item.mobile : tab === item.id ? item.selected : item.icon} /><span>{item.label}</span>{!mobile && tab === item.id && <ArrowUpRight size={14} className="result-nav-arrow" />}</button>)}</nav>;
  const openMethod = () => { setShowMethod(true); methodRef.current?.showModal(); };
  const sidebar = (inDrawer = false) => <><Brand /><div className="result-organization"><span className="result-avatar">{plan.meta.organization.split(/\s+/).slice(0, 2).map(s => s[0]).join("").toUpperCase()}</span><div><strong>{plan.meta.organization}</strong><small>Ciclo estratégico · {plan.meta.horizon}</small></div></div><span className="result-nav-label">Seu planejamento</span>{navigation(false, inDrawer ? "drawer" : "desktop")}<div className="result-sidebar-footer"><div className="result-saved"><strong><CheckCheck size={17} /> Salvo neste navegador</strong><p>Retome de onde parou neste dispositivo.</p></div><button type="button" className="secondary-button result-new" onClick={onNew}>Novo plano <Plus size={17} /></button><button type="button" className="result-method" onClick={openMethod}><Asset name="c061b" /> Como funciona o método</button></div></>;
  const exportControl = <details className="result-export"  onKeyDown={e => { if (e.key === "Escape") e.currentTarget.open = false; }}><summary className="primary-button">Exportar plano <Asset name="716d7" /></summary><div className="result-export-options"><button type="button" onClick={event => download("md", event.currentTarget)}><FileText size={18} /> Markdown</button><button type="button" onClick={event => download("json", event.currentTarget)}><FileJson size={18} /> JSON</button></div></details>;
  return <main className="result-stage">
    <div className="result-app">
      <aside className="result-sidebar">{sidebar()}</aside>
      <div className="result-workspace">
        <header className="result-topbar"><div className="result-mobile-brand"><Brand /></div><span className="result-breadcrumb">Workspace/ <b>Plano estratégico</b></span><div className="result-top-actions"><AiBadge status={status} /><button className="icon-button result-desktop-help" type="button" aria-label="Como funciona o método" onClick={openMethod}><Asset name="3b04f" /></button><span className="result-x5-symbol"><Image src="/brand/grupo-x5-white.svg" alt="" width={27} height={16} unoptimized /></span><button className="icon-button result-mobile-menu" type="button" aria-label="Abrir menu do planejamento" aria-expanded={drawer} onClick={() => { setDrawer(true); drawerRef.current?.showModal(); }}><Menu size={20} /></button></div></header>
        <div className="result-mobile-status"><AiBadge status={status} /><span>Ciclo · {plan.meta.horizon}</span></div>
        <div className="result-content">
          <div className="result-page-heading"><div><span className="eyebrow">{tab === "overview" ? <><span className="result-desktop-only">{headings[tab][0]}</span><span className="result-mobile-only">{plan.meta.organization}</span></> : headings[tab][0]}</span><h1 ref={titleRef} tabIndex={-1}>{headings[tab][1]}</h1><p>{tab === "overview" ? `${plan.meta.organization} · Planejamento ${plan.meta.horizon}` : headings[tab][2]}</p></div><div className="result-heading-action">{tab === "diagnosis" ? <button className="secondary-button" type="button" onClick={onBack}>Voltar à entrevista <ArrowLeft size={18} /></button> : (tab === "overview" || tab === "execution") ? exportControl : null}</div></div>
          <section key={tab} className="result-panel view-enter" id={`${navId}-panel`} role="tabpanel" aria-labelledby={`${navId}-${tab}`} tabIndex={0}>
            {tab === "overview" && <OverviewTab plan={plan} onDiagnosis={() => chooseTab("diagnosis")} />}
            {tab === "diagnosis" && <DiagnosisTab plan={plan} onChoices={() => chooseTab("choices")} />}
            {tab === "choices" && <ChoicesTab plan={plan} />}
            {tab === "execution" && <ExecutionTab plan={plan} onGovernance={() => { chooseTab("governance"); requestAnimationFrame(() => titleRef.current?.focus()); }} />}
            {tab === "governance" && <GovernanceTab plan={plan} />}
          </section>
          <div className="result-mobile-export">{tab === "overview" && exportControl}</div>
          <div className="result-notice"><Asset name="edaeb" /><span>{demo ? "Plano ilustrativo. As informações e recomendações precisam de validação antes de qualquer decisão." : "Valide evidências, metas e recomendações com os responsáveis antes de qualquer decisão."}</span></div>
          <button type="button" className="result-back" onClick={onBack}><ArrowLeft size={16} /> Voltar à entrevista</button>
        </div>
      </div>
    </div>
    {navigation(true)}
    <dialog className="result-drawer" ref={drawerRef} onClose={() => setDrawer(false)} onClick={event => { if (event.target === event.currentTarget) { event.currentTarget.close(); setDrawer(false); } }}><button className="icon-button result-dialog-close" type="button" aria-label="Fechar menu" onClick={() => { drawerRef.current?.close(); setDrawer(false); }}><X size={20} /></button><div>{sidebar(true)}</div></dialog>
    <dialog className="result-method-dialog" ref={methodRef} onClose={() => setShowMethod(false)}><button className="icon-button result-dialog-close" type="button" aria-label="Fechar explicação" onClick={() => methodRef.current?.close()}><X size={20} /></button>{showMethod && <><span className="eyebrow">Método X5</span><h2>Da evidência à execução.</h2><p>O planejamento reúne diagnóstico, escolhas, objetivos com resultados-chave, iniciativas e governança. Hipóteses e lacunas ficam explícitas para orientar as próximas validações.</p><p>A qualidade indica a consistência do plano gerado. Confirme dados, metas, custos e responsáveis com a equipe.</p><button type="button" className="primary-button" onClick={() => methodRef.current?.close()}>Entendi <Check size={18} /></button></>}</dialog>
  </main>;
}

function OverviewTab({ plan, onDiagnosis }: { plan: StrategicPlan; onDiagnosis: () => void }) {
  return <div className="result-stack">
    <div className="result-metrics"><div className="result-metric-desktop"><ChipCard metric="priorities" value={String(plan.strategicChoices.priorities.length).padStart(2, "0")} detail="escolhas que orientam o ciclo" count={plan.strategicChoices.priorities.length} meta={`Ciclo ${plan.meta.horizon}`} /></div><div className="result-metric-desktop"><ChipCard metric="objectives" value={String(plan.objectives.length).padStart(2, "0")} detail="resultados para acompanhar" count={plan.objectives.length} meta={`Ciclo ${plan.meta.horizon}`} /></div><ChipCard metric="quality" value={`${plan.quality.score}/100`} detail={qualityLabel(plan.quality.score)} progress={plan.quality.score} meta={`Ciclo ${plan.meta.horizon}`} /><ChipCard metric="gaps" value={String(plan.evidenceStatus.gaps.length).padStart(2, "0")} detail="validações antes de executar" count={plan.evidenceStatus.gaps.length} meta={`Ciclo ${plan.meta.horizon}`} /></div>
    <div className="result-overview-grid"><div className="result-stack">
      <article className="result-card result-thesis"><div className="result-card-title"><span className="eyebrow">Nossa tese estratégica</span><Asset name="f5e81" /></div><blockquote>{plan.strategicChoices.thesis}</blockquote><p>{plan.executiveSummary}</p><div className="result-tags"><Tag>{directionLabels[plan.strategicChoices.ansoffDirection]}</Tag><Tag>{plan.meta.horizon}</Tag></div></article>
      <article className="result-card result-priorities"><CardTitle>Escolhas deste ciclo</CardTitle><ol>{plan.strategicChoices.priorities.map((item, i) => <li key={`${i}-${item}`}><span className="result-priority-icon"><Asset name={["dcbc3", "81aa5", "4b00a"][i % 3]} /></span><strong>{item}</strong><Tag tone={i === 0 ? "lime" : ""}>{String(i + 1).padStart(2, "0")}</Tag></li>)}</ol></article>
    </div><div className="result-stack result-overview-side">
      <article className="result-card result-lime"><CardTitle>Pronto para a próxima decisão?</CardTitle><h3>{qualityLabel(plan.quality.score)}</h3><p>A qualidade do plano sobe quando as lacunas viram evidências.</p><hr /><Bullets items={plan.quality.improvements} /><button type="button" className="secondary-button" onClick={onDiagnosis}>Revisar diagnóstico <ArrowUpRight size={18} /></button></article>
      <article className="result-card"><CardTitle><span className="result-inline-icon"><Asset name="bef41" /> Fora deste ciclo</span></CardTitle><Bullets items={plan.strategicChoices.nonGoals} /></article>
    </div></div>
    <details className="result-card result-mobile-insights"><summary>Validações e limites deste ciclo <ArrowUpRight size={18} /></summary><h3>Próximas validações</h3><Bullets items={plan.quality.improvements} /><button type="button" className="secondary-button" onClick={onDiagnosis}>Revisar diagnóstico <ArrowUpRight size={18} /></button><h3>Fora deste ciclo</h3><Bullets items={plan.strategicChoices.nonGoals} /><div className="result-tags"><Tag>{plan.strategicChoices.priorities.length} prioridades</Tag><Tag>{plan.objectives.length} objetivos</Tag></div></details>
    <article className="result-card result-first90"><CardTitle badge="Da estratégia à ação">Os primeiros 90 dias</CardTitle><div className="result-period-grid">{plan.first90Days.map((item, index) => <div className="result-period" key={`${item.period}-${index}`}><span className="eyebrow">{item.period}</span><h3>{item.deliverable}</h3><div className="result-period-line" /><small>{item.owner}</small></div>)}</div></article>
    <article className="result-card result-quality-strengths"><CardTitle>Pontos fortes do plano</CardTitle><Bullets items={plan.quality.strengths} /><div className="result-tags"><Tag>{plan.initiatives.length} iniciativas</Tag><Tag>{plan.risks.length} riscos monitorados</Tag></div></article>
  </div>;
}

function DiagnosisTab({ plan, onChoices }: { plan: StrategicPlan; onChoices: () => void }) {
  const quadrants = [["Forças", plan.diagnosis.strengths, "5e6ab"], ["Fraquezas", plan.diagnosis.weaknesses, "07a93"], ["Oportunidades", plan.diagnosis.opportunities, "9f651"], ["Ameaças", plan.diagnosis.threats, "c0de3"]] as const;
  return <div className="result-stack"><div className="result-evidence-grid">{([["Fatos declarados", plan.evidenceStatus.facts, "fact"], ["Hipóteses", plan.evidenceStatus.assumptions, "hypothesis"], ["Lacunas críticas", plan.evidenceStatus.gaps, "gap"]] as const).map(([title, items, tone]) => <article className={`result-card result-evidence ${tone}`} key={title}><CardTitle badge={String(items.length).padStart(2, "0")}>{title}</CardTitle>{items.map((item, i) => <div className="result-evidence-item" key={`${item.label}-${i}`}><h3>{item.label}</h3><p>{item.detail}</p></div>)}{!items.length && <p className="result-empty">Nenhum item informado.</p>}<small>{tone === "fact" ? "Origem: respostas da entrevista" : tone === "hypothesis" ? "Confirmar antes de assumir compromisso" : "Prioridade de validação deste ciclo"}</small></article>)}</div>
    <div className="result-overview-grid"><article className="result-card"><CardTitle badge="SWOT">Uma leitura do cenário</CardTitle><div className="result-swot-grid">{quadrants.map(([title, items, icon], i) => <div className={`result-swot ${i === 2 ? "result-lime" : ""}`} key={title}><div className="result-card-title"><h3>{title}</h3><Asset name={icon} /></div><Bullets items={items} /></div>)}</div></article><div className="result-stack">{plan.diagnosis.strategicIssues.map((item, i) => <article className="result-card result-issue" key={`${item.issue}-${i}`}><div className="result-card-title"><span className="eyebrow">Questão estratégica · {String(i + 1).padStart(2, "0")}</span><Tag tone={item.urgency === "critica" || item.urgency === "alta" ? "gap" : ""}>{item.urgency} urgência</Tag></div><h2>{item.issue}</h2><h3>Causa</h3><p>{item.cause}</p><h3>Consequência</h3><p>{item.consequence}</p><button type="button" className="primary-button" onClick={onChoices}>Ver escolhas <Asset name="3d1ae" /></button></article>)}</div></div>
  </div>;
}

function ChoicesTab({ plan }: { plan: StrategicPlan }) {
  const decisions = { agora: "Agora", proxima: "Próximo ciclo", depois: "Depois", descartar: "Descartar" };
  return <div className="result-stack"><div className="result-avenue-grid">{plan.growthAvenues.map((avenue, i) => <article className="result-card result-avenue" key={`${avenue.title}-${i}`}><div className="result-card-title"><span className="result-large-number">{String(i + 1).padStart(2, "0")}</span><Tag tone={avenue.decision === "agora" ? "lime" : avenue.decision === "descartar" ? "gap" : ""}>{decisions[avenue.decision]}</Tag></div><h2>{avenue.title}</h2><p>{avenue.description}</p><div className="result-score-bars">{([["Valor potencial", avenue.valueScore], ["Complexidade", avenue.complexityScore]] as const).map(([label, score]) => <div key={label}><span>{label}<b>{score}/10</b></span><progress aria-label={`${label}: ${score} de 10`} value={score} max={10} /></div>)}</div><small>{avenue.reason}</small></article>)}</div>
    <article className="result-card result-lime result-choice-thesis"><div className="result-card-title"><span className="eyebrow">Tese escolhida</span><Tag tone="ink">{directionLabels[plan.strategicChoices.ansoffDirection]}</Tag></div><blockquote>{plan.strategicChoices.thesis}</blockquote></article>
    <div className="result-halves"><article className="result-card"><CardTitle><span className="result-title-flex">O que faremos <Asset name="fce73" /></span></CardTitle><Bullets items={plan.strategicChoices.priorities} /></article><article className="result-card result-soft"><CardTitle><span className="result-title-flex">O que não faremos agora <Asset name="bef41" /></span></CardTitle><Bullets items={plan.strategicChoices.nonGoals} /></article></div>
    <article className="result-card result-capabilities"><CardTitle>Capacidades que precisamos fortalecer</CardTitle><div className="result-tags">{plan.strategicChoices.requiredCapabilities.map((item, i) => <Tag key={`${item}-${i}`}>{item}</Tag>)}</div></article>
  </div>;
}

function ExecutionTab({ plan, onGovernance }: { plan: StrategicPlan; onGovernance: () => void }) {
  const [view, setView] = useState<"plan" | "agenda">("plan");
  const id = useId();
  const options = [{ id: "plan", label: "Plano de ação" }, { id: "agenda", label: "Agenda" }] as const;
  const openInitiative = (index: number) => {
    setView("plan");
    requestAnimationFrame(() => {
      const target = document.getElementById(`execution-initiative-${index}`);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "center", behavior: "instant" });
    });
  };
  return <div className="result-stack">
    <div className="execution-switch" role="tablist" aria-label="Visualização da execução" onKeyDown={event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === "Home" ? "plan" : event.key === "End" ? "agenda" : view === "plan" ? "agenda" : "plan";
      setView(next);
      event.currentTarget.querySelector<HTMLButtonElement>(`[data-execution-view="${next}"]`)?.focus();
    }}>
      {options.map(option => <button key={option.id} type="button" role="tab" id={`${id}-${option.id}`} aria-controls={`${id}-content`} aria-selected={view === option.id} tabIndex={view === option.id ? 0 : -1} data-execution-view={option.id} onClick={() => setView(option.id)}>{option.label}</button>)}
    </div>
    <section id={`${id}-content`} role="tabpanel" aria-labelledby={`${id}-${view}`}>
      {view === "agenda" ? <PlannerAgenda plan={plan} onOpenInitiative={openInitiative} onOpenGovernance={onGovernance} /> : <ExecutionPlan plan={plan} />}
    </section>
  </div>;
}

function ExecutionPlan({ plan }: { plan: StrategicPlan }) {
  return <div className="result-stack">{plan.objectives.map(objective => <article className="result-card result-objective" key={objective.id}><div className="result-objective-heading"><div><div className="result-tags"><Tag tone="lime">Objetivo {objective.id}</Tag><small>Dono: {objective.owner}</small></div><h2>{objective.title}</h2><p>{objective.rationale}</p></div><Asset name="c1db8" /></div><div className="result-table-scroll" tabIndex={0} aria-label={`Resultados-chave de ${objective.title}`}><table className="result-kr-table"><thead><tr><th>Resultado-chave</th><th>Baseline</th><th>Meta</th><th>Prazo</th><th>Dono</th></tr></thead><tbody>{objective.keyResults.map(kr => <tr key={kr.id}><td><strong>{kr.id} · {kr.metric}</strong><small>Fonte: {kr.source} · {kr.frequency}</small></td><td>{kr.baseline}</td><td><b>{kr.target}</b> {kr.unit}</td><td>{kr.dueDate}</td><td>{kr.owner}</td></tr>)}</tbody></table></div><p className="result-inline-icon result-kr-caution"><Asset name="baf5c" /> Metas e baselines precisam de confirmação antes de virar compromisso.</p></article>)}
    <div className="result-overview-grid"><article className="result-card"><CardTitle badge="5W2H">Iniciativas prioritárias</CardTitle><div className="result-initiatives">{plan.initiatives.map((item, index) => <article key={item.id} id={`execution-initiative-${index}`} tabIndex={-1}><div className="result-tags"><Tag tone="ink">{item.id}</Tag><Tag>{item.linkedKr}</Tag></div><h3>{item.title}</h3><p>{item.why}</p><p>{item.how}</p><dl className="result-detail-list"><div><dt>Responsável</dt><dd>{item.owner}</dd></div><div><dt>Prazo</dt><dd>{item.startDate} → {item.endDate}</dd></div><div><dt>Custo</dt><dd>{item.cost}</dd></div><div><dt>Dependências</dt><dd>{item.dependencies.length ? item.dependencies.join("; ") : "Nenhuma informada"}</dd></div></dl></article>)}</div></article><div className="result-stack"><article className="result-card result-lime"><span className="eyebrow">O plano precisa caber no caixa</span><h2>Investir com premissas claras.</h2><Bullets items={plan.financialPlan.assumptions} /></article><article className="result-card"><CardTitle>Três cenários</CardTitle><div className="result-scenarios">{plan.financialPlan.scenarios.map(scenario => <div key={scenario.name}><Tag tone={scenario.name === "adverso" ? "gap" : scenario.name === "favoravel" ? "lime" : ""}>{scenario.name === "favoravel" ? "Favorável" : scenario.name === "adverso" ? "Adverso" : "Base"}</Tag><h3>{scenario.description}</h3><p>{scenario.expectedImpact}</p></div>)}</div></article></div></div>
    <article className="result-card result-financial-alert"><Asset name="a93f9" /><div><h3>Alertas financeiros</h3><Bullets items={plan.financialPlan.alerts} /></div></article>
  </div>;
}

function GovernanceTab({ plan }: { plan: StrategicPlan }) {
  return <div className="result-stack"><div className="result-halves">{plan.governance.roles.map((role, i) => <article className={`result-card result-role ${i === 1 ? "result-lime" : ""}`} key={`${role.role}-${i}`}><div className="result-card-title"><Tag tone={i === 0 ? "lime" : ""}>{String(i + 1).padStart(2, "0")}</Tag><Asset name={i === 0 ? "e833d" : "1f022"} /></div><h2>{role.role}</h2><p>{role.responsibility}</p><small>{role.decisionRights}</small></article>)}</div>
    <article className="result-card"><CardTitle badge="Cadência de gestão">Um ritmo para aprender e decidir</CardTitle><div className="result-period-grid">{plan.governance.cadences.map((cadence, i) => <div className={`result-period ${i === 2 ? "result-accent-soft" : ""}`} key={`${cadence.name}-${i}`}><span className="eyebrow">{cadence.frequency}</span><h3>{cadence.name}</h3><p>{cadence.purpose}</p></div>)}</div></article>
    <article className="result-card"><CardTitle badge="Mapa de riscos">O que pode tirar o plano da rota?</CardTitle><div className="result-risks">{plan.risks.map((risk, i) => <article key={`${risk.risk}-${i}`}><div className="result-card-title"><h3>{risk.risk}</h3><div className="result-tags"><Tag tone={risk.probability === "alta" ? "gap" : ""}>Probabilidade {risk.probability}</Tag><Tag tone={risk.impact === "critico" ? "ink" : risk.impact === "alto" ? "gap" : ""}>Impacto {risk.impact}</Tag></div></div><dl className="result-risk-details"><div><dt>Sinal antecipado</dt><dd>{risk.earlySignal}</dd></div><div><dt>Mitigação</dt><dd>{risk.mitigation}</dd></div></dl><small>Dono: {risk.owner}</small></article>)}</div></article>
    <article className="result-card result-communication"><Asset name="e833d" /><div><h3>Comunicação que sustenta o compromisso</h3><p>{plan.governance.communication}</p></div></article>
  </div>;
}
