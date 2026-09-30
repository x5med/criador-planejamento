"use client";

import { useId, useMemo, useRef, useState } from "react";
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Flag, ListFilter, Users, X } from "lucide-react";
import { addDays, buildAgenda, daysBetween, formatDay, startOfWeek, type AgendaEvent } from "@/lib/agenda";
import type { StrategicPlan } from "@/lib/types";

type View = "week" | "month" | "quarter";
const views: { id: View; label: string }[] = [{ id: "week", label: "Semana" }, { id: "month", label: "Mês" }, { id: "quarter", label: "90 dias" }];
const kinds = { initiative: "Iniciativa", milestone: "Marco", cadence: "Reunião" };
const weekdays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function monthStart(day: string) { return `${day.slice(0, 7)}-01`; }
function shiftMonth(day: string, amount: number) {
  const [year, month] = day.split("-").map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1 + amount, 1);
  return date.toISOString().slice(0, 10);
}
function overlaps(event: AgendaEvent, from: string, to = from) {
  return !!event.start && !!event.end && event.start <= to && event.end >= from;
}
function periodLabel(event: AgendaEvent) {
  if (!event.start || !event.end) return "A agendar";
  return event.start === event.end ? formatDay(event.start) : `${formatDay(event.start)} – ${formatDay(event.end)}`;
}
function deadlineLabel(event: AgendaEvent, today: string) {
  if (!event.start || !event.end) return "Sem data definida";
  return event.end < today ? "Prazo passado" : event.start > today ? "Próximo período" : "Dentro do período";
}

