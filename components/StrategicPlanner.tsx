"use client";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  FileJson,
  FileText,
  Flag,
  Gauge,
  HelpCircle,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  Menu,
  MessageSquareText,
  RefreshCw,
  Rocket,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { planToMarkdown } from "@/lib/markdown";
import {
  PHASES,
  type AnswerEntry,
  type CoachResponse,
  type InterviewResponse,
  type PlannerSession,
  type StrategicPlan,
} from "@/lib/types";

const STORAGE_KEY = "x5-strategic-planner-session-v1";

type ProviderStatus = {
  configured: boolean;
  provider: "gemini" | "demo";
  model: string;
};

const phaseIcon = {
  context: BookOpen,
  current: BarChart3,
  direction: Target,
  execution: Rocket,
  people: Users,
};

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="X5 Planejamento">
      <span className="brand-mark">X5</span>
      {!compact && (
        <span className="brand-copy">
          <strong>Planejamento</strong>
          <small>Estratégia com IA</small>
        </span>
      )}
    </div>
  );
}

function AiBadge({ status }: { status: ProviderStatus | null }) {
  const isLive = status?.configured;
  return (
    <span className={`ai-badge ${isLive ? "is-live" : "is-demo"}`}>
      <span className="ai-dot" />
      {isLive ? `Gemini · ${status.model}` : "Modo demonstração"}
    </span>
  );
}

function Landing({
  status,
  onStart,
  loading,
}: {
  status: ProviderStatus | null;
  onStart: (data: {
    organization: string;
    sector: string;
    horizon: string;
    challenge: string;
  }) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    organization: "",
    sector: "",
    horizon: "Próximos 12 meses",
    challenge: "",
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void onStart(form);
  };

  return (
    <main className="landing-shell">
      <div className="landing-glow landing-glow-one" />
      <div className="landing-glow landing-glow-two" />
      <header className="landing-nav container">
        <Brand />
        <div className="landing-nav-right">
          <AiBadge status={status} />
          <span className="secure-label">
            <LockKeyhole size={14} /> Chave protegida no servidor
          </span>
        </div>
      </header>

      <section className="landing-hero container">
        <div className="hero-copy">
          <span className="eyebrow gold">
            <Sparkles size={15} /> Planejamento estratégico guiado
          </span>
          <h1>
            Estratégia não é um documento.
            <span>É um sistema de escolhas.</span>
          </h1>
          <p className="hero-lead">
            Uma entrevista inteligente transforma contexto, evidências e ambição
            em um plano mensurável — com prioridades, KRs, iniciativas, riscos e
            donos claros.
          </p>

          <div className="hero-proof">
            <div>
              <CheckCircle2 size={18} />
              <span>
                <strong>Diagnóstico</strong>
                sem achismos
              </span>
            </div>
            <div>
              <CheckCircle2 size={18} />
              <span>
                <strong>OKRs</strong>
                realmente mensuráveis
              </span>
            </div>
            <div>
              <CheckCircle2 size={18} />
              <span>
                <strong>Execução</strong>
                conectada ao caixa
              </span>
            </div>
          </div>

          <div className="method-strip" aria-label="Etapas do método">
            {PHASES.slice(1).map((phase, index) => (
              <div key={phase.id}>
                <span>0{index + 1}</span>
                <p>{phase.title}</p>
              </div>
            ))}
          </div>
        </div>

        <form className="start-card" onSubmit={submit}>
          <div className="start-card-head">
            <span className="start-icon">
              <BrainCircuit size={22} />
            </span>
            <div>
              <span className="eyebrow">Nova jornada estratégica</span>
              <h2>Vamos desenhar seu próximo ciclo.</h2>
            </div>
          </div>

          <label>
            Organização
            <input
              required
              autoComplete="organization"
              placeholder="Ex.: Clínica Horizonte"
              value={form.organization}
              onChange={(event) =>
                setForm((current) => ({ ...current, organization: event.target.value }))
              }
            />
          </label>

          <div className="form-row">
            <label>
              Setor
              <input
                required
                placeholder="Ex.: Saúde"
                value={form.sector}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sector: event.target.value }))
                }
              />
            </label>
            <label>
              Horizonte
              <select
                value={form.horizon}
                onChange={(event) =>
                  setForm((current) => ({ ...current, horizon: event.target.value }))
                }
              >
                <option>Próximos 12 meses</option>
                <option>Próximos 24 meses</option>
                <option>Próximos 36 meses</option>
                <option>Ano de 2027</option>
              </select>
            </label>
          </div>

          <label>
            Desafio central
            <textarea
              required
              rows={3}
              placeholder="O que precisa mudar ao final deste planejamento?"
              value={form.challenge}
              onChange={(event) =>
                setForm((current) => ({ ...current, challenge: event.target.value }))
              }
            />
          </label>

          <button className="primary-button start-button" disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle className="spin" size={18} /> Preparando entrevista
              </>
            ) : (
              <>
                Começar planejamento <ArrowRight size={18} />
              </>
            )}
          </button>

          <p className="privacy-note">
            <ShieldCheck size={15} /> Suas respostas ficam salvas neste navegador.
          </p>
        </form>
      </section>

      <footer className="landing-footer container">
        <span>Método X5 · Evidência → Escolha → Execução</span>
        <span>Planejamento que sai da gaveta.</span>
      </footer>
    </main>
  );
}

