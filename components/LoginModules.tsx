"use client";

import { CalendarDays, ChartNoAxesCombined, ChevronDown, GitBranch, ListTodo, MessageSquareText, ScanSearch, ShieldCheck, Target, UsersRound, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

const groups = [
  { side: "left", items: [
    { id: "interview", label: "Entrevista guiada", Icon: MessageSquareText, description: "Construa o contexto do planejamento com perguntas e ajuda para organizar suas respostas.", features: ["Contexto e ambição", "Evidências e restrições"] },
    { id: "diagnosis", label: "Diagnóstico", Icon: ScanSearch, description: "Diferencie fatos, hipóteses e lacunas antes de escolher o próximo caminho.", features: ["Leitura SWOT", "Questões estratégicas"] },
    { id: "choices", label: "Escolhas estratégicas", Icon: GitBranch, description: "Compare avenidas de crescimento e concentre energia nas prioridades do ciclo.", features: ["Valor e complexidade", "Prioridades e renúncias"] },
    { id: "objectives", label: "Objetivos e KRs", Icon: Target, description: "Conecte a estratégia a resultados-chave que a equipe pode acompanhar.", features: ["Métricas e metas", "Fontes, prazos e donos"] },
  ] },
  { side: "right", items: [
    { id: "execution", label: "Execução", Icon: ListTodo, description: "Transforme escolhas em iniciativas com responsáveis, prazos e custos claros.", features: ["Iniciativas 5W2H", "Dependências e entregas"] },
    { id: "first90", label: "Primeiros 90 dias", Icon: CalendarDays, description: "Organize as primeiras entregas para colocar a estratégia em movimento.", features: ["Marcos do ciclo", "Responsáveis pelas entregas"] },
    { id: "finance", label: "Cenários financeiros", Icon: ChartNoAxesCombined, description: "Compare cenários e mantenha as premissas de investimento explícitas.", features: ["Adverso, base e favorável", "Premissas e alertas"] },
    { id: "governance", label: "Governança", Icon: UsersRound, description: "Defina papéis, ritmo de gestão e sinais para manter o plano em acompanhamento.", features: ["Papéis e decisões", "Cadência e mapa de riscos"] },
    { id: "validation", label: "Qualidade e validações", Icon: ShieldCheck, description: "Revise a consistência do plano e as evidências que ainda precisam ser confirmadas.", features: ["Pontos fortes", "Lacunas e melhorias"] },
  ] },
];

/** Module exploration is independent of the future authentication form. */
export function LoginModules() {
  const prefix = useId();
  const root = useRef<HTMLElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinned = useRef<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  function cancelClose() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  function open(id: string) {
    cancelClose();
    if (pinned.current !== id) pinned.current = null;
    setActive(id);
  }

  function close(restoreFocus = false) {
    cancelClose();
    // The focus handler may open the panel; dismissal is applied after focus.
    if (restoreFocus && active) triggers.current[active]?.focus();
    pinned.current = null;
    setActive(null);
  }

  useEffect(() => {
    function dismiss(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) {
        if (timer.current) clearTimeout(timer.current);
        pinned.current = null;
        setActive(null);
      }
    }
    function reset() {
      if (timer.current) clearTimeout(timer.current);
      pinned.current = null;
      setActive(null);
    }
    function dismissHover(event: KeyboardEvent) {
      if (event.key === "Escape") reset();
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", dismissHover);
    window.addEventListener("resize", reset);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", dismissHover);
      window.removeEventListener("resize", reset);
    };
  }, []);

  return (
    <section ref={root} className="x5-access__connections" aria-label="Conheça os módulos do Planejamento" data-expanded={expanded} data-active={active !== null}
      onKeyDown={event => {
        if (event.key === "Escape" && active) { event.preventDefault(); event.stopPropagation(); close(true); }
      }}>
      <button className="x5-access__explore" type="button" aria-expanded={expanded} aria-controls={`${prefix}-modules`}
        onClick={() => { close(); setExpanded(value => !value); }}>
        Conheça os módulos <ChevronDown size={16} aria-hidden="true" />
      </button>
      <div id={`${prefix}-modules`} className="x5-access__modules">
        {groups.map(({ side, items }) => (
          <div className={`x5-access__branches x5-access__branches--${side}`} key={side}>
            {items.map(({ id, label, Icon, description, features }) => {
              const isOpen = active === id;
              const triggerId = `${prefix}-${id}-trigger`;
              const panelId = `${prefix}-${id}-panel`;
              return (
                <div className="x5-access__branch" key={id} data-open={isOpen}
                  onPointerEnter={event => { if (event.pointerType === "mouse") open(id); }}
                  onPointerLeave={() => {
                    cancelClose();
                    if (pinned.current !== id && !triggers.current[id]?.parentElement?.contains(document.activeElement)) {
                      timer.current = setTimeout(() => setActive(value => value === id ? null : value), 180);
                    }
                  }}
                  onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
                  <button ref={element => { triggers.current[id] = element; }} className="x5-access__module" id={triggerId} type="button"
                    aria-expanded={isOpen} aria-controls={isOpen ? panelId : undefined}
                    onFocus={() => open(id)} onClick={() => {
                      if (pinned.current === id) close();
                      else { open(id); pinned.current = id; }
                    }}>
                    <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
                    <span>{label}</span><ChevronDown className="x5-access__module-chevron" size={13} aria-hidden="true" />
                  </button>
                  {isOpen && <div className="x5-access__popover" id={panelId} role="region" aria-labelledby={triggerId}>
                    <header><strong>{label}</strong><button type="button" aria-label={`Fechar detalhes de ${label}`} onClick={() => close(true)}><X size={16} aria-hidden="true" /></button></header>
                    <p>{description}</p>
                    <ul>{features.map(feature => <li key={feature}>{feature}</li>)}</ul>
                    <small>Explore estes recursos na demonstração.</small>
                  </div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
