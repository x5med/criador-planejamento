"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatedGroupLogo } from "./AnimatedGroupLogo";

type Phase = "pending" | "playing" | "leaving" | "done";

/** Initial document loading only; route and request loaders follow their own pending state. */
export function AppPreloader({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("pending");
  const blocking = phase === "playing" || phase === "leaving";

  useEffect(() => {
    let active = true;
    let pageReady = document.readyState === "complete";
    let fontsReady = document.fonts.status === "loaded";
    const finishIfReady = () => {
      if (active && pageReady && fontsReady) {
        setPhase(current => current === "pending" ? "done" : current === "playing" ? "leaving" : current);
      }
    };
    const onLoad = () => { pageReady = true; finishIfReady(); };
    window.addEventListener("load", onLoad, { once: true });
    // Cached documents should not wait for a branding sequence to finish.
    const frame = requestAnimationFrame(() => {
      if (pageReady && fontsReady) finishIfReady();
      else setPhase(current => current === "pending" ? "playing" : current);
    });
    const onFontsReady = () => { fontsReady = true; finishIfReady(); };
    void document.fonts.ready.then(onFontsReady, onFontsReady);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  useEffect(() => {
    if (!blocking) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [blocking]);

  useEffect(() => {
    if (phase !== "leaving") return;
    const exit = setTimeout(() => setPhase("done"), 220);
    return () => clearTimeout(exit);
  }, [phase]);

  return <>
    <div className="preloader-content" inert={blocking} aria-hidden={blocking || undefined} aria-busy={blocking}>
      {children}
    </div>
    {phase !== "done" && <div className="x5-preloader" data-phase={phase}>
      <div className="x5-preloader__mark" role="status" aria-live="polite">
        <AnimatedGroupLogo />
        <span className="sr-only">Carregando o Planejamento do Grupo X5.</span>
      </div>
    </div>}
    <noscript><style>{".x5-preloader{display:none!important}"}</style></noscript>
  </>;
}