function ProgressRing({ value }: { value: number }) {
  return (
    <div
      className="progress-ring"
      style={{ "--progress": `${Math.max(2, value) * 3.6}deg` } as React.CSSProperties}
      aria-label={`${value}% de prontidão`}
    >
      <span>{value}</span>
      <small>%</small>
    </div>
  );
}

function Interview({
  session,
  status,
  loading,
  error,
  onAnswer,
  onCoach,
  onGenerate,
  onNew,
}: {
  session: PlannerSession;
  status: ProviderStatus | null;
  loading: boolean;
  error: string | null;
  onAnswer: (answer: string) => Promise<void>;
  onCoach: () => Promise<CoachResponse | null>;
  onGenerate: () => Promise<void>;
  onNew: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const [coach, setCoach] = useState<CoachResponse | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!answer.trim()) return;
    await onAnswer(answer.trim());
    setAnswer("");
    setCoach(null);
  };

  const askCoach = async () => {
    setCoachLoading(true);
    const result = await onCoach();
    setCoach(result);
    setCoachLoading(false);
  };

  const currentPhaseIndex = PHASES.findIndex((phase) => phase.id === session.phase);

  return (
    <main className="workspace-shell">
      <header className="workspace-header">
        <button
          className="mobile-menu-button"
          aria-label="Abrir etapas"
          onClick={() => setMobileMenu(true)}
        >
          <Menu size={20} />
        </button>
        <Brand />
        <div className="workspace-title">
          <span>{session.organization}</span>
          <small>
            <Save size={12} /> Salvo automaticamente
          </small>
        </div>
        <div className="workspace-actions">
          <AiBadge status={status} />
          <button className="ghost-button" onClick={onNew}>
            Novo plano
          </button>
        </div>
      </header>

      <div className="workspace-grid">
        <aside className={`phase-sidebar ${mobileMenu ? "is-open" : ""}`}>
          <div className="mobile-sidebar-head">
            <Brand compact />
            <button onClick={() => setMobileMenu(false)} aria-label="Fechar etapas">
              <X size={20} />
            </button>
          </div>
          <div className="phase-sidebar-copy">
            <span className="eyebrow">Sua jornada</span>
            <h2>Do contexto à execução.</h2>
          </div>
          <nav className="phase-list">
            {PHASES.map((phase, index) => {
              const Icon = phaseIcon[phase.id];
              const isCurrent = phase.id === session.phase;
              const isDone = index < currentPhaseIndex;
              return (
                <div
                  key={phase.id}
                  className={`phase-item ${isCurrent ? "is-current" : ""} ${isDone ? "is-done" : ""}`}
                >
                  <span className="phase-icon">
                    {isDone ? <Check size={16} /> : <Icon size={17} />}
                  </span>
                  <div>
                    <small>{phase.eyebrow}</small>
                    <strong>{phase.title}</strong>
                    <p>{phase.description}</p>
                  </div>
                </div>
              );
            })}
          </nav>
          <div className="sidebar-readiness">
            <ProgressRing value={session.readiness} />
            <div>
              <strong>Prontidão do plano</strong>
              <p>Aumenta conforme evidências e escolhas ficam claras.</p>
            </div>
          </div>
        </aside>

        {mobileMenu && (
          <button
            className="sidebar-backdrop"
            aria-label="Fechar menu"
            onClick={() => setMobileMenu(false)}
          />
        )}

        <section className="interview-main">
          <div className="interview-topline">
            <div>
              <span className="eyebrow">
                Etapa {currentPhaseIndex + 1} de {PHASES.length}
              </span>
              <h1>{PHASES[currentPhaseIndex]?.title}</h1>
            </div>
            <div className="question-count">
              <MessageSquareText size={16} /> {session.answers.length} respostas
            </div>
          </div>

          <div className="phase-progress-track">
            <span
              style={{ width: `${((currentPhaseIndex + 1) / PHASES.length) * 100}%` }}
            />
          </div>

          {error && (
            <div className="error-banner">
              <CircleDot size={17} />
              <span>{error}</span>
            </div>
          )}

          <div className="question-layout">
            <div className="question-column">
              <div className="ai-note">
                <span className="ai-note-icon">
                  <Sparkles size={16} />
                </span>
                <div>
                  <strong>Leitura da entrevista</strong>
                  <p>
                    {session.answers.length
                      ? "A próxima pergunta foi escolhida pela lacuna de maior impacto nesta fase."
                      : "Vamos começar pela informação que organiza todo o restante do plano."}
                  </p>
                </div>
              </div>

              <form className="question-card" onSubmit={submit}>
                {loading || !session.question ? (
                  <div className="question-loading">
                    <span className="thinking-orb">
                      <BrainCircuit size={28} />
                    </span>
                    <h2>A IA está preparando a próxima pergunta…</h2>
                    <p>Cruzando suas respostas com as lacunas do método.</p>
                  </div>
                ) : (
                  <>
                    <div className="question-meta">
                      <span>PERGUNTA DA IA</span>
                      <span className="question-id">{session.question.title}</span>
                    </div>
                    <h2>{session.question.prompt}</h2>
                    <p className="question-helper">{session.question.helper}</p>

                    {session.question.answerType === "select" ? (
                      <div className="option-grid">
                        {session.question.options.map((option) => (
                          <button
                            type="button"
                            key={option}
                            className={answer === option ? "is-selected" : ""}
                            onClick={() => setAnswer(option)}
                          >
                            <span>{answer === option ? <Check size={15} /> : null}</span>
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        rows={7}
                        autoFocus
                        value={answer}
                        onChange={(event) => setAnswer(event.target.value)}
                        placeholder="Responda com fatos, números e exemplos. Se não souber, registre o que precisa ser validado."
                      />
                    )}

                    <div className="question-footer">
                      <button
                        type="button"
                        className="help-button"
                        disabled={coachLoading}
                        onClick={() => void askCoach()}
                      >
                        {coachLoading ? (
                          <LoaderCircle className="spin" size={17} />
                        ) : (
                          <Lightbulb size={17} />
                        )}
                        Me ajude a responder
                      </button>
                      <button
                        className="primary-button"
                        disabled={!answer.trim() || loading}
                      >
                        Salvar e continuar <ArrowRight size={18} />
                      </button>
                    </div>
                  </>
                )}
              </form>

              {coach && (
                <div className="coach-card">
                  <div className="coach-head">
                    <span>
                      <BrainCircuit size={18} /> Assistente de resposta
                    </span>
                    <button onClick={() => setCoach(null)} aria-label="Fechar ajuda">
                      <X size={17} />
                    </button>
                  </div>
                  <p>{coach.guidance}</p>
                  <ol>
                    {coach.suggestedStructure.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                  <div className="coach-caution">
                    <ShieldCheck size={16} /> {coach.caution}
                  </div>
                </div>
              )}

              {session.answers.length > 0 && (
                <div className="history-block">
                  <button onClick={() => setHistoryOpen((value) => !value)}>
                    <span>
                      <Clock3 size={17} /> Respostas anteriores
                    </span>
                    <ChevronDown
                      size={17}
                      className={historyOpen ? "rotate" : ""}
                    />
                  </button>
                  {historyOpen && (
                    <div className="history-list">
                      {[...session.answers].reverse().map((item) => (
                        <article key={`${item.questionId}-${item.answeredAt}`}>
                          <small>{PHASES.find((phase) => phase.id === item.phase)?.title}</small>
                          <strong>{item.question}</strong>
                          <p>{item.answer}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <aside className="context-panel">
              <div className="context-card org-card">
                <span className="eyebrow">Contexto ativo</span>
                <h3>{session.organization}</h3>
                <p>{session.sector}</p>
                <div>
                  <Clock3 size={15} /> {session.horizon}
                </div>
              </div>

              <div className="context-card">
                <span className="context-title">
                  <Gauge size={17} /> Ainda precisamos entender
                </span>
                <ul className="missing-list">
                  {(session.missingTopics.length
                    ? session.missingTopics
                    : ["Riscos e sinais", "Capacidade financeira"]
                  ).map((item) => (
                    <li key={item}>
                      <span /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="context-card why-card">
                <span className="context-title">
                  <HelpCircle size={17} /> Por que isso importa?
                </span>
                <p>
                  {session.question?.whyItMatters ??
                    "A pergunta ajuda a reduzir uma incerteza material do plano."}
                </p>
              </div>

              <button
                className="generate-button"
                disabled={session.answers.length < 5 || loading}
                onClick={() => void onGenerate()}
              >
                {loading ? (
                  <LoaderCircle className="spin" size={18} />
                ) : (
                  <Zap size={18} />
                )}
                Gerar plano agora
              </button>
              {session.answers.length < 5 && (
                <small className="generate-hint">
                  Responda mais {5 - session.answers.length} pergunta(s) para gerar.
                </small>
              )}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

type PlanTab = "overview" | "diagnosis" | "choices" | "execution" | "governance";

function ScoreRing({ score }: { score: number }) {
  return (
    <div
      className="score-ring"
      style={{ "--score": `${score * 3.6}deg` } as React.CSSProperties}
    >
      <div>
        <strong>{score}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}

function Tag({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

function PlanDashboard({
  session,
  status,
  onBack,
  onNew,
}: {
  session: PlannerSession;
  status: ProviderStatus | null;
  onBack: () => void;
  onNew: () => void;
}) {
  const plan = session.plan as StrategicPlan;
  const [tab, setTab] = useState<PlanTab>("overview");

  const safeName = plan.meta.organization
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const download = (content: string, type: string, extension: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `plano-${safeName || "estrategico"}.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="plan-shell">
      <header className="workspace-header plan-header">
        <Brand />
        <div className="workspace-title">
          <span>{plan.meta.organization}</span>
          <small>
            <CheckCircle2 size={12} /> Plano gerado
          </small>
        </div>
        <div className="workspace-actions">
          <AiBadge status={status} />
          <button className="ghost-button" onClick={onNew}>
            Novo plano
          </button>
        </div>
      </header>

      <section className="plan-hero">
        <div className="container plan-hero-inner">
          <div>
            <button className="back-link" onClick={onBack}>
              <ArrowLeft size={16} /> Voltar à entrevista
            </button>
            <span className="eyebrow gold">Plano estratégico · {plan.meta.horizon}</span>
            <h1>{plan.meta.organization}</h1>
            <p>{plan.executiveSummary}</p>
          </div>
          <div className="plan-score-card">
            <ScoreRing score={plan.quality.score} />
            <div>
              <span>Qualidade do plano</span>
              <strong>
                {plan.quality.score >= 80
                  ? "Pronto para decisão"
                  : plan.quality.score >= 60
                    ? "Bom, com ressalvas"
                    : "Precisa de evidências"}
              </strong>
              <small>Revise as lacunas antes de investir.</small>
            </div>
          </div>
        </div>
      </section>

      <div className="plan-toolbar container">
        <nav>
          {([
            ["overview", "Visão geral"],
            ["diagnosis", "Diagnóstico"],
            ["choices", "Escolhas"],
            ["execution", "Execução"],
            ["governance", "Governança"],
          ] as [PlanTab, string][]).map(([id, label]) => (
            <button
              key={id}
              className={tab === id ? "is-active" : ""}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="export-actions">
          <button
            onClick={() =>
              download(JSON.stringify(plan, null, 2), "application/json", "json")
            }
          >
            <FileJson size={16} /> JSON
          </button>
          <button
            onClick={() => download(planToMarkdown(plan), "text/markdown", "md")}
          >
            <FileText size={16} /> Markdown
          </button>
        </div>
      </div>

      <section className="plan-content container">
        {tab === "overview" && <OverviewTab plan={plan} />}
        {tab === "diagnosis" && <DiagnosisTab plan={plan} />}
        {tab === "choices" && <ChoicesTab plan={plan} />}
        {tab === "execution" && <ExecutionTab plan={plan} />}
        {tab === "governance" && <GovernanceTab plan={plan} />}
      </section>
    </main>
  );
}

function SectionHead({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="section-head">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

function OverviewTab({ plan }: { plan: StrategicPlan }) {
  return (
    <div className="tab-stack">
      <div className="summary-grid">
        <article className="metric-card">
          <span className="metric-icon gold-bg">
            <Target size={20} />
          </span>
          <div>
            <small>Prioridades</small>
            <strong>{plan.strategicChoices.priorities.length}</strong>
            <p>focos estratégicos</p>
          </div>
        </article>
        <article className="metric-card">
          <span className="metric-icon green-bg">
            <TrendingUp size={20} />
          </span>
          <div>
            <small>Objetivos</small>
            <strong>{plan.objectives.length}</strong>
            <p>resultados integrados</p>
          </div>
        </article>
        <article className="metric-card">
          <span className="metric-icon blue-bg">
            <Rocket size={20} />
          </span>
          <div>
            <small>Iniciativas</small>
            <strong>{plan.initiatives.length}</strong>
            <p>frentes de execução</p>
          </div>
        </article>
        <article className="metric-card">
          <span className="metric-icon red-bg">
            <ShieldCheck size={20} />
          </span>
          <div>
            <small>Riscos</small>
            <strong>{plan.risks.length}</strong>
            <p>riscos monitorados</p>
          </div>
        </article>
      </div>

      <div className="overview-grid">
        <article className="content-card thesis-card">
          <span className="eyebrow gold">Tese estratégica</span>
          <blockquote>{plan.strategicChoices.thesis}</blockquote>
          <div className="chip-row">
            <Tag tone="gold">
              {plan.strategicChoices.ansoffDirection.replaceAll("_", " ")}
            </Tag>
            <Tag>{plan.meta.horizon}</Tag>
          </div>
        </article>

        <article className="content-card">
          <span className="card-title">
            <Flag size={17} /> Escolhas que dão foco
          </span>
          <div className="choice-columns compact">
            <div>
              <small>FAREMOS</small>
              <ul className="check-list">
                {plan.strategicChoices.priorities.map((item) => (
                  <li key={item}>
                    <Check size={14} /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <small>NÃO FAREMOS AGORA</small>
              <ul className="cross-list">
                {plan.strategicChoices.nonGoals.map((item) => (
                  <li key={item}>
                    <X size={14} /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      </div>

      <article className="content-card">
        <span className="card-title">
          <Rocket size={17} /> Primeiros 90 dias
        </span>
        <div className="timeline-90">
          {plan.first90Days.map((item, index) => (
            <div key={`${item.period}-${index}`}>
              <span>{index + 1}</span>
              <small>{item.period}</small>
              <strong>{item.deliverable}</strong>
              <p>{item.owner}</p>
            </div>
          ))}
        </div>
      </article>

      <div className="quality-grid">
        <article className="content-card">
          <span className="card-title">
            <CheckCircle2 size={17} /> Pontos fortes do plano
          </span>
          <ul className="plain-list positive-list">
            {plan.quality.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="content-card">
          <span className="card-title">
            <RefreshCw size={17} /> Próximas validações
          </span>
          <ul className="plain-list warning-list">
            {plan.quality.improvements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}

function DiagnosisTab({ plan }: { plan: StrategicPlan }) {
  const quadrants = [
    ["Forças", plan.diagnosis.strengths, "strength"],
    ["Fraquezas", plan.diagnosis.weaknesses, "weakness"],
    ["Oportunidades", plan.diagnosis.opportunities, "opportunity"],
    ["Ameaças", plan.diagnosis.threats, "threat"],
  ] as const;
  return (
    <div className="tab-stack">
      <SectionHead
        eyebrow="Onde estamos"
        title="Diagnóstico que sustenta escolhas"
        text="Fatos declarados, hipóteses e lacunas permanecem separados para que o plano não pareça mais certo do que realmente é."
      />
      <div className="evidence-grid">
        {([
          ["Fatos declarados", plan.evidenceStatus.facts, "fact"],
          ["Hipóteses", plan.evidenceStatus.assumptions, "assumption"],
          ["Lacunas críticas", plan.evidenceStatus.gaps, "gap"],
        ] as const).map(([title, items, tone]) => (
          <article key={title} className={`content-card evidence-card ${tone}`}>
            <span className="card-title">{title}</span>
            {items.map((item) => (
              <div key={`${item.label}-${item.detail}`}>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </article>
        ))}
      </div>

      <div className="swot-grid">
        {quadrants.map(([title, items, tone]) => (
          <article key={title} className={`swot-card ${tone}`}>
            <span>{title}</span>
            <ul>
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <article className="content-card">
        <span className="card-title">Questões estratégicas</span>
        <div className="issue-list">
          {plan.diagnosis.strategicIssues.map((item, index) => (
            <div key={`${item.issue}-${index}`}>
              <span>Q{String(index + 1).padStart(2, "0")}</span>
              <div>
                <div className="issue-head">
                  <strong>{item.issue}</strong>
                  <Tag tone={item.urgency === "critica" ? "red" : "gold"}>
                    {item.urgency}
                  </Tag>
                </div>
                <p>
                  <b>Causa:</b> {item.cause}
                </p>
                <p>
                  <b>Consequência:</b> {item.consequence}
                </p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function ChoicesTab({ plan }: { plan: StrategicPlan }) {
  return (
    <div className="tab-stack">
      <SectionHead
        eyebrow="Para onde vamos"
        title="Poucas escolhas, claramente defendidas"
        text="Avenidas são comparadas por geração de valor e complexidade de implantação."
      />
      <div className="avenue-grid">
        {plan.growthAvenues.map((avenue, index) => (
          <article key={`${avenue.title}-${index}`} className="avenue-card">
            <div className="avenue-head">
              <span>0{index + 1}</span>
              <Tag
                tone={
                  avenue.decision === "agora"
                    ? "green"
                    : avenue.decision === "descartar"
                      ? "red"
                      : "gold"
                }
              >
                {avenue.decision}
              </Tag>
            </div>
            <h3>{avenue.title}</h3>
            <p>{avenue.description}</p>
            <div className="score-bars">
              <div>
                <span>
                  Valor <b>{avenue.valueScore}/10</b>
                </span>
                <i>
                  <em style={{ width: `${avenue.valueScore * 10}%` }} />
                </i>
              </div>
              <div>
                <span>
                  Complexidade <b>{avenue.complexityScore}/10</b>
                </span>
                <i className="complexity">
                  <em style={{ width: `${avenue.complexityScore * 10}%` }} />
                </i>
              </div>
            </div>
            <small>{avenue.reason}</small>
          </article>
        ))}
      </div>

      <div className="overview-grid">
        <article className="content-card thesis-card light">
          <span className="eyebrow gold">Tese escolhida</span>
          <blockquote>{plan.strategicChoices.thesis}</blockquote>
          <Tag tone="gold">
            {plan.strategicChoices.ansoffDirection.replaceAll("_", " ")}
          </Tag>
        </article>
        <article className="content-card">
          <span className="card-title">Capacidades necessárias</span>
          <ul className="numbered-list">
            {plan.strategicChoices.requiredCapabilities.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span> {item}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </div>
  );
}

function ExecutionTab({ plan }: { plan: StrategicPlan }) {
  return (
    <div className="tab-stack">
      <SectionHead
        eyebrow="Como vamos"
        title="Resultado medido, trabalho responsável"
        text="Os KRs descrevem mudança; as iniciativas descrevem o trabalho que deverá produzi-la."
      />
      <div className="objective-list">
        {plan.objectives.map((objective) => (
          <article key={objective.id} className="objective-card">
            <div className="objective-head">
              <span>{objective.id}</span>
              <div>
                <h3>{objective.title}</h3>
                <p>{objective.rationale}</p>
              </div>
              <Tag>{objective.owner}</Tag>
            </div>
            <div className="kr-table-wrap">
              <table className="kr-table">
                <thead>
                  <tr>
                    <th>KR</th>
                    <th>Métrica</th>
                    <th>Baseline</th>
                    <th>Meta</th>
                    <th>Prazo</th>
                    <th>Dono</th>
                  </tr>
                </thead>
                <tbody>
                  {objective.keyResults.map((kr) => (
                    <tr key={kr.id}>
                      <td>
                        <strong>{kr.id}</strong>
                      </td>
                      <td>
                        {kr.metric}
                        <small>{kr.source}</small>
                      </td>
                      <td>{kr.baseline}</td>
                      <td>
                        <b>{kr.target}</b> {kr.unit}
                      </td>
                      <td>{kr.dueDate}</td>
                      <td>{kr.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>

      <article className="content-card">
        <span className="card-title">Iniciativas 5W2H</span>
        <div className="initiative-list">
          {plan.initiatives.map((item) => (
            <article key={item.id}>
              <div className="initiative-id">{item.id}</div>
              <div className="initiative-main">
                <div>
                  <h3>{item.title}</h3>
                  <Tag tone="gold">{item.linkedKr}</Tag>
                </div>
                <p>{item.why}</p>
                <small>{item.how}</small>
              </div>
              <dl>
                <div>
                  <dt>Dono</dt>
                  <dd>{item.owner}</dd>
                </div>
                <div>
                  <dt>Prazo</dt>
                  <dd>
                    {item.startDate} → {item.endDate}
                  </dd>
                </div>
                <div>
                  <dt>Custo</dt>
                  <dd>{item.cost}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </article>

      <div className="scenario-grid">
        {plan.financialPlan.scenarios.map((scenario) => (
          <article key={scenario.name} className={`scenario-card ${scenario.name}`}>
            <span>{scenario.name}</span>
            <h3>{scenario.description}</h3>
            <p>{scenario.expectedImpact}</p>
          </article>
        ))}
      </div>

      <article className="content-card financial-alerts">
        <span className="card-title">Alertas financeiros</span>
        <div>
          {plan.financialPlan.alerts.map((item) => (
            <p key={item}>
              <CircleDot size={14} /> {item}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}

function GovernanceTab({ plan }: { plan: StrategicPlan }) {
  return (
    <div className="tab-stack">
      <SectionHead
        eyebrow="Com quem vamos"
        title="A estratégia ganha dono e ritmo"
        text="Papéis claros, sinais antecipados e uma cadência de decisão mantêm o plano vivo."
      />
      <div className="role-grid">
        {plan.governance.roles.map((role, index) => (
          <article key={`${role.role}-${index}`} className="content-card role-card">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{role.role}</h3>
            <p>{role.responsibility}</p>
            <small>{role.decisionRights}</small>
          </article>
        ))}
      </div>

      <article className="content-card">
        <span className="card-title">Cadência de gestão</span>
        <div className="cadence-list">
          {plan.governance.cadences.map((cadence, index) => (
            <div key={`${cadence.name}-${index}`}>
              <span className="cadence-dot" />
              <div>
                <small>{cadence.frequency}</small>
                <strong>{cadence.name}</strong>
                <p>{cadence.purpose}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="communication-note">
          <MessageSquareText size={18} />
          <p>{plan.governance.communication}</p>
        </div>
      </article>

      <article className="content-card">
        <span className="card-title">Mapa de riscos</span>
        <div className="risk-list">
          {plan.risks.map((risk, index) => (
            <article key={`${risk.risk}-${index}`}>
              <div className="risk-top">
                <strong>{risk.risk}</strong>
                <span>
                  <Tag tone={risk.probability === "alta" ? "red" : "gold"}>
                    P: {risk.probability}
                  </Tag>
                  <Tag tone={risk.impact === "critico" ? "red" : "neutral"}>
                    I: {risk.impact}
                  </Tag>
                </span>
              </div>
              <dl>
                <div>
                  <dt>Sinal antecipado</dt>
                  <dd>{risk.earlySignal}</dd>
                </div>
                <div>
                  <dt>Mitigação</dt>
                  <dd>{risk.mitigation}</dd>
                </div>
                <div>
                  <dt>Dono</dt>
                  <dd>{risk.owner}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </article>
    </div>
  );
}

export function StrategicPlanner() {
  const [session, setSession] = useState<PlannerSession | null>(null);
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setSession(JSON.parse(saved) as PlannerSession);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
      setHydrated(true);
    }, 0);
    fetch("/api/status")
      .then((response) => response.json())
      .then((data: ProviderStatus) => setStatus(data))
      .catch(() =>
        setStatus({ configured: false, provider: "demo", model: "demonstração local" }),
      );
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  const persist = useCallback((next: PlannerSession) => {
    setSession(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const fetchNext = useCallback(
    async (base: PlannerSession) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "next",
            context: {
              organization: base.organization,
              sector: base.sector,
              horizon: base.horizon,
              challenge: base.challenge,
            },
            phase: base.phase,
            answers: base.answers,
            askedQuestionIds: base.askedQuestionIds,
            currentQuestion: base.question
              ? {
                  id: base.question.id,
                  prompt: base.question.prompt,
                  helper: base.question.helper,
                }
              : null,
          }),
        });
        const data = (await response.json()) as InterviewResponse & { error?: string };
        if (!response.ok) throw new Error(data.error || "Falha ao gerar pergunta.");

        persist({
          ...base,
          phase: data.question.phase,
          question: data.question,
          askedQuestionIds: Array.from(
            new Set([...base.askedQuestionIds, data.question.id]),
          ),
          readiness: data.readiness,
          missingTopics: data.missingTopics,
          provider: data.provider,
          updatedAt: new Date().toISOString(),
        });
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Não foi possível continuar.");
        persist(base);
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const start = async (data: {
    organization: string;
    sector: string;
    horizon: string;
    challenge: string;
  }) => {
    const now = new Date().toISOString();
    const initial: PlannerSession = {
      id: crypto.randomUUID(),
      ...data,
      phase: "context",
      question: null,
      answers: [],
      askedQuestionIds: [],
      readiness: 0,
      missingTopics: [
        "escopo e restrições",
        "baselines e evidências",
        "escolhas e renúncias",
      ],
      provider: null,
      createdAt: now,
      updatedAt: now,
      plan: null,
    };
    persist(initial);
    await fetchNext(initial);
  };

  const answer = async (value: string) => {
    if (!session?.question) return;
    const entry: AnswerEntry = {
      questionId: session.question.id,
      phase: session.question.phase,
      question: session.question.prompt,
      answer: value,
      answeredAt: new Date().toISOString(),
    };
    const next = {
      ...session,
      answers: [...session.answers, entry],
      updatedAt: new Date().toISOString(),
    };
    persist(next);
    await fetchNext(next);
  };

  const coach = async () => {
    if (!session) return null;
    setError(null);
    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "coach",
          context: {
            organization: session.organization,
            sector: session.sector,
            horizon: session.horizon,
            challenge: session.challenge,
          },
          phase: session.phase,
          answers: session.answers,
          askedQuestionIds: session.askedQuestionIds,
          currentQuestion: session.question
            ? {
                id: session.question.id,
                prompt: session.question.prompt,
                helper: session.question.helper,
              }
            : null,
        }),
      });
      const data = (await response.json()) as CoachResponse & { error?: string };
      if (!response.ok) throw new Error(data.error || "Falha ao gerar orientação.");
      return data;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível ajudar agora.");
      return null;
    }
  };

  const generatePlan = async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            organization: session.organization,
            sector: session.sector,
            horizon: session.horizon,
            challenge: session.challenge,
          },
          answers: session.answers,
        }),
      });
      const data = (await response.json()) as {
        plan?: StrategicPlan;
        provider?: "gemini" | "demo";
        error?: string;
      };
      if (!response.ok || !data.plan) {
        throw new Error(data.error || "Falha ao gerar o plano.");
      }
      persist({
        ...session,
        plan: data.plan,
        provider: data.provider ?? session.provider,
        updatedAt: new Date().toISOString(),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível gerar o plano.");
    } finally {
      setLoading(false);
    }
  };

  const newPlan = () => {
    if (session && !window.confirm("Iniciar um novo plano e apagar a sessão atual?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setError(null);
  };

  const backToInterview = () => {
    if (!session) return;
    persist({ ...session, plan: null, updatedAt: new Date().toISOString() });
  };

  if (!hydrated) {
    return (
      <div className="app-loading">
        <span className="brand-mark">X5</span>
        <LoaderCircle className="spin" size={22} />
      </div>
    );
  }
  if (!session) {
    return <Landing status={status} onStart={start} loading={loading} />;
  }
  if (session.plan) {
    return (
      <PlanDashboard
        session={session}
        status={status}
        onBack={backToInterview}
        onNew={newPlan}
      />
    );
  }
  return (
    <Interview
      key={session.question?.id ?? "loading"}
      session={session}
      status={status}
      loading={loading}
      error={error}
      onAnswer={answer}
      onCoach={coach}
      onGenerate={generatePlan}
      onNew={newPlan}
    />
  );
}
