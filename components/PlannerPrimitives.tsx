"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

export type ProviderStatus = {
  configured: boolean;
  provider: "gemini" | "demo";
  model: string;
};

export function Brand({ compact = false, theme = "light" }: { compact?: boolean; theme?: "light" | "dark" }) {
  return (
    <div className="brand" role="img" aria-label="Grupo X5 Planejamento">
      <Image className="brand-logo" src={theme === "dark" ? "/brand/grupo-x5-white.svg" : "/brand/grupo-x5.svg"} alt="" width={87} height={50} unoptimized priority />
      {!compact && <span className="brand-copy"><strong>Planejamento</strong></span>}
    </div>
  );
}

export function AiBadge({ status }: { status: ProviderStatus | null }) {
  const live = status?.configured;
  return (
    <span className={`ai-badge ${live ? "is-live" : "is-demo"}`}
      title={live ? `Gemini · ${status.model}` : "Plano demonstrativo. Valide dados e recomendações antes de decidir."}>
      <span className="ai-dot" aria-hidden="true" />
      {live ? "Gemini conectado" : "Demonstração"}
    </span>
  );
}

type Metric = "priorities" | "objectives" | "quality" | "gaps";
const metrics = {
  priorities: { title: "Prioridades", tag: "FOCO", desktop: "7b4f2.svg", mobile: "1e4b5.svg" },
  objectives: { title: "Objetivos", tag: "KRs", desktop: "3ecf5.svg", mobile: "4eb33.svg" },
  quality: { title: "Qualidade do plano", tag: "", desktop: "3a37b.svg", mobile: "3acb0.svg" },
  gaps: { title: "Lacunas", tag: "", desktop: "cd359.svg", mobile: "fd7ce.svg" },
} satisfies Record<Metric, { title: string; tag: string; desktop: string; mobile: string }>;
const asset = (name: string) => `/design/chips/${name}`;

export function ChipCard({ metric, value, detail, meta = "Ciclo estratégico", progress, count }: {
  metric: Metric;
  value: string | number;
  detail: string;
  meta?: string;
  progress?: number;
  count?: number;
}) {
  const config = metrics[metric];
  const safeProgress = progress === undefined ? undefined : Math.max(0, Math.min(100, progress));
  const itemCount = Math.max(0, Math.floor(count ?? 0));
  const tag = safeProgress !== undefined ? `${safeProgress}%` : metric === "gaps" ? `${itemCount}×` : config.tag;
  return (
    <article className={`chip-card chip-${metric}`} data-metric={metric}>
      <span className="chip-backdrop" aria-hidden="true">
        <picture>
          <source media="(max-width: 767px)" srcSet={asset("adb10.svg")} />
          <Image src={asset("a8fbe.svg")} width={303} height={238} alt="" unoptimized />
        </picture>
      </span>
      <Image className="chip-notch-dots" src={asset("8cbaf.svg")} width={17} height={3} alt="" aria-hidden="true" unoptimized />
      <h3 className="chip-title">
        {metric === "quality" ? <><span className="chip-label-desktop">{config.title}</span><span className="chip-label-mobile">Qualidade</span></> : config.title}
      </h3>
      <strong className="chip-value">{typeof value === "number" ? String(value).padStart(2, "0") : value}</strong>
      <div className="chip-band">
        <picture className="chip-band-art">
          <source media="(max-width: 767px)" srcSet={asset(config.mobile)} />
          <Image src={asset(config.desktop)} width={243} height={74} alt="" unoptimized />
        </picture>
        <span className="chip-tag" aria-hidden="true">{tag}</span>
        <p>{detail}</p>
        {safeProgress !== undefined ? (
          <div className="chip-meter" role="progressbar" aria-label="Qualidade do plano" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeProgress}>
            <span style={{ "--meter-value": `${safeProgress}%` } as CSSProperties} />
          </div>
        ) : (
          <span className="chip-count" aria-hidden="true">
            {Array.from({ length: Math.min(itemCount, 5) }, (_, index) => <Image key={index} src={asset("9b7da.svg")} width={5} height={5} alt="" unoptimized />)}
            {itemCount > 5 && <span>+{itemCount - 5}</span>}
          </span>
        )}
      </div>
      <small className="chip-meta">{meta}</small>
    </article>
  );
}
