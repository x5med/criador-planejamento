"use client";

import { ArrowRight, LoaderCircle, ShieldCheck, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AiBadge, type ProviderStatus } from "@/components/PlannerPrimitives";

type StartData = { organization: string; sector: string; horizon: string; challenge: string };
const horizons = ["Próximos 12 meses", "Próximos 24 meses", "Próximos 36 meses", "Ano de 2027"];

export function NewPlanDialog({ status, onStart, onClose, loading }: {
  status: ProviderStatus | null;
  onStart: (data: StartData) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<StartData>({ organization: "", sector: "", horizon: horizons[0], challenge: "" });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!openerRef.current && document.activeElement instanceof HTMLElement) {
      openerRef.current = document.activeElement;
    }
    dialog.showModal();
    dialog.querySelector<HTMLInputElement>("input")?.focus();
    return () => {
      dialog.close();
      requestAnimationFrame(() => {
        if (!dialog.open && openerRef.current?.isConnected) {
          openerRef.current.focus({ preventScroll: true });
        }
      });
    };
  }, []);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!loading) void onStart(form);
  };
  return (
    <dialog ref={dialogRef} className="new-plan-dialog" aria-labelledby={titleId}
      onCancel={event => { event.preventDefault(); if (!loading) onClose(); }}
      onClick={event => { if (event.target === event.currentTarget && !loading) onClose(); }}>
      <form className="start-card" onSubmit={submit}>
        <div className="new-plan-topline"><AiBadge status={status} /><button className="icon-button" type="button" aria-label="Fechar novo plano" disabled={loading} onClick={onClose}><X size={18} /></button></div>
        <div className="start-card-head"><span className="eyebrow">Novo planejamento</span><h2 id={titleId}>Conte um pouco sobre a organização.</h2><p>Este contexto orienta a primeira pergunta.</p></div>
        <label>Nome da organização<input required autoComplete="organization" placeholder="Ex.: Clínica Horizonte" value={form.organization} onChange={event => setForm(current => ({ ...current, organization: event.target.value }))} /></label>
        <label>Setor de atuação<input required placeholder="Ex.: Saúde e bem-estar" value={form.sector} onChange={event => setForm(current => ({ ...current, sector: event.target.value }))} /></label>
        <fieldset className="horizon-field"><legend>Horizonte do plano</legend><div className="horizon-segments">{horizons.slice(0, 3).map((horizon, index) => <label key={horizon} className={form.horizon === horizon ? "is-selected" : ""}><input type="radio" name="horizon" value={horizon} checked={form.horizon === horizon} onChange={() => setForm(current => ({ ...current, horizon }))} /><span>{(index + 1) * 12} meses</span></label>)}</div><label className={`calendar-horizon ${form.horizon === horizons[3] ? "is-selected" : ""}`}><input type="radio" name="horizon" value={horizons[3]} checked={form.horizon === horizons[3]} onChange={() => setForm(current => ({ ...current, horizon: horizons[3] }))} /><span>Ano de 2027</span></label></fieldset>
        <label>Qual é o desafio central?<textarea required rows={3} placeholder="O que precisa mudar ao final deste planejamento?" value={form.challenge} onChange={event => setForm(current => ({ ...current, challenge: event.target.value }))} /></label>
        <div className="new-plan-actions"><button type="button" className="ghost-button" disabled={loading} onClick={onClose}>Cancelar</button><button type="submit" className="primary-button" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={18} /> Preparando entrevista</> : <>Começar planejamento <ArrowRight size={18} /></>}</button></div>
        <p className="new-plan-privacy"><ShieldCheck size={16} /><span>Respostas salvas neste navegador. Com a IA ativa, o contexto será enviado para gerar respostas.</span></p>
      </form>
    </dialog>
  );
}
