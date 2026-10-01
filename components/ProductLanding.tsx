"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight, Check, X, ZoomIn } from "lucide-react";
import { Brand } from "@/components/PlannerPrimitives";

const screens = [
  { image: "diagnosis", title: "Entenda o ponto de partida", label: "Diagnóstico", description: "Reúna evidências, reconheça forças e gargalos e enxergue o que precisa mudar.", alt: "Tela de diagnóstico com evidências, hipóteses e lacunas do planejamento" },
  { image: "choices", title: "Escolha onde concentrar esforços", label: "Escolhas estratégicas", description: "Compare caminhos, defina prioridades e deixe claras as escolhas e as renúncias.", alt: "Tela de escolhas estratégicas com prioridades e avenidas de crescimento" },
  { image: "agenda", title: "Dê um próximo passo ao plano", label: "Execução e agenda", description: "Conecte iniciativas a responsáveis e prazos. Visualize as entregas dos primeiros 90 dias.", alt: "Agenda de execução com calendário, iniciativas e marcos do plano" },
];
type Preview = { image: string; title: string; alt: string; width: number; height: number };

export function ProductLanding({ onCreate }: { onCreate?: () => void }) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const openPreview = (screen: Preview) => { setPreview(screen); dialog.current?.showModal(); };
  const startAction = (className = "primary-button") => onCreate
    ? <button type="button" className={className} onClick={onCreate}>Criar meu planejamento <ArrowRight size={18} aria-hidden="true" /></button>
    : <Link className={className} href="/inicio">Explorar demonstração <ArrowRight size={18} aria-hidden="true" /></Link>;

  return <main className="product-home">
    <header className="product-nav">
      <Link href="/" className="product-brand" aria-label="Grupo X5 Planejamento — início"><Brand /></Link>
      <nav className="product-sections" aria-label="Sobre o sistema"><a href="#como-funciona">Como funciona</a><a href="#por-dentro">Por dentro do sistema</a></nav>
      <nav className="product-account" aria-label="Acesso à conta"><Link href="/login">Login</Link><Link href="/cadastro" className="primary-button">Criar conta</Link></nav>
    </header>

    <section className="product-hero" aria-labelledby="product-title">
      <div className="product-hero-copy">
        <p className="product-intro">Planejamento estratégico com IA</p>
        <h1 id="product-title">Crie seu planejamento estratégico.</h1>
        <p className="product-lead">Crie o planejamento estratégico da sua organização: entenda o cenário, escolha prioridades e transforme objetivos em ações com responsáveis e prazos.</p>
        <div className="product-actions">{startAction()}<a href="#por-dentro" className="product-text-link">Conhecer o sistema</a></div>
        <p className="product-demo-note">Explore a demonstração antes de começar.</p>
        <ul className="product-outcomes"><li><Check size={15} />Diagnóstico e prioridades</li><li><Check size={15} />Objetivos e KRs</li><li><Check size={15} />Plano de ação</li></ul>
      </div>
      <figure className="product-hero-visual">
        <div className="product-screen-top"><span><i />Seu planejamento, em uma visão</span><span>Grupo X5</span></div>
        <button type="button" className="product-screen-button" aria-label="Ampliar tela de visão geral do planejamento" onClick={() => openPreview({ image: "overview", title: "Visão geral do planejamento", alt: "Painel do planejamento da Clínica Horizonte, com prioridades, objetivos e qualidade do plano", width: 1440, height: 1000 })}>
          <Image src="/product/overview.webp" alt="Visão geral de um planejamento estratégico no sistema X5" width={1440} height={1000} priority sizes="(max-width: 900px) 92vw, 52vw" />
          <span className="product-zoom"><ZoomIn size={16} />Ampliar</span>
        </button>
        <figcaption>Da entrevista ao plano de ação. Tudo conectado.</figcaption>
      </figure>
    </section>

    <section className="product-process" id="como-funciona" aria-labelledby="process-title">
      <div><h2 id="process-title">Da primeira pergunta<br />à próxima decisão.</h2><p>Um processo guiado para construir o plano com o contexto da sua organização.</p></div>
      <ol>
        <li><span>1</span><div><h3>Conte sua realidade</h3><p>Responda à entrevista sobre desafios, evidências, capacidade e ambição.</p></div></li>
        <li><span>2</span><div><h3>Construa a estratégia</h3><p>Organize o diagnóstico, as escolhas e os resultados que você quer alcançar.</p></div></li>
        <li><span>3</span><div><h3>Prepare a execução</h3><p>Revise iniciativas, responsáveis e prazos. Exporte o plano para compartilhar.</p></div></li>
      </ol>
    </section>

    <section className="product-gallery" id="por-dentro" aria-labelledby="gallery-title">
      <header><div><p className="product-intro">Por dentro do X5 Planejamento</p><h2 id="gallery-title">Veja sua estratégia ganhar forma.</h2></div><p>Telas reais do sistema, com dados ilustrativos.<br />Clique nas imagens para explorar os detalhes.</p></header>
      <div className="product-cards">{screens.map(screen => <article className={`product-feature product-feature--${screen.image}`} key={screen.image}>
        <div className="product-feature-copy"><span>{screen.label}</span><h3>{screen.title}</h3><p>{screen.description}</p></div>
        <button type="button" className="product-screen-button" aria-label={`Ampliar tela de ${screen.label.toLowerCase()}`} onClick={() => openPreview({ ...screen, width: 1120, height: 810 })}>
          <Image src={`/product/${screen.image}.webp`} alt={screen.alt} width={1120} height={810} sizes="(max-width: 650px) 90vw, (max-width: 1000px) 45vw, 30vw" />
          <span className="product-zoom"><ZoomIn size={16} /><span className="sr-only">Ampliar</span></span>
        </button>
      </article>)}</div>
    </section>

    <section className="product-closing" aria-labelledby="closing-title"><div><h2 id="closing-title">Qual é o próximo passo<br />da sua organização?</h2><p>Comece com uma boa pergunta. Construa as decisões que vêm depois.</p></div><div>{startAction()}<Link href="/cadastro" className="product-text-link">Quero criar uma conta</Link></div></section>
    <footer className="product-footer"><Brand /><p>Estratégia com clareza. Execução com direção.</p><Link href="/login">Acessar minha conta</Link></footer>

    <dialog ref={dialog} className="product-preview" aria-labelledby="product-preview-title" onClose={() => setPreview(null)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <header><h2 id="product-preview-title">{preview?.title ?? "Tela do sistema"}</h2><button type="button" aria-label="Fechar imagem" onClick={() => dialog.current?.close()}><X size={22} /></button></header>
      {preview && <Image src={`/product/${preview.image}.webp`} alt={preview.alt} width={preview.width} height={preview.height} sizes="90vw" />}
      <p>Captura real do sistema com dados ilustrativos.</p>
    </dialog>
  </main>;
}
