import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import "./login.css";

export const metadata: Metadata = {
  title: "Acesso | X5 Planejamento",
  description: "Acesse sua conta no X5 Planejamento.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;
  const initialError = erro
    ? "Não foi possível concluir o acesso. Tente novamente."
    : undefined;

  return <AuthForm initialError={initialError} />;
}
