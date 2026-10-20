"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";

import {
  login,
  signInWithGoogle,
  signup,
} from "@/app/auth/actions";
import { LoginModules } from "@/components/LoginModules";
import { Brand } from "@/components/PlannerPrimitives";

function SubmitButton({ signupMode, pending }: { signupMode: boolean; pending: boolean }) {
  return (
    <button type="submit" className="x5-access__submit" disabled={pending}>
      <span>{signupMode ? "Criar conta" : "Entrar"}</span>
      <ArrowRight size={18} aria-hidden="true" />
    </button>
  );
}

export function AuthForm({
  mode = "login",
  initialError,
}: {
  mode?: "login" | "signup";
  initialError?: string;
}) {
  const signupMode = mode === "signup";
  const [state, formAction, pending] = useActionState(
    signupMode ? signup : login,
    initialError ? { error: initialError } : {},
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="x5-access">
      <div className="x5-access__center">
        <header className="x5-access__brand"><Brand /></header>
        <section className="x5-access__card" aria-labelledby="login-heading">
          <header>
            <span className="x5-access__eyebrow">Acesso seguro</span>
            <h1 id="login-heading">{signupMode ? "Crie sua conta" : "Entre na sua conta"}</h1>
            <p>
              {signupMode
                ? "Comece seu planejamento e mantenha o progresso separado por conta."
                : "Continue seu planejamento estratégico com segurança."}
            </p>
          </header>

          <form action={formAction} className="x5-access__fields" aria-busy={pending}>
            {signupMode && (
              <div className="x5-access__field">
                <label htmlFor="signup-name">Nome completo</label>
                <div className="x5-access__input">
                  <input id="signup-name" name="name" type="text" autoComplete="name" placeholder="Seu nome" required minLength={2} disabled={pending} />
                </div>
              </div>
            )}
            <div className="x5-access__field">
              <label htmlFor="auth-email">E-mail</label>
              <div className="x5-access__input">
                <input id="auth-email" name="email" type="email" autoComplete="email" placeholder="voce@empresa.com" required disabled={pending} />
              </div>
            </div>
            <div className="x5-access__field">
              <label htmlFor="auth-password">Senha</label>
              <div className="x5-access__input">
                <input id="auth-password" name="password" type={showPassword ? "text" : "password"} autoComplete={signupMode ? "new-password" : "current-password"} placeholder={signupMode ? "Mínimo de 8 caracteres" : "Sua senha"} required minLength={signupMode ? 8 : 1} disabled={pending} />
                <button className="x5-access__password-icon" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} disabled={pending}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {state.error && <p className="x5-access__message x5-access__message--error" role="alert">{state.error}</p>}
            {state.message && <p className="x5-access__message x5-access__message--success" role="status">{state.message}</p>}

            <div className="x5-access__submit-wrap" data-pending={pending}>
              <SubmitButton signupMode={signupMode} pending={pending} />
              {pending && <span className="x5-access__pending" role="status">Processando…</span>}
            </div>
          </form>

          <div className="x5-access__divider"><span>ou</span></div>
          <form action={signInWithGoogle}>
            <button type="submit" className="x5-access__google">
              <span className="x5-access__google-mark" aria-hidden="true">G</span>
              Continuar com Google
            </button>
          </form>

          <footer className="x5-access__support">
            <Link className="x5-access__account-link" href={signupMode ? "/login" : "/cadastro"}>
              {signupMode ? "Já tem uma conta? Fazer login" : "Ainda não tem conta? Criar conta"}
            </Link>
          </footer>
        </section>
        <p className="x5-access__security"><LockKeyhole size={12} aria-hidden="true" />Sessão protegida pelo Supabase da X5 MED.</p>
        <Link className="x5-access__account-link" href="/">Voltar ao início</Link>
      </div>
      <LoginModules />
    </main>
  );
}