export function PlannerAgenda({ plan, onOpenInitiative, onOpenGovernance }: {
  plan: StrategicPlan; onOpenInitiative: (index: number) => void; onOpenGovernance: () => void;
}) {
  const { events, anchor } = useMemo(() => buildAgenda(plan), [plan]);
  const today = localToday();
  const initial = anchor ?? events.find(event => event.start)?.start ?? today;
  const [cursor, setCursor] = useState(initial);
  const [selectedDay, setSelectedDay] = useState(initial);
  const [view, setView] = useState<View>("month");
  const [kind, setKind] = useState("all");
  const [owner, setOwner] = useState("all");
  const [selected, setSelected] = useState<AgendaEvent | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const dayDetail = useRef<HTMLElement>(null);
  const id = useId();
  const owners = [...new Set(events.map(event => event.owner))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const filtered = events.filter(event => (kind === "all" || event.kind === kind) && (owner === "all" || event.owner === owner));
  const scheduled = filtered.filter(event => event.start && event.end);
  const unscheduled = filtered.filter(event => !event.start || !event.end);
  const month = monthStart(cursor);
  const monthDays = Array.from({ length: 42 }, (_, i) => addDays(startOfWeek(month), i));
  const week = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i));
  const from = view === "month" ? month : view === "week" ? week[0] : cursor;
  const to = view === "month" ? addDays(shiftMonth(cursor, 1), -1) : addDays(from, view === "week" ? 6 : 89);
  const inView = scheduled.filter(event => overlaps(event, from, to));
  const onDay = scheduled.filter(event => overlaps(event, selectedDay));
  const past = scheduled.filter(event => event.end! < today);
  const focusDay = (day: string) => { setSelectedDay(day); setCursor(day); };
  const jump = (day: string) => { setCursor(day); setSelectedDay(day); };
  const navigate = (direction: number) => jump(view === "month" ? shiftMonth(cursor, direction) : addDays(cursor, direction * (view === "week" ? 7 : 90)));
  const openEvent = (event: AgendaEvent) => { setSelected(event); dialog.current?.showModal(); };
  const showDayItems = (day: string) => {
    focusDay(day);
    requestAnimationFrame(() => { dayDetail.current?.focus({ preventScroll: true }); dayDetail.current?.scrollIntoView({ block: "nearest" }); });
  };
  const visibleTitle = view === "month" ? formatDay(month, { month: "long", year: "numeric" }) : `${formatDay(from)} – ${formatDay(to)}`;
  const initiative = selected?.kind === "initiative" ? plan.initiatives[selected.sourceIndex] : undefined;
  const related = initiative ? plan.objectives.filter(objective => objective.keyResults.some(kr => initiative.linkedKr.split(/[,;\s]+/).includes(kr.id))) : [];
  const eventButton = (event: AgendaEvent, compact = false, date?: string) => <button type="button"
    className={`agenda-event agenda-event--${event.kind}${compact ? " agenda-event--compact" : ""}`}
    key={`${event.id}-${date ?? "list"}`} onClick={() => openEvent(event)}
    aria-label={`${event.title}${date ? `, ${formatDay(date)}` : ""}. Abrir detalhes`}>
    <span className="agenda-event__title">{event.title}</span>
    {!compact && <><span className="agenda-event__owner"><Users size={12} aria-hidden="true" />{event.owner}</span><span className="agenda-event__date">{periodLabel(event)}</span></>}
  </button>;

  return <div className="agenda" aria-label="Agenda de execução">
    <header className="agenda-heading"><div><span className="agenda-kicker"><CalendarDays size={16} />Da estratégia ao calendário</span><h2>Agenda de execução</h2><p>Entregas, responsáveis e próximos encontros em um só lugar.</p></div>
      <div className="agenda-view-switch" role="group" aria-label="Visualização da agenda">{views.map(item => <button key={item.id} type="button" aria-pressed={view === item.id} onClick={() => setView(item.id)}>{item.label}</button>)}</div>
    </header>
    <div className="agenda-summary"><span><strong>{inView.length}</strong> no período</span><span><strong>{unscheduled.length}</strong> a agendar</span><span><strong>{past.length}</strong> prazos passados <small>Andamento a confirmar</small></span></div>
    <div className="agenda-filters"><ListFilter size={17} aria-hidden="true" /><label htmlFor={`${id}-type`}>Tipo<select id={`${id}-type`} value={kind} onChange={event => setKind(event.target.value)}><option value="all">Todos os tipos</option>{Object.entries(kinds).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label htmlFor={`${id}-owner`}>Responsável<select id={`${id}-owner`} value={owner} onChange={event => setOwner(event.target.value)}><option value="all">Todos os responsáveis</option>{owners.map(name => <option key={name}>{name}</option>)}</select></label>
      {(kind !== "all" || owner !== "all") && <button type="button" className="agenda-text-button" onClick={() => { setKind("all"); setOwner("all"); }}>Limpar filtros</button>}
    </div>
    <div className="agenda-layout">
      <aside className="agenda-sidebar" aria-label="Resumo da agenda">
        <section className="agenda-mini"><h3>{formatDay(month, { month: "long", year: "numeric" })}</h3><div className="agenda-mini__week" aria-hidden="true">{weekdays.map(day => <span key={day}>{day[0]}</span>)}</div><div className="agenda-mini__grid">{monthDays.map(day => <button key={day} type="button" className={`${day.slice(0, 7) !== month.slice(0, 7) ? "is-muted " : ""}${day === today ? "is-today" : ""}`} aria-label={`Selecionar ${formatDay(day, { dateStyle: "full" })}`} aria-pressed={day === selectedDay} onClick={() => focusDay(day)}>{Number(day.slice(-2))}{scheduled.some(event => overlaps(event, day)) && <span className="agenda-date-dot" />}</button>)}</div></section>
        <section className="agenda-day-detail" ref={dayDetail} tabIndex={-1} id={`${id}-day-items`} aria-label="Itens do dia selecionado"><header><h3>{formatDay(selectedDay, { day: "numeric", month: "long" })}</h3><span>{onDay.length}</span></header>{onDay.length ? onDay.map(event => eventButton(event)) : <p className="agenda-empty">Nenhum item neste dia com os filtros atuais.</p>}</section>
        <section className="agenda-unscheduled" aria-label="Itens a agendar"><header><h3>A agendar</h3><span>{unscheduled.length}</span></header><p>Datas e horários ainda precisam ser definidos.</p>{unscheduled.map(event => <button key={event.id} type="button" className="agenda-undated-item" onClick={() => openEvent(event)}><span className={`agenda-dot agenda-dot--${event.kind}`} /><span><strong>{event.title}</strong><small>{event.originalPeriod || "Prazo não informado"}</small></span><ArrowUpRight size={14} /></button>)}{!unscheduled.length && <p className="agenda-empty">Nenhum item sem data com estes filtros.</p>}</section>
      </aside>
      <section className="agenda-calendar" aria-label="Calendário de execução">
        <div className="agenda-calendar__toolbar"><div><h3 aria-live="polite">{visibleTitle}</h3><p>{view === "quarter" ? "Três janelas de 30 dias" : "Prazos e períodos do plano"}</p></div><div className="agenda-calendar__nav"><button type="button" onClick={() => navigate(-1)} aria-label="Período anterior"><ChevronLeft size={18} /></button><button type="button" onClick={() => jump(today)}>Hoje</button><button type="button" onClick={() => navigate(1)} aria-label="Próximo período"><ChevronRight size={18} /></button></div></div>
        <div className="agenda-legend"><span><i className="agenda-dot agenda-dot--initiative" />Iniciativas</span><span><i className="agenda-dot agenda-dot--milestone" />Marcos</span>{anchor && <button type="button" className="agenda-text-button" onClick={() => jump(anchor)}>Início do plano</button>}</div>
        {view === "month" && <div className="agenda-month" aria-label="Visão mensal"><div className="agenda-month__week" aria-hidden="true">{weekdays.map(day => <span key={day}>{day}</span>)}</div><div className="agenda-month__grid">{monthDays.map(day => {
          const daily = scheduled.filter(event => overlaps(event, day));
          return <div key={day} className={`agenda-cell${day.slice(0, 7) !== month.slice(0, 7) ? " is-outside" : ""}${day === selectedDay ? " is-selected" : ""}`}>
            <button type="button" className={`agenda-cell__day${day === today ? " is-today" : ""}`} aria-label={formatDay(day, { dateStyle: "full" })} aria-pressed={day === selectedDay} onClick={() => focusDay(day)}>{Number(day.slice(-2))}</button>
            {daily.slice(0, 2).map(event => eventButton(event, true, day))}
            {daily.length > 2 && <button type="button" className="agenda-more" onClick={() => showDayItems(day)} aria-controls={`${id}-day-items`} aria-label={`Ver ${daily.length} itens de ${formatDay(day)}`}>+{daily.length - 2} itens</button>}
          </div>;
        })}</div></div>}
        {view === "week" && <div className="agenda-week" aria-label="Visão semanal">{week.map(day => <section key={day} className={`agenda-week__day${day === today ? " is-today" : ""}`}><button type="button" className="agenda-week__date" aria-pressed={day === selectedDay} onClick={() => focusDay(day)}><span>{formatDay(day, { weekday: "short" })}</span><strong>{Number(day.slice(-2))}</strong></button>{scheduled.filter(event => overlaps(event, day)).map(event => eventButton(event, false, day))}{!scheduled.some(event => overlaps(event, day)) && <p className="agenda-week__empty">Sem itens</p>}</section>)}</div>}
        {view === "quarter" && <div className="agenda-quarter" aria-label="Visão de 90 dias">{[0, 30, 60].map(offset => {
          const start = addDays(cursor, offset), end = addDays(start, 29), items = scheduled.filter(event => overlaps(event, start, end));
          return <section key={offset} className="agenda-quarter__period"><header><span>Dias {offset + 1}–{offset + 30}</span><h4>{formatDay(start)} – {formatDay(end)}</h4></header>{items.map(event => <div className="agenda-timeline-item" key={event.id}>{eventButton(event)}<div className="agenda-timeline-track" aria-hidden="true"><span style={{ marginLeft: `${Math.max(0, daysBetween(start, event.start!)) / 30 * 100}%`, width: `${(daysBetween(event.start! < start ? start : event.start!, event.end! > end ? end : event.end!) + 1) / 30 * 100}%` }} /></div></div>)}{!items.length && <p className="agenda-empty">Nenhuma entrega neste período.</p>}</section>;
        })}</div>}
        {!inView.length && <div className="agenda-period-empty"><CalendarDays size={24} /><p>Nenhum item com data neste período.{unscheduled.length > 0 ? " Consulte os itens a agendar." : " Experimente outro período ou filtro."}</p></div>}
        <footer className="agenda-calendar__footer"><Flag size={15} /><p>{anchor ? <>Datas relativas estimadas a partir de <strong>{formatDay(anchor)}</strong>, data de geração do plano. Confirme-as com os responsáveis.</> : "Datas relativas aguardam uma referência válida no plano."} O calendário indica prazos; a conclusão das entregas ainda não é registrada.</p></footer>
      </section>
    </div>
    <dialog className="agenda-dialog" ref={dialog} aria-labelledby={`${id}-detail-title`} onClose={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <button type="button" className="agenda-dialog__close" aria-label="Fechar detalhes" onClick={() => dialog.current?.close()}><X size={20} /></button>
      {selected && <><span className={`agenda-detail-kind agenda-event--${selected.kind}`}>{kinds[selected.kind]}</span><h2 id={`${id}-detail-title`}>{selected.title}</h2><p>{selected.description}</p><dl><div><dt>Responsável</dt><dd>{selected.owner}</dd></div><div><dt>Período</dt><dd>{periodLabel(selected)}</dd></div><div><dt>Prazo no plano</dt><dd>{selected.originalPeriod || "Não informado"}</dd></div><div><dt>Situação do prazo</dt><dd>{deadlineLabel(selected, today)}</dd></div>{selected.relative && <div><dt>Referência</dt><dd>Data estimada a partir da geração do plano. Validar com o responsável.</dd></div>}{selected.linkedKr && <div><dt>Resultados-chave vinculados</dt><dd>{selected.linkedKr}</dd></div>}{related.map(objective => <div key={objective.id}><dt>Objetivo {objective.id}</dt><dd>{objective.title}</dd></div>)}{initiative && <><div><dt>Como executar</dt><dd>{initiative.how}</dd></div><div><dt>Custo</dt><dd>{initiative.cost}</dd></div><div><dt>Dependências</dt><dd>{initiative.dependencies.join("; ") || "Nenhuma informada"}</dd></div></>}</dl>
        {selected.kind === "initiative" && <button type="button" className="primary-button" onClick={() => { dialog.current?.close(); onOpenInitiative(selected.sourceIndex); }}>Ver iniciativa no plano <ArrowUpRight size={17} /></button>}
        {selected.kind === "cadence" && <button type="button" className="primary-button" onClick={() => { dialog.current?.close(); onOpenGovernance(); }}>Ver governança <ArrowUpRight size={17} /></button>}
      </>}
    </dialog>
  </div>;
}
