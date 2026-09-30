import { AnimatedGroupLogo } from "@/components/AnimatedGroupLogo";

export default function Loading() {
  return <div className="app-loading" role="status" aria-live="polite">
    <div className="x5-loading-mark"><AnimatedGroupLogo /></div>
    <span className="sr-only">Carregando o Planejamento do Grupo X5.</span>
  </div>;
}
