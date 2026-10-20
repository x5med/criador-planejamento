import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import "../login/login.css";

export const metadata: Metadata = {
  title: "Criar conta | X5 Planejamento",
  description: "Crie sua conta no X5 Planejamento.",
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
