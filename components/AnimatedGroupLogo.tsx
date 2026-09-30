"use client";

import { useEffect } from "react";
import { stagger, useAnimate } from "motion/react";
import { GROUP_X5_PATHS, GROUP_X5_VIEWBOX } from "./group-x5-paths";

/** Recreates the reference's contour → solid mark sequence with the official Grupo X5 geometry. */
export function AnimatedGroupLogo() {
  const [scope, animate] = useAnimate<SVGSVGElement>();

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop = () => {};
    const start = () => {
      stop();
      if (preference.matches) {
        scope.current.style.opacity = "1";
        scope.current.querySelectorAll<SVGPathElement>(".x5-logo-fill").forEach(path => { path.style.opacity = "1"; });
        scope.current.querySelectorAll<SVGPathElement>(".x5-logo-outline").forEach(path => { path.style.opacity = "0"; });
        return;
      }
      const sequence = animate([
        [scope.current, { opacity: [0, 1] }, { duration: 0.12, at: 0 }],
        [".x5-logo-outline", { strokeDashoffset: [1, 0] }, { duration: 0.9, delay: stagger(0.045), ease: "easeInOut", at: 0 }],
        [".x5-logo-fill[data-part=symbol]", { opacity: [0, 1] }, { duration: 0.7, delay: stagger(0.08), ease: "easeInOut", at: 0.6 }],
        [".x5-logo-fill[data-part=wordmark]", { opacity: [0, 1] }, { duration: 0.45, ease: "easeOut", at: 1.05 }],
        [".x5-logo-fill[data-part=accents]", { opacity: [0, 1] }, { duration: 0.45, ease: "easeOut", at: 1.1 }],
        [".x5-logo-outline", { opacity: [1, 1, 0] }, { duration: 1.6, times: [0, 0.84, 1], at: 0 }],
        // Fade into the next contour cycle while the owning view remains pending.
        [scope.current, { opacity: [1, 0] }, { duration: 0.2, at: 2.2 }],
      ], { repeat: Infinity });
      stop = () => sequence.stop();
    };
    start();
    preference.addEventListener("change", start);
    return () => { stop(); preference.removeEventListener("change", start); };
  }, [animate, scope]);

  return <svg ref={scope} className="x5-preloader__logo" viewBox={GROUP_X5_VIEWBOX}
    width={890} height={507} aria-hidden="true" focusable="false" data-brand="grupo-x5">
    {GROUP_X5_PATHS.map(part => <path key={`fill-${part.id}`} className="x5-logo-fill"
      data-part={part.kind} d={part.d} fill="currentColor" fillRule="evenodd" opacity={0} />)}
    {GROUP_X5_PATHS.map(part => <path key={`outline-${part.id}`} className="x5-logo-outline"
      d={part.d} fill="none" stroke="currentColor" strokeWidth={1.25}
      vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round"
      pathLength={1} strokeDasharray={1} strokeDashoffset={1} />)}
  </svg>;
}
