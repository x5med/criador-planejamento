"use client";

import { AnimatedGroupLogo } from "./AnimatedGroupLogo";
import { useCallback, useEffect, useState } from "react";
import { Landing, Interview } from "@/components/PlannerJourney";
import { PlanDashboard } from "@/components/PlannerResults";
import type { ProviderStatus } from "@/components/PlannerPrimitives";
import type { AnswerEntry, CoachResponse, InterviewResponse, PlannerSession, StrategicPlan } from "@/lib/types";

const STORAGE_KEY = "x5-strategic-planner-session-v1";

export function StrategicPlanner() {
  const [session, setSession] = useState<PlannerSession | null>(null);
  const [status, setStatus] = useState<ProviderStatus | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setSession(JSON.parse(saved) as PlannerSession);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
      setHydrated(true);
    }, 0);
    fetch("/api/status")
      .then((response) => response.json())
      .then((data: ProviderStatus) => setStatus(data))
      .catch(() =>
        setStatus({ configured: false, provider: "demo", model: "demonstração local" }),
      );
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  const persist = useCallback((next: PlannerSession) => {
    setSession(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const fetchNext = useCallback(
    async (base: PlannerSession) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "next",
            context: {
              organization: base.organization,
              sector: base.sector,
              horizon: base.horizon,
              challenge: base.challenge,
            },
            phase: base.phase,
            answers: base.answers,
            askedQuestionIds: base.askedQuestionIds,
            currentQuestion: base.question
              ? {
                  id: base.question.id,
                  prompt: base.question.prompt,
                  helper: base.question.helper,
                }
              : null,
          }),
        });
        const data = (await response.json()) as InterviewResponse & { error?: string };
        if (!response.ok) throw new Error(data.error || "Falha ao gerar pergunta.");

        persist({
          ...base,
          phase: data.question.phase,
          question: data.question,
          askedQuestionIds: Array.from(
            new Set([...base.askedQuestionIds, data.question.id]),
          ),
          readiness: data.readiness,
          missingTopics: data.missingTopics,
          provider: data.provider,
          updatedAt: new Date().toISOString(),
        });
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Não foi possível continuar.");
        persist(base);
      } finally {
        setLoading(false);
      }
    },
    [persist],
  );

  const start = async (data: {
    organization: string;
    sector: string;
    horizon: string;
    challenge: string;
  }) => {
    const now = new Date().toISOString();
    const initial: PlannerSession = {
      id: crypto.randomUUID(),
      ...data,
      phase: "context",
      question: null,
      answers: [],
      askedQuestionIds: [],
      readiness: 0,
      missingTopics: [
        "escopo e restrições",
        "baselines e evidências",
        "escolhas e renúncias",
      ],
      provider: null,
      createdAt: now,
      updatedAt: now,
      plan: null,
    };
    persist(initial);
    await fetchNext(initial);
  };

  const answer = async (value: string) => {
    if (!session?.question) return;
    const entry: AnswerEntry = {
      questionId: session.question.id,
      phase: session.question.phase,
      question: session.question.prompt,
      answer: value,
      answeredAt: new Date().toISOString(),
    };
    const next = {
      ...session,
      answers: [...session.answers, entry],
      updatedAt: new Date().toISOString(),
    };
    persist(next);
    await fetchNext(next);
  };

  const coach = async () => {
    if (!session) return null;
    setError(null);
    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "coach",
          context: {
            organization: session.organization,
            sector: session.sector,
            horizon: session.horizon,
            challenge: session.challenge,
          },
          phase: session.phase,
          answers: session.answers,
          askedQuestionIds: session.askedQuestionIds,
          currentQuestion: session.question
            ? {
                id: session.question.id,
                prompt: session.question.prompt,
                helper: session.question.helper,
              }
            : null,
        }),
      });
      const data = (await response.json()) as CoachResponse & { error?: string };
      if (!response.ok) throw new Error(data.error || "Falha ao gerar orientação.");
      return data;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível ajudar agora.");
      return null;
    }
  };

  const generatePlan = async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            organization: session.organization,
            sector: session.sector,
            horizon: session.horizon,
            challenge: session.challenge,
          },
          answers: session.answers,
        }),
      });
      const data = (await response.json()) as {
        plan?: StrategicPlan;
        provider?: "gemini" | "demo";
        error?: string;
      };
      if (!response.ok || !data.plan) {
        throw new Error(data.error || "Falha ao gerar o plano.");
      }
      persist({
        ...session,
        plan: data.plan,
        provider: data.provider ?? session.provider,
        updatedAt: new Date().toISOString(),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível gerar o plano.");
    } finally {
      setLoading(false);
    }
  };

  const newPlan = () => {
    if (session && !window.confirm("Iniciar um novo plano e apagar a sessão atual?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setError(null);
  };

  const backToInterview = () => {
    if (!session) return;
    persist({ ...session, plan: null, updatedAt: new Date().toISOString() });
  };

  if (!hydrated) {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        <div className="x5-loading-mark"><AnimatedGroupLogo /></div>
        <span className="sr-only">Carregando seu planejamento.</span>
      </div>
    );
  }
  if (!session) {
    return <Landing status={status} onStart={start} loading={loading} />;
  }
  if (session.plan) {
    return (
      <PlanDashboard
        session={session}
        status={status}
        onBack={backToInterview}
        onNew={newPlan}
      />
    );
  }
  return (
    <Interview
      key={session.question?.id ?? "loading"}
      session={session}
      status={status}
      loading={loading}
      error={error}
      onAnswer={answer}
      onCoach={coach}
      onGenerate={generatePlan}
      onNew={newPlan}
    />
  );
}
