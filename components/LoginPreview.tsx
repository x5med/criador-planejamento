import Link from "next/link";
import { ArrowRight, Eye, LockKeyhole } from "lucide-react";
import { Brand } from "@/components/PlannerPrimitives";
import { LoginModules } from "@/components/LoginModules";

/**
 * Presentation-only access screen. No credentials, submission, storage or
 * authentication side effects. An authenticated form can replace this section.
 */
export function LoginPreview({ mode = "login" }: { mode?: "login" | "signup" }) {
  const signup = mode === "signup";
  return (
    <main className="x5-access">
      <div className="x5-access__center">
        <header className="x5-access__brand"><Brand /></header>
        <section className="x5-access__card" aria-labelledby="login-heading">
          <header>
            <span className="x5-access__eyebrow">Estratégia com clareza.</span>
            <h1 id="login-heading">{signup ? "Crie sua conta" : "Entre na sua conta"}</h1>
            <p>{signup ? "Seu próximo planejamento começa aqui." : "Seu planejamento estratégico em um só lugar."}</p>
          </header>
          <fieldset className="x5-access__fields" disabled aria-describedby="login-preview-note">
            <legend className="sr-only">{signup ? "Cadastro disponível em breve" : "Acesso à conta disponível em breve"}</legend>
            {signup && <div className="x5-access__field"><label htmlFor="signup-name">Nome completo</label><div className="x5-access__input"><input id="signup-name" type="text" autoComplete="off" placeholder="Seu nome" disabled /></div></div>}
            <div className="x5-access__field">
              <label htmlFor="login-email">E-mail</label>
              <div className="x5-access__input">
                <input id="login-email" type="email" autoComplete="off" placeholder="Seu e-mail" disabled />
              </div>
            </div>
            <div className="x5-access__field">
              <label htmlFor="login-password">Senha</label>
              <div className="x5-access__input">
                <input id="login-password" type="password" autoComplete="off" placeholder="Sua senha" disabled />
                <span className="x5-access__password-icon" aria-hidden="true"><Eye size={18} /></span>
              </div>
            </div>
            <button type="button" className="x5-access__submit" disabled>
              <span>{signup ? "Criar conta" : "Entrar"}</span><ArrowRight size={18} aria-hidden="true" />
            </button>
          </fieldset>
          <footer className="x5-access__support">
            <p id="login-preview-note">{signup ? "Cadastro em breve. Explore a demonstração enquanto isso." : "Login em breve. Explore a demonstração enquanto isso."}</p>
            <Link className="x5-access__demo" href="/inicio">
              Explorar demonstração <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="x5-access__account-link" href={signup ? "/login" : "/cadastro"}>{signup ? "Já tem uma conta? Fazer login" : "Ainda não tem conta? Criar conta"}</Link>
          </footer>
        </section>
        <p className="x5-access__security"><LockKeyhole size={12} aria-hidden="true" />Planejamento estratégico do Grupo X5.</p>
        <Link className="x5-access__account-link" href="/">Voltar ao início</Link>
      </div>
      <LoginModules />
    </main>
  );
}
