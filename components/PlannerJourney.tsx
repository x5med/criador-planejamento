"use client";

import Image from "next/image";
import { ArrowRight, Check, CheckCheck, ChevronDown, Clock3, HelpCircle, LoaderCircle, Menu, Plus, Sparkles, X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { AiBadge, Brand, type ProviderStatus } from "@/components/PlannerPrimitives";
import { AnimatedGroupLogo } from "./AnimatedGroupLogo";
import { NewPlanDialog } from "@/components/NewPlanDialog";
import { ProductLanding } from "@/components/ProductLanding";
import { PHASES, type CoachResponse, type PlannerSession } from "@/lib/types";

type StartData = { organization: string; sector: string; horizon: string; challenge: string };

export function Landing({ status, onStart, loading }: { status: ProviderStatus | null; onStart: (data: StartData) => Promise<void>; loading: boolean }) {
  const [showForm, setShowForm] = useState(false);
  return <>
    <ProductLanding onCreate={() => setShowForm(true)} />
    {showForm && <NewPlanDialog status={status} onStart={onStart} loading={loading} onClose={() => setShowForm(false)} />}
  </>;
}

export function Interview({ session, status, loading, error, onAnswer, onCoach, onGenerate, onNew }: { session: PlannerSession; status: ProviderStatus | null; loading: boolean; error: string | null; onAnswer: (answer: string) => Promise<void>; onCoach: () => Promise<CoachResponse | null>; onGenerate: () => Promise<void>; onNew: () => void }) {
  const [answer, setAnswer] = useState("");
  const [coach, setCoach] = useState<CoachResponse | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [methodOpen, setMethodOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const currentPhaseIndex = Math.max(0, PHASES.findIndex(phase => phase.id === session.phase));
  const question = session.question;
  const initials = session.organization.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  const canGenerate = session.answers.length >= 5 && !loading;

  useEffect(() => {
    if (!mobileMenu) return;
    const sidebar = sidebarRef.current;
    const header = headerRef.current;
    const content = contentRef.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : menuRef.current;
    const previousOverflow = document.body.style.overflow;
    if (header) header.inert = true;
    if (content) content.inert = true;
    document.body.style.overflow = "hidden";
    sidebar?.querySelector<HTMLButtonElement>("button")?.focus();
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setMobileMenu(false); }
      if (event.key !== "Tab" || !sidebar) return;
      const focusable = Array.from(sidebar.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, [tabindex="0"]')).filter(element => element.getClientRects().length > 0);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const viewportChange = () => { if (window.innerWidth > 800) setMobileMenu(false); };
    document.addEventListener("keydown", keyDown);
    window.addEventListener("resize", viewportChange);
    return () => {
      document.removeEventListener("keydown", keyDown);
      window.removeEventListener("resize", viewportChange);
      if (header) header.inert = false;
      if (content) content.inert = false;
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [mobileMenu]);

  const submit = async (event: FormEvent) => { event.preventDefault(); if (!answer.trim() || loading) return; await onAnswer(answer.trim()); setAnswer(""); setCoach(null); };
  const askCoach = async () => { setCoachLoading(true); try { setCoach(await onCoach()); } finally { setCoachLoading(false); } };
  const generateButton = <button type="button" className="primary-button generate-button" disabled={!canGenerate} onClick={() => void onGenerate()}>{loading ? <LoaderCircle className="spin" size={18} /> : null}Gerar plano agora <Sparkles size={18} /></button>;

  return (
    <main className="interview-workspace view-enter">
      <div className="interview-glass">
        <aside ref={sidebarRef} id="interview-phases" className={`phase-sidebar ${mobileMenu ? "is-open" : ""}`} role={mobileMenu ? "dialog" : undefined} aria-modal={mobileMenu || undefined} aria-label="Etapas do planejamento">
          <div className="sidebar-brand"><Brand /><button type="button" className="journey-icon-button drawer-close" onClick={() => setMobileMenu(false)} aria-label="Fechar etapas"><X size={20} /></button></div>
          <div className="sidebar-org"><span className="organization-avatar">{initials}</span><div><strong>{session.organization}</strong><small>{session.horizon}</small><small>{session.sector}</small></div></div>
          <span className="sidebar-caption">Sua jornada</span>
          <nav className="phase-list" aria-label="Progresso da entrevista">{PHASES.map((phase, index) => <div key={phase.id} aria-current={phase.id === session.phase ? "step" : undefined} className={`phase-item ${phase.id === session.phase ? "is-current" : ""} ${index < currentPhaseIndex ? "is-done" : ""}`}><span className="phase-number">{index < currentPhaseIndex ? <Check size={13} /> : String(index + 1).padStart(2, "0")}</span><span>{phase.title}</span></div>)}</nav>
          <div className="drawer-context"><strong>Prontidão do plano · {session.readiness}%</strong><p>A prontidão considera a cobertura das respostas.</p><details><summary>Ainda precisamos entender</summary><ul>{(session.missingTopics.length ? session.missingTopics : ["Riscos e sinais", "Capacidade financeira"]).map(item => <li key={item}>{item}</li>)}</ul></details></div>
          <div className="sidebar-bottom"><div className="sidebar-saving"><strong><CheckCheck size={17} /> Salvo neste navegador</strong><p>Você pode retomar de onde parou neste dispositivo.</p></div><button type="button" className="ghost-button sidebar-new" onClick={onNew}>Novo plano <Plus size={18} /></button><button type="button" className="method-help" onClick={() => setMethodOpen(value => !value)} aria-expanded={methodOpen}><HelpCircle size={16} /> Como funciona o método</button>{methodOpen && <p className="method-explanation view-enter">A entrevista percorre contexto, diagnóstico, escolhas, execução e governança. Use fatos disponíveis; registre as incertezas que precisam de validação.</p>}</div>
        </aside>
        {mobileMenu && <button type="button" className="sidebar-backdrop" tabIndex={-1} aria-label="Fechar etapas" onClick={() => setMobileMenu(false)} />}
        <div className="interview-content">
          <header ref={headerRef} className="interview-header"><div className="interview-mobile-brand"><Brand /></div><span className="interview-breadcrumb">Workspace/ <strong>Entrevista guiada</strong></span><div className="interview-header-actions"><AiBadge status={status} /><button type="button" className="journey-icon-button desktop-method" aria-label="Como funciona o método" aria-expanded={methodOpen} onClick={() => setMethodOpen(value => !value)}><HelpCircle size={18} /></button><Image className="workspace-symbol" src="/brand/grupo-x5-white.svg" alt="Grupo X5" width={38} height={38} unoptimized /><button ref={menuRef} type="button" className="journey-icon-button interview-menu" aria-label="Abrir etapas" aria-expanded={mobileMenu} aria-controls="interview-phases" onClick={() => setMobileMenu(true)}><Menu size={20} /></button></div></header>
          <section ref={contentRef} className="interview-main">
            <div className="interview-topline"><div><span className="eyebrow phase-label">Etapa {String(currentPhaseIndex + 1).padStart(2, "0")} de {String(PHASES.length).padStart(2, "0")}</span><h1>{PHASES[currentPhaseIndex].title}</h1><p className="interview-intro">Uma boa decisão começa com uma visão honesta do presente.</p><p className="mobile-answer-count">{session.answers.length} respostas salvas neste navegador</p></div><span className="question-count">{session.answers.length} respostas salvas</span><span className="mobile-readiness">Prontidão · {session.readiness}%</span></div>
            <div className="phase-progress-track" role="progressbar" aria-label="Etapas da entrevista" aria-valuemin={0} aria-valuemax={PHASES.length} aria-valuenow={currentPhaseIndex + 1}><span style={{ width: `${((currentPhaseIndex + 1) / PHASES.length) * 100}%` }} /></div>
            {error && <div className="error-banner" role="alert"><HelpCircle size={17} /><span>{error}</span></div>}
            <div className="question-layout"><div className="question-column">
              <form className="question-card" onSubmit={submit} aria-busy={loading}>
                {loading || !question ? <div className="question-loading" role="status"><div className="x5-loading-mark">{loading ? <AnimatedGroupLogo /> : <Image src="/brand/grupo-x5.svg" alt="Grupo X5" width={200} height={114} unoptimized />}</div><h2>{loading ? "A IA está preparando seu planejamento…" : "Não foi possível carregar a pergunta."}</h2><p>{loading ? "Cruzando suas respostas com as lacunas do método." : "Confira a mensagem abaixo antes de continuar."}</p></div> : <><div className="question-meta"><span className="eyebrow">{question.title}</span><span className="question-number">Pergunta {String(session.answers.length + 1).padStart(2, "0")}</span></div><h2 id="current-question">{question.prompt}</h2><p className="question-helper" id="question-help">{question.helper}</p>{question.answerType === "select" ? <div className="option-grid" role="group" aria-labelledby="current-question">{question.options.map(option => <button type="button" key={option} className={answer === option ? "is-selected" : ""} aria-pressed={answer === option} onClick={() => setAnswer(option)}><span>{answer === option && <Check size={15} />}</span>{option}</button>)}</div> : <textarea rows={6} autoFocus aria-labelledby="current-question" aria-describedby="question-help answer-guidance" value={answer} onChange={event => setAnswer(event.target.value)} placeholder="Responda com fatos, números e exemplos. Se não souber, registre o que precisa ser validado." />}<div className="answer-meta"><small id="answer-guidance">Se não souber, registre o que precisa ser validado.</small><small>{answer.length} caracteres</small></div><div className="question-footer"><button type="button" className="help-button" disabled={coachLoading} onClick={() => void askCoach()}>Me ajude a responder {coachLoading ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}</button><button type="submit" className="primary-button" disabled={!answer.trim() || loading}>Salvar e continuar <ArrowRight size={18} /></button></div></>}
              </form>
              {coach && <div className="coach-card view-enter" role="region" aria-label="Assistente de resposta"><div className="coach-head"><strong><Sparkles size={18} /> Vamos organizar sua resposta</strong><button type="button" className="journey-icon-button" onClick={() => setCoach(null)} aria-label="Fechar ajuda"><X size={17} /></button></div><p>{coach.guidance}</p><ol>{coach.suggestedStructure.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol><p className="coach-caution">{coach.caution}</p></div>}
              <details className="mobile-why"><summary>Por que isso importa? <ChevronDown size={17} /></summary><p>{question?.whyItMatters ?? "A pergunta ajuda a reduzir uma incerteza material do plano."}</p></details>
              {session.answers.length > 0 && <div className="history-block"><button type="button" onClick={() => setHistoryOpen(value => !value)} aria-expanded={historyOpen} aria-controls="answer-history"><span><Clock3 size={17} /> Respostas anteriores <b>{session.answers.length}</b></span><ChevronDown size={17} className={historyOpen ? "rotate" : ""} /></button>{historyOpen && <div className="history-list view-enter" id="answer-history">{[...session.answers].reverse().map(item => <article key={`${item.questionId}-${item.answeredAt}`}><small>{PHASES.find(phase => phase.id === item.phase)?.title}</small><strong>{item.question}</strong><p>{item.answer}</p></article>)}</div>}</div>}
            </div><aside className="context-panel"><div className="context-card readiness-card"><h3>Prontidão do plano</h3><div><span className="readiness-value">{session.readiness}%</span><div><strong>{session.readiness < 60 ? "Estamos construindo a base." : "As escolhas estão mais claras."}</strong><p>A prontidão considera a cobertura das respostas.</p></div></div></div><div className="context-card missing-card"><h3>Ainda precisamos entender</h3><ul>{(session.missingTopics.length ? session.missingTopics : ["Riscos e sinais", "Capacidade financeira"]).map(item => <li key={item}>{item}</li>)}</ul></div><div className="context-card why-card"><span className="eyebrow">Por que isso importa?</span><p>{question?.whyItMatters ?? "A pergunta ajuda a reduzir uma incerteza material do plano."}</p></div><div className="context-card generate-card"><h3>Já quer ver uma primeira versão?</h3><p>Você pode gerar agora e revisar as lacunas depois. O plano ainda será preliminar.</p>{generateButton}{session.answers.length < 5 && <small className="generate-hint">Responda mais {5 - session.answers.length} pergunta(s) para gerar.</small>}</div></aside></div>
            <div className="mobile-generate"><p>{session.answers.length < 5 ? `Responda mais ${5 - session.answers.length} pergunta(s) para gerar.` : "A primeira versão do plano já está disponível para geração, com lacunas identificadas."}</p>{generateButton}</div>
            <div className="interview-notice"><Sparkles size={17} /><span>{status?.configured ? "Revise as evidências e as lacunas antes de tomar decisões com o plano." : "Plano ilustrativo. As informações e recomendações precisam de validação antes de qualquer decisão."}</span></div>
          </section>
        </div>
      </div>
    </main>
  );
}
